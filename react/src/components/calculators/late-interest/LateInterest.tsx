import React, {useState, useContext} from 'react'

// components
import Details from "../shared/Details"
import LateInterestForm from "../late-interest/LateInterestForm"
import LateInterestResults from "../late-interest/LateInterestResults"

// types
import {LateInterestContext, Rate, useLateInterestForm} from './LateInterestContext'
import {validateLateInterestPayload} from '../../../validation/validation'
import {hasKeys} from '../../../services/utils'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import LateInterestPrint from './LateInterestPrint'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'
import {Class1DebtRow} from '../../../interfaces'

const pageTitle = 'Interest on late or unpaid Class 1 NI contributions'

function LateInterestPage() {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const {
    ClassOneCalculator,
    details,
    rows,
    setRows,
    dateRange,
    setDetails,
    errors,
    setErrors,
    setActiveRowId,
    setResults
  } = useContext(LateInterestContext)

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
      dateRange
    }

    if(validateLateInterestPayload(payload, setErrors)) {
      const transformedRows = rows.map((row: Class1DebtRow) => {
        return {
          periodStart: row.taxYear.from,
          debt: row.debt
        }
      })
      const remission = dateRange.from ? dateRange.from : null

      const resultFromCalculator = ClassOneCalculator.interestOnLateClassOne.calculate(transformedRows, remission)

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

  return (
    <main>
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group table-wrapper nomar">
              <LateInterestForm
                handleShowSummary={handleShowSummary}
              />
            </div>
          </form>

          <LateInterestResults />

          <div className="container section--top section-outer--top">
            <SecondaryButton
              label="Save and print"
              onClick={handleShowSummary}
            />
          </div>

        </>
      }
    </main>
  )
}

const LateInterest = () => (
  <LateInterestContext.Provider value={useLateInterestForm()}>
    <LateInterestPage />
  </LateInterestContext.Provider>
)

export default LateInterest