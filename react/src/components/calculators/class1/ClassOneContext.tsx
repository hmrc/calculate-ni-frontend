import React, {Dispatch, useContext, useEffect, useState} from "react";
import {DetailsProps, TaxYear, TotalsInCategories} from "../../../interfaces";
import {buildTaxYears, periods, PeriodValue} from "../../../config";
import {GenericErrors} from "../../../validation/validation";
import {getTotalsInCategories} from "../../../services/utils";
import {initClassOneCalculator, NiFrontendContext} from "../../../services/NiFrontendContext";
import uniqid from "uniqid";

const initRow = {
  id: uniqid(),
  category: '',
  gross: '',
  ee: 0,
  er: 0,
  number: 1,
  period: PeriodValue.WEEKLY
}

const initialDetails = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

const detailsReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})

export interface Row {
  id: string
  category: string
  number: number
  period: PeriodValue
  gross: string
  ee: number
  er: number
  bands?: Array<Band>
  explain?: Array<string>
  totalContributions?: number
}

export interface ClassOneRowInterface {
  id: string,
  period: string, // "M", "W" or "4W"
  category: string,
  grossPay: number,
  contractedOutStandardRate: boolean
}

interface Calculator {
  calculate: Function
  calculateProRata: Function
  calculateProRataJson: Function
  getApplicableCategories: Function
  getTaxYears: Array<string>
}

interface CalculatedTotals {
  gross: number
  net: number
  employee: number
  employer: number
}

export interface Band {
  name: string
  amountInBand: number
}

export interface CalculatedRow {
  name: string
  resultBands: Array<Band>
  employee: number
  employer: number
  totalContributions: number
  explain: Array<string>
}

interface TotalRow {
  employee: number
  employer: number
  total: number
}

export interface Class1Result {
  resultRows: CalculatedRow[]
  totals: CalculatedTotals
  overpayment: TotalRow
  underpayment: TotalRow
  employerContributions: number
}

interface ClassOneContext {
  ClassOneCalculator: Calculator
  taxYears: TaxYear[]
  taxYear: TaxYear | null
  setTaxYear: Dispatch<TaxYear | null>
  defaultRow: Row,
  rows: Array<Row>
  setRows: Dispatch<Array<Row>>
  details: DetailsProps
  setDetails: Function,
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
  setPeriodNumbers: Function
  result: Class1Result | null
  setResult: Dispatch<Class1Result | null>
}

export const ClassOneContext = React.createContext<ClassOneContext>(
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
    errors: {},
    setErrors: () => {},
    categoryTotals: {},
    setCategoryTotals: () => {},
    categories: [],
    setCategories: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    setPeriodNumbers: () => {},
    result: null,
    setResult: () => {}
  }
)

export function useClassOneForm() {
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const [taxYear, setTaxYear] = useState<TaxYear | null>(null)
  const [defaultRow, setDefaultRow] = useState<Row>(initRow)
  const [categories, setCategories] = useState<Array<string>>([])
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')
  const [categoryTotals, setCategoryTotals] = useState<TotalsInCategories>({})
  const [result, setResult] = useState<Class1Result | null>(null)
  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  useEffect(() => {
    if(taxYear && taxYear.from) {
      const categoriesForTaxYear = ClassOneCalculator.getApplicableCategories(taxYear.from)
      if(categoriesForTaxYear) {
        setCategories(categoriesForTaxYear.split(''))
        setDefaultRow((prevState: Row) => ({
          ...prevState,
          category: categoriesForTaxYear[0]
        }))
        setRows([defaultRow])
      }
    }
  }, [taxYear, ClassOneCalculator])

  const [rows, setRows] = useState<Array<Row>>([defaultRow])

  useEffect(() => {
    if(result && result.resultRows) {
      setRows((prevState: Row[]) => prevState.map(row => {
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
    } else {
      setRows((prevState: Row[]) => prevState.map(row => {
        delete row.totalContributions
        delete row.explain
        row.ee = 0
        row.er = 0
        return row
      }))
    }
  }, [result])

  useEffect(() => {
    setCategoryTotals(getTotalsInCategories(rows as Row[]))
  }, [rows])

  useEffect(() => {
    setTaxYear(taxYears[0])
  }, [taxYears])

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassOneCalculator.getTaxYears)
    setTaxYears(taxYearData)
  }, [ClassOneCalculator])

  const setPeriodNumbers = (deletedRow: string | undefined) => {
    for (let period in periods) {
      let periodAccumulator = 0
      const newRows = deletedRow ?
        [...rows.filter((row: Row) => row.id !== deletedRow)]
        :
        [...rows]
      newRows.forEach(row => {
        if(periods.hasOwnProperty(period) &&
          periods[period] === row.period) {
            periodAccumulator += 1
            row.number = periodAccumulator
          }
        })
      setRows(newRows)
    }
  }
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
    setPeriodNumbers,
    result,
    setResult
  }
}
