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


  def explain(
    on: js.Date,
    rows: js.Array[ClassOneRow],
    totalContributions: Double = 0,
    employeeContributions: Double = 0
  ): js.Array[String] = {

    rows.toList.flatMap { row => 
      config.calculateClassOneRow(
        on,
        row.grossPay,
        row.category.head,
        row.period match {
          case "W" => Period.Week
          case "M" => Period.Month
          case "4W" => Period.FourWeek
          case _ => throw new IllegalStateException("Unknown Period")
        },
        1,
        row.contractedOutStandardRate
      ).written
    }.toJSArray
  }

  def calculate(
    on: js.Date,
    rows: js.Array[ClassOneRow],
    totalContributions: Double = 0,
    employeeContributions: Double = 0
  ): js.Object = {
    val results = rows.toList.map { row => 
      config.calculateClassOneRow(
        on,
        row.grossPay,
        row.category.head,
        row.period match {
          case "W" => Period.Week
          case "M" => Period.Month
          case "4W" => Period.FourWeek
          case _ => throw new IllegalStateException("Unknown Period")
        },
        1,
        row.contractedOutStandardRate
      ).value
    }

    new js.Object {
      val resultRows = results.map { res => 
        new js.Object {
          val bands = res.map { case (key, (b, _, _)) =>
            new js.Object {
              val name = key
              val amountInBand = b
            }
          }.toJSArray

          val (employeeBD, employerBD) = res.toList.map {
              case (_, (_, ee, er)) => (ee, er)
          }.combineAll

          val employee = employeeBD.toDouble
          val employer = employerBD.toDouble          
          val totalContributions = (employeeBD + employerBD).toDouble
        }
      }.toJSArray

      private val (totalEmployee, totalEmployer) =
        resultRows.toList.map{ r => (r.employeeBD, r.employerBD) }.combineAll

      val totals = new js.Object {
        val gross: Double = rows.toList.map(_.grossPay).sum
        val net: Double = (totalEmployee + totalEmployer).toDouble
        val employee: Double = totalEmployee.toDouble
        val employer: Double = totalEmployer.toDouble
      }

      val employerContributions = totalContributions - employeeContributions

      val underpayment = new js.Object {
        val employee = (totalEmployee - employeeContributions).max(Zero).toDouble
        val employer = (totalEmployer - employerContributions).max(Zero).toDouble
        val net = employee + employer
      }

      val overpayment = new js.Object {
        val employee = ((totalEmployee - employeeContributions) * -1).max(Zero).toDouble
        val employer = ((totalEmployer - employerContributions) * -1).max(Zero).toDouble
        val net = employee + employer
      }
    }
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

}

@JSExportTopLevel("ClassOneRow")
case class ClassOneRow(
  period: String, // "M", "W" or "4W"
  category: String,
  grossPay: Double,
  contractedOutStandardRate: Boolean = false
) 
