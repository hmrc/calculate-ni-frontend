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
import cats.syntax.traverse._
import cats.instances.list._
import cats.syntax.apply._
import spire.implicits._
import java.time.LocalDate


trait ClassTwoOrThree {
  def noOfWeeks: Int
  def rate: BigDecimal
  def lowerEarningLimit: Explained[BigDecimal]
  def qualifyingEarningsFactor: Explained[BigDecimal]
}

case class ClassTwo(
  weeklyRate: ClassTwoRates,
  smallEarningsException: Option[BigDecimal],
  hrpDate: Option[LocalDate],
  penaltyOn: Option[LocalDate],
  noOfWeeks: Int = 52,
  qualifyingRate: BigDecimal
) extends ClassTwoOrThree {
  def rate = weeklyRate.default
  def lowerEarningLimit = ((qualifyingRate + 50) / noOfWeeks) gives
    s"lowerEarningLimit: (qualifyingRate + 50) / noOfWeeks = ($qualifyingRate + 50) / $noOfWeeks"

  def qualifyingEarningsFactor: Explained[BigDecimal] = qualifyingRate.pure[Explained]
}

case class ClassThree(
  startWeek: Int,
  finalDate: LocalDate,
  weekRate: BigDecimal,
  noOfWeeks: Int = 52,
  lel: BigDecimal,
  qualifyingRate: Option[BigDecimal]
) extends ClassTwoOrThree {
  def rate = weekRate
  def qualifyingEarningsFactor: Explained[BigDecimal] = qualifyingRate match {
    case Some(r) => r.pure[Explained]
    case None =>
      (lel * noOfWeeks - 50) gives s"qualifyingRate: lel * noOfWeeks - 50 = $lel * $noOfWeeks - 50"
  }
    
  def lowerEarningLimit = lel.pure[Explained]
}


case class ClassTwoAndThreeResult[A <: ClassTwoOrThree](
  on: LocalDate,
  year: A,
  paymentDate: LocalDate,
  earningsFactor: BigDecimal,
  otherRates: Map[Interval[LocalDate], A]
) {

  import year._

  def shortfall: Explained[BigDecimal] =  qualifyingEarningsFactor.flatMap { qr => 
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

  def higherProvisionsApplyOn: Explained[LocalDate] = {
    val startOpt: Option[LocalDate] = year match {
      case c2: ClassTwo => c2.hrpDate
      case _ => None
    }

    startOpt match {
      case Some(hrp) => hrp gives "higherRateDate: from config"
      case None => on.plusYears(2) gives s"higherRateDate: start date ($on) + 2 years"
    }
  }

  def finalDate: Explained[LocalDate] = {
    val startOpt: Option[LocalDate] = year match {
      case c2: ClassTwo => c2.penaltyOn
      case _ => None
    }

    startOpt match {
      case Some(date) => date gives "finalDate: from config"
      case None => on.plusYears(6) gives s"finalDate: start date ($on) + 6 years"
    }
  }

  def higherRateApplies: Explained[Boolean] = 
    higherProvisionsApplyOn.flatMap { hrpDate => 
      (paymentDate >= hrpDate) gives s"higherRateApplies: $paymentDate >= $hrpDate"
    }

  def rate: Explained[BigDecimal] = higherRateApplies flatMap {
    case true =>
      val range = Interval.openLower(on, paymentDate)
      val (when, highest) = otherRates.toList
        .filter(_._1 intersects range)
        .sortBy(_._2.rate)
        .last
      highest.rate gives s"rate: HRP applies, $when gives highest rate in $range"
    case false => year.rate gives s"rate: normal (non-HRP)"
  }

  def totalDue: Explained[BigDecimal] = (
    numberOfContributions,
    rate
  ).tupled.flatMap{ case (n,r) =>
      (n * r) gives s"totalDue: noContributions * rate = $n * $r"
  }

}
