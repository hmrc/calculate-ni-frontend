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

import cats.data.Validated.Invalid
import cats.data.{Validated, ValidatedNel}
import cats.kernel.Semigroup
import cats.instances.list._
import cats.syntax.traverse._
import cats.syntax.apply._
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import pureconfig.{ConfigReader, ConfigSource}
import eoi.Class1Band._

class UnofficialDefermentSpec extends AnyWordSpec with Matchers {

  import eoi.UnofficialDefermentSpec._

  val tests: List[Test] =
    ConfigSource
      .file("calc/src/test/resources/unofficial-deferment-tests.conf")
      .load[Tests]
      .getOrElse(sys.error("Could not get unofficial deferment tests"))
      .tests

  "The unofficial deferment calculator" must {

    val config = eoi.ConfigLoader.default


    "work" in {

      val results: List[(Option[String], ValidatedNel[String, Unit])] = tests.map{ test =>
        val result = config.calculateUnofficialDeferment(
          test.taxYear,
          config.unofficialDeferment.getOrElse(test.taxYear, sys.error(s"Could not find unofficial deferment config for tax year ${test.taxYear}")),
          test.rows.map{ row =>
            UnofficialDefermentRowInput(
              row.id,
              "",
              row.category,
              rowBandAmounts(row),
              row.employeeNics
            )
          }
        )

        test.description -> validateResult(result, test)
      }

      val failed = results.collect{ case (d, Invalid(e)) => d -> e }

      if(failed.nonEmpty)
        fail(s"${failed.size} tests failed:\n ${failed.map( f =>
          s"[${f._1.getOrElse("")}]:\n    ${f._2.toList.mkString("\n    ")}"
        ).mkString("\n  ")}")




    }

    def rowBandAmounts(row: Row): List[BandAmount] =
      List(
        Some(BandAmount(BelowLEL, row.earningsAtLEL)),
        row.earningsLelToEt.map(BandAmount(LELToET, _)),
        row.earningsLelToPt.map(BandAmount(LELToPT, _)),
        row.earningsPtToUap.map(BandAmount(PTToUAP, _)),
        row.earningsPtToUel.map(BandAmount(PTToUEL, _)),
        row.earningsEtToUel.map(BandAmount(ETToUEL, _)),
        row.earningsUapToUel.map(BandAmount(UAPToUEL, _))
      ).collect { case Some(b) => b }

    def validateResult(result: UnofficialDefermentResult, test: Test): ValidatedNel[String, Unit] = {
      type ValidationResult[A] = ValidatedNel[String, A]

      val tolerance: BigDecimal = 1

      def validated(calculatedValue: BigDecimal, expectedValue: BigDecimal, description: String): ValidationResult[Unit] =
        Validated.condNel(
          (expectedValue - calculatedValue).abs <= tolerance,
          (),
          s"calculated $description '$calculatedValue' was not within $tolerance of expected value '$expectedValue'"
        )

      val rowChecks =
        test.rows.map{ row =>
          result.rowsOutput.find(_.id == row.id) match {
            case None =>
              Validated.invalidNel(s"Could not find output row with id ${row.id}")

            case Some(outputRow) =>
              validated(
                outputRow.earningsOverUEL,
                row.earningsOverUel,
                s"earning over UEL for row '${row.id}'"
              ).combine(
                validated(
                  outputRow.nicsNonCO,
                  row.nicsDueNonCo,
                  s"NICs due non-CO for row '${row.id}'"
                )
              ).combine(
                validated(
                  outputRow.ifNotUD,
                  row.ifNotUD,
                  s"if not UD for row '${row.id}'"
                )
              ).combine(
                validated(
                  outputRow.grossPay,
                  row.grossPay,
                  s"gross pay for row '${row.id}'"
                )
              )

          }
        }.sequence

      val annualMaxCheck =
        validated(result.annualMax.value, test.annualMax, "annual max")

      val liabilityCheck =
        validated(result.liability, test.liability, "liability")

      val differenceCheck =
        validated(result.difference, test.difference, "difference")

      val ifNotUDCheck =
        validated(result.ifNotUD, test.ifNotUD, "if not UD")

      (
        rowChecks,
        annualMaxCheck,
        liabilityCheck,
        differenceCheck,
        ifNotUDCheck
        ).mapN{ case _ => () }
    }



  }

}

object UnofficialDefermentSpec {

  case class Row(
                  id: String,
                  category: Char,
                  earningsAtLEL: BigDecimal,
                  earningsLelToPt: Option[BigDecimal],
                  earningsLelToEt: Option[BigDecimal],
                  earningsPtToUap: Option[BigDecimal],
                  earningsUapToUel: Option[BigDecimal],
                  earningsPtToUel: Option[BigDecimal],
                  earningsEtToUel: Option[BigDecimal],
                  employeeNics: BigDecimal,
                  earningsOverUel: BigDecimal,
                  grossPay: BigDecimal,
                  nicsDueNonCo: BigDecimal,
                  ifNotUD: BigDecimal
                )

  case class Test(
                   description: Option[String],
                   taxYear: Int,
                   lel: BigDecimal,
                   et: Option[BigDecimal],
                   pt: Option[BigDecimal],
                   uap: Option[BigDecimal],
                   uel: BigDecimal,
                   rows: List[Row],
                   annualMax: BigDecimal,
                   liability: BigDecimal,
                   difference: BigDecimal,
                   ifNotUD: BigDecimal
                 )

  case class Tests(tests: List[Test])

  implicit val rowReader: ConfigReader[Row] =
    ConfigReader.forProduct14(
      "id",
      "category",
      "below-lel",
      "lel-pt",
      "lel-et",
      "pt-uap",
      "uap-uel",
      "pt-uel",
      "et-uel",
      "employee-nics",
      "over-uel",
      "gross-pay",
      "nics-due-non-co",
      "if-not-ud"
    )(Row(_, _, _, _, _ ,_ ,_, _, _, _ ,_ ,_ ,_, _))

  implicit val testReadereader: ConfigReader[Test] =
    ConfigReader.forProduct12(
      "description",
      "tax-year",
      "lel",
      "et",
      "pt",
      "uap",
      "uel",
      "rows",
      "annual-max",
      "liability",
      "difference",
      "if-not-ud"
    )(Test(_, _, _, _ ,_ ,_, _, _, _ ,_ ,_, _))

  implicit val testsReader: ConfigReader[Tests] =
    ConfigReader.forProduct1("tests")(Tests(_))

  implicit val unitSemiGroup: Semigroup[Unit] =   Semigroup.instance[Unit]{ case _ => () }

}
