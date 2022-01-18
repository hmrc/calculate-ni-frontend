/*
 * Copyright 2022 HM Revenue & Customs
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

import java.time.LocalDate
import spire.math.Interval

class InterestOnRefundsClassOne (
  config: Configuration
) extends InterestFrontend {

  protected def calculationFunction(
    row: InterestRow,
    remissionPeriod: Option[RemissionPeriod]
  ): InterestResult = config.calculateInterestOnRepayment(
    Money(row.debt),
    TaxYear(row.periodStart),
    row.paymentDate.map(x => x: LocalDate).toOption.getOrElse(LocalDate.now)
  )

  protected def rates: Map[Interval[LocalDate], Percentage] =
    config.interestOnRepayment

}
