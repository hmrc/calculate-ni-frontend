import React, {useContext} from 'react'

// types
import {LateRefundPrintProps} from '../../../interfaces'
import {Class3Context} from './Class3Context'

// components
import BackLink from '../../helpers/gov-design-system/BackLink'
import DetailsPrint from '../shared/DetailsPrint'

function Class3Print(props: LateRefundPrintProps) {
  const { title, setShowSummary } = props
  const {
    details
  } = useContext(Class3Context)
  return (
    <div className="save-print-wrapper">
      <div className="print-content">
        <BackLink callBack={() => setShowSummary(false)} />

        <h1 className="govuk-heading-l">{title}</h1>

        <DetailsPrint details={details} />

      </div>
    </div>
  )
}

export default Class3Print