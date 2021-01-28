import React, {useContext} from 'react'
import {extractFromDateString, extractToDateString, taxYearFromString, taxYearString} from '../../../config'

// types
import {LateRefundsTableRowProps, TaxYear} from '../../../interfaces'
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear'
import {LateRefundsContext} from './LateRefundsContext'
import TextInput from '../../helpers/formhelpers/TextInput'

function LateRefundsTableRow(props: {
  row: LateRefundsTableRowProps,
  index: number,
  printView: boolean,
  taxYears: TaxYear[]
}) {
  const {
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    errors
  } = useContext(LateRefundsContext)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ty = e.currentTarget.value

    const tYObject: TaxYear = {
      id: ty,
      from: new Date(extractFromDateString(ty)),
      to: new Date(extractToDateString(ty))
    }

    setRows(rows.map((cur: LateRefundsTableRowProps) =>
      cur.id === row.id ? {...cur, taxYear: tYObject} : cur
    ))
  }

  const handleChange = (row: LateRefundsTableRowProps, e:  React.ChangeEvent<HTMLInputElement>) => {
    setRows(rows.map((cur: LateRefundsTableRowProps) =>
      cur.id === row.id ? {...cur, refund: e.currentTarget.value} : cur
    ))
  }

  const { index, row, printView, taxYears } = props
  return (
    <tr
      key={row.id}
      className={activeRowId === row.id ? "active" : ""}
      id={row.id}
      onClick={() => setActiveRowId(row.id)}
    >
      <td>{index + 1}</td>
      <td className="input">
        {printView ?
          <div>{taxYearString(row.taxYear, true)}</div>
          :
          <SelectTaxYear
            borderless={true}
            hiddenLabel={true}
            taxYears={taxYears}
            taxYear={row.taxYear}
            handleTaxYearChange={handleTaxYearChange}
            onlyStartYear={true}
          />
        }
      </td>
      <td>{taxYearFromString(row.taxYear)}</td>
      <td className={`input${errors[`${row.id}-refund`] ? ` error-cell` : ``}`}>
        {printView ?
          <div>{row.refund}</div>
          :
          <TextInput
            labelText="Enter refund amount"
            hiddenLabel={true}
            name={`${row.id}-refund`}
            inputClassName="number"
            inputValue={row.refund}
            placeholderText="Enter the refund amount"
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </td>
      <td>{row.payable}</td>
    </tr>

  )
}

export default LateRefundsTableRow