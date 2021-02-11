import React, {Dispatch, useContext, useEffect, useState} from "react";
import {Class1DebtRow, DetailsProps, TaxYear, TotalsInCategories} from "../../../interfaces";
import {PeriodLabel, buildTaxYears} from "../../../config";
import {GenericErrors} from "../../../validation/validation";
import {getTotalsInCategories} from "../../../services/utils";
import {ClassOneCalculator, initClassOneCalculator, NiFrontendContext} from "../../../services/NiFrontendContext";
import uniqid from 'uniqid'
import {Band, CalculatedRow, Class1Result, Row} from "../class1/ClassOneContext";

export interface DirectorsRow {
  id: string
  category: string
  gross: string
  ee: number
  er: number
  bands?: Band[]
}

export interface ClassOneProRataRow {
  id: string,
  from: Date,
  to: Date,
  category: string,
  grossPay: number,
  contractedOutStandardRate: boolean
}

const initialDetails: DetailsProps = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

const initRow: DirectorsRow = {
  id: uniqid(),
  category: '',
  gross: '',
  ee: 0,
  er: 0
}

const detailsReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})

interface DirectorsContext {
  ClassOneCalculator: ClassOneCalculator
  taxYears: TaxYear[]
  taxYear: TaxYear | null
  setTaxYear: Dispatch<TaxYear>
  defaultRow: DirectorsRow
  rows: DirectorsRow[]
  setRows: Dispatch<Array<DirectorsRow>>
  details: DetailsProps
  setDetails: Function,
  earningsPeriod: PeriodLabel | null
  setEarningsPeriod: Dispatch<PeriodLabel | null>
  niPaidNet: string
  setNiPaidNet: Dispatch<string>
  niPaidEmployee: string
  setNiPaidEmployee: Dispatch<string>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  categoryTotals: TotalsInCategories
  setCategoryTotals: Dispatch<TotalsInCategories>
  categories: Array<string>
  setCategories: Dispatch<Array<string>>
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>
  result: Class1Result | null
  setResult: Dispatch<Class1Result | null>
}

export const DirectorsContext = React.createContext<DirectorsContext>(
  {
    ClassOneCalculator: initClassOneCalculator,
    taxYears: [],
    taxYear: null,
    setTaxYear: () => {},
    defaultRow: initRow,
    rows: [initRow],
    setRows: () => {},
    details: initialDetails,
    setDetails: () => {},
    niPaidNet: '',
    setNiPaidNet: () => {},
    niPaidEmployee: '',
    setNiPaidEmployee: () => {},
    earningsPeriod: null,
    setEarningsPeriod: () => {},
    errors: {},
    setErrors: () => {},
    categoryTotals: {},
    setCategoryTotals: () => {},
    categories: [],
    setCategories: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    result: null,
    setResult: () => {}
  }
)

export function useDirectorsForm() {
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const [taxYear, setTaxYear] = useState<TaxYear | null>(null)
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const [categories, setCategories] = useState<Array<string>>([])
  const [defaultRow, setDefaultRow] = useState<DirectorsRow>(initRow)
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')
  const [earningsPeriod, setEarningsPeriod] = useState<PeriodLabel | null>(null)
  const [categoryTotals, setCategoryTotals] = useState<TotalsInCategories>({})
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [result, setResult] = useState<Class1Result | null>(null)
  useEffect(() => {
    if(taxYear && taxYear.from) {
      const categories = ClassOneCalculator.getApplicableCategories(taxYear.from)
      if(categories) {
        setCategories(categories.split(''))
        setDefaultRow(prevState => ({
          ...prevState,
          category: categories[0]
        }))
        setRows([defaultRow])
      }
    }
  }, [taxYear, ClassOneCalculator])
  const [rows, setRows] = useState<Array<DirectorsRow>>([defaultRow])

  useEffect(() => {
    if(result && result.resultRows) {
      setRows((prevState: DirectorsRow[]) => prevState.map(row => {
        const matchingRow: CalculatedRow | undefined =
          result.resultRows
            .find(resultRow =>
              resultRow.name === row.id
            )
        if(matchingRow) {
          return {
            ...row,
            ee: matchingRow.employee,
            er: matchingRow.employer,
            totalContributions: matchingRow.totalContributions,
            bands: matchingRow.resultBands,
            explain: matchingRow.explain
          }
        }
        return row
      }))
      setCategoryTotals(getTotalsInCategories(rows as DirectorsRow[]))
    } else {
      setRows((prevState: DirectorsRow[]) => prevState.map(row => {
        row.ee = 0
        row.er = 0
        return row
      }))
    }

  }, [result])

  useEffect(() => {
    if(taxYears.length > 0) {
      setTaxYear(taxYears[0])
    }
  }, [taxYears])

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassOneCalculator.getTaxYears)
    setTaxYears(taxYearData)
  }, [ClassOneCalculator, NiFrontendInterface])

  useEffect(() => {
    setResult(null)
  }, [niPaidNet, niPaidEmployee])

  return {
    ClassOneCalculator,
    taxYears,
    taxYear,
    setTaxYear,
    defaultRow,
    rows,
    setRows,
    details,
    setDetails,
    errors,
    setErrors,
    earningsPeriod,
    setEarningsPeriod,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    categoryTotals,
    setCategoryTotals,
    categories,
    setCategories,
    activeRowId,
    setActiveRowId,
    result,
    setResult
  }
}
