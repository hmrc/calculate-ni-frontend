/*
 * Copyright 2021 HM Revenue & Customs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package eoi

import spire.math.Interval
import cats.data.Writer
import cats.syntax.applicative._
import cats.syntax.traverse._
import cats.instances.list._
import cats.syntax.apply._
import spire.implicits._

case class ClassOneRowInput(
  rowId: String,
  money: BigDecimal,
  category: Char,
  period: Period.Period,
  periodQty: BigDecimal = 1
)

case class ClassOneResult(
  config: Map[String, RateDefinition],
  rowsInput: List[ClassOneRowInput]
) {

  case class ClassOneRowOutput(
    rowId: String,
    money: BigDecimal,
    category: Char,
    period: Period.Period,
    periodQty: BigDecimal
  ) {

    case class ClassOneRowOutputBand(
      bandId: String,
      definition: RateDefinition
    ) {

      def moneyInterval: Explained[Interval[BigDecimal]] = {
        val id = s"$rowId.$bandId.band"
        import Period._
        val baseInterval = period match {
          case Year => definition.year.pure[Explained]
          case Month => definition.month.fold{
            (definition.year / 12).gives(s"$id: year / 12 = ${definition.year} / 12")
          }(_.pure[Explained])
          case FourWeek => definition.fourWeek.fold{
            (definition.year / 13).gives(s"$id: year / 13 = ${definition.year} / 13")
          }(_.pure[Explained])
          case Week => definition.fourWeek.fold{
            (definition.year / 52).gives(s"$id: year / 52 = ${definition.year} / 52")
          }(_.pure[Explained])
        }

        for {
          a <- baseInterval
          b <- if (periodQty == 1) a.pure[Explained] else {
            (a * periodQty) gives s"$id: $a * $periodQty"
          }
          rounded = b.mapBounds(_.roundUpWhole)
          c <- if (rounded == b) { b.pure[Explained] } else { rounded gives s"$id: ⌈$b⌉" }
        } yield c
      }

      def amountInBand: Explained[BigDecimal] = moneyInterval.flatMap(
        m => money.inBand(m) gives s"$rowId.$bandId.amountInBand: |[0, $money] ∩ $m|")
      def employerRate: BigDecimal = definition.employer.getOrElse(category, Zero)
      def employeeRate: BigDecimal = definition.employee.getOrElse(category, Zero)
      def employerContributions: Explained[BigDecimal] = if (employerRate != 0) {
          amountInBand.flatMap{
            case Zero => Zero.pure[Explained]
            case amt => (amt * employerRate).roundHalfDown gives
              s"$rowId.$bandId.employer: ⌊$amt * $employerRate⌋ = ⌊${amt * employerRate}⌋"
          }
      } else Zero.pure[Explained]

      def employeeContributions: Explained[BigDecimal] = if (employeeRate != 0) {
        amountInBand.flatMap{
          case Zero => Zero.pure[Explained]
          case amt => (amt * employeeRate).roundHalfDown gives
            s"$rowId.$bandId.employee: ⌊$amt * $employeeRate⌋ = ⌊${amt * employeeRate}⌋"
        }
      } else Zero.pure[Explained]

      def totalContributions: Explained[BigDecimal] = (
        employeeContributions,
        employerContributions
      ).tupled.flatMap {case (ee,er) =>
        (ee + er) gives s"$rowId.$bandId.total: employee + employer = $ee + $er"
      }
    }

    lazy val bands: List[ClassOneRowOutputBand] = config.toList.sortBy(_._2.year.lowerValue.getOrElse(Zero)).map {
      case (bandId, bandDefinition) => ClassOneRowOutputBand(bandId, bandDefinition)
    }

    def employeeContributions: Explained[BigDecimal] = {
      bands.map(b => b.employeeContributions.map(b.bandId -> _): Explained[(String, BigDecimal)])
        .sequence
        .flatMap{ e =>
          val (ids, amts) = e.filter(_._2 != 0).unzip
          amts.sum gives
          s"$rowId.employee: ${ids.mkString(" + ")} = ${amts.mkString(" + ")}"
        }
    }

    def employerContributions: Explained[BigDecimal] = {
      bands.map(b => b.employerContributions.map(b.bandId -> _): Explained[(String, BigDecimal)])
        .sequence
        .flatMap{ e =>
          val (ids, amts) = e.filter(_._2 != 0).unzip
          amts.sum gives
          s"$rowId.employer: ${ids.mkString(" + ")} = ${amts.mkString(" + ")}"
        }
    }

    def totalContributions: Explained[BigDecimal] = (
      employeeContributions,
      employerContributions
    ).tupled.flatMap {case (ee,er) =>
        (ee + er) gives s"$rowId.total: employee + employer = $ee + er"
    }

  }
  
  lazy val rowsOutput: List[ClassOneRowOutput] = rowsInput.map {
    case ClassOneRowInput(id, money, category, period, periodQty) =>
      ClassOneRowOutput(id, money, category, period, periodQty)
  }

    def employeeContributions: Explained[BigDecimal] = {
      rowsOutput.map(b => b.employeeContributions.map(b.rowId -> _): Explained[(String, BigDecimal)])
        .sequence
        .flatMap{ e =>
          val (ids, amts) = e.filter(_._2 != 0).unzip
          amts.sum gives
          s"employee: ${ids.mkString(" + ")} = ${amts.mkString(" + ")}"
        }
    }

    def employerContributions: Explained[BigDecimal] = {
      rowsOutput.map(b => b.employerContributions.map(b.rowId -> _): Explained[(String, BigDecimal)])
        .sequence
        .flatMap{ e =>
          val (ids, amts) = e.filter(_._2 != 0).unzip
          amts.sum gives
          s"employer: ${ids.mkString(" + ")} = ${amts.mkString(" + ")}"
        }
    }


  def totalContributions: Explained[BigDecimal] = (
    employeeContributions,
    employerContributions
  ).tupled.flatMap {case (ee,er) =>
      (ee + er) gives s"total: employee + employer = $ee + $er"
  }

  def grossPay: Explained[BigDecimal] = rowsInput.map{_.money}.sum gives
    s"grossPay: ${rowsInput.map(_.money).mkString(" + ")}"
  
}
