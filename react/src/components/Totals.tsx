import React, {useEffect} from 'react';
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import { TotalsProps } from '../interfaces'

// services
import {calculateNiDue} from "../services/utils";
import {useClassOneTotals} from "../services/classOneTotals";

numeral.locale('en-gb');

function Totals (props: TotalsProps) {
  const { reset, setReset, isSaveAndPrint, calculatedRows } = props;
  const {
    resetNiPaid,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
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

  useEffect(() => {
    const employeeNiDue = calculateNiDue(calculatedRows, 1)
    setEmployeeContributionsTotal(employeeNiDue)

    const employerNiDue = calculateNiDue(calculatedRows, 2)
    setEmployerContributionsTotal(employerNiDue)
  })

  useEffect(() => {
    if(reset) {
      resetNiPaid()
      setReset(false)
    }
  }, [reset, resetNiPaid, setReset])

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
                    numeral(props.grossTotal).format('$0,0.00')
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
                  <div className={`form-group ${props.errors?.niPaidNet ? "form-group-error" : ""}`}>
                    <label className="govuk-visually-hidden" htmlFor="niPaidNet">NI paid net contributions</label>
                    {props.errors?.niPaidNet && <span className='govuk-error-message' id="niPaidNet-error">{props.errors.niPaidNet}</span>}
                    <input
                      type="text"
                      inputMode="decimal"
                      name="niPaidNet"
                      id="niPaidNet"
                      className={`govuk-input ${props.errors?.niPaidNet ? "govuk-input--error" : ""}`}
                      value={niPaidNet}
                      onChange={(e) => setNiPaidNet(e.target.value)}
                      {...(props.errors?.niPaidNet && {"aria-describedby": "niPaidNet-error"})}
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
                  <div className={`form-group ${props.errors?.niPaidEmployee ? "form-group-error" : ""}`}>
                    <label className="govuk-visually-hidden" htmlFor="niPaidEmployee">NI paid employee contributions</label>
                    {props.errors?.niPaidEmployee && <span className='govuk-error-message' id="niPaidEmployee-error">{props.errors?.niPaidEmployee}</span>}
                    <input
                      type="text"
                      inputMode="decimal"
                      name="niPaidEmployee"
                      id="niPaidEmployee"
                      className={`govuk-input ${props.errors?.niPaidEmployee ? "govuk-input--error" : ""}`}
                      value={niPaidEmployee}
                      onChange={(e) => setNiPaidEmployee(e.target.value)}
                      {...(props.errors?.niPaidEmployee && {"aria-describedby": "niPaidEmployee-error"})}
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
