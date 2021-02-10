import React, {useContext} from 'react'

// components
import TextInput from '../../helpers/formhelpers/TextInput'
import LateRefundsTable from './LateRefundsTable'

// types
import {LateRefundsContext} from './LateRefundsContext'
import InterestRatesTable from '../shared/InterestRatesTable'

function LateRefundsForm() {
  const {
    bankHolidaysNo,
    setBankHolidaysNo,
    errors,
    rates,
    setResults
  } = useContext(LateRefundsContext)

  const handleChange = (e:  React.ChangeEvent<HTMLInputElement>) => {
    invalidateResults()
    setBankHolidaysNo(e.currentTarget.value)
  }

  const invalidateResults = () => {
    setResults(null)
  }

  return (
    <>
      <div className="govuk-form-group">
        <TextInput
          labelText="Number of bank holidays (optional)"
          name="bankHolidays"
          inputClassName="govuk-input govuk-input--width-3"
          inputValue={bankHolidaysNo}
          error={errors.bankHolidays}
          onChangeCallback={handleChange}
        />
      </div>

      <div className="container">
        <div className="container container-block two-thirds">
          <LateRefundsTable printView={false} />
        </div>
        <div className="container third">
          {rates &&
            <InterestRatesTable rates={rates} />
          }
        </div>
      </div>


    </>
  )
}

export default LateRefundsForm