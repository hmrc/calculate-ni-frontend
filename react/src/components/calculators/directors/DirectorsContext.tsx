import React, {Dispatch, useContext, useEffect, useState} from "react";
import {Calculated, DetailsProps, DirectorsRow, TaxYear, TotalsInCategories} from "../../../interfaces";
import {PeriodLabel, buildTaxYears} from "../../../config";
import {GenericErrors} from "../../../validation/validation";
import {getTotalsInCategories} from "../../../services/utils";
import {NiFrontendContext} from "../../../services/NiFrontendContext";
import uniqid from 'uniqid'

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
  ee: '0',
  er: '0'
}

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

interface DirectorsContext {
  ClassOneCalculator: Calculator
  taxYears: TaxYear[]
  taxYear: TaxYear
  setTaxYear: Dispatch<TaxYear>
  defaultRow: DirectorsRow
  rows: DirectorsRow[]
  setRows: Dispatch<Array<DirectorsRow>>
  details: DetailsProps
  setDetails: Function,
  grossTotal: Number | null,
  setGrossTotal: Dispatch<Number | null>
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
  calculatedRows: Array<Calculated>
  setCalculatedRows: Dispatch<Array<Calculated>>
  categories: Array<string>
  setCategories: Dispatch<Array<string>>
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>
}

export const DirectorsContext = React.createContext<DirectorsContext>(
  {
    ClassOneCalculator: {
      calculate: () => {},
      calculateJson: () => {},
      calculateProRata: () => {},
      calculateProRataJson: () => {},
      getApplicableCategories: () => {},
      getTaxYears: ['']
    },
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
    grossTotal: null,
    setGrossTotal: () => {},
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
    calculatedRows: [],
    setCalculatedRows: () => {},
    categories: [],
    setCategories: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
  }
)

export function useDirectorsForm() {
  const [categories, setCategories] = useState<Array<string>>([])
  const [defaultRow, setDefaultRow] = useState<DirectorsRow>(initRow)
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [grossTotal, setGrossTotal] = useState<Number | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')
  const [earningsPeriod, setEarningsPeriod] = useState<PeriodLabel | null>(null)
  const [categoryTotals, setCategoryTotals] = useState<TotalsInCategories>({})
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const taxYears: TaxYear[] = buildTaxYears(ClassOneCalculator.getTaxYears, '')
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])
  useEffect(() => {
    const categories = ClassOneCalculator.getApplicableCategories(taxYear.from)
    if(categories) {
      setCategories(categories.split(''))
      setDefaultRow(prevState => ({
        ...prevState,
        category: categories[0]
      }))
    }
  }, [taxYear.from])
  const [rows, setRows] = useState<Array<DirectorsRow>>([defaultRow])
  useEffect(() => {
    setCategoryTotals(getTotalsInCategories(rows as DirectorsRow[]))
    setGrossTotal(rows.reduce((grossTotal, row) => {
      return grossTotal + parseFloat(row.gross)
    }, 0))
  }, [rows])

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
    grossTotal,
    setGrossTotal,
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
    calculatedRows,
    setCalculatedRows,
    categories,
    setCategories,
    activeRowId,
    setActiveRowId
  }
}
