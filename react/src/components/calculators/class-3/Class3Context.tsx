import React, {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react'
import {buildTaxYears} from "../../../config";

// types
import {Class3Row, DetailsProps, TaxYear} from '../../../interfaces'
import {GenericErrors} from "../../../validation/validation";
import uniqid from "uniqid";
import {
  initWeeklyContributionsCalculator,
  NiFrontendContext,
  WeeklyContributionsCalculator
} from "../../../services/NiFrontendContext";

const initialDetails = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

export const class3DefaultRows = [{
  id: uniqid(),
  earningsFactor: '',
  dateRange: {from: null, to: null}
}]

export interface Class3Result {
  maxWeeks: number
  actualWeeks: number
  deficiency: number
}

interface Class3Context {
  taxYears: TaxYear[]
  details: DetailsProps
  setDetails: Function
  rows: Array<Class3Row>
  setRows: Dispatch<SetStateAction<Array<Class3Row>>>
  day: string,
  setDay: Dispatch<string>
  month: string,
  setMonth: Dispatch<string>
  year: string,
  setYear: Dispatch<string>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  result: Class3Result | null
  setResult: Dispatch<Class3Result | null>
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>,
  WeeklyContributionsCalculator: WeeklyContributionsCalculator
}

const detailsReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})


export const Class3Context = React.createContext<Class3Context>(
  {
    taxYears: [],
    details: initialDetails,
    setDetails: () => {},
    rows: class3DefaultRows,
    setRows: () => {},
    day: '',
    setDay: () => {},
    month: '',
    setMonth: () => {},
    year: '',
    setYear: () => {},
    errors: {},
    setErrors: () => {},
    result: null,
    setResult: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    WeeklyContributionsCalculator: initWeeklyContributionsCalculator
  }
)

export function useClass3Form() {
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassThreeCalculator = NiFrontendInterface.classThree
  const WeeklyContributionsCalculator = NiFrontendInterface.weeklyContributions
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [rows, setRows] = useState<Array<Class3Row>>(class3DefaultRows)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [result, setResult] = useState<Class3Result | null>(null)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  useEffect(() => {
    if(taxYears && taxYears.length > 0) {
      setRows([{
        id: uniqid(),
        earningsFactor: '',
        dateRange: {from: taxYears[0].from, to: taxYears[0].to}
      }])
    }
  }, [taxYears])

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassThreeCalculator.getTaxYears)
    setTaxYears(taxYearData)
  }, [ClassThreeCalculator, NiFrontendInterface])

  return {
    WeeklyContributionsCalculator,
    taxYears,
    details,
    setDetails,
    rows,
    setRows,
    day,
    setDay,
    month,
    setMonth,
    year,
    setYear,
    errors,
    setErrors,
    result,
    setResult,
    activeRowId,
    setActiveRowId
  }
}