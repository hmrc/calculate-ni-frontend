import React, {useContext} from 'react'
import numeral from 'numeral'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

// types
import {DirectorsContext, DirectorsRow} from './DirectorsContext'
import {NiFrontendContext} from '../../../services/NiFrontendContext'

interface TableRowProps {
  row: DirectorsRow
  index: number
  printView: boolean
  showBands: boolean
}

function DirectorsTableRow(props: TableRowProps) {
  const { row, index, printView, showBands } = props
  const {
    categories,
    errors,
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    setResult
  } = useContext(DirectorsContext)

  const { config } = useContext(NiFrontendContext)

  const handleGrossChange = (r: DirectorsRow, e: React.ChangeEvent<HTMLInputElement>) => {
    invalidateResults()
    setRows(rows.map((cur: DirectorsRow) =>
      cur.id === r.id ? {...cur, gross: e.currentTarget.value} : cur
    ))
  }

  const handleSelectChange = (r: DirectorsRow, e: React.ChangeEvent<HTMLSelectElement>) => {
    invalidateResults()
    setRows(rows.map((cur: DirectorsRow) =>
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
      <td className="input">
        {printView ?
          <div>{row.category}</div>
          :
          <>
            <label className="govuk-visually-hidden" htmlFor={`row${index}-category`}>Category</label>
            <select name="category" value={row.category} onChange={(e) => handleSelectChange?.(row, e)} className="borderless" id={`row${index}-category`}>
              {categories.map((c: string, i: number) => (
                <option key={i} value={c}>
                  {`${c}${config.categoryNames[c] ? ` - ${config.categoryNames[c]}` : ``}`}
                </option>
              ))}
            </select>
          </>
        }
      </td>

      {/* Gross Pay */}
      <td className={
        `input ${errors?.[`${row.id}-gross`] ? "error-cell" : ""}`}>
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
        <td key={`${k.name}-val`}>{numeral(k.amountInBand).format('$0,0.00')}</td>
      )}

      {/* Total */}
      {showBands && row.bands &&
      // Total (if calculate has run)
      <td>
        {numeral(
          (row.ee + row.er).toString()
        ).format('$0,0.00')}
      </td>
      }

      {/* EE */}
      <td className="result-cell">{numeral(row.ee).format('$0,0.00')}</td>
      {/* ER */}
      <td className="result-cell">{numeral(row.er).format('$0,0.00')}</td>
    </tr>
  )
}

export default DirectorsTableRow