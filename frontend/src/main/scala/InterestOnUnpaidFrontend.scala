package eoi
package frontend

import java.time.LocalDate
import spire.math.Interval
 
class InterestOnUnpaidFrontend(
  config: Configuration
) extends InterestFrontend {

  protected def calculationFunction(
    row: InterestRow,
    remissionPeriod: Option[RemissionPeriod]
  ): InterestResult = config.calculateInterestOnLatePayment(
    row.debt,
    TaxYear(row.periodStart),
    remissionPeriod.map { p => Interval.closed(p.start, p.end) }
  )

  protected def rates: Map[Interval[LocalDate], BigDecimal] =
    config.interestOnLatePayment

}
