import React from 'react'

// types
import { SummaryListRowProps } from '../../../interfaces'

export default function SummaryListRow(props: SummaryListRowProps) {
  return (
    <div className={`govuk-summary-list__row${props.rowClasses ? ' ' + props.rowClasses : ''}`}>
      <dt className="govuk-summary-list__key">
        {props.listKey}
      </dt>
      <dd className="govuk-summary-list__value">
        {props.listValue}
      </dd>
    </div>
  )
}
