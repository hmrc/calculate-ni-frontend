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

import cats.implicits._

class ClassTwoSpec extends SpreadsheetTest {

  val files = csvsInDir("calc/src/test/resources/testing-tables/class2")

  def lineTest(row: Map[String, String]): Unit = {
    // data
    (
      (row.get("year") flatMap TaxYear.unapply).map(_.start),
      row.get("payment / enquiry date") flatMap Date.unapply,
      row.get("total earnings factor") flatMap MoneyStr.unapply
    ).mapN(config.calculateClassTwo) map { result =>

      (
        row.get("no conts due") flatMap Int.unapply
      ) map (result.numberOfContributions equalOrExplain _)

      (
        row.get("total amount") flatMap MoneyStr.unapply
      ) map (result.totalDue equalOrExplain _)

      (
        row.get("class 2 rate") flatMap MoneyStr.unapply
      ) map (result.rate equalOrExplain _)

      (
        row.get("date higher rate") flatMap Date.unapply
      ) map (result.higherProvisionsApplyOn equalOrExplain _)

      (
        row.get("final payment date") flatMap Date.unapply
      ) map (result.finalDate equalOrExplain _)
      
    }

  }

  runFiles()

}
