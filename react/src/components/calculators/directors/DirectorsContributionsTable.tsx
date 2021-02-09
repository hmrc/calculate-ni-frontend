import React, {useContext} from 'react'
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {DirectorsContext, DirectorsRow} from "./DirectorsContext";
import {TableProps} from '../../../interfaces'

// components
import DirectorsTableRow from './DirectorsTableRow'

numeral.locale('en-gb');

function DirectorsEarningsTable(props: TableProps) {
  const { showBands, printView } = props
  const {
    rows
  } = useContext(DirectorsContext)

  return (
    <table className="contribution-details">
      <thead>
        <tr className="clear">
          <th className="lg" colSpan={2}><span>Contribution payment details</span></th>
          {showBands && rows[0].bands &&
            <th className="border" colSpan={rows[0].bands.length}><span>Earnings</span></th>
          }
          <th className="border" colSpan={showBands && rows[0].bands ? 2 : 1}><span>Net contributions</span></th>
        </tr>
        <tr>
          <th><strong>{printView ? '' : 'Select '}NI category letter</strong></th>
          <th><strong>{printView ? 'Gross pay' : 'Enter gross pay'}</strong></th>
          {/* Bands - by tax year, so we can just take the first band to map the rows */}
          {showBands && rows[0].bands && rows[0].bands.map(k =>
            <th key={k.name}>{k.name}</th>
          )}

          {showBands && rows[0].bands &&
            <th><strong>Total</strong></th>
          }
          <th><strong><abbr title="Employee">EE</abbr></strong></th>
          <th><strong><abbr title="Employer">ER</abbr></strong></th>
        </tr>
      </thead>
      
      <tbody>
        {rows.map((r: DirectorsRow, i: number) => (
          <DirectorsTableRow
            key={r.id}
            row={r}
            index={i}
            printView={printView}
            showBands={showBands}
          />
        ))}
      </tbody>
    </table>
  )
}

export default DirectorsEarningsTable
