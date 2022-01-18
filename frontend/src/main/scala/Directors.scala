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
package frontend

import scala.scalajs.js.{Date, UndefOr}
import scala.scalajs.js
import JsObjectAdapter.ops._

import scala.scalajs.js.JSConverters._
import scala.scalajs.js.annotation.JSExportTopLevel

class Directors (
  config: Configuration
                ) extends js.Object {

  import ClassOneFrontend.c1ResultLikeAdapter

  def calculate(
                 from: Date,
                 to: Date,
                 rows: js.Array[DirectorsRow],
                 appropriatePersonalPensionScheme: UndefOr[Boolean],
                 netPaid: String,
                 employeePaid: String
               ): js.Object = config.calculateDirectors(
    from,
    to,
    rows.map(row => DirectorsRowInput(row.category.head, Money(BigDecimal(row.grossPay)), row.id)).toList,
    appropriatePersonalPensionScheme.toOption,
    Money(BigDecimal(netPaid)),
    Money(BigDecimal(employeePaid))
  ).toJSObject

  def getTaxYearsWithOptions: js.Array[String] =
    config.classOne.keys.map(_.toString).toJSArray

  def isAppropriatePersonalPensionSchemeApplicable(on: Date) =
    on.getYear < 2012


}

@JSExportTopLevel("DirectorsRow")
case class DirectorsRow(
                        id: String,
                        category: String,
                        grossPay: Double
                      )
