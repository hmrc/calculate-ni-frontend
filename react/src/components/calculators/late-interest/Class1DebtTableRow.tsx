import React, {useContext, useEffect, useState} from 'react'
import * as thStyles from '../../../services/mobileHeadingStyles'

// components
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear';
import TextInput from '../../helpers/formhelpers/TextInput'

// types
import {Class1DebtRow, TaxYear} from '../../../interfaces'
import {LateInterestContext} from './LateInterestContext'
import {taxYearString} from '../../../config'
import MqTableCell from '../shared/MqTableCell'
import TableRow from "../shared/TableRow";
import {sterlingStringValue} from "../../../services/utils";

function Class1DebtTableRow(props: {
  row: Class1DebtRow,
  index: number,
  printView: boolean
}) {
  const {row, index, printView} = props
  const [taxYear, setTaxYear] = useState<TaxYear | undefined>(row.taxYear)
  const {
    rows,
    taxYears,
    setRows,
    errors,
    activeRowId,
    setActiveRowId,
    setResults
  } = useContext(LateInterestContext)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    invalidateResults()
    const selectedTaxYear = taxYears.find((ty:TaxYear) => ty.id === e.currentTarget.value)
    if(selectedTaxYear) {
      setTaxYear(selectedTaxYear)
    }
  }

  useEffect(() => {
    setRows((prevState: Class1DebtRow[]) => prevState.map((cur: Class1DebtRow) =>
      cur.id === row.id ? {...cur, taxYear: taxYear} : cur
    ))
  }, [taxYear, setRows, row.id])

  useEffect(() => {
    if(taxYears && !row.taxYear) {
      setTaxYear(taxYears[0])
    }
  }, [taxYears, row.taxYear])

  const handleChange = (row: Class1DebtRow, e:  React.ChangeEvent<HTMLInputElement>) => {
    invalidateResults()
    setRows(rows.map((cur: Class1DebtRow) =>
      cur.id === row.id ? {...cur, debt: e.currentTarget.value} : cur
    ))
  }

  const invalidateResults = () => {
    setResults(null)
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

      <MqTableCell cellStyle={thStyles.taxYear} cellClassName="input">
        {printView ?
          <div>{row.taxYear && taxYearString(row.taxYear, true)}</div>
          :
          <SelectTaxYear
            borderless={true}
            hiddenLabel={true}
            taxYears={taxYears}
            taxYear={row.taxYear}
            handleTaxYearChange={handleTaxYearChange}
          />
        }
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.classOneDebt} cellClassName={`input${errors[`${row.id}-class1-debt`] ? ` error-cell` : ``}`}>
        {printView ?
          <div>{row.debt}</div>
          :
          <TextInput
            labelText="Enter Class 1 debt"
            hiddenLabel={true}
            name={`${row.id}-class1-debt`}
            inputClassName="number"
            inputValue={row.debt}
            onChangeCallback={(e) => handleChange?.(row, e)}
            error={errors[`${row.id}-class1-debt`]}
          />
        }
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.interestDue}>
        {row.interestDue ? sterlingStringValue(row.interestDue) : ''}
      </MqTableCell>
    </TableRow>
  )
}

export default Class1DebtTableRow