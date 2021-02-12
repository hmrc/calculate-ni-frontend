/** @jsx jsx */
import React, {useContext} from 'react';
import { css, jsx } from '@emotion/react'
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {TotalsProps} from '../../../interfaces'

numeral.locale('en-gb');

const mq = [`@media (max-width: ${759}px)`]
const grossPayCellStyle = css({[mq[0]]: {':before': { content: `"Gross pay"` }}})
const netContsCellStyle = css({[mq[0]]: {':before': { content: `"Net contributions"` }}})
const employeeContsCellStyle = css({[mq[0]]: {':before': { content: `"Employee contributions"` }}})
const employerContsCellStyle = css({[mq[0]]: {':before': { content: `"Employer contributions"` }}})

function Totals (props: TotalsProps) {
  const { isSaveAndPrint, result, context } = props;
  const {
    niPaidNet,
    niPaidEmployee
  } = useContext(context)

  const readOnlyClass: string = isSaveAndPrint ? '' : 'readonly'

  return (
    <React.Fragment>
      <div className={`${isSaveAndPrint ? `save-print-wrapper ` : ``}subsection totals`}>
        <h2 className="section-heading">Totals</h2>
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
              {props.isSaveAndPrint ?
                <td css={grossPayCellStyle}>{numeral(result?.totals.gross).format('$0,0.00')}</td>
                :
                <th className="right">Total NI due</th>
              }
              <td className={readOnlyClass} css={netContsCellStyle}><span>{numeral(result?.totals.net).format('$0,0.00')}</span></td>
              <td className={readOnlyClass} css={employeeContsCellStyle}><span>{numeral(result?.totals.employee).format('$0,0.00')}</span></td>
              <td className={readOnlyClass} css={employerContsCellStyle}><span>{numeral(result?.totals.employer).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">NI paid</th>
              {props.isSaveAndPrint ?
                <td css={netContsCellStyle}>
                  {numeral(niPaidNet).format('$0,0.00')}
                </td>
                :
                <td className={readOnlyClass} css={netContsCellStyle}>
                  <span>{numeral(niPaidNet).format('$0,0.00')}</span>
                </td>
              }
              {isSaveAndPrint ?
                <td css={employeeContsCellStyle}>
                  {numeral(niPaidEmployee).format('$0,0.00')}
                </td>
                :
                <td className={readOnlyClass} css={employeeContsCellStyle}>
                  <span>{numeral(niPaidEmployee).format('$0,0.00')}</span>
                </td>
              }
              <td className={readOnlyClass} css={employerContsCellStyle}><span>{numeral(result?.employerContributions).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Underpayment</th>
              <td className={readOnlyClass} css={netContsCellStyle}><span>{numeral(result?.underpayment?.total).format('$0,0.00')}</span></td>
              <td className={readOnlyClass} css={employeeContsCellStyle}><span>{numeral(result?.underpayment?.employee).format('$0,0.00')}</span></td>
              <td className={readOnlyClass} css={employerContsCellStyle}><span>{numeral(result?.underpayment?.employer).format('$0,0.00')}</span></td>
            </tr>
            <tr>
              <th className="right">Overpayment</th>
              <td className={readOnlyClass} css={netContsCellStyle}><span>{numeral(result?.overpayment?.total).format('$0,0.00')}</span></td>
              <td className={readOnlyClass} css={employeeContsCellStyle}><span>{numeral(result?.overpayment?.employee).format('$0,0.00')}</span></td>
              <td className={readOnlyClass} css={employerContsCellStyle}><span>{numeral(result?.overpayment?.employer).format('$0,0.00')}</span></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Totals;
