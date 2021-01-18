import React, {useEffect, useRef, useState} from 'react'

import { ErrorSummaryProps } from '../../../interfaces'
import {hasKeys} from "../../../services/utils";

function ErrorSummary(props: ErrorSummaryProps) {
  const { errors, rowsErrors } = props
  const [isNew, setIsNew] = useState<boolean>(true)
  const summaryRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if(isNew && hasKeys(errors)) {
      summaryRef.current?.focus()
    }
    return () => setIsNew(false)
  }, [isNew, errors])
  return (
    <div ref={summaryRef} className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary">
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        There is a problem
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {Object.keys(errors).length > 0 && Object.keys(errors).map((key) => (
            <li key={key}>
              <a href={`#${errors[key]?.link}`}>
                {errors[key]?.message}
              </a>
            </li>
          ))}
          {Object.keys(rowsErrors).length > 0 && Object.keys(rowsErrors).map((rowKey) => (
            rowsErrors[rowKey] && Object.keys(rowsErrors[rowKey]).map((fieldName) => (
              <li key={`${rowKey}-${fieldName}`}>
                <a href={`#${rowsErrors[rowKey][fieldName].link}`}>
                  {`${rowsErrors[rowKey][fieldName].name} ${rowsErrors[rowKey][fieldName].message}`}
                </a>
              </li>
            ))
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ErrorSummary