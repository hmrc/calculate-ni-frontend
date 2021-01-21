package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

/** A dummy object for backward compatibility */
@JSExportTopLevel("ClassOne")
@deprecated("Use NiFrontend")
final class ClassOne(json: String) extends NiFrontend(json) {

  @deprecated("Use classOne.calculateJson")
  lazy val calculate = classOne.calculateJson _

  @deprecated("Use classOne.calculateProRataJson")
  lazy val calculateProRata = classOne.calculateProRataJson _

  @deprecated("Use classOne.getTaxYears")
  lazy val getTaxYears = classOne.getTaxYears _

  @deprecated("Use classOne.getApplicableCategories")
  lazy val getApplicableCategories = classOne.getApplicableCategories _

  @deprecated("Use classTwo.calculateJson")
  lazy val calculateClassTwo = classTwo.calculateJson _

  @deprecated("Use classThree.calculateJson")
  lazy val calculateClassThree = classThree.calculateJson _

}

@JSExportTopLevel("NiFrontend")
class NiFrontend(json: String) extends js.Object {

  implicit def convertDate(in: js.Date): LocalDate =
    LocalDate.of(in.getFullYear.toInt, in.getMonth.toInt, in.getDate.toInt)

  implicit def convertDateBack(in: LocalDate): js.Date =
    new js.Date(in.getYear, in.getMonthValue, in.getDayOfMonth)

  val config: Configuration = EoiJsonEncoding.fromJson(json) match {
    case Right(z) => z
    case Left(err) => throw new IllegalArgumentException(s"$err")
  }

  /**   ____ _                  ___             
    *  / ___| | __ _ ___ ___   / _ \ _ __   ___ 
    * | |   | |/ _` / __/ __| | | | | '_ \ / _ \
    * | |___| | (_| \__ \__ \ | |_| | | | |  __/
    *  \____|_|\__,_|___/___/  \___/|_| |_|\___|
    */
  object classOne {
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
  }

  /*   ____ _                 _____
   *  / ___| | __ _ ___ ___  |_   _|_      _____  
   * | |   | |/ _` / __/ __|   | | \ \ /\ / / _ \ 
   * | |___| | (_| \__ \__ \   | |  \ V  V / (_) |
   *  \____|_|\__,_|___/___/   |_|   \_/\_/ \___/ 
   */ 
  object classTwo {
    def calculateJson(
      taxYear: Date,
      paymentDate: Date,
      earningsFactor: Double
    ): String = {
      val payload = JsonObject(
        "contributionsDue"    -> Json.fromInt(39),
        "rate"                -> Json.fromBigDecimal(BigDecimal("3.05")),
        "totalAmountDue"      -> Json.fromBigDecimal(BigDecimal("118.45")),
        "dateHigherRateApply" -> LocalDate.of(2019, 4, 5).asJson,
        "finalPaymentDate"    -> LocalDate.of(2019, 4, 5).asJson,
      )
      payload.asJson.toString
    }

    def calculate(
      taxYear: Date,
      paymentDate: Date,
      earningsFactor: Double
    ) = new js.Object {
      val contributionsDue: Int = 39
      val rate: Double = 3.05
      val totalAmountDue: Double = 118.45
      val dateHigherRateApply: js.Date = LocalDate.of(2019, 4, 5)
      val finalPaymentDate: js.Date = LocalDate.of(2019, 4, 5)
    }
  }

  /*   ____ _                 _____ _
   *  / ___| | __ _ ___ ___  |_   _| |__  _ __ ___  ___ 
   * | |   | |/ _` / __/ __|   | | | '_ \| '__/ _ \/ _ \
   * | |___| | (_| \__ \__ \   | | | | | | | |  __/  __/
   *  \____|_|\__,_|___/___/   |_| |_| |_|_|  \___|\___|
   */   
  object classThree {
    def calculateJson(
      taxYear: Date,
      paymentDate: Date,
      earningsFactor: Double
    ): String = {
      val payload = JsonObject(
        "contributionsDue"    -> Json.fromInt(39),
        "rate"                -> Json.fromBigDecimal(BigDecimal("3.05")),
        "totalAmountDue"      -> Json.fromBigDecimal(BigDecimal("118.45")),
        "dateHigherRateApply" -> LocalDate.of(2019, 4, 5).asJson,
        "finalPaymentDate"    -> LocalDate.of(2019, 4, 5).asJson,
      )
      payload.asJson.toString
    }
  }

  /* __        __        _    _
   * \ \      / /__  ___| | _| |_   _ 
   *  \ \ /\ / / _ \/ _ \ |/ / | | | |
   *   \ V  V /  __/  __/   <| | |_| |
   *    \_/\_/ \___|\___|_|\_\_|\__, |
   *                            |___/ 
   *   ____            _        _ _           _   _                 
   *  / ___|___  _ __ | |_ _ __(_) |__  _   _| |_(_) ___  _ __  ___ 
   * | |   / _ \| '_ \| __| '__| | '_ \| | | | __| |/ _ \| '_ \/ __|
   * | |__| (_) | | | | |_| |  | | |_) | |_| | |_| | (_) | | | \__ \
   *  \____\___/|_| |_|\__|_|  |_|_.__/ \__,_|\__|_|\___/|_| |_|___/
   */                                                                
  object weeklyContributions {

    def calculateJson(
      from: LocalDate,
      to: LocalDate,
      earningsFactor: BigDecimal
    ): String = {
      val payload = JsonObject(
        "maxPotentialWeeks"   -> Json.fromInt(52),
        "actualWeeks"         -> Json.fromInt(12), 
        "deficient"           -> Json.fromInt(1)
      )
      payload.asJson.toString
    }

    def apply(
      from: LocalDate,
      to: LocalDate,
      earningsFactor: BigDecimal
    ) = new js.Object {
      val maxPotentialWeeks: Int = 52
      val actualWeeks: Int = 12
      val deficient: Int = 1
    }
  }

  /*
  def calculateClassThree(
    on: Date,
    numberOfWeeks: Int
  ): String = config.calculateClassThree(on, numberOfWeeks).getOrElse(
    throw new NoSuchElementException(s"Class Three undefined for $on")
  ).toString
  */
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
