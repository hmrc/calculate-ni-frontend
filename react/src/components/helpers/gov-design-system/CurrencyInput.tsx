import React from "react"

export default function CurrencyInput(props: any) {
  const { label, id, error, value, onChange, hint } = props
  return (
    <div className={`govuk-form-group${error ? ` govuk-form-group--error`: ``}`}>
      <label className="govuk-label govuk-label--l" htmlFor={id}>
        {label}
      </label>
      {hint && <span className="govuk-hint">{hint}</span>}
      {error && <span className='govuk-error-message' id={`${id}-error`}>{error?.message}</span>}
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
          aria-describedby={error ? `${id}-error` : ``}
        />
      </div>
    </div>
  )
}