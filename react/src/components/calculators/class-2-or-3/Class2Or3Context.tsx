import React, {Dispatch, SetStateAction, useEffect, useState} from 'react'
import {buildTaxYears} from "../../../config";

// types
import {Class1S, DetailsProps, TaxYear} from '../../../interfaces'
import {GenericErrors} from "../../../validation/validation";
import {ClassOne} from "../../../calculation";
import configuration from "../../../configuration.json";

const ClassOneCalculator = new ClassOne(JSON.stringify(configuration))
const class2TaxYears: TaxYear[] = buildTaxYears(Object.keys(configuration.classTwo), 'key')
const class3TaxYears: TaxYear[] = buildTaxYears(Object.keys(configuration.classThree), 'key')

const initialState = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

interface Calculator {
  calculate: Function
  calculateProRata: Function
  calculateClassTwo: Function
  calculateClassThree: Function
  getApplicableCategories: Function
  getTaxYears: Array<string>
}

export interface Class2Or3Result {
  contributionsDue: number
  rate: number
  totalAmountDue: number
  dateHigherRateApply: Date
  finalPaymentDate: Date
}

interface Class2Or3Context {
  ClassOneCalculator: Calculator
  class2TaxYears: TaxYear[]
  class3TaxYears: TaxYear[]
  details: DetailsProps
  setDetails: Function
  activeClass: string
  setActiveClass: Dispatch<string>
  taxYear: TaxYear,
  setTaxYear: Dispatch<TaxYear>,
  paymentEnquiryDate: Date | null,
  setPaymentEnquiryDate: Dispatch<SetStateAction<Date | null>>
  earningsFactor: string
  setEarningsFactor: Dispatch<string>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  result: Class2Or3Result | null
  setResult: Dispatch<Class2Or3Result | null>
}

const stateReducer = (state: Class1S, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})


export const Class2Or3Context = React.createContext<Class2Or3Context>(
  {
    ClassOneCalculator: ClassOneCalculator,
    class2TaxYears: class2TaxYears,
    class3TaxYears: class3TaxYears,
    details: initialState,
    setDetails: () => {},
    activeClass: '',
    setActiveClass: () => {},
    taxYear: class2TaxYears[0],
    setTaxYear: () => {},
    paymentEnquiryDate: null,
    setPaymentEnquiryDate: () => {},
    earningsFactor: '',
    setEarningsFactor: () => {},
    errors: {},
    setErrors: () => {},
    result: null,
    setResult: () => {}
  }
)

export function useClass2Or3Form() {
  const [activeClass, setActiveClass] = useState<string>('')
  const [details, setDetails] = React.useReducer(stateReducer, initialState) 
  const [taxYear, setTaxYear] = useState<TaxYear>(class2TaxYears[0])
  const [earningsFactor, setEarningsFactor] = useState<string>('')
  const [paymentEnquiryDate, setPaymentEnquiryDate] = useState<Date | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [result, setResult] = useState<Class2Or3Result | null>(null)

  useEffect(() => {
    const taxYears = activeClass === 'Class 2' ? class2TaxYears : class3TaxYears
    setTaxYear(taxYears[0])
  }, [activeClass])

  return {
    ClassOneCalculator,
    class2TaxYears,
    class3TaxYears,
    details,
    setDetails,
    activeClass,
    setActiveClass,
    taxYear,
    setTaxYear,
    paymentEnquiryDate,
    setPaymentEnquiryDate,
    earningsFactor,
    setEarningsFactor,
    errors,
    setErrors,
    result,
    setResult
  }
}