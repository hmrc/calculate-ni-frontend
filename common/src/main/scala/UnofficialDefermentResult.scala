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

import cats.instances.vector._
import eoi.Class1Band.{LELToET, _}

import scala.reflect.{ClassTag, classTag}

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

  implicit val c1bandOrder = new Ordering[Class1Band] {
    def compare(x: Class1Band, y: Class1Band): Int =
      entries.indexOf(x) compare entries.indexOf(y)
  }

  def fromString(in: String): Option[Class1Band] = in match {
    case "BelowLEL" => Some(BelowLEL)
    case "LELToET" => Some(LELToET) 
    case "LELToPT" => Some(LELToPT) 
    case "PTToUAP" => Some(PTToUAP) 
    case "PTToUEL" => Some(PTToUEL) 
    case "ETToUEL" => Some(ETToUEL) 
    case "UAPToUEL" => Some(UAPToUEL)
    case "AboveUEL" => Some(AboveUEL)
    case _ => None
  }
}

case class TaxYearBandLimits(
  limits: Map[String, BigDecimal],
  rates: Map[Class1Band, Map[Char, BigDecimal]]
) {
  val bands: List[eoi.Class1Band] = rates.keys.toList
}

case class BandAmount(band: Class1Band, amount: BigDecimal)

case class UnofficialDefermentRowInput(
  id: String,
  employer: String,
  category: Char,
  bandAmounts: List[BandAmount],
  employeeNICs: BigDecimal
)

case class UnofficialDefermentRowOutput(

  id: String,
  grossPay: BigDecimal,
  earningsInMainContributionBand: BigDecimal,
  mainContributionBandLabels: List[String],
  earningsOverUEL: BigDecimal,
  nicsNonCO: BigDecimal,
  ifNotUD: BigDecimal
)

