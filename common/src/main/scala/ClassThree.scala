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
import cats.syntax.applicative._
import spire.implicits._
import java.time.LocalDate

case class ClassThree(
  finalDate: Option[LocalDate],
  weekRate: Money,
  hrpDate: Option[LocalDate],  
  noOfWeeks: Int = 52,
  lel: Money,
  qualifyingRate: Option[Money]
) extends ClassTwoOrThree {
  def rate = weekRate
  def qualifyingEarningsFactor: Explained[Money] = qualifyingRate match {
    case Some(r) => r.pure[Explained]
    case None =>
      ((lel * noOfWeeks) - Money(50)) gives s"qualifyingRate: lel * noOfWeeks - 50 = $lel * $noOfWeeks - 50"
  }
  def lowerEarningLimit = lel.pure[Explained]
}

object ClassThree {

    case class ClassThreeVague(
      finalDate: Option[LocalDate],
      weekRate: Money,
      hrpDate: Option[LocalDate],
      noOfWeeks: Int = 52,
      lel: Option[Money],
      qualifyingRate: Option[Money]
    ) {
      def confirm(year: Interval[LocalDate], fallbackLEL: Option[Money]) = ClassThree(
        finalDate,
        weekRate,
        hrpDate,
        noOfWeeks,
        (lel orElse fallbackLEL).getOrElse {
          throw new IllegalStateException(s"No LEL defined for $year")
        },
        qualifyingRate
      )
    }

}
