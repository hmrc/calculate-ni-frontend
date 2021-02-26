import MqTableCell from "../shared/MqTableCell";
import * as thStyles from "../../../services/mobileHeadingStyles";
import TextInput from "../../helpers/formhelpers/TextInput";
import numeral from "numeral";
import React, {useContext} from "react";
import {UnofficialDefermentContext, UnofficialDefermentRow} from "./UnofficialDefermentContext";
import TableRow from "../shared/TableRow";

export default function UnofficialDefermentTableRow(props: {
  row: UnofficialDefermentRow,
  printView: boolean,
  i: number
}) {
  const { row, printView, i } = props
  const {
    activeRowId,
    setActiveRowId,
    earningsFields,
    setRows,
    rows,
    categories
  } = useContext(UnofficialDefermentContext)

  const handleChange = (r: UnofficialDefermentRow, e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveRowId(r.id)
    setRows(rows.map((cur: UnofficialDefermentRow) =>
      cur.id === r.id ?
        {...cur, [`${e.currentTarget.name.split('-')[1]}`]: e.currentTarget.value}
        :
        cur
    ))
  }

  const handleSelectChange = (r: UnofficialDefermentRow, e: React.ChangeEvent<HTMLSelectElement>) => {
    setRows(rows.map((cur: UnofficialDefermentRow) =>
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
            labelText="Name of employer"
            inputClassName="gross-pay"
            inputValue={row.nameOfEmployer}
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.grossPay}><div>{numeral(row.grossPay).format('$0,0.00')}</div></MqTableCell>

      <MqTableCell cellClassName="input" cellStyle={thStyles.niCat}>
        {printView ?
          <div>{row.category}</div>
          :
          <>
            <label className="govuk-visually-hidden" htmlFor={`row${i}-category`}>Category</label>
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

      <MqTableCell cellClassName="input" cellStyle={thStyles.lel}>
        {printView ?
          <div>{numeral(row.earnings1a).format('$0,0.00')}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-earnings1a`}
            labelText="LEL"
            inputClassName="gross-pay"
            inputValue={row.earnings1a}
            placeholderText=""
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </MqTableCell>

      <MqTableCell cellClassName="input" cellStyle={thStyles.lelPt}>
        {printView ?
          <div>{numeral(row.earnings1b).format('$0,0.00')}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-earnings1b`}
            labelText="LEL - PT"
            inputClassName="gross-pay"
            inputValue={row.earnings1b}
            placeholderText=""
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </MqTableCell>

      <MqTableCell cellClassName="input" cellStyle={thStyles.ptUel}>
        {printView ?
          <div>{numeral(row.earnings1c).format('$0,0.00')}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-earnings1c`}
            labelText="PT - UEL"
            inputClassName="gross-pay"
            inputValue={row.earnings1c}
            placeholderText=""
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </MqTableCell>

      {earningsFields['d'] &&
      <td className="input">
        {printView ?
          <div>{numeral(row.earnings1d).format('$0,0.00')}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-earnings1d`}
            labelText="LEL"
            inputClassName="gross-pay"
            inputValue={row.earnings1d ? row.earnings1d : '0'}
            placeholderText=""
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </td>
      }
      {earningsFields['e'] &&
      <td className="input">
        {printView ?
          <div>{numeral(row.earnings1e).format('$0,0.00')}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-earnings1e`}
            labelText="LEL"
            inputClassName="gross-pay"
            inputValue={row.earnings1e ? row.earnings1e : '0'}
            placeholderText=""
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </td>
      }
      {earningsFields['f'] &&
      <MqTableCell cellClassName="input" cellStyle={thStyles.employeeNics}>
        {printView ?
          <div>{numeral(row.earnings1f).format('$0,0.00')}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-earnings1f`}
            labelText="Employee NICS"
            inputClassName=""
            inputValue={row.earnings1f ? row.earnings1f : '0'}
            placeholderText=""
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </MqTableCell>
      }
      <MqTableCell cellStyle={thStyles.overUel}>{numeral(row.overUEL).format('$0,0.00')}</MqTableCell>
      <MqTableCell cellStyle={thStyles.nicsNonCo}>{numeral(row.NICsDueNonCO).format('$0,0.00')}</MqTableCell>
      <MqTableCell cellStyle={thStyles.ifNotUd}>{numeral(row.IfNotUD).format('$0,0.00')}</MqTableCell>
    </TableRow>
  )
}
