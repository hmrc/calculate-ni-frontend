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

interface CalculatedRow {
  id: string
  bands: Array<Band>
  employee: number
  employer: number
  totalContributions: number
}

interface TotalRow {
  employee: number
  employer: number
  net: number
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
  taxYear: TaxYear
  setTaxYear: Dispatch<TaxYear>
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
    taxYear: {
      id: '1',
      from: new Date(),
      to: new Date()
    },
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
  const taxYears: TaxYear[] = buildTaxYears(ClassOneCalculator.getTaxYears)
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])
  const [defaultRow, setDefaultRow] = useState<Row>(initRow)
  const [rows, setRows] = useState<Array<Row>>([defaultRow])
  const [categories, setCategories] = useState<Array<string>>([])
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')
  const [categoryTotals, setCategoryTotals] = useState<TotalsInCategories>({})
  const [result, setResult] = useState<Class1Result | null>(null)
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  useEffect(() => {
    if(taxYear.from) {
      const categoriesForTaxYear = ClassOneCalculator.getApplicableCategories(taxYear.from)
      if(categoriesForTaxYear) {
        setCategories(categoriesForTaxYear.split(''))
        setDefaultRow(prevState => ({
          ...prevState,
          category: categoriesForTaxYear[0]
        }))
      }
    }
  }, [taxYear.from])

  useEffect(() => {
    if(result && result.resultRows) {
      setRows((prevState: Row[]) => prevState.map(row => {
        const matchingRow: CalculatedRow | undefined =
          result.resultRows
            .find(resultRow =>
              resultRow.id === row.id
            )
        if(matchingRow) {
          return {
            ...row,
            ...matchingRow
          }
        }
        return row
      }))
    }

  }, [result])

  useEffect(() => {
    setRows([defaultRow])
  }, [defaultRow])

  useEffect(() => {
    setCategoryTotals(getTotalsInCategories(rows as Row[]))
  }, [rows])

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
