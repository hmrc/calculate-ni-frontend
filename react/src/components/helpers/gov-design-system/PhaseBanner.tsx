import React from 'react'

// types
import { PhaseBannerProps } from '../../../interfaces'

export default function PhaseBanner(props: PhaseBannerProps) {
  return (
    <div className="govuk-phase-banner">
      <p className="govuk-phase-banner__content">
        <strong className="govuk-tag govuk-phase-banner__content__tag">
          {props.type}
        </strong>
        <span className="govuk-phase-banner__text">
          This is a new service – your <a className="govuk-link" href={props.link}>feedback</a> will help us to improve it.
        </span>
      </p>
    </div>
  )
}
