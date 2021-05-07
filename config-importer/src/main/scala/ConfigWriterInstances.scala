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

  def orderingBias(fieldName: String): Int = fieldName match {
    case "limits" => 0
    case "class-one" => 1
    case "class-two" => 2
    case "class-three" => 3
    case "class-four" => 4
    case _ => 999
  }

  def writeConfig(in: ConfigValue, keys: String*): String = {

    val prefixNoColon = if (keys.isEmpty) "" else keys.map(_.optQuoted).mkString(".") + " "
    val prefix = if (keys.isEmpty) "" else prefixNoColon + "= "

    in match {
      case obj: ConfigObject =>
        obj.asScala.toList.sortBy(_._1) match {
          case (subkey,singleton) :: Nil => writeConfig(singleton, (keys :+ subkey):_*)
          case Nil => prefix + "{}"
          case xs =>
            val sorted = xs.toList.sortBy(_._1.dropWhile(_ == '[')).sortBy(x => orderingBias(x._1))
            s"""|${prefixNoColon}{
                |${sorted.map{case (k,v) => writeConfig(v,k)}.mkString("\n").indent(1)}
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


  implicit def moneyWriter[A]: ConfigWriter[Money] =
    ConfigWriter[String].contramap{ _.toString.filterNot(_ == ',') }

  implicit def percentageWriter[A]: ConfigWriter[Percentage] =
    ConfigWriter[String].contramap{ _.toString.filterNot(_ == ',') }



  val defaultRenderer =
    defaults.setJson(false).setOriginComments(false).setComments(false)    

  implicit def charBdWriter[A](implicit vr: ConfigWriter[A]): ConfigWriter[Map[Char, A]] = 
    ConfigWriter[Map[String, A]].contramap{ x => 
      x.groupBy(_._2).mapValues(_.map(_._1).toList.sorted.mkString).map(_.swap)
    }

  implicit val localDateWriter: ConfigWriter[LocalDate] =
    localDateConfigConvert(DateTimeFormatter.ISO_DATE)

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

  implicit val moneyIntervalWriter = intervalWriter[Money](_.toString)

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

  implicit val confwriter_unofficialDeferment: ConfigWriter[Map[Class1Band, Map[Char, Percentage]]] = 
    ConfigWriter[Map[String, Map[Char, Percentage]]].contramap { data =>
      data.map{case (k,v) => (k.toString,v)}
    }

  implicit val winterestOnLatePayment: ConfigWriter[Map[Interval[LocalDate], Percentage]] = 
    ConfigWriter[Map[String, Percentage]].contramap { data =>
      data.map{ case (k,v) => (k.toString.filterNot(_ == ' '),v) }
    }

  val confPeriodUnordered = ConfigWriter[ConfigurationPeriod]
  implicit val confPeriod = new ConfigWriter[ConfigurationPeriod] {
    def to(a: ConfigurationPeriod): ConfigValue = {
      confPeriodUnordered.to(a) match {
        case obj: ConfigObject => obj
        case other => other
      }
    }

  }

  // implicit val wdata : ConfigWriter[Map[Interval[LocalDate], ConfigurationPeriod]] = 
  //   ConfigWriter[Map[String, ConfigurationPeriod]].contramap { data =>
  //     data.map{case (k,v) => (k.toString.replace(" ",""),v)}
  //   }

  implicit val configurationWriter: ConfigWriter[eoi.Configuration] = 
    ConfigWriter[Map[String, ConfigValue]].contramap[eoi.Configuration] {
      conf =>
      val m: List[(String,ConfigValue)] = (
        ("category-names" -> conf.categoryNames.toConfig) ::
          conf.data.toList.map{
            case (TaxYear(k),v) => k.toString -> v.toConfig            
            case (k,v) => k.toString.replace(" ","") -> v.toConfig
          }
      ) ++ List (
        "interest-on-late-payment" -> conf.interestOnLatePayment.toConfig,
        "interest-on-repayment" -> conf.interestOnRepayment.toConfig,         
      )
      m.toMap
    }


}
