import React from "react";
import {Link} from "react-router-dom";

export default function Home() {
  return (
    <>
      <h1 className="govuk-heading-xl">
        Calculate National Insurance (NI) contributions
      </h1>
      <p className="govuk-body">
        This service was previously known as ‘Calculation Support’.
      </p>
      <nav>
        <h2 className="govuk-heading-l">
          Class 1 NI calculators
        </h2>
        <ul className="govuk-list govuk-list--bullet">
          <li><Link to="/class-1">Calculate Class 1 National Insurance (NI) contributions</Link></li>
          <li><Link to="/directors">Directors’ contributions</Link></li>
          <li>Class 1 NI contributions an employer owes due to unofficial deferment</li>
        </ul>
        <h2 className="govuk-heading-l">
          Class 2 and 3 NI calculators
        </h2>
        <ul className="govuk-list govuk-list--bullet">
          <li>Class 2 or 3 NI contributions needed for a qualifying year</li>
          <li>Class 3 NI service spouse credits</li>
        </ul>
        <h2 className="govuk-heading-l">
          Interest calculators
        </h2>
        <ul className="govuk-list govuk-list--bullet">
          <li>Interest on late or unpaid Class 1 NI contributions</li>
          <li>Interest on late-paid refunds from 1993 to 1994</li>
        </ul>
      </nav>
  </>
  )
}
