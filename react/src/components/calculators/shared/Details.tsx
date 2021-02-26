import React, {useState} from 'react';

// types
import {DetailsForm} from '../../../interfaces'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

function Details (props: DetailsForm) {
  const { details, handleChange } = props
  const [showDetails, setShowDetails] = useState(false)
  return (
    <>
      <button
        id="details-control"
        type="button"
        aria-expanded={showDetails}
        aria-controls="calculation-meta"
        className={`toggle icon ${showDetails ? 'arrow-up' : 'arrow-right'}`}
        onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Close details' : 'Open details'}
        <span className="govuk-visually-hidden">about customer, date and operator for this calculation</span>
      </button>
      <div
        aria-labelledby="details-control"
        id="calculation-meta"
        className={`${showDetails ? `govuk-!-display-block` : `govuk-!-display-none`}`}
      >
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend--m">Enter the details for this calculation</legend>
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
      </div>
    </>
  )
}

export default Details;