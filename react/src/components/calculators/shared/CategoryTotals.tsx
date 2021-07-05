import React, {useContext, useEffect} from 'react'
import * as thStyles from '../../../services/mobileHeadingStyles'

// components
import {TotalsInCategories} from '../../../interfaces'
import MqTableCell from './MqTableCell'

// services
import {
  getBandNames,
  getContributionBandNames,
  getTotalsInBand, getTotalsInContributionBand,
  uniqueCategories
} from "../../../services/utils";

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

  const bandNames = getBandNames(rows)
  const contributionNames = getContributionBandNames(rows)

  useEffect(() => {
    console.log(result?.categoryTotals)
    // result?.categoryTotals.forEach((value: any, key: any) => {
      // Object.keys(key).map((k) => {
      //   console.log(k)
      //   console.log(`key: ${k}, value: ${result?.categoryTotals[key][k]}`)
      // })
      // console.log(key)

      // key A
      // value Object
    // })

    for (const [k, v] of result?.categoryTotals.entries()) {
      console.log(k, v.gross)
    }
  }, [])

  const categoryTotalRows = []

  for (const [k, v] of result?.categoryTotals.entries()) {
    const bands: any = []
    for (const bV of v.resultBands.values()) {
      bands.push(<td>{numeral(bV.gross).format('$0,0.00')}</td>)
    }

    const contributionBands: any = []
    for (const cBV of v.resultContributionBands.values()) {
      bands.push(<td>{numeral(cBV.gross).format('$0,0.00')}</td>)
    }

    categoryTotalRows.push(<tr>
      <td>{k}</td>
      <td>{numeral(v.gross).format('$0,0.00')}</td>
      {bands}
      <td>{numeral(v.net).format('$0,0.00')}</td>
      <td>{numeral(v.employee).format('$0,0.00')}</td>
      <td>{numeral(v.employer).format('$0,0.00')}</td>
      {contributionBands}
    </tr>)
  }


  return (
    <div className="category-totals">
      <table className="contribution-details">
        <caption>Category Totals</caption>
        <thead>
          <tr className="clear">
            {bandNames.length > 0 &&
              <th
                className="border"
                colSpan={bandNames.length + 2}
              >
                &nbsp;
              </th>
            }
            <th className="border" colSpan={contributionNames.length + 3}>
              <span>Net contributions</span>
            </th>
          </tr>
          <tr>
            <th>Category</th>
            <th>Gross Pay</th>
            {bandNames && bandNames.map(k =>
              <th key={`${k}-cat-band-header`}>{k}</th>
            )}
            <th>Total</th>
            <th>EE</th>
            <th>ER</th>
            {contributionNames?.map((cB: string) => (<th scope="col" key={cB}>{cB}</th>))}
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


              {categoryTotals[c]?.contributionBands && categoryTotals[c]?.contributionBands.map(k =>
                <MqTableCell key={`${k.name}-cat-val`} cellStyle={thStyles.dynamicCellContentAttr(k.name)}>
                  {numeral(k.employeeContributions).format('$0,0.00')}
                </MqTableCell>
              )}

            </tr>
          ))}
          <tr className="total-row">
            <th scope="row" className="totals-row-header"><strong>Totals</strong></th>
            <MqTableCell cellStyle={thStyles.grossPay}>
              <strong>{formatCurrencyAmount(result?.totals.gross)}</strong>
            </MqTableCell>

            {bandNames?.map(k =>
              <MqTableCell key={`${k}-band-total`} cellStyle={thStyles.dynamicCellContentAttr(k)}>
                <strong>{formatCurrencyAmount(getTotalsInBand(k, rows))}</strong>
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

            {contributionNames?.map(k =>
              <MqTableCell key={`${k}-band-total`} cellStyle={thStyles.dynamicCellContentAttr(k)}>
                <strong>{formatCurrencyAmount(getTotalsInContributionBand(k, rows))}</strong>
              </MqTableCell>
            )}

          </tr>

          {categoryTotalRows}

        </tbody>
      </table>
    </div>
  )
}

export default CategoryTotals
