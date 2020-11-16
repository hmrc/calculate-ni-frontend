import React from 'react';
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import { TotalsProps } from '../interfaces'

numeral.locale('en-gb');

function Totals (props: TotalsProps) {
  return (
    <div className="subsection totals">
      <h2 className="section-heading">Totals</h2>
      <div className="spaced-table-wrapper">
        <table className="totals-table spaced-table">
          <thead>
            <tr>
              <th>Gross pay</th>
              <th>Net contributions</th>
              <th>Employee contributions</th>
              <th>Employer contributions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="readonly"><span>{numeral(props.grossTotal).format('$0,0.00')}</span></td>
              <td className="readonly"><span>{numeral(props.netContributionsTotal).format('$0,0.00')}</span></td>
              <td className="readonly"><span>{numeral(props.employeeContributionsTotal).format('$0,0.00')}</span></td>
              <td className="readonly"><span>{numeral(props.employerContributionsTotal).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right error-line-label"><span>NI Paid</span></th>
              <td className="input-cell">
                <div className={`form-group ${props.errors.niPaidNet ? "form-group-error" : ""}`}>
                  {props.errors.niPaidNet && <span className='govuk-error-message'>{props.errors.niPaidNet}</span>}
                  <input 
                    type="text" 
                    inputMode="decimal"
                    name="niPaidNet"
                    id="niPaidNet"
                    className={`govuk-input ${props.errors.niPaidNet ? "govuk-input--error" : ""}`} 
                    value={props.niPaidNet}
                    onChange={(e) => props.setNiPaidNet(e.target.value)}
                  />
                </div>
              </td>
              <td className="input-cell">
                <div className={`form-group ${props.errors.niPaidEmployee ? "form-group-error" : ""}`}>
                  {props.errors.niPaidEmployee && <span className='govuk-error-message'>{props.errors.niPaidEmployee}</span>}
                  <input 
                    type="text" 
                    inputMode="decimal"
                    name="NiPaidEmployee"
                    id="NiPaidEmployee"
                    className={`govuk-input ${props.errors.niPaidEmployee ? "govuk-input--error" : ""}`} 
                    value={props.niPaidEmployee}
                    onChange={(e) => props.setNiPaidEmployee(e.target.value)}
                  />
                </div>
              </td>
              <td className="readonly"><span>{numeral(props.niPaidEmployer).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Underpayment</th>
              <td className="readonly"><span>{numeral(props.underpaymentNet).format('$0,0.00')}</span></td>
              <td className="readonly"><span>{numeral(props.underpaymentEmployee).format('$0,0.00')}</span></td>
              <td className="readonly"><span>{numeral(props.underpaymentEmployer).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Overpayment</th>
              <td className="readonly"><span>{numeral(props.overpaymentNet).format('$0,0.00')}</span></td>
              <td className="readonly"><span>{numeral(props.overpaymentEmployee).format('$0,0.00')}</span></td>
              <td className="readonly"><span>{numeral(props.overpaymentEmployer).format('$0,0.00')}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Totals;