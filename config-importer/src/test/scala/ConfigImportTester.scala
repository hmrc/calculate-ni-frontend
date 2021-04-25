package eoi
package importer

import java.io._
import java.time.LocalDate
import spire.math.Interval
import cats.data.Chain
import cats.implicits._
import scalatags.Text.all._
import BigDecimal.RoundingMode.HALF_UP
import pureconfig._, syntax._
import ConfigWriterInstances._

case class ExhaustiveDifferencesReport(failures: List[(List[ClassOneRowInput], ClassOneResult, ClassOneResult)])

object Tester {

  val exhaustiveTestNum = 10000
  val maxMoneyTest = 1000000

  def exhaustiveTest(onDate: LocalDate, a: Configuration, b: Configuration): Option[ExhaustiveDifferencesReport] = {
    import org.scalacheck._

    val c1Opt: Option[List[Char]] = a.classOne.at(onDate).map{ c1 => 
        (
          c1.values.flatMap( x =>
            x.employee.keys ++ x.employer.keys
          ).toList.sorted.distinct
        )
    }

    c1Opt.map { case cats =>
      def genInput(id: Int) : Gen[ClassOneRowInput] = for {
        money <- Gen.choose(0, Math.sqrt(maxMoneyTest)).map(x => Money.apply(BigDecimal(x)))
        cat   <- Gen.oneOf(cats)
        period <- Gen.oneOf(List("Wk", "Mnth", "4Wk").map(Period.apply))
      } yield ClassOneRowInput(id.toString, (money * money).setScale(0, HALF_UP), cat, period)

      ExhaustiveDifferencesReport(      
        (1 to exhaustiveTestNum).toList.flatMap { i =>
          val rows = genInput(i).sample.get :: Nil
          val resA = a.calculateClassOne(onDate, rows) // add 1 month to get around misalignment issue
          val resB = b.calculateClassOne(onDate, rows)
          val resAee = resA.rowsOutput.head.employeeContributions
          val resAer = resA.rowsOutput.head.employerContributions
          val resBee = resB.rowsOutput.head.employeeContributions
          val resBer = resB.rowsOutput.head.employerContributions

          if (resAee.value != resBee.value || resAer.value != resBer.value) {
            (rows, resA, resB) :: Nil
          } else {
            Nil
          }
        }
      )
    }
  }

  def cleanBlockName(in: String): String = in.replaceAll("""[:" ]""","")

  private val blockRegex = """([^ ].*) [{].*""".r
  def getBlocks(data: Iterable[String]): List[(String, String)] = {
    
    val pass = data.foldLeft((List.empty[(String,String)], Chain.empty[String], None: Option[String])) {
      case ((blocks, nextBlock, None), line) =>
        line match {
          case blockRegex(blockName) => (blocks, Chain.one(line), Some(cleanBlockName(blockName)))
          case _ =>                     (blocks, Chain.empty[String], None)
        }
      case ((blocks, nextBlock, Some(blockName)), line) => 
        if (line.matches("""^}""")) {
          ((blockName,(nextBlock :+ line).toList.mkString("\n")) :: blocks, Chain.empty[String], None)
        } else {
          (blocks, nextBlock :+ line, Some(blockName))
        }        
    }

    pass._1.reverse
  }

  lazy val oldBlocks: Map[String, String] = {
    val lines = scala.io.Source.fromFile("national-insurance.conf").getLines.toList
    getBlocks(lines).toMap
  }

  def loadConfig(in: String, name: String): Configuration = {

    val boilerplate = """|category-names {}
                         |interest-on-late-payment {}
                         |interest-on-repayment {}""".stripMargin
    Either.catchNonFatal(
      ConfigLoader.fromString(in + "\n" + boilerplate)
    ) match {
      case Left(err) =>
        println(err.getLocalizedMessage)
        println()
        println(in.indent(2))
        println()
        sys.error(s"Unable to parse $name")
      case Right(v) => v
    }
  }

  // we only match against the first 10 characters to get around the date mismatch
  def findOldBlock(key: String): Option[String] = oldBlocks.collectFirst{
    case (k,v) if key.take(10) == k.take(10) => v 
  }

  def summary(failures: List[(List[ClassOneRowInput], ClassOneResult, ClassOneResult)]): Tag = {
    val soloRows: List[ClassOneRowInput] = failures.flatMap(_._1)

      // def breakdown[A](label: String)(f: ClassOneRowInput => A): Tag = {
      //   table(
      //     (tr(th(label), th("Errors")) ::
      //       soloRows.groupBy(f).map{case (k,v) => tr(td(k.toString),td(v.size))}.toList):_*
      //   )
      // }

    def pie[A](label: String, data: Map[A, Int]): Tag = {
      val idLabel = label.filter(_.isLetterOrDigit)

      val values = data.map{
        case (k,v) => s"""{ y: $v, indexLabel: "${k.toString}" }"""
      }.mkString(",")

      div(
        div(id := idLabel, style :="height: 300px; width: 30%;")(),
        script(tpe:= "text/javascript")(
          raw(s"""
	var chart = new CanvasJS.Chart("$idLabel",
	{
		title:{
			text: "Discrepancies by $label"
		},
		legend: {
			maxWidth: 350,
			itemWidth: 120
		},
		data: [
		{
			type: "pie",
			showInLegend: true,
			legendText: "{indexLabel}",
			dataPoints: [ $values ] 
		}
		]
	});
	chart.render();
""")))
    }

    def inputPie[A](label: String)(f: ClassOneRowInput => A): Tag = {
      val values = soloRows.groupBy(f).mapValues(_.size).toMap;
      pie[A](label, values)
    }

    div(
      inputPie("Category")(_.category),
      inputPie("Period")(_.period),
      pie(
        "Type",
        failures.map {
          case (_, a, b) if a.employeeContributions.value == b.employeeContributions.value => "Employer"
          case (_, a, b) if a.employerContributions.value == b.employerContributions.value => "Employee"
          case _ => "Both"
        }.groupBy(identity).mapValues(_.size)
      )
    )
  }

