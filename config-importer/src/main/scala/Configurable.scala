package eoi
package importer

@simulacrum.typeclass
trait Configurable[A] {
  def toConfig(value: A): String
}

object Configurable {

  def instance[A](f: A => String): Configurable[A] = new Configurable[A] {
    def toConfig(value: A) = f(value)
  }

  def bandNameConversion(name: String) = {name match {
    case "AboveUEL" => "Above UEL"
    case "AboveAUST" => "Above AUST"
    case "AboveUST" => "Above UST"
    case "AboveUAP" => "UAP to UEL"
    case "RebateToST" => "LEL to ST Rebate"
    case x => x
  }}.optQuoted

  def subBlock(name: Option[String], eeOrEr: String, subData: Map[BigDecimal, String]): String = {

    val displayName = name.fold(""){x => bandNameConversion(x) + "."}
    subData.toList match {
      case (singleRate, singleCats) :: Nil =>
        s"${displayName}${eeOrEr}.$singleCats: ${singleRate.formatPercent}"
      case many =>
        (displayName ++ eeOrEr) is {
          many.map { case (rate, cats) => s"$cats: ${rate.formatPercent}" }.sorted.mkString("\n")
        }
    }
  }

  def groupCatsByRate(in: Iterable[(Char, BigDecimal)]): Map[BigDecimal, String] =
    in.groupBy(_._2).mapValues(_.map(_._1).toList.sorted.distinct.mkString)

  implicit def configurableList[A](implicit innerTc: Configurable[A]) =
    instance[List[A]] { x =>
      "[\n" + x.map(innerTc.toConfig).mkString("\n").indent(1) + "\n]"
    }

  implicit def configurableGrossPayException = instance[GrossPayException]{
    case GrossPayException(year, month, week, fourWeek, employee, employer) =>
      val lines = List(
        Some(s"year: $year"), 
        month.map{m => s"month: $m"},
        week.map{w => s"week: $w"},
        fourWeek.map{f => s"four-week: $f"},
        Some(employee).filter(_.nonEmpty).map{ee =>
          s"${subBlock(None, "employee", groupCatsByRate(ee))}"
        },
        Some(employer).filter(_.nonEmpty).map{er =>
          s"${subBlock(None, "employer", groupCatsByRate(er))}"
        }
      )
      "{\n" ++ lines.mkString("\n").indent(1) ++ "\n}"
  }
}
