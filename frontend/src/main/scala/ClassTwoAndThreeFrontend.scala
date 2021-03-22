package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import JsObjectAdapter.ops._
import spire.math.Interval

class ClassTwoAndThreeFrontend[A <: ClassTwoOrThree](
  rates: Map[Interval[LocalDate], A]
) extends js.Object {

  implicit val c2ResultAdapter = new JsObjectAdapter[ClassTwoAndThreeResult[A]] {
    def toJSObject(in: ClassTwoAndThreeResult[A]): js.Object = new js.Object {
      val contributionsDue: Int = in.numberOfContributions.value
      val rate: Double = in.rate.value.toDouble
      val totalAmountDue: Double = in.totalDue.value.toDouble
      val dateHigherRateApply: js.Date = in.higherProvisionsApplyOn.value
      val finalPaymentDate: js.Date = in.finalDate.value
    }
  }

  def getTaxYears: js.Array[String] = {
    val i = rates.keys.map(_.toString)
    i.toJSArray
  }

  def getFinalDate(
    on: Date
  ): js.Date = {

    val (interval, taxYear) = rates.findAt(on).getOrElse(
      throw new IllegalStateException(s"No band defined for $on")
    )
    
    (interval.lowerValue.get, taxYear).getFinalDate.value
  }

  def getQualifyingEarningsFactor(
    taxYear: Date
  ): Double = rates.at(taxYear).getOrElse(
    throw new IllegalStateException(s"No band defined for $taxYear")
  ).qualifyingEarningsFactor.value.toDouble

  def calculate(
    taxYear: Date,
    paymentDate: Date,
    earningsFactor: Double
  ): js.Object = ClassTwoAndThreeResult[A](
    taxYear,
    rates.at(taxYear).getOrElse(
      throw new IllegalStateException(s"No band defined for $taxYear")
    ),
    paymentDate,
    earningsFactor,
    rates
  ).toJSObject
}
