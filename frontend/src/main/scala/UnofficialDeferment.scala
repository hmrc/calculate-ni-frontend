package eoi
package frontend

import scala.scalajs.js
import eoi.frontend.Class1BandAmount._
import eoi.frontend.Class1BandLimit._
import eoi.frontend.TaxYearBandLimits._


import scala.scalajs.js
import js.JSConverters._
import scala.scalajs.js.annotation.JSExportTopLevel

class UnofficialDeferment() extends js.Object {

  val config: Map[Int, TaxYearBandLimits] =
    (2003 to 2020).toList.map{ year =>
      val bandLimits = if(year >= 2016)
        AfterOrOn2016(LEL(112), PT(155), UEL(827))
      else if(year >= 2008)
        AfterOrOn2008(LEL(95), PT(110), UAP(770), UEL(844))
      else
        AfterOrOn2003(LEL(87), ET(100), UEL(670))

      year -> bandLimits
    }.toMap

  def calculate(
     taxYear: js.Date,
     rows: js.Array[UnofficialDefermentRow],
     userDefinedBandLimits: js.Array[UserDefinedBand]
  ) = new js.Object {
    val annualMax: Int = 15880
    val liability: Int = 2340
    val difference: Int = 8442
    val ifNotUD: Int = 0
    val resultRows: js.Array[scala.scalajs.js.Object] = rows.map { r: UnofficialDefermentRow =>
      new js.Object {
        val id: String = r.id
        val gross: Double = 100
        val overUel: Double = 25
        val nicsNonCo: Double = 35.32
        val ifNotUd: Double = 23.11 // calculate from row contents
      }
    }
  }

  def getTaxYears: js.Array[String] =
    config.keys.map(_.toString).toJSArray

  def getBandInputNames(taxYear: Int) = {
    val taxYearBands =  config.get(taxYear).getOrElse(
      sys.error(s"Could not find config for tax year $taxYear")
    )

    taxYearBands.bandAmounts.toJSArray.map{ band =>
      new js.Object {
        val label = band.toLabel
      }
    }

  }

  def getBandsForTaxYear(taxYear: Int): js.Array[scala.scalajs.js.Object] = {
    val taxYearBands =  config.get(taxYear).getOrElse(
      sys.error(s"Could not find config for tax year $taxYear")
    )

    taxYearBands.bandLimits.toJSArray.map{ band =>
      new js.Object {
        val label = band.toLabel
        val amount = band.value
      }
    }
  }
}

@JSExportTopLevel("UnofficialDefermentRow")
case class UnofficialDefermentRow(
                                   id: String,
                                   employer: String,
                                   category: String,
                                   bands: js.Array[RequestBand],
                                   employeeNICs: Double
)

@JSExportTopLevel("UnofficialDefermentResultRow")
case class UnofficialDefermentResultRow(
  id: String,
  gross: Double,
  overUel: Double,
  nicsNonCo: Double,
  ifNotUd: Double
)

case class RequestBand(
  label: String,
  value: Double
)

case class UserDefinedBand(
  name: String,
  label: String,
  limit: Double
)

sealed trait Class1BandLimit extends Product with Serializable {

  val value: Double

  def toLabel: String = this match {
    case _: LEL  => "Lower earning limit"
    case _: PT =>   "Primary threshold"
    case _: ET =>   "Earning threshold"
    case _: UAP  => "Upper accrual point"
    case _: UEL  => "Upper earning limit"
  }

}

object Class1BandLimit {

  def fromLabel(label: String, amount: Double) = label match {
   case "Lower earning limit"         => LEL(amount)
   case "Primary threshold"           => PT(amount)
   case "Earning threshold"           => ET(amount)
   case "Upper accrual point"         => UAP(amount)
   case "Upper earning limit"         => UEL(amount)
   case other                         => sys.error(s"Could not understand label $other")
  }

  case class LEL(value: Double) extends Class1BandLimit

  case class PT(value: Double) extends Class1BandLimit

  case class ET(value: Double) extends Class1BandLimit

  case class UAP(value: Double) extends Class1BandLimit

  case class UEL(value: Double) extends Class1BandLimit

}

sealed trait Class1BandAmount extends Product with Serializable {

  def toLabel: String = this match {
    case _: BelowLEL => "LEL"
    case _: LELToET =>  "LEL - ET"
    case _: LELToPT =>  "LEL - PT"
    case _: PTToUAP =>  "PT - UAP"
    case _: PTToUEL =>  "PT - UEL"
    case _: ETToUEL =>  "ET - UEL"
    case _: UAPToUEL => "UAP - UEL"
  }

  def fromLabel(label: String, amount: Double) = label match {
    case "LEL" => BelowLEL(amount)
    case  "LEL - ET" => LELToET(amount)
    case "LEL - PT" => LELToPT(amount)
    case "PT - UAP" => PTToUAP(amount)
    case "PT - UEL" => PTToUEL(amount)
    case "ET - UEL" => ETToUEL(amount)
    case "UAP - UEL" => UAPToUEL(amount)
    case other       => sys.error(s"Could not understand label $other")
  }

}

object Class1BandAmount {

  case class BelowLEL(amount: Double) extends Class1BandAmount

  case class LELToET(amount: Double) extends Class1BandAmount

  case class LELToPT(amount: Double) extends Class1BandAmount

  case class PTToUAP(amount: Double) extends Class1BandAmount

  case class PTToUEL(amount: Double) extends Class1BandAmount

  case class ETToUEL(amount: Double) extends Class1BandAmount

  case class UAPToUEL(amount: Double) extends Class1BandAmount



}


sealed trait TaxYearBandLimits {

  val bandAmounts: List[Class1BandAmount]

  val bandLimits: List[Class1BandLimit]

}

object TaxYearBandLimits {

  import Class1BandLimit._

  import Class1BandAmount._

  case class AfterOrOn2003(
                             lel: LEL,
                             et: ET,
                             uel: UEL
                           ) extends TaxYearBandLimits {

    val bandAmounts: List[Class1BandAmount] =
      List(
        BelowLEL(0),
        LELToET(0),
        ETToUEL(0)
      )

    val bandLimits = List(lel, et, uel)

  }


  case class AfterOrOn2008(
                             lel: LEL,
                             pt: PT,
                             uap: UAP,
                             uel: UEL
                           )  extends TaxYearBandLimits {
    val bandAmounts: List[Class1BandAmount] =
      List(
        BelowLEL(0),
        LELToPT(0),
        PTToUAP(0),
        UAPToUEL(0)
      )

    val bandLimits = List(lel, pt, uap, uel)

  }

  case class AfterOrOn2016(
                          lel: LEL,
                          pt: PT,
                          uel: UEL
                          ) extends TaxYearBandLimits {
    val bandAmounts: List[Class1BandAmount] =
      List(
        BelowLEL(0),
        LELToPT(0),
        PTToUEL(0)
      )

    val bandLimits = List(lel, pt, uel)

  }

}
