import React from 'react'
import { stripSpaces } from '../../../config'

// components
import TextInput from './TextInput'
import {ErrorMessage} from "../../../validation/validation";
import InlineError from "../gov-design-system/InlineError";
import {buildDescribedByKeys} from "../../../services/utils";

interface DateProps {
  description: string
  legend: string
  hint?: string
  day: string
  month: string
  year: string
  setDay: Function
  setMonth: Function
  setYear: Function
  error: ErrorMessage
}

export default function DateInputs(props: DateProps) {
  const { error, hint, description } = props
  const describedby = buildDescribedByKeys(description,{
      hint,
      error
    }
  )

  return (
    <div className={`govuk-form-group${error ? ` govuk-form-group--error`: ``}`}>
      <fieldset 
        className="govuk-fieldset"
        role="group"
        aria-describedby={describedby}
      >
        
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
          {props.legend}
        </legend>

        {props.hint &&
          <div id={`${stripSpaces(description)}-hint`} className="govuk-hint">
            {props.hint}
          </div>
        }

        {error &&
          <InlineError
            id={description}
            errorMessage={error?.message}
          />
        }

        <div className="govuk-date-input" id={description}>

          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <TextInput
                labelText="Day"
                labelClass="govuk-label govuk-date-input__label"
                name={`${description}Day`}
                inputClassName={`govuk-input govuk-date-input__input govuk-input--width-2${error ? ` govuk-input--error`: ``}`}
                inputValue={props.day}
                onChangeCallback={(e) => props.setDay(e.target.value)}
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
                name={`${description}Month`}
                inputClassName={`govuk-input govuk-date-input__input govuk-input--width-2${error ? ` govuk-input--error`: ``}`}
                inputValue={props.month}
                onChangeCallback={(e) => props.setMonth(e.target.value)}
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
                name={`${description}Year`}
                inputClassName={`govuk-input govuk-date-input__input govuk-input--width-4${error ? ` govuk-input--error`: ``}`}
                inputValue={props.year}
                onChangeCallback={(e) => props.setYear(e.target.value)}
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
