import React, {useContext} from "react";
import {Link} from "react-router-dom";
import {NiFrontendContext} from "../services/NiFrontendContext";

export default function Home() {
  const { error } = useContext(NiFrontendContext)
  return (
    <>
      {error ?
        <span className="govuk-error-message">{error}</span>
        :
        <>
          <h1 className="govuk-heading-l">
            National Insurance (NI) Calculation Support Tool
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
        </>
      }
  </>
  )
}
