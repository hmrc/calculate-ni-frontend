import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import TextInput from "../../helpers/formhelpers/TextInput";


export default function UnofficialDefermentLimits() {
  const {
    earningsFields
  } = useContext(UnofficialDefermentContext)
    return(
      <div className="field-row">
        {Object.keys(earningsFields).filter(f => f !== 'e' && f!=='f').map(field => (
          <div className="field-col" key={`limit-field-${field}`}>
            <TextInput
              labelText={earningsFields[field].label || ''}
              name={`limit-${field}`}
              inputClassName={'form-control full'}
              inputValue={`${earningsFields[field].limit}`}
              onChangeCallback={() => {}}
            />
          </div>
        ))}
      </div>
    )
}