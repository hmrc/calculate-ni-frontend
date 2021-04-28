package eoi
package importer

import java.time.LocalDate
import spire.math.Interval
import cats.implicits._
import java.io._
import scala.collection.immutable.ListMap
import BigDecimal.RoundingMode.HALF_UP
import Configurable._
import pureconfig._, syntax._
import ConfigWriterInstances._

object Importer2 {

  implicit class RichStrStrMap(val underlying: Map[String,String]) extends AnyVal {
    def getMoney(key: String): Money = getMoneyOpt(key).get
    def getMoneyOpt(key: String): Option[Money] =
      underlying.get(key).flatMap(MoneyStr.unapply)

    def getPercent(key: String): Percentage = getPercentOpt(key).get
    def getPercentOpt(key: String): Option[Percentage] =
      underlying.get(key).flatMap(PercentageStr.unapply)

    def getDate(key: String) = getDateOpt(key).get
    def getDateOpt(key: String): Option[LocalDate] =
      underlying.get(key).map{ in => 
        val fst = in.takeWhile(_ != ' ')
        val (y::m::d::_) = fst.split("/").toList
        LocalDate.of(y.toInt,m.toInt,d.toInt)
      }
  }

  def limitsOld(
    bands: Map[String,String],
  ): Map[String, Limit] =  {
    // up to 5 'bands' - Wk, Mnth and Ann values, e.g. - 'Ann Band 4'
    // 'bands' 1 and 5 always present
    // 'bands' 2-4 present when year > 1984
    // these are actually limits, not bands, despite what the access db says
    val indexedLimits = (1 to 5).map { i =>
      (
        bands.get(s"Wk Band $i").map(x => Money(BigDecimal(x))),
        bands.get(s"Mnth Band $i").map(x => Money(BigDecimal(x))),
        bands.get(s"Ann Band $i").map(x => Money(BigDecimal(x))),
      ).tupled
    }.toList.flatten

    val limitNames = indexedLimits.size match {
      case 0 => Vector()
      case 2 => Vector("LEL", "UEL")
      case 5 => Vector("LEL", "", "", "", "UEL")
      case _ => sys.error(s"I don't know how to label the bands $bands")
    }

    val limits = (limitNames zip indexedLimits).filter(_._1.nonEmpty)

    limits.toMap.mapValues { case (week, mnth, year) =>
      Limit(
        None,
        year,
        Some(mnth),
        Some(week),
        None
      )
    }
  }

  def restructureRates(
    in: Map[Char,Map[String,String]]
  ) = 
    in.mapValues(_.toList).toList.flatMap { case (cat,bx) =>
      bx.collect{
          case (bandName, PercentageStr(rate)) if rate != Percentage.Zero =>
            val isRebate = bandName.toLowerCase.contains("rebate")
            (bandName, (cat, if (isRebate) -rate else rate))
        }
    }.toGrouping.mapValues(_.toMap)

  def hasCombinedEe(dataRaw: Map[String,String]): Boolean = ( 
    dataRaw.get("AnnEE_ET"),
    dataRaw.get("AnnER_ET")
  ).mapN(_ == _).getOrElse(false)

  def limitsNew(
    on: Interval[LocalDate],
    dataRaw: Map[String,String],
  ): Map[String, Limit] = {
    import BigDecimal.RoundingMode.CEILING

    val year = on.lowerValue.get.getYear
    def convertName(in: String): String = in match {
//      case "EE_ET" | "ER_ET" if hasCombinedEe(dataRaw) => "ET"
      case "EE_ET" => "PT"
      case "ER_ET" => "ST"
      case x => x
    }

    dataRaw
      .filter{case (k,v) => v != "0" && !k.startsWith("Tax")}
      .map{case (k,v) => k.splitAtWordBoundary -> v}
      .groupBy(_._1._2)
      .mapValues{_.map{case ((p,_),v) => p -> Money(BigDecimal(v))}}
      .map{ case (k,m) => convertName(k) -> 
        Limit(
          None,
          m("Ann"),
          m.get("Mnth"),
          m.get("Wk"),
          if (year == 1999) m.get("Wk").map(_ * 4) else m.get("Ann").map(x => (x / 13).setScale(0, CEILING))
        )
      }
  }

