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

import spire.math.Interval
import spire.math.interval._
import spire.implicits._
import java.time.{LocalDate, DayOfWeek}

package object eoi {

  implicit class RichBD(val in: BigDecimal) extends AnyVal {
    def roundHalfDown: BigDecimal =
      in.setScale(2, BigDecimal.RoundingMode.HALF_DOWN)

    def positiveOrZero: BigDecimal = if (in > 0) in else 0

    def roundUpWhole: BigDecimal =
      in.setScale(0, BigDecimal.RoundingMode.CEILING)

    def banded(bandHead: BigDecimal, bandTail: BigDecimal*): List[BigDecimal] = {
      val bands = bandHead :: bandTail.toList
      val deltas = (BigDecimal(0) :: bands).sliding(2).map{
        case (l::h::Nil) => h - l
        case _ => throw new IllegalStateException("Impossible!")
      }

      @annotation.tailrec
      def inner(rem: BigDecimal, bandsRemaining: List[BigDecimal], out: List[BigDecimal]): (List[BigDecimal], BigDecimal) = bandsRemaining match {
        case Nil => (out, rem)
        case (x::xs) if rem > x => inner(rem - x, xs, x :: out)
        case (x::xs) if rem <= x => ( xs.map{_ => BigDecimal(0)} ++ (rem :: out), 0)
      }

      val (bandsOut, remaining) = inner(in, deltas.toList, Nil)
      (remaining :: bandsOut).reverse
    }

    def inBand(band: Interval[BigDecimal]): BigDecimal = {

      val i = band.intersect(Interval(BigDecimal(0), in))
      (i.upperBound - i.lowerBound) match {
        case Closed(amt) => amt
        case Open(amt) => amt
        case EmptyBound() => 0
        case Unbound() => 0
      }
    }

    def formatSterling: String = formatSterling(false)

    def formatSterling(alwaysShowPence: Boolean): String =
      if (in.isWhole && !alwaysShowPence) f"£${in}%,.0f" else f"£${in}%,.2f"

    def formatPercentage: String = {
      val p = in * 100
      if (p.isWhole) {
        f"${p}%.0f%%"
      } else {
        f"${p}%.20f".
          reverse.
          dropWhile(_ == '0').
          reverse + "%"
      }
    }

    /** Round half-up to the nearest penny if the midpoint is 0.6 for
      * positive values, half down for negative values. 
      * 
      * {{{
      * BigDecimal("0.0059999").roundNi == 0.00
      * BigDecimal("0.006").roundNi == 0.01
      * }}}
      */
    def roundNi: BigDecimal = {
      import BigDecimal.RoundingMode._
      if (in <= 0) in.setScale(2, HALF_DOWN)
      else in.setScale(3, FLOOR).setScale(2, HALF_DOWN)
    }
  }

  implicit class RichIntervalMap[K,V](value: Map[Interval[K],V]) {
    def at(in: K)(implicit o: spire.algebra.Order[K]): Option[V] =
      value.collectFirst{case (k,v) if k.contains(in) => v}

    def findAt(in: K)(implicit o: spire.algebra.Order[K]): Option[(Interval[K],V)] =
      value.find{case (k,v) => k.contains(in)}
  }

  implicit def localDateOrder = new spire.algebra.Order[LocalDate] {
    def compare(x: LocalDate, y: LocalDate): Int = x.toEpochDay compare y.toEpochDay
  }

  implicit class RichListPair[K,V](in: List[(K,V)]) {
    /** Build a map from a list of key/value pairs with a combining function. */
    def toMapWith(f: (V, V) => V): Map[K,V] = {
      in.groupBy(_._1).mapValues(_.map(_._2).reduce(f))
    }
  }

  implicit class RichBufferedIterator[A](value: BufferedIterator[A]) {
    /** Takes longest prefix of values produced by this iterator that satisfy a predicate. 
      * Does not consume any values that do not pass the predicate test.
      *
      *  @param   p  The predicate used to test elements.
      *  @return  An iterator returning the values produced by this iterator, until
      *           this iterator produces a value that does not satisfy
      *           the predicate `p`.
      *  @note    Reuse: $consumesAndProducesIterator
      */
    def safeTakeWhile(p: A => Boolean): Iterator[A] = {
      new scala.collection.AbstractIterator[A] {
        def hasNext: Boolean = value.headOption.fold(false)(p)
        def next(): A = value.next
      }
    }
  }

  val Zero = BigDecimal("0")

  implicit class RichInterval[A](in: Interval[A]) {
    def lowerValue: Option[A] = in.lowerBound match {
      case Open(a) => Some(a)
      case Closed(a) => Some(a)
      case _ => None
    }

    def upperValue: Option[A] = in.upperBound match {
      case Open(a) => Some(a)
      case Closed(a) => Some(a)
      case _ => None
    }
    
  }

  implicit class RichDateInterval(inner: Interval[LocalDate]) {

    import cats.implicits._

    def expandedToTaxWeeks: Option[Interval[LocalDate]] = 
      (inner.lowerBound, inner.upperBound) match {
        case (ValueBound(startRaw), ValueBound(endRaw)) =>

          val start = startRaw.previousOrSame(DayOfWeek.SUNDAY)
          val end = endRaw.nextOrSame(DayOfWeek.SATURDAY)
          Some(Interval.closed(
            start, 
            end
          ))
        case _ => None
      }

    def taxWeekBreakdown: Seq[(TaxYear, Int)] = {
      (inner.lowerBound, inner.upperBound, expandedToTaxWeeks) match {
        case (ValueBound(start), ValueBound(end), Some(expanded)) =>
          (start.getYear - 1 to end.getYear)
            .map(TaxYear.apply)
            .map { year =>
              year -> (expanded intersect year.asIntervalWeeks).numberOfWeeks().getOrElse(0)
            }.filter(_._2 != 0)
        case _ => throw new IllegalArgumentException("Unbounded interval")
      }
    }

    def numberOfTaxWeeks: Option[Int] =
      expandedToTaxWeeks flatMap (_.numberOfWeeks())

    def numberOfWeeks(
      rounding: BigDecimal.RoundingMode.Value = BigDecimal.RoundingMode.UP
    ): Option[Int] = {

      val startDate = inner.lowerBound match {
        case Open(a) => a.plusDays(1).some
        case Closed(a) => a.some
        case _ => None
      }

      val endDate = inner.upperBound match {
        case Open(a) => a.some
        case Closed(a) => a.plusDays(1).some
        case _ => None
      }

      (startDate, endDate) mapN ( (s,e) =>
        (BigDecimal(e.toEpochDay() - s.toEpochDay()) / 7)
          .setScale(0, rounding).toInt
      )
    }
  }

  type Explained[A] = cats.data.Writer[Vector[String], A]

  implicit class RichAnything[A](in: A) {
    def gives(msg: String): Explained[A] = {
      import cats.data.Writer._
      tell(Vector(msg + " = " + in.toString)) flatMap {_ => value[Vector[String], A](in)}
    }
  }

  implicit class RichExplained[A](in: Explained[A]) {
    def explain: List[String] =
      in.written.toList.dedupPreserveOrder
  }

  implicit class RichList[A](in: List[A]) {
    def dedupPreserveOrder: List[A] = collection.mutable.LinkedHashSet(in:_*).toList
  }

  implicit class RichLocalDate(val value: LocalDate) extends AnyVal {

    // we can't use TemporalAdjusters here because it's not supported in scalajs 0.6
    def previousOrSame(day: java.time.DayOfWeek): LocalDate = {
      val diff = ((value.getDayOfWeek.getValue + 7) - day.getValue) % 7
      value.minusDays(diff)
    }

    def nextOrSame(day: java.time.DayOfWeek): LocalDate = {
      val diff = ((day.getValue + 7) - value.getDayOfWeek.getValue) % 7
      value.plusDays(diff)
    }
  }

}
