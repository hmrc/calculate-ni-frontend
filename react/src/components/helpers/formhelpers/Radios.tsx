import React from 'react'
import {ErrorMessage} from "../../../validation/validation";
import {buildDescribedByKeys} from "../../../services/utils";
import InlineError from "../gov-design-system/InlineError";

interface RadiosProps {
  hint?: string
  isPageHeading?: boolean
  legend: string
  name: string
  items: Array<string>
  conditionalRevealChildren?: (React.ReactElement | null)[]
  handleChange: Function;
  selected: string | null;
  error: ErrorMessage
}

function Radios(props: RadiosProps) {
  const { hint, name, legend, isPageHeading, items, selected, handleChange, error, conditionalRevealChildren } = props
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
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          {isPageHeading ?
            <h1 className="govuk-fieldset__heading">
              {legend}
            </h1>
          :
            legend
          }
        </legend>
        {hint && <span id={`${name}-hint`} className="govuk-hint">{hint}</span>}
        {error && <InlineError id={name} errorMessage={error.message} />}
        
        <div className="govuk-radios">
          {items.map((item, index) => {
            return (
              <React.Fragment key={`${name}-${item}`}>
                <div className="govuk-radios__item">
                  <input 
                    className="govuk-radios__input" 
                    id={`${name}-${item}`}
                    name={name}
                    type="radio" 
                    value={item}
                    checked={selected === item}
                    onChange={e => {
                      handleChange(e.target.value)
                    }}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor={`${name}-${item}`}>
                    {item}
                  </label>
                </div>

                {/* Conditionally Revealing Content */}
                {conditionalRevealChildren && conditionalRevealChildren.length > 0 && selected === item &&
                  <div className="govuk-radios__conditional" id="conditional-contact">
                    {conditionalRevealChildren[index]}
                  </div>
                }

              </React.Fragment>
            )
          })}
        </div>

      </fieldset>
    </div>
  )
}

export default Radios