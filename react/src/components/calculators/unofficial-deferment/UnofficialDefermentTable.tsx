import React, {useContext} from 'react'
import * as thStyles from '../../../services/mobileHeadingStyles'

// components

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {UnofficialDefermentContext, UnofficialDefermentInputRow} from "./UnofficialDefermentContext";
import UnofficialDefermentTableRow from "./UnofficialDefermentTableRow";

numeral.locale('en-gb');

export default function UnofficialDefermentTable(props: {printView: boolean}) {
  const { printView } = props
  const {
    rows,
    bands
  } = useContext(UnofficialDefermentContext)

  return (
    <table className="contribution-details" id="results-table">
      <thead>
        <tr>
          <th scope="col"><strong>Name of employer</strong></th>
          <th scope="col"><strong>Gross pay</strong></th>
          <th scope="col"><strong>NI category</strong></th>
          {bands && bands.map(band => (
            <th scope="col" key={`band-header-${band.label}`}><strong>{band.label}</strong></th>
          ))}
          <th scope="col"><strong>Employee NICs</strong></th>
          <th scope="col"><strong>Over UEL</strong></th>
          <th scope="col"><strong>NICS non-CO</strong></th>
          <th scope="col"><strong>If not U/D</strong></th>
        </tr>
      </thead>

      <tbody>
      {rows.map((r: UnofficialDefermentInputRow, i: number) => (
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
