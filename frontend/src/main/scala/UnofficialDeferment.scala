package eoi
package frontend

import scala.scalajs.js
import eoi.frontend.Class1Band._
import eoi.frontend.Class1BandLimit._
import eoi.frontend.TaxYearBandLimits._

import java.time.temporal.TemporalAdjusters
import scala.scalajs.js
import js.JSConverters._
import scala.scalajs.js.annotation.JSExportTopLevel

class UnofficialDeferment() extends js.Object {

  // TODO: read config in properly instead of using hard coded values below -
  //       either read in new config bespoke for unofficial deferments or
  //       somehow transform existing class 1 config and filter out
  //       appropriate category letters
  val config: Map[Int, TaxYearBandLimits] =
    (2003 to 2020).toList.map{ year =>
      val bandLimits = if(year >= 2016)
        AfterOrOn2016(LEL(112), PT(155), UEL(827),
          Map(
            PTToUEL -> Map(
              "A" -> 0.12,
              "H" -> 0.12,
              "J" -> 0.02,
              "M" -> 0.12,
              "Z" -> 0.02
            ),
            AboveUEL -> Map(
              "A" -> 0.02,
              "H" -> 0.02,
              "J" -> 0.02,
              "M" -> 0.02,
              "Z" -> 0.02
            )
          )
        )
      else if(year >= 2009)
        AfterOrOn2009(LEL(95), PT(110), UAP(770), UEL(844),
          Map(
            PTToUAP -> Map(
              "A" -> 0.11,
              "D" -> 0.094,
              "F" -> 0.094,
              "J" -> 0.01,
              "L" -> 0.01,
              "S" -> 0.01
            ),
            UAPToUEL -> Map(
              "A" -> 0.11,
              "D" -> 0.11,
              "F" -> 0.11,
              "J" -> 0.01,
              "L" -> 0.01,
              "S" -> 0.01
            ),
            AboveUEL -> Map(
              "A" -> 0.01,
              "D" -> 0.01,
              "F" -> 0.01,
              "J" -> 0.01,
              "L" -> 0.01,
              "S" -> 0.01
            ),
            LELToET -> Map(
              "D" -> -0.016,
              "F" -> -0.016,
              "L" -> -0.016,
              "S" -> -0.016
            )
          )
        )
      else
        AfterOrOn2003(LEL(87), ET(100), UEL(670),
          Map(
            PTToUAP -> Map(
              "A" -> 0.11,
              "D" -> 0.094,
              "F" -> 0.094,
              "J" -> 0.01,
              "L" -> 0.01,
              "S" -> 0.01
            ),
            UAPToUEL -> Map(
              "A" -> 0.11,
              "D" -> 0.11,
              "F" -> 0.11,
              "J" -> 0.01,
              "L" -> 0.01,
              "S" -> 0.01
            ),
            AboveUEL -> Map(
              "A" -> 0.01,
              "D" -> 0.01,
              "F" -> 0.01,
              "J" -> 0.01,
              "L" -> 0.01,
              "S" -> 0.01
            ),
            LELToET -> Map(
              "D" -> -0.016,
              "F" -> -0.016,
              "L" -> -0.016,
              "S" -> -0.016
            )
          ))

      year -> bandLimits
    }.toMap

  def calculate(
     taxYear: Int,
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

  def getTaxYears: js.Array[Int] =
    config.keys.toJSArray

  def getCategories(taxYear: Int) =
    config.get(taxYear).fold(sys.error(s"Could not find config for tax year $taxYear")){
      _.rates.values.flatMap(_.keys).toSet.toJSArray
    }

  def getBandInputNames(taxYear: Int) = {
    val taxYearBands =  config.get(taxYear).getOrElse(
      sys.error(s"Could not find config for tax year $taxYear")
    )

    taxYearBands.bands.toJSArray.map{ band =>
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

sealed trait Class1Band extends Product with Serializable {

  def toLabel: String = this match {
    case BelowLEL => "LEL"
    case LELToET =>  "LEL - ET"
    case LELToPT =>  "LEL - PT"
    case PTToUAP =>  "PT - UAP"
    case PTToUEL =>  "PT - UEL"
    case ETToUEL =>  "ET - UEL"
    case UAPToUEL => "UAP - UEL"
    case AboveUEL => "UEL"
  }

}

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


sealed trait TaxYearBandLimits {

  val bands: List[Class1Band]

  val bandLimits: List[Class1BandLimit]

  val rates: Map[Class1Band, Map[String, Double]]

}

object TaxYearBandLimits {

  case class AfterOrOn2003(
                             lel: LEL,
                             et: ET,
                             uel: UEL,
                             rates: Map[Class1Band, Map[String, Double]]
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
                             rates: Map[Class1Band, Map[String, Double]]
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
                          rates: Map[Class1Band, Map[String, Double]]
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
