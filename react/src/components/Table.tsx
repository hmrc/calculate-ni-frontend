import React, { useState } from 'react';
import { fpn, taxYearString } from '../config';
import uniqid from 'uniqid';
import moment from 'moment';
import { taxYearsCategories } from '../config'
import isEmpty from 'lodash/isEmpty'

import numeral from 'numeral'
import 'numeral/locales/en-gb';


import ErrorSummary from './helpers/ErrorSummary'
import { momentDateFormat } from '../config'

// types
import { Row, TableProps, TaxYear } from '../interfaces';

numeral.locale('en-gb');

function Table(props: TableProps) {

  // const [taxYear, setTaxYear] = useState<TaxYear>(taxYearsCategories[0])
  const [taxYears, setTaxYears] = useState<TaxYear[]>(taxYearsCategories)
  const [grossTotal, setGrossTotal] = useState<Number>(0)
  const [activeRowID, setActiveRowID] = useState<string | null>(null)

  const handleSetActiveRow = (r: Row) => {
    if (activeRowID !== r.id) setActiveRowID(r.id)
  }

  const handleChange = (r: Row, e: React.ChangeEvent<HTMLInputElement>) => {
    handleSetActiveRow(r)
    props.setRows(props.rows.map(
      cur => cur.id === r.id ? {...cur, [`${e.currentTarget.name.split('-')[1]}`]: e.currentTarget.value} : cur
    ))
  }
  
  const handleSelectChange = (r: Row, e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSetActiveRow(r)
    props.setRows(props.rows.map(cur =>
      cur.id === r.id ? {...cur, [e.currentTarget.name]: e.currentTarget.value} : cur
    ))
  }

  const handleBlur = () => {
    setGrossTotal(props.rows.reduce((c, acc) => {
      return c += parseInt(acc.gross)
    }, 0))
  }

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => (
    props.setTaxYear(taxYears[taxYears.findIndex(ty => ty.id === e.target.value)])
  )

  const handleClick = () => {
    const lastRow = props.rows[props.rows.length -1]
    props.setRows([...props.rows, {
      id: uniqid(),
      category: lastRow.category,
      period: lastRow.period,
      gross: lastRow.gross,
      ee: '0',
      er: '0'
    }])
  }

  // const handleDelete = (r: Row) => {
  //   setRows(
  //     rows.filter(cur =>
  //       cur.id !== r.id
  //     )
  //   )
  // }

  return (
    <div>
      <div className="container">
        <div className="form-group half">
          <label className="form-label">Tax year:</label>
          <div className="select tax-year">
            <select value={props.taxYear.id} onChange={(e) => handleTaxYearChange(e)}>
                {taxYears.map((y, i) => (
                  <option key={i} value={y.id}>{taxYearString(y)}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-group half">
          <button type="button" className="button govuk-button govuk-button--secondary nomar">
            Save and print
          </button>
        </div>
      </div>

      {!isEmpty(props.errors) &&
        <ErrorSummary
          errors={props.errors}
          rowsErrors={props.rowsErrors}
        />
      }

      <table className="contribution-details">
        <thead>
          <tr className="clear">
            <th className="lg" colSpan={4}><span>Contribution payment details</span></th>
            {/* <th className="border" colSpan={3}><span>Earnings</span></th> */}
            <th className="border" colSpan={2}><span>Net contributions</span></th>
          </tr>
          <tr>
            <th>Period</th>
            <th>Category</th>
            <th>Gross Pay</th>
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
            <tr className={activeRowID === r.id ? "active" : ""} key={r.id} id={r.id}>
              <td>
                <select name="period" value={r.period} onChange={(e) => handleSelectChange(r, e)}>
                  {props.periods.map((p, i) => (
                    <option key={i} value={p}>{fpn(p)}</option>
                  ))}
                </select>
              </td>
              <td>
                <select name="category" value={r.category} onChange={(e) => handleSelectChange(r, e)}>
                  {props.taxYear.categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </td>
              <td className={`${props.rowsErrors[`${r.id}`] && props.rowsErrors[`${r.id}`]['gross'] && props.rowsErrors[`${r.id}`]['gross']['name'] && props.rowsErrors[`${r.id}`]['gross']['name'] == 'Gross' ? "error-cell" : ""}`}>
                <input
                  className="gross-pay"
                  name={`${r.id}-gross`}
                  type="text"
                  id={`${r.id}-gross`}
                  value={r.gross}
                  onChange={(e) => handleChange(r, e)}
                  onBlur={handleBlur}
                />
              </td>
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
      
      <div className="container">
        <div className="container">
          <div className="form-group subsection">        
            <button 
              className="button govuk-button govuk-button--secondary" 
              onClick={() => handleClick()}>
              Repeat row
            </button>
          </div>

          <div className="form-group subsection">
            <button className="button govuk-button govuk-button--secondary" onClick={() => {
              props.setRows([{
                id: uniqid(),
                category: props.taxYear.categories[0],
                period: props.periods[0],
                gross: '0',
                ee: '0',
                er: '0'
              }])
              props.resetTotals()
            }}>
              Clear table
            </button>
          </div>
        </div>

        <div className="container">
          <div className="form-group subsection">
            <button className="button" onClick={() => props.runCalcs(props.rows, grossTotal, props.taxYear.from)}>
              Calculate
            </button>
          </div>
        </div>
      </div>

      </div>
  )
}

export default Table;