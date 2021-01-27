import React, {Dispatch, SetStateAction, useState} from 'react'
import uniqid from 'uniqid';

// types
import {Class1DebtRow, DetailsProps, GovDateRange, TaxYear} from '../../../interfaces'
import {buildTaxYears} from "../../../config";
import configuration from "../../../configuration.json";
import {GenericErrors} from '../../../validation/validation'
import {NiFrontend} from '../../../calculation'

const NiFrontendInterface = new NiFrontend(JSON.stringify(configuration))
const ClassOneCalculator = NiFrontendInterface.classOne
const interestRates = ClassOneCalculator.interestOnLateClassOne.getRates()
const taxYears: TaxYear[] = buildTaxYears(ClassOneCalculator.getTaxYears, '')

const detailsState = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

export const defaultRows = [{
  id: uniqid(),
  taxYears: taxYears,
  taxYear: taxYears[0],
  debt: '',
  interestDue: null
}]

const stateReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})

interface LateInterestResults {
  totalDebt: string | null
  totalInterest: string | null
  grandTotal: string | null
}

interface InterestOnLateClassOne {
  calculate: Function
  getRates: Function
}

interface Calculator {
  calculate: Function
  calculateProRata: Function
  calculateClassTwo: Function
  calculateClassThree: Function
  interestOnLateClassOne: InterestOnLateClassOne
  getApplicableCategories: Function
  getTaxYears: Array<string>
}

export interface Rate {
  year: number
  rate: number
}

interface LateInterestContext {
  ClassOneCalculator: Calculator
  details: DetailsProps
  setDetails: Function
  taxYears: TaxYear[]
  rows: Class1DebtRow[]
  setRows: Function
  dateRange: GovDateRange
  setDateRange: Dispatch<SetStateAction<GovDateRange>>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>
  rates: Rate[] | null
  results: LateInterestResults | null
  setResults: Dispatch<LateInterestResults | null>
}

export const LateInterestContext = React.createContext<LateInterestContext>(
  {
    ClassOneCalculator: ClassOneCalculator,
    details: detailsState,
    setDetails: () => {},
    rows: defaultRows,
    setRows: () => {},
    taxYears: taxYears,
    dateRange: {from: null, to: null, hasContentFrom: false, hasContentTo: false},
    setDateRange: () => {},
    errors: {},
    setErrors: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    rates: null,
    results: null,
    setResults: () => {}
  }
)

export function useLateInterestForm() {
  const [details, setDetails] = React.useReducer(stateReducer, detailsState)
  const [rows, setRows] = useState<Array<Class1DebtRow>>(defaultRows)
  const [dateRange, setDateRange] = useState<GovDateRange>((() => ({from: null, to: null, hasContentFrom: false, hasContentTo: false})))
  const [errors, setErrors] = useState<GenericErrors>({})
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [rates] = useState<Rate[] | null>(interestRates)
  const [results, setResults] = useState<LateInterestResults | null>(null)

  return {
    ClassOneCalculator,
    details,
    setDetails,
    rows,
    setRows,
    taxYears,
    dateRange,
    setDateRange,
    errors,
    setErrors,
    activeRowId,
    setActiveRowId,
    rates,
    results,
    setResults
  }
}