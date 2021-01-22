package eoi
package frontend

import scala.scalajs.js.annotation._
import scala.scalajs.js.Date
import scala.scalajs.js, js.JSConverters._
import java.time.LocalDate
import io.circe.generic.auto._, io.circe.syntax._
import io.circe._

class ClassThreeFrontend (
  config: Configuration
) extends js.Object {
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

