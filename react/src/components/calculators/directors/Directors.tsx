import React, {useContext, useEffect, useState} from 'react'
import {validateDirectorsPayload} from '../../../validation/validation'
import {PeriodLabel} from '../../../config'

// components
import Details from '../shared/Details'
import DirectorsForm from './DirectorsForm'
import Totals from '../shared/Totals'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import DirectorsPrintView from "./DirectorsPrintView";

// types
import {Calculators, GovDateRange, TaxYear} from '../../../interfaces'
import {DirectorsContext, useDirectorsForm} from "./DirectorsContext";

// services
import {extractTaxYearFromDate, hasKeys} from "../../../services/utils";

const pageTitle = 'Directors’ contributions'

const DirectorsPage = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<GovDateRange>((() => ({from: null, to: null, hasContentFrom: false, hasContentTo: false})))
  const {
    ClassOneCalculator,
    taxYears,
    taxYear,
    setTaxYear,
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
    if(dateRange && dateRange.from) {
      const matchingTaxYear: TaxYear | null = extractTaxYearFromDate(dateRange.from, taxYears)
      if(matchingTaxYear) {
        setTaxYear(matchingTaxYear)
      }
    }
  }, [dateRange, setTaxYear, taxYears])

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
      if (earningsPeriod === PeriodLabel.ANNUAL) {
        setResult(ClassOneCalculator.calculate(
          taxYear.from,
          rows.map(row => ({
            category: row.category,
            grossPay: row.gross,
            contractedOutStandardRate: false
          })),
          parseFloat(payload.niPaidNet),
          parseFloat(payload.niPaidEmployee)
        ))
      } else {
        // TODO: awaiting a proRata method from interface
        setResult(null)
      }
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
        type={Calculators.DIRECTORS}
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
