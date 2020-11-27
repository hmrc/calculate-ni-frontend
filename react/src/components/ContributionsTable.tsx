import React from 'react'
import { fpn } from '../config';

// types
import { CT } from '../interfaces'

import numeral from 'numeral'
import 'numeral/locales/en-gb';

numeral.locale('en-gb');

function ContributionsTable(props: CT) {
  return (
    <table className="contribution-details">
      <thead>
        <tr className="clear">
          <th className="lg" colSpan={3}><span>Contribution payment details</span></th>
          {props.niData.length > 0 &&
            <th className="border" colSpan={Object.keys(props.niData[0]).length}><span>Earnings</span></th>
          }
          <th className="border" colSpan={props.niData.length > 0 ? 3 : 2}><span>Net contributions</span></th>
        </tr>
        <tr>
          <th>Period</th>
          <th>Category</th>
          <th>Gross Pay</th>
          {/* Bands */}
          {props.niData.map(row => Object.keys(row).map(k =>
            <th key={k}>{k}</th>
          ))}

          {props.niData.length > 0 &&
            <th>Total</th>
          }
          <th>EE</th>
          <th>ER</th>
        </tr>
      </thead>
      
      <tbody>
        {props.rows.map((r, i) => (
          <tr className={props.activeRowID === r.id ? "active" : ""} key={r.id} id={r.id}>
            <td>
              {props.handleSelectChange ?
                <select name="period" value={r.period} onChange={(e) => props.handleSelectChange?.(r, e)}>
                  {props.periods.map((p, i) => (
                    <option key={i} value={p}>{fpn(p)}</option>
                  ))}
                </select>
              :
              <div>{fpn(r.period)}</div>
              }
            </td>
            <td>
              {props.handleSelectChange ?
                <select name="category" value={r.category} onChange={(e) => props.handleSelectChange?.(r, e)}>
                  {props.taxYear.categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              : 
              <div>{r.category}</div>
              }
            </td>
            <td className={
              `${props.rowsErrors?.[`${r.id}`]?.['gross']?.['name'] === 'Gross' ? "error-cell" : ""}`}>
              {props.handleChange ?
                <input
                  className="gross-pay"
                  name={`${r.id}-gross`}
                  type="text"
                  id={`${r.id}-gross`}
                  value={r.gross}
                  onChange={(e) => props.handleChange?.(r, e)}
                />
              :
              <div>{r.gross}</div>
              }
            </td>
            {props.niData.map(r => Object.keys(r).map(k =>
              <td key={`${k}-val`}>{numeral(r[k][0]).format('$0,0.00')}</td>
            ))}
            {/* Total */}
            {props.niData.length > 0 && 
            <td>
              {numeral(
                Object.keys(props.niData[i]).reduce((prev, key) => {
                  return prev + props.niData[i][key][0]
                }, 0)
              ).format('$0,0.00')}
            </td>
            }
            <td>{numeral(r.ee).format('$0,0.00')}</td>
            <td>{numeral(r.er).format('$0,0.00')}</td>
          </tr>
        ))}
        {/* <td>
          <button 
            type="button"
            onClick={() => handleDelete(r)}
            className="button govuk-button govuk-button--warning">
              Delete
          </button>
        </td> */}
      </tbody>
    </table>
  )
}

export default ContributionsTable