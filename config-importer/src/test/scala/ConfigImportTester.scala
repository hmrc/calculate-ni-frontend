package eoi
package importer

import java.io._
import java.time.LocalDate
import spire.math.Interval
import cats.data.Chain
import cats.implicits._
import scalatags.Text.all._

case class ExhaustiveDifferencesReport(failures: List[(List[ClassOneRowInput], ClassOneResult, ClassOneResult)])

object Tester {

  val exhaustiveTestNum = 10000
  val maxMoneyTest = 1000000

  def exhaustiveTest(a: Configuration, b: Configuration): Option[ExhaustiveDifferencesReport] = {
    import org.scalacheck._

    val c1Opt: Option[(LocalDate, List[Char])] = a.classOne.headOption.map{
      case (date, c1) =>
        (
          date.lowerValue.get,
          c1.values.flatMap( x =>
            x.employee.keys ++ x.employer.keys
          ).toList.sorted.distinct
        )
    }

    c1Opt.map { case (onDate, cats) =>
      def genInput(id: Int) : Gen[ClassOneRowInput] = for {
        money <- Gen.choose(0, Math.sqrt(maxMoneyTest))
        cat   <- Gen.oneOf(cats)
        period <- Gen.oneOf(List("Wk", "Mnth", "4Wk").map(Period.apply))
      } yield ClassOneRowInput(id.toString, money * money, cat, period)

      ExhaustiveDifferencesReport(      
        (1 to exhaustiveTestNum).toList.flatMap { i =>
          val rows = genInput(i).sample.get :: Nil
          val resA = a.calculateClassOne(onDate.plusMonths(1), rows) // add 1 month to get around misalignment issue
          val resB = b.calculateClassOne(onDate.plusMonths(1), rows)
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

  def compareAndReport(a: Configuration, b: Configuration): String = {
    val res = exhaustiveTest(a, b)
    res match {
      case None =>
        s"C1 Not defined / unable to process"
      case Some(ExhaustiveDifferencesReport(Nil)) =>
        s"All $exhaustiveTestNum calculations gave identical results"
      case Some(ExhaustiveDifferencesReport(x)) =>
        s"${x.size} of $exhaustiveTestNum calculations gave differing results" ++
        "\n\n-------------\n\n" ++
        x.take(100).map { case (rows, a,b) =>
          rows.zipWithIndex.map { case (ClassOneRowInput(rowId, money, cat, period, periodQty), i) =>
            s"row $i. ${money.formatMoney}, Cat $cat, $periodQty × $period"
          }.mkString("\n") ++ "\n\n" + 
          a.totalContributions.explain.mkString("\n") + "\n\n" + 
          b.totalContributions.explain.mkString("\n")
        }.map(_.indent(1)).mkString("\n\n-------------\n\n")
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

  def findOldBlock(key: String): Option[String] = oldBlocks.collectFirst{
    case (k,v) if key.take(10) == k.take(10) => v
  }

def summary(failures: List[(List[ClassOneRowInput], ClassOneResult, ClassOneResult)]): Tag = {
      val soloRows: List[ClassOneRowInput] = failures.flatMap(_._1)

      def breakdown[A](label: String)(f: ClassOneRowInput => A): Tag = {
        table(
          (tr(th(label), th("Errors")) ::
            soloRows.groupBy(f).map{case (k,v) => tr(td(k.toString),td(v.size))}.toList):_*
        )
      }

      def pie[A](label: String, data: Map[A, Int]): Tag = {
        val idLabel = label.filter(_.isLetterOrDigit)

        val values = data.map{
          case (k,v) => s"""{ y: $v, indexLabel: "${k.toString}" }"""
        }.mkString(",")

        div(
          div(id := idLabel, style :="height: 300px; width: 100%;")(),
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
            case (_, a, b) if a.employerContributions.value == b.employerContributions.value => "Employer"
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
              dt("Gross Pay"), dd(money.formatMoney),
              dt("Category"), dd(money.formatMoney),
              dt("Period"), dd(s"$periodQty × $period")
            )
        }:_*)

        val comparisonTable = table(
          tr(
            td(pre(style:="border: 1px solid grey;")(raw(
              a.totalContributions.explain.mkString("\n")
            ))),
            td(pre(style:="border: 1px solid grey;")(raw(
              b.totalContributions.explain.mkString("\n")
            )))
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

  def main(args: Array[String]): Unit = {

    val reportDir = new File("target/config-reports")

    Importer.getNewConfig().par.foreach { case (period, newString) =>

      val blockId = formatPeriod(period).replaceAll("\"", "")

      findOldBlock(blockId) match {
        case Some(oldString) => 
          val oldConfig = loadConfig(oldString, s"old $blockId")
          val newConfig = loadConfig(newString, s"new $blockId")

          val filename = formatPeriod(period)
            .replaceAll("""["()\[\]]""", "")
            .replaceAll(",","_") + ".html"

          writeToFile(
            new File(new File("target/config-reports"), filename),
            buildReport(oldString, newString, exhaustiveTest(oldConfig, newConfig))
          )
        case None =>
          System.err.println(s"Cannot find block called '$blockId' in old config")
      }

    }
  }
}
