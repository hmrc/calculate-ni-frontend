import React, {useContext} from 'react';
import {PeriodLabel} from '../../../config';
import {DirectorsContext} from "./DirectorsContext";
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// components
import DirectorsEarningsTable from './DirectorsContributionsTable'
import Radios from '../../helpers/formhelpers/Radios'
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear'
import {DateRange} from "../shared/DateRange";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";

// types
import {DirectorsRow, DirectorsTableProps} from '../../../interfaces';

numeral.locale('en-gb');

function DirectorsForm(props: DirectorsTableProps) {
  const { handleShowSummary, resetTotals, setDateRange } = props
  const {
    taxYears,
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
    const selectedTaxYear = taxYears.find(ty => ty.id === e.target.value)
    if (selectedTaxYear) {
      setTaxYear(selectedTaxYear)
    }
  }

  return (
    <>
      <div className="container float--right">
        <div className="form-group half">
          <SecondaryButton
            label="Save and print"
            onClick={handleShowSummary}
          />
        </div>
      </div>

      {/* TODO:  conditionalRevealChildren must allow an array of
      ReactComponents or Nulls for instances where some radio options have no revealed content*/}
      <Radios
        legend="Earnings period"
        name="earningsPeriod"
        items={[PeriodLabel.ANNUAL, PeriodLabel.PRORATA]}
        conditionalRevealChildren={[
          <SelectTaxYear
            taxYears={taxYears}
            taxYear={taxYear}
            handleTaxYearChange={handleTaxYearChange}
          />,
          <DateRange
            id="directorship"
            setDateRange={setDateRange}
            errors={errors}
            legends={{
              from: "Directorship from",
              to: "Directorship to"
            }}
          />
        ]}
        handleChange={props.handlePeriodChange}
        selected={earningsPeriod}
        errors={errors}
      />

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
