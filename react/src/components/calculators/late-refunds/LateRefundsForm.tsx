import React, {useContext} from 'react'

// components
import TextInput from '../../helpers/formhelpers/TextInput'
import LateRefundsTable from './LateRefundsTable'

// types
import {LateRefundsContext} from './LateRefundsContext'
import InterestRatesTable from '../shared/InterestRatesTable'

function LateRefundsForm() {
  const {
    rates
  } = useContext(LateRefundsContext)

  return (
    <>
      <div className="container">
        <div className="container container-block eight-tenths">
          <LateRefundsTable printView={false} />
        </div>
        <div className="container two-tenths">
          {rates &&
            <InterestRatesTable rates={rates} />
          }
        </div>
      </div>
    </>
  )
}

export default LateRefundsForm
