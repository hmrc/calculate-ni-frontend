package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._
import cats.implicits._

@JSExportTopLevel("ClassOneFrontend")
class ClassOneFrontend(
  config: Configuration
) extends js.Object {

  def calculate(
    on: js.Date,
    rows: js.Array[ClassOneRow],
    totalContributions: Double = 0,
    employeeContributions: Double = 0
  ): js.Object = {
    val results = rows.toList.map { row =>
      row.id -> config.calculateClassOne(
        on,
        row.grossPay,
        row.category.head,
        row.period match {
          case "W" => Period.Week
          case "2W" => Period.Week
          case "M" => Period.Month
          case "4W" => Period.FourWeek
          case _ => throw new IllegalStateException("Unknown Period")
        },
        row.period match {
          case "2W" => 2
          case _ => 1
        },
        row.contractedOutStandardRate
      )
    }

    formatClassOne(results, rows.toList.map(_.grossPay).sum, totalContributions, employeeContributions)
  }

  def calculateProRata(
    on: js.Date,
    rows: js.Array[ClassOneRowProRata],
    totalContributions: Double = 0,
    employeeContributions: Double = 0
  ): js.Object = {

    val results = rows.toList.map { row =>
      row.id -> config.calculateClassOne(
        on,
        row.grossPay,
        row.category.head,
        Period.Year,
        config.proRataRatio(row.from, row.to).get,
        row.contractedOutStandardRate
      )
    }

    formatClassOne(results, rows.toList.map(_.grossPay).sum, totalContributions, employeeContributions)
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

  private def formatClassOne(
    results: List[(String, Map[String,(BigDecimal, BigDecimal, BigDecimal)])],
    grossPay: BigDecimal,
    totalContributions: Double = 0,
    employeeContributions: Double = 0
  ): js.Object = {

    val resultRows = results.map { case (rowId, res) =>

      val resultBands = res.map { case (key, (b, _, _)) =>
        new js.Object {
          val name = key
          val amountInBand = b.toDouble
        }
      }.toJSArray

      val (employeeResult, employerResult) = res.toList.map {
        case (_, (_, ee, er)) => (ee,er)
      }.combineAll

      new js.Object {
        val bands = resultBands

        val employee = employeeResult.toDouble
        val employer = employerResult.toDouble
        val totalContributions = employer + employee

        val id = rowId
      }
    }.toJSArray

    val (totalEmployee, totalEmployer) = results.flatMap {
      _._2.map { case (_, (_, ee, er)) => (ee,er) }
    }.combineAll

    new js.Object {
      val rows = resultRows

      val totals = new js.Object {
        val gross: Double = grossPay.toDouble
        val employee: Double = totalEmployee.toDouble
        val employer: Double = totalEmployer.toDouble
        val net: Double = (employee + employer)
      }

      val employerContributions = totalContributions - employeeContributions

      val underpayment = new js.Object {
        val employee: Double = (totalEmployee.toDouble - employeeContributions).max(0)
        val employer: Double = (totalEmployer.toDouble - employerContributions).max(0)
        val net = employee + employer
      }

      val overpayment = new js.Object {
        val employee: Double = ((totalEmployee.toDouble - employeeContributions) * -1).max(0)
        val employer: Double  = ((totalEmployer.toDouble - employerContributions) * -1).max(0)
        val net = employee + employer
      }
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
