import React, {useContext} from 'react'

// types
import {LateRefundPrintProps} from '../../../interfaces'
import {Class3Context} from './Class3Context'

// components
import BackLink from '../../helpers/gov-design-system/BackLink'
import DetailsPrint from '../shared/DetailsPrint'
import Class3Breakdown from "./Class3Breakdown";
import {govDateString} from "../../../services/utils";

function Class3Print(props: LateRefundPrintProps) {
  const { title, setShowSummary } = props
  const {
    details,
    dateRange,
    results
  } = useContext(Class3Context)
  return (
    <div className="save-print-wrapper">
      <div className="print-content">
        <BackLink callBack={() => setShowSummary(false)} />

        <h1 className="govuk-heading-l">{title}</h1>

        <DetailsPrint details={details} />

        {dateRange.from && dateRange.to &&
        <div className="divider--bottom section--bottom section-outer--bottom">
          <h3 className="govuk-heading-s">Dates from and to</h3>
          <p>
            From <strong>{govDateString(dateRange.from)}</strong> to <strong>{govDateString(dateRange.to)}</strong>
          </p>
        </div>
        }

        {results && <Class3Breakdown results={results} />}
      </div>
    </div>
  )
}

export default Class3Print