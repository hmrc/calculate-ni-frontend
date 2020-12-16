import React from 'react'
import { TextInputProps } from '../../../interfaces'

function TextInput(props: TextInputProps) {
  return (
    <>
      <label 
        className={
          `form-label 
          ${props.hiddenLabel && 'govuk-visually-hidden'} 
          ${props.labelClass && props.labelClass}`
        }
        htmlFor={props.name}>
          {props.labelText}
      </label>
      <input
        className={props.inputClassName}
        name={props.name}
        type="text"
        id={props.name}
        value={props.inputValue}
        onChange={(e) => props.onChangeCallback(e)}
        placeholder={props.placeholderText}
        pattern={props.pattern}
        inputMode={props.inputMode}
        onBlur={props.onBlurCallback}
      />
    </>
  )
}

export default TextInput