import React, {useContext} from 'react'
import {DirectorsContext} from "./DirectorsContext";

// types
import {DirectorsRow, TableProps} from '../../../interfaces'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {NiFrontendContext} from "../../../services/NiFrontendContext";

numeral.locale('en-gb');

function DirectorsEarningsTable(props: TableProps) {
  const { showBands, printView } = props
  const {
    rows,
    setRows,
    categories,
    errors,
    activeRowId,
    setActiveRowId
  } = useContext(DirectorsContext)

  const { config } = useContext(NiFrontendContext)

  const handleGrossChange = (r: DirectorsRow, e: React.ChangeEvent<HTMLInputElement>) => {
    setRows(rows.map((cur: DirectorsRow) =>
      cur.id === r.id ? {...cur, gross: e.currentTarget.value} : cur
    ))
  }

  const handleSelectChange = (r: DirectorsRow, e: React.ChangeEvent<HTMLSelectElement>) => {
    setRows(rows.map((cur: DirectorsRow) =>
      cur.id === r.id ? {...cur, [e.currentTarget.name]: e.currentTarget.value} : cur
    ))
  }

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
        {rows.map((r: DirectorsRow, i: number) => (
          <tr
            key={r.id}
            id={r.id}
            className={activeRowId === r.id ? "active" : ""}
            onClick={() => setActiveRowId(r.id)}
          >
            <td className="input">
              {printView ?
                <div>{r.category}</div>
                :
                <>
                  <label className="govuk-visually-hidden" htmlFor={`row${i}-category`}>Category</label>
                  <select name="category" value={r.category} onChange={(e) => handleSelectChange?.(r, e)} className="borderless" id={`row${i}-category`}>
                    {categories.map((c: string, i: number) => (
                      <option key={i} value={c}>
                        {`${c}${config.categoryNames[c] ? ` - ${config.categoryNames[c]}` : ``}`}
                      </option>
                    ))}
                  </select>
                </>
              }
            </td>

            {/* Gross Pay */}
            <td className={
              `input ${errors?.[`${r.id}-gross`] ? "error-cell" : ""}`}>
              {printView ?
                <div>{r.gross}</div>
                :
                <TextInput
                  hiddenLabel={true}
                  name={`${r.id}-gross`}
                  labelText="Gross pay"
                  inputClassName="gross-pay"
                  inputValue={r.gross}
                  placeholderText="Enter the gross pay amount"
                  onChangeCallback={(e) => handleGrossChange?.(r, e)}
                />
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
