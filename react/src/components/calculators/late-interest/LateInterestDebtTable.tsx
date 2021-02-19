import React, {useContext} from 'react'

// components
import Class1DebtTableRow from './Class1DebtTableRow'

// types
import {LateInterestContext} from './LateInterestContext'
import {Class1DebtRow} from '../../../interfaces'

interface LateInterestDebtTable {
  printView: boolean
}

function LateInterestDebtTable(props: LateInterestDebtTable) {
  const { printView } = props
  const {
    rows,
    taxYears
  } = useContext(LateInterestContext)

  return (
    <div className="full">
      <table className="contribution-details section-outer--top" id="results-table">
        <caption>Debt</caption>
        <thead>
          <tr>
            <th scope="col">
              #<span className="govuk-visually-hidden"> Row number</span>
            </th>
            <th scope="col"><strong>Tax Year</strong></th>
            <th scope="col"><strong>Class 1 Debt</strong></th>
            <th scope="col"><strong>Interest Due</strong></th>
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
    </div>
  )
}

export default LateInterestDebtTable