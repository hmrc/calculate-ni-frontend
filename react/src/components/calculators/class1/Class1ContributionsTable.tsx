import React, {useContext} from 'react'
import {periodValueToLabel, appConfig, PeriodValue, periods} from '../../../config';
import {ClassOneContext} from "./ClassOneContext";

// types
import {ClassOneEarningsProps, Row} from '../../../interfaces'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

import numeral from 'numeral'
import 'numeral/locales/en-gb';

numeral.locale('en-gb');

function ClassOneEarningsTable(props: ClassOneEarningsProps) {
  const { showBands, activeRowID, handleSelectChange, handleChange } = props
  const {
    rows,
    rowsErrors,
    categories
  } = useContext(ClassOneContext)
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
          <th><strong>Select period</strong></th>
          <th><strong>Row number</strong></th>
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
        {rows.map((r: Row, i: number) => (
          <tr className={activeRowID === r.id ? "active" : ""} key={r.id} id={r.id}>
            {/* Period */}
            <td className="input">
              {props.handleSelectChange ?
                <>
                  <label className="govuk-visually-hidden" htmlFor={`row${i}-period`}>Period</label>
                  <select name="period" value={r.period} onChange={(e) => handleSelectChange?.(r, e)} className="borderless" id={`row${i}-period`}>
                    {periods.map((p: PeriodValue, i) => (
                      <option key={i} value={p}>{periodValueToLabel(p)}</option>
                    ))}
                  </select>
                </>
              :
              <div>{periodValueToLabel(r.period)}</div>
              }
            </td>

            {/* Row number */}
            <td className="input">
              <TextInput
                hiddenLabel={true}
                name={`${r.id}-number`}
                labelText="Row number (optional)"
                inputClassName="number"
                inputValue={r.number}
                placeholderText="Enter the row number (optional)"
                onChangeCallback={(e) => handleChange?.(r, e)}
              />
            </td>

            {/* Category */}
            <td className="input">
              {handleSelectChange ?
                <>
                  <label className="govuk-visually-hidden" htmlFor={`row${i}-category`}>Category</label>
                  <select name="category" value={r.category} onChange={(e) => handleSelectChange?.(r, e)} className="borderless" id={`row${i}-category`}>
                    {categories.map((c: string, i: number) => (
                      <option key={i} value={c}>{`${c}${appConfig.categoryNames[c] ? ` - ${appConfig.categoryNames[c]}` : ``}`}</option>
                    ))}
                  </select>
                </>
              : 
              <div>{r.category}</div>
              }
            </td>

            {/* Gross Pay */}
            <td className={
              `input ${rowsErrors?.[`${r.id}`]?.['gross'] ? "error-cell" : ""}`}>
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

            <td>{numeral(r.ee).format('$0,0.00')}</td>
            <td>{numeral(r.er).format('$0,0.00')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ClassOneEarningsTable;
