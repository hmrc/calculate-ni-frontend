import React, {useContext} from 'react';
import * as thStyles from '../../../services/mobileHeadingStyles'
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {TotalsProps} from '../../../interfaces'

// components
import MqTableCell from './MqTableCell'

numeral.locale('en-gb');

function Totals (props: TotalsProps) {
  const { isSaveAndPrint, result, context } = props;
  const {
    niPaidNet,
    niPaidEmployee
  } = useContext(context)

  const readOnlyClass: string = isSaveAndPrint ? '' : 'readonly'

  return (
    <>
      <div className={`${isSaveAndPrint ? `save-print-wrapper ` : ``}subsection totals`}>
        <div className="spaced-table-wrapper">
          <table id="results-totals" tabIndex={-1} className={`totals-table spaced-table ${isSaveAndPrint ? 'save-print-totals' : 'totals'}`}>
            <caption>Totals</caption>
            <thead>
            <tr>
              {props.grossPayTally ? <th>Gross pay</th> : <td />}
              <th scope="col">Net contributions</th>
              <th scope="col">Employee contributions</th>
              <th scope="col" className="last-heading">Employer contributions</th>
            </tr>
            </thead>
            <tbody>
              <tr>
                {props.isSaveAndPrint ?
                  <MqTableCell cellStyle={thStyles.grossPay}>{numeral(result?.totals.gross).format('$0,0.00')}</MqTableCell>
                  :
                  <th scope="row" className="right">Total NI due</th>
                }
                <MqTableCell cellClassName={readOnlyClass} cellStyle={thStyles.netConts}><span>{numeral(result?.totals.net).format('$0,0.00')}</span></MqTableCell>
                <MqTableCell cellClassName={readOnlyClass} cellStyle={thStyles.employeeConts}><span>{numeral(result?.totals.employee).format('$0,0.00')}</span></MqTableCell>
                <MqTableCell cellClassName={`${readOnlyClass} last-cell`} cellStyle={thStyles.employerConts}><span>{numeral(result?.totals.employer).format('$0,0.00')}</span></MqTableCell>
              </tr>
              <tr>
                <th scope="row" className="right">NI paid</th>
                {props.isSaveAndPrint ?
                  <MqTableCell cellStyle={thStyles.netConts}>
                    {numeral(niPaidNet).format('$0,0.00')}
                  </MqTableCell>
                  :
                  <MqTableCell cellClassName={readOnlyClass} cellStyle={thStyles.netConts}>
                    <span>{numeral(niPaidNet).format('$0,0.00')}</span>
                  </MqTableCell>
                }
                {isSaveAndPrint ?
                  <MqTableCell cellStyle={thStyles.employeeConts}>
                    {numeral(niPaidEmployee).format('$0,0.00')}
                  </MqTableCell>
                  :
                  <MqTableCell cellClassName={readOnlyClass} cellStyle={thStyles.employeeConts}>
                    <span>{numeral(niPaidEmployee).format('$0,0.00')}</span>
                  </MqTableCell>
                }
                <MqTableCell cellClassName={`${readOnlyClass} last-cell`} cellStyle={thStyles.employerConts}><span>{numeral(result?.employerContributions).format('$0,0.00')}</span></MqTableCell>
              </tr>
              <tr>
                <th scope="row" className="right">Underpayment</th>
                <MqTableCell cellClassName={readOnlyClass} cellStyle={thStyles.netConts}><span>{numeral(result?.underpayment?.total).format('$0,0.00')}</span></MqTableCell>
                <MqTableCell cellClassName={readOnlyClass} cellStyle={thStyles.employeeConts}><span>{numeral(result?.underpayment?.employee).format('$0,0.00')}</span></MqTableCell>
                <MqTableCell cellClassName={`${readOnlyClass} last-cell`} cellStyle={thStyles.employerConts}><span>{numeral(result?.underpayment?.employer).format('$0,0.00')}</span></MqTableCell>
              </tr>
              <tr>
                <th scope="row" className="right">Overpayment</th>
                <MqTableCell cellClassName={readOnlyClass} cellStyle={thStyles.netConts}><span>{numeral(result?.overpayment?.total).format('$0,0.00')}</span></MqTableCell>
                <MqTableCell cellClassName={readOnlyClass} cellStyle={thStyles.employeeConts}><span>{numeral(result?.overpayment?.employee).format('$0,0.00')}</span></MqTableCell>
                <MqTableCell cellClassName={`${readOnlyClass} last-cell`} cellStyle={thStyles.employerConts}><span>{numeral(result?.overpayment?.employer).format('$0,0.00')}</span></MqTableCell>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Totals;
