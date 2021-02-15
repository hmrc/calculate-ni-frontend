import React, {useContext, useEffect, useState} from 'react'
import {validateDirectorsPayload} from '../../../validation/validation'
import {PeriodLabel} from '../../../config'
import {DirectorsRow} from '../../../calculation'

// components
import Details from '../shared/Details'
import DirectorsForm from './DirectorsForm'
import Totals from '../shared/Totals'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import DirectorsPrintView from "./DirectorsPrintView";

// types
import {GovDateRange} from '../../../interfaces'
import {DirectorsContext, DirectorsUIRow, DirectorsRowInterface, useDirectorsForm} from "./DirectorsContext";

// services
import {hasKeys} from "../../../services/utils";

const pageTitle = 'Directors’ contributions'

const DirectorsPage = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const {
    DirectorsCalculator,
    taxYears,
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
    earningsPeriod,
    setEarningsPeriod,
    result,
    setResult,
    app,
    askApp,
    dateRange,
    setDateRange
  } = useContext(DirectorsContext)

  useEffect(() => {
    invalidateResults()
  }, [dateRange])

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ [name]: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    submitForm(false)
  }

  const handleShowSummary = (event: React.FormEvent) => {
    event.preventDefault()
    submitForm(true)
  }

  const submitForm = (showSummaryIfValid: boolean) => {
    setErrors({})
    const payload = {
      rows: rows,
      niPaidEmployee: niPaidEmployee,
      niPaidNet: niPaidNet,
      dateRange: dateRange,
      earningsPeriod: earningsPeriod,
      askApp: askApp,
      app: app
    }

    if(validateDirectorsPayload(payload, setErrors, taxYears)) {
      const requestRows: Array<DirectorsRowInterface> = rows
        .map((row: DirectorsUIRow) => new (DirectorsRow as any)(
          row.id,
          row.category,
          parseFloat(row.gross)
        ))

      const netNi = payload.niPaidNet || '0'
      const employeeNi = payload.niPaidEmployee || '0'
      const appApplicable = askApp ? app === 'Yes' : undefined

      setResult(DirectorsCalculator.calculate(
        dateRange?.from,
        dateRange?.to,
        requestRows,
        appApplicable,
        netNi,
        employeeNi
      ))

      if (showSummaryIfValid) {
        setShowSummary(true)
      }
    }
  }

  const handlePeriodChange = (value: any) => {
    resetTotals()
    setEarningsPeriod(value as PeriodLabel)
  }

  const resetTotals = () => {
    setErrors({})
    setRows([defaultRow])
    setResult(null)
    setNiPaidEmployee('')
    setNiPaidNet('')
  }

  const invalidateResults = () => {
    setResult(null)
  }

  return (
    <main>
      {showSummary ?
        <DirectorsPrintView
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

          <Details
            details={details}
            handleChange={handleChange}
          />

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group table-wrapper">
              <DirectorsForm
                resetTotals={resetTotals}
                setShowSummary={setShowSummary}
                handleChange={handleChange}
                handlePeriodChange={handlePeriodChange}
                handleShowSummary={handleShowSummary}
              />
            </div>
          </form>
        </>
      }
      <Totals
        grossPayTally={showSummary}
        result={result}
        isSaveAndPrint={showSummary}
        context={DirectorsContext}
      />
      {showSummary && (
        <div className="govuk-!-padding-bottom-9">
          <button className="button" onClick={() => window.print()}>
            Save and print
          </button>
        </div>
      )}
    </main>
  )
}

const Directors = () => (
  <DirectorsContext.Provider value={useDirectorsForm()}>
    <DirectorsPage />
  </DirectorsContext.Provider>
)

export default Directors
