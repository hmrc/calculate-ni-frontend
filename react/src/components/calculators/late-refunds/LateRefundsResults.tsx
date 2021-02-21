import React, {useContext} from 'react'
import {LateRefundsContext} from './LateRefundsContext'

function LateRefundsResults() {
  const {results} = useContext(LateRefundsContext)
  return (
    <div className="section--top section-outer--top section--bottom section-outer--bottom divider--bottom results print-totals-inline" id="results-totals">
      <h2 className="section-heading">Totals</h2>

      <div className="container">
        <div className="container third section--top column">
          <span className="label block" id="total-refund-label">Total amount for refund</span>
          <div className="value full inline" aria-describedby="total-refund-label">
            {results?.totalRefund}
          </div>
        </div>

        <div className="container third section--top column">
          <span className="label block" id="total-interest-label">Total interest payable</span>
          <div className="value full inline" aria-describedby="total-interest-label">
            {results?.totalInterest}
          </div>
        </div>

        <div className="container third section--top column">
          <span className="label block" id="refund-plus-interest-label">Total amount for refund and interest payable</span>
          <div className="value full inline" aria-describedby="refund-plus-interest-label">
            {results?.grandTotal}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LateRefundsResults