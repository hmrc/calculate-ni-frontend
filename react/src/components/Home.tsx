import React, {useContext, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import {NiFrontendContext} from "../services/NiFrontendContext";
import {useDocumentTitle} from "../services/useDocumentTitle";
import {serviceName} from "../config";
import {SuccessNotificationContext} from "../services/SuccessNotificationContext";
import SecondaryButton from "./helpers/gov-design-system/SecondaryButton";

const pageTitle = serviceName

export default function Home() {
  const { error, loading } = useContext(NiFrontendContext)
  const notificationStatusRef = useRef() as React.MutableRefObject<HTMLParagraphElement>
  const { successNotificationsOn, setSuccessNotificationsOn } = useContext(SuccessNotificationContext)
  useDocumentTitle(pageTitle)
  useEffect(() => {
    notificationStatusRef.current && notificationStatusRef.current.focus()
  }, [successNotificationsOn, notificationStatusRef])
  return (
    <>
      {loading ?
        <span className="loading">Loading configuration...</span>
        :
        <>
          {error ?
            <span className="govuk-error-message">{error}</span>
            :
            <>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">

                  <h1 className="govuk-heading-l">
                    {pageTitle}
                  </h1>
                  <p className="govuk-body">
                    This service was previously known as ‘Calculation Support’.
                  </p>
                  <nav>
                    <h2 className="govuk-heading-m">
                      Class 1 NI calculators
                    </h2>
                    <ul className="govuk-list govuk-list--bullet">
                      <li><Link to="/class-1" className="govuk-link">Calculate Class 1 National Insurance (NI) contributions</Link></li>
                      <li><Link to="/directors" className="govuk-link">Directors’ contributions</Link></li>
                      <li><Link to="/unofficial-deferment" className="govuk-link">Class 1 NI contributions an employer owes due to unofficial
                        deferment</Link></li>
                    </ul>
                    <h2 className="govuk-heading-m">
                      Class 2 and 3 NI calculators
                    </h2>
                    <ul className="govuk-list govuk-list--bullet">
                      <li><Link to="/class-2-or-3" className="govuk-link">Class 2 or 3 NI contributions needed for a qualifying year</Link></li>
                      <li><Link to="/class-3" className="govuk-link">Weekly contribution conversion</Link></li>
                    </ul>
                    <h2 className="govuk-heading-m">
                      Interest calculators
                    </h2>
                    <ul className="govuk-list govuk-list--bullet">
                      <li><Link to="/late-interest" className="govuk-link">Interest on late or unpaid Class 1 NI contributions</Link></li>
                      <li><Link to="/late-refunds" className="govuk-link">Interest on late-paid refunds from 1993 to 1994</Link></li>
                    </ul>
                  </nav>

                  <div className="settings">
                    <h2 className="govuk-heading-m">Control success notifications</h2>
                    <p className="govuk-body no-focus-outline" tabIndex={-1} ref={notificationStatusRef}>
                      In-page success notifications are currently <strong>{successNotificationsOn ? 'on' : 'off'}</strong>
                    </p>
                    <SecondaryButton
                      label={`Turn success notifications ${successNotificationsOn ? 'off' : 'on'}`}
                      onClick={() => setSuccessNotificationsOn(!successNotificationsOn)}
                    />
                  </div>

                </div>

                <div className="govuk-grid-column-one-third">
                  <div className="app-related-items">
                    <h2 className="govuk-heading-m">Rates tables</h2>
                    <ul className="govuk-list">
                      <li><a href="/calculate-ni/tables/classOne" className="govuk-link">Class One</a></li>
                      <li><a href="/calculate-ni/tables/classTwo" className="govuk-link">Class Two</a></li>
                      <li><a href="/calculate-ni/tables/classThree" className="govuk-link">Class Three</a></li>
                      <li><a href="/calculate-ni/tables/classFour" className="govuk-link">Class Four</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          }
        </>
      }
  </>
  )
}
