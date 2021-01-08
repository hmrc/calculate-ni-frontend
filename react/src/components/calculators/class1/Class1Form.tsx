import React, {useContext, useState} from 'react';
import uniqid from 'uniqid';
import { appConfig, taxYearString } from '../../../config'

import numeral from 'numeral'
import 'numeral/locales/en-gb';

import ClassOneEarningsTable from './Class1ContributionsTable'

// types
import { Row, Class1TableProps, TaxYear } from '../../../interfaces';
import {ClassOneContext} from "./ClassOneContext";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";

numeral.locale('en-gb');

function Class1Form(props: Class1TableProps) {
  const { setShowSummary, resetTotals } = props
  const [taxYears] = useState<TaxYear[]>(appConfig.taxYears)
  const [activeRowID, setActiveRowID] = useState<string | null>(null)
  const {
    taxYear,
    setTaxYear,
    rows,
    setRows,
  } = useContext(ClassOneContext)

  const handleSetActiveRow = (r: Row) => {
    if (activeRowID !== r.id) setActiveRowID(r.id)
  }

  const handleChange = (r: Row, e: React.ChangeEvent<HTMLInputElement>) => {
    handleSetActiveRow(r)
    setRows(rows.map((cur: Row) =>
      cur.id === r.id ?
        {...cur, [`${e.currentTarget.name.split('-')[1]}`]: e.currentTarget.value}
        :
        cur
    ))
  }
  
  const handleSelectChange = (r: Row, e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSetActiveRow(r)
    setRows(rows.map((cur: Row) =>
      cur.id === r.id ? {...cur, [e.currentTarget.name]: e.currentTarget.value} : cur
    ))
  }

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxYear(taxYears.find(ty => ty.id === e.target.value) || taxYears[0])
  }

  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault()
    resetTotals()
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const lastRow = rows[rows.length -1]
    setRows([...rows, {
      id: uniqid(),
      category: lastRow.category,
      period: lastRow.period,
      gross: lastRow.gross,
      number: '',
      ee: '0',
      er: '0'
    }])
  }

  return (
    <div className="form-group table-wrapper">
      <div className="container">
        <div className="form-group half">
          <label className="govuk-label" htmlFor="taxYear">
            Select a tax year
          </label>
          <select
            value={taxYear.id}
            onChange={handleTaxYearChange}
            id="taxYear"
            name="taxYear"
            className="govuk-select"
          >
            {taxYears.map((y, i) => (
              <option key={i} value={y.id}>{taxYearString(y)}</option>
            ))}
          </select>

        </div>

        <div className="form-group half">
          <SecondaryButton
            label="Save and print"
            onClick={() => setShowSummary(true)}
          />
        </div>
      </div>

      <ClassOneEarningsTable
        activeRowID={activeRowID}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        showBands={false}
      />
      
      <div className="container">
        <div className="container">
          <div className="form-group">
            <button className="govuk-button nomar" type="submit">
              Calculate
            </button>
          </div>
        </div>

        <div className="container">

          <div className="form-group repeat-button">
            <SecondaryButton
              label="Repeat row"
              onClick={handleClick}
            />
          </div>

          <div className="form-group">
            <SecondaryButton
              label="Clear table"
              onClick={handleClear}
            />
          </div>
        </div>
      </div>

    </div>
  )
}

export default Class1Form;
