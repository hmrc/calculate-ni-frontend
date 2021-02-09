import React, {useContext} from 'react'

// components
import {DateRange} from '../shared/DateRange'
import {LateInterestContext} from './LateInterestContext'
import Radios from '../../helpers/formhelpers/Radios'

function LateInterestRemissionPeridos() {
  const {
    setDateRange,
    errors,
    hasRemissionPeriod,
    setHasRemissionPeriod,
    setResults
  } = useContext(LateInterestContext)

  const handleChange = (value: string) => {
    invalidateResults()
    setHasRemissionPeriod(value === 'Yes')
  }

  const invalidateResults = () => {
    setResults(null)
  }

  return (
    <Radios
      legend="Is there a remission period?"
      name="hasRemissionperiod"
      items={[
        {
          label: 'Yes',
          value: 'Yes',
          conditionalContent: <DateRange
            id="remissionPeriod"
            legends={{
              from: "Start",
              to: "End"
            }}
            setDateRange={setDateRange}
            errors={errors}
          />
        }, {
          label: 'No',
          value: 'No',
          conditionalContent: null
        }
      ]}
      handleChange={handleChange}
      selected={hasRemissionPeriod === true ? 'Yes' : (hasRemissionPeriod === false ? 'No' : null)}
      error={errors.hasRemissionPeriod}
    />
  )
}

export default LateInterestRemissionPeridos