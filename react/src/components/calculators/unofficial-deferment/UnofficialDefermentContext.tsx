import React, {Dispatch, useContext, useEffect, useState} from "react";
import {Calculated, DetailsProps, GenericObject, TaxYear} from "../../../interfaces";
import {buildTaxYears} from "../../../config";
import {GenericErrors} from "../../../validation/validation";
import {
  ClassOneCalculator,
  initClassOneCalculator, initUnofficialDefermentCalculator,
  NiFrontendContext,
  UnofficialDefermentCalculator
} from "../../../services/NiFrontendContext";

const initRow = {
  id: 'default',
  category: '',
  nameOfEmployer: '',
  bands: [],
  employeeNICs: ''
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

export interface UnofficialDefermentResults {
  annualMax: number
  liability: number
  difference: number
  ifNotUD: number
  resultRows: UnofficialDefermentResultRow[]
}

export interface UnofficialDefermentResultRow {
  id: string
  gross: number,
  overUel: number,
  nicsNonCo: number,
  ifNotUd : number
}

export interface UnofficialDefermentBand {
  name: string
  label: string
  limit: string
  value?: string
}

export interface UserDefinedRequestBand {
  name: string,
  label: string,
  value: number
}

export interface UnofficialDefermentRowBase {
  id: string
  nameOfEmployer: string
  category: string
  employeeNICs: string
}

export interface UnofficialDefermentInputRow extends UnofficialDefermentRowBase {
  bands: Array<UnofficialDefermentBand>
  overUel?: string
  nicsNonCo?: string
  ifNotUd?: string
  gross?: string
}

export interface UnofficialDefermentRequestRow extends UnofficialDefermentRowBase {
  bands: Array<UserDefinedRequestBand>
}

interface UnofficialDefermentContext {
  ClassOneCalculator: ClassOneCalculator
  UnofficialDefermentCalculator: UnofficialDefermentCalculator
  taxYears: TaxYear[]
  taxYear: TaxYear
  setTaxYear: Dispatch<TaxYear>
  defaultRow: UnofficialDefermentInputRow,
  rows: Array<UnofficialDefermentInputRow>
  setRows: Dispatch<Array<UnofficialDefermentInputRow>>
  details: DetailsProps
  setDetails: Function,
  errors: GenericErrors
  setErrors: Dispatch<GenericErrors>
  calculatedRows: Array<Calculated>
  setCalculatedRows: Dispatch<Array<Calculated>>
  categories: Array<string>
  setCategories: Dispatch<Array<string>>
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>,
  results: UnofficialDefermentResults | null
  setResults: Dispatch<UnofficialDefermentResults | null>,
  bands: UnofficialDefermentBand[],
  setBands: Dispatch<UnofficialDefermentBand[]>
  userBands: UnofficialDefermentBand[],
  setUserBands: Dispatch<UnofficialDefermentBand[]>
}

export const UnofficialDefermentContext = React.createContext<UnofficialDefermentContext>(
  {
    ClassOneCalculator: initClassOneCalculator,
    UnofficialDefermentCalculator: initUnofficialDefermentCalculator,
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
    errors: {},
    setErrors: () => {},
    calculatedRows: [],
    setCalculatedRows: () => {},
    categories: [],
    setCategories: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    results: null,
    setResults: () => {},
    bands: [],
    setBands: () => {},
    userBands: [],
    setUserBands: () => {}
  }
)

export function useUnofficialDefermentForm() {
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const UnofficialDefermentCalculator = NiFrontendInterface.unofficialDeferment
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])
  const [defaultRow, setDefaultRow] = useState<UnofficialDefermentInputRow>(initRow)
  const [rows, setRows] = useState<Array<UnofficialDefermentInputRow>>([defaultRow])
  const [categories, setCategories] = useState<Array<string>>([])
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [bands, setBands] = useState<Array<UnofficialDefermentBand>>([])
  const [userBands, setUserBands] = useState<Array<UnofficialDefermentBand>>([])

  useEffect(() => {
    if(taxYear?.from) {
      const categoriesForTaxYear = ClassOneCalculator.getApplicableCategories(taxYear.from)
      if(categoriesForTaxYear) {
        setCategories(categoriesForTaxYear.split(''))
        const bandsForTaxYear = UnofficialDefermentCalculator.getBandsForTaxYear(taxYear.from)
        setBands(bandsForTaxYear)
        setDefaultRow(prevState => ({
          ...prevState,
          category: categoriesForTaxYear[0],
          bands: [...bandsForTaxYear]
        }))
        setResults(null)
        setRows([defaultRow])
      }
    }
  }, [taxYear, ClassOneCalculator, UnofficialDefermentCalculator])

  useEffect(() => {
    setRows([defaultRow])
  }, [defaultRow])

  useEffect(() => {
    setUserBands([...bands])
  }, [bands])

  useEffect(() => {
    setTaxYear(taxYears[0])
  }, [taxYears])

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassOneCalculator.getTaxYears)
    setTaxYears(taxYearData.filter(ty => ty.from.getFullYear() < 2017 && ty.from.getFullYear() > 2002))
  }, [ClassOneCalculator])

  const [results, setResults] = useState<UnofficialDefermentResults | null>(null)

  useEffect(() => {
    if(results) {
      setRows(rows.map((row: UnofficialDefermentInputRow) => {
        const resultRow: UnofficialDefermentResultRow | undefined = results.resultRows.find(r => r.id === row.id)
        return resultRow ? {...row, ...resultRow} as any : row
      }))
    } else {
      setRows(rows.map((row: UnofficialDefermentInputRow) => {
        delete row.ifNotUd
        delete row.overUel
        delete row.gross
        delete row.nicsNonCo
        return row
      }))
    }
  }, [results])

  return {
    ClassOneCalculator,
    UnofficialDefermentCalculator,
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
    calculatedRows,
    setCalculatedRows,
    categories,
    setCategories,
    activeRowId,
    setActiveRowId,
    results,
    setResults,
    bands,
    setBands,
    userBands,
    setUserBands
  }
}
