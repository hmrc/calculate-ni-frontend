/*
 * Copyright 2021 HM Revenue & Customs
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

object Period extends Enumeration {
  type Period = Vala

  protected case class Vala(string: String, qtyInYear: Int) extends super.Val 

  val Week = Vala("Wk", 52)
  val Month = Vala("Mnth", 12)
  val FourWeek = Vala("4Wk", 52/4)
  val Year = Vala("Ann", 1)

  def apply(in: String): Period = values.find(_.asInstanceOf[Vala].string.equalsIgnoreCase(in)).fold(
    throw new NoSuchElementException(s"No Period called $in")
  )(_.asInstanceOf[Vala])
}
