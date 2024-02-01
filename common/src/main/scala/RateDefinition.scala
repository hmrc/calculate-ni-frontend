/*
 * Copyright 2024 HM Revenue & Customs
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

trait EffectiveRate {
  def year: Interval[Money]
  def month: Option[Interval[Money]]
  def week: Option[Interval[Money]]
  def fourWeek: Option[Interval[Money]]
  def employee: Map[Char, Percentage]
  def employer: Map[Char, Percentage]

  def effectiveYear = year
  def effectiveMonth =
    month.getOrElse(year.mapBounds(x => (x / 12).setScale(0, BigDecimal.RoundingMode.HALF_UP)))
  def effectiveWeek =
    week.getOrElse(year.mapBounds(x => (x / 52).setScale(0, BigDecimal.RoundingMode.HALF_UP)))
  def effectiveFourWeek =
    fourWeek.getOrElse(year.mapBounds(x => (x / 13).setScale(0, BigDecimal.RoundingMode.HALF_UP)))
}

case class GrossPayException(
  year: Interval[Money],
  month: Option[Interval[Money]],
  week: Option[Interval[Money]],
  fourWeek: Option[Interval[Money]],
  employee: Map[Char, Percentage] = Map.empty,
  employer: Map[Char, Percentage] = Map.empty  
) extends EffectiveRate

case class RateDefinition(
  year: Interval[Money],
  month: Option[Interval[Money]],
  week: Option[Interval[Money]],
  fourWeek: Option[Interval[Money]],
  employee: Map[Char, Percentage] = Map.empty,
  employer: Map[Char, Percentage] = Map.empty,
  contractedOutStandardRate: Option[Boolean] = None,
  summaryName: Option[String],
  summaryCategories: String = "*",
  summaryContributionsName: Option[String],
  summaryContributionsCategories: String = "*",
  grossPayExceptions: List[GrossPayException] = Nil
) extends EffectiveRate {
  def withGrossPayExceptions(grossPay: Money, period: Period.Period): EffectiveRate = {
    grossPayExceptions.find{ ex =>
      import Period._

      period match {
        case Year => ex.effectiveYear.contains(grossPay)
        case Month => ex.effectiveMonth.contains(grossPay)
        case FourWeek => ex.effectiveFourWeek.contains(grossPay)
        case Week => ex.effectiveWeek.contains(grossPay)
        case _ => false
      }
    } getOrElse this
  }

  def employeeWithGrossPayExceptions(grossPay: Money, period: Period.Period, category: Char): Percentage =
    (withGrossPayExceptions(grossPay, period).employee.get(category) orElse employee.get(category)) getOrElse Percentage.Zero

  def employerWithGrossPayExceptions(grossPay: Money, period: Period.Period, category: Char): Percentage =
    (withGrossPayExceptions(grossPay, period).employer.get(category) orElse employer.get(category)) getOrElse Percentage.Zero
  
}

object RateDefinition {

  case class VagueRateDefinition(
    year: Option[Interval[Money]],
    month: Option[Interval[Money]],
    week: Option[Interval[Money]],
    fourWeek: Option[Interval[Money]],
    employee: Map[Char, Percentage] = Map.empty,
    employer: Map[Char, Percentage] = Map.empty,
    contractedOutStandardRate: Option[Boolean] = None,
    hideOnSummary: Option[Boolean],
    summaryName: Option[String],
    summaryCategories: String = "*",
    hideContributonsOnSummary: Option[Boolean],
    summaryContributionsName: Option[String],
    summaryContributionsCategories: String = "*",
    grossPayExceptions: List[GrossPayException] = Nil
  ) {

    import VagueRateDefinition._

    def simplify: VagueRateDefinition = {
      val that = this
      year.fold(this) { y =>
        val eff = new EffectiveRate {
          val year = y
          val month = that.month
          val week = that.week
          val fourWeek = that.fourWeek
          val employee = that.employee
          val employer = that.employer
        }

        this.copy(
          month = this.month.filter(_ => (eff.effectiveMonth, eff.month) match {
            case (effMonth, Some(month)) if effMonth != month =>
              true
            case _ =>
              false
          }),
          week = this.week.filter(_ => (eff.effectiveWeek, eff.week) match {
            case (effWeek, Some(week)) if effWeek != week =>
              true
            case _ =>
              false
          }),
          fourWeek = this.fourWeek.filter(_ => (eff.effectiveFourWeek, eff.fourWeek) match {
            case (effFourWeek, Some(fourWeek)) if effFourWeek != fourWeek =>
              true
            case _ =>
              false
          })
        )
      }
    }

    def confirmWith(name: String, limits: Map[String, Limit]): RateDefinition = {

      import cats.syntax.apply._
      import cats.instances.option._

      def lookupLimit(in: String): Option[Limit] = limits.get(in.replaceAll("[Rr]ebate","").trim)

      val trimmedName = name.toLowerCase.trim.replaceAll("[-.]"," ")

      lazy val fallbackLimits = trimmedName match {

        case lowerBounded(l) =>
          lookupLimit(l).map{ ll =>
            (
              Interval.atOrAbove(ll.effectiveYear),
              Interval.atOrAbove(ll.effectiveMonth),
              Interval.atOrAbove(ll.effectiveWeek),
              Interval.atOrAbove(ll.effectiveFourWeek)
            )
          }

        case upperBounded(u) =>
          lookupLimit(u).map{ ul =>
            (
              Interval.openUpper(Money.Zero, ul.effectiveYear),
              Interval.openUpper(Money.Zero, ul.effectiveMonth),
              Interval.openUpper(Money.Zero, ul.effectiveWeek),
              Interval.openUpper(Money.Zero, ul.effectiveFourWeek)
            )
        }

        case bothBounded(l,u) => (lookupLimit(l), lookupLimit(u)).mapN{ case (ll, ul) =>
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
        (summaryName, hideOnSummary) match {
          case (Some(sn), _) => Some(sn)
          case (_, Some(false)) => Some(name)
          case _ => None
        },
        summaryCategories,
        (summaryContributionsName, hideContributonsOnSummary) match {
          case (Some(sn), _) => Some(sn)
          case (_, Some(false)) => Some(name)
          case _ => None
        },
        summaryContributionsCategories,
        grossPayExceptions
      )
    }
  }

  object VagueRateDefinition {
    val bothBounded = "([a-zA-Z0-9_ ]*) to ([a-z0-9_ ]*)".r
    val lowerBounded = "above ([a-z0-9_ ]*)".r
    val upperBounded = "up to ([a-z0-9_ ]*)".r
  }

}
