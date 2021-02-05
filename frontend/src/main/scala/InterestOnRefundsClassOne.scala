package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

class InterestOnRefundsClassOne(
  config: Configuration
) extends js.Object  {

  private def sampleResponse(rowsIn: List[js.Object]) = new js.Object {
    val totalRefund: Double = 1
    val totalInterest: Double = 2
    val grandTotal: Double = 3

    val rows: js.Array[js.Object] = rowsIn.zipWithIndex.map { case (row,i) =>
      new js.Object {
        val periodStart = 1
        val refund = 2
        val payable = (i+1) * 100
      } : js.Object
    }.toJSArray
  }

  def calculate(
     rows: js.Array[js.Object]
   ): js.Object = sampleResponse(rows.toList)

  def getRates(): js.Array[js.Object] = {2010 to 2020}.map { yearGen =>
    new js.Object {
      val year = yearGen
      val rate = 0.055
    }: js.Object
  }.toJSArray

}
