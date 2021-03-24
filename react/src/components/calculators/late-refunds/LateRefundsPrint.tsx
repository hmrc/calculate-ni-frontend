import React, {useContext} from 'react'

// types
import {LateRefundPrintProps} from '../../../interfaces'
import {LateRefundsContext} from './LateRefundsContext'

// components
import BackLink from '../../helpers/gov-design-system/BackLink'
import DetailsPrint from '../shared/DetailsPrint'
import LateRefundsTable from './LateRefundsTable'

function LateRefundsPrint(props: LateRefundPrintProps) {
  const { title, setShowSummary } = props
  const {
    details
  } = useContext(LateRefundsContext)
  return (
    <div className="save-print-wrapper">
      <div className="print-content">
        <BackLink callBack={() => setShowSummary(false)} />

        <h1 className="govuk-heading-l">{title}</h1>

        <DetailsPrint details={details} />

        <div className="divider--bottom">
          <div className="section--top">
            <LateRefundsTable printView={true} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default LateRefundsPrint