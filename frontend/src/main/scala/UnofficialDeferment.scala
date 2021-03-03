package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.{Date, UndefOr}
import scala.scalajs.js
import js.JSConverters._
import JsObjectAdapter.ops._
import spire.math.Interval.fromBounds
import spire.implicits._
import spire.math.Interval

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

  def getBandsForTaxYear(on: Date): js.Array[_ <: scala.scalajs.js.Object] = {
    val applicableBands: List[Band] =
      if(on.getYear < 2009) ApplicableBands.Pre2009.bands
      else if(on.getYear < 2016) ApplicableBands.Pre2016.bands
      else ApplicableBands.Post2015.bands

    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )

    applicableBands.map { b: Band =>
      new js.Object {
        val name: String = b.name
        val label: String = b.label
        val limit: String = b.bound match {
          case "lower" => config.classOne(interval)(b.band).week match {
            case Some(v) => v.lowerBound.toString
            case _ => ""
          }
          case _ => config.classOne(interval)(b.band).week match {
            case Some(v) => v.upperBound.toString
            case _ => ""
          }
        }
      }
    }.toJSArray

  }
}

@JSExportTopLevel("UnofficialDefermentRow")
case class UnofficialDefermentRow(
  id: String,
  employer: String,
  category: String,
  bands: js.Array[Band],
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
  limit: Option[String] = None
)

sealed trait ApplicableBands extends Product with Serializable

object ApplicableBands {
  final case object Pre2009 extends ApplicableBands {
    val bands: List[Band] = List(
      Band("Lower earnings limit", "LEL", "lelTOEtRebate1", "lower"),
      Band("Earnings threshold", "LEL - ET", "lelTOEtRebate1", "upper"),
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
      Band("Lower earnings limit", "LEL", "ptToUel", "lower"),
      Band("Primary threshold", "LEL - PT", "ptToUel", "upper"),
      Band("Upper earnings limit", "PT - UEL", "aboveUel", "lower")
    )
  }
}
