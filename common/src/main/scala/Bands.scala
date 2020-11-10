package eoi

import spire.math.Interval
import spire.implicits._

case class Bands(
  year: Interval[BigDecimal],
  month: Option[Interval[BigDecimal]] = None,
  week: Option[Interval[BigDecimal]] = None,
  fourWeek: Option[Interval[BigDecimal]] = None
) {
  def interval(period: Period.Period, qty: Int = 1): Interval[BigDecimal] = {
    val raw = period match {
      case Period.Year => year
      case Period.Month => (month.getOrElse((year / 12)) * qty)
      case Period.Week => (week.getOrElse((year / 52)) * qty)
      case Period.FourWeek => (fourWeek.getOrElse((year / 13)) * qty)
    }
    raw.mapBounds(_.setScale(2, BigDecimal.RoundingMode.HALF_UP))
  }
}

object Bands {
  def all = new Bands(Interval.all)
}
