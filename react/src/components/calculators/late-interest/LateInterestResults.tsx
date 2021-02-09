import React, {useContext} from 'react'

// types
import {LateInterestContext} from './LateInterestContext'


function LateInterestResults() {
  const {results} = useContext(LateInterestContext)
  return (
    <div className="section--top section-outer--top section--bottom section-outer--bottom divider--bottom results print-totals-inline">
      <h2 className="section-heading">Totals</h2>

      <div className="container">
        <div className="container quarter section--top column">
          <span className="label block">Class 1 debt</span>
          <div className="value inline full">
            {results?.totalDebt}
          </div>
        </div>

        <div className="container quarter section--top column">
          <span className="label block">Interest due</span>
          <div className="value inline full">
            {results?.totalInterest}
          </div>
        </div>

        <div className="container quarter section--top column">
          <span className="label block">Class1 debt and interest due</span>
          <div className="value inline full">
            {results?.grandTotal}
          </div>
        </div>

        <div className="container quarter section--top column">
          <span className="label block">Daily interest rate</span>
          <div className="value inline full">
            [todo]
          </div>
        </div>
      </div>

    </div>
  )
}

export default LateInterestResults