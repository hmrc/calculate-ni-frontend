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

case class RateDefinition(
  year: Interval[BigDecimal],
  month: Option[Interval[BigDecimal]],
  week: Option[Interval[BigDecimal]],
  fourWeek: Option[Interval[BigDecimal]],
  employee: Map[Char, BigDecimal] = Map.empty,
  employer: Map[Char, BigDecimal] = Map.empty,
  contractedOutStandardRate: Option[Boolean] = None,
  trigger: Bands = Bands.all,
  hideOnSummary: Boolean = true
) {
  def effectiveYear = year
  def effectiveMonth = month.getOrElse(year / 12)
  def effectiveWeek = week.getOrElse(year / 52)
  def effectiveFourWeek = fourWeek.getOrElse(year / 13)
}

object RateDefinition {

  case class VagueRateDefinition(
    year: Option[Interval[BigDecimal]],
    month: Option[Interval[BigDecimal]],
    week: Option[Interval[BigDecimal]],
    fourWeek: Option[Interval[BigDecimal]],
    employee: Map[Char, BigDecimal] = Map.empty,
    employer: Map[Char, BigDecimal] = Map.empty,
    contractedOutStandardRate: Option[Boolean] = None,
    trigger: Bands = Bands.all,
    hideOnSummary: Boolean = true
  ) {

    import VagueRateDefinition._

    def confirmWith(name: String, limits: Map[String, Limit]): RateDefinition = {

      import cats.syntax.apply._
      import cats.instances.option._

      val trimmedName = name.toLowerCase.trim.replaceAll("[-._]"," ")

      lazy val fallbackLimits = trimmedName match {

        case lowerBounded(l) =>
          limits.get(l).map{ ll =>
            (
              Interval.atOrAbove(ll.effectiveYear),
              Interval.atOrAbove(ll.effectiveMonth),
              Interval.atOrAbove(ll.effectiveWeek),
              Interval.atOrAbove(ll.effectiveFourWeek)
            )
          }

        case upperBounded(u) =>
          limits.get(u).map{ ul =>
            (
              Interval.openUpper(Zero, ul.effectiveYear),
              Interval.openUpper(Zero, ul.effectiveMonth),
              Interval.openUpper(Zero, ul.effectiveWeek),
              Interval.openUpper(Zero, ul.effectiveFourWeek)
            )
        }

        case bothBounded(l,u) => (limits.get(l), limits.get(u)).mapN{ case (ll, ul) =>
          (
            Interval.openUpper(ll.effectiveYear, ul.effectiveYear),
            Interval.openUpper(ll.effectiveMonth, ul.effectiveMonth),
            Interval.openUpper(ll.effectiveWeek, ul.effectiveWeek),
            Interval.openUpper(ll.effectiveFourWeek, ul.effectiveFourWeek)
          )
        }

        case _ =>
          None
      }

      RateDefinition(
        (year orElse fallbackLimits.map(_._1)).getOrElse(sys.error(s"Cannot find rate for $name - $limits")),
        month orElse fallbackLimits.map(_._2),
        week orElse fallbackLimits.map(_._3),
        fourWeek orElse fallbackLimits.map(_._4),
        employee,
        employer,
        contractedOutStandardRate,
        trigger,
        hideOnSummary
      )
    }
  }

  object VagueRateDefinition {
    val bothBounded = "([a-zA-Z0-9]*) to ([a-z0-9]*)".r
    val lowerBounded = "above ([a-z0-9]*)".r
    val upperBounded = "up to ([a-z0-9]*)".r
  }

}
