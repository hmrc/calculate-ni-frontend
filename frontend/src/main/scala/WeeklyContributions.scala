/*
 * Copyright 2023 HM Revenue & Customs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package eoi
package frontend

import scala.scalajs.js, js.JSConverters._
import spire.math.Interval
import com.github.ghik.silencer.silent

@silent("private val")
class WeeklyContributions(
  config: Configuration
) extends js.Object {

  def calculate(
    from: js.Date,
    to: js.Date
  ): Int = Interval[java.time.LocalDate](from, to).numberOfTaxWeeks.get

  def breakdown(
    from: js.Date,
    to: js.Date
  ): js.Object = {
    val r = Interval[java.time.LocalDate](from, to).taxWeekBreakdown
    val yearsSeq = r.map {
      case (y, w) =>

        new js.Object {
          val weeks: Int = w
          val year: Int = y.startingYear

          val startDate: js.Date = y.start
          val endDate: js.Date = y.end
        }
    }.toJSArray
    val total = r.map(_._2).sum

    new js.Object {
      val totalWeeks = total
      val years = yearsSeq
    }
  }

}
