import React from 'react'
import {GenericErrors} from "../../../validation/validation";

interface RadiosProps {
  isPageHeading?: boolean
  legend: string
  name: string
  items: Array<string>
  handleChange: Function;
  selected: string | null;
  errors: GenericErrors
}

function Radios(props: RadiosProps) {
  const { name, legend, isPageHeading, items, selected, handleChange, errors } = props
  return (
    <div className={`govuk-form-group${errors[name] ? ` govuk-form-group--error` : ``}`}>
      <fieldset className="govuk-fieldset" id={name}>
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          {isPageHeading ?
            <h1 className="govuk-fieldset__heading">
              {legend}
            </h1>
          :
            legend
          }
        </legend>

        {errors[name] ? <span className="govuk-error-message">{errors[name]?.message}</span> : null}
        
        <div className="govuk-radios">
          {items.map((item) => {
            return (
              <div className="govuk-radios__item" key={`${name}-${item}`}>
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
            )
          })}
        </div>

      </fieldset>
    </div>
  )
}

export default Radios