import {UnofficialDefermentInputRow} from "./UnofficialDefermentContext";
import {Dispatch} from "react";
import {GenericErrors} from "../../../validation/validation";
import {hasKeys} from "../../../services/utils";

interface UnofficialDefermentPayload {
  rows: UnofficialDefermentInputRow[]
  taxYear: number
}

export const validateUnofficialDefermentPayload = (
  payload: UnofficialDefermentPayload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {}
  payload.rows.forEach((row: UnofficialDefermentInputRow, index: number) => {
    const id = `${row.id}-employeeNICs`
    if(row.employeeNICs && isNaN(+row.employeeNICs)) {
      errors[id] = {
        name: id,
        link: id,
        message: `Employee National Insurance contributions for row number ${index + 1} must be an amount of money`
      }
    }
    row.bands.forEach(b => {
      const id = `${row.id}-${b.label}`
      if(b.amount && isNaN(+b.amount)) {
        errors[id] = {
          name: id,
          link: id,
          message: `${b.label} amount for row number ${index + 1} must be an amount of money`
        }
      }
    })
  })
  if(hasKeys(errors)) {
    setErrors(errors)
    return false
  }
  return true
}
