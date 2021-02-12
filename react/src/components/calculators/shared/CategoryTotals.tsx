/** @jsx jsx */
import React from 'react'
import { css, jsx } from '@emotion/react'

// components
import {TotalsInCategories} from '../../../interfaces'

// services
import {getTotalsInBand, uniqueCategories} from "../../../services/utils";

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {Class1Result, Row} from "../class1/ClassOneContext";
import {DirectorsUIRow} from "../directors/DirectorsContext";

numeral.locale('en-gb');

const mq = [`@media (max-width: ${759}px)`]
const categoryCellStyle = css({[mq[0]]: {':before': { content: `"Category"` }}})
const grossPayCellStyle = css({[mq[0]]: {':before': { content: `"Gross pay"` }}})
const totalCellStyle = css({[mq[0]]: {':before': { content: `"Total"` }}})
const employeeCellStyle = css({[mq[0]]: {':before': { content: `"Employee"` }}})
const employerCellStyle = css({[mq[0]]: {':before': { content: `"Employer"` }}})

function CategoryTotals(props: {
  rows: Array<Row | DirectorsUIRow>,
  categoryTotals: TotalsInCategories
  result: Class1Result | null
}) {
  const { rows, categoryTotals, result } = props
  const categoriesList = uniqueCategories(rows)
  const formatCurrencyAmount = (currencyAmount: string | number | Number | undefined | null) =>
    currencyAmount && numeral(currencyAmount.toString()).format('$0,0.00')
  return (
    <div className="category-totals">
      <h2 className="section-heading">Category Totals</h2>
      <table>
        <thead>
          <tr className="clear">
            {rows[0].bands &&
              <th
                className="border"
                colSpan={rows[0].bands.length + 2}
              >
                &nbsp;
              </th>
            }
            <th className="border" colSpan={3}>
              <span>Net contributions</span>
            </th>
          </tr>
          <tr>
            <th>Category</th>
            <th>Gross Pay</th>
            {/* Bands (by tax year), so we can just take the first band to map the rows */}
            {rows[0].bands && rows[0].bands.map(k =>
              <th key={`${k.name}-cat-band-header`}>{k.name}</th>
            )}
            <th>Total</th>
            <th>EE</th>
            <th>ER</th>
          </tr>
        </thead>
        <tbody>
          {categoriesList.map(c => (
            <tr key={`${c}-cat-list`}>
              <td css={categoryCellStyle}>{c}</td>
              <td css={grossPayCellStyle}>
                {/* Gross total for Category */}
                {formatCurrencyAmount(categoryTotals[c]?.gross)}
              </td>
              {categoryTotals[c]?.bands && categoryTotals[c]?.bands.map(k =>
                <td key={`${k.name}-cat-val`} css={css({[mq[0]]: {':before': { content: `"${k.name}"` }}})}>
                  {numeral(k.amountInBand).format('$0,0.00')}
                </td>
              )}

              {/* Total contributions for category */}
              <td css={totalCellStyle}>
                {formatCurrencyAmount(categoryTotals[c]?.contributionsTotal)}
              </td>

              {/* EE contributions for category */}
              <td css={employeeCellStyle}>
                {formatCurrencyAmount(categoryTotals[c]?.ee)}
              </td>
              
              {/* ER contributions for category */}
              <td css={employerCellStyle}>
                {formatCurrencyAmount(categoryTotals[c]?.er)}
              </td>
            </tr>
          ))}
          <tr className="total-row">
            <th className="totals-row-header"><strong>Totals</strong></th>
            <td css={grossPayCellStyle}>
              <strong>{formatCurrencyAmount(result?.totals.gross)}</strong>
            </td>

            {rows[0].bands && rows[0].bands.map(k =>
              <td key={`${k.name}-band-total`} css={css({[mq[0]]: {':before': { content: `"${k.name}"` }}})}>
                <strong>{formatCurrencyAmount(getTotalsInBand(k.name, rows))}</strong>
              </td>
            )}

            <td css={totalCellStyle}>
              <strong>{formatCurrencyAmount(result?.totals.net)}</strong>
            </td>

            {/* EE total contributions */}
            <td css={employeeCellStyle}>
              <strong>{formatCurrencyAmount(result?.totals.employee)}</strong>
            </td>
            
            {/* ER total contributions */}
            <td css={employerCellStyle}>
              <strong>{formatCurrencyAmount(result?.totals.employer)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default CategoryTotals
