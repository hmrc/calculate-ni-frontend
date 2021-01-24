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
import {DirectorsFormProps} from '../../../interfaces';

numeral.locale('en-gb');

export default function DirectorsForm(props: DirectorsFormProps) {
  const { handleShowSummary, resetTotals, setDateRange } = props
  const {
    taxYears,
    taxYear,
    setTaxYear,
    earningsPeriod,
    errors
  } = useContext(DirectorsContext)

  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault()
    resetTotals()
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

      <Radios
        legend="Earnings period"
        name="earningsPeriod"
        items={[
          {
            label: PeriodLabel.ANNUAL,
            value: PeriodLabel.ANNUAL,
            conditionalContent: <SelectTaxYear
              taxYears={taxYears}
              taxYear={taxYear}
              handleTaxYearChange={handleTaxYearChange}
            />
          },
          {
            label: PeriodLabel.PRORATA,
            value: PeriodLabel.PRORATA,
            conditionalContent: <DateRange
              id="directorship"
              setDateRange={setDateRange}
              errors={errors}
              legends={{
                from: "Directorship from",
                to: "Directorship to"
              }}
            />
          }
        ]}
        handleChange={props.handlePeriodChange}
        selected={earningsPeriod}
        error={errors.earningsPeriod}
      />

      <DirectorsEarningsTable
        showBands={false}
        printView={false}
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
