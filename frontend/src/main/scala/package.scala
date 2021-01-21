package eoi

import scala.scalajs.js
import java.time.LocalDate

package object frontend {
  implicit def convertDate(in: js.Date): LocalDate =
    LocalDate.of(in.getFullYear.toInt, in.getMonth.toInt, in.getDate.toInt)

  implicit def convertDateBack(in: LocalDate): js.Date =
    new js.Date(in.getYear, in.getMonthValue, in.getDayOfMonth)

}