  def buildReport(configA: String, configB: String, report: Option[ExhaustiveDifferencesReport]): String = {

    def rowByRowExamples(failures: List[(List[ClassOneRowInput], ClassOneResult, ClassOneResult)], numRecords: Int = 100): Tag = div(
      failures.take(numRecords).zipWithIndex.map { case ((rows, a,b),index) =>

        val rowsDetail = div(rows.zipWithIndex.map { case (ClassOneRowInput(rowId, money, cat, period, periodQty), i) =>
            dl(
              dt("Gross Pay"), dd(money.toString),
              dt("Category"), dd(cat.toString),
              dt("Period"), dd(s"$periodQty × $period")
            )
        }:_*)

        def explainCell(res: ClassOneResult): Tag = 
          td(colspan := 2)(pre(style:="border: 1px solid grey;")(raw{
            res.rowsOutput match {
              case r :: Nil => r.totalContributions.explain.mkString("\n")
              case _ => res.totalContributions.explain.mkString("\n")
            }
          }))

        val comparisonTable = table(
          tr(th(colspan:= 2)("Old Calculation"), th(colspan:= 2)("New Calculation")), 
          tr(
            explainCell(a),
            explainCell(b),
          ),
          tr(
            td(strong("Employee: "), span(a.employeeContributions.value.toString)),
            td(strong("Employer: "), span(a.employerContributions.value.toString)),
            td(strong("Employee: "), span(b.employeeContributions.value.toString)),
            td(strong("Employer: "), span(b.employerContributions.value.toString))
          )
        )

        div(
          h2(s"Example $index"),
          rowsDetail,
          comparisonTable
        )
      }: _*
    )

    val tag = html(
      head(
        script(tpe:="text/javascript", src:="https://canvasjs.com/assets/script/canvasjs.min.js")
      ),
      body(
        h1("Config files"), 
        table(
          tr(th("Old Configuration"), th("New Configuration")),
          tr(td(pre(style:="border: 1px solid grey;")("\n" ++ configA)), td(pre(style:="border: 1px solid grey;")("\n" ++ configB)))
        ),
        report match {
          case None =>
            h1("C1 Not defined / unable to process")
          case Some(ExhaustiveDifferencesReport(Nil)) =>
            h1(s"All $exhaustiveTestNum calculations gave identical results")
          case Some(ExhaustiveDifferencesReport(x)) =>
            div(
              h1(s"${x.size} of $exhaustiveTestNum calculations gave differing results"),
              summary(x),
              rowByRowExamples(x, 100)
            )
        }
      )
    )
    tag.toString
  }

  def indexPage(in: List[(String, String)]): String = html (
    head(),
    body(
      table(
        tr(th("Tax Year"), th("Discrepancies")) ::
          in.map { case (k, v) => 
            tr(td(a(href:=k)(k.replace(".html", ""))), td(v))
          }
      )
    )
  ).toString

  def main(args: Array[String]): Unit = {

    val reportDir = new File("target/config-reports")
    if (!reportDir.exists) reportDir.mkdir()

    val newConfig = Importer2.getNewConfig()
    val oldConfig = ConfigLoader.default

    val testResultsByYear: List[(String, String)] =
      newConfig.data.collect{
        case (k,v) if v.classOne.isDefined => k
      }.toList.sorted.par.map { period =>
        val newString = writeConfig(newConfig.data(period).toConfig)
        val blockId = formatPeriod(period).replaceAll("\"", "")

        findOldBlock(blockId) match {
          case Some(oldString) =>
            val filename = formatPeriod(period)
              .replaceAll("""["()\[\]]""", "")
              .replaceAll(",","_") + ".html"
            val testResults = exhaustiveTest(period.lowerValue.get.plusMonths(1), oldConfig, newConfig)
            writeToFile(
              new File(reportDir, filename),
              buildReport(oldString, newString, testResults)
            )
            (filename, testResults.fold("n/a")(_.failures.size.toString + "/" + exhaustiveTestNum))
          case None =>
            throw new Exception(s"Cannot find block called '$blockId' in old config")
        }
      }.toList


    writeToFile(
      new File(reportDir, "index.html"),
      indexPage(testResultsByYear)
    )

    testResultsByYear.foreach(println)
  }
}
