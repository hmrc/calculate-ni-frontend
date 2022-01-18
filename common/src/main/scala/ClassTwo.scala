/*
 * Copyright 2022 HM Revenue & Customs
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
import cats.syntax.applicative._
import spire.implicits._
import java.time.LocalDate

case class ClassTwo(
  weeklyRate: ClassTwoRates,
  smallEarningsException: Option[Money],
  hrpDate: Option[LocalDate],
  finalDate: Option[LocalDate],
  noOfWeeks: Int = 52,
  qualifyingRate: Money,
  lel: Money
) extends ClassTwoOrThree {
  def rate = weeklyRate.default
  def lowerEarningLimit = lel.pure[Explained]
  def qualifyingEarningsFactor: Explained[Money] = qualifyingRate.pure[Explained]
}

object ClassTwo {

  case class ClassTwoVague(
    weeklyRate: ClassTwoRates,
    smallEarningsException: Option[Money],
    hrpDate: Option[LocalDate],
    finalDate: Option[LocalDate],
    noOfWeeks: Int = 52,
    qualifyingRate: Money,
    lel: Option[Money]
  ) {
    def confirm(year: Interval[LocalDate], fallbackLEL: Option[Money]) = ClassTwo(
      weeklyRate,
      smallEarningsException,
      hrpDate,
      finalDate, 
      noOfWeeks,
      qualifyingRate,
      (lel orElse fallbackLEL) getOrElse {
        throw new IllegalStateException(s"No LEL defined for $year")
      }
    )
  }

}
