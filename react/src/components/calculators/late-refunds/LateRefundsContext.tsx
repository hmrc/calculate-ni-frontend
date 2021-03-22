import React, {Dispatch, useContext, useEffect, useState} from 'react'

// types
import {DetailsProps, Rate, TaxYear} from '../../../interfaces'
import uniqid from 'uniqid'
import {buildTaxYears} from '../../../config'
import {
  initInterestOnRefundsClassOne, InterestOnRefundsClassOne,
  NiFrontendContext
} from '../../../services/NiFrontendContext'
import {GenericErrors} from '../../../validation/validation'

export interface LateRefundsTableRowProps {
  id: string
  taxYear: TaxYear | null
  paymentDate: Date | null
  refund: string,
  totalDue: string | null
}

const detailsState = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

interface LateRefundsResults {
  rows: LateRefundsTableRowProps[]
  totalDebt: string | null
  totalInterest: string | null
  grandTotal: string | null
}

const stateReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})

interface LateRefundsContext {
  InterestOnLateRefundsCalculator: InterestOnRefundsClassOne
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
  defaultRow: LateRefundsTableRowProps
  results: LateRefundsResults | null
  setResults: Dispatch<LateRefundsResults | null>
}

const initRow = {
  id: uniqid(),
  taxYear: null,
  paymentDate: null,
  refund: '',
  totalDue: ''
}

export const LateRefundsContext = React.createContext<LateRefundsContext>(
  {
    InterestOnLateRefundsCalculator: initInterestOnRefundsClassOne,
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
    defaultRow: initRow,
    results: null,
    setResults: () => {}
  }
)

export function useLateRefundsForm() {
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const [details, setDetails] = React.useReducer(stateReducer, detailsState)
  const [bankHolidaysNo, setBankHolidaysNo] = React.useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [results, setResults] = useState<LateRefundsResults | null>(null)

  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const InterestOnLateRefundsCalculator = NiFrontendInterface.interestOnRefundsClassOne
  const [defaultRow, setDefaultRow] = useState<LateRefundsTableRowProps>(initRow)
  const [rows, setRows] = useState<Array<LateRefundsTableRowProps>>([defaultRow])
  const [rates, setRates] = useState<Rate[] | null>([])

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassOneCalculator.getTaxYears)
    setTaxYears(taxYearData)
    setDefaultRow({...initRow, taxYear: taxYearData[0]})
  }, [ClassOneCalculator, NiFrontendInterface])

  useEffect(() => {
    if(defaultRow) {
      setRows([defaultRow])
    }
  }, [defaultRow])

  useEffect(() => {
    const interestRates = InterestOnLateRefundsCalculator.getRates()
    setRates(interestRates)
  }, [InterestOnLateRefundsCalculator])

  useEffect(() => {
    console.log('results changed to', results)
    if(!results) {
      setRows((prevState: LateRefundsTableRowProps[]) => prevState.map(row => ({
        ...row,
        payable: null
      })))
    } else {
      setRows((prevState: LateRefundsTableRowProps[]) => prevState.map((row, i) => ({
        ...row,
        totalDue: results.rows[i].totalDue
      })))
    }
  }, [results])

  return {
    InterestOnLateRefundsCalculator,
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
    defaultRow,
    results,
    setResults
  }
}
