/*
 * Copyright 2022 HM Revenue & Customs
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

import cats.syntax.either._
import com.typesafe.config.ConfigValueFactory
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import pureconfig._
import pureconfig.configurable._
import pureconfig.error._
import pureconfig.generic.auto._
import scala.util.control.NonFatal
import spire.algebra.Order
import spire.implicits._
import spire.math.Interval
import spire.math.interval._

object ConfigLoader {

  implicit def moneyReader: ConfigReader[Money] = {
    val ct = implicitly[reflect.ClassTag[Money]]    
    def underlying(string: String) = try Right(BigDecimal(string)) catch {
      case NonFatal(ex) => Left(CannotConvert(string, ct.toString, ex.toString))
    }

    ConfigReader[String].emap{ s => 
      underlying(s.replace("£","")).map(Money.apply)
    }
  }

  implicit def percentageReader: ConfigReader[Percentage] = {
    val ct = implicitly[reflect.ClassTag[Percentage]]
    def underlying(string: String) = try Right(BigDecimal(string)) catch {
      case NonFatal(ex) => Left(CannotConvert(string, ct.toString, ex.toString))
    }
    ConfigReader[String].emap{
      case string if string.endsWith("%") => underlying(string.init).map(_ / 100)
      case other  => underlying(other)
    }.map(Percentage.apply)
  }

  implicit val localDateConvert: ConfigReader[LocalDate] = localDateConfigConvert(DateTimeFormatter.ISO_DATE)
  def anyMapReader[K,V](implicit kr: pureconfig.ConfigReader[K], vr: pureconfig.ConfigReader[V], ct: reflect.ClassTag[K]): ConfigReader[Map[K, V]] =
    genericMapReader[K,V](k => failuresToReason(kr.from(ConfigValueFactory.fromAnyRef(k, "")), ct))

  implicit def failuresToReason[A](implicit in: Either[ConfigReaderFailures, A], ct: reflect.ClassTag[A]): Either[FailureReason, A] =
    in.leftMap(e => CannotConvert("", ct.toString, e.toString()))

  implicit def charBdReader[A](implicit vr: ConfigReader[A]): ConfigReader[Map[Char, A]] = 
      ConfigReader[Map[String, A]].map(_.flatMap{case (k,v) =>
        k.toList.map{x => (x, v)}
      })

  implicit val taxPeriodReader: ConfigReader[Interval[LocalDate]] = {
    implicitly[ConfigReader[Int]].map(TaxYear(_).asInterval).orElse(intervalReader[LocalDate])
  }

  implicit def intervalReader[A](implicit i: ConfigReader[A], order: Order[A]): ConfigReader[Interval[A]] = {

    def read(boundType: Option[Char], value: String, closed: Char, open: Char, name: String): Either[FailureReason,Bound[A]] = {

      def inner(f: A => Bound[A]) = value match {
        case "inf" | "_" | "∞" => Right(Unbound[A]())
        case _ => i.from(ConfigValueFactory.fromAnyRef(value, name)).map(f).leftMap(e => CannotConvert(value, name, e.toString()))
      }

      boundType match {
        case Some(`closed`) => inner(Closed(_))
        case Some(`open`) => inner(Open(_))
        case e => Left(CannotConvert(e.toString, name, s"Invalid $name"))
      }
    }

    ConfigReader[String].map(_.split(",").toList).emap{
      case (l::u::Nil) => for {
        lower <- read(l.headOption, l.drop(1), '[', '(', "lower bound")
        upper <- read(u.lastOption, u.dropRight(1), ']', ')', "upper bound")        
      } yield Interval.fromBounds(lower,upper)
      case e => Left(CannotConvert(e.toString, "Interval", "Invalid Interval"))
    }
  }

  implicit val periodMapReader = anyMapReader[Interval[LocalDate], Map[String, RateDefinition]]
  implicit val classTwoReader = anyMapReader[Interval[LocalDate], ClassTwo]
  implicit val classThreeReader = anyMapReader[Interval[LocalDate], ClassThree]  
  implicit val catReader = anyMapReader[Char, String]
  implicit val dateMoneyReader = anyMapReader[Interval[LocalDate], Money]
  implicit val datePercentReader = anyMapReader[Interval[LocalDate], Percentage]    
  implicit val classFourReader = anyMapReader[Interval[LocalDate], ClassFour]

  implicit val c1BandReader: ConfigReader[Class1Band] = ConfigReader[String].emap { str => 
    Class1Band.fromString(str) match {
      case Some(s) => Right(s)
      case None => Left(CannotConvert(str, "Class1Band", s"$str is not a valid Class1Band"))
    }
  }
  implicit val ratesBandReader = anyMapReader[Class1Band, Map[Char, Percentage]]
  implicit val udReader = anyMapReader[Interval[LocalDate], TaxYearBandLimits]       

  lazy val get = ConfigSource.default.load[Map[Interval[LocalDate], Map[String, RateDefinition]]] match {
    case Right(conf) => conf
    case Left(err) => throw new IllegalArgumentException(err.prettyPrint())
  }

  lazy val getP = ConfigSource.default.load[Configuration] match {
    case Right(conf) => conf
    case Left(err) => throw new IllegalArgumentException(err.prettyPrint())
  }

  implicit val confPeriodReader = anyMapReader[Interval[LocalDate], ConfigurationPeriod]

  implicit val topLevelReader: ConfigReader[Configuration] = new ConfigReader[Configuration] {
    def from(cur: ConfigCursor): ConfigReader.Result[Configuration] = for {
      objCur        <- cur.asObjectCursor
      categoryNames <- objCur.atKey("category-names") flatMap catReader.from
      interestLate  <- objCur.atKey("interest-on-late-payment") flatMap datePercentReader.from
      interestRepay <- objCur.atKey("interest-on-repayment") flatMap datePercentReader.from
      directorsDiverge <- objCur.atKey("directors-diverge-date") flatMap localDateConvert.from
      yearsObj      =  objCur.withoutKey("interest-on-late-payment")
                             .withoutKey("interest-on-repayment")
                             .withoutKey("category-names")
                             .withoutKey("directors-diverge-date")
      years         <- confPeriodReader.from(yearsObj)
    } yield Configuration(categoryNames, years, interestLate, interestRepay, directorsDiverge)
  }

  lazy val default: Configuration = {
    val o = ConfigSource.resources("national-insurance.conf")
      .load[Configuration]

    o match {
      case Left(err) =>
        throw new IllegalStateException(s"Unable to read configuration: $err")
      case Right(c) => c
    }
  }

  def fromString(str: String): Configuration = {
    val o = ConfigSource.string(str)
      .load[Configuration]

    o match {
      case Left(err) =>
        throw new IllegalStateException(s"Unable to read configuration: $err")
      case Right(c) => c
    }
  }

}
