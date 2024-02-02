/*
 * Copyright 2023 HM Revenue & Customs
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
import org.scalatest._, funspec._
import java.time.LocalDate
import java.io._

class ClassOneSpec extends AnyFunSpec with ExplainTestSupport {

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
      val reader = CSVReader.open(file)
      val lines = reader.all().zipWithIndex

      lines foreach { case (line, indexMinus) =>
        line.map(_.trim) match {
          case (Int(year)::PeriodParse(period)::Int(periodNumber)::categoryS::MoneyStr(grossPay)::MoneyStr(expectedEmployee)::MoneyStr(expectedEmployer)::_) =>
            
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
            it(s"${file.getName}:L${indexMinus + 1}:Employee") {
              assert(
                res.employeeContributions.value.value === expectedEmployee.value +- 0.03,
                s"\n  $year $period $categoryS $grossPay" +
                  res.employeeContributions.written.toList.distinct.map("\n  " + _).mkString
              )
            }
            it(s"${file.getName}:L${indexMinus + 1}:Employer") {
              assert(
                res.employerContributions.value.value === expectedEmployer.value +- 0.03,
                s"\n  $year $period $categoryS $grossPay" +
                  res.employerContributions.written.toList.distinct.map("\n  " + _).mkString
              )
            }
          case _ =>
            
        }
        reader.close()
      }
    }
  }
}
