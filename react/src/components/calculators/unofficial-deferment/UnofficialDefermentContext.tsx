import React, {Dispatch, useContext, useEffect, useState} from "react";
import {Calculated, DetailsProps, GenericObject, TaxYear} from "../../../interfaces";
import {buildTaxYears} from "../../../config";
import {GenericErrors} from "../../../validation/validation";
import {ClassOneCalculator, initClassOneCalculator, NiFrontendContext} from "../../../services/NiFrontendContext";

const initRow = {
  id: 'default',
  category: '',
  nameOfEmployer: '',
  earnings1a: '0',
  earnings1b: '0',
  earnings1c: '0'
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

export interface UnofficialDefermentRow {
  id: string
  nameOfEmployer: string
  category: string
  earnings1a: string
  earnings1b: string
  earnings1c: string
  earnings1d?: string
  earnings1e?: string
  earnings1f?: string
  overUEL?: string
  NICsDueNonCO?: string
  IfNotUD?: string
  grossPay?: string
}

interface UnofficialDefermentContext {
  ClassOneCalculator: ClassOneCalculator
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
  earningsFields: Array<string>
  setEarningsFields: Dispatch<Array<string>>
  results: GenericObject
  setResults: Dispatch<GenericObject>
}

export const UnofficialDefermentContext = React.createContext<UnofficialDefermentContext>(
  {
    ClassOneCalculator:initClassOneCalculator,
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
    earningsFields: [],
    setEarningsFields: () => {},
    results: {},
    setResults: () => {}
  }
)

const getRequiredInputs = (taxYear: TaxYear) => {
  const yearString = taxYear.from.getFullYear().toString()
  const fakeMap: { [key: string]: string[] } = {
    '2003': ['a', 'b', 'c', 'd', 'f'],
    '2004': ['a', 'b', 'c', 'f'],
    '2005': ['a', 'b', 'c', 'e'],
    '2006': ['a', 'b', 'c', 'd', 'e'],
    '2007': ['a', 'b', 'c', 'f'],
    '2008': ['a', 'b', 'c', 'f'],
    '2009': ['a', 'b', 'c', 'd', 'f'],
    '2010': ['a', 'b', 'c', 'f'],
    '2011': ['a', 'b', 'c', 'd'],
    '2012': ['a', 'b', 'c', 'f'],
    '2013': ['a', 'b', 'c', 'f'],
    '2014': ['a', 'b', 'c', 'f'],
    '2015': ['a', 'b', 'c', 'd', 'f'],
    '2016': ['a', 'b', 'c', 'f'],
  }
  return fakeMap[yearString] || ['a', 'b', 'c']
}

export function useUnofficialDefermentForm() {
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const taxYears: TaxYear[] = buildTaxYears(ClassOneCalculator.getTaxYears, '')
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])
  const [defaultRow, setDefaultRow] = useState<UnofficialDefermentRow>(initRow)
  const [rows, setRows] = useState<Array<UnofficialDefermentRow>>([defaultRow])
  const [categories, setCategories] = useState<Array<string>>([])
  const [earningsFields, setEarningsFields] = useState<Array<string>>(['a', 'b', 'c'])
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  useEffect(() => {
    if(taxYear) {
      const categoriesForTaxYear = ClassOneCalculator.getApplicableCategories(taxYear.from)
      if(categoriesForTaxYear) {
        setCategories(categoriesForTaxYear.split(''))
        setEarningsFields(getRequiredInputs(taxYear))
        setDefaultRow(prevState => ({
          ...prevState,
          category: categoriesForTaxYear[0]
        }))
      }
    }
  }, [taxYear])

  useEffect(() => {
    setRows([defaultRow])
  }, [defaultRow, earningsFields])

  const [results, setResults] = useState({})

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
    calculatedRows,
    setCalculatedRows,
    categories,
    setCategories,
    activeRowId,
    setActiveRowId,
    earningsFields,
    setEarningsFields,
    results,
    setResults
  }
}
