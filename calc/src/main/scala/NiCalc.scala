package eoi
package calc

import scala.swing._
import scala.swing.event.TableUpdated
import pureconfig._
import pureconfig.generic.auto._
import Configuration._
import spire.math.Interval
import java.time.LocalDate

import spire.math.interval.{Closed, Open}
import javax.swing.{Action => _, _}

object ClassTwoPanel extends BorderPanel {

  def reloadConfig = {

  }
}

object ClassOnePanel extends BorderPanel {
  def currentTaxYear: Interval[LocalDate] = taxYearSelector.selection.item

  def config = MainFrame.config

  case class CharWrapper(value: Char) {
    override def toString = config.categoryNames.get(value).fold(value.toString){ d =>
      s"$value - $d"
    }
  }

  def reloadConfig = {
    val taxYear = taxYearSelector.peer.getSelectedItem()
    taxYearSelector.peer.setModel(new DefaultComboBoxModel(config.classOne.keys.toArray))
    if (config.classOne.keys.toList.contains(taxYear)) {
      taxYearSelector.peer.setSelectedItem(taxYear)
    }
    recalculate()
  }

  def recalculate(): Unit = {
    import inputTable._
    val r = (0 until rowCount).map { i =>
      config.calculateClassOne(
        currentTaxYear.lowerBound match {
          case Closed(e) => e
          case Open(e) => e
          case _ => throw new IllegalStateException(s"Cannot get lower bound on $currentTaxYear")
        },
        BigDecimal(model.getValueAt(i, 3).asInstanceOf[String]),
        model.getValueAt(i, 0).asInstanceOf[CharWrapper].value,
        model.getValueAt(i, 1).asInstanceOf[Period.Period],
        model.getValueAt(i, 2).asInstanceOf[String].toInt,
        false
      )
    }
    val (employee, employer) = r.flatMap(_.values).foldLeft((Zero, Zero)) {
      case ((eeAcc, erAcc), (_, ee, er)) => (eeAcc + ee, erAcc + er)
    }
    employeeNics.text=employee.toString
    employerNics.text=employer.toString
  }

  val tableInitialData: Seq[Array[Any]] = 1 to 20 map {
    _ => Array(CharWrapper('A'), Period.Week, "1": Any, "0")
  }

  lazy val inputTable = new Table(tableInitialData.toArray,Seq("Category", "Period Type", "Period Qty", "Gross Pay")) {
    peer.setDefaultEditor(classOf[CharWrapper], new javax.swing.DefaultCellEditor({new ComboBox(getCategories)}.peer))
    peer.setDefaultEditor(classOf[Period.Period], new javax.swing.DefaultCellEditor({new ComboBox(Period.values.toList)}.peer))

    override def editor(row: Int, column: Int) = column match {
      case _ =>
        val v   = apply(row, column).asInstanceOf[AnyRef]
        val clz: Class[_] = if (v != null) v.getClass else classOf[Object]
        peer.getDefaultEditor(clz)
    }

    reactions += { case _: TableUpdated => recalculate() }
  }

  def getCategories(): List[CharWrapper] = {
    config.classOne(currentTaxYear).values.flatMap( x =>
      x.employee.keys ++ x.employer.keys
    ).toList.sorted.distinct.map(CharWrapper)
  }

  val taxYearSelector = new ComboBox(config.classOne.keys.toSeq) {
    peer.addActionListener(Swing.ActionListener { _ =>
      cosrCheckbox.enabled =
        config.classOne(currentTaxYear).values.exists(_.contractedOutStandardRate.isDefined)

      inputTable.peer.setDefaultEditor(classOf[CharWrapper], new javax.swing.DefaultCellEditor({new ComboBox(getCategories)}.peer))
      recalculate()
    })
  }

  val cosrCheckbox = new CheckBox() {
    reactions += { case _ => recalculate() }
  }

  val options = new GridPanel(2,2) {
    contents ++= Seq(
      new Label("Tax Year:", Swing.EmptyIcon, Alignment.Right),
      taxYearSelector,
      new Label("Contracted Out Standard Rate:", Swing.EmptyIcon, Alignment.Right),
      cosrCheckbox
    )
  }

  val employeeNics = new Label("0.00", Swing.EmptyIcon, Alignment.Left)
  val employerNics = new Label("0.00", Swing.EmptyIcon, Alignment.Left)

  val results = new FlowPanel {
    contents ++= Seq(
      new Label("Employee NICs:", Swing.EmptyIcon, Alignment.Right),
      employeeNics,
      new Label("Employer NICs:", Swing.EmptyIcon, Alignment.Right),
      employerNics,
    )
  }

  add(options, BorderPanel.Position.North)
  add(new ScrollPane(inputTable), BorderPanel.Position.Center)
  add(results, BorderPanel.Position.South)

}



object MainFrame extends Frame {
  title = "NI Calculator"

  val mainFrame = this

  def loadConfig = {
    ConfigSource.file(new java.io.File("eoi.conf")).recoverWith{
    case err => ConfigSource.default
    }.load[Configuration]
  }

  var config: Configuration = loadConfig match {
    case Left(err) =>
      JOptionPane.showMessageDialog(null, err, "Unable to read configuration", JOptionPane.ERROR_MESSAGE)
      mainFrame.dispose()
      throw new IllegalStateException(s"Unable to read configuration: $err")
    case Right(c) => c
  }



  contents = ClassOnePanel
  
  pack()
  centerOnScreen()
  open()

  override def closeOperation(): Unit = dispose()


  menuBar = new MenuBar {
    contents += new Menu("File") {

      contents += new MenuItem(Action("Reload Config") {
        loadConfig match {
          case Left(err) =>
            JOptionPane.showMessageDialog(null, err, "Unable to read configuration", JOptionPane.ERROR_MESSAGE)
          case Right(conf) =>
            config = conf
        }
      })
      
      contents += new MenuItem(Action("Exit") {
        dispose()
      })
    }
  }

}

object NiCalc extends SimpleSwingApplication {
  def top = MainFrame
}
