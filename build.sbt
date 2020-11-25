import uk.gov.hmrc.DefaultBuildSettings.integrationTestSettings
import uk.gov.hmrc.sbtdistributables.SbtDistributablesPlugin.publishingSettings

val uiDirectory = SettingKey[File]("ui-directory")
val npmInstall = TaskKey[Int]("npm-install")
val npmRunBuild = TaskKey[Int]("npm-run-build")

val appName = "calculate-ni-frontend"

val silencerVersion = "1.7.0"

lazy val microservice = Project(appName, file("."))
  .enablePlugins(play.sbt.PlayScala, SbtAutoBuildPlugin, SbtGitVersioning, SbtDistributablesPlugin)
  .settings(
    majorVersion                     := 0,
    scalaVersion                     := "2.12.11",
    libraryDependencies              ++= Seq(
      "uk.gov.hmrc"             %% "bootstrap-frontend-play-27" % "3.0.0",
      "uk.gov.hmrc"             %% "play-frontend-hmrc"         % "0.21.0-play-27",
      "uk.gov.hmrc"             %% "play-frontend-govuk"        % "0.53.0-play-27"
    ),
    libraryDependencies              ++= Seq(
      "uk.gov.hmrc"             %% "bootstrap-test-play-27"   % "3.0.0",
      "org.scalatest"           %% "scalatest"                % "3.1.2",
      "org.jsoup"               %  "jsoup"                    % "1.10.2",
      "com.typesafe.play"       %% "play-test"                % play.core.PlayVersion.current,
      "com.vladsch.flexmark"    %  "flexmark-all"             % "0.35.10",
      "org.scalatestplus.play"  %% "scalatestplus-play"       % "4.0.3",
      "org.scalacheck"          %% "scalacheck"               % "1.14.1"      
    ).map(_ % Test),
    TwirlKeys.templateImports ++= Seq(
      "uk.gov.hmrc.calculatenifrontend.config.AppConfig",
      "uk.gov.hmrc.govukfrontend.views.html.components._",
      "uk.gov.hmrc.govukfrontend.views.html.helpers._",
      "uk.gov.hmrc.hmrcfrontend.views.html.components._"
    ),
    scalacOptions += "-P:silencer:pathFilters=routes",
    libraryDependencies ++= Seq(
      compilerPlugin("com.github.ghik" % "silencer-plugin" % silencerVersion cross CrossVersion.full),
      "com.github.ghik" % "silencer-lib" % silencerVersion % Provided cross CrossVersion.full
    ),
    PlayKeys.playDefaultPort := 8668,
    uiDirectory := (baseDirectory in Compile) { _ /"react" }.value,    
    npmInstall := {
      val result = JavaScriptBuild.npmProcess(uiDirectory.value, "install").run().exitValue()
      if (result != 0)
        throw new Exception("Npm install failed.")
      result
    },
    npmRunBuild := {
      val result = JavaScriptBuild.npmProcess(uiDirectory.value, "run", "build").run().exitValue()
      if (result != 0)
        throw new Exception("npm run build failed.")
      result
    },
    dist := {dist dependsOn (npmInstall, npmRunBuild)}.value
  )
  .settings(publishingSettings: _*)
//  .settings(JavaScriptBuild.settings: _*)
  .configs(IntegrationTest)
  .settings(integrationTestSettings(): _*)
  .settings(resolvers += Resolver.jcenterRepo)

val copyInJS = taskKey[Unit]("Build and copy in the JS file")
val convertConfig = taskKey[Any]("Convert the configuration file from HOCON to JSON")
val build = taskKey[Unit]("Copy JS and Config to react app")

val circeVersion = "0.13.0"

/** common components holding the logic of the calculation */ 
lazy val common = sbtcrossproject.CrossPlugin.autoImport.crossProject(JSPlatform, JVMPlatform)
  .withoutSuffixFor(JVMPlatform)
  .crossType(sbtcrossproject.CrossPlugin.autoImport.CrossType.Pure)
  .settings(
    scalaVersion := "2.12.12",
    majorVersion := 0,    
    libraryDependencies ++= Seq(
      "io.circe" %%% "circe-core",
      "io.circe" %%% "circe-generic",
      "io.circe" %%% "circe-parser"
    ).map(_ % circeVersion),
    libraryDependencies ++= Seq(
      "org.typelevel" %%% "cats-core" % "2.1.1",
      "org.typelevel" %%% "spire" % "0.16.2"
    ),
    scalacOptions -= "-Xfatal-warnings",
    addCompilerPlugin(
      "org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full
    ),
    publish := {},
    publishLocal := {}
  )

/** Used to convert the HOCON configuration file into a plain JSON one
  * for consumption by the JS interface 
  */
lazy val `schema-converter` = project
  .settings(
    scalaVersion := "2.12.12",
    majorVersion := 0,        
    scalacOptions -= "-Xfatal-warnings",
    publish := {},
    publishLocal := {}
  )
  .dependsOn(calc)

/** Swing frontend, used for testing the calculation logic. */
lazy val calc = project.
  settings(
    scalaVersion := "2.12.12",
    majorVersion := 0,        
    scalacOptions -= "-Xfatal-warnings",
    libraryDependencies ++= Seq(
      "com.github.pureconfig" %% "pureconfig" % "0.13.0",
      "org.scala-lang.modules" %% "scala-swing" % "2.1.1",
      "org.scalacheck" %% "scalacheck" % "1.14.1" % Test,
      "org.scalatest" %% "scalatest" % "3.0.1" % Test,
      "com.github.tototoshi" %% "scala-csv" % "1.3.6" % Test
    ),
    publish := {},
    publishLocal := {}
  ).dependsOn(common.jvm)

/** ScalaJS calculation logic, used by the react frontend */
lazy val `frontend` = project
  .settings(
    scalaVersion := "2.12.12",
    majorVersion := 0,        
    scalacOptions -= "-Xfatal-warnings",    
    scalaJSUseMainModuleInitializer := false,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "1.1.0",
      "org.scala-js" %%% "scalajs-java-time" % "1.0.0"
    ),
    publish := {},
    publishLocal := {}
  )
  .enablePlugins(ScalaJSPlugin)
  .dependsOn(common.js)

val reactSource = file(".").getCanonicalFile / "react" / "src"

convertConfig := Def.taskDyn({
  // generate the JSON config file from the HOCON
  val sourceFile = file(".").getCanonicalFile / "national-insurance.conf"
  val destFile = reactSource / "configuration.json"

  if (!destFile.exists || destFile.lastModified < sourceFile.lastModified) {
    Def.task{
      (`schema-converter` / Compile / run).toTask(" " + List(sourceFile, destFile).mkString(" ")).value
    }
  } else {
    Def.task {
      println("config is up-to-date")
      ()
    }
  }
}).value

copyInJS := {
  // generate the Javascript logic
  val Attributed(outFiles) = (frontend / Compile / fastOptJS).value
  val dest = reactSource / "calculation.js"
  println(s"copying $outFiles to $dest")
  IO.copyFile(outFiles, dest)
}

build := {
  convertConfig.value;
  copyInJS.value
}
