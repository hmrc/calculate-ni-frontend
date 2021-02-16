import React from "react"

export function SuccessNotification(props: {table?: boolean, totals?: boolean}) {
  const { table, totals } = props
  return (
    <div className="govuk-notification-banner govuk-notification-banner--success" role="alert"
         aria-labelledby="govuk-notification-banner-title" data-module="govuk-notification-banner">
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
          Success
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p className="govuk-body">
          The page has been updated with the results of your calculation
          {table && <><br/><a href="#results-table">Skip to results in table</a></>}
          {totals && <><br/><a href="#results-totals">Skip to results totals</a></>}
        </p>
      </div>
    </div>
  )
}