/*
 * Copyright 2023 HM Revenue & Customs
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
package frontend

import scala.scalajs.js, js.annotation.JSExportTopLevel

@JSExportTopLevel("NiFrontend")
class NiFrontend(json: String) extends js.Object {

  val config: Configuration = EoiJsonEncoding.fromJson(json) match {
    case Right(z) => z
    case Left(err) => throw new IllegalArgumentException(s"$err")
  }

  lazy val classOne = new ClassOneFrontend(config)
  lazy val classTwo = new ClassTwoAndThreeFrontend(config.classTwo)
  lazy val classThree = new ClassTwoAndThreeFrontend(config.classThree)
  lazy val weeklyContributions = new WeeklyContributions(config)
  lazy val interestOnLateClassOne = new InterestOnUnpaidFrontend(config)
  lazy val interestOnRefundsClassOne = new InterestOnRefundsClassOne(config)
  lazy val directors = new Directors(config)
  lazy val unofficialDeferment = new UnofficialDeferment(config)

}
