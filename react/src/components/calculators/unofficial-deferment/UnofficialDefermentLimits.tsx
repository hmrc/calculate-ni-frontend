import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import TextInput from "../../helpers/formhelpers/TextInput";
import {maybeFromBounds} from "../../../services/utils";

export default function UnofficialDefermentLimits() {
  const {
    userBands,
    setUserBands
  } = useContext(UnofficialDefermentContext)

  const handleLimitChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserBands(
      userBands.map(b =>
        b.name === name ?
         {...b, limit: e.currentTarget.value}
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
            labelText={band.name || ''}
            name={`limit-${band.label}`}
            inputClassName={'form-control full'}
            inputValue={`${maybeFromBounds(band.limit)}`}
            onChangeCallback={handleLimitChange(band.name)}
          />
        </div>
      ))}
    </div>
  )
}