  def classOneOld(
    on: Interval[LocalDate],
    limits: Map[String, Limit],
    rates: Map[String, Map[Char, Percentage]],
    rawBands: Map[String,String],
  ): Map[String, RateDefinition.VagueRateDefinition] = {

    if(on.lowerValue.get.getYear < 1985) {
      Map(
        "Up to LEL" -> RateDefinition.VagueRateDefinition(
          None, None, None, None,
          grossPayExceptions = List(
            GrossPayException(
              year = Interval.above(limits("LEL").year),
              month = limits("LEL").month.map{m => Interval.above(m)},
              week = limits("LEL").week.map{w => Interval.above(w)},
              fourWeek = limits("LEL").fourWeek.map{f => Interval.above(f)},
              employee = rates("Up to LEL1 (employee)"),
              employer = rates("Up to LEL1 (employer)")
            )
          )
        ),
        "LEL to UEL" -> RateDefinition.VagueRateDefinition(
          None, None, None, None,
          rates.getOrElse("Employee Rte 1", Map.empty),          
          rates.getOrElse("Employer Rte 4", Map.empty)
        ),
        "Above UEL" -> RateDefinition.VagueRateDefinition(
          None, None, None, None,
          Map.empty,          
          rates.getOrElse("Above UEL (employer)", Map.empty)
        )
      )
    } else {

      val moneyBands: Map[String, Money] = rawBands.collect {
        case (k,MoneyStr(m)) => (k,m)
      }

      def exceptionBand(eeRate: String, erRate: String, from: String, to: Option[String]) =
        GrossPayException(
          year = to.fold(Interval.above(moneyBands("Ann " + from)))(t => Interval.openLower(moneyBands("Ann " + from), moneyBands("Ann " + t))),
          month = Some(to.fold(Interval.above(moneyBands("Mnth " + from)))(t => Interval.openLower(moneyBands("Mnth " + from), moneyBands("Mnth " + t)))),
          week = Some(to.fold(Interval.above(moneyBands("Wk " + from)))(t => Interval.openLower(moneyBands("Wk " + from), moneyBands("Wk " + t)))),
          fourWeek = None,
          employee = rates.getOrElse(eeRate, Map.empty),
          employer = rates.getOrElse(erRate, Map.empty),
        )

      Map(
        "Up to LEL" -> RateDefinition.VagueRateDefinition(
          None, None, None, None,
          Map.empty,          
          Map.empty,
          grossPayExceptions = (1 to 4).toList.map { i => 
            exceptionBand(s"Up to LEL$i (employee)", s"Up to LEL$i (employer)", s"Band $i", Some(s"Band ${i+1}").filter(_ => i != 4))
          }
        ),
        "LEL to UEL" -> RateDefinition.VagueRateDefinition(
          None, None, None, None,
          Map.empty,          
          Map.empty,
          grossPayExceptions = (1 to 4).toList.map { i => 
            exceptionBand(s"Employee Rte $i", s"Employer Rte $i", s"Band $i", Some(s"Band ${i+1}").filter(_ => i != 4))
          }
        ),
        "Above UEL" -> RateDefinition.VagueRateDefinition(
          None, None, None, None,
          Map.empty,          
          employer = rates.getOrElse("Above UEL (employer)", Map.empty)
        )
      )
    }
  }

