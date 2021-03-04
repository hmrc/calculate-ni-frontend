import MqTableCell from "../shared/MqTableCell";
import * as thStyles from "../../../services/mobileHeadingStyles";
import TextInput from "../../helpers/formhelpers/TextInput";
import numeral from "numeral";
import React, {useContext} from "react";
import {
  BandAmount,
  UnofficialDefermentContext,
  UnofficialDefermentInputRow
} from "./UnofficialDefermentContext";
import TableRow from "../shared/TableRow";

const UnofficialDefermentTableRow = (props: {
  row: UnofficialDefermentInputRow,
  printView: boolean,
  i: number
}) => {
  const { row, printView, i } = props
  const {
    activeRowId,
    setActiveRowId,
    setRows,
    rows,
    categories,
    setResults
  } = useContext(UnofficialDefermentContext)

  const handleBandChange = (r: UnofficialDefermentInputRow, band: BandAmount) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveRowId(r.id)
    setResults(null)
    setRows(rows.map((row: UnofficialDefermentInputRow) =>
      row.id === r.id ?
        {
          ...row,
          bands: row.bands.map(b => b.label === band.label ? {...b, amount: parseInt(e.currentTarget.value)} : b)
        }
        :
        row
    ))
  }

  const handleChange = (r: UnofficialDefermentInputRow, e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveRowId(r.id)
    setResults(null)
    setRows(rows.map((cur: UnofficialDefermentInputRow) =>
      cur.id === r.id ?
        {...cur, [`${e.currentTarget.name.split('-')[1]}`]: e.currentTarget.value}
        :
        cur
    ))
  }

  const handleSelectChange = (r: UnofficialDefermentInputRow, e: React.ChangeEvent<HTMLSelectElement>) => {
    setRows(rows.map((cur: UnofficialDefermentInputRow) =>
      cur.id === r.id ? {...cur, [e.currentTarget.name]: e.currentTarget.value} : cur
    ))
  }

  return (
    <TableRow
      row={row}
      rows={rows}
      index={i}
      activeRowId={activeRowId}
      setActiveRowId={setActiveRowId}
    >
      <MqTableCell cellClassName="input" cellStyle={thStyles.nameEmployer}>
        {printView ?
          <div>{row.nameOfEmployer}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-nameOfEmployer`}
            labelText={`Name of employer for row number ${i + 1}`}
            inputClassName="gross-pay"
            inputValue={row.nameOfEmployer}
            onChangeCallback={(e) => handleChange(row, e)}
          />
        }
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.grossPay}>
        <div>{numeral(row.gross).format('$0,0.00')}</div>
      </MqTableCell>

      <MqTableCell cellClassName="input" cellStyle={thStyles.niCat}>
        {printView ?
          <div>{row.category}</div>
          :
          <>
            <label className="govuk-visually-hidden" htmlFor={`row${i}-category`}>Category for row number {i + 1}</label>
            <select name="category" value={row.category} onChange={(e) => handleSelectChange?.(row, e)} className="borderless" id={`row${i}-category`}>
              {categories.map((c: string, i: number) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </>
        }
      </MqTableCell>

      {row.bands && row.bands.map(band => (
        <MqTableCell key={`band-cell-${band.label}`} cellClassName="input" cellStyle={thStyles.lel}>
          {printView ?
            <div>{numeral(band.amount).format('$0,0.00')}</div>
            :
            <TextInput
              hiddenLabel={true}
              name={`${row.id}-${band.label}`}
              labelText={`${band.label} for row number ${i + 1}`}
              inputClassName="gross-pay"
              inputValue={band.amount}
              placeholderText=""
              onChangeCallback={handleBandChange(row, band)}
            />
          }
        </MqTableCell>
      ))}

      <MqTableCell cellClassName="input" cellStyle={thStyles.employeeNics}>
        {printView ?
          <div>{numeral(row.employeeNICs).format('$0,0.00')}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-employeeNICs`}
            labelText={`Employee NICS for row number ${i + 1}`}
            inputClassName=""
            inputValue={row.employeeNICs}
            placeholderText=""
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </MqTableCell>
      <MqTableCell cellStyle={thStyles.overUel}>{numeral(row.overUel).format('$0,0.00')}</MqTableCell>
      <MqTableCell cellStyle={thStyles.nicsNonCo}>{numeral(row.nicsNonCo).format('$0,0.00')}</MqTableCell>
      <MqTableCell cellStyle={thStyles.ifNotUd}>{numeral(row.ifNotUd).format('$0,0.00')}</MqTableCell>
    </TableRow>
  )
}

export default UnofficialDefermentTableRow
