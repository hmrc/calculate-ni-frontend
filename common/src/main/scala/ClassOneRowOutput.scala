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
import cats.syntax.applicative._
import cats.syntax.traverse._
import cats.instances.list._
import cats.syntax.apply._
import spire.implicits._
import spire.math.interval.{Bound, Closed, EmptyBound, Open, Unbound, ValueBound}
import java.time.LocalDate

case class ClassOneRowOutput(
  on: LocalDate,
  config: Map[String, RateDefinition],
  rowId: String,
  money: Money,
  category: Char,
  period: Period.Period,
  periodQty: BigDecimal,
  precededAmount: Money = Money.Zero,
  proRata: Boolean = false
) {

  case class ClassOneRowOutputBand(
    bandId: String,
    definition: RateDefinition
  ) {

    def moneyInterval: Explained[Interval[Money]] = {
      val id = s"$rowId.$bandId.band"

      if (proRata)
        moneyIntervalProRata(id)
      else {
        import Period._

        val baseInterval = period match {
          case Year => definition.year.pure[Explained]
          case Month => definition.month.fold {
            (definition.year.mapBounds(_ / 12)).gives(s"$id: year / 12 = ${definition.year} / 12")
          }(_.pure[Explained])
          case FourWeek => definition.fourWeek.fold {
            (definition.year.mapBounds(_ / 13)).gives(s"$id: year / 13 = ${definition.year} / 13")
          }(_.pure[Explained])
          case Week => definition.week.fold {
            (definition.year.mapBounds(_ / 52)).gives(s"$id: year / 52 = ${definition.year} / 52")
          }(_.pure[Explained])
        }

        for {
          a <- baseInterval
          b <- if (periodQty == 1) a.pure[Explained] else {
            (a.mapBounds(_ * Money(periodQty))) gives s"$id: $a * $periodQty"
          }
          rounded = b.mapBounds(_.roundNi)
          c <- if (rounded == b) {
            b.pure[Explained]
          } else {
            rounded gives s"$id: ⌈$b⌉"
          }
        } yield c
      }
    }

    private def moneyIntervalProRata(id: String): Explained[Interval[Money]] = {
      def sequence(x: Bound[Explained[Money]]): Explained[Bound[Money]] = x match {
        case EmptyBound() => (EmptyBound(): Bound[Money]).pure[Explained]
        case Unbound() => (Unbound(): Bound[Money]).pure[Explained]
        case Open(explained) => explained.map(Open(_))
        case Closed(explained) => explained.map(Closed(_))
      }

      period match {
        case Period.Year =>
          definition.year.pure[Explained]

        case Period.Week =>
          val weekInterval: Explained[Interval[Money]] = definition.week.fold(
            (definition.year.mapBounds(_ / 52)).gives(s"$id: year / 52 = ${definition.year} / 52")
          )(_.pure[Explained])

          weekInterval.flatMap{ w =>
            def proRataBound(yearBound: Bound[Money], weekBound: Bound[Money], boundDescription: String): Explained[Bound[Money]] = {
              val result = yearBound.map { y =>
                val w: Money = weekBound match {
                  case ValueBound(w) => w
                  case _ => sys.error(s"Weekly $boundDescription bound value not found but annual $boundDescription bound value exists")
                }

                if ((y / 52).isWhole) {
                  val result = w * Money(periodQty)
                  val description = s"$id: $boundDescription yearBound / 52 = $y / 52 ∈ ℤ ⇒ $boundDescription bound = $periodQty * $boundDescription weekBound = $result"
                  result.gives(description)
                }
                else {
                  val result = (y * Money(periodQty / 52)).roundUpWhole
                  val description = s"$id: $boundDescription yearBound / 52 = $y / 52 ∉ ℤ ⇒ $boundDescription bound = ⌈ $periodQty * $boundDescription yearBound / 52 ⌉ = $result"
                  result.gives(description)
                }
              }

              sequence(result)
            }

            for {
              lowerBound <- proRataBound(definition.year.lowerBound, w.lowerBound, "lower")
              upperBound <- proRataBound(definition.year.upperBound, w.upperBound, "upper")
            } yield Interval.fromBounds(lowerBound, upperBound)

          }

        case other => sys.error(s"Period '$other' not handled in pro-rata calculations")
      }
    }

    def amountInBand: Explained[Money] = moneyInterval.flatMap(m =>
      if(precededAmount == Money.Zero)
      money.inBand(m) gives s"$rowId.$bandId.amountInBand: |[0, $money] ∩ $m|"
      else {
        val intersection = Interval(precededAmount, money + precededAmount).intersect(m)
          val intersectionSize = for{
            upper <- intersection.upperValue
            lower <- intersection.lowerValue
          } yield upper - lower

          intersectionSize.getOrElse(Money.Zero) gives s"$rowId.$bandId.amountInBand: |[$precededAmount, $money + $precededAmount,  ∞) ∩ $m|"
      }
    )

    def employerRate: Percentage = definition.employerWithGrossPayExceptions(money, period, category)
    def employeeRate: Percentage = definition.employeeWithGrossPayExceptions(money, period, category)
    def employerContributions: Explained[Money] = if (employerRate != Percentage.Zero) {
      amountInBand.flatMap{
        case Money.Zero => Money.Zero.pure[Explained]
        case amt if period == Period.FourWeek && on.getYear <= 1999 =>
          Money((amt.value / 4 * employerRate.value).roundNi * 4) gives
            s"$rowId.$bandId.employer (pre-2000 rule):" ++
              s" ⌊amt / 4 * employerRate⌋ * 4 = ⌊$amt / 4 * $employerRate⌋ * 4"

        case amt => (amt * employerRate).roundNi gives
          s"$rowId.$bandId.employer: ⌊$amt * $employerRate⌋ = ⌊${amt * employerRate}⌋"
      }
    } else Money.Zero.pure[Explained]

    def employeeContributions: Explained[Money] = if (employeeRate != Percentage.Zero) {
      amountInBand.flatMap{
        case Money.Zero => Money.Zero.pure[Explained]
        case amt if period == Period.FourWeek && on.getYear <= 1999 =>                  
          Money((amt.value / 4 * employeeRate.value).roundNi * 4) gives
            s"$rowId.$bandId.employee (pre-2000 rule):" ++
              s" ⌊amt / 4 * employeeRate⌋ * 4 = ⌊$amt / 4 * $employeeRate⌋ * 4"

        case amt => (amt * employeeRate).roundNi gives
          s"$rowId.$bandId.employee: ⌊$amt * $employeeRate⌋ = ⌊${amt * employeeRate}⌋"
      }
    } else Money.Zero.pure[Explained]

    def totalContributions: Explained[Money] = (
      employeeContributions,
      employerContributions
      ).tupled.flatMap {case (ee,er) =>
      (ee + er) gives s"$rowId.$bandId.total: employee + employer = $ee + $er"
    }
  }


  lazy val bands: List[ClassOneRowOutputBand] = config.toList.sortBy(_._2.year.lowerValue.getOrElse(Money.Zero)).collect {
    case (bandId, bandDefinition) if bandDefinition.trigger.interval(period, periodQty).contains(money + precededAmount) =>
      ClassOneRowOutputBand(bandId, bandDefinition)
  }

  lazy val displaySummaryBands = {
    config.toList.filterNot(_._2.hideOnSummary).sortBy(_._2.year.lowerValue.getOrElse(Money.Zero)).map{
      case (bandId, bandDefinition) => ClassOneRowOutputBand(bandId, bandDefinition)
    }
  }

  def employeeContributionsPreRebateTransfer: Explained[Money] = {
    bands.map(b => b.employeeContributions.map(b.bandId -> _): Explained[(String, Money)])
      .sequence
      .flatMap{ e =>
        val (ids, amts) = e.filter(_._2 != Money.Zero).unzip
        amts.sum gives
          s"$rowId.employee: 𝚺(${ids.mkString(", ")}) = 𝚺(${amts.mkString(", ")})"
      }
  }

  def employerContributionsPreRebateTransfer: Explained[Money] = {
    bands.map(b => b.employerContributions.map(b.bandId -> _): Explained[(String, Money)])
      .sequence
      .flatMap{ e =>
        val (ids, amts) = e.filter(_._2 != Money.Zero).unzip
        amts.sum gives
          s"$rowId.employer: 𝚺(${ids.mkString(", ")}) = 𝚺(${amts.mkString(", ")})"
      }
  }

  def employeeContributions: Explained[Money] =
    employeeContributionsPreRebateTransfer flatMap { base =>
      if (base < Money.Zero)
        Money.Zero gives s"$rowId.employee: Transfer of rebate from employee to employer"
      else
        base.pure[Explained]
    }

  def employerContributions: Explained[Money] = (
    employeeContributionsPreRebateTransfer,
    employerContributionsPreRebateTransfer
  ).tupled.flatMap { case (ee, er) =>
    if (ee < Money.Zero)
      (er + ee) gives s"$rowId.employer: Transfer of rebate from employee to employer = $er + $ee"
    else
      er.pure[Explained]
  }

  def totalContributions: Explained[Money] = (
    employeeContributions,
    employerContributions
    ).tupled.flatMap {case (ee,er) =>
    (ee + er) gives s"$rowId.total: employee + employer = $ee + $er"
  }

}
