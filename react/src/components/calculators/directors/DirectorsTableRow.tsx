/** @jsx jsx */
import React, {Dispatch, useContext} from 'react'
import { css, jsx } from '@emotion/react'
import numeral from 'numeral'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

// types
import {DirectorsContext, DirectorsUIRow} from './DirectorsContext'
import {NiFrontendContext} from '../../../services/NiFrontendContext'

const mq = [`@media (max-width: ${760}px)`]

const selectCatCellStyle = css({[mq[0]]: {':before': { content: `"Select NI category letter"` }}})
const grossPayCellStyle = css({[mq[0]]: {':before': { content: `"Enter gross pay"` }}})
const employeeCellStyle = css({[mq[0]]: {':before': { content: `"Employee"` }}})
const employerCellStyle = css({[mq[0]]: {':before': { content: `"Employer"` }}})
const totalCellStyle = css({[mq[0]]: {':before': { content: `"Total"` }}})

interface TableRowProps {
  row: DirectorsUIRow
  index: number
  printView: boolean
  showBands: boolean
  setShowExplanation: Dispatch<string>
  showExplanation?: string
}

function DirectorsTableRow(props: TableRowProps) {
  const { row, index, printView, showBands, showExplanation, setShowExplanation } = props
  const {
    categories,
    errors,
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    setResult,
    result
  } = useContext(DirectorsContext)

  const { config } = useContext(NiFrontendContext)

  const handleGrossChange = (r: DirectorsUIRow, e: React.ChangeEvent<HTMLInputElement>) => {
    invalidateResults()
    setRows(rows.map((cur: DirectorsUIRow) =>
      cur.id === r.id ? {...cur, gross: e.currentTarget.value} : cur
    ))
  }

  const handleSelectChange = (r: DirectorsUIRow, e: React.ChangeEvent<HTMLSelectElement>) => {
    invalidateResults()
    setRows(rows.map((cur: DirectorsUIRow) =>
      cur.id === r.id ? {...cur, [e.currentTarget.name]: e.currentTarget.value} : cur
    ))
  }

  const invalidateResults = () => {
    setResult(null)
  }

  return (
    <tr
      id={row.id}
      className={activeRowId === row.id ? "active" : ""}
      onClick={() => setActiveRowId(row.id)}
    >
      <td className="input" css={selectCatCellStyle}>
        {printView ?
          <div>{row.category}</div>
          :
          <React.Fragment>
            <label className="govuk-visually-hidden" htmlFor={`row${index}-category`}>Category</label>
            <select name="category" value={row.category} onChange={(e) => handleSelectChange?.(row, e)} className="borderless" id={`row${index}-category`}>
              {categories.map((c: string, i: number) => (
                <option key={i} value={c}>
                  {`${c}${config.categoryNames[c] ? ` - ${config.categoryNames[c]}` : ``}`}
                </option>
              ))}
            </select>
          </React.Fragment>
        }
      </td>

      {/* Gross Pay */}
      <td className={
        `input ${errors?.[`${row.id}-gross`] ? "error-cell" : ""}`}
        css={grossPayCellStyle}
      >
        {printView ?
          <div>{row.gross}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-gross`}
            labelText="Gross pay"
            inputClassName="gross-pay"
            inputValue={row.gross}
            placeholderText="Enter the gross pay amount"
            onChangeCallback={(e) => handleGrossChange?.(row, e)}
          />
        }
      </td>

      {/* Bands */}
      {showBands && row.bands && row.bands.map(k =>
        <td
          key={`${k.name}-val`}
          css={css({[mq[0]]: {':before': { content: `"${k.name}"` }}})}
        >
          {numeral(k.amountInBand).format('$0,0.00')}
        </td>
      )}

      {/* Total */}
      {showBands && row.bands &&
      // Total (if calculate has run)
      <td css={totalCellStyle}>
        {numeral(
          (row.ee + row.er).toString()
        ).format('$0,0.00')}
      </td>
      }

      {/* EE */}
      <td className="result-cell" css={employeeCellStyle}>{numeral(row.ee).format('$0,0.00')}</td>
      {/* ER */}
      <td className="result-cell" css={employerCellStyle}>{numeral(row.er).format('$0,0.00')}</td>
      {!printView && result && row.explain && row.explain.length > 0 &&
      <td>
        <a href={`#${row.id}-explain`} onClick={(e) => {
          e.preventDefault()
          setShowExplanation(showExplanation === row.id ? '' : row.id)
        }}>
          <strong
            className={`govuk-tag ${showExplanation === row.id ?
              `govuk-tag--blue` : `govuk-tag--grey`}`}
          >
            <span aria-hidden="true">?</span>
            <span className="govuk-visually-hidden">
                 Explain the results in this row
               </span>
          </strong>
        </a>
      </td>
      }
    </tr>
  )
}

export default DirectorsTableRow