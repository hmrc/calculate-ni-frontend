import React, {Context, useContext} from "react"
import TextInput from "../../helpers/formhelpers/TextInput";
import CurrencyInput from "../../helpers/gov-design-system/CurrencyInput";

export default function NiPaidInputs(props: {context: Context<any>}) {
  const { context } = props
  const {
    errors,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee
  } = useContext(context)
  return (
    <div className="field-row">
      <div className="field-col">
        <CurrencyInput
          id="niPaidNet"
          label="NI paid net"
          value={niPaidNet}
          error={errors.niPaidNet}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNiPaidNet(e.target.value)}
          hint="How much has been paid in total"
        />
      </div>
      <div className="field-col">
        <CurrencyInput
          id="niPaidEmployee"
          label="NI paid employee"
          value={niPaidEmployee}
          error={errors.niPaidEmployee}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNiPaidEmployee(e.target.value)}
          hint="How much has been paid by the employee"
        />
      </div>
    </div>
  )
}