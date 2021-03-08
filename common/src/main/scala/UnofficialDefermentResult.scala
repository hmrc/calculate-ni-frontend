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

import cats.Id
import cats.data.WriterT
import cats.instances.vector._
import cats.instances.list._
import cats.syntax.applicative._
import cats.syntax.traverse._
import eoi.Class1Band.{LELToET, _}
import eoi.Class1BandLimit._

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

}

sealed trait Class1BandLimit extends Product with Serializable {

  val value: BigDecimal

}

object Class1BandLimit {


  case class LEL(value: BigDecimal) extends Class1BandLimit

  case class PT(value: BigDecimal) extends Class1BandLimit

  case class ET(value: BigDecimal) extends Class1BandLimit

  case class UAP(value: BigDecimal) extends Class1BandLimit

  case class UEL(value: BigDecimal) extends Class1BandLimit

}


sealed trait TaxYearBandLimits {

  val bands: List[Class1Band]

  val bandLimits: List[Class1BandLimit]

  val rates: Map[Class1Band, Map[Char, BigDecimal]]

}

object TaxYearBandLimits {

  case class AfterOrOn2003(
                            lel: LEL,
                            et: ET,
                            uel: UEL,
                            rates: Map[Class1Band, Map[Char, BigDecimal]]
                          ) extends TaxYearBandLimits {

    val bands: List[Class1Band] =
      List(
        BelowLEL,
        LELToET,
        ETToUEL
      )

    val bandLimits = List(lel, et, uel)

  }


  case class AfterOrOn2009(
                            lel: LEL,
                            pt: PT,
                            uap: UAP,
                            uel: UEL,
                            rates: Map[Class1Band, Map[Char, BigDecimal]]
                          )  extends TaxYearBandLimits {
    val bands: List[Class1Band] =
      List(
        BelowLEL,
        LELToPT,
        PTToUAP,
        UAPToUEL
      )

    val bandLimits = List(lel, pt, uap, uel)

  }

  case class AfterOrOn2016(
                            lel: LEL,
                            pt: PT,
                            uel: UEL,
                            rates: Map[Class1Band, Map[Char, BigDecimal]]
                          ) extends TaxYearBandLimits {
    val bands: List[Class1Band] =
      List(
        BelowLEL,
        LELToPT,
        PTToUEL
      )

    val bandLimits = List(lel, pt, uel)

  }

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

case class UnofficialDefermentResult(taxYear: Int,
                                     config: TaxYearBandLimits,
                                     rows: List[UnofficialDefermentRowInput],
                                     userDefinedBandLimits: List[Class1BandLimit]){


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


    val nicsBelowUel: Explained[BigDecimal] =
      row.bandAmounts.map { case BandAmount(band, amount) =>
        val rate = getBandRates(band).getOrElse(row.category, Zero)
        (rate * amount).roundNi gives
          s"row ${row.id} cat ${row.category}: NICs on band $band = rate x bandAmount = $rate x $amount"
      }
        .sequence
        .flatMap(
          _.sum gives
            s"row ${row.id}: total NICs below UEL"
        )


    val rateAboveUel =
      getBandRates(AboveUEL).getOrElse(
        row.category,
        sys.error(s"Could not find rate above UEL for category ${row.category}")
      )

    val earningsAboveUEL =
      nicsBelowUel.flatMap{ n =>
        Zero.max(((row.employeeNICs - n)/rateAboveUel).roundNi) gives
          s"row ${row.id}: earnings above UEL = max(0, (employee NICS - NICs below UEL)/(rate above UEL)) = " +
            s"max(0, (${row.employeeNICs} - $n)/$rateAboveUel)"
      }

    UnofficialDefermentRowOutput(
      row.id,
      row.bandAmounts.map(_.amount).sum + earningsAboveUEL.value,
      earningsInMainContributionBand,
      earningsAboveUEL.value,
      calculateNICSNonCo(row, earningsAboveUEL.value).value,
      calculateIfNotUD(row, earningsAboveUEL.value).value
    )
  }

  lazy val maxMainContributionEarnings: Explained[BigDecimal] = {
    def findUserDefinedBandLimit[B <: Class1BandLimit : ClassTag] =
      userDefinedBandLimits.collectFirst{ case b: B => b }.getOrElse(sys.error(s"Could not find ${classTag[B].runtimeClass.getSimpleName}")).value

    config match {
      case _: TaxYearBandLimits.AfterOrOn2003 =>
        val et = findUserDefinedBandLimit[ET]
        val uel = findUserDefinedBandLimit[UEL]
        53*(uel - et) gives
          s"(UEL - ET) x 53 weeks = ($uel - $et) x 53"

      case _ : TaxYearBandLimits.AfterOrOn2009 =>
        val pt = findUserDefinedBandLimit[PT]
        val uap = findUserDefinedBandLimit[UAP]
        val uel = findUserDefinedBandLimit[UEL]
        53*((uel - uap)+(uap-pt) ) gives
          s"((UEL - UAP) + (UAP - PT)) x 53 weeks = (($uel - $uap) + ($uap - $pt)) x 53"

      case _: TaxYearBandLimits.AfterOrOn2016 =>
        val pt = findUserDefinedBandLimit[PT]
        val uel = findUserDefinedBandLimit[UEL]
        53*(uel - pt) gives
          s"(UEL - PT) x 53 weeks  = ($uel - $pt) x 53"
    }
  }

  lazy val rateOnMaxContributionEarnings = {
    def getRate(rates: Map[Char, BigDecimal]) =
      rates.get('A').getOrElse(sys.error(s"Could not find rate for category `A` for tax year $taxYear"))


    config match {
      case _: TaxYearBandLimits.AfterOrOn2003 =>
        getRate(getBandRates(ETToUEL))

      case _: TaxYearBandLimits.AfterOrOn2009 =>
        getRate(getBandRates(PTToUAP))

      case _: TaxYearBandLimits.AfterOrOn2016 =>
        getRate(getBandRates(PTToUEL))
    }
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
    val nicsBelowUel: Explained[List[BigDecimal]] = row.bandAmounts.map { case BandAmount(band, amount) =>
      // use the non-contracted out rates
      val nonCOMainRate = getBandRates(band).getOrElse('A', Zero)

      (nonCOMainRate * amount).roundNi gives
        s"non-contracted out rate x earnings in $band = $nonCOMainRate x $amount"
    }
      .filterNot(_.value < Zero)
      .sequence


    for{
      belowUel <- nicsBelowUel
      aboveUel <- (nonCOAdditionalRate * earningsAboveUEL).roundNi gives
        s"non-contracted out rate x earnings above UEL = $nonCOAdditionalRate + $earningsAboveUEL"
      total <- (belowUel.sum + aboveUel) gives
        "NICs non-CO = sum of NICs using non-CO rate"
    } yield total
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
        (row.employeeNICs + lelToEtAmount * lelToEtRate).roundNi gives
          "NICs non-CO = employee NICS + earnings in ET-LEL x ET-LEL rebate rate =" +
            s"${row.employeeNICs} + $lelToEtAmount x $lelToEtRate"


      case _ =>
        row.employeeNICs.pure[Explained]
    }
  }

  private def calculateIfNotUD(row: UnofficialDefermentRowInput, earningsAboveUEL: BigDecimal) = row.category match {
    case 'J' | 'L' | 'S' | 'Z' =>
      nonCONicsWithoutRebates(row, earningsAboveUEL).flatMap( n =>
        (n - row.employeeNICs) gives s"$n - employee NICs = $n - ${row.employeeNICs}"
      )

    case _ =>
      Zero.pure[Explained]
  }




}
