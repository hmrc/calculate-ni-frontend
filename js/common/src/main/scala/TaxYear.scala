package eoi

import java.time.LocalDate

case class TaxYear(startingYear: Int) {
  def endingYear: Int = startingYear + 1
  def start = LocalDate.of(startingYear, 4, 6)
  def end = LocalDate.of(endingYear, 4, 5)
  def asInterval = {
    import spire.math.Interval
    Interval.openUpper(
      LocalDate.of(startingYear, 4, 6),
      LocalDate.of(endingYear, 4, 6)
    )
  }

  def pred = TaxYear(startingYear - 1)  
  def succ = TaxYear(endingYear)
}

object TaxYear {

  def unapply(in: String): Option[TaxYear] = {
    import cats.implicits._

    in.split("-").toList match {
      case (year::Nil) => Either.catchOnly[NumberFormatException](year.toInt).toOption.map(apply(_))
      case (st::en::Nil) => (
        Either.catchNonFatal((st.toInt,en.toInt)).flatMap
          {x => Either.catchNonFatal(apply(x._1,x._2))}
      ).toOption
      case _ => None
    }
  }

  def apply(start: Int, end: Int): TaxYear =
    if (start + 1 == end)
      TaxYear(start)
    else
      throw new IllegalArgumentException("end year must be start year + 1")
}

