import React, { useState } from 'react';
import { taxYearString } from '../../../config';
import uniqid from 'uniqid';
import { taxYearsCategories } from '../../../config'

import numeral from 'numeral'
import 'numeral/locales/en-gb';

import ContributionsTable from './Class1ContributionsTable'

// types
import { Row, Class1TableProps, TaxYear } from '../../../interfaces';

numeral.locale('en-gb');

function Class1Table(props: Class1TableProps) {

  const [taxYears] = useState<TaxYear[]>(taxYearsCategories)
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
      number: '',
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
          <label className="govuk-label" htmlFor="taxYear">
            Select a tax year
          </label>
          <select value={props.taxYear.id} onChange={(e) => handleTaxYearChange(e)} id="taxYear" name="taxYear" className="govuk-select">
            {taxYears.map((y, i) => (
              <option key={i} value={y.id}>{taxYearString(y)}</option>
            ))}
          </select>

        </div>

        <div className="form-group half">
          <button 
            type="button" 
            className="button govuk-button govuk-button--secondary nomar"
            onClick={() => props.setShowSummary(true)}>
            Save and print
          </button>
        </div>
      </div>

      <ContributionsTable 
        rows={props.rows} 
        rowsErrors={props.rowsErrors}
        activeRowID={activeRowID}
        periods={props.periods}
        taxYear={props.taxYear}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        showBands={false}
      />
      
      <div className="container">
        <div className="container">
          <div className="form-group">
            <button className="govuk-button nomar" onClick={() => props.runCalcs(props.rows, props.taxYear.from)}>
              Calculate
            </button>
          </div>
        </div>

        <div className="container">
          <div className="form-group repeat-button">        
            <button 
              className="button govuk-button govuk-button--secondary nomar" 
              onClick={() => handleClick()}>
              Repeat row
            </button>
          </div>

          <div className="form-group">
            <button className="button govuk-button govuk-button--secondary nomar" onClick={() => {
              props.setRows([{
                id: uniqid(),
                category: props.taxYear.categories[0],
                period: props.periods[0],
                gross: '',
                number: '',
                ee: '0',
                er: '0'
              }])
              props.resetTotals()
            }}>
              Clear table
            </button>
          </div>
        </div>
      </div>

      </div>
  )
}

export default Class1Table;