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
import spire.math.Interval
import play.twirl.api.Html

@Singleton
class TablesController @Inject()(
  appConfig: AppConfig,
  mcc: MessagesControllerComponents,
  classOnePage: ClassOneTablePage,
  genericPage: GenericTableView
) extends FrontendController(mcc) {

  implicit val config: AppConfig = appConfig

  private val ni = ConfigLoader.default

  private def intervalDropdown[A](in: Map[Interval[LocalDate], A]): List[(LocalDate, String)] = in.keySet.toList.map {
    case i => i.lowerValue.get -> s"${i.lowerValue.get} - ${i.upperValue.get.minusDays(1)}"
  }.sortBy(_._1.toEpochDay).reverse

  def classOne(
    date: Option[LocalDate],
    category: Option[Char]
  ): Action[AnyContent] = Action { implicit request =>

    val intervals: List[(LocalDate, String)] = intervalDropdown(ni.classOne)

    val selectedInterval = date.getOrElse(intervals.head._1)
    val band: Map[String, RateDefinition] = ni.classOne.at(selectedInterval).getOrElse {
      throw new NoSuchElementException(s"no data for $selectedInterval")
    }

    val categories: List[Char] = band.values.flatMap( x =>
      x.employee.keys ++ x.employer.keys
    ).toList.sorted.distinct

    val selectedCategory = category.filter(categories.contains).getOrElse(categories.head)

    val filteredBand: List[(String, RateDefinition)] = band.filter{
      case (_, v) => (v.employee.keySet ++ v.employer.keySet).contains(selectedCategory)
    }.toList.sortBy(_._2.year.lowerValue.get)

    Ok(classOnePage(selectedInterval, intervals, selectedCategory, categories, filteredBand))
  }

  def classTwo(
    date: Option[LocalDate]
  ): Action[AnyContent] = Action { implicit request =>
    val intervals: List[(LocalDate, String)] = intervalDropdown(ni.classTwo)
    val dateP = date.getOrElse(intervals.head._1)

    ni.classTwo.at(dateP) match {
      case Some(data) =>
        val selectedInterval = ni.classTwo.keySet.find(_.contains(dateP)).get
        val lowerBound = selectedInterval.lowerValue.get
        
        val noOfWeeks = selectedInterval.numberOfWeeks().get
        val response = List (
          "Term Date" -> LocalDate.of(lowerBound.getYear, 4, 9), // unknown... but always the 9th of april
          "Weekly Rate" -> data.weeklyRate.formatSterling,
          "Rate Total" -> (data.weeklyRate * noOfWeeks).formatSterling
        ) ++ (data.vdwRate match {
          case None => Nil
          case Some(vdw) => List (
            "Voluntary Development Workers (VDW) Weekly Rate" -> vdw,
            "Voluntary Development Workers (VDW) Total" -> vdw * noOfWeeks
          )
        }) ++ (data.shareFishingRate match {
          case None => Nil
          case Some(vdw) => List (
            "Share Fishing Weekly Rate" -> vdw,
            "Share Fishing Total" -> vdw * noOfWeeks
          )
        }) ++ List (
          "Date Late For Short Term Benefits (STB)" -> "???",
          "Final Date For Payment" -> lowerBound.plusYears(if (lowerBound.getYear < 1983) 3 else 7),
          "Small Profits Threshold/Small Earnings Exemption (SPT/SEE)" ->
            data.smallEarningsException.fold("???")(_.formatSterling), // below which paying is optional
          "Date High Rate Provision (HRP) Applies" ->
            (if (lowerBound.getYear < 1983) "" else lowerBound.plusYears(2).plusDays(1).toString),
          "No of Wks" -> noOfWeeks.toString,
          "Earnings Factor (includes enhance)" -> "???",
        )
        Ok(genericPage(dateP, intervals, "Class 2", response.map{case (k,v) => (k,Html(v.toString))}))
      case None => NotFound("")
    }
  }

  def classThree(
    date: Option[LocalDate]
  ): Action[AnyContent] = Action { implicit request =>
    val intervals: List[(LocalDate, String)] = intervalDropdown(ni.classThree)
    val dateP = date.getOrElse(intervals.head._1)

    ni.classThree.at(dateP) match {
      case Some(data) =>

        val selectedInterval = ni.classThree.keySet.find(_.contains(dateP)).get
        val lowerBound = selectedInterval.lowerValue.get        
        val response = List (
          "Weekly Rate" -> data.weekRate.formatSterling,
          "Rate Total" -> (data.weekRate * data.noOfWeeks).formatSterling,
          "Date High Rate Provision (HRP) Applies" ->
            (if (lowerBound.getYear < 1983) "" else lowerBound.plusYears(2).plusDays(1).toString),
          "Final Date For Payment" -> lowerBound.plusYears(if (lowerBound.getYear < 1982) 3 else 7),
          "Earnings Factor Qualifying Year" -> "???",
          "Lower Earning Limit" -> "???" // for C1
        )

        Ok(genericPage(dateP, intervals, "Class 3", response.map{case (k,v) => (k,Html(v.toString))}))
      case None => NotFound("")
    }
  }

  def classFour(
    date: Option[LocalDate]
  ): Action[AnyContent] = Action { implicit request =>
    val intervals: List[(LocalDate, String)] = intervalDropdown(ni.classFour)
    val dateP = date.getOrElse(intervals.head._1)

    ni.classFour.at(dateP) match {
      case Some(data) =>
        val response = List (
          "Rate (between lower and upper profit limits)" -> data.mainRate.formatPercentage,
          "Rate (above upper profit limits))" -> data.upperRate.formatPercentage,
          "Annual Lower Profit Limit (LPL)" -> data.lowerLimit.formatSterling,
          "Annual Upper Profit Limit (UPL)" -> data.upperLimit.formatSterling
        )

        Ok(genericPage(dateP, intervals, "Class 4", response.map{case (k,v) => (k,Html(v.toString))}))

      case None => NotFound("")
    }
  }

}
