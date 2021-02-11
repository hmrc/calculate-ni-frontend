import React, {Dispatch, useContext, useEffect} from "react"
import {periods, PeriodValue, periodValueToLabel} from "../../../config";
import TextInput from "../../helpers/formhelpers/TextInput";
import numeral from "numeral";
import {ClassOneContext, Row} from "./ClassOneContext";
import {NiFrontendContext} from "../../../services/NiFrontendContext";

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
      ...cur, category: categories[0]
    } : cur)
    ))
  }, [categories])

  return (
    <tr
      className={activeRowId === row.id ? "active" : ""}
      id={row.id}
      onClick={() => setActiveRowId(row.id)}
    >
      <td className="row-number">
        {index + 1}
      </td>
      <td className="input">
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
      </td>

      <td>
        {row.number}
      </td>

      {/* Category */}
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
          <>
            <TextInput
              hiddenLabel={true}
              name={`${row.id}-gross`}
              labelText="Gross pay"
              inputClassName="gross-pay"
              inputValue={row.gross}
              placeholderText="Enter the gross pay amount"
              onChangeCallback={(e) => handleChange?.(row, e)}
            />
          </>
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

      <td className="result-cell">{numeral(row.ee).format('$0,0.00')}</td>
      <td className="result-cell">{numeral(row.er).format('$0,0.00')}</td>
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