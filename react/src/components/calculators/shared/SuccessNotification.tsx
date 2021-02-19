import React from "react"

export function SuccessNotification(props: {table?: boolean, totals?: boolean}) {
  const { table, totals } = props
  return (
    <div className="govuk-notification-banner govuk-notification-banner--success" role="alert"
         aria-labelledby="govuk-notification-banner-title" data-module="govuk-notification-banner">
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
          The page has been updated with the results of your calculation
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <ul className="govuk-list">
          {table && <li><a href="#results-table" className="govuk-link">Skip to results in table</a></li>}
          {totals && <li><a href="#results-totals" className="govuk-link">Skip to results totals</a></li>}
        </ul>
      </div>
    </div>
  )
}