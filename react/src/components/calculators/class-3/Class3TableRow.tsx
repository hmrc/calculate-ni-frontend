import {Class3Row, GovDateRange, TaxYear} from "../../../interfaces";
import React, {useContext, useEffect, useState} from "react";
import TextInput from "../../helpers/formhelpers/TextInput";
import {Class3Context} from "./Class3Context";
import FullOrPartialTaxYear from "../../helpers/formhelpers/FullOrPartialTaxYear";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import {dateRangeString} from '../../../config'

const Class3TableRow = (props: {
  index: number,
  row: Class3Row
  printView: boolean
}) => {
  const { index, row, printView } = props
  const {
    taxYears,
    setRows,
    rows,
    errors,
    activeRowId,
    setActiveRowId
  } = useContext(Class3Context)
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])
  const initDateRange = row.dateRange?.from ? row.dateRange : {from: taxYear?.from, to: taxYear?.to}
  const [dateRange, setDateRange] = useState<GovDateRange>(initDateRange)
  const [showDates, setShowDates] = useState<boolean>(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowDates(!showDates)
  }

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    invalidateTotals()
    const newTaxYear = taxYears.find(ty => ty.id === e.target.value) || taxYears[0]
    setTaxYear(newTaxYear)
  }

  const handleChange = (r: Class3Row, e: React.ChangeEvent<HTMLInputElement>) => {
    invalidateTotals()
    setRows(rows.map((cur: Class3Row) =>
      cur.id === r.id ?
        {...cur, [`${e.currentTarget.name.split('-')[1]}`]: e.currentTarget.value}
        :
        cur
    ))
  }

  const invalidateTotals = () => {
    setRows(prevState => prevState.map(row => {
      delete row.maxWeeks
      delete row.actualWeeks
      delete row.deficiency
      return row
    }))
  }

  useEffect(() => {
    if(taxYear?.from) {
      setDateRange({from: taxYear.from, to: taxYear.to})
    }
  }, [taxYear])

  useEffect(() => {
    if(dateRange) {
      setRows((prevState: Array<Class3Row>) => prevState
        .map(
          (cur: Class3Row) =>
            cur.id === row.id ? {...cur, dateRange: dateRange} : cur
        )
      )
    }

  }, [dateRange, row.id, setRows])



  return (
    <tr
      className={activeRowId === row.id ? "active" : ""}
      id={row.id}
      onClick={() => setActiveRowId(row.id)}
    >
      <td className="row-number">
        {index + 1}
      </td>
      {!printView &&
        <td className={"mode"}>
          <SecondaryButton
            onClick={handleEdit}
            label={showDates ? `Select tax year` : `Edit dates`}
          />
        </td>
      }
      <td className={
          `input date-toggles ${errors?.[`${row.id}FromDay`] ? "error-cell" : ""}`}>
        {printView ?
          <div>{dateRangeString(dateRange)}</div>
          :
          <FullOrPartialTaxYear
            id={row.id}
            hiddenLabel={true}
            taxYears={taxYears}
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            handleTaxYearChange={handleTaxYearChange}
            dateRange={dateRange}
            setDateRange={setDateRange}
            errors={errors}
            showDates={showDates}
          />
        }

      </td>
      <td className={`input${errors[`${row.id}-earningsFactor`] ? ` error-cell` : ``}`}>
        {printView ?
          <div>{row.earningsFactor}</div>
          :
          <TextInput
            hiddenLabel={true}
            name={`${row.id}-earningsFactor`}
            labelText="earnings"
            inputValue={row.earningsFactor}
            inputClassName="number"
            onChangeCallback={(e) => handleChange(row, e)}
          />
        }
      </td>
      <td>{row.maxWeeks}</td>
      <td>{row.actualWeeks}</td>
      <td>{row.deficiency}</td>
    </tr>
  )
}

export default Class3TableRow
