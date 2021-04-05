import {Dispatch} from "react"
import {govDateString, hasKeys} from "../../../services/utils"
import {LateRefundsTableRowProps} from "./LateRefundsContext"
import {GenericErrors, stripCommas} from "../../../validation/validation"

interface LateRefundsPayload {
  rows: Array<LateRefundsTableRowProps>
}

export const validateLateRefundsPayload = (
  payload: LateRefundsPayload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {}
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
    } else {
      if(row.taxYear && row.paymentDate <= row.taxYear.to) {
        errors[paymentDateId] = {
          name: paymentDateId,
          link: paymentDateId,
          message: `The payment date on row #${index + 1} must be after the end of the tax year, ${govDateString(row!.taxYear!.to)}, in order to have accrued interest`
        }
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
