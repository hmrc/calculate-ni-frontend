import React, {useContext} from 'react'
import uniqid from 'uniqid'

// components
import Class1DebtTableRow from './Class1DebtTableRow'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'

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

    </div>
  )
}

export default LateInterestDebtTable