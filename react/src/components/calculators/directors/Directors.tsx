import React, {useContext, useEffect, useState} from 'react'
import {validateDirectorsPayload} from '../../../validation/validation'
import {PeriodLabel, PeriodValue} from '../../../config'
import {ClassOneRow} from '../../../calculation'

// components
import Details from '../shared/Details'
import DirectorsForm from './DirectorsForm'
import Totals from '../shared/Totals'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import DirectorsPrintView from "./DirectorsPrintView";

// types
import {Class1DebtRow, GovDateRange} from '../../../interfaces'
import {DirectorsContext, DirectorsRow, useDirectorsForm} from "./DirectorsContext";
import {ClassOneRowInterface} from '../class1/ClassOneContext'

// services
import {hasKeys} from "../../../services/utils";

const pageTitle = 'Directors’ contributions'

const DirectorsPage = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<GovDateRange>((() => ({from: null, to: null, hasContentFrom: false, hasContentTo: false})))
  const {
    ClassOneCalculator,
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
    setResult
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
      earningsPeriod: earningsPeriod
    }

    if(validateDirectorsPayload(payload, setErrors, taxYears)) {
      const requestRows: Array<ClassOneRowInterface> = rows
        .map((row: DirectorsRow) => new (ClassOneRow as any)(
          row.id,
          PeriodValue.MONTHLY,
          row.category,
          parseFloat(row.gross),
          false
        ))

      const netNi = payload.niPaidNet || '0'
      const employeeNi = payload.niPaidEmployee || '0'

      setResult(ClassOneCalculator.calculate(
        taxYear?.from,
        requestRows,
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
                dateRange={dateRange}
                setDateRange={setDateRange}
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
