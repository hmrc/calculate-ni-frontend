import React from 'react';
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import { TotalsProps } from '../interfaces'

numeral.locale('en-gb');

function Totals (props: TotalsProps) {
  return (
    <div className="subsection totals">
      {!props.isSaveAndPrint &&
        <h2 className="section-heading">Totals</h2>
      }
      <div className="spaced-table-wrapper">
        <table className={`totals-table spaced-table ${props.isSaveAndPrint ? 'save-print-totals' : 'totals'}`}>
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
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.grossTotal).format('$0,0.00')}</span></td>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.netContributionsTotal).format('$0,0.00')}</span></td>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.employeeContributionsTotal).format('$0,0.00')}</span></td>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.employerContributionsTotal).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right error-line-label"><span>NI paid</span></th>
              {props.isSaveAndPrint ? 
                <td>
                  {numeral(props.niPaidNet).format('$0,0.00')}
                </td>
              :
                <td className="input-cell">
                  <div className={`form-group ${props.errors?.niPaidNet ? "form-group-error" : ""}`}>
                    <label className="govuk-visually-hidden" htmlFor="niPaidNet">NI paid net contributions</label>
                    {props.errors?.niPaidNet && <span className='govuk-error-message' id="niPaidNet-error">{props.errors.niPaidNet}</span>}
                    <input 
                      type="text" 
                      inputMode="decimal"
                      name="niPaidNet"
                      id="niPaidNet"
                      className={`govuk-input ${props.errors?.niPaidNet ? "govuk-input--error" : ""}`} 
                      value={props.niPaidNet}
                      onChange={(e) => props.setNiPaidNet(e.target.value)}
                      {...(props.errors?.niPaidNet && {"aria-describedby": "niPaidNet-error"})}
                    />
                  </div>
                </td>
              }
              {props.isSaveAndPrint ? 
                <td>
                  {numeral(props.niPaidEmployee).format('$0,0.00')}
                </td>
              :
                <td className="input-cell">
                  <div className={`form-group ${props.errors?.niPaidEmployee ? "form-group-error" : ""}`}>
                    <label className="govuk-visually-hidden" htmlFor="niPaidEmployee">NI paid employee contributions</label>
                    {props.errors?.niPaidEmployee && <span className='govuk-error-message' id="niPaidEmployee-error">{props.errors?.niPaidEmployee}</span>}
                    <input 
                      type="text" 
                      inputMode="decimal"
                      name="niPaidEmployee"
                      id="niPaidEmployee"
                      className={`govuk-input ${props.errors?.niPaidEmployee ? "govuk-input--error" : ""}`} 
                      value={props.niPaidEmployee}
                      onChange={(e) => props.setNiPaidEmployee(e.target.value)}
                      {...(props.errors?.niPaidEmployee && {"aria-describedby": "niPaidEmployee-error"})}
                    />
                  </div>
                </td>
              }
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.niPaidEmployer).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Underpayment</th>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.underpaymentNet).format('$0,0.00')}</span></td>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.underpaymentEmployee).format('$0,0.00')}</span></td>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.underpaymentEmployer).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Overpayment</th>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.overpaymentNet).format('$0,0.00')}</span></td>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.overpaymentEmployee).format('$0,0.00')}</span></td>
              <td className={`${props.isSaveAndPrint ? '' : 'readonly'}`}><span>{numeral(props.overpaymentEmployer).format('$0,0.00')}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Totals;