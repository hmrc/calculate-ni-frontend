import React, {Dispatch, SetStateAction, useContext, useState} from 'react'
import uniqid from 'uniqid';

// types
import {Class1DebtRow, DetailsProps, GovDateRange, TaxYear} from '../../../interfaces'
import {buildTaxYears} from "../../../config";
import {GenericErrors} from '../../../validation/validation'
import {ClassOneCalculator, initClassOneCalculator, NiFrontendContext} from "../../../services/NiFrontendContext";


const detailsState = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

const stateReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})

interface LateInterestResults {
  totalDebt: string | null
  totalInterest: string | null
  grandTotal: string | null
}

export interface Rate {
  year: number
  rate: number
}

interface LateInterestContext {
  ClassOneCalculator: ClassOneCalculator
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
  defaultRows: Class1DebtRow[]
}

export const LateInterestContext = React.createContext<LateInterestContext>(
  {
    ClassOneCalculator: initClassOneCalculator,
    details: detailsState,
    setDetails: () => {},
    rows: [],
    setRows: () => {},
    taxYears: [],
    dateRange: {from: null, to: null, hasContentFrom: false, hasContentTo: false},
    setDateRange: () => {},
    errors: {},
    setErrors: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    rates: null,
    results: null,
    setResults: () => {},
    defaultRows: []
  }
)

export function useLateInterestForm() {
  const [details, setDetails] = React.useReducer(stateReducer, detailsState)
  const [dateRange, setDateRange] = useState<GovDateRange>((() => ({from: null, to: null, hasContentFrom: false, hasContentTo: false})))
  const [errors, setErrors] = useState<GenericErrors>({})
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [results, setResults] = useState<LateInterestResults | null>(null)
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const taxYears: TaxYear[] = buildTaxYears(ClassOneCalculator.getTaxYears, '')
  const interestRates = ClassOneCalculator.interestOnLateClassOne.getRates()
  const [rates] = useState<Rate[] | null>(interestRates)
  const defaultRows = [{
    id: uniqid(),
    taxYears: taxYears,
    taxYear: taxYears[0],
    debt: '',
    interestDue: null
  }]
  const [rows, setRows] = useState<Array<Class1DebtRow>>(defaultRows)
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
    setResults,
    defaultRows
  }
}