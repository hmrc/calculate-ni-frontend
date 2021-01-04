import Validator from 'validator';

// types
import {DirectorsRow, GovDateRange, Row} from '../interfaces'
import {PeriodLabel} from "../config";

interface ClassOnePayload {
  rows: Array<Row>
}

interface DirectorsPayload {
  niPaidNet: string
  niPaidEmployee: string
  dateRange: GovDateRange;
  earningsPeriod: PeriodLabel | null;
  rows: Array<DirectorsRow>
}

export interface ErrorMessage {
  name: string
  link: string
  message: string
}

export interface ClassOneErrors {
  niPaidNet?: ErrorMessage
  niPaidEmployee?: ErrorMessage
}

export interface DirectorsErrors {
  niPaidNet?: ErrorMessage
  niPaidEmployee?: ErrorMessage
  earningsPeriod?: ErrorMessage
  dateRange?: ErrorMessage
  directorshipFromDay?: ErrorMessage
  directorshipToDay?: ErrorMessage
}

export interface GenericErrors {
  [key: string]: ErrorMessage | undefined
}

export interface RowsErrors {
  [id: string]: {
    [rowName: string]: ErrorMessage
  }
}

export const validateClassOnePayload = (payload: ClassOnePayload, setRowsErrors: (rowsErrors: RowsErrors) => void) => {
  const rowErrors: RowsErrors = validateRows(payload.rows)
  if(Object.keys(rowErrors).length > 0) {
    setRowsErrors(rowErrors)
  }
  return Object.keys(rowErrors).length === 0
}

export const validateDirectorsPayload = (
  payload: DirectorsPayload,
  setErrors: (errors: GenericErrors) => void,
  setRowsErrors: (rowsErrors: RowsErrors) => void
) => {
  let errors: GenericErrors = {}
  const rowErrors: RowsErrors = validateRows(payload.rows)
  if (Object.keys(rowErrors).length > 0) {
    setRowsErrors(rowErrors)
  }

  if(!payload.earningsPeriod) {
    errors.earningsPeriod = {
      name: 'Earnings period',
      link: 'earningsPeriod',
      message: 'Select either Annual or Pro Rata'
    }
  } else if (payload.earningsPeriod === PeriodLabel.PRORATA) {
    errors = {...validateDateRange(payload.dateRange)}
  }

  if(Object.keys(errors).length > 0) {
    setErrors(errors)
  }

  return Object.keys(rowErrors).length === 0 && Object.keys(errors).length === 0
}

const validateRows = (rows: Array<Row | DirectorsRow>) => {
  const rowsErrors: RowsErrors = {}
  rows.forEach(r => {
    // Row Gross
    if (Validator.isEmpty(r.gross)) {
      rowsErrors[r.id] = rowsErrors[r.id] || {};
      rowsErrors[r.id].gross = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: 'must be entered'
      };
    } else if (!Validator.isNumeric(r.gross)) {
      rowsErrors[r.id] = rowsErrors[r.id] || {};
      rowsErrors[r.id].gross = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: 'must be an amount of money'
      };
    }
  })

  return rowsErrors as RowsErrors
}

const validateDateRange = (dateRange: GovDateRange) => {
  const dateRangeErrors: DirectorsErrors = {}
  if (!dateRange.from) {
    dateRangeErrors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: 'Start date of directorship must be entered as a real date'
    }
  }
  if (!dateRange.to) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: 'End date of directorship must be entered as a real date'
    }
  }

  return dateRangeErrors
}
