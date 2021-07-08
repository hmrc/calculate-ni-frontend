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

import scala.scalajs.js
import java.time.LocalDate

package object frontend {
  implicit def convertDate(in: js.Date): LocalDate =
    LocalDate.of(in.getFullYear.toInt, in.getMonth.toInt + 1, in.getDate.toInt)

  implicit def convertDateBack(in: LocalDate): js.Date =
    new js.Date(in.getYear, in.getMonthValue - 1, in.getDayOfMonth)

}
