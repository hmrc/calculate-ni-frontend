import org.scalajs.linker.interface.ESVersion

import scala.sys.process._

val reactDirectory           = settingKey[File]("The directory where the react application is located")
val installReactDependencies = taskKey[Unit]("Install the dependencies for the react application")
val buildReactApp            = taskKey[Unit]("Build the react application")
val copyInJS                 = taskKey[File]("Build and copy in the JS file")
val moveReact                = taskKey[Int]("move the compiled react application into the play assets")
val build                    = taskKey[Unit]("Copy JS and Config to react app")

val appName = "calculate-ni-frontend"

val scalaLanguageVersion = "2.13.13"
val bootstrapVersion = "8.5.0"
val catsVersion = "2.10.0"

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
    scalaVersion                     := scalaLanguageVersion,
    libraryDependencies              ++= Seq(
      "uk.gov.hmrc"           %% "bootstrap-frontend-play-30" % bootstrapVersion,
      "uk.gov.hmrc"           %% "play-frontend-hmrc-play-30" % "8.5.0",
      "com.github.pureconfig" %% "pureconfig"                 % "0.17.6",
      "org.typelevel"         %% "cats-core"                  % catsVersion,
      "org.typelevel"         %% "spire"                      % "0.18.0"
    ),
    libraryDependencies ++= Seq(
      "io.circe" %%% "circe-core",
      "io.circe" %%% "circe-generic",
      "io.circe" %%% "circe-parser"
    ).map(_ % circeVersion),
    libraryDependencies              ++= Seq(
      "uk.gov.hmrc"          %% "bootstrap-test-play-30" % bootstrapVersion,
      "com.github.tototoshi" %% "scala-csv"              % "1.3.10",
      "org.scalatestplus"    %% "scalacheck-1-17"        % "3.2.18.0",
      "com.propensive"       %% "magnolia"               % "0.17.0",
      "io.chrisdavenport"    %% "cats-scalacheck"        % "0.3.2",
      "com.vladsch.flexmark" %  "flexmark-all"           % "0.64.8"
    ).map(_ % Test),
    TwirlKeys.templateImports ++= Seq(
      "uk.gov.hmrc.calculatenifrontend.config.AppConfig",
      "uk.gov.hmrc.hmrcfrontend.views.html.components._",
    ),
    play.sbt.routes.RoutesKeys.routesImport += "uk.gov.hmrc.calculatenifrontend.controllers.Binders._",
    scalacOptions += "-Xlint:-byname-implicit",
    scalacOptions ++= Seq(
      "-feature",
      "-Wconf:src=routes/.*:s",
      "-Wconf:cat=unused-imports&src=html/.*:s"
    ),
    PlayKeys.playDefaultPort := 8668,
    reactDirectory := (Compile / baseDirectory) { _ /"react" }.value,
    Compile / unmanagedSourceDirectories ++= (common.jvm / (Compile / unmanagedSourceDirectories)).value,
    Compile / unmanagedResources += file("national-insurance.conf"),
    dist := (dist dependsOn moveReact).value
  )
  .settings(resolvers += Resolver.jcenterRepo)

val circeVersion = "0.14.6"

/** common components holding the logic of the calculation */
lazy val common = sbtcrossproject.CrossPlugin.autoImport.crossProject(JSPlatform, JVMPlatform)
  .withoutSuffixFor(JVMPlatform)
  .crossType(sbtcrossproject.CrossPlugin.autoImport.CrossType.Pure)
  .settings(
    scalaVersion := scalaLanguageVersion,
    majorVersion := 0,
    libraryDependencies ++= Seq(
      "io.circe" %%% "circe-core",
      "io.circe" %%% "circe-generic",
      "io.circe" %%% "circe-parser"
    ).map(_ % circeVersion),
    libraryDependencies ++= Seq(
      "org.typelevel" %%% "cats-core" % catsVersion,
      "org.typelevel" %%% "spire" % "0.18.0"
    ),
    scalacOptions -= "-Xfatal-warnings",
    scalacOptions += "-Xlint:-byname-implicit",
    scalacOptions += "-Ymacro-annotations",
    scalacOptions ++= Seq(
      "-feature",
      "-Wconf:src=routes/.*:s",
      "-Wconf:cat=unused-imports&src=html/.*:s"
    ),
    publish := {},
    publishLocal := {}
  )

/** ScalaJS calculation logic, used by the react frontend */
lazy val `frontend` = project
  .enablePlugins(ScalaJSPlugin)
  .settings(
    scalaVersion := scalaLanguageVersion,
    majorVersion := 0,
    scalacOptions -= "-Xfatal-warnings",
    scalacOptions += "-Xlint:-byname-implicit",
    scalacOptions += "-Ymacro-annotations",
    scalacOptions ++= Seq(
      "-feature",
      "-Wconf:src=routes/.*:s",
      "-Wconf:cat=unused-imports&src=html/.*:s"
    ),
    scalaJSUseMainModuleInitializer := false,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "1.1.0",
      "org.scala-js" %%% "scalajs-java-time" % "1.0.0",
      "org.typelevel" %%% "simulacrum" % "1.0.0"
    ),
    scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.ESModule) },
    scalaJSLinkerConfig ~= (_.withESFeatures(_.withESVersion(ESVersion.ES2018))),
    publish := {},
    publishLocal := {}
  )
  .dependsOn(common.js)
