import React, {Dispatch, useEffect, useState} from "react";
import {Calculated, DetailsProps, Row, TaxYear, TotalsInCategories} from "../../../interfaces";
import {periods, buildTaxYears} from "../../../config";
import uniqid from "uniqid";
import {GenericErrors} from "../../../validation/validation";
import {getTotalsInCategories} from "../../../services/utils";
import {NiFrontend} from '../../../calculation'
import configuration from "../../../configuration.json";

const NiFrontendInterface = new NiFrontend(JSON.stringify(configuration))
const ClassOneCalculator = NiFrontendInterface.classOne
console.log('ClassOneCalculator', ClassOneCalculator)
const taxYears: TaxYear[] = buildTaxYears(ClassOneCalculator.getTaxYears, '')

const initialDetails = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

export const defaultRows = [{
  id: uniqid(),
  category: ClassOneCalculator.getApplicableCategories(taxYears[0].from)[0],
  period: periods[0],
  gross: '',
  number: 1,
  ee: '0',
  er: '0'
}]

const detailsReducer = (state: DetailsProps, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})

interface Calculator {
  calculate: Function
  calculateJson: Function
  calculateProRata: Function
  calculateProRataJson: Function
  getApplicableCategories: Function
  getTaxYears: Array<string>
}

interface ClassOneContext {
  ClassOneCalculator: Calculator
  taxYears: TaxYear[]
  taxYear: TaxYear
  setTaxYear: Dispatch<TaxYear>
  rows: Array<Row>
  setRows: Dispatch<Array<Row>>
  details: DetailsProps
  setDetails: Function,
  grossTotal: Number | null
  setGrossTotal: Dispatch<Number | null>
  niPaidNet: string
  setNiPaidNet: Dispatch<string>
  niPaidEmployee: string
  setNiPaidEmployee: Dispatch<string>
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  categoryTotals: TotalsInCategories
  setCategoryTotals: Dispatch<TotalsInCategories>
  calculatedRows: Array<Calculated>
  setCalculatedRows: Dispatch<Array<Calculated>>
  categories: Array<string>
  setCategories: Dispatch<Array<string>>
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>
  setPeriodNumbers: Function
}

export const ClassOneContext = React.createContext<ClassOneContext>(
  {
    ClassOneCalculator: ClassOneCalculator,
    taxYears: taxYears,
    taxYear: taxYears[0],
    setTaxYear: () => {},
    rows: defaultRows,
    setRows: () => {},
    details: initialDetails,
    setDetails: () => {},
    grossTotal: null,
    setGrossTotal: () => {},
    niPaidNet: '',
    setNiPaidNet: () => {},
    niPaidEmployee: '',
    setNiPaidEmployee: () => {},
    errors: {},
    setErrors: () => {},
    categoryTotals: {},
    setCategoryTotals: () => {},
    calculatedRows: [],
    setCalculatedRows: () => {},
    categories: [],
    setCategories: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    setPeriodNumbers: () => {}
  }
)

export function useClassOneForm() {
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])
  const [categories, setCategories] = useState<Array<string>>([])
  const [rows, setRows] = useState<Array<Row>>(defaultRows)
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [grossTotal, setGrossTotal] = useState<Number | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')
  const [categoryTotals, setCategoryTotals] = useState<TotalsInCategories>({})
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  useEffect(() => {
    setCategoryTotals(getTotalsInCategories(rows as Row[]))
    setGrossTotal(rows.reduce((grossTotal, row) => {
      return grossTotal + parseFloat(row.gross)
    }, 0))
  }, [rows])

  useEffect(() => {
    const categories = ClassOneCalculator.getApplicableCategories(taxYear.from)
    setCategories(categories.split(''))
  }, [taxYear.from])

  const setPeriodNumbers = (deletedRow: string | undefined) => {
    for (let period in periods) {
      let periodAccumulator = 0
      const newRows = deletedRow ?
        [...rows.filter((row: Row) => row.id !== deletedRow)]
        :
        [...rows]
      newRows.forEach(row => {
        if(periods[period] === row.period) {
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
    rows,
    setRows,
    details,
    setDetails,
    grossTotal,
    setGrossTotal,
    errors,
    setErrors,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    categoryTotals,
    setCategoryTotals,
    calculatedRows,
    setCalculatedRows,
    categories,
    setCategories,
    activeRowId,
    setActiveRowId,
    setPeriodNumbers
  }
}
