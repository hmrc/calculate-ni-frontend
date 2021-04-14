import DateInputs from "../../helpers/formhelpers/DateInputs";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {GovDateRange} from "../../../interfaces";
import {GenericErrors} from "../../../validation/validation";
import {DateParts, extractDatePartString, validDateParts, zeroPad} from '../../../services/utils'

interface DateRangeProps {
  setDateRange: Dispatch<SetStateAction<GovDateRange>>
  errors: GenericErrors
  legends: {from: string, to: string}
  dateRange?: GovDateRange | null
  id: string
}

export const DateRange = (props: DateRangeProps) => {
  const { setDateRange, errors, legends, id, dateRange } = props
  const [fromDay, setFromDay] = useState(extractDatePartString(DateParts.DAY, dateRange?.from))
  const [fromMonth, setFromMonth] = useState(extractDatePartString(DateParts.MONTH, dateRange?.from))
  const [fromYear, setFromYear] = useState(extractDatePartString(DateParts.YEAR, dateRange?.from))
  const [toDay, setToDay] = useState(extractDatePartString(DateParts.DAY, dateRange?.to))
  const [toMonth, setToMonth] = useState(extractDatePartString(DateParts.MONTH, dateRange?.to))
  const [toYear, setToYear] = useState(extractDatePartString(DateParts.YEAR, dateRange?.to))

  useEffect(() => {
    const fromDate = validDateParts(fromDay, fromMonth, fromYear) ?
      new Date(`${fromYear}-${zeroPad(fromMonth)}-${zeroPad(fromDay)}`) : null

    if(fromDate) {
      setDateRange((prevState: GovDateRange) => {
        return {
          from: fromDate,
          to: prevState.to
        }
      })
    }

  }, [fromDay, fromMonth, fromYear, setDateRange])

  useEffect(() => {
    const toDate = validDateParts(toDay, toMonth, toYear) ?
      new Date(`${toYear}-${zeroPad(toMonth)}-${zeroPad(toDay)}`) : null
    if(toDate) {
      setDateRange((prevState: GovDateRange) => {
        return {
          from: prevState.from,
          to: toDate
        }
      })
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
          error={errors[`${id}FromDay`]}
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
          error={errors[`${id}ToDay`]}
        />
      </div>
    </div>
  )
}
