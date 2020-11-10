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
