import React, {Dispatch, useContext, useEffect, useState, SetStateAction} from 'react'

// types
import {DetailsProps, Rate, TaxYear} from '../../../interfaces'
import uniqid from 'uniqid'
import {buildTaxYears} from '../../../config'
import {
  initInterestOnRefundsClassOne, InterestOnRefundsClassOne,
  NiFrontendContext
} from '../../../services/NiFrontendContext'
import {GenericErrors} from '../../../validation/validation'
import {isBeforeToday} from "../../../services/utils";

export interface LateRefundsTableRowProps {
  id: string
  taxYear: TaxYear | null
  paymentDate: Date | null
  refund: string,
  interestDue: string | null
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
  rates: Rate[] | null
  rows: LateRefundsTableRowProps[]
  setRows: Dispatch<SetStateAction<Array<LateRefundsTableRowProps>>>
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
  interestDue: ''
}

export const LateRefundsContext = React.createContext<LateRefundsContext>(
  {
    InterestOnLateRefundsCalculator: initInterestOnRefundsClassOne,
    details: detailsState,
    setDetails: () => {},
    taxYears: [],
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
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [results, setResults] = useState<LateRefundsResults | null>(null)

  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const DirectorsCalculator = NiFrontendInterface.directors
  const InterestOnLateRefundsCalculator = NiFrontendInterface.interestOnRefundsClassOne
  const [defaultRow, setDefaultRow] = useState<LateRefundsTableRowProps>(initRow)
  const [rows, setRows] = useState<Array<LateRefundsTableRowProps>>([defaultRow])
  const [rates, setRates] = useState<Rate[] | null>([])

  useEffect(() => {
    const taxYearData = buildTaxYears(DirectorsCalculator.getTaxYearsWithOptions)
      .filter((ty: TaxYear) => isBeforeToday(ty.from))
    setTaxYears(taxYearData)
    setDefaultRow({...initRow, taxYear: taxYearData[0]})
  }, [DirectorsCalculator, NiFrontendInterface])

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
    if(!results) {
      setRows((prevState: LateRefundsTableRowProps[]) => prevState.map(row => ({
        ...row,
        payable: null
      })))
    } else {
      setRows((prevState: LateRefundsTableRowProps[]) => prevState.map((row, i) => ({
        ...row,
        interestDue: results.rows[i].interestDue
      })))
    }
  }, [results])

  return {
    InterestOnLateRefundsCalculator,
    details,
    setDetails,
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
