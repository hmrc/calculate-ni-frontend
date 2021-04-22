package eoi
package importer

import java.time.LocalDate
import spire.math.Interval
import cats.implicits._
import java.io._
import scala.collection.immutable.ListMap
import BigDecimal.RoundingMode.HALF_UP
import Configurable._

object Importer {

  type YearAndCatMap = Map[Interval[LocalDate], Map[Char, Map[String, String]]]

  // val autoAddBlankBands = List(
  //   ""
  // )

  val autoExciseBands = List(
    "AboveAUST", "AboveUST"
  )

  def rateBlockOld(
    bandName : String,
    data: Map[String,Map[BigDecimal,String]],
    exceptions: List[String]
  ) : String = {
    val exceptionsBlock = exceptions match {
      case Nil => None
      case x => Some("gross-pay-exceptions: [\n" ++ x.mkString(",\n").indent(1) ++ "\n]")
    }

    bandNameConversion(bandName) is {
      List(
        data.get("EE").map{ee => subBlock(None, "employee", ee)},
        data.get("ER").map{er => subBlock(None, "employer", er)},
        exceptionsBlock
      ).flatten.mkString("\n")
    }
  }

  def rateBlock(
    bandName : String,
    data: Map[String,Map[BigDecimal,String]]
  ) : String = bandName match {
    case "Rate" => rateBlock("PT to UEL", data.filter(_._1 == "EE")) ++ "\n" ++
      rateBlock("ST to UEL", data.filter(_._1 == "ER"))
    case _ =>
      (data.get("EE"), data.get("ER")) match {
        case (Some(ee),Some(er)) =>
          bandNameConversion(bandName) is {
            subBlock(None, "employee", ee) + "\n" +
            subBlock(None, "employer", er) 
          }
        case (Some(ee),None) => subBlock(Some(bandName), "employee", ee)
        case (None, Some(er)) => subBlock(Some(bandName), "employer", er)
        case _ => bandNameConversion(bandName) + " { }"
      }
  }

  def limitsOld(bands: Map[String, String]): String = "limits" is {
    // up to 5 'bands' - Wk, Mnth and Ann values, e.g. - 'Ann Band 4'
    // 'bands' 1 and 5 always present
    // 'bands' 2-4 present when year > 1984
    // these are actually limits, not bands, despite what the access db says
    val indexedLimits = (1 to 5).map { i =>
      (
        bands.get(s"Wk Band $i").map(BigDecimal.apply),
        bands.get(s"Mnth Band $i").map(BigDecimal.apply),
        bands.get(s"Ann Band $i").map(BigDecimal.apply),
      ).tupled
    }.toList.flatten

    val limitNames = indexedLimits.size match {
      case 2 => Vector("LEL", "UEL")
      case 5 => Vector("LEL", "", "", "", "UEL")
      case _ => sys.error(s"I don't know how to label the bands")
    }

    val limits = (limitNames zip indexedLimits).filter(_._1.nonEmpty)

    limits.map { case (k, (weekBD, mnthBD, year)) =>
      val month = Some(mnthBD).filter(_ != (year / 12).setScale(0, HALF_UP))
      val week = Some(weekBD).filter(_ != (year / 52).setScale(0, HALF_UP))

      if(month.isEmpty && week.isEmpty) {
        s"$k.year: ${year.formatMoney}"
      } else {
        k is {List(
          Some(s"year: ${year.formatMoney}"),
          month.map(x => s"month: ${x.formatMoney}"),
          week.map(x => s"week: ${x.formatMoney}")
        ).flatten.mkString("\n")}
      }
    }.mkString("\n")
  }

  def limitsNew(dataRaw: Map[String, String]): String = "limits" is {
    val data = dataRaw
      .filter{case (k,v) => v != "0" && !k.startsWith("Tax")}
      .map{case (k,v) => k.splitAtWordBoundary -> v}
      .groupBy(_._1._2)
      .mapValues{_.map{case ((p,_),v) => p -> BigDecimal(v)}}
      .toList
      .sortBy(_._2("Ann"))
      .map { case (k, m) =>
        val year = m("Ann")
        val month = m.get("Mnth").filter(_ != (year / 12).setScale(0, HALF_UP))
        val week = m.get("Wk").filter(_ != (year / 52).setScale(0, HALF_UP))

        if(month.isEmpty && week.isEmpty) {
          s"$k.year: ${year.formatMoney}"
        } else {
          k is {List(
            Some(s"year: ${year.formatMoney}"),
            month.map(x => s"month: ${x.formatMoney}"),
            week.map(x => s"week: ${x.formatMoney}")
          ).flatten.mkString("\n")}
        }
      }
    data.mkString("\n")
  }

