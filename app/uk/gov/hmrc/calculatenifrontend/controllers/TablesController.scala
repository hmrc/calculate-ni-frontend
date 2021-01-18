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

package uk.gov.hmrc.calculatenifrontend.controllers

import javax.inject.{Inject, Singleton}
import play.api.mvc._
import uk.gov.hmrc.play.bootstrap.frontend.controller.FrontendController
import uk.gov.hmrc.calculatenifrontend.config.AppConfig
import uk.gov.hmrc.calculatenifrontend.views.html._
import eoi._
import java.time.LocalDate

@Singleton
class TablesController @Inject()(
  appConfig: AppConfig,
  mcc: MessagesControllerComponents,
  classOnePage: ClassOneTablePage
) extends FrontendController(mcc) {

  implicit val config: AppConfig = appConfig

  private val ni = ConfigLoader.default

  private val intervals: List[(LocalDate, String)] = ni.classOne.keySet.toList.map {
    case i => i.lowerValue.get -> s"${i.lowerValue.get} - ${i.upperValue.get.minusDays(1)}"
  }.sortBy(_._1.toEpochDay).reverse

  def classOne(
    date: Option[LocalDate],
    category: Option[Char]
  ): Action[AnyContent] = Action { implicit request =>

    val selectedInterval = date.getOrElse(intervals.head._1)
    val band: Map[String, RateDefinition] = ni.classOne.at(selectedInterval).getOrElse {
      throw new NoSuchElementException(s"no data for $selectedInterval")
    }

    val categories: List[Char] = band.values.flatMap( x =>
      x.employee.keys ++ x.employer.keys
    ).toList.sorted.distinct

    val selectedCategory = category.filter(categories.contains).getOrElse(categories.head)

    val filteredBand: List[(String, RateDefinition)] =
      band.filter{
        case (_, v) => (v.employee.keySet ++ v.employer.keySet).contains(selectedCategory)
      }.toList.sortBy(_._2.year.lowerValue.get)


    Ok(classOnePage(selectedInterval, intervals, selectedCategory, categories, filteredBand))
  }
}
