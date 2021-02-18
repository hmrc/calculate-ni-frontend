import React, {Dispatch, useContext, useEffect} from "react"
import {periods, PeriodValue, periodValueToLabel} from "../../../config";
import numeral from "numeral";
import * as thStyles from '../../../services/mobileHeadingStyles'

// types
import {ClassOneContext, Row} from "./ClassOneContext";
import {NiFrontendContext} from "../../../services/NiFrontendContext";

// components
import TextInput from "../../helpers/formhelpers/TextInput";
import MqTableCell from '../shared/MqTableCell'

interface TableRowProps {
  row: Row
  index: number
  showBands: boolean
  printView: boolean
  setShowExplanation: Dispatch<string>
  showExplanation?: string
}

export default function Class1TableRow(props: TableRowProps) {
  const { row, index, showBands, printView, setShowExplanation, showExplanation } = props
  const {
    activeRowId,
    setActiveRowId,
    rows,
    setRows,
    errors,
    categories,
    setPeriodNumbers,
    result,
    setResult
  } = useContext(ClassOneContext)

  const { config } = useContext(NiFrontendContext)

  const handleChange = (r: Row, e: React.ChangeEvent<HTMLInputElement>) => {
    invalidateResults()
    setActiveRowId(r.id)
    setRows(rows.map((cur: Row) =>
      cur.id === r.id ?
        {...cur, [`${e.currentTarget.name.split('-')[1]}`]: e.currentTarget.value}
        :
        cur
    ))
  }

  const handleSelectChange = (r: Row, e: React.ChangeEvent<HTMLSelectElement>) => {
    setRows(rows.map((cur: Row) =>
      cur.id === r.id ? {...cur, [e.currentTarget.name]: e.currentTarget.value} : cur
    ))
  }

  const periodCallBack = () => {
    setPeriodNumbers()
  }

  const invalidateResults = () => {
    setResult(null)
  }

  useEffect(periodCallBack, [row.period])

  useEffect(() => {
    setRows(rows.map((cur: Row) =>
      (cur.id === row.id ? {
        ...cur,
        category: categories.includes(cur.category) ? cur.category : categories[0]
      } : cur)
    ))
  }, [categories])

  return (
    <tr
      className={activeRowId === row.id ? "active" : ""}
      id={row.id}
      onClick={() => setActiveRowId(row.id)}
    >

      <MqTableCell cellStyle={thStyles.rowNumber}>
        {index + 1}
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.selectPeriod}>
        {printView ?
          <div>{periodValueToLabel(row.period)}</div>
          :
          <>
            <label className="govuk-visually-hidden" htmlFor={`row${index}-period`}>Period</label>
            <select
              name="period"
              value={row.period}
              onChange={(e) => handleSelectChange?.(row, e)}
              className="borderless" id={`row${index}-period`}
            >
              {periods.map((p: PeriodValue, i) => (
                <option key={i} value={p}>{periodValueToLabel(p)}</option>
              ))}
            </select>
          </>

        }
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.periodNumber}>
        {row.number}
      </MqTableCell>


      {/* Category */}
      <MqTableCell cellStyle={thStyles.selectNICategoryLetter} cellClassName="input">
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

      </MqTableCell>

      {/* Gross Pay */}
      <MqTableCell
        cellStyle={thStyles.enterGrossPay}
        cellClassName={`input ${errors?.[`${row.id}-gross`] ? "error-cell" : ""}`}
      >
        {printView ?
          <div>{row.gross}</div>
          :
          <React.Fragment>
            <TextInput
              hiddenLabel={true}
              name={`${row.id}-gross`}
              labelText="Gross pay"
              inputClassName="gross-pay"
              inputValue={row.gross}
              placeholderText="Enter the gross pay amount"
              onChangeCallback={(e) => handleChange?.(row, e)}
            />
          </React.Fragment>
        }
      </MqTableCell>

      {/* Bands */}
      {showBands && row.bands && row.bands.map(k =>
        <MqTableCell
          cellStyle={thStyles.dynamicCellContentAttr(k.name)}
          key={`${k.name}-val`}
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

      <MqTableCell cellClassName="result-cell" cellStyle={thStyles.employee}>{numeral(row.ee).format('$0,0.00')}</MqTableCell>
      <MqTableCell cellClassName="result-cell" cellStyle={thStyles.employer}>{numeral(row.er).format('$0,0.00')}</MqTableCell>

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