  type BandName = String
  type EeOrEr = String
  type Cats = String

  def c1old(rates: Map[Char, Map[String, String]], rawLimits: Map[String, String] = Map.empty): String = "class-one" is {

    val triggerBands: List[String] = rawLimits.toList.map{case (k,v) =>
      k.filter(_.isDigit) -> BigDecimal(v)
    }.filter(_._1.nonEmpty)
      .toGrouping
      .toList
      .sortBy(_._1.toInt)
      .map(_._2.sorted)
      .sliding(2)
      .collect { case ((aw::am::ay::Nil)::(bw::bm::by::Nil)::Nil) => 
        List(
          Some(s"year: [$ay,$by)"),
          Some(s"month: [$am,$bm)").filter(_ => am != (ay / 12).setScale(0, HALF_UP) || bm != (by / 12).setScale(0, HALF_UP)),
          Some(s"week: [$aw,$bw)").filter(_ => aw != (ay / 52).setScale(0, HALF_UP) || bw != (by / 52).setScale(0, HALF_UP))
        ).flatten.mkString("\n").stripMargin
      }.toList

    // < 1986 - bands are 'Up to LEL', 'LEL to UEL' and 'Above UEL'

    // 1986-1998 - bands are also 'Up to LEL', 'LEL to UEL' and 'Above UEL'
    // always the same within a band for EE, but rates triggered on gross pay for ER
    // on the access rates table 'Band One' lower limit is LEL, 'Band Four' upper limit is UEL

    val blockedNames = Set("Cat", "Tax Yr", "Start Month", "Start Week", "NI Surcharge")
    val flatStruct = for {
      (cat, m)         <- rates.toList
      (bandName, rateStr) <- m.toList if !blockedNames.contains(bandName) & rateStr != "0"
    } yield {

      def negateIfRebate(in: BigDecimal) = if (bandName.toLowerCase.contains("rebate")) -in else in

      val (designation, cleanedName) = if (bandName.toLowerCase.contains("employee"))
        ("EE", bandName.replace("(employee)","").replace("Employee","").filterNot(_.isDigit).trim)
      else
        ("ER", bandName.replace("(employer)","").replace("Employer","").filterNot(_.isDigit).trim)

      val groupNum = designation match {
        case "ER" if triggerBands.size > 2 => bandName.filter(_.isDigit)
        case _ => ""
      }

      val rate = if (bandName.toLowerCase.contains("rebate")) {
        -BigDecimal(rateStr)
      } else {
        BigDecimal(rateStr)
      }

      (
        cleanedName match {
          case "Rte" => "LEL to UEL"
          case x => x
        },
        (groupNum, (designation, (cat, rate))))
    }

    val restruct2 = flatStruct.toGrouping.mapValues(
      _.toGrouping.mapValues(
        _.toGrouping.mapValues(groupCatsByRate)))

    restruct2.map { case (bandName, group) =>

      val exceptions = group
        .filter(_._1.nonEmpty)
        .toList
        .sortBy(_._1.toInt)
        .map { case (k,v) =>
          "{\n" ++ List(
            Some(triggerBands(k.toInt - 1)),
            v.get("ER").map { d => subBlock(None, "employer", d)},
            v.get("EE").map { d => subBlock(None, "employee", d)}
          ).flatten.mkString("\n").indent(1) + "\n}"
      }

      rateBlockOld(bandName, List(
        group.get("").flatMap(_.get("EE")).map(x => "EE" -> x),
        group.get("").flatMap(_.get("ER")).map(x => "ER" -> x)
      ).flatten.toMap, exceptions)
    }.mkString("\n")

    // val restruct = flatStruct.groupBy(_._1).mapValues{
    //   _.groupBy(_._2).mapValues{x => groupCatsByRate(x.map{case (_, _, groupNum, cat, rate) => (groupNum, cat, rate)})}
    // }

    //restruct.map{case (k,v) => rateBlock(k,v)}.mkString("\n")
    // def convertName(in: String) = in.takeWhile(x => !x.isDigit).trim match {
    //   case "Rte" => "LEL to UEL"
    //   case x => x
    // }
//    restruct.groupBy(x => convertName(x._1).takeWhile(x => !x.isDigit)).map(_.toString).mkString("\n")

//    restruct.map{case (k,v) => rateBlock(k,v)}.mkString("\n")
//    restruct2.toList.map(_.toString).sorted.mkString("\n")
  }

