import React from "react"
import InlineError from "./InlineError";
import {buildDescribedByKeys} from "../../../services/utils";

export default function CurrencyInput(props: any) {
  const { label, id, error, value, onChange, hint } = props
  const describedby = buildDescribedByKeys(id,{
    hint,
    error
  })
  return (
    <div className={`govuk-form-group${error ? ` govuk-form-group--error`: ``}`}>
      <label className="govuk-label govuk-label--l" htmlFor={id}>
        {label}
      </label>
      {hint && <span id={`${id}-hint`} className="govuk-hint">{hint}</span>}
      {error &&
        <InlineError
          id={id}
          errorMessage={error?.message}
        />
      }
      <div className="govuk-input__wrapper">
        <div className="govuk-input__prefix" aria-hidden="true">£</div>
        <input
          className={`govuk-input govuk-input--width-10${error ? ` govuk-input--error`: ``}`}
          id={id}
          name={id}
          type="text"
          spellCheck="false"
          value={value}
          onChange={onChange}
          aria-describedby={describedby}
        />
      </div>
    </div>
  )
}
