import DateInputs from "../../helpers/formhelpers/DateInputs";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {GovDateRange} from "../../../interfaces";
import {GenericErrors} from "../../../validation/validation";

interface DateRangeProps {
  setDateRange: Dispatch<SetStateAction<GovDateRange>>
  errors: GenericErrors
  legends: {from: string, to: string}
  id: string
}

export const DateRange = (props: DateRangeProps) => {
  const { setDateRange, errors, legends, id } = props
  const [fromDay, setFromDay] = useState('')
  const [fromMonth, setFromMonth] = useState('')
  const [fromYear, setFromYear] = useState('')
  const [toDay, setToDay] = useState('')
  const [toMonth, setToMonth] = useState('')
  const [toYear, setToYear] = useState('')

  useEffect(() => {
    if((parseInt(fromDay) > 0 && parseInt(fromDay) < 32) &&
      (parseInt(fromMonth) > 0 && parseInt(fromMonth) < 13) &&
      (parseInt(fromYear) > 1974 && parseInt(fromYear) < 2020)) {
      const fromDate = new Date(`${fromDay}, ${fromMonth}, ${fromYear}`)
      setDateRange((prevState: GovDateRange) => ({from: fromDate, to: prevState.to}))
    }

  }, [fromDay, fromMonth, fromYear, setDateRange])

  useEffect(() => {
    if((parseInt(toDay) > 0 && parseInt(toDay) < 32) &&
      (parseInt(toMonth) > 0 && parseInt(toMonth) < 13) &&
      (parseInt(toYear) > 1974 && parseInt(toYear) < 2020)) {
      const toDate = new Date(`${toDay}, ${toMonth}, ${toYear}`)
      setDateRange((prevState: GovDateRange) => ({from: prevState.from, to: toDate}))
    }
  }, [toDay, toMonth, toYear, setDateRange])

  return (
    <div className="container">
      <div className="container third">
        <DateInputs
          description={`${id}From`}
          legend={legends.from}
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
          description={`${id}To`}
          legend={legends.to}
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
