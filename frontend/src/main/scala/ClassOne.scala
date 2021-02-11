package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import cats.implicits._
import JsObjectAdapter.ops._

@JSExportTopLevel("ClassOneFrontend")
class ClassOneFrontend(
  config: Configuration
) extends js.Object {

  import ClassOneFrontend.c1ResultLikeAdapter

  def calculate(
    on: js.Date,
    rows: js.Array[ClassOneRow],
    netPaid: String,
    employeePaid: String
  ): js.Object =
    config.calculateClassOne(
      on,
      rows.toList.collect {
        case ClassOneRow(id, period, category, grossPay, _) =>
          val p = period match {
            case "W" => Period.Week
            case "2W" => Period.Week
            case "M" => Period.Month
            case "4W" => Period.FourWeek
            case _ => throw new IllegalStateException("Unknown Period")
          }

          ClassOneRowInput(id, grossPay, category.head, p, if (period == "2W") 2 else 1 )
      },
      BigDecimal(netPaid),
      BigDecimal(employeePaid)
    ).toJSObject

  def isCosrApplicable(on: Date): Boolean = {
    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )
    config.classOne(interval).values.exists(_.contractedOutStandardRate.isDefined)
  }

  def getTaxYears: js.Array[String] = {
    val i = config.classOne.keys.map(_.toString)
    i.toJSArray
  }

  def getApplicableCategories(on: Date): String = {
    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )
    config.classOne(interval).values.flatMap( x =>
      x.employee.keys ++ x.employer.keys
    ).toList.sorted.distinct.map{ch => s"$ch"}.mkString
    }

  def calculateClassOneAAndB(
    on: Date,
    amount: Double
  ): String = config.calculateClassOneAAndB(on, amount).getOrElse(
    throw new NoSuchElementException(s"Class One A and B undefined for $on")
  ).toString

}

object ClassOneFrontend {

  /* this defines the structure of the JS object that is derived from
 * the Scala output.
 * Any of the elements of ClassOneResult can be made accessible to the
 * JS frontend from here.
 */
  implicit def c1ResultLikeAdapter[A <: ClassOneResultLike] = new JsObjectAdapter[A] {
    def toJSObject(in: A): js.Object = new js.Object {

      // the rows
      val resultRows: js.Array[js.Object] = in.rowsOutput.map { row => new js.Object {
        val name = row.rowId

        // the bands within a row
        val resultBands = row.bands.map { band => new js.Object {
          val name = band.bandId

          // anywhere where we have an 'Explained' datatype we can call 'value' to get
          // the Scala value (normally a BigDecimal) -
          val amountInBand = band.amountInBand.value.toDouble

          // or call 'explain' to get a List[String] trace -
          val amountInBandExplain: js.Array[String] = band.amountInBand.explain.toJSArray
        }: js.Object }.toJSArray

        val employer = row.employerContributions.value.toDouble
        val employee = row.employeeContributions.value.toDouble
        val explain = (row.employeeContributions.explain ++ row.employerContributions.explain).dedupPreserveOrder.toJSArray

      }: js.Object }.toJSArray

      val employerPaid = in.employerPaid.value.toDouble

      // aggregate values
      val totals = new js.Object {
        val gross = in.grossPay.value.toDouble
        val employee = in.employeeContributions.value.toDouble
        val employer = in.employerContributions.value.toDouble
        val net = in.totalContributions.value.toDouble
      }

      val underpayment = new js.Object {
        val employee = in.underpayment.employee.value.toDouble
        val employer = in.underpayment.employer.value.toDouble
        val total = in.underpayment.total.value.toDouble
      }

      val overpayment = new js.Object {
        val employee = in.overpayment.employee.value.toDouble
        val employer = in.overpayment.employer.value.toDouble
        val total = in.overpayment.total.value.toDouble
      }

      val employerContributions = in.employerPaid.value.toDouble

    }
  }

}


@JSExportTopLevel("ClassOneRow")
case class ClassOneRow(
  id: String,
  period: String, // "M", "W" or "4W"
  category: String,
  grossPay: Double,
  contractedOutStandardRate: Boolean = false
)

@JSExportTopLevel("ClassOneRowProRata")
case class ClassOneRowProRata(
  id: String,
  from: Date,
  to: Date,
  category: String,
  grossPay: Double,
  contractedOutStandardRate: Boolean = false
)
