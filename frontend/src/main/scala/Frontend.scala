package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

@JSExportTopLevel("NiFrontend")
class NiFrontend(json: String) extends js.Object {

  val config: Configuration = EoiJsonEncoding.fromJson(json) match {
    case Right(z) => z
    case Left(err) => throw new IllegalArgumentException(s"$err")
  }

  lazy val classOne = new ClassOneFrontend(config)
  lazy val classTwo = new ClassTwoFrontend(config)
  lazy val classThree = new ClassThreeFrontend(config)
  lazy val classFour = new ClassFourFrontend(config)  
  lazy val weeklyContributions = new WeeklyContributions(config)  
  lazy val interestOnLateClassOne = new InterestOnUnpaidFrontend(config)

}
