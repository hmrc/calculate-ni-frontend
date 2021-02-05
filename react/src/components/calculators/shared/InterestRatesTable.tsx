import React from 'react'

// types
import {Rate} from '../../../interfaces'

interface InterestRatesTableProps {
  rates: Rate[] | null
}

function LateInterestRatesTable(props: InterestRatesTableProps) {
  const { rates } = props
  return (
    <div className="full">
      <h2 className="section-heading">Interest rates</h2>
      <table className="section-outer--top">
        <thead>
        <tr>
          <th><strong>From</strong></th>
          <th><strong>Rate</strong></th>
        </tr>
        </thead>
        <tbody>
        {rates && rates.map((r: Rate, index: number) => (
          <tr key={index}>
            <td>{r.year}</td>
            <td>{r.rate}%</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}

export default LateInterestRatesTable