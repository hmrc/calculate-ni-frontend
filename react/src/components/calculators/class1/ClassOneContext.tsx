import React, {Dispatch, useEffect, useState} from "react";
import {Class1S, DetailsProps, Row, TaxYear} from "../../../interfaces";
import {periods, taxYearsCategories} from "../../../config";
import uniqid from "uniqid";
import {GenericErrors, RowsErrors} from "../../../validation/validation";

const initialState = {
  fullName: '',
  ni: '',
  reference: '',
  preparedBy: '',
  date: '',
}

export const defaultRows = [{
  id: uniqid(),
  category: taxYearsCategories[0].categories[0],
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
}

export const ClassOneContext = React.createContext<ClassOneContext>(
  {
    taxYear: taxYearsCategories[0],
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
    setErrors: () => {}
  }
)

export function useClassOneForm() {
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYearsCategories[0])
  const [rows, setRows] = useState<Array<Row>>(defaultRows)
  const [details, setDetails] = React.useReducer(stateReducer, initialState)
  const [grossTotal, setGrossTotal] = useState<Number | null>(null)
  const [rowsErrors, setRowsErrors] = useState<RowsErrors>({})
  const [errors, setErrors] = useState<GenericErrors>({})
  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')

  useEffect(() => {
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
    setNiPaidEmployee
  }
}
