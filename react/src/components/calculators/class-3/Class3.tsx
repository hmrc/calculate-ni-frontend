import React, {useContext, useEffect, useRef, useState} from 'react'
import {hasKeys} from "../../../services/utils";
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";
import Details from "../shared/Details";
import {Class3Context, useClass3Form} from "./Class3Context";
import {validateClass3Payload} from "../../../validation/validation";
import Class3Print from './Class3Print'
import {useDocumentTitle} from "../../../services/useDocumentTitle";
import Class3Breakdown from "./Class3Breakdown";
import PrintButtons from "../shared/PrintButtons";
import {SuccessNotificationContext} from "../../../services/SuccessNotificationContext";
import {SuccessNotification} from "../shared/SuccessNotification";
import {DateRange} from "../shared/DateRange";

const pageTitle = 'Weekly contribution conversion'

const Class3Page = () => {
  const breakdownRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const resultRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const {
    details,
    setDetails,
    errors,
    setErrors,
    setActiveRowId,
    WeeklyContributionsCalculator,
    dateRange,
    setDateRange,
    results,
    setResults
  } = useContext(Class3Context)
  const { successNotificationsOn } = useContext(SuccessNotificationContext)
  const titleWithPrefix = hasKeys(errors) ? 'Error: ' + pageTitle : pageTitle
  useDocumentTitle(titleWithPrefix)

  useEffect(() => {
    setResults(null)
  }, [dateRange.fromParts, dateRange.toParts, setResults])

  const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault()
      setActiveRowId(null)
      submitForm(false)
  }
  const handleShowSummary = (event: React.FormEvent) => {
      event.preventDefault()
      submitForm(true)
  }

  const submitForm = (showSummaryIfValid: boolean) => {
    setErrors({})
    const payload = {
        dateRange
    }

    if(validateClass3Payload(payload, setErrors)) {
      const result = WeeklyContributionsCalculator.breakdown(dateRange.from, dateRange.to)
      setResults(result)
      setShowSummary(showSummaryIfValid)
    }
  }

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ [name]: value })
  }

  useEffect(() => {
    if(successNotificationsOn && results) {
      resultRef.current.focus()
    } else if (results) {
      breakdownRef.current.focus()
    }
  }, [results, resultRef, breakdownRef, successNotificationsOn])

  return (
    <div>
      <div className="result-announcement" aria-live="polite" ref={resultRef} tabIndex={-1}>
        {successNotificationsOn && results && <SuccessNotification table={true} totals={false} />}
      </div>
      {showSummary ?
        <Class3Print
          title={pageTitle}
          setShowSummary={setShowSummary}
        />
      :
        <>
          {hasKeys(errors) &&
            <ErrorSummary
              errors={errors}
            />
          }
          <h1>{pageTitle}</h1>
          <Details
          details={details}
          handleChange={handleChange}
          />
        </>
      }
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <DateRange
            isSaveAndPrint={showSummary}
            id="wcc"
            setDateRange={setDateRange}
            dateRange={dateRange}
            errors={errors}
            legends={{
              from: "From",
              to: "To"
            }}
            hideLabels={false}
          />

          {!showSummary &&
            <div className="form-group divider--top section--top">
              <button className="govuk-button nomar" type="submit">
                Calculate
              </button>
            </div>
          }

        </div>
      </form>


      <div ref={breakdownRef} className="no-focus-outline" tabIndex={-1}>
        <Class3Breakdown isSaveAndPrint={showSummary} results={results} />
      </div>
      <PrintButtons
        showSummary={showSummary}
        handleShowSummary={handleShowSummary}
      />
    </div>
  )
}

const Class3 = () => {
    return (
      <Class3Context.Provider value={useClass3Form()}>
          <Class3Page/>
      </Class3Context.Provider>
    )
}

export default Class3
