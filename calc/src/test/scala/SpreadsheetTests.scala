package eoi
package calc

import org.scalatest._
import com.typesafe.config.ConfigValueFactory
import com.github.tototoshi.csv._

class SpreadsheetTests extends FunSpec with Matchers {

  lazy val config = eoi.calc.fromFile(new java.io.File("national-insurance.conf"))

  val files = {
    val dir = new java.io.File("calc/src/test/resources/testing-tables")
    dir.listFiles().filter(_.getName().endsWith(".csv"))
  }

  def parsePeriod(in: String): Period.Period = in match {
    case "M" => Period.Month
    case "W" => Period.Week
    case "4W" => Period.FourWeek
    case "Y" => Period.Year
  }

//  describe("Access Application compatibility") {
    files.foreach { file =>
//      describe(file.getName()) {
        val reader = CSVReader.open(file)
        val lines = reader.all.zipWithIndex.drop(1).filterNot(_._1.mkString.startsWith("#"))
        lines.map { case (line, indexMinus) =>

          line.map(_.trim) match { 
            case (yearS::periodS::periodNumberS::categoryS::grossPayS::expectedEmployeeS::expectedEmployerS::xs) =>
              val startDay = {
                taxPeriodReader.from(ConfigValueFactory.fromAnyRef(yearS, "")) match {
                  case Left(e) => throw new IllegalStateException(
                    s"Unable to parse tax year/period on line ${indexMinus + 1}: $e"
                  )
                  case Right(r) => r
                }
              }

              val comments = xs.mkString(",")
              val cosr = comments.contains("COSR")

              val result = config.calculateClassOne(
                startDay.lowerValue.get.plusDays(1),
                BigDecimal(grossPayS),
                categoryS(0),
                parsePeriod(periodS),
                periodNumberS.toInt,
                cosr
              )

              val (employee, employer) = result.foldLeft((Zero, Zero)){
                case ((ee_acc, er_acc), (_, (_, ee, er))) => (ee_acc + ee, er_acc + er)
              }
              val director = comments.contains("director")
              val statusString = s"Year:$yearS,COSR:$cosr:Period:$periodS/$periodNumberS,Director:$director"
              it(s"${file.getName}:${indexMinus + 1} employee's NI [$statusString]") {
                employee should be (BigDecimal(expectedEmployeeS) /* +- 0.02 */)
              }
              it(s"${file.getName}:${indexMinus + 1} employer's NI [$statusString]") {
                employer should be (BigDecimal(expectedEmployerS) /* +- 0.02 */)
              }
            case _ =>
          }
        }
        reader.close()
//      }
    }
//  }

}
