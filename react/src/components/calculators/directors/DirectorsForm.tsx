import React, {useContext} from 'react';
import {PeriodLabel, taxYearString} from '../../../config';
import { taxYearsCategories } from '../../../config'
import {DirectorsContext} from "./DirectorsContext";
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// components
import DirectorsEarningsTable from './DirectorsContributionsTable'
import Radios from '../../helpers/formhelpers/Radios'
import {DateRange} from "./DateRange";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";

// types
import {DirectorsTableProps, DirectorsRow, TaxYear} from '../../../interfaces';

numeral.locale('en-gb');

function DirectorsForm(props: DirectorsTableProps) {
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

  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault()
    resetTotals()
  }

  const handleSelectChange = (r: DirectorsRow, e: React.ChangeEvent<HTMLSelectElement>) => {
    setRows(rows.map((cur: DirectorsRow) =>
      cur.id === r.id ? {...cur, [e.currentTarget.name]: e.currentTarget.value} : cur
    ))
  }

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxYear(taxYearsCategories[taxYearsCategories.findIndex(ty => ty.id === e.target.value)])
  }

  return (
    <>
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
            {taxYearsCategories.map((y: TaxYear) => (
              <option key={y.id} value={y.id}>
                {taxYearString(y)}
              </option>
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

      <Radios
        legend="Earnings period"
        name="earningsPeriod"
        items={[PeriodLabel.ANNUAL, PeriodLabel.PRORATA]}
        handleChange={props.handlePeriodChange}
        selected={earningsPeriod}
        errors={errors}
      />

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
            <SecondaryButton
              label="Clear table"
              onClick={handleClear}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default DirectorsForm