import React, {useContext, useEffect, useState} from 'react'
import {validateClassOnePayload} from '../../../validation/validation'
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
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'

const pageTitle = 'Calculate Class 1 National Insurance (NI) contributions'

const Class1Page = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
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
          parseFloat(row.gross),
          false
        ))

      const netNi = payload.niPaidNet || '0'
      const employeeNi = payload.niPaidEmployee || '0'

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

  return (
    <div>
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

      <div className="divider--bottom">
        <Totals
          grossPayTally={showSummary}
          result={result}
          isSaveAndPrint={showSummary}
          context={ClassOneContext}
        />
      </div>

      {!showSummary && (
        <div className="container section--top section-outer--top">
          <div className="form-group half">
            <SecondaryButton
              label="Save and print"
              onClick={handleShowSummary}
            />
          </div>
        </div>
      )}

      {showSummary && (
        <div className="govuk-!-padding-bottom-9 section--top">
          <button className="button" onClick={() => window.print()}>
            Save and print
          </button>
        </div>
      )}
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
