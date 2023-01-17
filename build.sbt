import org.scalajs.linker.interface.ESVersion
import uk.gov.hmrc.DefaultBuildSettings.integrationTestSettings
import uk.gov.hmrc.sbtdistributables.SbtDistributablesPlugin.publishingSettings

import scala.sys.process._

val reactDirectory           = settingKey[File]("The directory where the react application is located")
val installReactDependencies = taskKey[Unit]("Install the dependencies for the react application")
val buildReactApp            = taskKey[Unit]("Build the react application")
val copyInJS                 = taskKey[File]("Build and copy in the JS file")
val moveReact                = taskKey[Int]("move the compiled react application into the play assets")
val build                    = taskKey[Unit]("Copy JS and Config to react app")

val appName = "calculate-ni-frontend"

val silencerVersion = "1.7.12"

installReactDependencies := {
  val result = JavaScriptBuild.npmProcess(reactDirectory.value, "install").run().exitValue()
  if (result != 0)
    throw new Exception("Npm install failed.")
}

copyInJS := {
  // generate the Javascript logic
  val Attributed(outFiles) = (frontend / Compile / fullOptJS).value
  val dest = reactDirectory.value / "src" / "calculation.js"
  println(s"copying $outFiles to $dest")

  // suppress warnings in generated code
  (Process("echo" ::
    """|/* eslint-disable */
       |var BigInt = function(n) { return n; };""".stripMargin :: Nil)
    #> dest
  ).run().exitValue()

  // get around BigInt compatibility issues with IE11/scalajs1
  (Process("sed" ::
    "-e" :: """s/"object"===typeof __ScalaJSEnv&&__ScalaJSEnv?__ScalaJSEnv://""" ::
    outFiles.getAbsolutePath :: Nil,
    baseDirectory.value) #>> dest).run().exitValue()
  dest
}

buildReactApp := {
  val deps: Unit = installReactDependencies.value
  val reactJsFile: Unit = copyInJS.value
  val result = JavaScriptBuild.npmProcess(reactDirectory.value, "run", "build").run().exitValue()
  if (result != 0)
    throw new Exception("npm run build failed.")
}

moveReact := {
  val reactApp: Unit = buildReactApp.value
  import scala.sys.process.{Process, ProcessBuilder}
  val result = Process("./sync-build.sh" :: Nil, baseDirectory.value).run().exitValue()
  1
}

lazy val microservice = Project(appName, file("."))
  .enablePlugins(play.sbt.PlayScala, SbtDistributablesPlugin)
  .settings(
    majorVersion                     := 0,
    scalaVersion                     := "2.12.17",
    libraryDependencies              ++= Seq(
      "uk.gov.hmrc"           %% "bootstrap-frontend-play-28" % "5.25.0",
      "uk.gov.hmrc"           %% "play-frontend-hmrc"         % "6.2.0-play-28",
      "com.github.pureconfig" %% "pureconfig"                 % "0.17.2",
      "org.typelevel"         %% "cats-core"                  % "2.9.0",
      "org.typelevel"         %% "spire"                      % "0.17.0"
    ),
    libraryDependencies ++= Seq(
      "io.circe" %%% "circe-core",
      "io.circe" %%% "circe-generic",
      "io.circe" %%% "circe-parser"
    ).map(_ % circeVersion),
    libraryDependencies              ++= Seq(
      "uk.gov.hmrc"          %% "bootstrap-test-play-28" % "5.25.0",
      "com.typesafe.play"    %% "play-test"              % play.core.PlayVersion.current,
      "com.github.tototoshi" %% "scala-csv"              % "1.3.10",
      "org.scalatestplus"    %% "scalacheck-1-15"        % "3.2.11.0",
      "com.propensive"       %% "magnolia"               % "0.17.0",
      "io.chrisdavenport"    %% "cats-scalacheck"        % "0.3.2",
      "com.vladsch.flexmark" %  "flexmark-all"           % "0.62.2"
    ).map(_ % Test),
    TwirlKeys.templateImports ++= Seq(
      "uk.gov.hmrc.calculatenifrontend.config.AppConfig",
      "uk.gov.hmrc.govukfrontend.views.html.components._",
      "uk.gov.hmrc.govukfrontend.views.html.components.implicits._"
    ),
    play.sbt.routes.RoutesKeys.routesImport += "uk.gov.hmrc.calculatenifrontend.controllers.Binders._",
    scalacOptions += "-P:silencer:pathFilters=routes",
    scalacOptions += "-P:silencer:pathFilters=target/.*",
    scalacOptions += "-Ypartial-unification",
    libraryDependencies ++= Seq(
      compilerPlugin("com.github.ghik" % "silencer-plugin" % silencerVersion cross CrossVersion.full),
      "com.github.ghik" % "silencer-lib" % silencerVersion % Provided cross CrossVersion.full
    ),
    PlayKeys.playDefaultPort := 8668,
    reactDirectory := (Compile / baseDirectory) { _ /"react" }.value,
    Compile / unmanagedSourceDirectories ++= (common.jvm / (Compile / unmanagedSourceDirectories)).value,
    Compile / unmanagedResources += file("national-insurance.conf"),
    dist := (dist dependsOn moveReact).value
  )
  .settings(publishingSettings: _*)
  .configs(IntegrationTest)
  .settings(integrationTestSettings(): _*)
  .settings(resolvers += Resolver.jcenterRepo)

val circeVersion = "0.14.3"

/** common components holding the logic of the calculation */
lazy val common = sbtcrossproject.CrossPlugin.autoImport.crossProject(JSPlatform, JVMPlatform)
  .withoutSuffixFor(JVMPlatform)
  .crossType(sbtcrossproject.CrossPlugin.autoImport.CrossType.Pure)
  .settings(
    scalaVersion := "2.12.14",
    majorVersion := 0,
    libraryDependencies ++= Seq(
      "io.circe" %%% "circe-core",
      "io.circe" %%% "circe-generic",
      "io.circe" %%% "circe-parser"
    ).map(_ % circeVersion),
    libraryDependencies ++= Seq(
      "org.typelevel" %%% "cats-core" % "2.1.1",
      "org.typelevel" %%% "spire" % "0.17.0-RC1"
    ),
    libraryDependencies ++= Seq(
      compilerPlugin("com.github.ghik" % "silencer-plugin" % silencerVersion cross CrossVersion.full),
      "com.github.ghik" % "silencer-lib" % silencerVersion % Provided cross CrossVersion.full
    ),
    scalacOptions -= "-Xfatal-warnings",
    addCompilerPlugin(
      "org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full
    ),
    publish := {},
    publishLocal := {}
  )

/** ScalaJS calculation logic, used by the react frontend */
lazy val `frontend` = project
  .enablePlugins(ScalaJSPlugin)
  .settings(
    scalaVersion := "2.12.14",
    majorVersion := 0,
    scalacOptions -= "-Xfatal-warnings",
    scalaJSUseMainModuleInitializer := false,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "1.1.0",
      "org.scala-js" %%% "scalajs-java-time" % "1.0.0",
      "org.typelevel" %%% "simulacrum" % "1.0.0"
    ),
    libraryDependencies ++= Seq(
      compilerPlugin("com.github.ghik" % "silencer-plugin" % silencerVersion cross CrossVersion.full),
      "com.github.ghik" % "silencer-lib" % silencerVersion % Provided cross CrossVersion.full
    ),
    addCompilerPlugin("org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full),
    scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.ESModule) },
    scalaJSLinkerConfig ~= (_.withESFeatures(_.withESVersion(ESVersion.ES2018))),
    publish := {},
    publishLocal := {}
  )
  .dependsOn(common.js)
