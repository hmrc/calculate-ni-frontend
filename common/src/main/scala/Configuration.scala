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

import java.time.LocalDate
import spire.implicits._
import spire.math.Interval

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
  * Source: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/882271/Table-a4.pdf
  * */
case class Configuration (
  categoryNames: Map[Char, String],
  data: Map[Interval[LocalDate], ConfigurationPeriod],
  interestOnLatePayment: Map[Interval[LocalDate], Percentage],
  interestOnRepayment: Map[Interval[LocalDate], Percentage]
){

  def mapValuesOpt[A](f: ConfigurationPeriod => Option[A]): Map[Interval[LocalDate], A] =
    data.mapValues(f).collect{ case (k,Some(v)) => (k,v) }

  lazy val classOne: Map[Interval[LocalDate], Map[String, RateDefinition]] =
    data.collect{
      case (y,ConfigurationPeriod(l,Some(c1bands),_,_,_,_)) =>
        y -> c1bands.map {case (k,v) =>
          val lowerCaseLimits = l.map {case (lk,lv) => lk.toLowerCase -> lv} 
          k -> v.confirmWith(k, lowerCaseLimits)
        }
    }

  lazy val classTwo: Map[Interval[LocalDate], ClassTwo] =
    data.collect{
      case (y,ConfigurationPeriod(l,_,Some(c2),_,_,_)) =>
        val lowerCaseLimits = l.map {case (lk,lv) => lk.toLowerCase -> lv} 
        y -> c2.confirm(y, lowerCaseLimits.get("lel").map(_.effectiveWeek))
    }

  lazy val classThree: Map[Interval[LocalDate], ClassThree] =
    data.collect{
      case (y,ConfigurationPeriod(l,_,_,Some(c3),_,_)) =>
        val lowerCaseLimits = l.map {case (lk,lv) => lk.toLowerCase -> lv} 
        y -> c3.confirm(y, lowerCaseLimits.get("lel").map(_.effectiveWeek))
    }

  lazy val classFour: Map[Interval[LocalDate], ClassFour] =
    mapValuesOpt(_.classFour)

  lazy val unofficialDeferment: Map[Interval[LocalDate], TaxYearBandLimits] =
    mapValuesOpt{x => x.unofficialDeferment.map(_.withFallbackLimits(x.limits)) }

  def calculateClassTwo(
    on: LocalDate,
    paymentDate: LocalDate,
    earningsFactor: Money
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
    earningsFactor: Money
  ) = {
    val (interval, c3taxYear) = classThree.findAt(on).getOrElse(
      throw new IllegalStateException(s"No C3 band defined for $on")
    )

    ClassTwoAndThreeResult[ClassThree](
      interval.lowerValue.get,
      c3taxYear,
      paymentDate,
      earningsFactor,
      classThree
    )
  }


  def calculateClassOne(
    on: LocalDate,
    rows: List[ClassOneRowInput],
    netPaid: Money = Money.Zero,
    employeePaid: Money = Money.Zero
  ) = ClassOneResult(on, classOne.at(on).getOrElse(Map.empty), rows, netPaid, employeePaid)

  def calculateDirectors(
                        from: LocalDate,
                        to: LocalDate,
                        rows: List[DirectorsRowInput],
                        appropriatePersonalPensionScheme: Option[Boolean],
                        netPaid: Money = Money.Zero,
                        employeePaid: Money = Money.Zero
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

  def calculateUnofficialDeferment(
    taxYear: Int,
    config: TaxYearBandLimits,
    rows: List[UnofficialDefermentRowInput]
  ) = UnofficialDefermentResult(
    taxYear,
    config,
    rows
  )

  def calculateUnofficialDeferment(
    taxYear: Int,
    rows: List[UnofficialDefermentRowInput]
  ) = UnofficialDefermentResult(
    taxYear,
    unofficialDeferment(TaxYear(taxYear).asInterval),
    rows
  )

  def calculateInterestOnLatePayment(
    amount: Money,
    taxYear: TaxYear,
    remission: Option[Interval[LocalDate]],
    to: LocalDate = LocalDate.now
  ) = InterestResult(
    interestOnLatePayment,
    LocalDate.of(taxYear.succ.start.getYear, 4, 19),
    to,
    amount,
    366,
    remission
  )

  def calculateInterestOnRepayment(
    amount: Money,
    taxYear: TaxYear,
    paymentDate: LocalDate = LocalDate.now
  ) = {
    val point = LocalDate.of(taxYear.succ.start.getYear, 4, 19)
    InterestResult(
      interestOnRepayment,
      if (paymentDate > point) paymentDate.plusDays(1) else point,
      LocalDate.now,
      amount,
      365,
      None
    )
  }

}
