import React, {useContext} from 'react'

// types
import {Class2Or3Context} from "./Class2Or3Context";

function Class2Or3Results() {
  const {result, activeClass} = useContext(Class2Or3Context)
  return (
    <div className="results section--bottom divider--bottom">
      <div className="container section--bottom divider--bottom">
        <div className="container column third">
          <span className="label block">Contributions due:</span>
          <div className="value nomar inline width-3">
            {result?.contributionsDue}
          </div>
        </div>
        <div className="container column third">
          <span className="label block">{activeClass ? activeClass : 'Class'} rate:</span>
          <div className="value nomar inline width-8">
            {result?.rate}
          </div>
        </div>
        <div className="container column third">
          <span className="label block">Total amount due:</span>
          <span className="value nomar inline width-8">
                {result?.totalAmountDue}
              </span>
        </div>
      </div>

      <div className="container column">
        <span className="label block">Date higher rate provisions apply:</span>
        <div className="value inline width-8">
          {result?.dateHigherRateApply}
        </div>
      </div>

      <div className="container column">
        <span className="label block">Final payment date for pension purposes:</span>
        <div className="value inline width-8">
          {result?.finalPaymentDate}
        </div>
      </div>
    </div>
  )
}

export default Class2Or3Results