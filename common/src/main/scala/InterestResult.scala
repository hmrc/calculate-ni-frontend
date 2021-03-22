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

import spire.math.Interval
import java.time.LocalDate

case class InterestResult(
  ratesSequence: Map[Interval[LocalDate], BigDecimal],
  from: TaxYear,
  to: LocalDate, 
  amount: BigDecimal,
  daysInYear: Int,
  remissionPeriod: Option[Interval[LocalDate]]
) {

  val dateRange: Interval[LocalDate] = {
    val start = LocalDate.of(from.succ.start.getYear, 4, 19)
    Interval.closed(start, to)
  }

  val dailyArrears = amount / daysInYear

  val interestUnrounded = ratesSequence.foldLeft(Zero){ case (acc,(band,rate)) =>
    val overlap = band intersect dateRange
    val overlapDays = overlap.numberOfDays.getOrElse(0)
    val remissionDays = remissionPeriod.fold(0)(r => (overlap intersect r).numberOfDays.getOrElse(0) )
    val effectiveDays = overlapDays - remissionDays
    acc + effectiveDays * dailyArrears * rate
  }

  val interest = interestUnrounded.setScale(2, BigDecimal.RoundingMode.HALF_UP)

  val total = amount + interest

  val dailyInterestUnrounded = (interestUnrounded / dateRange.numberOfDays.get)

  val dailyInterest = dailyInterestUnrounded.setScale(2, BigDecimal.RoundingMode.HALF_UP)
}
