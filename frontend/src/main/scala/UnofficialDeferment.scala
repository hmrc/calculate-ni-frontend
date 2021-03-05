package eoi
package frontend

import eoi.Class1Band._
import eoi.Class1BandLimit._
import eoi.TaxYearBandLimits._

import scala.scalajs.js

import java.time.temporal.TemporalAdjusters
import scala.scalajs.js
import js.JSConverters._
import scala.scalajs.js.annotation.JSExportTopLevel

class UnofficialDeferment() extends js.Object {

  import UnofficialDeferment._

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
            ETToUEL -> Map(
              "A" -> 0.11,
              "D" -> 0.094,
              "F" -> 0.094,
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
      _.rates.values.flatMap(_.keys.toString).toSet.toJSArray
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

object UnofficialDeferment {

  implicit class Class1BandOps(private val b: Class1Band) extends AnyVal {
    def toLabel: String = b match {
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

  implicit class Class1BandLimitOps(private val l: Class1BandLimit) extends AnyVal {
    def toLabel: String = l match {
      case _: LEL  => "Lower earning limit"
      case _: PT =>   "Primary threshold"
      case _: ET =>   "Earning threshold"
      case _: UAP  => "Upper accrual point"
      case _: UEL  => "Upper earning limit"
    }



  }

  def class1bandLimitFromLabel(label: String, amount: Double) = label match {
    case "Lower earning limit"         => LEL(amount)
    case "Primary threshold"           => PT(amount)
    case "Earning threshold"           => ET(amount)
    case "Upper accrual point"         => UAP(amount)
    case "Upper earning limit"         => UEL(amount)
    case other                         => sys.error(s"Could not understand label $other")
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


