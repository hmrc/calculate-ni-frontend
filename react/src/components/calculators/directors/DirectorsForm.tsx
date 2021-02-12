import React, {useContext} from 'react';
import {PeriodLabel} from '../../../config';
import {DirectorsContext, DirectorsUIRow} from "./DirectorsContext";
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
import uniqid from 'uniqid'
import NiPaidInputs from "../shared/NiPaidInputs";

numeral.locale('en-gb');

export default function DirectorsForm(props: DirectorsFormProps) {
  const { handleShowSummary, resetTotals, setDateRange } = props
  const {
    taxYears,
    taxYear,
    setTaxYear,
    earningsPeriod,
    errors,
    setErrors,
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    setResult,
    categories,
    askApp,
    app,
    setApp
  } = useContext(DirectorsContext)

  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault()
    resetTotals()
  }

  const handleAddRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    invalidateResults()
    setRows([...rows, {
      id: uniqid(),
      category: categories[0],
      gross: '',
      ee: 0,
      er: 0
    }])
  }

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault()
    if(activeRowId) {
      // errors are now stale
      setErrors({})
      setActiveRowId(null)

      const newRows = rows.filter((row: DirectorsUIRow) => {
        return row.id !== activeRowId
      })

      setRows(newRows)
      invalidateResults()
    }
  }

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTaxYear = taxYears.find(ty => ty.id === e.target.value)
    if (selectedTaxYear) {
      setTaxYear(selectedTaxYear)
      invalidateResults()
    }
  }

  const handleAppChange = (value: string) => {
    setApp(value)
  }

  const invalidateResults = () => {
    setResult(null)
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

      {askApp && <Radios
        legend="Is an Appropriate Pension Scheme applicable?"
        name="app"
        items={[
          {
            label: 'Yes',
            value: 'Yes',
            conditionalContent: null
          },
          {
            label: 'No',
            value: 'No',
            conditionalContent: null
          }
        ]}
        handleChange={handleAppChange}
        selected={app}
        error={errors.app}
      />}

      <NiPaidInputs context={DirectorsContext} />

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
          <div className="form-group repeat-button">
            <SecondaryButton
              label="Delete active row"
              onClick={handleDeleteRow}
              disabled={!activeRowId || rows.length === 1}
            />
          </div>
          <div className="form-group repeat-button">
            <SecondaryButton
              label="Add row"
              onClick={handleAddRow}
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
    </>
  )
}
