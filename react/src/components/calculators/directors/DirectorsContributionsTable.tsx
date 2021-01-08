import React, {useContext} from 'react'
import {appConfig} from '../../../config';
import {DirectorsContext} from "./DirectorsContext";

// types
import {DirectorsEarningsProps, DirectorsRow} from '../../../interfaces'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

import numeral from 'numeral'
import 'numeral/locales/en-gb';

numeral.locale('en-gb');

function DirectorsEarningsTable(props: DirectorsEarningsProps) {
  const { showBands, handleSelectChange, handleChange } = props
  const {
    rows,
    rowsErrors,
    taxYear
  } = useContext(DirectorsContext)

  return (
    <table className="contribution-details">
      <thead>
        <tr className="clear">
          <th className="lg" colSpan={2}><span>Contribution payment details</span></th>
          {showBands && rows[0].bands &&
            <th className="border" colSpan={Object.keys(rows[0].bands).length}><span>Earnings</span></th>
          }
          <th className="border" colSpan={showBands && rows[0].bands ? 2 : 1}><span>Net contributions</span></th>
        </tr>
        <tr>
          <th><strong>Select NI category letter</strong></th>
          <th><strong>Enter gross pay</strong></th>
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
        {rows.map((r: DirectorsRow, i: number) => (
          <tr key={r.id} id={r.id}>
            <td className="input">
              {handleSelectChange ?
                <>
                  <label className="govuk-visually-hidden" htmlFor={`row${i}-category`}>Category</label>
                  <select name="category" value={r.category} onChange={(e) => handleSelectChange?.(r, e)} className="borderless" id={`row${i}-category`}>
                    {taxYear.categories.map((c: string, i: number) => (
                      <option key={i} value={c}>{`${c} - ${appConfig.categoryNames[c]}`}</option>
                    ))}
                  </select>
                </>
              : 
              <div>{r.category}</div>
              }
            </td>

            {/* Gross Pay */}
            <td className={
              `input ${rowsErrors?.[`${r.id}`]?.gross ? "error-cell" : ""}`}>
              {handleChange ?
                <>
                  <TextInput
                    hiddenLabel={true}
                    name={`${r.id}-gross`}
                    labelText="Gross pay"
                    inputClassName="gross-pay"
                    inputValue={r.gross}
                    placeholderText="Enter the gross pay amount"
                    onChangeCallback={(e) => handleChange?.(r, e)}
                  />
                </>
              :
              <div>{r.gross}</div>
              }
            </td>

            {/* Bands */}
            {showBands && r.bands && Object.keys(r.bands).map(k =>
              <td key={`${k}-val`}>{numeral(r.bands?.[k][0]).format('$0,0.00')}</td>
            )}

            {/* Total */}
            {showBands && r.bands &&
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
