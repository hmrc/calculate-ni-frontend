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
import org.scalatest._, funspec._
import org.scalatestplus.scalacheck.ScalaCheckPropertyChecks
import org.scalacheck._
import java.time.LocalDate

class TaxYearSpec extends AnyFunSpec with ScalaCheckPropertyChecks with ArbitraryInstances {

  def parameters: Gen.Parameters = Gen.Parameters.default

  describe("TaxYear") {
    it("for any LocalDate (d) - TaxYear(d).start ≤ d ≤ TaxYear(d).end") {
      forAll { d: LocalDate =>
        assert(TaxYear(d).start <= d)
        assert(d <= TaxYear(d).end)
      }
    }
  }
}
