import React, {useContext} from 'react'
import {sterlingStringValue, dateStringSlashSeparated} from '../../../services/utils'

// types
import {Class2Or3Context} from "./Class2Or3Context";
import {NiClassNameLabels} from "../../../interfaces";

function Class2Or3Results() {
  const {result, activeClass} = useContext(Class2Or3Context)
  return (
    <div className="results section--top section--bottom divider--bottom">
      <div className="container section--bottom divider--bottom">
        <div className="container column third">
          <span className="label block">Contributions due</span>
          <div className="value nomar inline width-3">
            {result?.contributionsDue}
          </div>
        </div>
        <div className="container column third">
          <span className="label block">{activeClass ? NiClassNameLabels[activeClass] : 'Class'} rate</span>
          <div className="value nomar inline width-8">
            {result?.rate ? sterlingStringValue(result.rate.toString()) : result?.rate}
          </div>
        </div>
        <div className="container column third">
          <span className="label block">Total amount due</span>
          <span className="value nomar inline width-8">
            {result?.totalAmountDue ? sterlingStringValue(result.totalAmountDue.toString()) : result?.totalAmountDue}
          </span>
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">Date higher rate provisions apply</span>
        <div className="value inline width-8">
          {result?.dateHigherRateApply ? dateStringSlashSeparated(result.dateHigherRateApply) : result?.dateHigherRateApply}
        </div>
      </div>

      <div className="container column">
        <span className="label block">Final payment date for pension purposes</span>
        <div className="value inline width-8">
          {result?.finalPaymentDate ? dateStringSlashSeparated(result.finalPaymentDate) : result?.finalPaymentDate}
        </div>
      </div>
    </div>
  )
}

export default Class2Or3Results