  def classOneNew(
    on: Interval[LocalDate], 
    limits: Map[String, Limit], 
    rates: Map[String, Map[Char, Percentage]],
    bands: Map[String,String],
  ): Map[String, RateDefinition.VagueRateDefinition] = {

    val year = on.lowerValue.get.getYear

    object BandName{
      def unapply(name: String) = name match {
        case "AboveUEL" => Some("Above UEL")
        case "AboveUAP" => Some("UAP to UEL")
        case "RebateToST" => Some("LEL to ST Rebate")
        case "NICRebate" => Some("LEL to PT Rebate")                    
        case x => Some(x)
      }
    }

    object Split {
      def unapply(in: String): Option[(String, String)] = in.split("_").toList match {
        case ("EE"::xs) => Some(("EE" -> xs.mkString(" ")))
        case ("ER"::xs) => Some(("ER" -> xs.mkString(" ")))
        case _ => None
      }
    }

    rates.keys.map(_.replace(" ", "_")).flatMap {
      case Split(_, "NIC Rebate") =>
        val title = if (year == 1999) "PT to ST Rebate" else "LEL to PT Rebate"
        List(title -> RateDefinition.VagueRateDefinition(
          None, None, None, None,
          rates.getOrElse("EE NIC Rebate", Map.empty),
          rates.getOrElse("ER NIC Rebate", Map.empty)
        ))        
      case Split(_, "RebateToST") =>
        val ikRebateRates = rates.map {
          case (k,v) => (k, v.filter(x => x._1 == 'I' || x._1 == 'K'))
        }.filter(_._2.nonEmpty)

        List (
          Some("LEL to ST Rebate" -> RateDefinition.VagueRateDefinition(
            None, None, None, None,
            rates.getOrElse("EE_RebateToST", Map.empty),
            rates.getOrElse("ER_RebateToST", Map.empty)
          )),
          Some("ST to UAP Rebate" -> RateDefinition.VagueRateDefinition(
            None, None, None, None,
            ikRebateRates.getOrElse("EE_RebateToST", Map.empty),
            ikRebateRates.getOrElse("ER_RebateToST", Map.empty)
          )).filter(_ => ikRebateRates.nonEmpty)
        ).flatten
      case Split(_, "Rate") =>
        val highPoint = if (limits.keys.toList.contains("UAP")) "UAP" else "UEL"

        List(
          s"PT to $highPoint" -> RateDefinition.VagueRateDefinition(
            None, None, None, None,
            rates.getOrElse("EE_Rate", Map.empty),
            Map.empty
          ),
          s"ST to $highPoint" -> RateDefinition.VagueRateDefinition(
            None, None, None, None,
            Map.empty,
            rates.getOrElse("ER_Rate", Map.empty)
          )
        )
      case Split(_, key@BandName(bandName)) =>      
        List(bandName -> RateDefinition.VagueRateDefinition(
          None, None, None, None,
          rates.getOrElse("EE_" + key, Map.empty),
          rates.getOrElse("ER_" + key, Map.empty)
        ))
      case _ => Nil
    }.toMap
  }

  def getClassTwo(c: Map[String, String]): ClassTwo.ClassTwoVague = 
    ClassTwo.ClassTwoVague(
      ClassTwoRates(
        c.getMoney("Men Wk Rte"), // default
        c.getMoneyOpt("Shre Fish Wk Rte"), // fishermen
        c.getMoneyOpt("VDW Wk Rte") // voluntary
      ),
      c.getMoneyOpt("SEE Limit"), // smallEarningsException
      c.getDateOpt("HRP Date"), // hrpDate
      c.getDateOpt("Fnl Dte For Pen"), // finalDate
      52, // noOfWeeks =
      c.getMoney("EF Qual Year"), // qualifyingRate =
      None // lel
    )

  def getClassThree(c: Map[String, String]) = ClassThree.ClassThreeVague(
    c.getDateOpt("Fnl Dte For Pen"), // finalDate: Option[LocalDate],
    c.getMoney("Wk Rte"), // weekRate: Money,
    None, // hrpDate: Option[LocalDate],
    c("No Of Weeks").toInt, // noOfWeeks: Int = 52,
    None, // lel: Option[Money],
    c.getMoneyOpt("EF Qual Year") // qualifyingRate: Option[Money]
  )

