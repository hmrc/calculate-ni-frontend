import React from 'react'

// types
import { HeaderProps } from '../interfaces'

function Header(props: HeaderProps) {
  return (
    <header role="banner" className="hmrc-internal-header">
      <div className="govuk-width-container">
        <div className="hmrc-logo">
          <a href="#" className="hmrc-logo__link">
            HM Revenue &amp; Customs
          </a>
        </div>

        <div className="hmrc-internal-service-name app-header__link">
          <a href="/" className="hmrc-internal-service-name__link">
          {props.serviceName}
        </a></div>
      </div>
    </header>
  )
}

export default Header