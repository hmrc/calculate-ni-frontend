import React, {Context, useContext, useEffect, useState} from "react"
import CurrencyInput from "../../helpers/gov-design-system/CurrencyInput";

export default function NiPaidInputs(props: {context: Context<any>}) {
  const { context } = props
    const [person, setPerson] = useState<String>("Ben")
  const {
    errors,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee
  } = useContext(context)

  const handleChangeNet = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNiPaidNet(e.target.value)
    setPerson(person + (person.length - 2).toString())
  }

  useEffect(() => {
    console.log(person)
  }, [person])

  return (
    <div className="field-row">
      <div className="field-col">
        <CurrencyInput
          id="niPaidNet"
          label="NI paid net (optional)"
          value={niPaidNet}
          error={errors.niPaidNet}
          onChange={handleChangeNet}
          hint="How much you chucked in"
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