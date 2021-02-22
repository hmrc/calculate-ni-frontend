import React, {useContext} from 'react'
import {sterlingStringValue, dateStringSlashSeparated} from '../../../services/utils'

// types
import {Class2Or3Context, Class2Or3Result} from "./Class2Or3Context";
import {NiClassNameLabels} from "../../../interfaces";

function Class2Or3Results(props: {printView: boolean}) {
  const { printView } = props
  const {result, activeClass} = useContext(Class2Or3Context)
  return (
    <div className={`results section--top section--bottom divider--bottom${printView ? ` save-print-wrapper` : ``}`}>
      <div className="container section--bottom divider--bottom">
        <div className="container column third">
          <span className="label block" id="contributions-due-label">Contributions due</span>
          <div tabIndex={0} className="value nomar inline width-3" aria-describedby="contributions-due-label">
            {result?.contributionsDue}
          </div>
        </div>
        <div className="container column third">
          <span className="label block" id="rate-label">{activeClass ? NiClassNameLabels[activeClass] : 'Class'} rate</span>
          <div tabIndex={0} className="value nomar inline width-8" aria-describedby="rate-label">
            {result?.rate && sterlingStringValue(result.rate.toString())}
          </div>
        </div>
        <div className="container column third">
          <span className="label block" id="total-label">Total amount due</span>
          <span tabIndex={0} className="value nomar inline width-8" aria-describedby="total-label">
            {result?.totalAmountDue && sterlingStringValue(result.totalAmountDue.toString())}
          </span>
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block" id="higher-rate-date-label">Date higher rate provisions apply</span>
        <div tabIndex={0} className="value inline width-8" aria-describedby="higher-rate-date-label">
          {result?.dateHigherRateApply && dateStringSlashSeparated(result.dateHigherRateApply)}
        </div>
      </div>

      <div className="container column">
        <span className="label block" id="final-pension-date-label">Final payment date for pension purposes</span>
        <div tabIndex={0} className="value inline width-8" aria-describedby="final-pension-date-label">
          {result?.finalPaymentDate && dateStringSlashSeparated(result.finalPaymentDate)}
        </div>
      </div>
    </div>
  )
}

export default Class2Or3Results
