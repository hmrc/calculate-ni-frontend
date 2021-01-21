import React from 'react'
import {taxYearString} from '../../../config'

// types
import {TaxYear} from '../../../interfaces'

interface SelectTaxYearProps {
  hiddenLabel?: boolean | null
  taxYears: TaxYear[]
  taxYear: TaxYear
  handleTaxYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

function SelectTaxYear(props: SelectTaxYearProps) {
  const {taxYears, taxYear, handleTaxYearChange, hiddenLabel} = props
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
        className="govuk-select"
      >
        {taxYears.map((y: TaxYear) => (
          <option key={y.id} value={y.id}>
            {taxYearString(y)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectTaxYear