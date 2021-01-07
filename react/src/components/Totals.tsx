import React, {Context, useContext, useEffect} from 'react';
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {Calculators, TotalsProps} from '../interfaces'

// services
import {calculateNiDue} from "../services/utils";
import {useClassOneTotals} from "../services/classOneTotals";
import {ClassOneContext} from "./calculators/class1/ClassOneContext";
import {DirectorsContext} from "./calculators/directors/DirectorsContext";

numeral.locale('en-gb');

function Totals (props: TotalsProps) {
  const { isSaveAndPrint, calculatedRows, type } = props;
  const {
    niPaidEmployer,
    netContributionsTotal,
    employeeContributionsTotal,
    setEmployeeContributionsTotal,
    employerContributionsTotal,
    setEmployerContributionsTotal,
    underpaymentNet,
    overpaymentNet,
    underpaymentEmployee,
    overpaymentEmployee,
    underpaymentEmployer,
    overpaymentEmployer
  } = useClassOneTotals()

  const context: Context<any> =
    type === Calculators.CLASS_ONE ? ClassOneContext : DirectorsContext

  const {
    errors,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    grossTotal
  } = useContext(context)

  useEffect(() => {
    const employeeNiDue = calculateNiDue(calculatedRows, 1)
    setEmployeeContributionsTotal(employeeNiDue)

    const employerNiDue = calculateNiDue(calculatedRows, 2)
    setEmployerContributionsTotal(employerNiDue)
  })

  const readOnlyClass: string = isSaveAndPrint ? '' : 'readonly'

  return (
    <>
      <div className={`${isSaveAndPrint ? `save-print-wrapper ` : ``}subsection totals`}>
        {!isSaveAndPrint &&
          <h2 className="section-heading">Totals</h2>
        }
        <div className="spaced-table-wrapper">
          <table className={`totals-table spaced-table ${isSaveAndPrint ? 'save-print-totals' : 'totals'}`}>
            <thead>
            <tr>
              <th>{props.grossPayTally ? "Gross pay" : ""}</th>
              <th>Net contributions</th>
              <th>Employee contributions</th>
              <th>Employer contributions</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td className={`${isSaveAndPrint || !props.grossPayTally ? 'right' : 'readonly'}`}>
                <span>
                  {props.grossPayTally ?
                    numeral(grossTotal).format('$0,0.00')
                    :
                    "Total NI due"
                  }
                </span>
              </td>
              <td className={readOnlyClass}><span>{numeral(netContributionsTotal).format('$0,0.00')}</span></td>
              <td className={readOnlyClass}><span>{numeral(employeeContributionsTotal).format('$0,0.00')}</span></td>
              <td className={readOnlyClass}><span>{numeral(employerContributionsTotal).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right error-line-label"><span>NI paid</span></th>
              {props.isSaveAndPrint ?
                <td>
                  {numeral(niPaidNet).format('$0,0.00')}
                </td>
                :
                <td className="input-cell">
                  <div className={`form-group ${errors?.niPaidNet ? "form-group-error" : ""}`}>
                    <label className="govuk-visually-hidden" htmlFor="niPaidNet">NI paid net contributions</label>
                    {errors?.niPaidNet && <span className='govuk-error-message' id="niPaidNet-error">{errors.niPaidNet?.message}</span>}
                    <input
                      type="text"
                      inputMode="decimal"
                      name="niPaidNet"
                      id="niPaidNet"
                      className={`govuk-input ${errors?.niPaidNet ? "govuk-input--error" : ""}`}
                      value={niPaidNet}
                      onChange={(e) => setNiPaidNet(e.target.value)}
                      {...(errors?.niPaidNet && {"aria-describedby": "niPaidNet-error"})}
                    />
                  </div>
                </td>
              }
              {isSaveAndPrint ?
                <td>
                  {numeral(niPaidEmployee).format('$0,0.00')}
                </td>
                :
                <td className="input-cell">
                  <div className={`form-group ${errors?.niPaidEmployee ? "form-group-error" : ""}`}>
                    <label className="govuk-visually-hidden" htmlFor="niPaidEmployee">NI paid employee contributions</label>
                    {errors?.niPaidEmployee && <span className='govuk-error-message' id="niPaidEmployee-error">{errors?.niPaidEmployee.message}</span>}
                    <input
                      type="text"
                      inputMode="decimal"
                      name="niPaidEmployee"
                      id="niPaidEmployee"
                      className={`govuk-input ${errors?.niPaidEmployee ? "govuk-input--error" : ""}`}
                      value={niPaidEmployee}
                      onChange={(e) => setNiPaidEmployee(e.target.value)}
                      {...(errors?.niPaidEmployee && {"aria-describedby": "niPaidEmployee-error"})}
                    />
                  </div>
                </td>
              }
              <td className={readOnlyClass}><span>{numeral(niPaidEmployer).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Underpayment</th>
              <td className={readOnlyClass}><span>{numeral(underpaymentNet).format('$0,0.00')}</span></td>
              <td className={readOnlyClass}><span>{numeral(underpaymentEmployee).format('$0,0.00')}</span></td>
              <td className={readOnlyClass}><span>{numeral(underpaymentEmployer).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Overpayment</th>
              <td className={readOnlyClass}><span>{numeral(overpaymentNet).format('$0,0.00')}</span></td>
              <td className={readOnlyClass}><span>{numeral(overpaymentEmployee).format('$0,0.00')}</span></td>
              <td className={readOnlyClass}><span>{numeral(overpaymentEmployer).format('$0,0.00')}</span></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Totals;
