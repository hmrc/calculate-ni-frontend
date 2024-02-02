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

case class Limit(
  fullName: Option[String], 
  year: Money,
  month: Option[Money],
  week: Option[Money],
  fourWeek: Option[Money]
) {

  private def calculatedMonth = (year / 12).setScale(0, BigDecimal.RoundingMode.HALF_UP)
  private def calculatedWeek = (year / 52).setScale(0, BigDecimal.RoundingMode.HALF_UP)
  private def calculatedFourWeek = (year / 13).setScale(0, BigDecimal.RoundingMode.HALF_UP)  

  def effectiveYear = year
  def effectiveMonth = month getOrElse calculatedMonth
  def effectiveWeek = week getOrElse calculatedWeek
  def effectiveFourWeek = fourWeek getOrElse calculatedFourWeek

  def simplify = Limit(
    fullName,
    year,
    month.filter(_ != calculatedMonth),
    week.filter(_ != calculatedWeek),
    fourWeek.filter(_ != calculatedFourWeek)
  )
}
