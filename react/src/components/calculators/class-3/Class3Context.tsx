import React, {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react'
import {buildTaxYears} from "../../../config";

// types
import {Class3Results, DetailsProps, GovDateRange, TaxYear} from '../../../interfaces'
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
  dateRange: {from: null, to: null}
}]

interface Class3Context {
  taxYears: TaxYear[]
  details: DetailsProps
  setDetails: Function
  day: string,
  setDay: Dispatch<string>
  month: string,
  setMonth: Dispatch<string>
  year: string,
  setYear: Dispatch<string>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>,
  WeeklyContributionsCalculator: WeeklyContributionsCalculator
  dateRange: GovDateRange,
  setDateRange: Dispatch<SetStateAction<GovDateRange>>
  results: Class3Results | null
  setResults: Function
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
    day: '',
    setDay: () => {},
    month: '',
    setMonth: () => {},
    year: '',
    setYear: () => {},
    errors: {},
    setErrors: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    WeeklyContributionsCalculator: initWeeklyContributionsCalculator,
    dateRange: {from: null, to: null},
    setDateRange: () => {},
    results: null,
    setResults: () => {}
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
  const [errors, setErrors] = useState<GenericErrors>({})
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<GovDateRange>((() => ({from: null, to: null})))
  const [results, setResults] = useState<Class3Results | null>(null)

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassThreeCalculator.getTaxYears)
    setTaxYears(taxYearData)
  }, [ClassThreeCalculator, NiFrontendInterface])

  return {
    WeeklyContributionsCalculator,
    taxYears,
    details,
    setDetails,
    day,
    setDay,
    month,
    setMonth,
    year,
    setYear,
    errors,
    setErrors,
    activeRowId,
    setActiveRowId,
    dateRange,
    setDateRange,
    results,
    setResults
  }
}