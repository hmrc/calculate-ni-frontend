import spire.math.Interval
import spire.math.interval._
import spire.implicits._
import java.time.LocalDate

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

  }

  implicit class RichIntervalMap[K,V](value: Map[Interval[K],V]) {
    def at(in: K)(implicit o: spire.algebra.Order[K]): Option[V] = value.collectFirst{case (k,v) if k.contains(in) => v}
  }

  implicit def localDateOrder = new spire.algebra.Order[LocalDate] {
    def compare(x: LocalDate, y: LocalDate): Int = x.toEpochDay compare y.toEpochDay
  }

  implicit class RichList[K,V](in: List[(K,V)]) {
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

  def yearToPeriod(in: Int): Interval[LocalDate] = {
    val start = LocalDate.of(in, 4, 5)
    Interval.openUpper(start, start plusYears 1)
  }

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

}
