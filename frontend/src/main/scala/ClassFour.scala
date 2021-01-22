package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

class ClassFourFrontend (
  config: Configuration
) extends js.Object {

  def calculate(
    on: js.Date,
    amount: Double
  ): String = {
    val (l,h) = config.calculateClassFour(on, amount).getOrElse(
      throw new NoSuchElementException(s"Class Three undefined for $on")
    )
    l.toString + "," + h.toString
  }
}

