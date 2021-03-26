import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import {hasKeys, sterlingStringValue} from "../../../services/utils";


export default function UnofficialDefermentTotals(props: {isSaveAndPrint: boolean}) {
  const { isSaveAndPrint } = props
  const {
    results
  } = useContext(UnofficialDefermentContext)
  return (
    <div id="results-totals"
         className={`${isSaveAndPrint ? `save-print-wrapper ` : ``}section--top section-outer--top section--bottom section-outer--bottom divider--bottom results print-totals-inline`}
    >
      <h2 className="section-heading">Totals</h2>

      {isSaveAndPrint && (
        <div className="container">
          <div className="container container-block two-thirds">
            <ul className="govuk-list save-print-wrapper">
              {results?.report.map((r, i) => (
                <li key={`step-${i}`}>
                  {`${r.label} = ${r.value}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="container container-block">
        <span className="label block">Annual max</span>
        <div className="value inline width-8">
          {results && sterlingStringValue(results.annualMax.toString())}
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">Liability</span>
        <div className="value inline width-8">
          {results && sterlingStringValue(results.liability.toString())}
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">Difference</span>
        <div className="value inline width-8">
          {results && sterlingStringValue(results.difference.toString())}
          {results && !results.ifNotUdIsDue ? <strong> Due</strong> : ''}
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">If not U/D</span>
        <div className="value inline width-8">
          {results && sterlingStringValue(results.ifNotUD.toString())}
          {results && results.ifNotUdIsDue ? <strong> Due</strong> : ''}
        </div>
      </div>

    </div>
  )
}