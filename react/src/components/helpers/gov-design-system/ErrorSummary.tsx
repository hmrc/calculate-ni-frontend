import React from 'react'

import { ErrorSummaryProps } from '../../../interfaces'

function ErrorSummary(props: ErrorSummaryProps) {
  return (
    <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary">
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        There is a problem
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {props.rowsErrors && Object.keys(props.rowsErrors).map(rE => (
            Object.keys(props.rowsErrors[rE]).map(r => (
              <li key={`${rE}-${r}`}>
                <a href={`#${props.rowsErrors[rE][r]['link']}`}>
                  {`${props.rowsErrors[rE][r]['name']} ${props.rowsErrors[rE][r]['message']}`}
                </a>
              </li>
            ))
          ))}
          {props.errors && Object.keys(props.errors).map(key => (
            <li key={key}>
              <a href={`#${key}`}>
                {props.errors[key as keyof ErrorSummaryProps['errors']]}
              </a>
            </li> 
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ErrorSummary