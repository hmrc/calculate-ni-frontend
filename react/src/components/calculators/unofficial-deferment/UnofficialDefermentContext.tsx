import React, {Dispatch, useContext, useEffect, useState} from "react";
import {Calculated, DetailsProps, TaxYear} from "../../../interfaces";
import {GenericErrors} from "../../../validation/validation";
import {
  initUnofficialDefermentCalculator,
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

export interface BandAmount {
  label: string,
  amount?: number
}

export interface UnofficialDefermentRowBase {
  id: string
  nameOfEmployer: string
  category: string
  employeeNICs: string
  bands: Array<BandAmount>
}

export interface UnofficialDefermentInputRow extends UnofficialDefermentRowBase {
  overUel?: string
  nicsNonCo?: string
  ifNotUd?: string
  gross?: string
}

export interface UnofficialDefermentRequestRow extends UnofficialDefermentRowBase {
  bands: Array<BandAmount>
}

interface UnofficialDefermentContext {
  UnofficialDefermentCalculator: UnofficialDefermentCalculator
  taxYears: number[]
  taxYear: number
  setTaxYear: Dispatch<number>
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
  bands: BandAmount[],
  setBands: Dispatch<BandAmount[]>
  userBands: BandAmount[],
  setUserBands: Dispatch<BandAmount[]>
}

export const UnofficialDefermentContext = React.createContext<UnofficialDefermentContext>(
  {
    UnofficialDefermentCalculator: initUnofficialDefermentCalculator,
    taxYears: [],
    taxYear: 2016,
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
  const UnofficialDefermentCalculator = NiFrontendInterface.unofficialDeferment
  const [taxYears, setTaxYears] = useState<number[]>([])
  const [taxYear, setTaxYear] = useState<number>(taxYears[0])
  const [defaultRow, setDefaultRow] = useState<UnofficialDefermentInputRow>(initRow)
  const [rows, setRows] = useState<Array<UnofficialDefermentInputRow>>([defaultRow])
  const [categories, setCategories] = useState<Array<string>>([])
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [bands, setBands] = useState<Array<BandAmount>>([])
  const [userBands, setUserBands] = useState<Array<BandAmount>>([])

  useEffect(() => {
    if(taxYear) {
      const categoriesForTaxYear = [...new Set<string>(UnofficialDefermentCalculator.getCategories(taxYear))]
      if(categoriesForTaxYear) {
        setCategories(categoriesForTaxYear.sort())
        const bandsForTaxYear = UnofficialDefermentCalculator.getBandsForTaxYear(taxYear)
        setUserBands(bandsForTaxYear)
        const bandLimits = UnofficialDefermentCalculator.getBandInputNames(taxYear)
        setBands(bandLimits)
        setDefaultRow(prevState => ({
          ...prevState,
          category: categoriesForTaxYear[0],
          bands: [...bandLimits]
        }))
        setResults(null)
        setRows([defaultRow])
      }
    }
  }, [taxYear, UnofficialDefermentCalculator])

  useEffect(() => {
    setRows([defaultRow])
  }, [defaultRow])

  useEffect(() => {
    setTaxYear(taxYears[0])
  }, [taxYears])

  useEffect(() => {
    setTaxYears(UnofficialDefermentCalculator.getTaxYears.sort().reverse())
  }, [UnofficialDefermentCalculator])

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
