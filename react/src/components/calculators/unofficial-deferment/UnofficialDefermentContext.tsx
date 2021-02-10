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
  earningsFields: Bands
  setEarningsFields: Dispatch<Bands>
  results: GenericObject
  setResults: Dispatch<GenericObject>
}

interface EarningsBand {
  limit?: number
  field: string
  label?: string
}

interface Bands {
  [key: string]: EarningsBand
}

const defaultBands = {
  a: {limit: 112, label: 'Lower earning limit', field: 'LEL'},
  b: {limit: 155, label: 'Primary threshold', field:  'LEL - PT'},
  c: {limit: 827, label: 'Upper earning limit', field: 'PT - UEL'},
  f: {field: 'Employee NICS'}
}

const getRequiredInputs = (taxYear: TaxYear) => {
  const yearString = taxYear.from.getFullYear().toString()
  const fakeMap: { [key: string]: Bands } = {
    '2003': {
      a: {limit: 77, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 89, label: 'Earning threshold', field: 'LEL - ET'},
      c: {limit: 595, label: 'Upper earning limit', field: 'ET - UEL'},
      e: {field: 'Employee NICS'}
    },
    '2004': {
      a: {limit: 79, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 91, label: 'Earning threshold', field: 'LEL - ET'},
      c: {limit: 610, label: 'Upper earning limit', field: 'ET - UEL'},
      e: {field: 'Employee NICS'}
    },
    '2005': {
      a: {limit: 82, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 94, label: 'Earning threshold', field: 'LEL - ET'},
      c: {limit: 630, label: 'Upper earning limit', field: 'ET - UEL'},
      e: {field: 'Employee NICS'}
    },
    '2006': {
      a: {limit: 84, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 97, label: 'Earning threshold', field: 'LEL - ET'},
      c: {limit: 645, label: 'Upper earning limit', field: 'ET - UEL'},
      e: {field: 'Employee NICS'}
    },
    '2007': {
      a: {limit: 87, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 100, label: 'Earning threshold', field: 'LEL - ET'},
      c: {limit: 670, label: 'Upper earning limit', field: 'ET - UEL'},
      e: {field: 'Employee NICS'}
    },
    '2008': {
      a: {limit: 90, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 105, label: 'Earning threshold', field: 'LEL - ET'},
      c: {limit: 770, label: 'Upper earning limit', field: 'ET - UEL'},
      e: {field: 'Employee NICS'}
    },
    '2009': {
      a: {limit: 95, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 110, label: 'Primary threshold', field: 'LEL - PT'},
      c: {limit: 770, label: 'Upper accrual point', field: 'PT - UAP'},
      d: {limit: 844, label: 'Upper earning limit', field: 'UAP - UEL'},
      f: {field: 'Employee NICS'}
    },
    '2010': {
      a: {limit: 97, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 110, label: 'Primary threshold', field: 'LEL - PT'},
      c: {limit: 770, label: 'Upper accrual point', field: 'PT - UAP'},
      d: {limit: 844, label: 'Upper earning limit', field: 'UAP - UEL'},
      f: {field: 'Employee NICS'}
    },
    '2011': {
      a: {limit: 102, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 139, label: 'Primary threshold', field: 'LEL - PT'},
      c: {limit: 770, label: 'Upper accrual point', field: 'PT - UAP'},
      d: {limit: 817, label: 'Upper earning limit', field: 'UAP - UEL'},
      f: {field: 'Employee NICS'}
    },
    '2012': {
      a: {limit: 107, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 146, label: 'Primary threshold', field: 'LEL - PT'},
      c: {limit: 770, label: 'Upper accrual point', field: 'PT - UAP'},
      d: {limit: 817, label: 'Upper earning limit', field: 'UAP - UEL'},
      f: {field: 'Employee NICS'}
    },
    '2013': {
      a: {limit: 109, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 149, label: 'Primary threshold', field: 'LEL - PT'},
      c: {limit: 770, label: 'Upper accrual point', field: 'PT - UAP'},
      d: {limit: 797, label: 'Upper earning limit', field: 'UAP - UEL'},
      f: {field: 'Employee NICS'}
    },
    '2014': {
      a: {limit: 111, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 153, label: 'Primary threshold', field: 'LEL - PT'},
      c: {limit: 770, label: 'Upper accrual point', field: 'PT - UAP'},
      d: {limit: 805, label: 'Upper earning limit', field: 'UAP - UEL'},
      f: {field: 'Employee NICS'}
    },
    '2015': {
      a: {limit: 112, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 155, label: 'Primary threshold', field: 'LEL - PT'},
      c: {limit: 770, label: 'Upper accrual point', field: 'PT - UAP'},
      d: {limit: 815, label: 'Upper earning limit', field: 'UAP - UEL'},
      f: {field: 'Employee NICS'}
    },
    '2016': {
      a: {limit: 112, label: 'Lower earning limit', field: 'LEL'},
      b: {limit: 155, label: 'Primary threshold', field: 'LEL - PT'},
      c: {limit: 827, label: 'Upper earning limit', field: 'PT - UEL'},
      f: {field: 'Employee NICS'}
    }
  }
  return fakeMap[yearString] || defaultBands
}

export const UnofficialDefermentContext = React.createContext<UnofficialDefermentContext>(
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
    errors: {},
    setErrors: () => {},
    calculatedRows: [],
    setCalculatedRows: () => {},
    categories: [],
    setCategories: () => {},
    activeRowId: null,
    setActiveRowId: () => {},
    earningsFields: defaultBands,
    setEarningsFields: () => {},
    results: {},
    setResults: () => {}
  }
)

export function useUnofficialDefermentForm() {
  const {
    NiFrontendInterface
  } = useContext(NiFrontendContext)
  const ClassOneCalculator = NiFrontendInterface.classOne
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])
  const [defaultRow, setDefaultRow] = useState<UnofficialDefermentRow>(initRow)
  const [rows, setRows] = useState<Array<UnofficialDefermentRow>>([defaultRow])
  const [categories, setCategories] = useState<Array<string>>([])
  const [earningsFields, setEarningsFields] = useState<Bands>(defaultBands)
  const [details, setDetails] = React.useReducer(detailsReducer, initialDetails)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [activeRowId, setActiveRowId] = useState<string | null>(null)
  useEffect(() => {
    if(taxYear?.from) {
      const categoriesForTaxYear = ClassOneCalculator.getApplicableCategories(taxYear.from)
      if(categoriesForTaxYear) {
        setCategories(categoriesForTaxYear.split(''))
        setEarningsFields(getRequiredInputs(taxYear))
        setDefaultRow(prevState => ({
          ...prevState,
          category: categoriesForTaxYear[0]
        }))
        setResults({})
        setRows([defaultRow])
      }
    }
  }, [taxYear, ClassOneCalculator])

  useEffect(() => {
    setRows([defaultRow])
  }, [defaultRow, earningsFields])

  useEffect(() => {
    setTaxYear(taxYears[0])
  }, [taxYears])

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassOneCalculator.getTaxYears)
    setTaxYears(taxYearData)
  }, [ClassOneCalculator])

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
