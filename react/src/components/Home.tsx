import React from "react";
import {Link} from "react-router-dom";

export default function Home() {
  return (
    <>
      <h1 className="govuk-heading-l">
        Calculate National Insurance (NI) contributions
      </h1>
      <p className="govuk-body">
        This service was previously known as ‘Calculation Support’.
      </p>
      <nav>
        <h2 className="govuk-heading-m">
          Class 1 NI calculators
        </h2>
        <ul className="govuk-list govuk-list--bullet">
          <li><Link to="/class-1">Calculate Class 1 National Insurance (NI) contributions</Link></li>
          <li><Link to="/directors">Directors’ contributions</Link></li>
          <li><Link to="/unofficial-deferment">Class 1 NI contributions an employer owes due to unofficial deferment</Link></li>
        </ul>
        <h2 className="govuk-heading-m">
          Class 2 and 3 NI calculators
        </h2>
        <ul className="govuk-list govuk-list--bullet">
          <li><Link to="/class-2-or-3">Class 2 or 3 NI contributions needed for a qualifying year</Link></li>
          <li><Link to="/class-3">Weekly contribution conversion</Link></li>
        </ul>
        <h2 className="govuk-heading-m">
          Interest calculators
        </h2>
        <ul className="govuk-list govuk-list--bullet">
          <li><Link to="/late-interest">Interest on late or unpaid Class 1 NI contributions</Link></li>
          <li><Link to="/interest-refunds">Interest on late-paid refunds from 1993 to 1994</Link></li>
        </ul>
      </nav>
  </>
  )
}
