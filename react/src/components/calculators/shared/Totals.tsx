import React, {useContext} from 'react';
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {TotalsProps} from '../../../interfaces'

numeral.locale('en-gb');

function Totals (props: TotalsProps) {
  const { isSaveAndPrint, result, context } = props;
  const {
    errors,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee
  } = useContext(context)

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
                    numeral(result?.totals.gross).format('$0,0.00')
                    :
                    "Total NI due"
                  }
                </span>
              </td>
              <td className={readOnlyClass}><span>{numeral(result?.totals.net).format('$0,0.00')}</span></td>
              <td className={readOnlyClass}><span>{numeral(result?.totals.employee).format('$0,0.00')}</span></td>
              <td className={readOnlyClass}><span>{numeral(result?.totals.employer).format('$0,0.00')}</span></td>
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
              <td className={readOnlyClass}><span>{numeral(result?.employerContributions).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Underpayment</th>
              <td className={readOnlyClass}><span>{result?.underpayment?.total}</span></td>
              <td className={readOnlyClass}><span>{result?.underpayment?.employee}</span></td>
              <td className={readOnlyClass}><span>{result?.underpayment?.employer}</span></td>
            </tr>
            <tr>
              <th className="right">Overpayment</th>
              <td className={readOnlyClass}><span>{result?.overpayment?.total}</span></td>
              <td className={readOnlyClass}><span>{result?.overpayment?.employee}</span></td>
              <td className={readOnlyClass}><span>{result?.overpayment?.employer}</span></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Totals;
