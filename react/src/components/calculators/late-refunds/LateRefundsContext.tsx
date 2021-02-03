import React, {Dispatch, useContext, useState} from 'react'

// types
import {DetailsProps, LateRefundsTableRowProps, Rate, TaxYear} from '../../../interfaces'
import uniqid from 'uniqid'
import {buildTaxYears} from '../../../config'
import {ClassOneCalculator, initClassOneCalculator, NiFrontendContext} from '../../../services/NiFrontendContext'
import {GenericErrors} from '../../../validation/validation'

const detailsState = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

interface LateRefundsResults {
  totalRefund: string | null
  totalInterest: string | null
  grandTotal: string | null
}

const stateReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})

interface LateRefundsContext {
  ClassOneCalculator: ClassOneCalculator
  details: DetailsProps
  setDetails: Function
  taxYears: TaxYear[]
  bankHolidaysNo: string
  setBankHolidaysNo: Function
  rates: Rate[] | null
  rows: LateRefundsTableRowProps[]
  setRows: Function
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  defaultRows: LateRefundsTableRowProps[]
  results: LateRefundsResults | null
  setResults: Dispatch<LateRefundsResults | null>
}

export const LateRefundsContext = React.createContext<LateRefundsContext>(
  {
    ClassOneCalculator: initClassOneCalculator,
    details: detailsState,
    setDetails: () => {},
    taxYears: [],
    bankHolidaysNo: '',
    setBankHolidaysNo: () => {},
    rates: null,
    rows: [],
    setRows: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    errors: {},
    setErrors: () => {},
    defaultRows: [],
    results: null,
    setResults: () => {},
  }
)

export function useLateRefundsForm() {
  const [details, setDetails] = React.useReducer(stateReducer, detailsState)
  const [bankHolidaysNo, setBankHolidaysNo] = React.useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [results, setResults] = useState<LateRefundsResults | null>(null)

  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const taxYears: TaxYear[] = buildTaxYears(ClassOneCalculator.getTaxYears)
  const defaultRows = [{
    id: uniqid(),
    taxYears: taxYears,
    taxYear: taxYears[0],
    refund: '',
    payable: ''
  }]
  const [rows, setRows] = useState<Array<LateRefundsTableRowProps>>(defaultRows)
  const interestRates = ClassOneCalculator.interestOnRefundsClassOne.getRates()
  const [rates] = useState<Rate[] | null>(interestRates)

  return {
    ClassOneCalculator,
    details,
    setDetails,
    bankHolidaysNo,
    setBankHolidaysNo,
    rates,
    rows,
    setRows,
    taxYears,
    activeRowId,
    setActiveRowId,
    errors,
    setErrors,
    defaultRows,
    results,
    setResults
  }
}