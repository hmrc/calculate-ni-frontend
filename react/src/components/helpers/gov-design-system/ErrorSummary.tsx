import React, {useEffect, useRef} from 'react'

import { ErrorSummaryProps } from '../../../interfaces'
import {hasKeys} from "../../../services/utils";

function ErrorSummary(props: ErrorSummaryProps) {
  const { errors } = props
  const summaryRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if(hasKeys(errors)) {
      summaryRef.current?.focus()
    }
  }, [errors])
  return (
    <div ref={summaryRef} className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary">
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        There is a problem
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {hasKeys(errors) && Object.keys(errors).map((key) => (
            <li key={key}>
              <a href={`#${errors[key]?.link}`}>
                {errors[key]?.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ErrorSummary