import React, {Dispatch, SetStateAction} from 'react'
import {taxYearString} from '../../../config'

// types
import {GovDateRange, TaxYear} from '../../../interfaces'
import {DateRange} from "../../calculators/shared/DateRange";
import {GenericErrors} from "../../../validation/validation";

interface FullOrPartialTaxYearProps {
  id: string
  hiddenLabel?: boolean | null
  taxYears: TaxYear[]
  taxYear: TaxYear
  handleTaxYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  dateRange: GovDateRange
  setDateRange: Dispatch<SetStateAction<GovDateRange>>
  errors: GenericErrors
  showDates: boolean
}

function FullOrPartialTaxYear(props: FullOrPartialTaxYearProps) {
  const {
    id,
    taxYears,
    taxYear,
    handleTaxYearChange,
    hiddenLabel,
    dateRange,
    setDateRange,
    errors,
    showDates
  } = props

  const taxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleTaxYearChange(e)
  }
  return (
    <>
      {!showDates ?
        <>
          <label
            className={`govuk-label${hiddenLabel ? ` govuk-visually-hidden`: ``}`}
            htmlFor="taxYear"
          >
            Select a tax year
          </label>
          <select
            value={taxYear.id}
            onChange={taxYearChange}
            id="taxYear"
            name="taxYear"
            className="borderless"
          >
            {taxYears.map((y: TaxYear) => (
              <option key={y.id} value={y.id}>
                {taxYearString(y)}
              </option>
            ))}
          </select>
        </>
        :
        <div className="govuk-form-group">
          <DateRange
            setDateRange={setDateRange}
            errors={errors}
            legends={{from: 'From', to: 'To'}}
            id={id}
            dateRange={dateRange}
          />
        </div>
      }
    </>
  )
}

export default FullOrPartialTaxYear
