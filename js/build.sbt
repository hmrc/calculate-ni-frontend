val copyInJS = taskKey[Unit]("Build and copy in the JS file")
val convertConfig = taskKey[Any]("Convert the configuration file from HOCON to JSON")
val build = taskKey[Unit]("Copy JS and Config to react app")

val circeVersion = "0.13.0"

/** common components holding the logic of the calculation */ 
lazy val common = crossProject(JSPlatform, JVMPlatform)
  .withoutSuffixFor(JVMPlatform)
  .crossType(CrossType.Pure)
  .settings(
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
    publishLocal := {}
  )

/** Used to convert the HOCON configuration file into a plain JSON one
  * for consumption by the JS interface 
  */
lazy val `schema-converter` = project
  .settings(
    scalaVersion := "2.12.12", 
    scalacOptions -= "-Xfatal-warnings",
    publish := {},
    publishLocal := {}
  )
  .dependsOn(calc)

/** Swing frontend, used for testing the calculation logic. */
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
    publishLocal := {}
  ).dependsOn(common.jvm)

/** ScalaJS calculation logic, used by the react frontend */
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
    publishLocal := {}
  )
  .enablePlugins(ScalaJSPlugin)
  .dependsOn(common.js)

val reactSource = file("..").getCanonicalFile / "react" / "src"

convertConfig := Def.taskDyn({
  // generate the JSON config file from the HOCON
  val sourceFile = file("..").getCanonicalFile / "national-insurance.conf"
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
