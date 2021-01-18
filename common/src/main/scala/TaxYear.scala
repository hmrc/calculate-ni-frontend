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

import java.time.LocalDate

case class TaxYear(startingYear: Int) {
  def endingYear: Int = startingYear + 1
  def start = LocalDate.of(startingYear, 4, 6)
  def end = LocalDate.of(endingYear, 4, 5)
  def asInterval = {
    import spire.math.Interval
    Interval.openUpper(
      LocalDate.of(startingYear, 4, 6),
      LocalDate.of(endingYear, 4, 6)
    )
  }

  def pred = TaxYear(startingYear - 1)  
  def succ = TaxYear(endingYear)
}

object TaxYear {

  def unapply(in: String): Option[TaxYear] = {
    import cats.implicits._

    in.split("-").toList match {
      case (year::Nil) => Either.catchOnly[NumberFormatException](year.toInt).toOption.map(apply(_))
      case (st::en::Nil) => (
        Either.catchNonFatal((st.toInt,en.toInt)).flatMap
          {x => Either.catchNonFatal(apply(x._1,x._2))}
      ).toOption
      case _ => None
    }
  }

  def apply(start: Int, end: Int): TaxYear =
    if (start + 1 == end)
      TaxYear(start)
    else
      throw new IllegalArgumentException("end year must be start year + 1")
}

