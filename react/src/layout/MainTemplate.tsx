import Header from "../components/helpers/hmrc-design-system/Header";
import {serviceName} from "../config";
import PhaseBanner from "../components/helpers/gov-design-system/PhaseBanner";
import BreadCrumbs from "../components/helpers/gov-design-system/BreadCrumbs";
import React, {ReactNode, useRef} from "react";
import {useScrollToTop} from "../services/useScrollTop";

export default function MainTemplate(props: {  children: ReactNode}) {
  const pageRef = useRef() as React.MutableRefObject<HTMLDivElement>
  useScrollToTop({ ref: pageRef })
  return (
    <div tabIndex={-1} className="no-focus-outline" ref={pageRef}>
      <a href="#main-content" className="govuk-skip-link">Skip to main content</a>
      <div className="govuk-width-container">
        <Header serviceName={serviceName} />
        <PhaseBanner type="ALPHA" link="#feedback" />
        <BreadCrumbs />
        <main className="main" id="main-content">
          {props.children}
        </main>
      </div>
    </div>
  )
}