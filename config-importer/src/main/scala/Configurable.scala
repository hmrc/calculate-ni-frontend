package eoi
package importer

object Configurable {

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

}
