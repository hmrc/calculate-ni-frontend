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

case class ClassTwoAndThreeResult[A <: ClassTwoOrThree](
  on: LocalDate,
  year: A,
  paymentDate: LocalDate,
  earningsFactor: BigDecimal,
  otherRates: Map[Interval[LocalDate], A],
) {

  import year._

  def numberOfContributions: Explained[Int] = {
    val unrounded = (((qualifyingRate - earningsFactor) / earningsFactor) * noOfWeeks)
    val rounded = unrounded.setScale(0, BigDecimal.RoundingMode.CEILING).toInt
    rounded gives {
      "noContributions: ⌈((qualRate - ef) / ef) * noOfWeeks⌉ = " ++
      s"⌈(($qualifyingRate - $earningsFactor) / $earningsFactor) * $noOfWeeks⌉ = " ++
      s"⌈$unrounded⌉"
    }
  }

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
      case None => on.plusYears(4) gives s"finalDate: start date ($on) + 4 years"
    }
  }

  def higherRateApplies: Explained[Boolean] = 
    higherProvisionsApplyOn.flatMap { hrpDate => 
      (paymentDate >= hrpDate) gives s"higherRateApplies: $paymentDate >= $hrpDate"
    }

  def rate: Explained[BigDecimal] = higherRateApplies flatMap {
    case true => otherRates.at(paymentDate).getOrElse(
      throw new IllegalStateException(s"No band defined for $paymentDate")
    ).rate gives s"rate: for $paymentDate, due to higher rate"
    case false => year.rate gives s"rate: normal (non-HRP)"
  }

  def totalDue: Explained[BigDecimal] = (
    numberOfContributions,
    rate
  ).tupled.flatMap{ case (n,r) =>
      (n * r) gives s"totalDue: noContributions * rate = $n * $r"
  }

}
