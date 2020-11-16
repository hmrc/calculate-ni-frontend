import React from 'react';

interface DetailsProps {
  fullName: string
  ni: string
  reference: string
  preparedBy: string
  date: string
  handleChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
}

function Details (props: DetailsProps) {
  return (
    <React.Fragment>

      <div className="container">
        <div className="form-group item">
          <label htmlFor="fullName" className="form-label">Full name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="form-control full"
            value={props.fullName}
            onChange={props.handleChange}
            />
        </div>
        
        <div className="form-group item">
          <label htmlFor="ni" className="form-label">NI Number</label>
          <input
            type="text"
            id="ni"
            name="ni"
            className="form-control half"
            value={props.ni}
            onChange={props.handleChange}
            />
        </div>
      </div>

      <div className="container">
        <div className="container half">
          <div className="form-group item">
            <label htmlFor="ref" className="form-label">Ref</label>
            <input
              type="text"
              id="reference"
              name="reference"
              className="form-control full"
              value={props.reference}
              onChange={props.handleChange}
              />
          </div>
          <div className="form-group item">
            <label htmlFor="preparedBy" className="form-label">Prepared by</label>
            <input
              type="text"
              id="preparedBy"
              name="preparedBy"
              className="form-control full"
              value={props.preparedBy}
              onChange={props.handleChange}
              />
          </div>
        </div>
        <div className="container half">
          <div className="form-group item">
            <label htmlFor="date" className="form-label">Date</label>
            <input
              type="text"
              id="date"
              name="date"
              className="form-control third"
              value={props.date}
              onChange={props.handleChange}
            />
          </div>
        </div>

      </div>
    </React.Fragment>
  )
}

export default Details;