import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import TextInput from "../../helpers/formhelpers/TextInput";
import {maybeFromBounds} from "../../../services/utils";

export default function UnofficialDefermentLimits() {
  const {
    userBands,
    setUserBands
  } = useContext(UnofficialDefermentContext)

  const handleLimitChange = (label: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserBands(
      userBands.map(b =>
        b.label === label ?
         {...b, amount: parseInt(e.currentTarget.value)}
        :
        b
      )
    )
  }
  return(
    <div className="field-row">
      {userBands.map(band => (
        <div className="field-col" key={`limit-field-${band.label}`}>
          <TextInput
            labelText={band.label || ''}
            name={`limit-${band.label}`}
            inputClassName={'form-control full'}
            inputValue={band.amount}
            onChangeCallback={handleLimitChange(band.label)}
          />
        </div>
      ))}
    </div>
  )
}