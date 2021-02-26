import React, {useState, useContext, useRef, useEffect} from 'react'
import { RemissionPeriod } from '../../../calculation'

// components
import Details from "../shared/Details"
import LateInterestForm from "../late-interest/LateInterestForm"
import LateInterestResults from "../late-interest/LateInterestResults"
import InterestRatesTable from '../shared/InterestRatesTable'
import {SuccessNotification} from "../shared/SuccessNotification";

// types
import {LateInterestContext, useLateInterestForm} from './LateInterestContext'
import {stripCommas, validateLateInterestPayload} from '../../../validation/validation'
import {hasKeys} from '../../../services/utils'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import LateInterestPrint from './LateInterestPrint'
import {Class1DebtRow} from '../../../interfaces'
import {useDocumentTitle} from "../../../services/useDocumentTitle";
import {SuccessNotificationContext} from '../../../services/SuccessNotificationContext'
import PrintButtons from "../shared/PrintButtons";

const pageTitle = 'Interest on late or unpaid Class 1 NI contributions'

const LateInterestPage = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const resultRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const totalsRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const {
    InterestOnLateClassOneCalculator,
    details,
    rows,
    setRows,
    rates,
    dateRange,
    setDetails,
    errors,
    setErrors,
    setActiveRowId,
    setResults,
    results,
    hasRemissionPeriod
  } = useContext(LateInterestContext)

  const { successNotificationsOn } = useContext(SuccessNotificationContext)

  const titleWithPrefix = hasKeys(errors) ? 'Error: ' + pageTitle : pageTitle
  useDocumentTitle(titleWithPrefix)

  const handleShowSummary = (event: React.FormEvent) => {
    event.preventDefault()
    setActiveRowId(null)
    submitForm(true)
  }

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ [name]: value })
  }

  const submitForm = (showSummaryIfValid: boolean) => {
    setErrors({})

    const payload = {
      rows,
      dateRange,
      hasRemissionPeriod
    }

    if(validateLateInterestPayload(payload, setErrors)) {
      const transformedRows = rows.map((row: Class1DebtRow) => {
        return {
          periodStart: row.taxYear?.from,
          debt: stripCommas(row.debt)
        }
      })
      const remission = payload.hasRemissionPeriod ? new (RemissionPeriod as any)(dateRange.from, dateRange.to) : null

      let resultFromCalculator: any;
      if (payload.hasRemissionPeriod) {
        resultFromCalculator = InterestOnLateClassOneCalculator.calculate(transformedRows, remission)
      } else {
        resultFromCalculator = InterestOnLateClassOneCalculator.calculate(transformedRows)
      }



      const newRows = rows.map((row: Class1DebtRow, i: number) => {
        return {
          ...row,
          interestDue: resultFromCalculator.rows[i].interestDue
        }
      })
      setRows(newRows)
      setResults(resultFromCalculator)

      if(showSummaryIfValid) {
        setShowSummary(true)
      }
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    submitForm(false)
  }

  useEffect(() => {
    if(successNotificationsOn && results) {
      resultRef.current.focus()
    } else if (results) {
      totalsRef.current.focus()
    }
  }, [results, resultRef, totalsRef, successNotificationsOn])

  return (
    <div>
      <div className="result-announcement" aria-live="polite" ref={resultRef} tabIndex={-1}>
        {successNotificationsOn && results && <SuccessNotification table={true} totals={true} />}
      </div>
      {showSummary ?
        <LateInterestPrint
          title={pageTitle}
          setShowSummary={setShowSummary}
        />
      :
        <>

          {(hasKeys(errors)) &&
          <ErrorSummary
              errors={errors}
          />
          }

          <h1>{pageTitle}</h1>

          <Details
            details={details}
            handleChange={handleChange}
          />

          <div className="container">
            <div className="container container-block two-thirds">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group table-wrapper nomar">
                  <LateInterestForm
                    handleShowSummary={handleShowSummary}
                  />
                </div>
              </form>
            </div>
            <div className="table-wrapper container third">
              <InterestRatesTable rates={rates} />
            </div>
          </div>
        </>
      }

      <div className="no-focus-outline" ref={totalsRef} tabIndex={-1}>
        <LateInterestResults printView={showSummary} />
      </div>

      <PrintButtons
        showSummary={showSummary}
        handleShowSummary={handleShowSummary}
      />

    </div>
  )
}

const LateInterest = () => (
  <LateInterestContext.Provider value={useLateInterestForm()}>
    <LateInterestPage />
  </LateInterestContext.Provider>
)

export default LateInterest
