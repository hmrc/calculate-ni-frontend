package eoi
package frontend

import main.scala.DirectorsRowInput

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
                 appropriatePersonalPensionScheme: Option[Boolean],
                 netPaid: String,
                 employeePaid: String
               ): js.Object = config.calculateDirectors(
    from,
    to,
    rows.map(row => DirectorsRowInput(row.category.head, row.grossPay, row.id)).toList,
    appropriatePersonalPensionScheme.toOption,
    BigDecimal(netPaid),
    BigDecimal(employeePaid)
  ).toJSObject

  def getTaxYearsWithOptions: js.Array[String] =
    config.classOne.keys.map(_.toString).toJSArray

  def isAppropriatePersonalPensionSchemeApplicable(on: Date) =
    on.getYear < 2016


}

@JSExportTopLevel("DirectorsRow")
case class DirectorsRow(
                        id: String,
                        category: String,
                        grossPay: Double
                      )
