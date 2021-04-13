import React from 'react'
import {Class3Results} from "../../../interfaces";
import {taxYearForBreakdown} from "../../../services/utils";

interface Class3BreakdownProps {
  results: Class3Results
}

export default function Class3Breakdown(props: Class3BreakdownProps) {
  const { results } = props
  return (
    <div className="section--bottom section-outer--bottom">
      <h2 className="section-heading">Results breakdown</h2>

      <table className="shade-rows section-outer--top">
        <thead>
          <tr>
            <th scope="col"><strong>Year</strong></th>
            <th scope="col"><strong>Weeks</strong></th>
          </tr>
        </thead>
        <tbody>
          {results.years.map(r => (
            <tr>
              <td>{taxYearForBreakdown(r.startDate, r.endDate)}</td>
              <td>{r.weeks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}