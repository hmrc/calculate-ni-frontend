import React, {useContext} from 'react'

// components
import LateInterestDebtTable from './LateInterestDebtTable'
import LateInterestRemissionPeriods from './LateInterestRemissionPeriods'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'
import {LateInterestContext} from './LateInterestContext'
import InterestRatesTable from '../shared/InterestRatesTable'

interface LateInterestFormProps {
  handleShowSummary: (event: React.FormEvent) => void
}

function LateInterestForm(props: LateInterestFormProps) {
  const { handleShowSummary } = props
  const {
    setRows,
    setErrors,
    defaultRows,
    rates
  } = useContext(LateInterestContext)

  const handleClearForm = () => {
    // clear form
    setRows(defaultRows)

    // clear results

    // reset errors
    setErrors({})
  }

  return (
    <>
      <div className="container">
        <div className="container container-block two-thirds">
          <LateInterestDebtTable printView={false} />
          <LateInterestRemissionPeriods />
        </div>
        <div className="container third">
          <InterestRatesTable rates={rates} />
        </div>
      </div>

      <div className="container container-block">
        <div className="form-group">
          <button className="govuk-button govuk-!-margin-right-1" type="submit">
            Calculate
          </button>
          <SecondaryButton
            label="Clear"
            onClick={handleClearForm}
          />
        </div>
      </div>
    </>
  )
}

export default LateInterestForm