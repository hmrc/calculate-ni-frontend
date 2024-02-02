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

import spire.algebra.Field
import cats.syntax.either._

case class Percentage(value: BigDecimal) extends AnyVal {
  def *(money: Money): Money = Money(money.value * value)  

  override def toString: String =
    (value * 100).underlying.stripTrailingZeros.toPlainString + "%"

  def abs: Percentage = Percentage(value.abs)

  def toDouble: Double = value.toDouble  
}

object Percentage {
  val Zero = Percentage(BigDecimal("0"))

  implicit val percentageSpireField: Field[Percentage] = {
    import spire.std.bigDecimal._
    Field[BigDecimal].imap(Percentage.apply)(_.value)
  }
  implicit def percentageNumeric(implicit u: Numeric[BigDecimal]): Numeric[Percentage] =
    u.imap(Percentage.apply)(_.value)
  implicit val percentageCatsOrder: cats.Order[Percentage] = cats.Order.fromOrdering(percentageNumeric)

  def apply(in: String): Percentage = Percentage(in)  
}

object PercentageStr {
  def unapply(in: String): Option[Percentage] = {
    Either.catchOnly[NumberFormatException](Percentage(BigDecimal(in))).toOption
  }
}
