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
import eoi._, EoiJsonEncoding._

@Singleton
class NiConfigController @Inject()(
  mcc: MessagesControllerComponents,
) extends FrontendController(mcc) {

  private val ni = ConfigLoader.default

  val configJson: Action[AnyContent] = Action {
    val jsonString: String = toJson(ni).toString
    Ok(jsonString).as("application/json")
  }

}
