import DateInputs from "../../helpers/formhelpers/DateInputs";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {GovDateRange} from "../../../interfaces";
import {GenericErrors} from "../../../validation/validation";
import {validDateParts} from '../../../services/utils'

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
    const fromDate = validDateParts(fromDay, fromMonth, fromYear) ?
      new Date(`${fromDay}, ${fromMonth}, ${fromYear}`) : null
    setDateRange((prevState: GovDateRange) => ({from: fromDate, to: prevState.to}))
  }, [fromDay, fromMonth, fromYear, setDateRange])

  useEffect(() => {
    const toDate = validDateParts(toDay, toMonth, toYear) ?
      new Date(`${toDay}, ${toMonth}, ${toYear}`) : null
    setDateRange((prevState: GovDateRange) => ({from: prevState.from, to: toDate}))
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
