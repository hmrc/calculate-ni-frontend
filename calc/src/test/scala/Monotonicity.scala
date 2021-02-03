package eoi
package calc

import cats.implicits._
import org.scalatest._, prop._
import org.scalacheck._, Arbitrary.arbitrary
import java.time.LocalDate

class Monotonicity extends FlatSpec with PropertyChecks with Matchers {

implicit override val generatorDrivenConfig =
  PropertyCheckConfiguration(minSuccessful=100000, workers=10)

  lazy val config = eoi.calc.fromFile(new java.io.File("national-insurance.conf"))  

  val nat: Gen[Int] = arbitrary[Int] suchThat (_ >= 0)
  val letters: Gen[Char] = Gen.oneOf(
    config.classOne.values.flatMap{_.values}.flatMap(x => x.employee.keys ++ x.employer.keys)
  )

  val dates: Gen[LocalDate] = {
    import spire.math.interval._    
    Gen.oneOf(config.classOne.keys.map(_.lowerBound).collect {
      case Closed(b) => b
      case Open(b) => b
    })
  }

  "NI class 1 calcs" should "be monotonically increasing with gross pay" in {
    forAll(nat, nat, letters, dates, Gen.oneOf(Period.values), Gen.choose(1, 10)) {
      (z: Int, x: Int, c: Char, on: LocalDate, period: Period.Value, periodQty) =>

      val (a::b::_) = List(z,x).sorted
      val f = config.calculateClassOne(on, (_: BigDecimal), c, period.asInstanceOf[Period.Period], periodQty).map {
        case (_, (_, ee, er)) => (ee,er)
      }.foldLeft((Zero,Zero))(_ |+| _)
      f(a)._1 should be <= f(b)._1
      f(a)._2 should be <= f(b)._2
    }
  }

}