  def c1new(rawRates: Map[Char, Map[String, String]]): String = "class-one" is {

    object Split {
      def unapply(in: String): Option[(String, String)] = in.split("_").toList match {
        case ("EE"::xs) => Some(("EE" -> xs.mkString(" ")))
        case ("ER"::xs) => Some(("ER" -> xs.mkString(" ")))
        case _ => None
      }
    }

    object Char {
      def unapply(in: String): Option[Char] =
        in.headOption.filter(_ => in.size == 1)
    }

    val rates: Map[BandName,Map[EeOrEr,Map[BigDecimal,Cats]]] =
      rawRates.toList.flatMap{case (cat,m) =>
        m.collect{
          case (Split(eer,g),r) if r != "0" =>
            (g,eer,cat, if (g.toLowerCase.contains("rebate")) -BigDecimal(r) else BigDecimal(r))
        }
      }.groupBy(x => x._1).mapValues{
        _.map{
          case (_,eer,c,r) => (eer,c,r)
        }.groupBy(_._1)
          .mapValues{
            _.map{
              case (_,c,r) => (c,r)
            }.groupBy(x => x._2).mapValues(_.map(_._1).sorted.mkString)
          }
      }

    rates.collect{case (k,v) if !autoExciseBands.contains(k) => rateBlock(k,v)}.mkString("\n")
  }

  def c2(c: Map[String, String]): String = "class-two" is {
    val hrpDate = c.get("HRP Date").map { d =>
      s"hrp-date: ${d.formatDate}"
    }.getOrElse("")

    val finalDate = c.get("Fnl Dte For Pen").map { d =>
      s"final-date: ${d.formatDate}"
    }.getOrElse("")

    val defaultRate = c("Men Wk Rte")
    def rateOpt(lookup: String, name: String): Option[(String, String)] =
      c.get(lookup).filter(_ != defaultRate).map(name -> _)

    val rates = List(
      ("default" -> defaultRate).some,
      rateOpt("Women Wk Rte", "women"),
      rateOpt("Shre Fish Wk Rte", "fishermen"),
      rateOpt("VDW Wk Rte", "volunteer")
    ).flatten.map{ case (k,v) => s"$k: ${v.formatMoney}" }.mkString("\n")

    s"""|${"weekly-rate".is(rates.indent(1))}
        |small-earnings-exception: ${c("SEE Limit").formatMoney}
        |$finalDate 
        |$hrpDate
        |no-of-weeks: ${c("No of Wks")}
        |qualifying-rate: ${c("EF Qual Year").formatMoney}""".stripMargin
  }

  def c3(c: Map[String, String]): String = "class-three" is {
    val finalDate = c.get("Fnl Dte For Pen").map { d =>
      s"final-date: ${d.formatDate}"
    }.getOrElse("")

    s"""|week-rate: ${c("Wk Rte").formatMoney}
        |$finalDate 
        |no-of-weeks: ${c("No Of Weeks")}
        |qualifying-rate: ${c("EF Qual Year").formatMoney}""".stripMargin
  }

  def c4(c: Map[String, String]): String = "class-four" is {
    s"""|lower-limit: ${c("ANN LEL").formatMoney}
        |upper-limit: ${c("ANN UEL").formatMoney}
        |main-rate: ${c("PRCNT Rate").formatPercent}
        |upper-rate: ${c.getOrElse("RateAboveUEL", "0").formatPercent}""".stripMargin
  }

  def main(args: Array[String]): Unit = {

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

    val file = new File("national-insurance-new.conf")
    val writer = new BufferedWriter(new FileWriter(file))

    allTimePeriods.map{ on =>

      val allSections = List(
        (c1BandsPost1999.get(on) map limitsNew) orElse (c1BandsPre1999.at(on.lowerValue.get) map limitsOld),
        (c1RatesPost1999.get(on) map c1new) orElse ( (c1RatesPre1999.get(on), c1BandsPre1999.at(on.lowerValue.get)).mapN(c1old) ),
        class2.get(on) map c2,
        class3.get(on) map c3,
        class4.get(on) map c4
      ).flatten

      val contents = s"""|${formatPeriod(on)} {
                         |${allSections.map(_.indent(1)).mkString("\n")}
                         |}
                         |""".stripMargin

      writer.write(contents)

      import sys.process._
//      "mv --backup=numbered national-insurance-new.conf national-insurance.conf".!!
    }
    writer.close()
  }
}
