import React from 'react'
import {fcn} from '../../../config';

// types
import {DirectorsEarningsProps} from '../../../interfaces'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

import numeral from 'numeral'
import 'numeral/locales/en-gb';

numeral.locale('en-gb');

function DirectorsEarningsTable(props: DirectorsEarningsProps) {
  return (
    <table className="contribution-details">
      <thead>
        <tr className="clear">
          <th className="lg" colSpan={2}><span>Contribution payment details</span></th>
          {props.showBands && props.rows[0].bands &&
            <th className="border" colSpan={Object.keys(props.rows[0].bands).length}><span>Earnings</span></th>
          }
          <th className="border" colSpan={props.showBands && props.rows[0].bands ? 2 : 1}><span>Net contributions</span></th>
        </tr>
        <tr>
          <th><strong>Select NI category letter</strong></th>
          <th><strong>Enter gross pay</strong></th>
          {/* Bands - by tax year, so we can just take the first band to map the rows */}
          {props.showBands && props.rows[0].bands && Object.keys(props.rows[0].bands).map(k =>
            <th key={k}>{k}</th>
          )}

          {props.showBands && props.rows[0].bands &&
            <th><strong>Total</strong></th>
          }
          <th><strong><abbr title="Employee">EE</abbr></strong></th>
          <th><strong><abbr title="Employer">ER</abbr></strong></th>
        </tr>
      </thead>
      
      <tbody>
        {props.rows.map((r, i) => (
          <tr key={r.id} id={r.id}>
            <td className="input">
              {props.handleSelectChange ?
                <>
                  <label className="govuk-visually-hidden" htmlFor={`row${i}-category`}>Category</label>
                  <select name="category" value={r.category} onChange={(e) => props.handleSelectChange?.(r, e)} className="borderless" id={`row${i}-category`}>
                    {props.taxYear.categories.map((c, i) => (
                      <option key={i} value={c}>{fcn(c)}</option>
                    ))}
                  </select>
                </>
              : 
              <div>{r.category}</div>
              }
            </td>

            {/* Gross Pay */}
            <td className={
              `input ${props.rowsErrors?.[`${r.id}`]?.['gross'] ? "error-cell" : ""}`}>
              {props.handleChange ?
                <>
                  <TextInput
                    hiddenLabel={true}
                    name={`${r.id}-gross`}
                    labelText="Gross pay"
                    inputClassName="gross-pay"
                    inputValue={r.gross}
                    placeholderText="Enter the gross pay amount"
                    onChangeCallback={(e) => props.handleChange?.(r, e)}
                  />
                </>
              :
              <div>{r.gross}</div>
              }
            </td>

            {/* Bands */}
            {props.showBands && r.bands && Object.keys(r.bands).map(k =>
              <td key={`${k}-val`}>{numeral(r.bands?.[k][0]).format('$0,0.00')}</td>
            )}

            {/* Total */}
            {props.showBands && r.bands && 
              // Total (if calculate has run)
              <td>
                {numeral(
                  (parseFloat(r.ee) + parseFloat(r.er)).toString()
                ).format('$0,0.00')}
              </td>
            }

            {/* EE */}
            <td>{numeral(r.ee).format('$0,0.00')}</td>
            {/* ER */}
            <td>{numeral(r.er).format('$0,0.00')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DirectorsEarningsTable