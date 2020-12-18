import React from 'react';

// types
import { DetailsProps } from '../interfaces'

// components
import TextInput from './helpers/formhelpers/TextInput'

function Details (props: DetailsProps) {
  return (
    <fieldset className="details" role="alert">
      <legend className="float-left legend-small">Enter the details for this calculation</legend>
      
      <div className="container">
        <div className="container half">
          <div className="form-group item">
            <TextInput
              labelText="Customer’s full name (optional)"
              name="fullName"
              inputClassName="form-control full"
              inputValue={props.fullName}
              onChangeCallback={props.handleChange}
            />
          </div>
        </div>
        
        <div className="container half">
          <div className="form-group item">
            <TextInput
              labelText="NI number (optional)"
              name="ni"
              inputClassName="form-control full"
              inputValue={props.ni}
              onChangeCallback={props.handleChange}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="container half">
          <div className="form-group item">
            <TextInput
              labelText="Reference (optional)"
              name="reference"
              inputClassName="form-control full"
              inputValue={props.reference}
              onChangeCallback={props.handleChange}
            />
          </div>
          <div className="form-group item">
            <TextInput
              labelText="Prepared by (optional)"
              name="preparedBy"
              inputClassName="form-control full"
              inputValue={props.preparedBy}
              onChangeCallback={props.handleChange}
            />
          </div>
        </div>
        <div className="container half">
          <div className="form-group item">
            <TextInput
              labelText="Date (optional)"
              name="date"
              inputClassName="form-control full"
              inputValue={props.date}
              onChangeCallback={props.handleChange}
            />
          </div>
        </div>

      </div>
    </fieldset>
  )
}

export default Details;