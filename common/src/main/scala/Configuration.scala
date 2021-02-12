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

import main.scala.{DirectorsResult, DirectorsRowInput}

import java.time.LocalDate
import spire.implicits._
import spire.math.Interval

case class RateDefinition(
  year: Interval[BigDecimal],
  month: Option[Interval[BigDecimal]],
  week: Option[Interval[BigDecimal]],
  fourWeek: Option[Interval[BigDecimal]],
  employee: Map[Char, BigDecimal] = Map.empty,
  employer: Map[Char, BigDecimal] = Map.empty,
  contractedOutStandardRate: Option[Boolean] = None,
  trigger: Bands = Bands.all
) {
  def effectiveYear = year
  def effectiveMonth = month.getOrElse(year / 12)
  def effectiveWeek = week.getOrElse(year / 52)
  def effectiveFourWeek = fourWeek.getOrElse(year / 13)
}

case class ClassTwoRates(
  default: BigDecimal,
  fishermen: Option[BigDecimal],
  voluntary: Option[BigDecimal]
)

trait ClassTwoOrThree {
  def noOfWeeks: Int
  def rate: BigDecimal
  def qualifyingRate: BigDecimal
}

case class ClassTwo(
  weeklyRate: ClassTwoRates,
  smallEarningsException: Option[BigDecimal],
  qualifyingRate: BigDecimal,
  hrpDate: Option[LocalDate],
  penaltyOn: Option[LocalDate],
  noOfWeeks: Int = 52
) extends ClassTwoOrThree {
  def rate = weeklyRate.default
}

case class ClassThree(
  qualifyingRate: BigDecimal,
  lel: String,
  startWeek: Int,
  finalDate: LocalDate,
  weekRate: BigDecimal,
  noOfWeeks: Int
) extends ClassTwoOrThree {
  def rate = weekRate
}

case class ClassFour(
  lowerLimit: BigDecimal,
  upperLimit: BigDecimal,
  mainRate: BigDecimal,
  upperRate: BigDecimal = 0
)


/** Class 1 NICs are earnings related contributions paid by employed
  * earners and their employers. Liability starts at age 16 and ends
  * at Sate Pension age for earners; employers continue to pay beyond
  * State Pension age. Up to April 2016 the contributions were paid at
  * either the contracted-out rate or the not contracted-out rate.
  * The contracted-out rate, abolished in April 2016, was payable
  * payable [sic] only where the employee was a member of a contracted-out
  * occupational scheme in place of State Second Pension (formerly
  * SERPS). Class 1 NICs are collected by HMRC along with income tax
  * under the Pay As You Earn (PAYE) scheme.
  *
  * Class 1A NICs are paid only by employers on the value of most
  * taxable benefits-in-kind provided to employees, such as private
  * use of company cars and fuel, private medical insurance,
  * accommodation and loan benefits.  They do not give any benefit
  * rights.
  *
  * Class 1B NICs were introduced on 6 April 1999.  Like Class 1A they
  * are also paid only by employers and cover PAYE Settlement
  * Agreements (PSA) under which employers agree to meet the income
  * tax liability arising on a restricted range of benefits.  Class 1B
  * is payable on the value of the items included in the PSA that
  * would otherwise attract a Class 1 or Class 1A liability and the
  * value of the income tax met by the employer.  They do not give any
  * benefit rights.
  *
  * Class 2 contributions are a flat rate weekly liability payable by
  * all self-employed people over 16 (up to State Pension age) with
  * profits above the Small Profits Threshold. Self-employed people
  * with profits below the Small Profits Threshold may pay Class 2
  * contributions voluntary. Voluntary payments of Class 2 NICs are
  * typically collected through self-assessment but can usually be
  * paid up to six years after the tax year.  Class 4 NICs may also
  * have to be paid by the self-employed if their profits for the year
  * are over the lower profits limit (see below).
  *
  * Class 3 NICs may be paid voluntarily by people aged 16 and over
  * (but below State Pension age) to help them qualify for State
  * Pension if their contribution record would not otherwise be
  * sufficient.  Contributions are flat rate and can be paid up to six
  * years after the year in which they are due.
  *
  * Class 4 NICS are paid by the self-employed whose profits are above
  * the lower profits limit.  They are profit related and do not count
  * for any benefits themselves.
  *
  * Source: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/882271/Table-a4.pdf
  * */
