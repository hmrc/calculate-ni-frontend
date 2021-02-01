import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";


export default function UnofficialDefermentTotals() {
  const {
    results
  } = useContext(UnofficialDefermentContext)
  return (
    <div className="section--top section-outer--top section--bottom section-outer--bottom divider--bottom results print-totals-inline">
      <h2 className="section-heading">Totals</h2>

      <div className="container section--top column">
        <span className="label block">Annual max</span>
        <div className="value inline width-8">
          {results?.annualMax}
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">Liability</span>
        <div className="value inline width-8">
          {results?.liability}
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">Difference</span>
        <div className="value inline width-8">
          {results?.difference}
        </div>
      </div>

      <div className="container section--top column">
        <span className="label block">If not U/D</span>
        <div className="value inline width-8">
          {results?.ifNotUD}
        </div>
      </div>

    </div>
  )
}