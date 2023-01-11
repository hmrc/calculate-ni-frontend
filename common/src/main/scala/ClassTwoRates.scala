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

/** Class 2 contributions are a flat rate weekly liability payable by
  * all self-employed people over 16 (up to State Pension age) with
  * profits above the Small Profits Threshold. Self-employed people
  * with profits below the Small Profits Threshold may pay Class 2
  * contributions voluntary. Voluntary payments of Class 2 NICs are
  * typically collected through self-assessment but can usually be
  * paid up to six years after the tax year.  Class 4 NICs may also
  * have to be paid by the self-employed if their profits for the year
  * are over the lower profits limit (see below).
  */
case class ClassTwoRates(
  default: Money,
  fishermen: Option[Money],
  voluntary: Option[Money]
)
