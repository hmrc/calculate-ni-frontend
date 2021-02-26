import React, {useContext} from 'react'
import * as thStyles from '../../../services/mobileHeadingStyles'

// components

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {UnofficialDefermentContext, UnofficialDefermentRow} from "./UnofficialDefermentContext";
import UnofficialDefermentTableRow from "./UnofficialDefermentTableRow";

numeral.locale('en-gb');

export default function UnofficialDefermentTable(props: {printView: boolean}) {
  const { printView } = props
  const {
    rows,
    earningsFields
  } = useContext(UnofficialDefermentContext)

  return (
    <table className="contribution-details" id="results-table">
      <thead>
        <tr>
          <th scope="col"><strong>Name of employer</strong></th>
          <th scope="col"><strong>Gross pay</strong></th>
          <th scope="col"><strong>NI category</strong></th>
          <th scope="col"><strong>{earningsFields['a'].field}</strong></th>
          <th scope="col"><strong>{earningsFields['b'].field}</strong></th>
          <th scope="col"><strong>{earningsFields['c'].field}</strong></th>
          {earningsFields['d'] &&
            <th scope="col"><strong>{earningsFields['d'].field}</strong></th>
          }
          {earningsFields['e'] &&
          <th scope="col"><strong>{earningsFields['e'].field}</strong></th>
          }
          {earningsFields['f'] &&
          <th scope="col"><strong>{earningsFields['f'].field}</strong></th>
          }
          <th scope="col"><strong>Over UEL</strong></th>
          <th scope="col"><strong>NICS non-CO</strong></th>
          <th scope="col"><strong>If not U/D</strong></th>
        </tr>
      </thead>

      <tbody>
      {rows.map((r: UnofficialDefermentRow, i: number) => (
        <UnofficialDefermentTableRow
          key={r.id}
          row={r}
          i={i}
          printView={printView}
         />
      ))}
      </tbody>
    </table>
  )
}
