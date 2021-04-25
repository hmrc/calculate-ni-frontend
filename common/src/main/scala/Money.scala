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
import spire.math.interval._
import spire.algebra.Field
import cats.syntax.either._

case class Money(value: BigDecimal) extends AnyVal {
  def *(int: Int): Money = Money(value * int)
  def *(percentage: Percentage): Money = percentage * this
  def /(percentage: Percentage): Money = Money(value / percentage.value)  
  def setScale(dp: Int, roundingMode: BigDecimal.RoundingMode.Value) =
    Money(value.setScale(dp, roundingMode))

  def isWhole = value.isWhole()

  def roundUpWhole: Money =
    Money(value.setScale(0, BigDecimal.RoundingMode.CEILING))

  def roundNi: Money =
    Money(value.roundNi)

  def inBand(band: Interval[Money]): Money = {
    val i = band.intersect(Interval(Money.Zero, this))
    (i.upperBound - i.lowerBound) match {
      case Closed(amt) => amt
      case Open(amt) => amt
      case EmptyBound() => Money.Zero
      case Unbound() => Money.Zero
    }
  }
  
  def max(other: Money): Money =
    Money(value.max(other.value))

  def abs: Money = Money(value.abs)

  @deprecated("use toString", since = "0.178")
  def formatSterling: String = toString

  override def toString: String = s"£$value"

  def toInt: Int = value.toInt
}

object Money {
  val Zero = Money(BigDecimal("0"))
  implicit val moneySpireField: Field[Money] = {
    import spire.std.bigDecimal._
    Field[BigDecimal].imap(Money.apply)(_.value)
  }
  implicit def moneyNumeric(implicit u: Numeric[BigDecimal]): Numeric[Money] =
    u.imap(Money.apply)(_.value)
  implicit val moneyCatsOrder: cats.Order[Money] = cats.Order.fromOrdering(moneyNumeric)

  def apply(in: String): Money = Money(in)
  
}

object MoneyStr {
  def unapply(in: String): Option[Money] = {
    Either.catchOnly[NumberFormatException](Money(BigDecimal(in))).toOption
  }
}
