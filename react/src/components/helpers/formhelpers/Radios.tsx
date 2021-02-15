import React from 'react'
import {ErrorMessage} from "../../../validation/validation";
import {buildDescribedByKeys} from "../../../services/utils";
import InlineError from "../gov-design-system/InlineError";

interface RadioItem {
  label: string
  value: string
  conditionalContent: React.ReactElement | null
}

interface RadiosProps {
  hint?: string
  isPageHeading?: boolean
  legend: string
  name: string
  items: Array<RadioItem>
  handleChange: Function
  selected: string | null
  error: ErrorMessage
}

function Radios(props: RadiosProps) {
  const { hint, name, legend, isPageHeading, items, selected, handleChange, error } = props
  const describedBy = buildDescribedByKeys(name, {
    hint,
    error
  })
  return (
    <div className={`govuk-form-group${error ? ` govuk-form-group--error` : ``}`}>
      <fieldset
        className="govuk-fieldset" id={name}
        aria-describedby={describedBy}
      >

        {isPageHeading ?
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
            <h1 className="govuk-fieldset__heading">
              {legend}
            </h1>
          </legend>
        :
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
            {legend}
          </legend>
        }

        {hint && <span id={`${name}-hint`} className="govuk-hint">{hint}</span>}
        {error && <InlineError id={name} errorMessage={error.message} />}
        
        <div className="govuk-radios">
          {items.map((item: RadioItem) => (
            <React.Fragment key={`${name}-${item.value}`}>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id={`${name}-${item.value}`}
                  name={name}
                  type="radio"
                  value={item.value}
                  checked={selected === item.value}
                  onChange={e => {
                    handleChange(e.target.value)
                  }}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={`${name}-${item.value}`}>
                  {item.label}
                </label>
              </div>

              {item.conditionalContent && selected === item.value && (
                <div className="govuk-radios__conditional" id={`conditional-${name}-${item.value}`}>
                  {item.conditionalContent}
                </div>
              )}

            </React.Fragment>
          )
          )}
        </div>

      </fieldset>
    </div>
  )
}

export default Radios