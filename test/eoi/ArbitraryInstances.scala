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

import cats.implicits._
import org.scalacheck._
import org.scalacheck.cats.implicits._
import spire.math.Interval
import java.time.LocalDate

trait ArbitraryInstances extends DeriveArbitrary {

  implicit def arbInterval[T](
    implicit arbT: Arbitrary[T],
    order: _root_.cats.Order[T]
  ): Arbitrary[Interval[T]] = Arbitrary{
    val gen = arbT.arbitrary;
    (gen, gen).tupled.map { case (a,b) =>
      val lower = order.min(a,b)
      val upper = order.max(a,b)
      Interval.closed(lower, upper)
    }
  }

  implicit val arbPercent: Arbitrary[Percentage] =
    Arbitrary(Gen.choose(0.0, 100.0).map(Percentage(_)))


  implicit val arbLocalDate: Arbitrary[LocalDate] = Arbitrary{
    Gen.choose(1L,20000L).map(LocalDate.ofEpochDay)
  }

}
