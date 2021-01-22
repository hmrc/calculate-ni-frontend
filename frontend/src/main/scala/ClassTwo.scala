package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate

class ClassTwoFrontend(
  config: Configuration
) extends js.Object {

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
