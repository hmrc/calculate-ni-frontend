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
    val earningsInMainContributionBand =
      row.bandAmounts.map{
        case BandAmount(LELToET, _) | BandAmount(BelowLEL, _) | BandAmount(LELToPT, _) => Zero
        case b => b.amount
      }.sum


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
        s"(UEL - PT) x 53 weeks  = ($uel - $pt) x 53"
      case mid if mid >= 2009 =>
        val pt = config.limits("PT")
        val uap = config.limits("UAP")
        val uel = config.limits("UEL")
        53*((uel - uap)+(uap-pt) ) gives
        s"((UEL - UAP) + (UAP - PT)) x 53 weeks = (($uel - $uap) + ($uap - $pt)) x 53"
      case early =>
        val et = config.limits("ET")
        val uel = config.limits("UEL")
        53*(uel - et) gives
        s"(UEL - ET) x 53 weeks = ($uel - $et) x 53"
    }
  }

  lazy val rateOnMaxContributionEarnings = {
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
        s"$rateOnMaxContributionEarnings * $earnings"
    )

  lazy val actualEarningsInMainContributionBand = rowsOutput.map(_.earningsInMainContributionBand).sum

  lazy val excessEarnings = Zero.max(actualEarningsInMainContributionBand - maxMainContributionEarnings.value)

  lazy val nicsOnExcessEarnings = (nonCOAdditionalRate * excessEarnings).roundNi

  lazy val totalEarningsAboveUel = rowsOutput.map(_.earningsOverUEL).sum

  lazy val nicsOnTotalEarningsAboveUel = (nonCOAdditionalRate * totalEarningsAboveUel).roundNi

  lazy val annualMax = nicsOnMaxMainContributionEarnings.value + nicsOnExcessEarnings + nicsOnTotalEarningsAboveUel

  lazy val liability = rowsOutput.map(_.nicsNonCO).sum

  lazy val difference = annualMax -liability

  lazy val ifNotUD = rowsOutput.map(_.ifNotUD).sum


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
          .collectFirst{
            case BandAmount(LELToET, amount) => amount
            case BandAmount(LELToPT, amount) => amount
          }
          .getOrElse(sys.error("Could not find earnings between LEL and ET or PT"))
        val lelToEtRate =
          getBandRates(LELToET).getOrElse(row.category, Zero).abs
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
