package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._
import spire.math.Interval

abstract class InterestFrontend extends js.Object {

  protected def calculationFunction(
    row: InterestRow,
    remissionPeriod: Option[RemissionPeriod]
  ): InterestResult

  protected def rates: Map[Interval[LocalDate], Percentage]

  protected def calculateInner(
    rows: js.Array[InterestRow],
    remissionPeriod: Option[RemissionPeriod]
  ): js.Object = {

    val rowCalcs = rows.map { calculationFunction(_, remissionPeriod) }

    new js.Object {
      val rows = rowCalcs.map { c => 
        new js.Object {
          val periodStart = 1
          val debt = c.amount.toDouble
          val interestDue = c.interest.toDouble
          val totalDue = c.total.toDouble
          val dailyInterest = (c.dailyInterest).toDouble
        } : js.Object
      }
      val totalDebt = rowCalcs.map(_.amount).sum.toDouble
      val totalInterest = rowCalcs.map(_.interest).sum.toDouble
      val grandTotal = rowCalcs.map(_.total).sum.toDouble
      val totalDailyInterest = rowCalcs
        .map(_.dailyInterestUnrounded)
        .sum
        .setScale(2, BigDecimal.RoundingMode.HALF_UP)
        .toDouble
    }
  }

  def calculate(
    rows: js.Array[InterestRow],
    remissionPeriod: RemissionPeriod
  ): js.Object = calculateInner(rows, Some(remissionPeriod))

  def calculate(
    rows: js.Array[InterestRow]
  ): js.Object = calculateInner(rows, None)

  def getRates(): js.Array[js.Object] = rates.toList
    .sortBy(_._1.lowerValue.get)
    .map { case (interval, rateBD) =>
      val lower = interval.lowerValue.get
      interval.upperValue match {
        case Some(upper) =>
          new js.Object {
            val year = lower.getYear
            val start: js.Date = lower
            val end = upper
            val rate = rateBD.toDouble
          }: js.Object
        case None =>
          new js.Object {
            val year = lower.getYear
            val start: js.Date = lower
            val rate = rateBD.toDouble
          }: js.Object
      }
    }.toJSArray
  
} 

@JSExportTopLevel("InterestRow")
class InterestRow(
  val periodStart: js.Date,
  val debt: Double,
  val paymentDate: js.UndefOr[js.Date]
)

@JSExportTopLevel("RemissionPeriod")
class RemissionPeriod(
  val start: js.Date,
  val end: js.Date
)
