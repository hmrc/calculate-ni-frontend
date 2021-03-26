import React from 'react'
import * as thStyles from '../../../services/mobileHeadingStyles'

// types
import {Rate} from '../../../interfaces'
import MqTableCell from './MqTableCell'
import {dateStringSlashSeparated, decimalToPercent} from '../../../services/utils'

interface InterestRatesTableProps {
  rates: Rate[] | null
}

function LateInterestRatesTable(props: InterestRatesTableProps) {
  const { rates } = props
  return (
    <div className="full">
      <h2 className="section-heading">Interest rates</h2>
      <table className="section-outer--top interest-rates">
        <thead>
        <tr>
          <th scope="col"><strong>From</strong></th>
          <th scope="col"><strong>Rate</strong></th>
        </tr>
        </thead>
        <tbody>
        {rates && rates.map((r: Rate, index: number) => (
          <tr key={index}>
            <MqTableCell cellStyle={thStyles.from}>{dateStringSlashSeparated(r.start)}</MqTableCell>
            <MqTableCell cellStyle={thStyles.rate}>{decimalToPercent(r.rate)}%</MqTableCell>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}

export default LateInterestRatesTable