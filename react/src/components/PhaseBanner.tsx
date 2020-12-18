import React from 'react'

// types
import { PhaseBannerProps } from '../interfaces'

// css
import '../styles/PhaseBanner.css'

function PhaseBanner(props: PhaseBannerProps) {
  return (
    <div className="app-phase-banner__wrapper">
      <div className="govuk-phase-banner app-phase-banner app-width-container">
        <p className="govuk-phase-banner__content">
          <strong className="govuk-tag govuk-phase-banner__content__tag">
            {props.type}
          </strong>
          <span className="govuk-phase-banner__text">
            This is a new service – your <a className="govuk-link" href="/get-in-touch">feedback</a> will help us to improve it.
          </span>
        </p>
      </div>
    </div>
  )
}

export default PhaseBanner