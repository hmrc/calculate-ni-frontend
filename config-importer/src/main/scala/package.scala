package eoi

import com.github.tototoshi.csv._
import java.util.Locale
import java.text.NumberFormat
import scala.collection.immutable.ListMap
import java.time.LocalDate
import spire.math.Interval
import java.io._

package object importer extends Configurable.ToConfigurableOps { 

  implicit class RichTupleIterable[A,B](value: Iterable[(A,B)]) {
    def toGrouping: Map[A, List[B]] =
      value.toList.groupBy(_._1).mapValues(_.map(_._2))
  }

  def slidingOpenRight[A](in: List[A]): List[List[A]] =
    in.sliding(2).toList ++ List(List(in.last))

  private val percentFormat = {
    val r = NumberFormat.getPercentInstance(Locale.UK)
    r.setMaximumFractionDigits(2)
    r
  }

  private val penceFormat = {
    val r = NumberFormat.getCurrencyInstance(Locale.UK)
    r.setMinimumFractionDigits(2)
    r.setMaximumFractionDigits(2)
    r.setGroupingUsed(false)
    r
  }

  private val poundsFormat = {
    val r = NumberFormat.getCurrencyInstance(Locale.UK)
    r.setMinimumFractionDigits(0)
    r.setMaximumFractionDigits(0)
    r.setGroupingUsed(false)    
    r
  }

  implicit class RichBD(in: BigDecimal) {
    def formatMoney: String = if(in.isWhole()) poundsFormat.format(in) else penceFormat.format(in)
    def formatPercent: String = percentFormat.format(in)    
  }

  implicit class RichString(in: String) {

    def splitAtWordBoundary: (String, String) = {
      @annotation.tailrec
      def inner(acc: String, rem: String): (String, String) = {
        rem.headOption match {
          case None => (acc, "")
          case Some(x) if x.isUpper => (acc, rem)
          case Some(x) => inner(acc :+ x, rem.drop(1))
        }
      }
      inner(in.headOption.fold("")(_.toString), in.drop(1))
    }

    def repeat(times: Int): String = {
      @annotation.tailrec
      def inner(rem: Int = times - 1, acc: String = in): String = rem match {
        case 0 => acc
        case _ => inner(rem - 1, in ++ acc)
      }
      inner()
    }

    def needsQuoting: Boolean = in.contains(" ") || in.contains(",")

    def optQuoted = if (needsQuoting) s"""\"$in\"""" else in

    def is(msg: String): String = 
      s"""|$in {
          |${msg.indent(1)}
          |}""".stripMargin

    def indent(cols: Int): String = in.lines.map("  ".repeat(cols) ++ _).mkString("\n")

    def formatPercent: String = BigDecimal(in.replace("%","")).formatPercent

    def formatMoney: String = BigDecimal(in).formatMoney
    
    def formatDate: String = {
      val fst = in.takeWhile(_ != ' ')
      val (y::m::d::_) = fst.split("/").toList
      s"$y-$m-$d"
    }
  }

  def csvFile[A](
    file: String,
    conversion: List[Map[String, String]] => A = (_: List[Map[String, String]]).head
  ): ListMap[Interval[LocalDate], A] = {
    val reader = CSVReader.open("config-importer/src/main/resources/" ++ file ++ ".csv")
    val lines = reader.all
    val (headers::data) = lines.map(_.map(_.trim))

    // because the rows have a start point (some week in some year)
    // but not an end point, we need to pair them with the subsequent
    // line before we can determine the interval
    val datedUngrouped: List[(LocalDate, Map[String, String])] = (data map { case line =>
      val lineMap = (headers zip line).toMap.filter(_._2.nonEmpty)
      val year = lineMap("Tax Yr").toInt
      val dateInterval: LocalDate = lineMap.get("Start Wk") orElse lineMap.get("Start Week") match {
        case None | Some("1") => TaxYear(year).start
        case Some(startWeek) => TaxYear(year).start.plusWeeks(startWeek.toInt - 1)
      }
      dateInterval -> lineMap
    })

    val dated = datedUngrouped.groupBy(_._1).mapValues(x => conversion(x.map(_._2))).toList.sortBy(_._1)

    val ret = slidingOpenRight(dated) map {
      case (start,record) :: (end,_) :: Nil =>
        Interval.closed(start, end.minusDays(1)) -> record
      case (start,record) :: Nil =>
        Interval.closed(start, start.plusYears(1).minusDays(1)) -> record
      case _ => sys.error("slidingOpenRight should only ever have 1 or 2 subentries per element")
    }
    reader.close
    ListMap(ret:_*)
  }

  /** possibly shortened back into a year again. */
  def formatPeriod(on: Interval[LocalDate]): String = TaxYear.unapply(on) match {
    case Some(taxYear) => taxYear.toString
    case None => s"""\"${on.toString.replace(" ", "")}\""""
  }

  def writeToFile(file: File, str: String): Unit = {
    val pr = new PrintWriter(file)
    pr.write(str)
    pr.close
  }

}
