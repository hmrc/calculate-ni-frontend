import React, {useState} from 'react';

// types
import {DetailsForm} from '../interfaces'

// components
import TextInput from './helpers/formhelpers/TextInput'

function Details (props: DetailsForm) {
  const { details, handleChange } = props
  const [showDetails, setShowDetails] = useState(false)
  return (
    <>
      <div className="clear">
        <h2 className="govuk-heading-m details-heading">Details</h2>
        <button
          type="button"
          className={`toggle icon ${showDetails ? 'arrow-up' : 'arrow-right'}`}
          onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Close details' : 'Open details'}
        </button>
      </div>
      {showDetails &&
      <fieldset className="details" role="alert">
        <legend className="float-left legend-small">Enter the details for this calculation</legend>

        <div className="container">
          <div className="container half">
            <div className="form-group item">
              <TextInput
                labelText="Customer’s full name (optional)"
                name="fullName"
                inputClassName="form-control full"
                inputValue={details.fullName}
                onChangeCallback={handleChange}
              />
            </div>
          </div>

          <div className="container half">
            <div className="form-group item">
              <TextInput
                labelText="NI number (optional)"
                name="ni"
                inputClassName="form-control full"
                inputValue={details.ni}
                onChangeCallback={handleChange}
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
                inputValue={details.reference}
                onChangeCallback={handleChange}
              />
            </div>
            <div className="form-group item">
              <TextInput
                labelText="Prepared by (optional)"
                name="preparedBy"
                inputClassName="form-control full"
                inputValue={details.preparedBy}
                onChangeCallback={handleChange}
              />
            </div>
          </div>
          <div className="container half">
            <div className="form-group item">
              <TextInput
                labelText="Date (optional)"
                name="date"
                inputClassName="form-control full"
                inputValue={details.date}
                onChangeCallback={handleChange}
              />
            </div>
          </div>

        </div>
      </fieldset>
      }
    </>
  )
}

export default Details;