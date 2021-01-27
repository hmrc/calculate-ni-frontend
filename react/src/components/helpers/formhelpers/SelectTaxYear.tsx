import React from 'react'
import {taxYearString} from '../../../config'

// types
import {TaxYear} from '../../../interfaces'

interface SelectTaxYearProps {
  taxYears: TaxYear[]
  taxYear: TaxYear
  handleTaxYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onlyStartYear?: boolean
  hiddenLabel?: boolean
  borderless?: boolean
}

function SelectTaxYear(props: SelectTaxYearProps) {
  const {taxYears, taxYear, handleTaxYearChange, onlyStartYear, hiddenLabel, borderless} = props
  return (
    <div className="govuk-form-group">
      <label
        className={`govuk-label${hiddenLabel ? ` govuk-visually-hidden`: ``}`}
        htmlFor="taxYear"
      >
        Select a tax year
      </label>
      <select
        value={taxYear.id}
        onChange={handleTaxYearChange}
        id="taxYear"
        name="taxYear"
        className={
          `govuk-select
          ${borderless && 'borderless'}`
        }
      >
        {taxYears.map((y: TaxYear) => (
          <option key={y.id} value={y.id}>
            {taxYearString(y, onlyStartYear)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectTaxYear