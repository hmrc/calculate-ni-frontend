import React, {useContext, useEffect, useRef, useState} from 'react'
import {hasKeys} from '../../../services/utils'
import {stripCommas, validateLateRefundsPayload} from '../../../validation/validation'

// components
import Details from '../shared/Details'
import LateRefundsForm from './LateRefundsForm'
import LateRefundsResults from './LateRefundsResults'
import LateRefundsPrint from './LateRefundsPrint'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import {SuccessNotification} from "../shared/SuccessNotification";

// types
import {LateRefundsContext, useLateRefundsForm} from './LateRefundsContext'
import {LateRefundsTableRowProps} from '../../../interfaces'
import {useDocumentTitle} from "../../../services/useDocumentTitle";
import {SuccessNotificationContext} from '../../../services/SuccessNotificationContext'
import PrintButtons from "../shared/PrintButtons";

const pageTitle = 'Interest on late-paid refunds from 1993 to 1994'

const LateRefundsPage = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const resultRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const totalsRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const {
    InterestOnLateRefundsCalculator,
    bankHolidaysNo,
    rows,
    setRows,
    errors,
    setErrors,
    details,
    setDetails,
    setResults,
    results,
    setActiveRowId
  } = useContext(LateRefundsContext)

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
      bankHolidaysNo
    }

    if(validateLateRefundsPayload(payload, setErrors)) {
      const transformedRows = rows.map((row: LateRefundsTableRowProps) => {
        return {
          periodStart: row.taxYear?.from,
          refund: stripCommas(row.refund)
        }
      })

      const resultFromCalculator = InterestOnLateRefundsCalculator.calculate(transformedRows)

      const newRows = rows.map((row: LateRefundsTableRowProps, i: number) => ({
        ...row,
        payable: resultFromCalculator.rows[i].payable
      }))
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
        <LateRefundsPrint
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group table-wrapper nomar">
              <LateRefundsForm />
            </div>
          </form>
        </>
      }

      <div className="no-focus-outline" ref={totalsRef} tabIndex={-1}>
        <LateRefundsResults printView={showSummary} />
      </div>

      <PrintButtons
        showSummary={showSummary}
        handleShowSummary={handleShowSummary}
      />

    </div>
  )
}

const LateRefunds = () => (
  <LateRefundsContext.Provider value={useLateRefundsForm()}>
    <LateRefundsPage />
  </LateRefundsContext.Provider>
)

export default LateRefunds
