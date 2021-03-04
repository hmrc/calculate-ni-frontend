import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import {hasKeys, sterlingStringValue} from "../../../services/utils";


export default function UnofficialDefermentTotals() {
  const {
    results
  } = useContext(UnofficialDefermentContext)
  return (
    <div id="results-totals" className="section--top section-outer--top section--bottom section-outer--bottom divider--bottom results print-totals-inline">
      <h2 className="section-heading">Totals</h2>

      <div className="container section--top column">
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
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">If not U/D</span>
        <div className="value inline width-8">
          {results && sterlingStringValue(results.ifNotUD.toString())}
        </div>
      </div>

    </div>
  )
}