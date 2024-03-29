import React, {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react'
import uniqid from 'uniqid';

// types
import {Class1DebtRow, DetailsProps, GovDateRange, TaxYear, Rate} from '../../../interfaces'
import {buildTaxYears} from "../../../config";
import {GenericErrors} from '../../../validation/validation'
import {
  initInterestOnLateClassOne, InterestOnLateClassOne,
  NiFrontendContext
} from "../../../services/NiFrontendContext";
import {isNotCurrentYear} from "../../../services/utils";

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
  rows: Class1DebtRow[]
  totalDebt: string | null
  totalInterest: string | null
  grandTotal: string | null
  totalDailyInterest: string | null
}

interface LateInterestContextProps {
  InterestOnLateClassOneCalculator: InterestOnLateClassOne
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
  hasRemissionPeriod: boolean | null
  setHasRemissionPeriod: Dispatch<boolean>
}

export const LateInterestContext = React.createContext<LateInterestContextProps>(
  {
    InterestOnLateClassOneCalculator: initInterestOnLateClassOne,
    details: detailsState,
    setDetails: () => {},
    rows: [],
    setRows: () => {},
    taxYears: [],
    dateRange: {from: null, to: null},
    setDateRange: () => {},
    errors: {},
    setErrors: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    rates: null,
    results: null,
    setResults: () => {},
    defaultRows: [],
    hasRemissionPeriod: null,
    setHasRemissionPeriod: () => {}
  }
)

export function useLateInterestForm() {
  const [details, setDetails] = React.useReducer(stateReducer, detailsState)
  const [dateRange, setDateRange] = useState<GovDateRange>((() => ({from: null, to: null, hasContentFrom: false, hasContentTo: false})))
  const [errors, setErrors] = useState<GenericErrors>({})
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [results, setResults] = useState<LateInterestResults | null>(null)
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const DirectorsCalculator = NiFrontendInterface.directors
  const InterestOnLateClassOneCalculator = NiFrontendInterface.interestOnLateClassOne
  const [rates, setRates] = useState<Rate[] | null>([])
  const defaultRows = [{
    id: uniqid(),
    taxYear: taxYears[0],
    debt: '',
    interestDue: null
  }]
  const [rows, setRows] = useState<Array<Class1DebtRow>>(defaultRows)
  const [hasRemissionPeriod, setHasRemissionPeriod] = useState<boolean | null>(null)

  useEffect(() => {
    const interestRates = InterestOnLateClassOneCalculator.getRates()
    setRates(interestRates)
  }, [InterestOnLateClassOneCalculator])

  useEffect(() => {
    const taxYearData = buildTaxYears(DirectorsCalculator.getTaxYearsWithOptions)
      .filter((ty: TaxYear) => isNotCurrentYear(ty.from) && ty.to.getFullYear() > 1992)
    setTaxYears(taxYearData)
  }, [DirectorsCalculator])

  useEffect(() => {
    if(!results) {
      setRows((prevState: Class1DebtRow[]) => prevState.map(row => ({
        ...row,
        interestDue: null
      })))
    } else {
      setRows((prevState: Class1DebtRow[]) => prevState.map((row, i) => ({
        ...row,
        interestDue: results.rows[i].interestDue
      })))
    }
  }, [results])

  useEffect(() => {
    setResults(null)
    setRows((prevState: Class1DebtRow[]) => prevState.map(row => ({
      ...row,
      interestDue: null
    })))
  }, [dateRange])

  return {
    InterestOnLateClassOneCalculator,
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
    defaultRows,
    hasRemissionPeriod,
    setHasRemissionPeriod
  }
}
