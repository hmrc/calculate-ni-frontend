package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

@JSExportTopLevel("NiFrontend")
class NiFrontend(json: String) extends js.Object {

  val config: Configuration = EoiJsonEncoding.fromJson(json) match {
    case Right(z) => z
    case Left(err) => throw new IllegalArgumentException(s"$err")
  }

  lazy val classOne = new ClassOneFrontend(config)

  /*   ____ _                 _____
   *  / ___| | __ _ ___ ___  |_   _|_      _____  
   * | |   | |/ _` / __/ __|   | | \ \ /\ / / _ \ 
   * | |___| | (_| \__ \__ \   | |  \ V  V / (_) |
   *  \____|_|\__,_|___/___/   |_|   \_/\_/ \___/ 
   */ 
  object classTwo extends js.Object {

    def getTaxYears: js.Array[String] = {
      val i = config.classTwo.keys.map(_.toString)
      i.toJSArray
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
  object classThree extends js.Object {

    def getTaxYears: js.Array[String] = {
      val i = config.classThree.keys.map(_.toString)
      i.toJSArray
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
  object weeklyContributions extends js.Object {

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

  def calculateClassFour(
    on: LocalDate,
    amount: Double
  ): String = {
    val (l,h) = config.calculateClassFour(on, amount).getOrElse(
      throw new NoSuchElementException(s"Class Four undefined for $on")
    )
    l.toString + "," + h.toString
  }

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

@JSExportTopLevel("InterestRow")
class InterestRow(
  val periodStart: js.Date,
  val debt: Double
)

@JSExportTopLevel("RemissionPeriod")
class RemissionPeriod(
  val start: js.Date,
  val end: js.Date
)
