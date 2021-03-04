import React, {useContext, useEffect, useState} from "react";
import {dateRangeString} from '../../../config'
import * as thStyles from '../../../services/mobileHeadingStyles'

// types
import {Class3Context} from "./Class3Context";
import {Class3Row, GovDateRange, TaxYear} from "../../../interfaces";

// components
import FullOrPartialTaxYear from "../../helpers/formhelpers/FullOrPartialTaxYear";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import TextInput from "../../helpers/formhelpers/TextInput";
import MqTableCell from '../shared/MqTableCell'

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
      delete row.actualWeeks
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
      aria-selected={activeRowId === row.id}
    >
      <MqTableCell cellStyle={thStyles.rowNumber} cellClassName="row-number">
        {index + 1}
      </MqTableCell>

      {!printView &&
        <td className={"mode"}>
          <SecondaryButton
            onClick={handleEdit}
            label={showDates ? `Select tax year` : `Edit dates`}
          />
        </td>
      }

      <MqTableCell
        cellStyle={thStyles.fromTo}
        cellClassName={`input date-toggles ${showDates ? "date-inputs" : ""}${errors?.[`${row.id}FromDay`] ? "error-cell" : ""}`}
      >
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
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.actualWeeks}>{row.actualWeeks}</MqTableCell>
    </tr>
  )
}

export default Class3TableRow
