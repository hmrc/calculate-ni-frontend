import React, { useState } from 'react'
import { stripSpaces } from '../../../config'

import '../../../styles/Radios.css'

interface RadiosProps {
  isPageHeading?: boolean
  legend: string
  description: string
  items: string[]
}



function Radios(props: RadiosProps) {
  const [checkedItem, setCheckedItem] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedItem(e.target.value)
  }

  return (
    <div className="govuk-form-group">
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          {props.isPageHeading ?
            <h1 className="govuk-fieldset__heading">
              {props.legend}
            </h1>
          :
            props.legend
          }
        </legend>
        
        <div className="govuk-radios">
          {props.items.map((item, i) => {
            const desc = stripSpaces(props.description)
            return (
              <div className="govuk-radios__item" key={`${stripSpaces(props.description)}-${i}`}>
                <input 
                  className="govuk-radios__input" 
                  id={`${desc}-${i}`} 
                  name={desc} 
                  type="radio" 
                  value={`${stripSpaces(item)}`}
                  checked={checkedItem === `${stripSpaces(item)}`}
                  onChange={handleChange}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={`${desc}-${i}`}>
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