import React, {useContext} from 'react'

// components
import BackLink from '../../helpers/gov-design-system/BackLink'
import DetailsPrint from '../shared/DetailsPrint'

// types
import {LateInterestPrintProps} from '../../../interfaces'
import {LateInterestContext} from './LateInterestContext'
import LateInterestDebtTable from './LateInterestDebtTable'
import {taxYearString} from '../../../config'

function LateInterestPrint(props: LateInterestPrintProps) {
  const { title, setShowSummary } = props
  const {
    details,
    dateRange
  } = useContext(LateInterestContext)
  return (
    <>
      <div className="save-print-wrapper">
        <div className="print-content">
          <BackLink callBack={() => setShowSummary(false)} />

          <h1 className="govuk-heading-l">{title}</h1>

          <DetailsPrint details={details} />

          <div className="divider--bottom">
            <div className="section--top">
              <LateInterestDebtTable printView={true} />
            </div>

            {dateRange.from && dateRange.to &&
              <div className="section--bottom">
                <h2 className="section-heading divider--top section--top">Remission period</h2>
                <div>
                  {taxYearString({
                    from: dateRange?.from,
                    to: dateRange?.to,
                    id: '' // unused within util fn
                  })}
                </div>
              </div>
            }
          </div>

        </div>
      </div>
    </>
  )
}

export default LateInterestPrint