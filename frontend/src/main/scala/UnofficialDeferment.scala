package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js

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
    val year: Int = on.getFullYear()
    val applicableBands: List[Band] = year match {
      case _ < 2009 => ApplicableBands.Pre2009.bands
      case _ < 2016 => ApplicableBands.Pre2016.bands
      case _ => ApplicableBands.Post2015.bands
    }
    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )
    applicableBands.foreach(b: Band =>
      config.classOne(interval).values.flatMap(x =>
        b.copy(limit = x[f.configMap])
    ).toList.toJSArray
  }
}

@JSExportTopLevel("UnofficialDefermentRow")
case class UnofficialDefermentRow(
  id: String,
  employer: String,
  category: String,
  bands: List[ApplicableBands],
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
  configMap: String,
  limit: Double = 0
)

sealed trait ApplicableBands extends Product with Serializable

object ApplicableBands {
  final case object Pre2009 extends ApplicableBands {
    val bands: List[Band] = List(
      Band("Lower earnings limit", "LEL", "lelToET.week.Bounded.lower"),
      Band("Earnings threshold", "LEL - ET", "lelToET.week.Bounded.upper"),
      Band("Upper earnings limit", "ET - UEL", "etToUel.week.Bounded.upper")
    )
  }

  final case object Pre2016 extends ApplicableBands {
    val bands: List[Band] = List(
      Band("Lower earnings limit", "LEL", "lelToStRebate.week.Bounded.lower"),
      Band("Primary threshold", "LEL - PT", "lelToStRebate.week.Bounded.upper"),
      Band("Upper accrual point", "PT - UAP", "ptToUap.week.Bounded.upper"),
      Band("Upper earnings limit", "UAP - UEL", "aboveUel.week.Bounded.lower")
    )
  }

  final case object Post2015 extends ApplicableBands {
    val bands: List[Band] = List(
      Band("Lower earnings limit", "LEL", "lelToStRebate.week.Bounded.lower"),
      Band("Primary threshold", "LEL - PT", "lelToStRebate.week.Bounded.upper"),
      Band("Upper earnings limit", "PT - UEL", "aboveUel.week.Bounded.lower")
    )
  }
}
