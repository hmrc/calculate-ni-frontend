import React, {Dispatch, useEffect, useState} from "react";
import {Calculated, Class1S, DetailsProps, Row, TaxYear, TotalsInCategories} from "../../../interfaces";
import {periods, appConfig} from "../../../config";
import uniqid from "uniqid";
import {GenericErrors, RowsErrors} from "../../../validation/validation";
import {getTotalsInCategories} from "../../../services/utils";

const initialState = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

export const defaultRows = [{
  id: uniqid(),
  category: appConfig.taxYears[0].categories[0],
  period: periods[0],
  gross: '',
  number: '0',
  ee: '0',
  er: '0'
}]

const stateReducer = (state: Class1S, action: { [x: string]: string }) => ({
  ...state,
  ...action,
})

interface ClassOneContext {
  taxYear: TaxYear
  setTaxYear: Dispatch<TaxYear>
  rows: Array<Row>
  setRows: Dispatch<Array<Row>>
  details: DetailsProps
  setDetails: Function,
  rowsErrors: RowsErrors,
  setRowsErrors: Dispatch<RowsErrors>
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
}

export const ClassOneContext = React.createContext<ClassOneContext>(
  {
    taxYear: appConfig.taxYears[0],
    setTaxYear: () => {},
    rows: defaultRows,
    setRows: () => {},
    details: initialState,
    setDetails: () => {},
    rowsErrors: {},
    setRowsErrors: () => {},
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
    setCalculatedRows: () => {}
  }
)

export function useClassOneForm() {
  const [taxYear, setTaxYear] = useState<TaxYear>(appConfig.taxYears[0])
  const [rows, setRows] = useState<Array<Row>>(defaultRows)
  const [details, setDetails] = React.useReducer(stateReducer, initialState)
  const [grossTotal, setGrossTotal] = useState<Number | null>(null)
  const [rowsErrors, setRowsErrors] = useState<RowsErrors>({})
  const [errors, setErrors] = useState<GenericErrors>({})
  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')
  const [categoryTotals, setCategoryTotals] = useState<TotalsInCategories>({})
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])

  useEffect(() => {
    setCategoryTotals(getTotalsInCategories(rows as Row[]))
    setGrossTotal(rows.reduce((grossTotal, row) => {
      return grossTotal + parseFloat(row.gross)
    }, 0))
  }, [rows])

  return {
    taxYear,
    setTaxYear,
    rows,
    setRows,
    details,
    setDetails,
    grossTotal,
    setGrossTotal,
    rowsErrors,
    setRowsErrors,
    errors,
    setErrors,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    categoryTotals,
    setCategoryTotals,
    calculatedRows,
    setCalculatedRows
  }
}
