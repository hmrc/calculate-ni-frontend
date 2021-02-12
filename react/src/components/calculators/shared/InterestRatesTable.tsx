/** @jsx jsx */
import React from 'react'
import { css, jsx } from '@emotion/react'

// types
import {Rate} from '../../../interfaces'

const mq = [`@media (max-width: ${760}px)`]

const interestFromCellStyle = css({[mq[0]]: {':before': { content: `"From"` }}})
const interestRateCellStyle = css({[mq[0]]: {':before': { content: `"Rate"` }}})

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
          <th><strong>From</strong></th>
          <th><strong>Rate</strong></th>
        </tr>
        </thead>
        <tbody>
        {rates && rates.map((r: Rate, index: number) => (
          <tr key={index}>
            <td css={interestFromCellStyle}>{r.year}</td>
            <td css={interestRateCellStyle}>{r.rate}%</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}

export default LateInterestRatesTable