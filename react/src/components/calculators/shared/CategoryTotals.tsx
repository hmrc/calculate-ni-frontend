import React from 'react'

// components
import {TotalsInCategories} from '../../../interfaces'

// services
import {uniqueCategories} from "../../../services/utils";

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {Class1Result, Row} from "../class1/ClassOneContext";
import {DirectorsRow} from "../directors/DirectorsContext";

numeral.locale('en-gb');

function CategoryTotals(props: {
  rows: Array<Row | DirectorsRow>,
  categoryTotals: TotalsInCategories
  result: Class1Result | null
}) {
  const { rows, categoryTotals, result } = props
  const categoriesList = uniqueCategories(rows)
  const formatCurrencyAmount = (currencyAmount: string | number | Number | undefined | null) =>
    currencyAmount && numeral(currencyAmount.toString()).format('$0,0.00')
  return (
    <div className="category-totals">
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
              <th key={k.name}>{k.name}</th>
            )}
            <th>Total</th>
            <th>EE</th>
            <th>ER</th>
          </tr>
        </thead>
        <tbody>
          {categoriesList.map(c => (
            <tr key={c}>
              <td>{c}</td>
              <td>
                {/* Gross total for Category */}
                {formatCurrencyAmount(categoryTotals[c]?.gross)}
              </td>
              {rows[0].bands && rows[0].bands.map(k =>
                <td key={`${k}-val`}>
                  {numeral(k.amountInBand).format('$0,0.00')}
                </td>
              )}

              {/* Total contributions for category */}
              <td>
                {formatCurrencyAmount(categoryTotals[c]?.contributionsTotal)}
              </td>

              {/* EE contributions for category */}
              <td>
                {formatCurrencyAmount(categoryTotals[c]?.ee)}
              </td>
              
              {/* ER contributions for category */}
              <td>
                {formatCurrencyAmount(categoryTotals[c]?.er)}
              </td>
            </tr>
          ))}
          <tr>

            <th><strong>Totals</strong></th>
            <td>
              {formatCurrencyAmount(result?.totals.gross)}
            </td>
            {/* Bands (by tax year), so we can just take the first band to map the rows */}
            {rows[0].bands && rows[0].bands.map(k =>
              <td key={`${k.name}-band-total`}>
                &ndash;
              </td>
            )}

            <td>
              {formatCurrencyAmount(result?.totals.net)}
            </td>

            {/* EE total contributions */}
            <td>
              {formatCurrencyAmount(result?.totals.employee)}
            </td>
            
            {/* ER total contributions */}
            <td>
              {formatCurrencyAmount(result?.totals.employer)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default CategoryTotals
