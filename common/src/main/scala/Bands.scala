/*
 * Copyright 2021 HM Revenue & Customs
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

import spire.math.Interval
import spire.implicits._

case class Bands(
  year: Interval[Money],
  month: Option[Interval[Money]] = None,
  week: Option[Interval[Money]] = None,
  fourWeek: Option[Interval[Money]] = None
) {
  def interval(period: Period.Period, qty: BigDecimal = 1): Interval[Money] = {
    val qtyM = Money(qty)
    val raw = period match {
      case Period.Year => year.mapBounds(_ * qtyM)
      case Period.Month => month.getOrElse(year.mapBounds(_ / 12 * qtyM))
      case Period.Week => week.getOrElse(year.mapBounds(_ / 52 * qtyM))
      case Period.FourWeek => fourWeek.getOrElse(year.mapBounds(_ / 13 * qtyM))
    }
    raw.mapBounds(_.setScale(2, BigDecimal.RoundingMode.HALF_UP))
  }
}

object Bands {
  def all = new Bands(Interval.all)
}
