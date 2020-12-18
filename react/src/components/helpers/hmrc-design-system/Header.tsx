import React from 'react'

// types
import { HeaderProps } from '../../../interfaces'

export default function Header(props: HeaderProps) {
  return (
    <header role="banner" className="hmrc-internal-header">
      <div className="hmrc-internal-header__logo">
        <a href="https://www.gov.uk/government/organisations/hm-revenue-customs"
           className="hmrc-internal-header__logo-link">
          HM Revenue &amp; Customs
        </a>
      </div>
      <div className="hmrc-internal-header__service-name">
        <a href="/" className="hmrc-internal-header__link">
          {props.serviceName}
        </a>
      </div>
    </header>
  )
}
