import React, {useContext} from 'react'
import {LateRefundsContext} from './LateRefundsContext'

function LateRefundsResults() {
  const {results} = useContext(LateRefundsContext)
  return (
    <div className="section--top section-outer--top section--bottom section-outer--bottom divider--bottom results print-totals-inline">
      <h2 className="section-heading">Totals</h2>

      <div className="container section--top column">
        <span className="label block">Total amount for refund</span>
        <div className="value inline width-8">
          {results?.totalRefund}
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">Total interest payable</span>
        <div className="value inline width-8">
          {results?.totalInterest}
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">Total amount for refund and interest payable</span>
        <div className="value inline width-8">
          {results?.grandTotal}
        </div>
      </div>
    </div>
  )
}

export default LateRefundsResults