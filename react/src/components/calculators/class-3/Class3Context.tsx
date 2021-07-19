import React, {Dispatch, SetStateAction, useContext, useState} from 'react'

// types
import {Class3Results, DetailsProps, GovDateRange} from '../../../interfaces'
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
  const WeeklyContributionsCalculator = NiFrontendInterface.weeklyContributions
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<GovDateRange>((() => ({from: null, to: null})))
  const [results, setResults] = useState<Class3Results | null>(null)

  return {
    WeeklyContributionsCalculator,
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