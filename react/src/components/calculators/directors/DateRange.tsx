import DateInputs from "../../helpers/formhelpers/DateInputs";
import React, {useEffect, useState} from "react";
import {GovDateRange} from "../../../interfaces";

export const DateRange = (props: any) => {
  const { setDateRange, errors } = props
  const [fromDay, setFromDay] = useState('')
  const [fromMonth, setFromMonth] = useState('')
  const [fromYear, setFromYear] = useState('')
  const [toDay, setToDay] = useState('')
  const [toMonth, setToMonth] = useState('')
  const [toYear, setToYear] = useState('')

  useEffect(() => {
    if((parseInt(fromDay) > 0 && parseInt(fromDay) < 32) &&
      (parseInt(fromMonth) > 0 && parseInt(fromMonth) < 13) &&
      (parseInt(fromYear) > 1972 && parseInt(fromYear) < 2020)) {
      const fromDate = new Date(`${fromDay}, ${fromMonth}, ${fromYear}`)
      setDateRange((prevState: GovDateRange) => ({...prevState, from: fromDate}))
    }

  }, [fromDay, fromMonth, fromYear, setDateRange])

  useEffect(() => {
    if((parseInt(toDay) > 0 && parseInt(toDay) < 32) &&
      (parseInt(toMonth) > 0 && parseInt(toMonth) < 13) &&
      (parseInt(toYear) > 1972 && parseInt(toYear) < 2020)) {
      const toDate = new Date(`${toDay}, ${toMonth}, ${toYear}`)
      setDateRange((prevState: GovDateRange) => ({...prevState, to: toDate}))
    }
  }, [toDay, toMonth, toYear, setDateRange])

  return (
    <div className="container">
      <div className="container third">
        <DateInputs
          description="directorshipFrom"
          legend="Directorship from"
          day={fromDay}
          month={fromMonth}
          year={fromYear}
          setDay={setFromDay}
          setMonth={setFromMonth}
          setYear={setFromYear}
          error={errors.directorshipFromDay}
        />
      </div>
      <div className="container third">
        <DateInputs
          description="directorshipTo"
          legend="Directorship to"
          day={toDay}
          month={toMonth}
          year={toYear}
          setDay={setToDay}
          setMonth={setToMonth}
          setYear={setToYear}
          error={errors.directorshipToDay}
        />
      </div>
    </div>
  )
}
