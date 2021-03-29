package eoi
package frontend

import java.time.LocalDate
import spire.math.Interval

class InterestOnRefundsClassOne (
  config: Configuration
) extends InterestFrontend {

  protected def calculationFunction(
    row: InterestRow,
    remissionPeriod: Option[RemissionPeriod]
  ): InterestResult = config.calculateInterestOnRepayment(
    row.debt,
    TaxYear(row.periodStart),
    row.paymentDate.map(x => x: LocalDate).toOption.getOrElse(LocalDate.now)
  )

  protected def rates: Map[Interval[LocalDate], BigDecimal] =
    config.interestOnRepayment

}
