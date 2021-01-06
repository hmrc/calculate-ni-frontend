import React, {useContext} from 'react';
import {PeriodLabel, taxYearString} from '../../../config';
import { taxYearsCategories } from '../../../config'

import numeral from 'numeral'
import 'numeral/locales/en-gb';

// components
import DirectorsEarningsTable from './DirectorsContributionsTable'
import Radios from '../../helpers/formhelpers/Radios'
import {DateRange} from "./DateRange";

// types
import {DirectorsTableProps, DirectorsRow} from '../../../interfaces';
import {DirectorsContext} from "./DirectorsContext";

numeral.locale('en-gb');

function DirectorsTable(props: DirectorsTableProps) {
  const { setShowSummary, resetTotals } = props
  const {
    taxYear,
    setTaxYear,
    rows,
    setRows,
    earningsPeriod,
    errors
  } = useContext(DirectorsContext)

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

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => (
    setTaxYear(taxYearsCategories[taxYearsCategories.findIndex(ty => ty.id === e.target.value)])
  )

  return (
    <>
      <div className="container">
        <div className="form-group half">
          <label className="govuk-label" htmlFor="taxYear">
            Select a tax year
          </label>
          <select value={taxYear.id} onChange={(e) => handleTaxYearChange(e)} id="taxYear" name="taxYear" className="govuk-select">
            {taxYearsCategories.map((y, i) => (
              <option key={i} value={y.id}>{taxYearString(y)}</option>
            ))}
          </select>

        </div>

        <div className="form-group half">
          <button
            type="button"
            className="button govuk-button govuk-button--secondary nomar"
            onClick={() => setShowSummary(true)}>
            Save and print
          </button>
        </div>
      </div>

      {/* Earnings period */}
      <Radios
        legend="Earnings period"
        name="earningsPeriod"
        items={[PeriodLabel.ANNUAL, PeriodLabel.PRORATA]}
        handleChange={props.handlePeriodChange}
        selected={earningsPeriod}
        errors={errors}
      />

      {/* Directorship */}
      {earningsPeriod === PeriodLabel.PRORATA &&
        <DateRange setDateRange={props.setDateRange} errors={errors} />
      }

      <DirectorsEarningsTable
        handleChange={handleGrossChange}
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
          <div className="form-group">
            <button className="button govuk-button govuk-button--secondary nomar" onClick={(e) => {
              e.preventDefault();
              resetTotals()
            }}>
              Clear table
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DirectorsTable
