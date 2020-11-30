import React from 'react'

// components
import { CategoryTotalsProps } from '../interfaces'

import numeral from 'numeral'
import 'numeral/locales/en-gb';

numeral.locale('en-gb');

function CategoryTotals(props: CategoryTotalsProps) {
  return (
    <div className="category-totals">
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Gross Pay</th>
            {/* Bands (by tax year), so we can just take the first band to map the rows */}
            {props.rows[0].bands && Object.keys(props.rows[0].bands).map(k =>
              <th key={k}>{k}</th>
            )}
            <th>Total</th>
            <th>EE</th>
            <th>ER</th>
          </tr>
        </thead>
        <tbody>
          {props.categoriesList.map(c => (
            <tr>
              <td>{c}</td>
              <td>
                {/* Gross total for Category */}
                {numeral(
                  props.rows.reduce((prev, cur) => {
                    if (cur.category === c) {
                      return prev + parseFloat(cur.gross)
                    } else {
                      return prev
                    }
                  }, 0).toString()
                ).format('$0,0.00')}
              </td>
              {props.rows[0].bands && Object.keys(props.rows[0].bands).map(k =>
              <td key={`${k}-val`}>{numeral(props.rows[0].bands?.[k][0]).format('$0,0.00')}</td>
              )}

              {/* Total contributions for category */}
              <td>
                {numeral(
                  props.rows.reduce((prev, cur) => {
                    if (cur.category === c) {
                      return prev + (parseFloat(cur.ee) + parseFloat(cur.er))
                    } else {
                      return prev
                    }
                  }, 0).toString()
                ).format('$0,0.00')}
              </td>

              {/* EE contributions for category */}
              <td>
                {numeral(
                  props.rows.reduce((prev, cur) => {
                    if (cur.category === c) {
                      return prev + parseFloat(cur.ee)
                    } else {
                      return prev
                    }
                  }, 0).toString()
                ).format('$0,0.00')}
              </td>
              
              {/* ER contributions for category */}
              <td>
                {numeral(
                  props.rows.reduce((prev, cur) => {
                    if (cur.category === c) {
                      return prev + parseFloat(cur.er)
                    } else {
                      return prev
                    }
                  }, 0).toString()
                ).format('$0,0.00')}
              </td>
            </tr>
          ))}
          <tr>
            {/* 
              Overall Totals

            */}

            <th><strong>Totals</strong></th>
            <td>
              {numeral(props.rows.reduce((prev, cur) => { return prev + parseFloat(cur.gross) }, 0).toString()).format('$0,0.00')}
            </td>
            {/* Bands (by tax year), so we can just take the first band to map the rows */}
            {props.rows[0].bands && Object.keys(props.rows[0].bands).map(k =>
              <td key={`${k}-band-total`}>{k} ???</td>
            )}

            {/* All total conts */}
            <td>
              {numeral(
                props.rows.reduce((prev, cur) => {
                  return prev + (parseFloat(cur.ee) + parseFloat(cur.er))
                  
                }, 0).toString()
              ).format('$0,0.00')}
            </td>

            {/* EE total conts */}
            <td>
              {numeral(
                props.rows.reduce((prev, cur) => {
                  return prev + parseFloat(cur.ee)
                  
                }, 0).toString()
              ).format('$0,0.00')}
            </td>
            
            {/* ER total conts */}
            <td>
              {numeral(
                props.rows.reduce((prev, cur) => {
                  return prev + parseFloat(cur.er)
                  
                }, 0).toString()
              ).format('$0,0.00')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default CategoryTotals