import React, {Dispatch, useContext, useEffect} from "react"
import {periods, PeriodValue, periodValueToLabel} from "../../../config";
import numeral from "numeral";
import * as thStyles from '../../../services/mobileHeadingStyles'

// types
import {ClassOneContext, Row} from "./ClassOneContext";

// components
import TextInput from "../../helpers/formhelpers/TextInput"
import MqTableCell from '../shared/MqTableCell'
import ExplainToggle from "../shared/ExplainToggle"
import TableRow from "../shared/TableRow"
import uniqid from "uniqid";
import {getBandValue, getContributionBandValue} from "../../../services/utils";

interface TableRowProps {
  row: Row
  index: number
  showBands: boolean
  printView: boolean
  setShowExplanation: Dispatch<string>
  showExplanation?: string
  contributionNames: string[]
  bandNames?: string[]
}

export default function Class1TableRow(props: TableRowProps) {
  const { row, index, showBands, printView, setShowExplanation, showExplanation, bandNames, contributionNames } = props
  const {
    activeRowId,
    setActiveRowId,
    rows,
    setRows,
    errors,
    categories,
    setPeriodNumbers,
    result,
    setResult,
    categoryNames
  } = useContext(ClassOneContext)

  const handleChange = (r: Row, e: React.ChangeEvent<HTMLInputElement>) => {
    invalidateResults()
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

  const createPastedRow = (val: string) => {
    return {
      id: uniqid(),
      category: row.category,
      number: row.number,
      period: row.period,
      gross: val,
      ee: row.ee,
      er: row.er
    }
  }

  const splitPastedCellsToArray = (pastedText: string) => {
    return pastedText.replace(/"((?:[^"]*(?:\r\n|\n\r|\n|\r))+[^"]+)"/mg, function (match, p1) {
      return p1
        .replace(/""/g, '"')
        .replace(/\r\n|\n\r|\n|\r/g, ' ')
    })
    .split(/\r\n|\n\r|\n|\r/g)
    .filter(l => l.length > 0)
  }

  const handlePaste = (e: React.ClipboardEvent, r: Row) => {
    const clipboardData = e.clipboardData
    const pastedText = clipboardData.getData("Text") || clipboardData.getData("text/plain");
    if (!pastedText && pastedText.length) {
      return;
    }
    const cellValues = splitPastedCellsToArray((pastedText))
    const activeRowIndex = rows.findIndex((r: Row) => r.id === row.id)
    const remainingPastedRows = cellValues.map(val => (createPastedRow(val)))
    setRows([
      ...rows.slice(0, activeRowIndex),
      ...remainingPastedRows,
      ...rows.slice(activeRowIndex + 1)
    ])
    setActiveRowId(remainingPastedRows[0].id)
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

      <MqTableCell cellStyle={thStyles.selectPeriod} cellClassName="input">
        {printView ?
          <div>{periodValueToLabel(row.period)}</div>
          :
          <>
            <label className="govuk-visually-hidden" htmlFor={`row${index}-period`}>Period for row number {index + 1}</label>
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
            <label className="govuk-visually-hidden" htmlFor={`row${index}-category`}>NI category for row number {index + 1}</label>
            <select name="category" value={row.category} onChange={(e) => handleSelectChange?.(row, e)} className="borderless" id={`row${index}-category`}>
              {categories.map((c: string, i: number) => (
                <option key={i} value={c}>
                  {`${c}${categoryNames[c] ? ` - ${categoryNames[c]}` : ``}`}
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
          <div>£{row.gross}</div>
          :
          <React.Fragment>
            <TextInput
              hiddenLabel={true}
              name={`${row.id}-gross`}
              labelText={`Gross pay for row number ${index + 1}`}
              inputClassName="gross-pay"
              inputValue={row.gross}
              onChangeCallback={(e) => handleChange?.(row, e)}
              error={errors[`${row.id}-gross`]}
              onPaste={(e: React.ClipboardEvent) => handlePaste(e, row)}
            />
          </React.Fragment>
        }
      </MqTableCell>

      {/* Bands */}
      {showBands && bandNames?.map(k =>
        <MqTableCell
          cellStyle={thStyles.dynamicCellContentAttr(k)}
          key={`${k}-val`}
        >
          {getBandValue(row.bands, k)}
        </MqTableCell>
      )}

      {/* Total */}
      {printView &&
        // Total (if calculate has run)
        <MqTableCell cellStyle={thStyles.total}>
          {numeral(
            (row.ee + row.er).toString()
          ).format('$0,0.00')}

        </MqTableCell>
      }

      <MqTableCell cellClassName="result-cell" cellStyle={thStyles.employee}>{numeral(row.ee).format('$0,0.00')}</MqTableCell>
      <MqTableCell cellClassName="result-cell" cellStyle={thStyles.employer}>{numeral(row.er).format('$0,0.00')}</MqTableCell>

      {printView && contributionNames && contributionNames?.map((cB: string) =>
        <MqTableCell
          cellStyle={thStyles.dynamicCellContentAttr(cB)}
          key={`${cB}-val`}
        >
          {getContributionBandValue(row.contributionBands, cB)}
        </MqTableCell>
      )}

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
