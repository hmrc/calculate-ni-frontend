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
import com.github.tototoshi.csv._
import org.scalatest._
import cats.syntax.either._
import org.scalatest.funspec.AnyFunSpec

import java.time.LocalDate
import java.io._

object Int {
  def unapply(in: String): Option[Int] = {
    Either.catchOnly[NumberFormatException](in.toInt).toOption
  }
}

object Money {
  def unapply(in: String): Option[BigDecimal] = {
    Either.catchOnly[NumberFormatException](BigDecimal(in)).toOption
  }
}

object PeriodParse {
  def unapply(in: String): Option[Period.Period] = Some(in) collect {
    case "M" => Period.Month
    case "W" => Period.Week
    case "4W" => Period.FourWeek
    case "Y" => Period.Year
  }
}

object Date{
  def unapply(in: String): Option[LocalDate] = {

    def gb = in.trim.split("/").toList match {
      case (Int(d)::Int(m)::Int(y)::Nil) => Some(LocalDate.of(y,m,d))
      case _ => None
    }

    def iso =
      Either.catchOnly[java.time.format.DateTimeParseException](
        LocalDate.parse(in.trim)
      ).toOption

    gb orElse iso
  }
}

case class FileTracker(name: String, position: Int)

trait ExplainTestSupport extends Matchers {

  implicit class RichExplained[A](in: Explained[A]) {
    def equalOrExplain(expected: A): compatible.Assertion = {
      assert(
        in.value === expected,
        in.written.toList.distinct.map("\n  " + _).mkString
      )
    }

    def assertOrExplain(predicate: A => Boolean): compatible.Assertion = {
      assert(
        predicate(in.value),
        in.written.toList.dedupPreserveOrder.map("\n  " + _).mkString
      )
    }
  }

}

trait SpreadsheetTest extends AnyFunSpec with Matchers with ExplainTestSupport {

  val config: Configuration = eoi.ConfigLoader.default

  def csvsInDir(dir: String): List[File] = csvsInDir(new File(dir))

  def csvsInDir(dir: File): List[File] =
    dir.listFiles().filter(_.getName().endsWith(".csv")).toList

  def files: List[File]
  def reportFileName: Option[String] = None

  val reportDir = {
    val d = new File("target/testing-reports")
    if (!d.exists) d.mkdirs
    d
  }

  def lineTest(in: Map[String, String]): Unit

  def runFiles(): Unit = {
    files.foreach { file =>
      val reader = CSVReader.open(file)
      val lines = reader.all.zipWithIndex.filterNot(_._1.mkString.startsWith("#"))
      val ((headers,_)::data) = lines.map{case (r,i) => r.map(_.trim) -> (i+1)}

      data.foreach { case (line, index) =>
        val dataMap: Map[String, String] = (headers zip line.map(_.trim)).toMap
        it(s"${file.getName}:${index}") {
          lineTest(dataMap)
        }
      }
      reader.close()
    }
  }

}
