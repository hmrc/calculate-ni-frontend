import React, { useState } from 'react'
import { stripSpaces } from '../../../config'

import '../../../styles/Date.css'

// components
import TextInput from './TextInput'

interface DateProps {
  description: string
  legend: string
  hint?: string
}

function Date(props: DateProps) {
  const [day, setDay] = useState<string>('')
  const [month, setMonth] = useState<string>('')
  const [year, setYear] = useState<string>('')

  const handleBlur = (e: React.ChangeEventHandler<HTMLInputElement>) => {

  }

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

        <div className="govuk-date-input" id={stripSpaces(props.description)}>

          <div className="govuk-date-input__item">
            <div className="govuk-form-group">          
              <TextInput 
                labelText="Day"
                labelClass="govuk-label govuk-date-input__label"
                name={`${stripSpaces(props.description)}-day`}
                inputClassName="govuk-input govuk-date-input__input govuk-input--width-2"
                inputValue={day}
                onChangeCallback={(e) => setDay(e.target.value)}
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
                name={`${stripSpaces(props.description)}-month`}
                inputClassName="govuk-input govuk-date-input__input govuk-input--width-2"
                inputValue={month}
                onChangeCallback={(e) => setMonth(e.target.value)}
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
                name={`${stripSpaces(props.description)}-year`}
                inputClassName="govuk-input govuk-date-input__input govuk-input--width-4"
                inputValue={year}
                onChangeCallback={(e) => setYear(e.target.value)}
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