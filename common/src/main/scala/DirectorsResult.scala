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

package main.scala

import cats.Eq
import eoi.{Period, RateDefinition}
import cats.syntax.eq._
import cats.instances.char._
import spire.math.Interval
import eoi._

import java.time.LocalDate

case class DirectorsRowInput(
                              category: Char,
                              grossPay: BigDecimal,
                              rowId: String)

case class DirectorsResult(
                            from: LocalDate,
                            to: LocalDate,
                            config: Map[String, RateDefinition],
                            rowsInput: List[DirectorsRowInput],
                            appropriatePersonalPensionScheme: Option[Boolean],
                            netPaid: BigDecimal = Zero,
                            employeePaid: BigDecimal = Zero
                          ) extends ClassOneResultLike {

  import DirectorsResult._

  val (period, periodQuantity) =
    Period.Week -> Interval(from, to).numberOfWeeks().getOrElse(sys.error(s"Could not work  number of weeks between $from and $to"))

  lazy val rowsOutput: List[ClassOneRowOutput] = {
    val sortedRows = rowsInput.sortWithOrder(
      if(appropriatePersonalPensionScheme.exists(identity)) categoryOrderApp else categoryOrder)(_.category)
    sortedRows.foldLeft(List.empty[ClassOneRowOutput] -> Zero){ case ((acc, precededAmount), directorsRowInput) =>
      val rowOutput = ClassOneRowOutput(from, config, directorsRowInput.rowId, directorsRowInput.grossPay, directorsRowInput.category, period, periodQuantity, precededAmount)
      (rowOutput :: acc) -> (precededAmount + directorsRowInput.grossPay)
    }._1.reverse
  }

  def grossPay: Explained[BigDecimal] = rowsInput.map{_.grossPay}.sum gives
    s"grossPay: ${rowsInput.map(_.grossPay).mkString(" + ")}"


}

object DirectorsResult {

  implicit class ListOps[A](private val l: List[A]){

    def sortWithOrder[B](order: List[B])(f: A => B)(implicit eq: Eq[B]): List[A] = {

      def loop(toSort: List[(A, B)], order: List[B], acc: List[A]): List[A]  =
        if(toSort.isEmpty) acc
        else order match {
            case Nil => acc
            case head :: tail =>
              val (toTake, toSortStill) = toSort.partition(_._2 === head)
              loop(toSortStill, tail, acc ::: toTake.map(_._1))
        }


      val mappedValues = l.map(f)

      mappedValues.distinct.diff(order) match {
        case Nil => loop(l.zip(mappedValues), order, Nil)
        case unknownValues => throw new IllegalArgumentException(s"Could not sort on unknown values: ${unknownValues.mkString(", ")}")
      }

    }

  }

  val categoryOrder: List[Char] = List('G','E', 'B', 'F', 'H', 'I', 'D', 'M', 'A', 'S', 'K', 'L', 'Z', 'J', 'C')

  val categoryOrderApp: List[Char] = List('G','E', 'B', 'M', 'A', 'F', 'I', 'D', 'Z', 'J', 'S', 'K', 'L', 'C')


}
