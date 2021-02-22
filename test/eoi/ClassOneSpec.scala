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

import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import com.github.tototoshi.csv._
import org.scalatest._
import cats.syntax.either._
import java.time.LocalDate
import java.io._

class ClassOneSpec extends FunSpec with Matchers {

  val config: Configuration = eoi.ConfigLoader.default

  val files = {
    val dir = new File("calc/src/test/resources/testing-tables")
    dir.listFiles().filter(_.getName().endsWith(".csv"))
}

  val reportDir = {
    val d = new File("target/testing-reports")
    if (!d.exists) d.mkdirs
    d
  }

  describe("Access Application compatibility") {

    files.foreach { file =>
      describe(file.getName()) {
        val reader = CSVReader.open(file)
        val lines = reader.all.zipWithIndex.drop(1).filterNot(_._1.mkString.startsWith("#"))

        val reportFile = {
          val f = new File(reportDir, file.getName)
          if (f.exists) f.delete
          f
        }

        val writer = new BufferedWriter(new FileWriter(reportFile))

        def writeln(in: String = ""): Unit = {
          writer.write(in)
          writer.write(System.lineSeparator())
        }

        val (pass, fail) = lines.foldLeft((0,0)){ case ((passAcc,failAcc),(line, indexMinus)) =>

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

              val employee = res.employeeContributions.value
              val employer = res.employerContributions.value              
              if (employee != expectedEmployee || employer != expectedEmployer) {

                val director = comments.contains("director")
                writeln(statusString)
                writeln(statusString.map{_ => '='})
                writeln()                
                writeln("  " + line.mkString(","))


                if (expectedEmployee != employee) {
                  val error = expectedEmployee - employee
                  writeln(s"  Employee expected: $expectedEmployee, actual: $employee ($error)")
                  writeln()
                  writeln(res.employeeContributions.explain.map("  " + _).mkString("\n"))
                  writeln()
                }

                if (expectedEmployer != employer) {
                  val error = expectedEmployer - employer
                  writeln(s"  Employer expected: $expectedEmployer, actual: $employer ($error)")
                  writeln()                  
                  writeln(res.employerContributions.explain.map("  " + _).mkString("\n"))
                  writeln()
                }
                (passAcc, failAcc+1)
              } else {
                (passAcc+1, failAcc)
              }

              // val director = comments.contains("director")
              // val statusString = s"Year:$year,COSR:$cosr:Period:$periodS/$periodNumber,Director:$director"
              // it(s"${file.getName}:${indexMinus + 1} employee's NI [$statusString]") {
              //   employee should be (BigDecimal(expectedEmployeeS) /* +- 0.02 */)
              // }
              // it(s"${file.getName}:${indexMinus + 1} employer's NI [$statusString]") {
              //   employer should be (BigDecimal(expectedEmployerS) /* +- 0.02 */)
              // }
            case _ => (passAcc, failAcc)
          }
        }

        val total = pass + fail
        writeln(f"pass: $pass (${pass * 100/ total}%%)")
        writeln(f"fail: $fail (${fail * 100 / total}%%)")        

        reader.close()
        writer.close()
      }
    }
  }  
}
