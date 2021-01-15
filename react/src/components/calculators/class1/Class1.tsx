import React, {useContext, useState} from 'react'
import {validateClassOnePayload} from '../../../validation/validation'
import {PeriodValue} from '../../../config'

// types
import {Calculated, Calculators, Row} from '../../../interfaces'

// components
import Details from '../shared/Details'
import Class1Form from './Class1Form'
import Totals from '../shared/Totals'
import Class1Print from './Class1Print'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'

// utils
import {hasKeys, updateRowInResults} from "../../../services/utils";
import {ClassOneContext, defaultRows} from "./ClassOneContext";

const pageTitle = 'Calculate Class 1 National Insurance (NI) contributions'

function Class1() {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const {
    ClassOneCalculator,
    taxYears,
    taxYear,
    rows,
    setRows,
    errors,
    setErrors,
    rowsErrors,
    setRowsErrors,
    details,
    setDetails,
    niPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    setNiPaidNet,
    calculatedRows,
    setCalculatedRows
  } = useContext(ClassOneContext)

  const handleDetailsChange = ({
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
    setRowsErrors({})
    const payload = {
      rows: rows,
      niPaidNet: niPaidNet,
      niPaidEmployee: niPaidEmployee
    }

    if (validateClassOnePayload(payload, setRowsErrors, setErrors, taxYears)) {
      setCalculatedRows(
        calculateRows(rows as Row[], taxYear.from) as Calculated[]
      )
      if (showSummaryIfValid) {
        setShowSummary(true)
      }
    }
  }

  const resetTotals = () => {
    setErrors({})
    setRowsErrors({})
    setRows(defaultRows)
    setCalculatedRows([])
    setNiPaidEmployee('')
    setNiPaidNet('')
  }

  const calculateRows = (rows: Row[], taxYear: Date) => rows
      .map((row, i) => {
        const rowPeriod = (row.period === PeriodValue.FORTNIGHTLY ? PeriodValue.WEEKLY : row.period)
        const rowPeriodQty = (row.period === PeriodValue.FORTNIGHTLY ? 2 : 1)
        const calculatedRow = JSON.parse(
          ClassOneCalculator
            .calculate(
              taxYear,
              parseFloat(row.gross),
              row.category,
              rowPeriod,
              rowPeriodQty,
              false
            )
        )

        setRows(updateRowInResults(rows, calculatedRow, i))

        return calculatedRow
      }) as Calculated[]

  return (
    <div>
      {showSummary ?
        <Class1Print
          title={pageTitle}
          setShowSummary={setShowSummary}
          calculatedRows={calculatedRows}
        />
      :
        <>

          {(hasKeys(rowsErrors) || hasKeys(errors)) &&
            <ErrorSummary
              errors={errors}
              rowsErrors={rowsErrors}
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
      <Totals
        grossPayTally={showSummary}
        calculatedRows={calculatedRows}
        isSaveAndPrint={showSummary}
        type={Calculators.CLASS_ONE}
      />
      {showSummary && (
        <div className="govuk-!-padding-bottom-9">
          <button className="button" onClick={() => window.print()}>
            Save and print
          </button>
        </div>
      )}
    </div>
  )
}

export default Class1
