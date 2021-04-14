package eoi
package frontend

import scala.scalajs.js, js.JSConverters._
import spire.math.Interval

class WeeklyContributions(
  config: Configuration
) extends js.Object {

  def calculate(
    from: js.Date,
    to: js.Date
  ): Int = Interval[java.time.LocalDate](from, to).numberOfTaxWeeks.get

  def breakdown(
    from: js.Date,
    to: js.Date
  ): js.Object = {
    val r = Interval[java.time.LocalDate](from, to).taxWeekBreakdown
    val yearsSeq = r.map {
      case (y, w) =>

        new js.Object {
          val weeks: Int = w
          val year: Int = y.startingYear

          val startDate: js.Date = y.start
          val endDate: js.Date = y.end
        }
    }.toJSArray
    val total = r.map(_._2).sum

    new js.Object {
      val totalWeeks = total
      val years = yearsSeq
    }
  }

}
