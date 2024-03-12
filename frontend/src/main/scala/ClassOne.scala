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
            case "2W" => Period.Week
            case "M" => Period.Month
            case "4W" => Period.FourWeek
            case _ => throw new IllegalStateException("Unknown Period")
          }

          ClassOneRowInput(id, Money(BigDecimal(grossPay)), category.head, p, if (period == "2W") 2 else 1 )
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
