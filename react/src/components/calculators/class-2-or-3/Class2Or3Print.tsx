import React, {useContext} from 'react'
import {govDateString, sterlingStringValue, goveDateRangeString} from '../../../services/utils'

// components
import BackLink from "../../helpers/gov-design-system/BackLink";
import DetailsPrint from "../shared/DetailsPrint";
import Class2Or3Results from "./Class2Or3Results";

// types
import {Class12Or3SavePrintProps} from "../../../interfaces";
import {Class2Or3Context} from "./Class2Or3Context";

function Class2Or3Print(props: Class12Or3SavePrintProps) {
  const {setShowSummary, title} = props
  const {
    details,
    taxYear,
    paymentEnquiryDate,
    earningsFactor
  } = useContext(Class2Or3Context)
  return (
      <>
        <div className="save-print-wrapper">
          <div className="print-content">
            <BackLink callBack={() => setShowSummary(false)} />

            <h2 className="govuk-heading-l">
              {title}
            </h2>

            <DetailsPrint details={details} />

            <div className="section--top section--bottom divider--bottom">
              {taxYear &&
              <div className="container column">
                <span className="label block">Date higher rate provisions apply:</span>
                <div className="value inline width-8">
                  {goveDateRangeString(taxYear)}
                </div>
              </div>
              }

              {paymentEnquiryDate &&
                <div className="container column">
                  <span className="label block">Date higher rate provisions apply:</span>
                  <div className="value inline width-8">
                    {govDateString(paymentEnquiryDate)}
                  </div>
                </div>
              }

              {earningsFactor &&
              <div className="container column">
                <span className="label block">Date higher rate provisions apply:</span>
                <div className="value inline width-8 nomar">
                  {sterlingStringValue(earningsFactor)}
                </div>
              </div>
              }

            </div>

            <Class2Or3Results />
          </div>
        </div>
      </>
  )
}

export default Class2Or3Print