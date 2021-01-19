import React, {Dispatch, SetStateAction, useState} from 'react'
import {buildTaxYears} from "../../../config";

// types
import {Class1S, Class3Row, DetailsProps, TaxYear} from '../../../interfaces'
import {GenericErrors} from "../../../validation/validation";
import {ClassOne} from "../../../calculation";
import configuration from "../../../configuration.json";
import uniqid from "uniqid";

const ClassOneCalculator = new ClassOne(JSON.stringify(configuration))
const taxYears: TaxYear[] = buildTaxYears(ClassOneCalculator.getTaxYears, '')

const initialState = {
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

interface Calculator {
  calculate: Function
  calculateProRata: Function
  calculateClassTwo: Function
  calculateClassThree: Function
  getApplicableCategories: Function
  getTaxYears: Array<string>
}

export interface Class3Result {
  maxWeeks: number
  actualWeeks: number
  deficiency: number
}

interface Class3Context {
  ClassOneCalculator: Calculator
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
  setActiveRowId: Dispatch<string | null>
}

const stateReducer = (state: Class1S, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})


export const Class3Context = React.createContext<Class3Context>(
  {
    ClassOneCalculator: ClassOneCalculator,
    taxYears: taxYears,
    details: initialState,
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
    setActiveRowId: () => {}
  }
)

export function useClass3Form() {
  const [details, setDetails] = React.useReducer(stateReducer, initialState)
  const [rows, setRows] = useState<Array<Class3Row>>(class3DefaultRows)
  const [enteredNiDate, setEnteredNiDate] = useState<Date | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [result, setResult] = useState<Class3Result | null>(null)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  return {
    ClassOneCalculator,
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