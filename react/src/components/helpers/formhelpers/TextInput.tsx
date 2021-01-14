import React from 'react'
import { TextInputProps } from '../../../interfaces'

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
    onBlurCallback
  } = props
  return (
    <>
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
      <input
        className={inputClassName}
        name={name}
        type="text"
        id={name}
        value={inputValue}
        onChange={onChangeCallback}
        placeholder={placeholderText}
        pattern={pattern}
        inputMode={inputMode}
        onBlur={onBlurCallback}
      />
    </>
  )
}

export default TextInput