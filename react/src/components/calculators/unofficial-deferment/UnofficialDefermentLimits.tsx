import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";

export default function UnofficialDefermentLimits() {
  const {
    userBands
  } = useContext(UnofficialDefermentContext)

  return(
    <div className="field-row results">
      {userBands.map(band => (
        <div className="field-col" key={`limit-field-${band.label}`}>
          <span className="label block">{band.label}</span>
          <span className="value inline">{band.amount}</span>
        </div>
      ))}
    </div>
  )
}