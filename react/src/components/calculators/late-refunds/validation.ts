import {Dispatch} from "react"
import {hasKeys} from "../../../services/utils"
import {LateRefundsTableRowProps} from "./LateRefundsContext"
import {GenericErrors, stripCommas} from "../../../validation/validation"

interface LateRefundsPayload {
  rows: Array<LateRefundsTableRowProps>
  bankHolidaysNo: string
}

export const validateLateRefundsPayload = (
  payload: LateRefundsPayload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {}

  if (isNaN(+payload.bankHolidaysNo)) {
    errors[`bankHolidays`] = {
      name: `bankHolidays`,
      link: `bankHolidays`,
      message: `Number of bank holidays must be a number between 1 and 4`
    }
  } else if (parseInt(payload.bankHolidaysNo) > 4) {
    errors[`bankHolidays`] = {
      name: `bankHolidays`,
      link: `bankHolidays`,
      message: `Number of bank holidays must be a number between 1 and 4`
    }
  }

  validateLateRefundsRows(payload.rows, errors)

  if (hasKeys(errors)) {
    setErrors(errors)
    return false
  }
  return true
}

const validateLateRefundsRows = (
  rows: Array<LateRefundsTableRowProps>,
  errors: GenericErrors
) => {
  rows.forEach((row: LateRefundsTableRowProps, index: number) => {
    const refund = stripCommas(row.refund)
    const refundId = `${row.id}-refund`
    const paymentDateId = `${row.id}-paymentDateDay`
    if(!row.paymentDate) {
      errors[paymentDateId] = {
        name: paymentDateId,
        link: paymentDateId,
        message: `Payment date for row #${index + 1} must be entered as a real date`
      }
    }
    if(!refund) {
      errors[refundId] = {
        name: refundId,
        link: refundId,
        message: `Refund amount for row #${index + 1} must be entered`
      }
    } else if (isNaN(+refund)) {
      errors[refundId] = {
        name: refundId,
        link: refundId,
        message: `Refund amount for row #${index + 1} must be an amount of money`
      }
    }
  })
}
