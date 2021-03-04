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

}
