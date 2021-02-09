import React, {useContext} from 'react'

// components
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear';
import TextInput from '../../helpers/formhelpers/TextInput'

// types
import {Class1DebtRow, TaxYear} from '../../../interfaces'
import {LateInterestContext} from './LateInterestContext'
import {extractFromDateString, extractToDateString, taxYearString} from '../../../config'

function Class1DebtTableRow(props: {
  row: Class1DebtRow,
  taxYears: TaxYear[]
  index: number,
  printView: boolean
}) {
  const {row, taxYears, index, printView} = props
  const {
    rows,
    setRows,
    errors,
    activeRowId,
    setActiveRowId,
    setResults
  } = useContext(LateInterestContext)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    invalidateResults()
    const ty = e.currentTarget.value

    const tYObject: TaxYear = {
      id: ty,
      from: new Date(extractFromDateString(ty)),
      to: new Date(extractToDateString(ty))
    }

    setRows(rows.map((cur: Class1DebtRow) =>
      cur.id === row.id ? {...cur, taxYear: tYObject} : cur
    ))
  }

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
    <tr
      key={row.id}
      className={activeRowId === row.id ? "active" : ""}
      id={row.id}
      onClick={() => setActiveRowId(row.id)}
    >
      <td className="row-number">
        {index + 1}
      </td>
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
      <td className={`input${errors[`${row.id}-class1-debt`] ? ` error-cell` : ``}`}>
        {printView ?
          <div>{row.debt}</div>
          :
          <TextInput
            labelText="Enter Class 1 debt"
            hiddenLabel={true}
            name={`${row.id}-class1-debt`}
            inputClassName="number"
            inputValue={row.debt}
            placeholderText="Enter the Class 1 debt"
            onChangeCallback={(e) => handleChange?.(row, e)}
          />
        }
      </td>
      <td>{row.interestDue}</td>
    </tr>
  )
}

export default Class1DebtTableRow