  def getClassFour(c: Map[String, String]) = ClassFour(
    c.getMoney("ANN LEL"), //lowerLimit: Money,
    c.getMoney("ANN UEL"), // upperLimit: Money,
    c.getPercent("PRCNT Rate"), // mainRate: Percentage,
    c.getPercentOpt("RateAboveUEL").getOrElse(Percentage.Zero) // upperRate: Percentage = Percentage.Zero
  )

  def getConfigurationPeriod(
    on: Interval[LocalDate],
    c1RatesPre1999: Option[Map[Char,Map[String,String]]],
    c1RatesPost1999: Option[Map[Char,Map[String,String]]],    
    c1BandsPre1999: Map[String,String],
    c1BandsPost1999: Map[String,String],    
    class2: Option[Map[String,String]],
    class3: Option[Map[String,String]],
    class4: Option[Map[String,String]]
  ) = {
    val limits = limitsOld(c1BandsPre1999) ++ limitsNew(on, c1BandsPost1999)
    val pre1999Rates: Option[Map[String,RateDefinition.VagueRateDefinition]] = c1RatesPre1999.map{c1r => classOneOld(on, limits, restructureRates(c1r), c1BandsPre1999)}
    val post1999Rates: Option[Map[String,RateDefinition.VagueRateDefinition]] = c1RatesPost1999.map{c1r => classOneNew(on, limits, restructureRates(c1r), c1BandsPost1999)}
    ConfigurationPeriod(
      limits,
      (pre1999Rates orElse post1999Rates),
      class2.map(getClassTwo),
      class3.map(getClassThree),
      class4.map(getClassFour),
      None
    )
  }

  def getNewConfig(): Configuration = {

    /** Some of the tables have multiple rows per year and need to be subgrouped by category */
    val subCatGrouping = (_: List[Map[String, String]]).collect {
      case l if l("Cat").length == 1 => l("Cat").head -> l
    }.toMap

    val c1RatesPre1999: Map[Interval[LocalDate], Map[Char, Map[String, String]]] =
      csvFile("CLASS 1 RATE TABLE", subCatGrouping)
        .filterKeys(_ < TaxYear(1999).asInterval)

    val c1RatesPost1999: ListMap[Interval[LocalDate], Map[Char, Map[String, String]]] =
      csvFile("tblClass1_1999", subCatGrouping)

    val c1BandsPre1999 = csvFile("BAND TABLE")
    val c1BandsPost1999 = csvFile("tblBandLimits1999")
    val class2 = csvFile("CLASS 2 RATE TABLE")
    val class3 = csvFile("CLASS 3 RATE TABLE")
    val class4 = csvFile("CLASS 4 RATE TABLE")

    // we want to group them - year { class-one {} class-two {} }
    val allTimePeriods = List(
      c1RatesPre1999.keys,
      c1RatesPost1999.keys,
      class2.keys,
      class3.keys,
      class4.keys
    ).flatten.sorted.distinct

    val data: Map[Interval[LocalDate], ConfigurationPeriod] =
      allTimePeriods.map{ on =>

        on -> getConfigurationPeriod(
          on,
          c1RatesPre1999.get(on),
          c1RatesPost1999.get(on),
          c1BandsPre1999.at(on.lowerValue.get).getOrElse(Map.empty),
          c1BandsPost1999.getOrElse(on, Map.empty),
          class2.get(on),
          class3.get(on),
          class4.get(on)
        )
      }.toMap

    Configuration(
      Map.empty,
      data,
      Map.empty,
      Map.empty
    )
  }

  def main(args: Array[String]): Unit = println(
    writeConfig(getNewConfig.toConfig)
  )


  // def main(args: Array[String]): Unit = writeToFile(
  //   new File("national-insurance-new.conf"),
  //   writeConfig(getNewConfig.toConfig)
  // )
}
