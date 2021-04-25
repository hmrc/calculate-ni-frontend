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
import spire.syntax.field._
import cats.syntax.applicative._
import cats.syntax.apply._
import spire.implicits._
import java.time.LocalDate

trait ClassTwoOrThree {
  def noOfWeeks: Int
  def rate: Money
  def lowerEarningLimit: Explained[Money]
  def qualifyingEarningsFactor: Explained[Money]
  def finalDate: Option[LocalDate]
  def hrpDate: Option[LocalDate]
}

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


case class ClassTwoAndThreeResult[A <: ClassTwoOrThree] protected[eoi] (
  on: LocalDate,
  year: A,
  paymentDate: LocalDate,
  earningsFactor: Money,
  otherRates: Map[Interval[LocalDate], A]
) {

  import year._

  def shortfall: Explained[Money] =  qualifyingEarningsFactor.flatMap { qr => 
    (qr - earningsFactor) gives s"shortfall = qualifyingRate - earningsFactor = $qr - $earningsFactor"
  }

  def numberOfContributions: Explained[Int] = for {
    sf        <- shortfall
    lel       <- lowerEarningLimit
    unrounded = sf / lel
    rounded   = unrounded.setScale(0, BigDecimal.RoundingMode.CEILING).toInt
    r         <- rounded gives 
      s"noContributions: ⌈shortfall / lel⌉ = ⌈$sf / $lel⌉ = ⌈$unrounded⌉"
  } yield r

  def finalDate: Explained[LocalDate] = (on, year).getFinalDate

  def higherProvisionsApplyOn: Explained[LocalDate] = (on, year).getHigherRateDate

  def higherRateApplies: Explained[Boolean] = 
    higherProvisionsApplyOn.flatMap { hrpDate => 
      (paymentDate >= hrpDate) gives s"higherRateApplies: $paymentDate ≥ $hrpDate"
    }

  def rate: Explained[Money] = higherRateApplies flatMap {
    case true =>
      val range = Interval.openLower(on, paymentDate)
      val (when, highest) = otherRates.toList
        .filter(_._1 intersects range)
        .sortBy(_._2.rate)
        .last
      highest.rate gives s"rate: HRP applies, $when gives highest rate in $range"
    case false => year.rate gives s"rate: normal (non-HRP)"
  }

  def totalDue: Explained[Money] = (
    numberOfContributions,
    rate
  ).tupled.flatMap{ case (n,r) =>
      (r * n) gives s"totalDue: noContributions * rate = $n * $r"
  }

}

