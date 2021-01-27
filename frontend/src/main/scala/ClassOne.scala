package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

@JSExportTopLevel("ClassOneFrontend")
class ClassOneFrontend(
  config: Configuration
) extends js.Object {
    def calculateJson(
      on: js.Date,
      amount: Double,
      cat: String, // single character
      period: String, // one of Wk, Mnth, 4Wk or Ann
      qty: Int = 1,
      contractedOutStandardRate: Boolean = false
    ): String = {
      val ret = config.calculateClassOne(
        on,
        BigDecimal(amount.toString),
        cat.head,
        Period(period),
        qty,
        contractedOutStandardRate
      )
      ret.asJson.toString
    }

    def calculateProRataJson(
      from: Date,
      to: Date,
      amount: Double,
      cat: String, // single character
      contractedOutStandardRate: Boolean = false
    ): String = {
      val totalForYear = config.calculateClassOne(
        from,
        BigDecimal(amount.toString),
        cat.head,
        Period.Year,
        1,
        contractedOutStandardRate
      )
      val ratio = config.proRataRatio(from, to).get
      val ret = totalForYear.mapValues {
        case (b,ee,er) => (b * ratio,ee * ratio,er * ratio)
      }
      ret.asJson.toString
    }

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

    val interestOnLateClassOne = new js.Object {

    private def sampleResponse(rowsIn: List[js.Object]) = new js.Object {
      val totalDebt: Double = 1
      val totalInterest: Double = 2
      val grandTotal: Double = 3

      val rows: js.Array[js.Object] = rowsIn.zipWithIndex.map { case (row,i) =>
        new js.Object {
          val periodStart = 1
          val debt = 2
          val interestDue = (i+1) * 100
        } : js.Object
      }.toJSArray
    }

    def calculate(
                   rows: js.Array[js.Object],
                   remissionPeriod: js.Object
                 ): js.Object = sampleResponse(rows.toList)

    def getRates(): js.Array[js.Object] = {2010 to 2020}.map { yearGen =>
      new js.Object {
        val year = yearGen
        val rate = 0.055
      }: js.Object
    }.toJSArray
  }
}
