package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

/** A dummy object for backward compatibility */
@JSExportTopLevel("ClassOne")
@deprecated("Use NiFrontend")
final class ClassOne(json: String) extends NiFrontend(json) {

  @deprecated("Use classOne.calculateJson")
  lazy val calculate = classOne.calculateJson _

  @deprecated("Use classOne.calculateProRataJson")
  lazy val calculateProRata = classOne.calculateProRataJson _

  @deprecated("Use classOne.getTaxYears")
  lazy val getTaxYears = classOne.getTaxYears _

  @deprecated("Use classOne.getApplicableCategories")
  lazy val getApplicableCategories = classOne.getApplicableCategories _

}

@JSExportTopLevel("NiFrontend")
class NiFrontend(json: String) extends js.Object {

  val config: Configuration = EoiJsonEncoding.fromJson(json) match {
    case Right(z) => z
    case Left(err) => throw new IllegalArgumentException(s"$err")
  }

  lazy val classOne = new ClassOneFrontend(config)
  lazy val classTwo = new ClassTwoFrontend(config)
  lazy val classThree = new ClassThreeFrontend(config)
  lazy val weeklyContributions = new WeeklyContributions(config)  
}
