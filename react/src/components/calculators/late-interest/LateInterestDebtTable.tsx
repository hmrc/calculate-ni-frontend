import React, {useContext} from 'react'
import uniqid from 'uniqid'

// components
import Class1DebtTableRow from './Class1DebtTableRow'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'

// types
import {LateInterestContext} from './LateInterestContext'
import {Class1DebtRow} from '../../../interfaces'

interface LateInterestDebtProps {
  printView: boolean
}

function LateInterestDebtTable(props: LateInterestDebtProps) {
  const {printView} = props
  const {
    rows,
    setRows,
    taxYears,
    activeRowId,
    setActiveRowId,
    setErrors
  } = useContext(LateInterestContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setRows([...rows, {
      id: uniqid(),
      taxYears: taxYears,
      taxYear: taxYears[0],
      debt: ''
    }])
  }

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault()
    if(activeRowId) {
      setRows(rows.filter((row: Class1DebtRow) => row.id !== activeRowId))
      // errors are now stale
      setErrors({})
      setActiveRowId(null)
    }
  }

  return (
    <div className="full">
      <h2 className="section-heading">Debt</h2>
      <table className="contribution-details section-outer--top">
        <thead>
          <tr>
            <th>
              #<span className="govuk-visually-hidden"> Row number</span>
            </th>
            <th><strong>Tax Year</strong></th>
            <th><strong>Class 1 Debt</strong></th>
            <th><strong>Interest Due</strong></th>
          </tr>
        </thead>
        <tbody>
        {rows.map((r: Class1DebtRow, index: number) => (
          <Class1DebtTableRow
            taxYears={taxYears}
            row={r}
            key={r.id}
            index={index}
            printView={printView}
          />
        ))}
        </tbody>
      </table>

      {!printView &&
        <div className="container stack-left">
          <div className="form-group repeat-button">
            <SecondaryButton
              label="Repeat row"
              onClick={handleClick}
            />
          </div>
          <div className="form-group repeat-button">
            <SecondaryButton
              label="Delete active row"
              onClick={handleDeleteRow}
              disabled={!activeRowId || rows.length === 1}
            />
          </div>
        </div>
      }

    </div>
  )
}

export default LateInterestDebtTable