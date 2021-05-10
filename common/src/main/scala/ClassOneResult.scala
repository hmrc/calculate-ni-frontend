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

import cats.syntax.traverse._
import cats.instances.list._
import cats.syntax.apply._
import spire.implicits._

import java.time.LocalDate

trait ClassOneResultLike {

  def rowsOutput: List[ClassOneRowOutput]

  def grossPay: Explained[Money]

  val netPaid: Money

  val employeePaid: Money

  def employerPaid: Explained[Money] =
    (netPaid - employeePaid) gives s"employerPaid: $netPaid - $employeePaid"


  def employeeContributions: Explained[Money] = {
    rowsOutput.map(b => b.employeeContributions.map(b.rowId -> _): Explained[(String, Money)])
      .sequence
      .flatMap{ e =>
        val (ids, amts) = e.filter(_._2 != Money.Zero).unzip
        amts.sum gives
          s"employee: 𝚺(${ids.mkString(", ")}) = 𝚺(${amts.mkString(", ")})"
      }
  }

  def employerContributions: Explained[Money] = {
    rowsOutput.map(b => b.employerContributions.map(b.rowId -> _): Explained[(String, Money)])
      .sequence
      .flatMap{ e =>
        val (ids, amts) = e.filter(_._2 != Money.Zero).unzip
        amts.sum gives
          s"employer: 𝚺(${ids.mkString(", ")}) = 𝚺(${amts.mkString(", ")})"
      }
  }

  def totalContributions: Explained[Money] = (
    employeeContributions,
    employerContributions
    ).tupled.flatMap {case (ee,er) =>
    (ee + er) gives s"total: employee + employer = $ee + $er"
  }


  object underpayment {

    def employee: Explained[Money] =
      employeeContributions.flatMap(c =>
        (c - employeePaid).max(Money.Zero) gives
          s"underpayment.employee: max(0, employeeContributions - employeePaid) = max(0, $c - $employeePaid)"
      )

    def employer: Explained[Money] = (
      employerContributions,
      employerPaid
      ).tupled.flatMap{ case (c, p) => (c - p).max(Money.Zero) gives
      s"underpayment.employer: max(0, employerContributions - employerPaid) = max(0, $c - $p)"
    }

    def total: Explained[Money] = (employee, employer).tupled.flatMap { case (ee,er) => (ee + er) gives
      s"underpayment.total: employee + employer = $ee + $er"
    }

    override def toString = (employee.value, employer.value).toString
  }

  object overpayment {
    def employee: Explained[Money] =
      employeeContributions.flatMap(c =>
        (employeePaid - c).max(Money.Zero) gives
          s"overpayment.employee: max(0, employeePaid - employeeContributions) = max(0, $employeePaid - $c)"
      )

    def employer: Explained[Money] = (
      employerContributions,
      employerPaid
      ).tupled.flatMap{ case (c, p) => (p - c).max(Money.Zero) gives
      s"overpayment.employer: max(0, $employerPaid - $employerContributions) = max(0, $p - $c)"
    }

    def total: Explained[Money] = (employee, employer).tupled.flatMap { case (ee,er) => (ee + er) gives
      s"overpayment.total: employee + employer = $ee + $er"
    }

    override def toString = (employee.value, employer.value).toString
  }

}

case class ClassOneResult(
  on: LocalDate,
  config: Map[String, RateDefinition],
  rowsInput: List[ClassOneRowInput],
  netPaid: Money = Money.Zero,
  employeePaid: Money = Money.Zero
) extends ClassOneResultLike {

  lazy val rowsOutput: List[ClassOneRowOutput] = rowsInput.map {
    case ClassOneRowInput(id, money, category, period, periodQty) =>
      ClassOneRowOutput(on, config, id, money, category, period, periodQty)
  }

  def grossPay: Explained[Money] = rowsInput.map{_.money}.sum gives
    s"grossPay: 𝚺(${rowsInput.map(_.money).mkString(", ")})"

}
