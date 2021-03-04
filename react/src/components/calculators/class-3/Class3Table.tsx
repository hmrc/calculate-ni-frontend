import React, {useContext} from 'react'
import {Class3Context} from "./Class3Context";
import {Class3Row} from "../../../interfaces";
import Class3TableRow from "./Class3TableRow";

interface Class3TableProps {
  printView: boolean
}

const Class3Table = (props: Class3TableProps) => {
  const { printView } = props
  const {
    rows
  } = useContext(Class3Context)
  return (
    <table className="contribution-details">
      <caption>Periods of insurance</caption>
      <colgroup span={3} />
      <colgroup span={1} />
      <thead>
        <tr className="clear">
          <td colSpan={3} />
          <th scope="colgroup" className="border" colSpan={1}><span>Weeks</span></th>
        </tr>
        <tr>
          <th scope="col">
            #<span className="govuk-visually-hidden"> Row number</span>
          </th>
          {!printView &&
            <th scope="col" className="date-mode">
              <span className="govuk-visually-hidden">Change how dates are entered</span>
            </th>
          }
          <th scope="col" className="date-toggles">
            <table className="borderless">
              <thead>
                <tr className="clear">
                  <th className="date-from">From</th>
                  <th>To</th>
                </tr>
              </thead>
            </table>
          </th>
          <th scope="col">Actual weeks</th>
        </tr>
      </thead>
      <tbody>
      {rows.map((r: Class3Row, index: number) => (
        <Class3TableRow
          index={index}
          row={r}
          key={`row-${r.id}`}
          printView={printView}
        />
      ))}
      </tbody>
    </table>
  )
}

export default Class3Table