case class UnofficialDefermentResult(
  taxYear: Int,
  config: TaxYearBandLimits,
  rows: List[UnofficialDefermentRowInput]
){

  def getBandRates(b: Class1Band) =
    config.rates.getOrElse(b, Map.empty)

  val nonCOAdditionalRate =
    getBandRates(AboveUEL).getOrElse('A', sys.error("Could not find additional rate for category A"))

  lazy val rowsOutput = rows.map{ row =>
    val (earningsInMainContributionBand, mainContributionBandLabels)  =
       row.bandAmounts.foldLeft(Zero -> List.empty[String]) { case (acc @ (sumAcc, labelAcc), curr) =>
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


    val nicsBelowUel: BigDecimal =
      row.bandAmounts.map { case BandAmount(band, amount) =>
        val rate = getBandRates(band).getOrElse(row.category, Zero)
        (rate * amount).roundNi
      }.sum


    val rateAboveUel =
      getBandRates(AboveUEL).getOrElse(
        row.category,
        sys.error(s"Could not find rate above UEL for category ${row.category}")
      )

    val earningsAboveUEL =
      Zero.max(((row.employeeNICs - nicsBelowUel)/rateAboveUel).roundNi)

    UnofficialDefermentRowOutput(
      row.id,
      row.bandAmounts.map(_.amount).sum + earningsAboveUEL,
      earningsInMainContributionBand,
      mainContributionBandLabels,
      earningsAboveUEL,
      calculateNICSNonCo(row, earningsAboveUEL),
      calculateIfNotUD(row, earningsAboveUEL)
    )
  }

  lazy val maxMainContributionEarnings: Explained[BigDecimal] = {
    taxYear match {
      case late if late >= 2016 =>
        val pt = config.limits("PT")
        val uel = config.limits("UEL")
        53*(uel - pt) gives
        "Step 1: (UEL - PT) x 53 weeks"
      case mid if mid >= 2009 =>
        val pt = config.limits("PT")
        val uap = config.limits("UAP")
        val uel = config.limits("UEL")
        53*((uel - uap)+(uap-pt) ) gives
        "Step 1: ((UEL - UAP) + (UAP - PT)) x 53 weeks"
      case early =>
        val et = config.limits("ET")
        val uel = config.limits("UEL")
        53*(uel - et) gives
        "Step 1: (UEL - ET) x 53 weeks"
    }
  }

  lazy val rateOnMaxContributionEarnings: BigDecimal = {
    def getRate(rates: Map[Char, BigDecimal]) =
      rates.get('A').getOrElse(sys.error(s"Could not find rate for category `A` for tax year $taxYear"))

    getRate(getBandRates{
      taxYear match {
        case late if late >= 2016 => PTToUEL
        case mid if mid >= 2009 => PTToUAP
        case early => ETToUEL
      }
    })
  }

  lazy val nicsOnMaxMainContributionEarnings: Explained[BigDecimal] =
    maxMainContributionEarnings.flatMap( earnings =>
      (rateOnMaxContributionEarnings * earnings).roundNi gives
        s"Step 2: $rateOnMaxContributionEarnings% of Step 1"
    )

  lazy val actualEarningsInMainContributionBand: Explained[BigDecimal] =
    rowsOutput.map(_.earningsInMainContributionBand).sum gives
      rowsOutput.headOption.map(r => s"Step 3: Sum of earnings ${r.mainContributionBandLabels.mkString(" and ")}")
        .getOrElse("")

  lazy val excessEarnings: Explained[BigDecimal] =
    Zero.max(actualEarningsInMainContributionBand.value - maxMainContributionEarnings.value) gives
      "Step 4: Subtract Step 3 - Step 1"

  lazy val nicsOnExcessEarnings: Explained[BigDecimal] =
    (nonCOAdditionalRate * excessEarnings.value).roundNi gives
      s"Step 5: Multiple Step 4 by $nonCOAdditionalRate% if positive (disregard if negative)"

  lazy val totalEarningsAboveUel: Explained[BigDecimal] =
    rowsOutput.map(_.earningsOverUEL).sum gives
      "Step 6: Total earnings above UEL"

  lazy val nicsOnTotalEarningsAboveUel =
    (nonCOAdditionalRate * totalEarningsAboveUel.value).roundNi gives
      s"Step 7: Multiple Step 6 by $nonCOAdditionalRate%"

  lazy val annualMax =
    nicsOnMaxMainContributionEarnings.value + nicsOnExcessEarnings.value + nicsOnTotalEarningsAboveUel.value gives
      "Step 8: Add Step 2, Step 5 and Step 7"

  lazy val liability = rowsOutput.map(_.nicsNonCO).sum

  lazy val difference = annualMax.value -liability

  lazy val ifNotUD = rowsOutput.map(_.ifNotUD).sum

  lazy val report: List[(String, BigDecimal)] =
    List(
      maxMainContributionEarnings,
      nicsOnMaxMainContributionEarnings,
      actualEarningsInMainContributionBand,
      excessEarnings,
      nicsOnExcessEarnings,
      totalEarningsAboveUel,
      nicsOnTotalEarningsAboveUel,
      annualMax,
  ).map(v => v.explain.headOption.getOrElse("") -> v.value)


  private def nonCONicsWithoutRebates(row: UnofficialDefermentRowInput, earningsAboveUEL: BigDecimal) = {
    val nicsBelowUel: List[BigDecimal] = row.bandAmounts.map { case BandAmount(band, amount) =>
      // use the non-contracted out rates
      val nonCOMainRate = getBandRates(band).getOrElse('A', Zero)

      (nonCOMainRate * amount).roundNi
    }
      .filterNot(_ < Zero)

    val nicsAboveUel = (nonCOAdditionalRate * earningsAboveUEL).roundNi
    nicsBelowUel.sum + nicsAboveUel
  }

  private def calculateNICSNonCo(row: UnofficialDefermentRowInput, earningsAboveUEL: BigDecimal) = {

    row.category match {
      case 'D' | 'F' =>
        nonCONicsWithoutRebates(row, earningsAboveUEL)

      case 'L' | 'S' =>
        val lelToEtAmount = row.bandAmounts
          .collectFirst{ case BandAmount(LELToET, amount) => amount }
          .getOrElse(sys.error("Could not find earnings between LEL and ET"))
        val lelToEtRate =
          getBandRates(LELToET).getOrElse(row.category, Zero)
        (row.employeeNICs + lelToEtAmount * lelToEtRate).roundNi


      case _ =>
        row.employeeNICs
    }
  }

  private def calculateIfNotUD(row: UnofficialDefermentRowInput, earningsAboveUEL: BigDecimal) = row.category match {
    case 'J' | 'L' | 'S' | 'Z' => nonCONicsWithoutRebates(row, earningsAboveUEL) - row.employeeNICs
    case _ => Zero
  }




}
