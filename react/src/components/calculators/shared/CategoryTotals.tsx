import React from 'react'
import * as thStyles from '../../../services/mobileHeadingStyles'

// components
import {TotalsInCategories} from '../../../interfaces'
import MqTableCell from './MqTableCell'

// services
import {getTotalsInBand, uniqueCategories} from "../../../services/utils";

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {Class1Result, Row} from "../class1/ClassOneContext";
import {DirectorsUIRow} from "../directors/DirectorsContext";

numeral.locale('en-gb');

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
              <MqTableCell cellStyle={thStyles.category}>{c}</MqTableCell>
              <MqTableCell cellStyle={thStyles.grossPay}>
                {/* Gross total for Category */}
                {formatCurrencyAmount(categoryTotals[c]?.gross)}
              </MqTableCell>
              {categoryTotals[c]?.bands && categoryTotals[c]?.bands.map(k =>
                <MqTableCell key={`${k.name}-cat-val`} cellStyle={thStyles.dynamicCellContentAttr(k.name)}>
                  {numeral(k.amountInBand).format('$0,0.00')}
                </MqTableCell>
              )}

              {/* Total contributions for category */}
              <MqTableCell cellStyle={thStyles.total}>
                {formatCurrencyAmount(categoryTotals[c]?.contributionsTotal)}
              </MqTableCell>

              {/* EE contributions for category */}
              <MqTableCell cellStyle={thStyles.employee}>
                {formatCurrencyAmount(categoryTotals[c]?.ee)}
              </MqTableCell>
              
              {/* ER contributions for category */}
              <MqTableCell cellStyle={thStyles.employer}>
                {formatCurrencyAmount(categoryTotals[c]?.er)}
              </MqTableCell>
            </tr>
          ))}
          <tr className="total-row">
            <th className="totals-row-header"><strong>Totals</strong></th>
            <MqTableCell cellStyle={thStyles.grossPay}>
              <strong>{formatCurrencyAmount(result?.totals.gross)}</strong>
            </MqTableCell>

            {rows[0].bands && rows[0].bands.map(k =>
              <MqTableCell key={`${k.name}-band-total`} cellStyle={thStyles.dynamicCellContentAttr(k.name)}>
                <strong>{formatCurrencyAmount(getTotalsInBand(k.name, rows))}</strong>
              </MqTableCell>
            )}

            <MqTableCell cellStyle={thStyles.total}>
              <strong>{formatCurrencyAmount(result?.totals.net)}</strong>
            </MqTableCell>

            {/* EE total contributions */}
            <MqTableCell cellStyle={thStyles.employee}>
              <strong>{formatCurrencyAmount(result?.totals.employee)}</strong>
            </MqTableCell>
            
            {/* ER total contributions */}
            <MqTableCell cellStyle={thStyles.employer}>
              <strong>{formatCurrencyAmount(result?.totals.employer)}</strong>
            </MqTableCell>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default CategoryTotals
