import React, {Dispatch, useContext} from 'react'
import numeral from 'numeral'
import * as thStyles from '../../../services/mobileHeadingStyles'

// components
import TextInput from '../../helpers/formhelpers/TextInput'

// types
import {DirectorsContext, DirectorsUIRow} from './DirectorsContext'
import {NiFrontendContext} from '../../../services/NiFrontendContext'
import MqTableCell from '../shared/MqTableCell'
import ExplainToggle from "../shared/ExplainToggle";
import TableRow from "../shared/TableRow";

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
    result && setResult(null)
  }

  return (
    <TableRow
      row={row}
      rows={rows}
      index={index}
      activeRowId={activeRowId}
      setActiveRowId={setActiveRowId}
    >

      <MqTableCell cellStyle={thStyles.rowNumber}>
        {index + 1}
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.selectNICategoryLetter} cellClassName="input">
        {printView ?
          <div>{row.category}</div>
          :
          <>
            <label className="govuk-visually-hidden" htmlFor={`row${index}-category`}>Category for row number {index + 1}</label>
            <select name="category" value={row.category} onChange={(e) => handleSelectChange?.(row, e)} className="borderless" id={`row${index}-category`}>
              {categories.map((c: string, i: number) => (
                <option key={i} value={c}>
                  {`${c}${config.categoryNames[c] ? ` - ${config.categoryNames[c]}` : ``}`}
                </option>
              ))}
            </select>
          </>
        }
      </MqTableCell>

      {/* Gross Pay */}
      <MqTableCell
        cellClassName={`input ${errors?.[`${row.id}-gross`] ? "error-cell" : ""}`}
        cellStyle={thStyles.enterGrossPay}
      >
        {printView ?
          <div>{row.gross}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-gross`}
            labelText={`Gross pay for row number ${index + 1}`}
            inputClassName="gross-pay"
            inputValue={row.gross}
            onChangeCallback={(e) => handleGrossChange?.(row, e)}
            error={errors[`${row.id}-gross`]}
          />
        }
      </MqTableCell>


      {/* Bands */}
      {showBands && row.bands && row.bands.map(k =>
        <MqTableCell
          key={`${k.name}-val`}
          cellStyle={thStyles.dynamicCellContentAttr(k.name)}
        >
          {numeral(k.amountInBand).format('$0,0.00')}
        </MqTableCell>
      )}

      {/* Total */}
      {showBands && row.bands &&
      // Total (if calculate has run)
      <MqTableCell cellStyle={thStyles.total}>
        {numeral(
          (row.ee + row.er).toString()
        ).format('$0,0.00')}
      </MqTableCell>
      }

      {/* EE */}
      <MqTableCell cellClassName="result-cell" cellStyle={thStyles.employee}>{numeral(row.ee).format('$0,0.00')}</MqTableCell>
      {/* ER */}
      <MqTableCell cellClassName="result-cell" cellStyle={thStyles.employer}>{numeral(row.er).format('$0,0.00')}</MqTableCell>
      {!printView && result && row.explain && row.explain.length > 0 &&
      <td>
        <ExplainToggle
          id={row.id}
          showExplanation={showExplanation}
          setShowExplanation={setShowExplanation}
        />
      </td>
      }
    </TableRow>
  )
}

export default DirectorsTableRow
