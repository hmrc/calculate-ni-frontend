import React, {useContext} from 'react'

// types
import {LateInterestContext} from './LateInterestContext'


function LateInterestResults() {
  const {results} = useContext(LateInterestContext)
  return (
    <div className="section--top section-outer--top section--bottom section-outer--bottom divider--bottom results print-totals-inline" id="results-totals">
      <h2 className="section-heading">Totals</h2>

      <div className="container">
        <div className="container quarter section--top column">
          <span className="label block" id="total-debt-label">Class 1 debt</span>
          <div className="value inline full" aria-describedby="total-debt-label">
            {results?.totalDebt}
          </div>
        </div>

        <div className="container quarter section--top column">
          <span className="label block" id="total-interest-label">Interest due</span>
          <div className="value inline full" aria-describedby="total-interest-label">
            {results?.totalInterest}
          </div>
        </div>

        <div className="container quarter section--top column">
          <span className="label block" id="debt-plus-interest-label">Class1 debt and interest due</span>
          <div className="value inline full" aria-describedby="debt-plus-interest-label">
            {results?.grandTotal}
          </div>
        </div>

        <div className="container quarter section--top column">
          <span className="label block" id="daily-interest-label">Daily interest rate</span>
          <div className="value inline full" aria-describedby="daily-interest-label">
            [todo]
          </div>
        </div>
      </div>

    </div>
  )
}

export default LateInterestResults