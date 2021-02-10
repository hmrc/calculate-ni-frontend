import React, {useContext, useState} from 'react'
import {hasKeys} from '../../../services/utils'
import {validateLateRefundsPayload} from '../../../validation/validation'

// components
import Details from '../shared/Details'
import LateRefundsForm from './LateRefundsForm'
import LateRefundsResults from './LateRefundsResults'
import LateRefundsPrint from './LateRefundsPrint'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'

// types
import {LateRefundsContext, useLateRefundsForm} from './LateRefundsContext'
import {LateRefundsTableRowProps} from '../../../interfaces'

const pageTitle = 'Interest on late-paid refunds from 1993 to 1994'

function LateRefundsPage() {
  const [showSummary, setShowSummary] = useState<boolean>(false)
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
    setActiveRowId
  } = useContext(LateRefundsContext)

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
          refund: row.refund
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

  return (
    <main>
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

          <LateRefundsResults />

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

const LateRefunds = () => (
  <LateRefundsContext.Provider value={useLateRefundsForm()}>
    <LateRefundsPage />
  </LateRefundsContext.Provider>
)

export default LateRefunds