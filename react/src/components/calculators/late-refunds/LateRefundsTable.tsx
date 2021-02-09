import React, {useContext} from 'react'
import uniqid from 'uniqid'

// types
import {LateRefundsContext} from './LateRefundsContext'
import {LateRefundsTableRowProps} from '../../../interfaces'

// components
import LateRefundsTableRow from './LateRefundsTableRow'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'

interface LateRefundsTable {
  printView: boolean
}

function LateRefundsTable(props: LateRefundsTable) {
  const {printView} = props
  const {
    setBankHolidaysNo,
    defaultRows,
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    setErrors,
    taxYears,
    setResults
  } = useContext(LateRefundsContext)

  const handleAddRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    invalidateResults()
    setRows([...rows, {
      id: uniqid(),
      taxYear: taxYears[0],
      debt: ''
    }])
  }

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault()
    invalidateResults()
    if(activeRowId) {
      setRows(rows.filter((row: LateRefundsTableRowProps) => row.id !== activeRowId))
      // errors are now stale
      setErrors({})
      setActiveRowId(null)
    }
  }

  const handleClearForm = () => {
    setBankHolidaysNo('')
    setRows(defaultRows)
    setResults(null)
    setErrors({})
  }

  const invalidateResults = () => {
    setResults(null)
  }

  return (
    <>
      <h2 className="section-heading">Refunds</h2>
      <table className="contribution-details section-outer--top">
        <thead>
        <tr>
          <th>
            #<span className="govuk-visually-hidden"> Row number</span>
          </th>
          <th>From</th>
          <th>Date</th>
          <th>Refund</th>
          <th>Payable</th>
        </tr>
        </thead>
        <tbody>
        {rows.map((row: LateRefundsTableRowProps, index: number) => (
          <LateRefundsTableRow
            row={row}
            index={index}
            printView={printView}
            key={row.id}
          />
        ))}
        </tbody>
      </table>

      {!printView &&
      <>
        <div className="container">
          <div className="container container-block">
            <div className="form-group">
              <button className="govuk-button govuk-!-margin-right-1" type="submit">
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
                  label="Add row"
                  onClick={handleAddRow}
              />
            </div>
            <div className="form-group">
              <SecondaryButton
                  label="Clear"
                  onClick={handleClearForm}
              />
            </div>
          </div>
        </div>
      </>
      }
    </>
  )
}

export default LateRefundsTable