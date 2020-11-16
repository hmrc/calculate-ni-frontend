import uk.gov.hmrc.DefaultBuildSettings.integrationTestSettings
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
    PlayKeys.playDefaultPort := 8668
  )
  .settings(publishingSettings: _*)
  .configs(IntegrationTest)
  .settings(integrationTestSettings(): _*)
  .settings(resolvers += Resolver.jcenterRepo)
