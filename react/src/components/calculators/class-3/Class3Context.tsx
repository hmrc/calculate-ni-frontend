import React, {Dispatch, SetStateAction, useContext, useState} from 'react'
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
  dateRange: {from: null, to: null, hasContentFrom: false, hasContentTo: false}
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
  enteredNiDate: Date | null,
  setEnteredNiDate: Dispatch<SetStateAction<Date | null>>
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
    enteredNiDate: null,
    setEnteredNiDate: () => {},
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
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [rows, setRows] = useState<Array<Class3Row>>(class3DefaultRows)
  const [enteredNiDate, setEnteredNiDate] = useState<Date | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [result, setResult] = useState<Class3Result | null>(null)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassThreeCalculator = NiFrontendInterface.classThree
  const WeeklyContributionsCalculator = NiFrontendInterface.weeklyContributions
  const taxYears: TaxYear[] = buildTaxYears(ClassThreeCalculator.getTaxYears)

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
    enteredNiDate,
    setEnteredNiDate,
    errors,
    setErrors,
    result,
    setResult,
    activeRowId,
    setActiveRowId
  }
}