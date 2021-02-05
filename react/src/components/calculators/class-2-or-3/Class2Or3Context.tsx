import React, {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react'
import {buildTaxYears, NiClassName} from "../../../config";

// types
import {DetailsProps, TaxYear} from '../../../interfaces'
import {GenericErrors} from "../../../validation/validation";
import {NiFrontendContext} from "../../../services/NiFrontendContext";

const initialDetails = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

interface Calculator {
  calculate: Function
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
  ClassTwoCalculator: Calculator
  ClassThreeCalculator: Calculator
  class2TaxYears: TaxYear[]
  class3TaxYears: TaxYear[]
  details: DetailsProps
  setDetails: Function
  activeClass: string
  setActiveClass: Dispatch<string>
  taxYear: TaxYear,
  setTaxYear: Dispatch<TaxYear>,
  paymentEnquiryDate: Date | null,
  day: string,
  setDay: Dispatch<string>
  month: string,
  setMonth: Dispatch<string>
  year: string,
  setYear: Dispatch<string>
  setPaymentEnquiryDate: Dispatch<SetStateAction<Date | null>>
  earningsFactor: string
  setEarningsFactor: Dispatch<string>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  result: Class2Or3Result | null
  setResult: Dispatch<Class2Or3Result | null>
}

const detailsReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})


export const Class2Or3Context = React.createContext<Class2Or3Context>(
  {
    ClassTwoCalculator: {
      calculate: () => {},
      getTaxYears: ['']
    },
    ClassThreeCalculator: {
      calculate: () => {},
      getTaxYears: ['']
    },
    class2TaxYears: [],
    class3TaxYears: [],
    details: initialDetails,
    setDetails: () => {},
    activeClass: '',
    setActiveClass: () => {},
    taxYear: {
      id: '1',
        from: new Date(),
        to: new Date()
    },
    setTaxYear: () => {},
    day: '',
    setDay: () => {},
    month: '',
    setMonth: () => {},
    year: '',
    setYear: () => {},
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
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [earningsFactor, setEarningsFactor] = useState<string>('')
  const [paymentEnquiryDate, setPaymentEnquiryDate] = useState<Date | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [result, setResult] = useState<Class2Or3Result | null>(null)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassTwoCalculator = NiFrontendInterface.classTwo
  const ClassThreeCalculator = NiFrontendInterface.classThree
  const class2TaxYears: TaxYear[] = buildTaxYears(ClassTwoCalculator.getTaxYears)
  const class3TaxYears: TaxYear[] = buildTaxYears(ClassThreeCalculator.getTaxYears)
  const [taxYear, setTaxYear] = useState<TaxYear>(class2TaxYears[0])

  useEffect(() => {
    const taxYears = activeClass === NiClassName.CLASS_TWO ? class2TaxYears : class3TaxYears
    setTaxYear(taxYears[0])
  }, [activeClass])

  return {
    ClassTwoCalculator,
    ClassThreeCalculator,
    class2TaxYears,
    class3TaxYears,
    details,
    setDetails,
    activeClass,
    setActiveClass,
    taxYear,
    setTaxYear,
    day,
    setDay,
    month,
    setMonth,
    year,
    setYear,
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