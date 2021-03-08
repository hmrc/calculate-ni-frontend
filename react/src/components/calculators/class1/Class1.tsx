import React, {useContext, useEffect, useRef, useState} from 'react'
import {stripCommas, validateClassOnePayload} from '../../../validation/validation'
import {ClassOneRow} from '../../../calculation'

// components
import Details from '../shared/Details'
import Class1Form from './Class1Form'
import Totals from '../shared/Totals'
import Class1Print from './Class1Print'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'

// utils
import {hasKeys} from "../../../services/utils";
import {ClassOneContext, useClassOneForm, ClassOneRowInterface, Row} from "./ClassOneContext";
import {useDocumentTitle} from "../../../services/useDocumentTitle";
import {SuccessNotification} from "../shared/SuccessNotification";
import {SuccessNotificationContext} from "../../../services/SuccessNotificationContext";
import PrintButtons from "../shared/PrintButtons";

const pageTitle = 'Calculate Class 1 National Insurance (NI) contributions'

const Class1Page = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const resultRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const totalsRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const {
    ClassOneCalculator,
    taxYear,
    defaultRow,
    rows,
    setRows,
    errors,
    setErrors,
    details,
    setDetails,
    niPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    setNiPaidNet,
    result,
    setResult,
    setActiveRowId
  } = useContext(ClassOneContext)
  const { successNotificationsOn } = useContext(SuccessNotificationContext)
  const titleWithPrefix = hasKeys(errors) ? 'Error: ' + pageTitle : pageTitle
  useDocumentTitle(titleWithPrefix)

  const handleDetailsChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ [name]: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setActiveRowId(null)
    submitForm(false)
  }

  const handleShowSummary = (event: React.FormEvent) => {
    event.preventDefault()
    setActiveRowId(null)
    submitForm(true)
  }

  const submitForm = (showSummaryIfValid: boolean) => {
    setErrors({})
    const payload = {
      rows: rows,
      niPaidNet: niPaidNet,
      niPaidEmployee: niPaidEmployee
    }

    if (validateClassOnePayload(payload, setErrors)) {
      const requestRows: Array<ClassOneRowInterface> = rows
        .map((row: Row) => new (ClassOneRow as any)(
          row.id,
          row.period,
          row.category,
          parseFloat(stripCommas(row.gross)),
          false
        ))

      const netNi = stripCommas(payload.niPaidNet) || '0'
      const employeeNi = stripCommas(payload.niPaidEmployee) || '0'

      taxYear && setResult(ClassOneCalculator.calculate(
        taxYear.from,
        requestRows,
        netNi,
        employeeNi
      ))
      if (showSummaryIfValid) {
        setShowSummary(true)
      }
    }
  }

  const resetTotals = () => {
    setActiveRowId(null)
    setErrors({})
    setRows([defaultRow])
    setResult(null)
    setNiPaidEmployee('')
    setNiPaidNet('')
  }

  useEffect(() => {
    if(successNotificationsOn && result) {
      resultRef.current.focus()
    } else if (result) {
      totalsRef.current.focus()
    }
  }, [result, resultRef, totalsRef, successNotificationsOn])

  return (
    <div>
      <div className="result-announcement" aria-live="polite" ref={resultRef} tabIndex={-1}>
        {successNotificationsOn && result && <SuccessNotification table={true} totals={true} />}
      </div>
      {showSummary ?
        <Class1Print
          title={pageTitle}
          setShowSummary={setShowSummary}
          result={result}
        />
      :
        <>

          {hasKeys(errors) &&
            <ErrorSummary
              errors={errors}
            />
          }

          <h1>{pageTitle}</h1>

          <form onSubmit={handleSubmit} noValidate>

            <Details
              details={details}
              handleChange={handleDetailsChange}
            />

            <Class1Form
              resetTotals={resetTotals}
              handleShowSummary={handleShowSummary}
            />

          </form>
        </>
      }

      <div className="divider--bottom no-focus-outline" ref={totalsRef} tabIndex={-1}>
        <Totals
          grossPayTally={showSummary}
          result={result}
          isSaveAndPrint={showSummary}
          context={ClassOneContext}
        />
      </div>

      <PrintButtons
        showSummary={showSummary}
        handleShowSummary={handleShowSummary}
      />

    </div>
  )
}

const Class1 = function () {
  return (
    <ClassOneContext.Provider value={useClassOneForm()}>
      <Class1Page />
    </ClassOneContext.Provider>
  )
}

export default Class1
