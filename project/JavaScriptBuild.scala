import sbt._
import sbt.Keys._
import com.typesafe.sbt.packager.Keys._
import play.sbt.PlayImport.PlayKeys
import scala.sys.process.{Process, ProcessBuilder}

/**
 * Build of UI in JavaScript
 */
object JavaScriptBuild {

  def npmProcess(base: File, args: String*): ProcessBuilder = {
    if (sys.props("os.name").toLowerCase contains "windows") {
      Process("cmd" :: "/c" :: "npm" :: args.toList, base, "CI" -> "false")
    } else {
      Process("npm" :: args.toList, base, "CI" -> "false")
    }
  }

}
