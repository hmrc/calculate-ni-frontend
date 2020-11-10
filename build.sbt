import uk.gov.hmrc.sbtdistributables.SbtDistributablesPlugin.publishingSettings

val appName = "calculate-ni-frontend"

val silencerVersion = "1.7.0"

val copyInJS = taskKey[Unit]("Build and copy in the JS file")
val convertConfig = taskKey[Any]("Convert the configuration file from HOCON to JSON")

lazy val microservice = Project(appName, file("."))
  .enablePlugins(play.sbt.PlayScala, SbtAutoBuildPlugin, SbtGitVersioning, SbtDistributablesPlugin)
  .settings(
    majorVersion                     := 0,
    scalaVersion                     := "2.12.11",
    libraryDependencies              ++= Seq(
      "uk.gov.hmrc"             %% "bootstrap-frontend-play-27" % "3.0.0",
      "uk.gov.hmrc"             %% "play-frontend-hmrc"         % "0.21.0-play-27",
      "uk.gov.hmrc"             %% "play-frontend-govuk"        % "0.53.0-play-27",
      "com.github.pureconfig"   %% "pureconfig"                 % "0.13.0"      
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
    convertConfig := Def.taskDyn({
      // generate the JSON config file from the HOCON
      val sourceFile = file("national-insurance.conf")
      val destFile = file("app") / "assets" / "configuration.json"
      
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
    }).value,
    convertConfig := convertConfig.triggeredBy(compile in Compile).value, 
    copyInJS := {
        // generate the Javascript logic 
        val Attributed(outFiles) = (frontend / Compile / fullOptJS).value
        IO.copyFile(outFiles, file("app") / "assets" / "javascripts" / "calculation.js")      
    },
    copyInJS := copyInJS.triggeredBy(compile in Compile).value

  )
  .settings(publishingSettings: _*)
  .settings(resolvers += Resolver.jcenterRepo)

val circeVersion = "0.13.0"

lazy val common = crossProject(JSPlatform, JVMPlatform).
  withoutSuffixFor(JVMPlatform).
  crossType(CrossType.Pure).
  settings(
    scalaVersion := "2.12.12", 
    libraryDependencies ++= Seq(
      "io.circe" %%% "circe-core",
      "io.circe" %%% "circe-generic",
      "io.circe" %%% "circe-parser"
    ).map(_ % circeVersion),
    libraryDependencies ++= Seq(
      "org.typelevel" %%% "cats-core" % "2.2.0",
      "org.typelevel" %%% "spire" % "0.17.0"
    ),
    scalacOptions -= "-Xfatal-warnings",
    addCompilerPlugin(
      "org.scalamacros" % "paradise" % "2.1.1" cross CrossVersion.full
    ),
    publish := {},
    publishLocal := {},
    majorVersion := 0
  )

lazy val `schema-converter` = project
  .settings(
    scalaVersion := "2.12.12", 
    scalacOptions -= "-Xfatal-warnings",
    publish := {},
    publishLocal := {},
    majorVersion := 0    
  )
  .dependsOn(calc)

lazy val calc = project.
  settings(
    scalaVersion := "2.12.12", 
    scalacOptions -= "-Xfatal-warnings",
    libraryDependencies ++= Seq(
      "com.github.pureconfig" %% "pureconfig" % "0.13.0",
      "org.scala-lang.modules" %% "scala-swing" % "2.1.1",
      "org.scalacheck" %% "scalacheck" % "1.14.1" % Test,
      "org.scalatest" %% "scalatest" % "3.0.1" % Test,
      "com.github.tototoshi" %% "scala-csv" % "1.3.6" % Test
    ),
    publish := {},
    publishLocal := {},
    majorVersion := 0    
  ).dependsOn(common.jvm)


lazy val `frontend` = project
  .settings(
    scalaVersion := "2.12.12", 
    scalacOptions -= "-Xfatal-warnings",    
    scalaJSUseMainModuleInitializer := false,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "1.1.0",
      "org.scala-js" %%% "scalajs-java-time" % "1.0.0"
    ),
    publish := {},
    publishLocal := {},
    majorVersion := 0    
  )
  .enablePlugins(ScalaJSPlugin)
  .dependsOn(common.js)
