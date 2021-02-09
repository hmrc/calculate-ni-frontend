import React, {useContext} from 'react'

// components
import LateInterestDebtTable from './LateInterestDebtTable'
import LateInterestRemissionPeriods from './LateInterestRemissionPeriods'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'
import {LateInterestContext} from './LateInterestContext'
import uniqid from 'uniqid'
import {Class1DebtRow} from '../../../interfaces'

interface LateInterestFormProps {
  handleShowSummary: (event: React.FormEvent) => void
}

function LateInterestForm(props: LateInterestFormProps) {
  const {
    rows,
    setRows,
    taxYears,
    setErrors,
    defaultRows,
    activeRowId,
    setActiveRowId,
    setResults
  } = useContext(LateInterestContext)

  const handleClearForm = () => {
    setRows(defaultRows)
    setResults(null)
    setErrors({})
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    invalidateResults()
    setRows([...rows, {
      id: uniqid(),
      taxYears: taxYears,
      taxYear: taxYears[0],
      debt: ''
    }])
  }

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault()
    invalidateResults()
    if(activeRowId) {
      setRows(rows.filter((row: Class1DebtRow) => row.id !== activeRowId))
      // errors are now stale
      setErrors({})
      setActiveRowId(null)
    }
  }

  const invalidateResults = () => {
    setResults(null)
  }

  return (
    <>
      <LateInterestRemissionPeriods />
      <LateInterestDebtTable printView={false} />

      <div className="container">
        <div className="container">
          <div className="form-group">
            <button className="govuk-button nomar" type="submit">
              Calculate
            </button>
          </div>
        </div>

        <div className="container">
          <div className="form-group repeat-button">
            <SecondaryButton
              label="Delete active row"
              onClick={handleDeleteRow}
              disabled={!activeRowId || rows.length === 1}
            />
          </div>

          <div className="form-group repeat-button">
            <SecondaryButton
              label="Repeat row"
              onClick={handleClick}
            />
          </div>

          <div className="form-group">
            <SecondaryButton
              label="Clear table"
              onClick={handleClearForm}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default LateInterestForm