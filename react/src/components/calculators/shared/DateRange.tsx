import DateInputs from "../../helpers/formhelpers/DateInputs";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {GovDateRange} from "../../../interfaces";
import {GenericErrors} from "../../../validation/validation";
import {DatePartsNames, extractDatePartString, govDateString, validDateParts, zeroPad} from '../../../services/utils'

interface DateRangeProps {
  isSaveAndPrint?: boolean
  setDateRange: Dispatch<SetStateAction<GovDateRange>>
  errors: GenericErrors
  legends: {from: string, to: string}
  dateRange?: GovDateRange | null
  id: string
  hideLabels: boolean
}

export const DateRange = (props: DateRangeProps) => {
  const { setDateRange, errors, legends, id, dateRange, isSaveAndPrint, hideLabels } = props
  const [fromDay, setFromDay] = useState(extractDatePartString(DatePartsNames.DAY, dateRange?.from))
  const [fromMonth, setFromMonth] = useState(extractDatePartString(DatePartsNames.MONTH, dateRange?.from))
  const [fromYear, setFromYear] = useState(extractDatePartString(DatePartsNames.YEAR, dateRange?.from))
  const [toDay, setToDay] = useState(extractDatePartString(DatePartsNames.DAY, dateRange?.to))
  const [toMonth, setToMonth] = useState(extractDatePartString(DatePartsNames.MONTH, dateRange?.to))
  const [toYear, setToYear] = useState(extractDatePartString(DatePartsNames.YEAR, dateRange?.to))

  useEffect(() => {
    const fromDate = validDateParts(fromDay, fromMonth, fromYear) ?
      new Date(`${fromYear}-${zeroPad(fromMonth)}-${zeroPad(fromDay)}`) : null

    if(fromDate) {
      setDateRange((prevState: GovDateRange) => {
        return {
          ...prevState,
          from: fromDate,
          fromParts: {day: fromDay, month: fromMonth, year: fromYear}
        }
      })
    } else {
      setDateRange((prevState: GovDateRange) => {
        return {
          ...prevState,
          fromParts: {day: fromDay, month: fromMonth, year: fromYear}
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
          ...prevState,
          to: toDate,
          toParts: {day: toDay, month: toMonth, year: toYear}
        }
      })
    } else {
      setDateRange((prevState: GovDateRange) => {
        return {
          ...prevState,
          toParts: {day: toDay, month: toMonth, year: toYear}
        }
      })
    }
  }, [toDay, toMonth, toYear, setDateRange])

  return (
    <>
      {isSaveAndPrint ?
        <div className="save-print-wrapper">
          <div className="divider--bottom section--bottom section-outer--bottom">
            <h3 className="govuk-heading-s">Dates from and to</h3>
            {dateRange && dateRange.from && dateRange.to &&
            <p>
              From <strong>{govDateString(dateRange.from)}</strong> to <strong>{govDateString(dateRange.to)}</strong>
            </p>
            }
          </div>
        </div>
        :
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
              hideLabels={hideLabels}
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
              hideLabels={hideLabels}
            />
          </div>
        </div>
      }
    </>

  )
}
