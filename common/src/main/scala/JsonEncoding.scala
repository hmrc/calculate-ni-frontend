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

import io.circe._, io.circe.generic.auto._, io.circe.parser._, io.circe.syntax._
import java.time.LocalDate
import spire.math.Interval
import spire.math.interval._
import cats.implicits._

object EoiJsonEncoding {

  // Todo enumeratum? Scala 3 enum backporting? 
  implicit def class1BandKeyEncoder = new KeyEncoder[Class1Band] {
    import Class1Band._
    def apply(in: Class1Band): String = in match {
      case BelowLEL => "BelowLEL"
      case LELToET => "LELToET"
      case LELToPT => "LELToPT"
      case PTToUAP => "PTToUAP"
      case PTToUEL => "PTToUEL"
      case ETToUEL => "ETToUEL"
      case UAPToUEL => "UAPToUEL"
      case AboveUEL => "AboveUEL"
    }
  }

  implicit def class1BandKeyDecoder = new KeyDecoder[Class1Band] {
    def apply(in: String): Option[Class1Band] = Class1Band.fromString(in)
  }

  implicit def dateKeyEncoder = new KeyEncoder[LocalDate] {
    def apply(in: LocalDate): String = in.toString()
  }

  implicit def intervalKeyEncoder[A](implicit inner: KeyEncoder[A]) = new KeyEncoder[Interval[A]] {
    def apply(i: Interval[A]): String = {

      val l = i.lowerBound match {
        case Closed(c) => "[" + inner(c)
        case Open(o) => "(" + inner(o)
        case EmptyBound() | Unbound() => "(inf"
      }

      val u = i.upperBound match {
        case Closed(c) => inner(c) + "]"
        case Open(o) => inner(o) + ")"
        case EmptyBound() | Unbound() => "inf)"          
      }

      l + "," + u
    }
  }

  implicit def charKeyEncoder: KeyEncoder[Char] = implicitly[KeyEncoder[String]].contramap(_.toString)

  def toJson(in: Configuration): Json = in.asJson

  implicit def dateKeyDecoder = new KeyDecoder[LocalDate] {
    def apply(in: String): Option[LocalDate] = util.Try{LocalDate.parse(in)}.toOption
  }

  implicit def intervalKeyDecoder[A](implicit inner: KeyDecoder[A], order: spire.algebra.Order[A]) = new KeyDecoder[Interval[A]] {
    def apply(key: String): Option[Interval[A]] = {
      key.split(",").toList match {
        case (l::h::Nil) =>
          val lP: Option[Bound[A]] = l match {
            case "(inf" | "[inf" => Some(Unbound())
            case x if x.startsWith("(") => inner(x.drop(1)).map(Open(_))
            case x if x.startsWith("[") => inner(x.drop(1)).map(Closed(_))              
            case _ => None
          }

          val hP: Option[Bound[A]] = h match {
            case "inf)" | "inf]" => Some(Unbound())
            case x if x.endsWith(")") => inner(x.dropRight(1)).map(Open(_))
            case x if x.endsWith("]") => inner(x.dropRight(1)).map(Closed(_))              
            case _ => None
          }
          (lP, hP).mapN(Interval.fromBounds(_,_))
        case _ => None
      }
    }
  }

  implicit def charKeyDecoder = new KeyDecoder[Char] {
    def apply(key: String): Option[Char] = key.toList match {
      case (h::Nil) => Some(h)
      case _ => None
    }
  }

  def fromJson(in: String): Either[Error,Configuration] = decode[Configuration](in)
}
