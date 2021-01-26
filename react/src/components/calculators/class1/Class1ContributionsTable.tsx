import React, {useContext} from 'react'
import {ClassOneContext} from "./ClassOneContext";

// types
import {TableProps, Row} from '../../../interfaces'

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import Class1TableRow from "./Class1TableRow";

import SortToggle from "../../../assets/select-dropdown-arrows.svg"

numeral.locale('en-gb');

function ClassOneEarningsTable(props: TableProps) {
  const { showBands, printView } = props
  const {
    rows,
    setRows,
    setErrors
  } = useContext(ClassOneContext)

  const handleSortPeriod = (e: React.MouseEvent) => {
    e.preventDefault()
    setErrors({})
    setRows(rows
      .slice()
      .sort((a: Row, b: Row) =>
        (a.period < b.period ? 1 : (a.period > b.period) ? -1 : 0)))
  }

  return (
    <table className="contribution-details">
      <thead>
        <tr className="clear">
          <th className="lg" colSpan={3}><span>Contribution payment details</span></th>
          {showBands && rows[0].bands &&
            <th className="border" colSpan={Object.keys(rows[0].bands).length}><span>Earnings</span></th>
          }
          <th className="border" colSpan={showBands && rows[0].bands ? 3 : 2}><span>Net contributions</span></th>
        </tr>
        <tr>
          <th>
            #<span className="govuk-visually-hidden"> Row number</span>
          </th>
          <th className="column-toggle" onClick={handleSortPeriod}>
            <strong>
              {printView ? 'Period': 'Select period'}
              <img src={SortToggle} alt="Sort by period" />
            </strong>
          </th>
          <th className="notes"><strong>Period No.</strong></th>
          <th><strong>{printView ? '' : 'Select '}NI category letter</strong></th>
          <th><strong>{printView ? 'Gross pay' : 'Enter gross pay'}</strong></th>
          {/* Bands - by tax year, so we can just take the first band to map the rows */}
          {showBands && rows[0].bands && Object.keys(rows[0].bands).map(k =>
            <th key={k}>{k}</th>
          )}

          {showBands && rows[0].bands &&
            <th><strong>Total</strong></th>
          }
          <th><strong><abbr title="Employee">EE</abbr></strong></th>
          <th><strong><abbr title="Employer">ER</abbr></strong></th>
        </tr>
      </thead>
      
      <tbody>
        {rows.map((r: Row, i: number) => (
          <Class1TableRow
            key={`row-${i}`}
            row={r}
            index={i}
            showBands={showBands}
            printView={printView}
          />
        ))}
      </tbody>
    </table>
  )
}

export default ClassOneEarningsTable
