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

import java.nio.file._
import collection.JavaConverters._
import scala.concurrent._

case class FileWatcher(file: String)(action: Path => Unit)(implicit ec: ExecutionContext) {
  val fs = FileSystems.getDefault
  val watchService = fs.newWatchService
  val filePath = fs.getPath(file)
  val path = filePath.getParent()
  path.register(watchService, StandardWatchEventKinds.ENTRY_MODIFY)
  Future {
    var poll = true
    while (poll) {
      val key = watchService.take()
      val events = key.pollEvents.asScala.toList
      events.map { ev: WatchEvent[_] =>
        val eventFile = ev.context().asInstanceOf[Path]
        if (eventFile == filePath) { action(eventFile) }
      }
      poll = key.reset()
    }
  }

  def dispose(): Unit = {
    watchService.close()
  }
}
