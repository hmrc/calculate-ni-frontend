import React, {Dispatch, SetStateAction, useState} from 'react'
import {appConfig} from "../../../config";

// types
import {Class1S, DetailsProps, TaxYear} from '../../../interfaces'
import {GenericErrors} from "../../../validation/validation";

const initialState = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

interface Class2Or3Context {
  details: DetailsProps
  setDetails: Function
  taxYear: TaxYear,
  setTaxYear: Dispatch<TaxYear>,
  paymentEnquiryDate: Date | null,
  setPaymentEnquiryDate: Dispatch<SetStateAction<Date | null>>
  earningsFactor: string
  setEarningsFactor: Dispatch<string>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
}

const stateReducer = (state: Class1S, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})


export const Class2Or3Context = React.createContext<Class2Or3Context>(
  {
    details: initialState,
    setDetails: () => {},
    taxYear: appConfig.taxYears[0],
    setTaxYear: () => {},
    paymentEnquiryDate: null,
    setPaymentEnquiryDate: () => {},
    earningsFactor: '',
    setEarningsFactor: () => {},
    errors: {},
    setErrors: () => {}
  }
)

export function useClass2Or3Form() {
  const [details, setDetails] = React.useReducer(stateReducer, initialState) 
  const [taxYear, setTaxYear] = useState<TaxYear>(appConfig.taxYears[0])
  const [earningsFactor, setEarningsFactor] = useState<string>('')
  const [paymentEnquiryDate, setPaymentEnquiryDate] = useState<Date | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})

  return {
    details,
    setDetails,
    taxYear,
    setTaxYear,
    paymentEnquiryDate,
    setPaymentEnquiryDate,
    earningsFactor,
    setEarningsFactor,
    errors,
    setErrors
  }
}