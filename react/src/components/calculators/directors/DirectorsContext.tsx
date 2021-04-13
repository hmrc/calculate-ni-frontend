import React, {Dispatch, SetStateAction, useContext, useEffect, useState} from "react";
import {DetailsProps, GenericObject, GovDateRange, TaxYear, TotalsInCategories} from "../../../interfaces";
import {PeriodLabel, buildTaxYears} from "../../../config";
import {GenericErrors} from "../../../validation/validation";
import {getTotalsInCategories} from "../../../services/utils";
import {
  categoryNamesToObject,
  ClassOneCalculator,
  DirectorsCalculator, initClassOneCalculator,
  initDirectorsCalculator,
  NiFrontendContext
} from "../../../services/NiFrontendContext";
import uniqid from 'uniqid'
import {Band, CalculatedRow, Class1Result} from "../class1/ClassOneContext";

export interface DirectorsUIRow {
  id: string
  category: string
  gross: string
  ee: number
  er: number
  bands?: Band[],
  explain?: string[]
}

export interface DirectorsRowInterface {
  id: string,
  category: string,
  grossPay: number
}

const initialDetails: DetailsProps = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

const initRow: DirectorsUIRow = {
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
  DirectorsCalculator: DirectorsCalculator
  ClassOneCalculator: ClassOneCalculator
  taxYears: TaxYear[]
  taxYear: TaxYear | null
  setTaxYear: Dispatch<TaxYear>
  defaultRow: DirectorsUIRow
  rows: DirectorsUIRow[]
  setRows: Dispatch<Array<DirectorsUIRow>>
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
  setResult: Dispatch<Class1Result | null>,
  askApp: boolean | undefined,
  setAskApp: Dispatch<boolean | undefined>,
  app: string | null,
  setApp: Dispatch<string | null>,
  dateRange: GovDateRange,
  setDateRange: Dispatch<SetStateAction<GovDateRange>>
  categoryNames: GenericObject
}

export const DirectorsContext = React.createContext<DirectorsContext>(
  {
    DirectorsCalculator: initDirectorsCalculator,
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
    setResult: () => {},
    askApp: undefined,
    setAskApp: () => {},
    app: '',
    setApp: () => {},
    dateRange: {from: null, to: null},
    setDateRange: () => {},
    categoryNames: {}
  }
)

export function useDirectorsForm() {
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const DirectorsCalculator = NiFrontendInterface.directors
  const [taxYear, setTaxYear] = useState<TaxYear | null>(null)
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const [categories, setCategories] = useState<Array<string>>([])
  const [categoryNames, setCategoryNames] = useState<GenericObject>({})
  const [defaultRow, setDefaultRow] = useState<DirectorsUIRow>(initRow)
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')
  const [earningsPeriod, setEarningsPeriod] = useState<PeriodLabel | null>(null)
  const [categoryTotals, setCategoryTotals] = useState<TotalsInCategories>({})
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [result, setResult] = useState<Class1Result | null>(null)
  const [askApp, setAskApp] = useState<boolean | undefined>(undefined)
  const [app, setApp] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<GovDateRange>((() => ({from: null, to: null})))
  useEffect(() => {
    if(taxYear && taxYear.from) {
      const isAppApplicable = DirectorsCalculator.isAppropriatePersonalPensionSchemeApplicable(taxYear.from)
      setApp(null)
      setEarningsPeriod(null)
      setAskApp(isAppApplicable || undefined)
      setCategoryNames(categoryNamesToObject(ClassOneCalculator.getCategoryNames))
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
  }, [taxYear, ClassOneCalculator, DirectorsCalculator])
  const [rows, setRows] = useState<Array<DirectorsUIRow>>([defaultRow])

  useEffect(() => {
    if(taxYear && taxYear.from) {
      setDateRange(() => ({
        from: taxYear.from,
        to: taxYear.to
      }))
    }
  }, [earningsPeriod, taxYear])

  useEffect(() => {
    if(result && result.resultRows) {
      setRows((prevState: DirectorsUIRow[]) => prevState.map(row => {
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
      setCategoryTotals(getTotalsInCategories(rows as DirectorsUIRow[]))
    } else {
      setRows((prevState: DirectorsUIRow[]) => prevState.map(row => {
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
    const taxYearData = buildTaxYears(DirectorsCalculator.getTaxYearsWithOptions)
    setTaxYears(taxYearData)
  }, [DirectorsCalculator, NiFrontendInterface])

  useEffect(() => {
    setResult(null)
  }, [niPaidNet, niPaidEmployee])

  return {
    DirectorsCalculator,
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
    setResult,
    askApp,
    setAskApp,
    app,
    setApp,
    dateRange,
    setDateRange,
    categoryNames
  }
}
