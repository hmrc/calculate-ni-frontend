package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import JsObjectAdapter.ops._
import scala.scalajs.js.annotation.JSExportTopLevel

class UnofficialDeferment(
 config: Configuration
) extends js.Object {

  def calculate(
     taxYear: js.Date,
     rows: js.Array[UnofficialDefermentRow],
     userDefinedBandLimits: js.Array[ApplicableBands]
  ) = new js.Object {
    val annualMax: Int = 15880
    val liability: Int = 2340
    val difference: Int = 8442
    val ifNotUD: Int = 0
    val resultRows: List[UnofficialDefermentResultRow] = rows.toList.map { r: UnofficialDefermentRow =>
      UnofficialDefermentResultRow(
        id = r.id,
        gross = 100 // calculate from row contents
      )
    }
  }

  def getTaxYears: js.Array[String] = {
    val i = config.classOne.keys.map(_.toString)
    i.toJSArray
  }

  def getBandsForTaxYear(on: Date): js.Array[ApplicableBands] = {
    val applicableBands: List[Band] =
      if(on.getYear < 2009) ApplicableBands.Pre2009.bands
      else if(on.getYear < 2016) ApplicableBands.Pre2016.bands
      else ApplicableBands.Post2015.bands

    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )

    applicableBands.map { b: Band =>

      b.copy(limit = b.bound match {
        case "lower" => config.classOne(interval)(b.band).week.map {
          case v => v.lowerBound.toDouble
        }
        case _ => config.classOne(interval)(b.band).week.map {
          case v => v.upperBound.toDouble
        }
      })

    }.toJSArray
  }
}

@JSExportTopLevel("UnofficialDefermentRow")
case class UnofficialDefermentRow(
  id: String,
  employer: String,
  category: String,
  bands: js.Array[ApplicableBands],
  employersNICs: Double
)

@JSExportTopLevel("UnofficialDefermentResultRow")
case class UnofficialDefermentResultRow(
  id: String,
  gross: Double
)

case class Band(
  name: String,
  label: String,
  band: String,
  bound: String,
  limit: Option[Double] = None
)

sealed trait ApplicableBands extends Product with Serializable

object ApplicableBands {
  final case object Pre2009 extends ApplicableBands {
    val bands: List[Band] = List(
      Band("Lower earnings limit", "LEL", "lelToET", "lower"),
      Band("Earnings threshold", "LEL - ET", "lelToET", "upper"),
      Band("Upper earnings limit", "ET - UEL", "etToUel", "upper")
    )
  }

  final case object Pre2016 extends ApplicableBands {
    val bands: List[Band] = List(
      Band("Lower earnings limit", "LEL", "lelToStRebate", "lower"),
      Band("Primary threshold", "LEL - PT", "lelToStRebate", "upper"),
      Band("Upper accrual point", "PT - UAP", "ptToUap", "upper"),
      Band("Upper earnings limit", "UAP - UEL", "aboveUel", "lower")
    )
  }

  final case object Post2015 extends ApplicableBands {
    val bands: List[Band] = List(
      Band("Lower earnings limit", "LEL", "lelToStRebate", "lowerBound"),
      Band("Primary threshold", "LEL - PT", "lelToStRebate", "upperBound"),
      Band("Upper earnings limit", "PT - UEL", "aboveUel", "lowerBound")
    )
  }
}
