package eoi
package frontend

import eoi.Class1Band._
import scala.scalajs.js
import js.JSConverters._
import scala.scalajs.js.annotation.JSExportTopLevel

class UnofficialDeferment(config: Configuration) extends js.Object {

  import UnofficialDeferment._

  def calculate(
     taxYear: Int,
     rows: js.Array[UnofficialDefermentRow]
  ) = {
    val result = UnofficialDefermentResult(
      taxYear,
      config.unofficialDeferment.getOrElse(taxYear, sys.error(s"Could not find unofficial deferment config for tax year $taxYear")),
      rows.toList.map( r =>
        UnofficialDefermentRowInput(
          r.id,
          r.employer,
          r.category.head,
          r.bands.toList.map( b =>
            BandAmount(
              labelToClass1Band(b.label).getOrElse(sys.error(s"Unknown class 1 band label: ${b.label}")),
              b.value
            )
          ),
          r.employeeNICs
        )
      )
    )


    new js.Object {
      val annualMax: Double = result.annualMax.value.doubleValue()
      val liability: Double = result.liability.doubleValue()
      val difference: Double = result.difference.doubleValue()
      val ifNotUD: Double = result.ifNotUD.doubleValue()
      val ifNotUdIsDue: Boolean = difference == 0 || ifNotUD < difference
      val resultRows: js.Array[js.Object] = result.rowsOutput.toJSArray.map { r =>
        new js.Object {
          val id: String = r.id
          val gross: Double = r.grossPay.doubleValue()
          val overUel: Double = r.earningsOverUEL.doubleValue()
          val nicsNonCo: Double = r.nicsNonCO.doubleValue()
          val ifNotUd: Double = r.ifNotUD.doubleValue()
        }
      }
      val report: js.Array[js.Object] = result.report.toJSArray.map{ r =>
        new js.Object {
          val label: String = r._1
          val value: Double = r._2.doubleValue()
        }
      }
    }
  }

  def getTaxYears: js.Array[Int] =
    config.unofficialDeferment.keys.toJSArray

  def getCategories(taxYear: Int) =
    config.unofficialDeferment.get(taxYear).fold(sys.error(s"Could not find config for tax year $taxYear")){
      _.rates.values.flatMap(_.keySet.map(_.toString)).toJSArray
    }

  def getBandInputNames(taxYear: Int) = {
    val taxYearBands =  config.unofficialDeferment.get(taxYear).getOrElse(
      sys.error(s"Could not find config for tax year $taxYear")
    )

    taxYearBands.bands.toList.sorted.init.toJSArray.map{ band =>
      new js.Object {
        val label = band.toLabel
      }
    }

  }

  def getBandsForTaxYear(taxYear: Int): js.Array[scala.scalajs.js.Object] = {
    val taxYearBands =  config.unofficialDeferment.get(taxYear).getOrElse(
      sys.error(s"Could not find config for tax year $taxYear")
    )

    taxYearBands.limits.toList.sortBy(_._2).toJSArray.map{ case (l,amt) =>
      new js.Object {
        val label = l match {
          case "LEL"  => "Lower earning limit"
          case "PT"   => "Primary threshold"
          case "ET"   => "Earning threshold"
          case "UAP"  => "Upper accrual point"
          case "UEL"  => "Upper earning limit"
        }
        val amount = amt.doubleValue()
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

  def labelToClass1Band(label: String): Option[Class1Band] = label match {
    case "LEL"                => Some(BelowLEL)
    case "LEL - ET"            => Some(LELToET)
    case "LEL - PT"            => Some(LELToPT)
    case "PT - UAP"            => Some(PTToUAP)
    case "PT - UEL"            => Some(PTToUEL)
    case "ET - UEL"            => Some(ETToUEL)
    case "UAP - UEL"           => Some(UAPToUEL)
    case  "UEL"                => Some(AboveUEL)
    case _ => None
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

@JSExportTopLevel("RequestBand")
case class RequestBand(
  label: String,
  value: Double
)

@JSExportTopLevel("UserDefinedBand")
case class UserDefinedBand(
  label: String,
  limit: Double
)


