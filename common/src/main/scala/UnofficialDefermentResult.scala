/*
 * Copyright 2024 HM Revenue & Customs
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

import eoi.Class1Band._
import cats.syntax.order._

sealed trait Class1Band extends Product with Serializable

object Class1Band {
  case object BelowLEL extends Class1Band
  case object LELToET extends Class1Band
  case object LELToPT extends Class1Band
  case object PTToUAP extends Class1Band
  case object PTToUEL extends Class1Band
  case object ETToUEL extends Class1Band
  case object UAPToUEL extends Class1Band
  case object AboveUEL extends Class1Band

  val entries = Vector(
    BelowLEL,
    LELToET,
    LELToPT,
    PTToUAP,
    PTToUEL,
    ETToUEL,
    UAPToUEL,
    AboveUEL
  )

  implicit val c1bandOrder: Ordering[Class1Band] = new Ordering[Class1Band] {
    def compare(x: Class1Band, y: Class1Band): Int =
      entries.indexOf(x) compare entries.indexOf(y)
  }

  def fromString(in: String): Option[Class1Band] =
    entries.collectFirst{
      case x if x.toString == in => x
    }
}

case class TaxYearBandLimits(
  limits: Map[String, Money] = Map.empty,
  rates: Map[Class1Band, Map[Char, Percentage]]
) {
  val bands: List[eoi.Class1Band] = rates.keys.toList

  def withFallbackLimits(fb: Map[String, Limit]): TaxYearBandLimits = {
    if (limits.nonEmpty) this
    else this.copy(limits = fb.view.mapValues(_.effectiveWeek).toMap)
  }

}

case class BandAmount(band: Class1Band, amount: Money)

case class UnofficialDefermentRowInput(
  id: String,
  employer: String,
  category: Char,
  bandAmounts: List[BandAmount],
  employeeNICs: Money
)

case class UnofficialDefermentRowOutput(
  id: String,
  grossPay: Money,
  earningsInMainContributionBand: Money,
  mainContributionBandLabels: List[String],
  earningsOverUEL: Money,
  nicsNonCO: Money,
  ifNotUD: Money,
  employeeNICs: Money
)

case class UnofficialDefermentResult(
  taxYear: Int,
  config: TaxYearBandLimits,
  rows: List[UnofficialDefermentRowInput]
){

  import UnofficialDefermentResult._

  def getBandRates(b: Class1Band) =
    config.rates.getOrElse(b, Map.empty)

  lazy val nonCOAdditionalRate =
    getBandRates(AboveUEL).getOrElse('A', sys.error("Could not find additional rate for category A"))

  lazy val rowsOutput = rows.map{ row =>
    val (earningsInMainContributionBand, mainContributionBandLabels)  =
       row.bandAmounts.foldLeft(Money.Zero -> List.empty[String]) { case (acc @ (sumAcc, labelAcc), curr) =>
        val bandLabel = curr.band match {
          case BelowLEL |  LELToET | LELToPT | AboveUEL => None
          case PTToUAP => Some("PT - UAP")
          case PTToUEL => Some("PT - UEL")
          case ETToUEL => Some("ET - UEL")
          case UAPToUEL => Some("UAP - UEL")
        }

        bandLabel.fold(acc){ label =>
          (curr.amount + sumAcc) -> (label :: labelAcc)
        }
      }


    val nicsBelowUel: Money =
      row.bandAmounts.map { case BandAmount(band, amount) =>
        val rate = getBandRates(band).getOrElse(row.category, Percentage.Zero)
        (rate * amount).roundNi
      }.sum


    val rateAboveUel =
      getBandRates(AboveUEL).getOrElse(
        row.category,
        sys.error(s"Could not find rate above UEL for category ${row.category}")
      )

    val earningsAboveUEL =
      Money.Zero.max(((row.employeeNICs - nicsBelowUel)/rateAboveUel).roundNi)

    UnofficialDefermentRowOutput(
      row.id,
      row.bandAmounts.map(_.amount).sum + earningsAboveUEL,
      earningsInMainContributionBand,
      mainContributionBandLabels,
      earningsAboveUEL,
      calculateNICSNonCo(row, earningsAboveUEL),
      calculateIfNotUD(row, earningsAboveUEL),
      row.employeeNICs
    )
  }

  lazy val maxMainContributionEarnings: ReportStep = {
    val (value, msg) = taxYear match {
      case late if late >= 2016 =>
        val pt = config.limits("PT")
        val uel = config.limits("UEL")
        (uel - pt)*53 -> "Step 1: (UEL - PT) x 53 weeks"

      case mid if mid >= 2009 =>
        val pt = config.limits("PT")
        val uap = config.limits("UAP")
        val uel = config.limits("UEL")
        ((uel - uap)+(uap-pt) )*53 -> "Step 1: ((UEL - UAP) + (UAP - PT)) x 53 weeks"

      case early =>
        val et = config.limits("ET")
        val uel = config.limits("UEL")
        (uel - et)*53 -> "Step 1: (UEL - ET) x 53 weeks"
    }
    ReportStep(value, msg)
  }

  val rateOnMaxContributionEarnings: Percentage = {
    def getRate(rates: Map[Char, Percentage]) =
      rates.get('A').getOrElse(sys.error(s"Could not find rate for category `A` for tax year $taxYear"))

    getRate(getBandRates{
      taxYear match {
        case late if late >= 2016 => PTToUEL
        case mid if mid >= 2009 => PTToUAP
        case early => ETToUEL
      }
    })
  }

  lazy val nicsOnMaxMainContributionEarnings: ReportStep =
    ReportStep(
      (rateOnMaxContributionEarnings * maxMainContributionEarnings.value).roundNi,
      s"Step 2: ${rateOnMaxContributionEarnings} of Step 1"
  )

  lazy val actualEarningsInMainContributionBand: ReportStep =
    ReportStep(
      rowsOutput.map(_.earningsInMainContributionBand).sum,
      rowsOutput.headOption.map(r => s"Step 3: Sum of earnings ${r.mainContributionBandLabels.mkString(" and ")}")
        .getOrElse("")
    )

  lazy val excessEarnings: ReportStep =
    ReportStep(
    Money.Zero.max(actualEarningsInMainContributionBand.value - maxMainContributionEarnings.value),
      "Step 4: Subtract Step 3 - Step 1"
    )

  lazy val nicsOnExcessEarnings: ReportStep =
    ReportStep(
      (nonCOAdditionalRate * excessEarnings.value).roundNi,
      s"Step 5: Multiply Step 4 by ${nonCOAdditionalRate} if positive (disregard if negative)"
    )

  lazy val totalEarningsAboveUel: ReportStep =
    ReportStep(
      rowsOutput.map(_.earningsOverUEL).sum,
      "Step 6: Total earnings above UEL"
    )

  lazy val nicsOnTotalEarningsAboveUel: ReportStep =
    ReportStep(
    (nonCOAdditionalRate * totalEarningsAboveUel.value).roundNi,
      s"Step 7: Multiply Step 6 by ${nonCOAdditionalRate}"
    )

  lazy val annualMax: ReportStep =
    ReportStep(
    nicsOnTotalEarningsAboveUel.value + nicsOnExcessEarnings.value + nicsOnMaxMainContributionEarnings.value,
      "Step 8: Add Step 2, Step 5 and Step 7"
    )

  lazy val liability = rowsOutput.map(_.nicsNonCO).sum

  lazy val difference = if(rowsOutput.map(_.employeeNICs).sum == Money.Zero) Money.Zero else annualMax.value -liability

  lazy val ifNotUD = rowsOutput.map(_.ifNotUD).sum

  lazy val report: List[(String, Money)] =
    List(
      maxMainContributionEarnings,
      nicsOnMaxMainContributionEarnings,
      actualEarningsInMainContributionBand,
      excessEarnings,
      nicsOnExcessEarnings,
      totalEarningsAboveUel,
      nicsOnTotalEarningsAboveUel,
      annualMax,
  ).map(r => r.msg -> r.value)


  private def nonCONicsWithoutRebates(row: UnofficialDefermentRowInput, earningsAboveUEL: Money) = {
    val nicsBelowUel: List[Money] = row.bandAmounts.map { case BandAmount(band, amount) =>
      // use the non-contracted out rates
      val nonCOMainRate = getBandRates(band).getOrElse('A', Percentage.Zero)

      (nonCOMainRate * amount).roundNi
    }
      .filterNot(_ < Money.Zero)

    val nicsAboveUel = (nonCOAdditionalRate * earningsAboveUEL).roundNi
    nicsBelowUel.sum + nicsAboveUel
  }

  private def calculateNICSNonCo(row: UnofficialDefermentRowInput, earningsAboveUEL: Money) = {

    row.category match {
      case 'D' | 'F' =>
        nonCONicsWithoutRebates(row, earningsAboveUEL)

      case 'L' | 'S' =>
        val (band, rebateableAmount) = row.bandAmounts
          .collectFirst{
            case BandAmount(LELToET, amount) => LELToET -> amount
            case BandAmount(LELToPT, amount) => LELToPT -> amount
          }
          .getOrElse(sys.error("Could not find earnings in rebate band"))
        val rebateRate =
          getBandRates(band).getOrElse(row.category, Percentage.Zero).abs
        (row.employeeNICs + rebateableAmount * rebateRate).roundNi


      case _ =>
        row.employeeNICs
    }
  }

  private def calculateIfNotUD(row: UnofficialDefermentRowInput, earningsAboveUEL: Money) = row.category match {
    case 'J' | 'L' | 'S' | 'Z' => nonCONicsWithoutRebates(row, earningsAboveUEL) - row.employeeNICs
    case _ => Money.Zero
  }




}


object UnofficialDefermentResult {

  case class ReportStep(val value: Money, msg: String)

}
