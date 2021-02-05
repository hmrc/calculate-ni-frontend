import React, {Context, useContext} from "react"
import TextInput from "../../helpers/formhelpers/TextInput";

export default function NiPaidInputs(props: {context: Context<any>}) {
  const { context } = props
  const {
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee
  } = useContext(context)
  return (
    <div className="field-row">
      <div className="field-col">
        <TextInput
          labelText="NI paid net"
          name="niPaidNet"
          inputClassName="form-control full"
          inputValue={niPaidNet}
          onChangeCallback={(e: React.ChangeEvent<HTMLInputElement>) => setNiPaidNet(e.target.value)}
        />
      </div>
      <div className="field-col">
        <TextInput
          labelText="NI paid employee"
          name="niPaidEmployee"
          inputClassName="form-control full"
          inputValue={niPaidEmployee}
          onChangeCallback={(e: React.ChangeEvent<HTMLInputElement>) => setNiPaidEmployee(e.target.value)}
        />
      </div>
    </div>
  )
}