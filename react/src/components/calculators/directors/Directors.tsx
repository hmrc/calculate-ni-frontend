import React, {useContext, useState} from 'react'
import {validateDirectorsPayload} from '../../../validation/validation'
import {PeriodLabel} from '../../../config'

// components
import Details from '../shared/Details'
import DirectorsForm from './DirectorsForm'
import Totals from '../shared/Totals'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import DirectorsPrintView from "./DirectorsPrintView";

// types
import {GovDateRange} from '../../../interfaces'
import {ClassOneProRataRow, DirectorsContext, DirectorsRow, useDirectorsForm} from "./DirectorsContext";

// services
import {hasKeys} from "../../../services/utils";
import {ClassOneRowProRata} from "../../../calculation";

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
      const requestRows: Array<ClassOneProRataRow> = rows
        .map((row: DirectorsRow) => new (ClassOneRowProRata as any)(
          row.id,
          earningsPeriod === PeriodLabel.ANNUAL ? taxYear?.from : dateRange.from,
          earningsPeriod === PeriodLabel.ANNUAL ? taxYear?.to : dateRange.to,
          row.category,
          parseFloat(row.gross),
          false
        ))

      setResult(ClassOneCalculator.calculateProRata(
        taxYear?.from,
        requestRows,
        parseFloat(payload.niPaidNet),
        parseFloat(payload.niPaidEmployee)
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
