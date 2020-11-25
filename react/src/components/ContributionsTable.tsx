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
          {/* <th className="border" colSpan={3}><span>Earnings</span></th> */}
          <th className="border" colSpan={2}><span>Net contributions</span></th>
        </tr>
        <tr>
          <th>Period</th>
          <th>Category</th>
          <th>Gross Pay</th>
          {/* 
            INJECT DYNAMIC COLUMNS
            Conditionally show based on a bool passed to the component on whether dynamic columns should be shown
            Map over the bands, convert the name to the correct band name uppercased
          */}
          
          {/* {props.niData.map(r => Object.keys(r).map(k => 
            <th key={r[k]}></th>
          ))} */}
            {/* return (
              <th>props.niData[k]</th>
            )
          })} */}

          
          {/* <th>LEL</th>
          <th>ET</th>
          <th>UEL</th>
          <th>Total</th> */}
          <th>EE</th>
          <th>ER</th>
          {/* <th>Rebate</th> */}
        </tr>
      </thead>
      
      <tbody>
        {props.rows.map(r => (
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

            {/* 
            INJECT DYNAMIC COLUMNS

            Map over the bands, output the formatted value
            */}
            {/* {props.niData.map((k, i) => {
              return (
                <td>props.niData[k][0]</td>
              )
            })} */}

            <td>{numeral(r.ee).format('$0,0.00')}</td>
            <td>{numeral(r.er).format('$0,0.00')}</td>
            {/* <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td> */}
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