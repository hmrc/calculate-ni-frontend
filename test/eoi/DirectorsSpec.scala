/*
 * Copyright 2022 HM Revenue & Customs
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

import cats.data.Validated.Invalid
import cats.data.{Validated, ValidatedNel}
import cats.kernel.Semigroup
import cats.instances.list._
import cats.syntax.traverse._
import cats.syntax.apply._
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import pureconfig.{ConfigReader, ConfigSource}
import ConfigLoader.moneyReader
import java.time.LocalDate
import scala.util.Try

class DirectorsSpec extends AnyWordSpec with Matchers {

  import eoi.DirectorsSpec._

  val tests: List[Test] =
    ConfigSource
      .file("calc/src/test/resources/directors-tests.conf")
      .load[Tests]
      .getOrElse(sys.error("Could not get directors tests"))
      .tests

  "The director calculator" must {

    val config: eoi.Configuration = eoi.ConfigLoader.default


    "work" in {
      val results: List[(Option[String], ValidatedNel[String, Unit])] = tests.map{ test =>
        val (from, to) = test.proRata.fold(
          LocalDate.of(test.taxYear, 4, 6) ->
            LocalDate.of(test.taxYear + 1, 4, 5)
        )(p => p.from -> p.to)

        val result: DirectorsResult = config.calculateDirectors(
          from,
          to,
          test.rows.map( row =>
            DirectorsRowInput(
              row.category,
              row.grossPay,
              row.id
            )
          ),
          test.app,
          test.paid.map(_.net).getOrElse(Money.Zero),
          test.paid.map(_.ee).getOrElse(Money.Zero)
        )

        test.description -> validateResult(result, test)
      }

      val failed = results.collect{ case (d, Invalid(e)) => d -> e }

      if(failed.nonEmpty)
        fail(s"${failed.size} tests failed:\n ${failed.map( f =>
          s"[${f._1.getOrElse("")}]:\n    ${f._2.toList.mkString("\n    ")}"
        ).mkString("\n  ")}")
    }

  }

  def validateResult(result: DirectorsResult, test: Test): ValidatedNel[String, Unit] = {
    type ValidationResult[A] = ValidatedNel[String, A]

    def validated[A](calculatedValue: Explained[A], expectedValue: A, description: String): ValidationResult[Unit] =
      Validated.condNel(
        calculatedValue.value == expectedValue,
        (),
        s"calculated $description '${calculatedValue.value}' " +
          s"was not expected value '$expectedValue':\n      ${calculatedValue.explain.mkString("\n      ")}"
      )

    val rowTotalChecks =
      test.rows.map{ row =>
        result.rowsOutput.find(_.rowId == row.id) match {
          case None =>
            Validated.invalidNel(s"Could not find output row with id ${row.id}")

          case Some(outputRow) =>
            validated(
              outputRow.totalContributions,
              row.total,
              s"total for row '${row.id}'"
            ).combine(
              validated(
                outputRow.employeeContributions,
                row.ee,
                s"ee contributions for row '${row.id}'"
              )
            )

        }
      }.sequence

    val totalNetCheck =
      validated(result.totalContributions, test.total.net, "total contributions")

    val totalEECheck =
      validated(result.employeeContributions, test.total.ee, "total EE contributions")

    val totalERCheck =
      validated(result.employerContributions, test.total.er, "total ER contributions")

    val underPaymentTotalCheck =
      validated(result.underpayment.total, test.underpayment.map(_.net).getOrElse(test.total.net), "total underpayments")

    val underPaymentEECheck =
      validated(result.underpayment.employee, test.underpayment.map(_.ee).getOrElse(test.total.ee), "EE underpayments")

    val underPaymentERCheck =
      validated(result.underpayment.employer, test.underpayment.map(_.er).getOrElse(test.total.er), "ER underpayments")

    val overPaymentTotalCheck =
      validated(result.overpayment.total, test.overpayment.map(_.net).getOrElse(Money.Zero), "total overpayments")

    val overPaymentEECheck =
      validated(result.overpayment.employee, test.overpayment.map(_.ee).getOrElse(Money.Zero), "EE overpayments")

    val overPaymentERCheck =
      validated(result.overpayment.employer, test.overpayment.map(_.er).getOrElse(Money.Zero), "ER overpayments")


    (
      rowTotalChecks,
      totalNetCheck,
      totalEECheck,
      totalERCheck,
      underPaymentTotalCheck,
      underPaymentEECheck,
      underPaymentERCheck,
      overPaymentTotalCheck,
      overPaymentEECheck,
      overPaymentERCheck
      ).mapN{ case _ => () }
  }





}


object DirectorsSpec {

  case class Row(category: Char, grossPay: Money, id: String, total: Money, ee: Money)

  case class Total(net: Money, ee: Money, er: Money)

  case class Paid(net: Money, ee: Money)

  case class UnderPayment(net: Money, ee: Money, er: Money)

  case class OverPayment(net: Money, ee: Money, er: Money)

  case class ProRata(from: LocalDate, to: LocalDate)

  case class Test(
                 taxYear: Int,
                 proRata: Option[ProRata],
                 rows: List[Row],
                 paid: Option[Paid],
                 total: Total,
                 underpayment: Option[UnderPayment],
                 overpayment: Option[OverPayment],
                 description: Option[String],
                 app: Option[Boolean]
                 )

  case class Tests(tests: List[Test])

  implicit val rowReader: ConfigReader[Row] =
    ConfigReader.forProduct5("category", "gross-pay", "id", "total", "ee")(Row(_, _, _, _, _))

  implicit val totalReader: ConfigReader[Total] =
    ConfigReader.forProduct3("net", "ee", "er")(Total(_, _, _))

  implicit val paidReader: ConfigReader[Paid] =
    ConfigReader.forProduct2("net", "ee")(Paid(_, _))

  implicit val underPaymentReader: ConfigReader[UnderPayment] =
    ConfigReader.forProduct3("net", "ee", "er")(UnderPayment(_, _, _))

  implicit val overPaymentReader: ConfigReader[OverPayment] =
    ConfigReader.forProduct3("net", "ee", "er")(OverPayment(_, _, _))

  implicit val localDataConfigReader: ConfigReader[LocalDate] =
    ConfigReader.fromNonEmptyStringTry(s => Try(LocalDate.parse(s)))

  implicit val proRataReader: ConfigReader[ProRata] =
    ConfigReader.forProduct2("from", "to")(ProRata(_, _))

  implicit val testReader: ConfigReader[Test] =
    ConfigReader.forProduct9(
      "tax-year",
      "pro-rata",
      "rows",
      "paid",
      "total",
      "underpayment",
      "overpayment",
      "description",
      "app"
    )(Test(_, _, _, _ ,_, _, _, _, _))

  implicit val testsReader: ConfigReader[Tests] =
    ConfigReader.forProduct1("tests")(Tests(_))

  implicit val unitSemiGroup: Semigroup[Unit] =   Semigroup.instance[Unit]{ case _ => () }

}