case class Configuration(
  categoryNames: Map[Char, String] = Map(
   'A' -> "Regular",
   'B' -> "Married women and widows",
   'C' -> "Pension age",
   'J' -> "Deferred",
   'H' -> "Apprentice under 25",
   'M' -> "Under 21",
   'Z' -> "Deferred and under 21",
   'X' -> "Exempt"
  ),
  classOne: Map[Interval[LocalDate], Map[String, RateDefinition]],
  classOneAB: Map[Interval[LocalDate], BigDecimal],
  classTwo: Map[Interval[LocalDate], ClassTwo],
  classThree: Map[Interval[LocalDate], ClassThree],
  classFour: Map[Interval[LocalDate], ClassFour]
) {

  def proRataRatio(from: LocalDate, to: LocalDate): Option[BigDecimal] = {
    import spire.math.interval._

    def fromBound[A](in: Bound[A]): Option[A] = in match {
      case Open(a) => Some(a)
      case Closed(a) => Some(a)
      case _ => None
    }

    def intervalSizeDays(in: Interval[LocalDate]): Option[BigDecimal] = for {
      l <- fromBound(in.lowerBound)
      h <- fromBound(in.upperBound)
    } yield BigDecimal(h.toEpochDay - l.toEpochDay)

    for {
      taxYear <- classOne.keys.find(_.contains(from))
      total <- intervalSizeDays(taxYear)
      partial <- intervalSizeDays(Interval.closed(from, to))
    } yield (partial / total)
  }

  def calculateClassOneAAndB(
    on: LocalDate,
    amount: BigDecimal
  ): Option[BigDecimal] = classOneAB.at(on).map(amount * _)

  def calculateClassThree(
    on: LocalDate,
    numberOfWeeks: Int
  ): Option[BigDecimal] = ??? // classThree.at(on).map(_ * numberOfWeeks)

  def calculateClassFour(
    on: LocalDate,
    amount: BigDecimal
  ): Option[(BigDecimal,BigDecimal)] =
    classFour.at(on).map{ f =>
      val lowerBand = Interval.closed(f.lowerLimit, f.upperLimit)
      val upperBand = Interval.above(f.upperLimit)
      (
        amount.inBand(lowerBand) * f.mainRate,
        amount.inBand(upperBand) * f.upperRate
      )
    }

  def calculateClassTwo(
    on: LocalDate,
    paymentDate: LocalDate,
    earningsFactor: BigDecimal
  ) = ClassTwoAndThreeResult[ClassTwo](
    on,
    classTwo.at(on).getOrElse(
      throw new IllegalStateException(s"No C2 band defined for $on")
    ),
    paymentDate,
    earningsFactor,
    classTwo
  )

  def calculateClassThree(
    on: LocalDate,
    paymentDate: LocalDate,
    earningsFactor: BigDecimal
  ) = ClassTwoAndThreeResult[ClassThree](
    on,
    classThree.at(on).getOrElse(
      throw new IllegalStateException(s"No C3 band defined for $on")
    ),
    paymentDate,
    earningsFactor,
    classThree
  )

  def calculateClassOne(
    on: LocalDate,
    rows: List[ClassOneRowInput],
    netPaid: BigDecimal = Zero,
    employeePaid: BigDecimal = Zero
  ) = ClassOneResult(on, classOne.at(on).getOrElse(Map.empty), rows, netPaid, employeePaid)

  def calculateDirectors(
                        from: LocalDate,
                        to: LocalDate,
                        rows: List[DirectorsRowInput],
                        appropriatePersonalPensionScheme: Option[Boolean],
                        netPaid: BigDecimal = Zero,
                        employeePaid: BigDecimal = Zero
                        ) =
    DirectorsResult(
      from,
      to,
      classOne.at(from).getOrElse(throw new IllegalStateException(s"No C1 config defined for $from")),
      rows,
      appropriatePersonalPensionScheme,
      netPaid,
      employeePaid
    )

}
