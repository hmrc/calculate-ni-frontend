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
    defaultRow,
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    setErrors,
    setResults,
    results
  } = useContext(LateRefundsContext)

  const handleAddRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    invalidateResults()
    const newId = uniqid()
    setRows([...rows, {...defaultRow, id: newId}])
    setActiveRowId(newId)
  }

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault()
    invalidateResults()
    if(activeRowId) {
      setRows(rows.filter((row: LateRefundsTableRowProps) => row.id !== activeRowId))
      setErrors({})
      setActiveRowId(null)
    }
  }

  const handleClearForm = () => {
    setBankHolidaysNo('')
    setRows([defaultRow])
    setResults(null)
    setActiveRowId(null)
    setErrors({})
  }

  const invalidateResults = () => {
    results && setResults(null)
  }

  return (
    <>
      <h2 className="section-heading">Refunds</h2>
      <table className="contribution-details section-outer--top" id="results-table">
        <thead>
        <tr>
          <th scope="col">
            #<span className="govuk-visually-hidden"> Row number</span>
          </th>
          <th scope="col">From</th>
          <th scope="col">Date</th>
          <th scope="col">Refund</th>
          <th scope="col">Payable</th>
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
        <div className="container stack-right">

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
        <div className="form-group">
          <button className="govuk-button govuk-!-margin-right-1" type="submit">
            Calculate
          </button>
        </div>
      </>
      }
    </>
  )
}

export default LateRefundsTable
