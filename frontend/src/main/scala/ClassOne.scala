/*
 * Copyright 2023 HM Revenue & Customs
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
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import JsObjectAdapter.ops._

@JSExportTopLevel("ClassOneFrontend")
class ClassOneFrontend(
  config: Configuration
) extends js.Object {

  import ClassOneFrontend.c1ResultLikeAdapter

  def getCategoryNames = {
    config.categoryNames.map { case (k,v) =>
      new js.Object {
        val letter = k.toString
        val name = v
      }
    }.toJSArray
  }

  def calculate(
    on: js.Date,
    rows: js.Array[ClassOneRow],
    netPaid: String,
    employeePaid: String
  ): js.Object =
    config.calculateClassOne(
      on,
      rows.toList.collect {
        case ClassOneRow(id, period, category, grossPay, _) =>
          val p = period match {
            case "W" => Period.Week
            case "2W" => Period.TwoWeek
            case "M" => Period.Month
            case "4W" => Period.FourWeek
            case _ => throw new IllegalStateException("Unknown Period")
          }

          ClassOneRowInput(id, Money(BigDecimal(grossPay)), category.head, p, 1 )
      },
      Money(BigDecimal(netPaid)),
      Money(BigDecimal(employeePaid))
    ).toJSObject

  def isCosrApplicable(on: Date): Boolean = {
    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )
    config.classOne(interval).values.exists(_.contractedOutStandardRate.isDefined)
  }

  def getTaxYears: js.Array[String] = {
    val i = config.classOne.keys.map(_.toString)
    i.toJSArray
  }

  def getApplicableCategories(on: Date): String = {
    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )
    config.classOne(interval).values.flatMap( x =>
      x.employee.keys ++ x.employer.keys
    ).toList.sorted.distinct.map{ch => s"$ch"}.mkString
  }
}

object ClassOneFrontend {

  /* this defines the structure of the JS object that is derived from
   * the Scala output.
   * Any of the elements of ClassOneResult can be made accessible to the
   * JS frontend from here.
   */
  implicit def c1ResultLikeAdapter[A <: ClassOneResultLike]: JsObjectAdapter[A] = new JsObjectAdapter[A] {
    def toJSObject(in: A): js.Object = new js.Object {

      // the rows
      val resultRows: js.Array[js.Object] = in.rowsOutput.map { row => new js.Object {
        val name = row.rowId

        // the bands for which the user should see the earnings
        val resultBands = row.displaySummaryBands.map { band => new js.Object {
          val name = band.bandId

          // anywhere where we have an 'Explained' datatype we can call 'value' to get
          // the Scala value (normally a BigDecimal) -
          val amountInBand = if (name == "Up to LEL")
            if (band.amountInBand.value == band.moneyInterval.value.upperValue.get)
              band.amountInBand.value.toDouble
            else
              0.0
          else
            band.amountInBand.value.toDouble

          // or call 'explain' to get a List[String] trace -
          val amountInBandExplain: js.Array[String] = band.amountInBand.explain.toJSArray
        }: js.Object }.toJSArray

        // the bands for which the user should see the contributions
        val resultContributionBands = row.displaySummaryContributionBands.map { band => new js.Object {
          val name = band.bandId
          val employeeContributions = band.employeeContributions.value.toDouble
        }: js.Object }.toJSArray

        val employer = row.employerContributions.value.toDouble
        val employee = row.employeeContributions.value.toDouble
        val explain = (row.employeeContributions.explain ++ row.employerContributions.explain).dedupPreserveOrder.toJSArray

      }: js.Object }.toJSArray

      val employerPaid = in.employerPaid.value.toDouble

      // aggregate values
      val totals = new js.Object {
        val gross = in.grossPay.value.toDouble
        val employee = in.employeeContributions.value.toDouble
        val employer = in.employerContributions.value.toDouble
        val net = in.totalContributions.value.toDouble
      }

      val underpayment = new js.Object {
        val employee = in.underpayment.employee.value.toDouble
        val employer = in.underpayment.employer.value.toDouble
        val total = in.underpayment.total.value.toDouble
      }

      val overpayment = new js.Object {
        val employee = in.overpayment.employee.value.toDouble
        val employer = in.overpayment.employer.value.toDouble
        val total = in.overpayment.total.value.toDouble
      }

      val employerContributions = in.employerPaid.value.toDouble

      def calcTotals(key: String, x: List[ClassOneRowOutput#ClassOneRowOutputBand]): (String, js.Object) = {
        key match {
          case "Up to LEL" =>
            key -> new js.Object {
              val gross = x.flatMap{ b =>
                if (b.amountInBand.value == b.moneyInterval.value.upperValue.get)
                  Some(b.amountInBand.value)
                else
                  None
              }.sum.toDouble
              val employee = x.map(_.employeeContributions.value).sum.toDouble
              val employer = x.map(_.employerContributions.value).sum.toDouble
              val net = x.map(_.employerContributions.value).sum.toDouble
            }
          case _ =>
            key -> new js.Object {
              val gross = x.map(_.amountInBand.value).sum.toDouble
              val employee = x.map(_.employeeContributions.value).sum.toDouble
              val employer = x.map(_.employerContributions.value).sum.toDouble
              val net = x.map(_.employerContributions.value).sum.toDouble
            }
        }
      }

      val categoryTotals = {
        in.rowsOutput.groupBy(_.category).map {
          case (cat, matchingRows) =>
            cat.toString -> new js.Object {
              val gross = matchingRows.map(_.money).sum.toDouble
              val employee = matchingRows.map(_.employeeContributions.value).sum.toDouble
              val employer = matchingRows.map(_.employerContributions.value).sum.toDouble
              val net = matchingRows.map(_.totalContributions.value).sum.toDouble
              val resultBands = matchingRows
                .flatMap(_.displaySummaryBands)
                .groupBy(_.bandId)
                .map(Function.tupled(calcTotals))
                .toJSMap
              val resultContributionBands = matchingRows
                .flatMap(_.displaySummaryContributionBands)
                .groupBy(_.bandId)
                .map(Function.tupled(calcTotals))
                .toJSMap
            }
        }
      }.toJSMap

      val bandTotals = new js.Object {

        val resultBands = in.rowsOutput
          .flatMap(_.displaySummaryBands)
          .groupBy(_.bandId)
          .map(Function.tupled(calcTotals))
          .toJSMap

        val resultContributionBands = in.rowsOutput
          .flatMap(_.displaySummaryContributionBands)
          .groupBy(_.bandId)
          .map(Function.tupled(calcTotals))
          .toJSMap

      }
    }
  }
}

@JSExportTopLevel("ClassOneRow")
case class ClassOneRow(
  id: String,
  period: String, // "M", "W" or "4W"
  category: String,
  grossPay: Double,
  contractedOutStandardRate: Boolean = false
)

@JSExportTopLevel("ClassOneRowProRata")
case class ClassOneRowProRata(
  id: String,
  from: Date,
  to: Date,
  category: String,
  grossPay: Double,
  contractedOutStandardRate: Boolean = false
)
