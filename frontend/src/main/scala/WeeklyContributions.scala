package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

class WeeklyContributions(
  config: Configuration
) extends js.Object {

  def calculate(
    from: js.Date,
    to: js.Date,
    earningsFactor: Double
  ) = new js.Object {
    val maxPotentialWeeks: Int = 52
    val actualWeeks: Int = 12
    val deficient: Int = 1
  }
}
