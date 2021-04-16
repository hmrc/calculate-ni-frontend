import React from 'react'
import {Class3Results} from "../../../interfaces";
import {taxYearForBreakdown} from "../../../services/utils";

interface Class3BreakdownProps {
  results: Class3Results | null
  isSaveAndPrint: boolean
}

export default function Class3Breakdown(props: Class3BreakdownProps) {
  const { results, isSaveAndPrint } = props
  if (!results) {
    console.log('no results to render')
    return <div />
  }
  return (
  <div className={`${isSaveAndPrint ? `save-print-wrapper ` : ``}section--bottom section-outer--bottom`}>
    <div className={`${isSaveAndPrint ? `contributions-details` : `table-wrapper`}`}>
      <table className="shade-rows section-outer--top">
        <caption className="section--bottom">Results breakdown</caption>
        <thead>
          <tr>
            <th scope="col"><strong>Year</strong></th>
            <th scope="col"><strong>Weeks</strong></th>
          </tr>
        </thead>
        <tbody>
          {results && results.years.map((r, i) => (
            <tr key={i}>
              <td>{taxYearForBreakdown(r.startDate, r.endDate)}</td>
              <td>{r.weeks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )
}