import React, {useContext, useEffect, useState} from 'react'
import * as thStyles from '../../../services/mobileHeadingStyles'

import {extractFromDateString, extractToDateString, taxYearFromString, taxYearString} from '../../../config'

// types
import {TaxYear} from '../../../interfaces'
import {LateRefundsContext, LateRefundsTableRowProps} from './LateRefundsContext'

// components
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear'
import TextInput from '../../helpers/formhelpers/TextInput'
import MqTableCell from '../shared/MqTableCell'
import TableRow from "../shared/TableRow";
import DateInputs from "../../helpers/formhelpers/DateInputs";
import {DateParts, extractDatePartString, getNumberOfWeeks, validDateParts} from "../../../services/utils";

function LateRefundsTableRow(props: {
  row: LateRefundsTableRowProps,
  index: number,
  printView: boolean
}) {
  const { index, row, printView } = props
  const {
    taxYears,
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    errors,
    setResults,
    results
  } = useContext(LateRefundsContext)
  const [taxYear, setTaxYear] = useState<TaxYear | null>()
  const [day, setDay] = useState(extractDatePartString(DateParts.DAY, row.paymentDate))
  const [month, setMonth] = useState(extractDatePartString(DateParts.MONTH, row.paymentDate))
  const [year, setYear] = useState(extractDatePartString(DateParts.YEAR, row.paymentDate))

  useEffect(() => {
    if(taxYears) {
      setTaxYear(taxYears[0])
    }
  }, [taxYears])

  useEffect(() => {
    setRows(rows.map((cur: LateRefundsTableRowProps) =>
      cur.id === row.id ? {...cur, taxYear: taxYear} : cur
    ))
  }, [taxYear, row.id])

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    invalidateResults()
    setTaxYear(taxYears.find(ty => ty.id === e.currentTarget.value))
  }

  const handleChange = (row: LateRefundsTableRowProps, e:  React.ChangeEvent<HTMLInputElement>) => {
    invalidateResults()
    setRows(rows.map((cur: LateRefundsTableRowProps) =>
      cur.id === row.id ? {...cur, refund: e.currentTarget.value} : cur
    ))
  }

  const invalidateResults = () => {
    results && setResults(null)
  }

  useEffect(() => {
    const newDate = validDateParts(day, month, year) ?
      new Date(`${year}-${month}-${day}`) : null
    setRows(rows.map((cur: LateRefundsTableRowProps) =>
      cur.id === row.id ? {...cur, paymentDate: newDate} : cur
    ))
  }, [day, month, year, setRows])

  return (
    <TableRow
      row={row}
      rows={rows}
      index={index}
      activeRowId={activeRowId}
      setActiveRowId={setActiveRowId}
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
        <DateInputs
          description={`${row.id}-paymentDate`}
          legend="Payment date"
          day={day}
          month={month}
          year={year}
          setDay={setDay}
          setMonth={setMonth}
          setYear={setYear}
          error={errors[`${row.id}-paymentDateDay`]}
        />
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
            onChangeCallback={(e) => handleChange?.(row, e)}
            error={errors[`${row.id}-refund`]}
          />
        }
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.payable}>
        {row.payable}
      </MqTableCell>
    </TableRow>
  )
}

export default LateRefundsTableRow
