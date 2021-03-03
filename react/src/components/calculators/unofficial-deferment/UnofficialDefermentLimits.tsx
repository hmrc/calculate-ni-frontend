import React, {useContext} from "react"
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import TextInput from "../../helpers/formhelpers/TextInput";
import {fromBounds} from "../../../services/utils";

export default function UnofficialDefermentLimits() {
  const {
    bands
  } = useContext(UnofficialDefermentContext)
    return(
      <div className="field-row">
        {bands.map(band => (
          <div className="field-col" key={`limit-field-${band.label}`}>
            <TextInput
              labelText={band.name || ''}
              name={`limit-${band.label}`}
              inputClassName={'form-control full'}
              inputValue={`${fromBounds(band.limit)}`}
              onChangeCallback={() => {}}
            />
          </div>
        ))}
      </div>
    )
}