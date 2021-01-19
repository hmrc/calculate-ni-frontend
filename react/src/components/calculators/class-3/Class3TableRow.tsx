import {Class3Row, GovDateRange, TaxYear} from "../../../interfaces";
import React, {useContext, useEffect, useState} from "react";
import TextInput from "../../helpers/formhelpers/TextInput";
import {Class3Context} from "./Class3Context";
import FullOrPartialTaxYear from "../../helpers/formhelpers/FullOrPartialTaxYear";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import {getNumberOfWeeks, latestDate} from "../../../services/utils";

const Class3TableRow = (props: {
  index: number,
  row: Class3Row,
  taxYears: TaxYear[]
}) => {
  const { index, row, taxYears } = props
  const {
    setRows,
    rows,
    errors,
    enteredNiDate,
    activeRowId,
    setActiveRowId
  } = useContext(Class3Context)
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])
  const [dateRange, setDateRange] = useState<GovDateRange>({from: taxYear.from, to: taxYear.to})
  const [showDates, setShowDates] = useState<boolean>(false)
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowDates(!showDates)
  }
  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxYear(taxYears.find(ty => ty.id === e.target.value) || taxYears[0])
  }
  const handleChange = (r: Class3Row, e: React.ChangeEvent<HTMLInputElement>) => {
    setRows(rows.map((cur: Class3Row) =>
      cur.id === r.id ?
        {...cur, [`${e.currentTarget.name.split('-')[1]}`]: e.currentTarget.value}
        :
        cur
    ))
  }

  useEffect(() => {
    const startDate = enteredNiDate ?
      latestDate(taxYear.from, enteredNiDate) : taxYear.from
    setDateRange({
      from: startDate,
      to: taxYear.to,
      numberOfWeeks: getNumberOfWeeks(startDate, taxYear.to)
    })
  }, [taxYear, enteredNiDate])

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
      <td className={"mode"}>
        <SecondaryButton
          onClick={handleEdit}
          label={showDates ? `List` : `Manual`}
        />
      </td>
      <td className="input date-toggles">
        <FullOrPartialTaxYear
          id={row.id}
          hiddenLabel={true}
          taxYears={taxYears}
          taxYear={taxYear}
          handleTaxYearChange={handleTaxYearChange}
          dateRange={dateRange}
          setDateRange={setDateRange}
          errors={errors}
          showDates={showDates}
        />
      </td>
      <td className={`input${errors[`${row.id}-earningsFactor`] ? ` error-cell` : ``}`}>
        <TextInput
          hiddenLabel={true}
          name={`${row.id}-earningsFactor`}
          labelText="earnings"
          inputValue={row.earningsFactor}
          inputClassName="number"
          onChangeCallback={(e) => handleChange(row, e)}
          />
      </td>
      <td>{row.maxWeeks}</td>
      <td>{row.actualWeeks}</td>
      <td>{row.deficiency}</td>
    </tr>
  )
}

export default Class3TableRow
