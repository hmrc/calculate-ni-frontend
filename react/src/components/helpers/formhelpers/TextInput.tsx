import React from 'react'

// components
import InlineError from '../gov-design-system/InlineError'

// types
import { TextInputProps } from '../../../interfaces'
import {buildDescribedByKeys} from '../../../services/utils'

function TextInput(props: TextInputProps) {
  const {
    hiddenLabel, 
    labelClass,
    hint,
    name,
    labelText,
    inputClassName,
    inputValue,
    onChangeCallback,
    placeholderText,
    pattern,
    inputMode,
    onBlurCallback,
    error
  } = props
  const describedby = buildDescribedByKeys(name,{
    hint,
    error
  })

  return (
    <div className={`govuk-form-group${error ? ` govuk-form-group--error`: ``}`}>
      <label 
        className={
          `form-label 
          ${hiddenLabel && 'govuk-visually-hidden'} 
          ${labelClass && labelClass}`
        }
        htmlFor={name}>
          {labelText}
      </label>
      {hint && 
        <div id={`${name}-hint`} className="govuk-hint">
          {hint}
        </div>
      }
      {error &&
      <InlineError
        id={`${name}`}
        errorMessage={error?.message}
      />
      }
      <input
        className={`${inputClassName}${error ? ` govuk-input--error`: ``}`}
        name={name}
        type="text"
        id={name}
        value={inputValue}
        onChange={onChangeCallback}
        placeholder={placeholderText}
        pattern={pattern}
        inputMode={inputMode}
        onBlur={onBlurCallback}
        aria-describedby={describedby}
      />
    </div>
  )
}

export default TextInput