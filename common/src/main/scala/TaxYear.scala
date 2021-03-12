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

import java.time.{LocalDate, DayOfWeek}
import spire.math.Interval
import spire.math.interval._

case class TaxYear(startingYear: Int) extends AnyVal {
  def endingYear: Int = startingYear + 1
  def start = LocalDate.of(startingYear, 4, 6)
  def end = LocalDate.of(endingYear, 4, 5)
  def asInterval = spire.math.Interval.closed(start, end)
  def pred = TaxYear(startingYear - 1)  
  def succ = TaxYear(endingYear)

  def numberOfTaxWeeks: Int = 
    (succ.firstWeekOfTaxYear.toEpochDay - firstWeekOfTaxYear.toEpochDay).toInt / 7

  private[eoi] def firstWeekOfTaxYear: LocalDate =
    LocalDate.of(startingYear, 4, 6).nextOrSame(DayOfWeek.SUNDAY)

  def week(no: Int): Interval[LocalDate] = Interval.closed(
    firstWeekOfTaxYear.plusWeeks(no - 1),
    firstWeekOfTaxYear.plusWeeks(no).minusDays(1),
  )

  def asIntervalWeeks = Interval.closed(
    firstWeekOfTaxYear,
    succ.firstWeekOfTaxYear.minusDays(1)
  )

}

object TaxYear {

  // TODO Property test - ∀ d, apply(d).start ≤ d
  // TODO Property test - ∀ d, apply(d).end ≥ d  
  def apply(in: LocalDate): TaxYear = {
    if (in.getMonthValue > 4 || (in.getMonthValue == 4 && in.getDayOfMonth >= 6))
      TaxYear(in.getYear)
    else
      TaxYear(in.getYear - 1)
  }

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

