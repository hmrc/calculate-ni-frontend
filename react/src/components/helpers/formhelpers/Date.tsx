import React, { useState } from 'react'
import { stripSpaces } from '../../../config'

// components
import TextInput from './TextInput'

interface DateProps {
  description: string
  legend: string
  hint?: string
  day: string
  month: string
  year: string
  handleChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
}

function Date(props: DateProps) {
  return (
    <div className="govuk-form-group">
      <fieldset 
        className="govuk-fieldset"
        role="group"
        { ...( props.hint && { "aria-describedby": `${stripSpaces(props.description)}-hint` } ) }
      >
        
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          {props.legend}
        </legend>

        {props.hint &&
          <div id={`${stripSpaces(props.description)}-hint`} className="govuk-hint">
            {props.hint}
          </div>
        }

        <div className="govuk-date-input" id={props.description}>

          <div className="govuk-date-input__item">
            <div className="govuk-form-group">          
              <TextInput 
                labelText="Day"
                labelClass="govuk-label govuk-date-input__label"
                name={`${props.description}Day`}
                inputClassName="govuk-input govuk-date-input__input govuk-input--width-2"
                inputValue={props.day}
                onChangeCallback={props.handleChange}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <TextInput 
                labelText="Month"
                labelClass="govuk-label govuk-date-input__label"
                name={`${props.description}Month`}
                inputClassName="govuk-input govuk-date-input__input govuk-input--width-2"
                inputValue={props.month}
                onChangeCallback={props.handleChange}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <TextInput 
                labelText="Year"
                labelClass="govuk-label govuk-date-input__label"
                name={`${props.description}Year`}
                inputClassName="govuk-input govuk-date-input__input govuk-input--width-4"
                inputValue={props.year}
                onChangeCallback={props.handleChange}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
          </div>

        </div>

      </fieldset>
    </div>
  )
}

export default Date