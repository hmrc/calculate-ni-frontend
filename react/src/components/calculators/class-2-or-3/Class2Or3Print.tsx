import React, {useContext} from 'react'

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
    details
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

            <Class2Or3Results />
          </div>
        </div>
      </>
  )
}

export default Class2Or3Print