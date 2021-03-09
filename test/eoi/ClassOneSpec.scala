/*
 * Copyright 2021 HM Revenue & Customs
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

import com.github.tototoshi.csv._
import org.scalatest._
import java.time.LocalDate
import java.io._

class ClassOneSpec extends FunSpec with ExplainTestSupport {

  val config: Configuration = eoi.ConfigLoader.default

  val files = {
    val dir = new File("calc/src/test/resources/testing-tables")
    dir.listFiles().filter(_.getName().endsWith(".csv"))
  }

  def parsePeriod(in: String): Period.Period = in match {
    case "M" => Period.Month
    case "W" => Period.Week
    case "4W" => Period.FourWeek
    case "Y" => Period.Year
  }

  describe("Access Application compatibility") {

    files foreach { file =>
      it(file.toString) {
        val reader = CSVReader.open(file)
        val lines = reader.all.zipWithIndex

        lines foreach { 
          case (line, indexMinus) =>
            val csvLine: String = {
              val quoted = line map {
                case x if x.contains(",") => s"""\"$x\""""
                case y => y
              }
              quoted.mkString(",")
            }

            line.map(_.trim) match {
              case (Int(year)::PeriodParse(period)::Int(periodNumber)::categoryS::Money(grossPay)::Money(expectedEmployee)::Money(expectedEmployer)::xs) =>
                val statusString = s"${file.getName}:${indexMinus + 1}"
                val comments = xs.mkString(",")
                val cosr = comments.contains("COSR")
                val category = categoryS(0)
                val res = config.calculateClassOne(
                  LocalDate.of(year, 10, 1),
                  ClassOneRowInput(
                    "row1",
                    grossPay,
                    category,
                    period,
                    periodNumber
                  ) :: Nil
                )

                assert(
                  res.employeeContributions.value === expectedEmployee +- 0.02,
                  s"\n  $file:${indexMinus + 1}" +
                    res.employeeContributions.written.toList.distinct.map("\n  " + _).mkString
                )

                assert(
                  res.employerContributions.value === expectedEmployer +- 0.02,
                  s"\n  $file:${indexMinus + 1}" +
                    res.employerContributions.written.toList.distinct.map("\n  " + _).mkString
                )
                
              case _ =>
            }
        }
        reader.close()
      }
    }
  }  
}
