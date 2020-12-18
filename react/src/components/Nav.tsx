import React from "react";
import {Link} from "react-router-dom";

export default function Nav() {
  return (
  <nav>
    <ul className="govuk-list govuk-list--bullet">
      <li><Link to="/class-1">Calculate Class 1 National Insurance (NI) contributions</Link></li>
      <li><Link to="/directors">Directors’ contributions</Link></li>
    </ul>
  </nav>
  )
}
