package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._

@JSExportTopLevel("ClassOne")
case class ClassOne(json: String) {

  implicit def convertDate(in: Date): LocalDate =
    LocalDate.of(in.getFullYear.toInt, in.getMonth.toInt, in.getDate.toInt)

  val config: Configuration = EoiJsonEncoding.fromJson(json) match {
    case Right(z) => z
    case Left(err) => throw new IllegalArgumentException(s"$err")
  }

  @JSExport
  def calculate(
    on: Date,
    amount: Double,
    cat: String, // single character
    period: String, // one of Wk, Mnth, 4Wk or Ann
    qty: Int = 1, 
    contractedOutStandardRate: Boolean = false
  ): String = {
    val ret = config.calculateClassOne(on, BigDecimal(amount.toString), cat.head, Period(period), qty, contractedOutStandardRate)
    ret.asJson.toString
  }

  @JSExport
  def isCosrApplicable(on: Date): Boolean = {
    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )
    config.classOne(interval).values.exists(_.contractedOutStandardRate.isDefined)
  }

  @JSExport
  def getApplicableCategories(on: Date): String = {
    val interval = config.classOne.keys.find(_.contains(on)).getOrElse(
      throw new NoSuchElementException(s"Cannot find an interval for $on")
    )
    config.classOne(interval).values.flatMap( x =>
      x.employee.keys ++ x.employer.keys
    ).toList.sorted.distinct.map{ch => s"$ch"}.mkString
  }

  @JSExport
  def calculateClassOneAAndB(
    on: Date,
    amount: Double
  ): String = config.calculateClassOneAAndB(on, amount).getOrElse(
    throw new NoSuchElementException(s"Class One A and B undefined for $on")
  ).toString

  @JSExport
  def calculateClassThree(
    on: Date,
    numberOfWeeks: Int
  ): String = config.calculateClassThree(on, numberOfWeeks).getOrElse(
    throw new NoSuchElementException(s"Class Three undefined for $on")
  ).toString

  @JSExport
  def calculateClassFour(
    on: LocalDate,
    amount: Double
  ): String = {
    val (l,h) = config.calculateClassFour(on, amount).getOrElse(
      throw new NoSuchElementException(s"Class Three undefined for $on")
    )
    l.toString + "," + h.toString
  }
}
