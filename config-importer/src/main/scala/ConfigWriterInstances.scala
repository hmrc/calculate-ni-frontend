package eoi
package importer

import pureconfig._
import pureconfig.syntax._
import com.typesafe.config._
import com.typesafe.config.ConfigRenderOptions.defaults
import collection.JavaConverters._
import java.time.format.DateTimeFormatter
import java.time.LocalDate
import pureconfig.configurable._
import spire.math.Interval
import pureconfig.generic.auto._

object ConfigWriterInstances {

  def writeConfig(in: ConfigValue, keys: String*): String = {

    val prefixNoColon = if (keys.isEmpty) "" else keys.map(_.optQuoted).mkString(".") + " "
    val prefix = if (keys.isEmpty) "" else prefixNoColon + "= "

    in match {
      case obj: ConfigObject =>
        obj.asScala.toList.sortBy(_._1) match {
          case (subkey,singleton) :: Nil => writeConfig(singleton, (keys :+ subkey):_*)
          case Nil => prefix + "{}"
          case xs =>
            s"""|${prefixNoColon}{
                |${xs.map{case (k,v) => writeConfig(v,k)}.mkString("\n").indent(1)}
                |}""".stripMargin
        }
      case javaList: ConfigList =>
        javaList.asScala.toList match {
          case Nil => ""
          case scalaList => 
            s"""|$prefix[
                |${scalaList.map(x => writeConfig(x)).mkString(",\n").indent(1)}
                |]""".stripMargin
        }
      case _ => prefix + in.unwrapped.toString.optQuoted
    }
  }

  val defaultRenderer =
    defaults.setJson(false).setOriginComments(false).setComments(false)    

  implicit def charBdWriter[A](implicit vr: ConfigWriter[A]): ConfigWriter[Map[Char, A]] = 
    ConfigWriter[Map[String, A]].contramap{ x => 
      x.groupBy(_._2).mapValues(_.map(_._1).mkString).map(_.swap)
    }

  implicit val localDateWriter: ConfigWriter[LocalDate] =
    localDateConfigConvert(DateTimeFormatter.ISO_DATE)

  implicit val taxPeriodWriter = new ConfigWriter[Interval[LocalDate]] {
    def to(in: Interval[LocalDate]): ConfigValue = in match {
      case TaxYear(y) => ConfigWriter[Int].to(y)
      case x => intervalWriter[LocalDate](_.toString).to(x)
    }
  }

  def intervalWriter[A](formatter: A => String): ConfigWriter[Interval[A]] = {
    import spire.math.interval._
    ConfigWriter[String].contramap{ x => 
      (x.lowerBound match {
        case Open(x) => "(" + formatter(x)
        case Closed(x) => "[" + formatter(x)
        case _ => sys.error("empty lower intervals not supported")
      }) + "," + (x.upperBound match {
        case Open(x) => formatter(x) + ")"
        case Closed(x) => formatter(x) + "]"
        case _ => "inf)"         
      })
    }
  }

  implicit val moneyIntervalWriter = intervalWriter[BigDecimal](_.toString)

  implicit val vagueRateDefinitionWriter =
    ConfigWriter[Map[String, ConfigValue]].contramap[RateDefinition.VagueRateDefinition] {
      rateDef =>
      import rateDef._
      val m: List[Option[(String,ConfigValue)]] = List(
        year.filterNot(x => x.isPoint || x.isEmpty).map{r => "year" -> r.toConfig},
        month.filterNot(x => x.isPoint || x.isEmpty).map{r => "month" -> r.toConfig},
        week.filterNot(x => x.isPoint || x.isEmpty).map{r => "week" -> r.toConfig},
        fourWeek.filterNot(x => x.isPoint || x.isEmpty).map{r => "four-week" -> r.toConfig},
        Some(employee).filter(_.nonEmpty).map{r => "employee" -> r.toConfig},
        Some(employer).filter(_.nonEmpty).map{r => "employer" -> r.toConfig},
        contractedOutStandardRate.map{r => "contracted-out-standard-rate" -> r.toConfig},
        Some(trigger).filter(_ != Bands.all).map{r => "trigger" -> r.toConfig},
        Some(hideOnSummary).filterNot(identity).map{r => "hide-on-summary" -> r.toConfig},
        Some("gross-pay-exceptions" -> ConfigWriter[List[GrossPayException]].to(grossPayExceptions))
      )
      m.flatten.toMap
    }

  implicit val confwriter_unofficialDeferment: ConfigWriter[Map[Class1Band, Map[Char, BigDecimal]]] = 
    ConfigWriter[Map[String, Map[Char, BigDecimal]]].contramap { data =>
      data.map{case (k,v) => (k.toString,v)}
    }

  implicit val winterestOnLatePayment: ConfigWriter[Map[Interval[LocalDate], BigDecimal]] = 
    ConfigWriter[Map[String, BigDecimal]].contramap { data =>
      data.map{case (k,v) => (k.toString.filterNot(_ == ' '),v)}
    }

  implicit val confPeriod = ConfigWriter[ConfigurationPeriod] // not sure why this is needed

  // implicit val wdata : ConfigWriter[Map[Interval[LocalDate], ConfigurationPeriod]] = 
  //   ConfigWriter[Map[String, ConfigurationPeriod]].contramap { data =>
  //     data.map{case (k,v) => (k.toString.replace(" ",""),v)}
  //   }

  implicit val configurationWriter: ConfigWriter[eoi.Configuration] = 
    ConfigWriter[Map[String, ConfigValue]].contramap[eoi.Configuration] {
      conf =>
      val m: List[(String,ConfigValue)] = (
        ("category-names" -> conf.categoryNames.toConfig) ::
          conf.data.toList.map{case (k,v) => k.toString.replace(" ","") -> v.toConfig}
      ) ++ List (
        "interest-on-late-payment" -> conf.interestOnLatePayment.toConfig,
        "interest-on-repayment" -> conf.interestOnRepayment.toConfig,         
      )
      m.toMap
    }


}
