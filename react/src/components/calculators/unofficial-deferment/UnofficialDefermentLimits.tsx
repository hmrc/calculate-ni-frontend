import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import TextInput from "../../helpers/formhelpers/TextInput";

export default function UnofficialDefermentLimits() {
  const {
    userBands,
    setUserBands,
    errors
  } = useContext(UnofficialDefermentContext)

  const handleLimitChange = (label: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserBands(
      userBands.map(b =>
        b.label === label ?
         {...b, amount: e.currentTarget.value}
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
            error={errors[`limit-${band.label}`]}
          />
        </div>
      ))}
    </div>
  )
}