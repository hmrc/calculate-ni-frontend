package eoi

object Period extends Enumeration {
  type Period = Vala

  protected case class Vala(string: String, qtyInYear: Int) extends super.Val 

  val Week = Vala("Wk", 52)
  val Month = Vala("Mnth", 12)
  val FourWeek = Vala("4Wk", 52/4)
  val Year = Vala("Ann", 1)

  def apply(in: String): Period = values.find(_.asInstanceOf[Vala].string.equalsIgnoreCase(in)).fold(
    throw new NoSuchElementException()
  )(_.asInstanceOf[Vala])
}
