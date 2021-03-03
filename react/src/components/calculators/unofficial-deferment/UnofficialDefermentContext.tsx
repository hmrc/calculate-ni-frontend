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

export interface UnofficialDefermentBand {
  name: string
  label: string
  limit: string
  value?: string
}

export interface UnofficialDefermentRow {
  id: string
  nameOfEmployer: string
  category: string
  bands: Array<UnofficialDefermentBand>
  employeeNICs: string
  overUEL?: string
  NICsDueNonCO?: string
  IfNotUD?: string
  grossPay?: string
}

interface UnofficialDefermentContext {
  ClassOneCalculator: ClassOneCalculator
  UnofficialDefermentCalculator: UnofficialDefermentCalculator
  taxYears: TaxYear[]
  taxYear: TaxYear
  setTaxYear: Dispatch<TaxYear>
  defaultRow: UnofficialDefermentRow,
  rows: Array<UnofficialDefermentRow>
  setRows: Dispatch<Array<UnofficialDefermentRow>>
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
  results: GenericObject
  setResults: Dispatch<GenericObject>,
  bands: UnofficialDefermentBand[],
  setBands: Dispatch<UnofficialDefermentBand[]>
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
    results: {},
    setResults: () => {},
    bands: [],
    setBands: () => {}
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
  const [defaultRow, setDefaultRow] = useState<UnofficialDefermentRow>(initRow)
  const [rows, setRows] = useState<Array<UnofficialDefermentRow>>([defaultRow])
  const [categories, setCategories] = useState<Array<string>>([])
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  const [bands, setBands] = useState<Array<UnofficialDefermentBand>>([])
  useEffect(() => {
    if(taxYear?.from) {
      const categoriesForTaxYear = ClassOneCalculator.getApplicableCategories(taxYear.from)
      if(categoriesForTaxYear) {
        setCategories(categoriesForTaxYear.split(''))
        const bandsForTaxYear = UnofficialDefermentCalculator.getBandsForTaxYear(taxYear.from)
        setBands(bandsForTaxYear)
        console.log('bands', bandsForTaxYear)
        setDefaultRow(prevState => ({
          ...prevState,
          category: categoriesForTaxYear[0],
          bands: [...bandsForTaxYear]
        }))
        setResults({})
        setRows([defaultRow])
      }
    }
  }, [taxYear, ClassOneCalculator, UnofficialDefermentCalculator])

  useEffect(() => {
    setRows([defaultRow])
  }, [defaultRow])

  useEffect(() => {
    setTaxYear(taxYears[0])
  }, [taxYears])

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassOneCalculator.getTaxYears)
    setTaxYears(taxYearData.filter(ty => ty.from.getFullYear() < 2017 && ty.from.getFullYear() > 2002))
  }, [ClassOneCalculator])

  const [results, setResults] = useState({})

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
    setBands
  }
}
