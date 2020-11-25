import sbt._
import sbt.Keys._
import com.typesafe.sbt.packager.Keys._
import play.sbt.PlayImport.PlayKeys
import scala.sys.process.{Process, ProcessBuilder}

/**
 * Build of UI in JavaScript
 */
object JavaScriptBuild {

  val uiDirectory = SettingKey[File]("ui-directory") // ???
  val npmInstall = TaskKey[Int]("npm-install")
  val npmRunBuild = TaskKey[Int]("npm-run-build")

  val settings = Seq(

    // the JavaScript application resides in "ui"
    uiDirectory := (baseDirectory in Compile) { _ /"react" }.value,

    // add "npm" and "gulp" commands in sbt
//    commands ++= uiDirectory { base => Seq(Gulp.gulpCommand(base), npmCommand(base))}.value,

    npmInstall := {
      val result = npmProcess(uiDirectory.value, "install").run().exitValue()
      if (result != 0)
        throw new Exception("Npm install failed.")
      result
    },

    npmRunBuild := {
      val result = npmProcess(uiDirectory.value, "run", "build").run().exitValue()
      if (result != 0)
        throw new Exception("npm run build failed.")
      result
    }


    // ,
    // gulpBuild := {
    //   val result = Gulp.gulpProcess(uiDirectory.value, "dist").run().exitValue()
    //   if (result != 0)
    //     throw new Exception("Gulp build failed.")
    //   result
    // },

    // gulpTest := {
    //   val result = Gulp.gulpProcess(uiDirectory.value, "test").run().exitValue()
    //   if (result != 0)
    //     throw new Exception("Gulp test failed.")
    //   result
    // },

    // gulpTest := (gulpTest dependsOn npmInstall).value,
    // gulpBuild := (gulpBuild dependsOn npmInstall).value,

    // // runs gulp before staging the application
    // dist := (dist dependsOn gulpBuild).value,

    // (test in Test) := ((test in Test) dependsOn gulpTest).value,



    // integrate JavaScript build into play build
//    PlayKeys.playRunHooks += uiDirectory.map(ui => Gulp(ui)).value
  )

  // def npmCommand(base: File) = Command.args("npm", "<npm-command>") { (state, args) =>
  //   if (sys.props("os.name").toLowerCase contains "windows") {
  //     Process("cmd" :: "/c" :: "npm" :: args.toList, base) !
  //   }
  //   else {
  //     Process("npm" :: args.toList, base) !
  //   }
  //   state
  // }

  def npmProcess(base: File, args: String*): ProcessBuilder = {
    if (sys.props("os.name").toLowerCase contains "windows") {
      Process("cmd" :: "/c" :: "npm" :: args.toList, base)
    } else {
      Process("npm" :: args.toList, base)
    }
  }

}
