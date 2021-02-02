import React, {useContext} from 'react'

// types
import {LateInterestContext, Rate} from './LateInterestContext'

function LateInterestRatesTable() {
  const { rates } = useContext(LateInterestContext)
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