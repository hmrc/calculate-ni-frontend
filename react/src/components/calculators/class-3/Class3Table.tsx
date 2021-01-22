import React, {useContext} from 'react'
import {Class3Context} from "./Class3Context";
import {Class3Row} from "../../../interfaces";
import Class3TableRow from "./Class3TableRow";

const Class3Table = () => {
  const {
    rows,
    taxYears
  } = useContext(Class3Context)
  return (
    <table className="contribution-details">
      <thead>
        <tr className="clear">
          <th className="lg" colSpan={4}><span>Period of insurance</span></th>
          <th className="border" colSpan={3}><span>Weeks</span></th>
        </tr>
        <tr>
          <th>
            #<span className="govuk-visually-hidden"> Row number</span>
          </th>
          <th className="date-mode">
            <span className="govuk-visually-hidden">Change how dates are entered</span>
          </th>
          <th className="date-toggles">
            <table className="borderless">
              <thead>
                <tr className="clear">
                  <th className="date-from">From</th>
                  <th>To</th>
                </tr>
              </thead>
            </table>
          </th>
          <th className="earnings-factor">Earnings factor</th>
          <th>Max weeks</th>
          <th>Actual weeks</th>
          <th>Deficient</th>
        </tr>
      </thead>
      <tbody>
      {rows.map((r: Class3Row, index: number) => (
        <Class3TableRow
          index={index}
          row={r}
          key={`row-${r.id}`}
          taxYears={taxYears}
        />
      ))}
      </tbody>
    </table>
  )
}

export default Class3Table
