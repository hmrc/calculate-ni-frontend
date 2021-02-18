import React, {useContext} from 'react'
import * as thStyles from '../../../services/mobileHeadingStyles'

import {extractFromDateString, extractToDateString, taxYearFromString, taxYearString} from '../../../config'

// types
import {LateRefundsTableRowProps, TaxYear} from '../../../interfaces'
import {LateRefundsContext} from './LateRefundsContext'

// components
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear'
import TextInput from '../../helpers/formhelpers/TextInput'
import MqTableCell from '../shared/MqTableCell'

function LateRefundsTableRow(props: {
  row: LateRefundsTableRowProps,
  index: number,
  printView: boolean
}) {
  const {
    taxYears,
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    errors,
    setResults
  } = useContext(LateRefundsContext)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    invalidateResults()
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
    invalidateResults()
    setRows(rows.map((cur: LateRefundsTableRowProps) =>
      cur.id === row.id ? {...cur, refund: e.currentTarget.value} : cur
    ))
  }

  const invalidateResults = () => {
    setResults(null)
  }

  const { index, row, printView } = props
  return (
    <tr
      className={activeRowId === row.id ? "active" : ""}
      id={row.id}
      onClick={() => setActiveRowId(row.id)}
    >
      <MqTableCell cellStyle={thStyles.rowNumber}>{index + 1}</MqTableCell>

      <MqTableCell cellClassName="input" cellStyle={thStyles.from}>
        {printView ?
          <div>{row.taxYear && taxYearString(row.taxYear, true)}</div>
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
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.date}>
        {row.taxYear && taxYearFromString(row.taxYear)}
      </MqTableCell>

      <MqTableCell cellClassName={`input${errors[`${row.id}-refund`] ? ` error-cell` : ``}`} cellStyle={thStyles.refund}>
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
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.payable}>
        {row.payable}
      </MqTableCell>
    </tr>

  )
}

export default LateRefundsTableRow