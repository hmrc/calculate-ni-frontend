import Validator from 'validator';

// types
import {DirectorsRow, GovDateRange, Row} from '../interfaces'
import {appConfig, PeriodLabel} from "../config";
import {Dispatch} from "react";
import {extractTaxYearFromDate, govDateFormat, hasKeys, isEmpty} from "../services/utils";
import moment from "moment";

interface ClassOnePayload {
  rows: Array<Row>
  niPaidNet: string
  niPaidEmployee: string
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

export interface GenericErrors {
  [key: string]: ErrorMessage
}

export interface RowsErrors {
  [id: string]: {
    [rowName: string]: ErrorMessage
  }
}

export const validateClassOnePayload = (
  payload: ClassOnePayload,
  setRowsErrors: Dispatch<RowsErrors>,
  setErrors: Dispatch<GenericErrors>
) => {
  console.log('validating class one', payload)
  const errors: GenericErrors = {}
  if(payload.niPaidNet === '' && payload.niPaidEmployee !== '') {
    errors.niPaidNet = {
      link: 'niPaidNet',
      name: 'Net NI paid',
      message: 'NI paid net contributions must be entered'
    }
  }
  if(payload.niPaidEmployee === '' && payload.niPaidNet !== '') {
    errors.niPaidEmployee = {
      link: 'niPaidEmployee',
      name: 'Net NI paid by employee',
      message: 'NI paid employee contributions must be entered'
    }
  }
  if (hasKeys(errors)) {
    console.log('errors hasKeys', hasKeys(errors))
    setErrors(errors)
  }
  const rowErrors: RowsErrors = validateRows(payload.rows)
  if (hasKeys(rowErrors)) {
    setRowsErrors(rowErrors)
  }

  return isEmpty(rowErrors) && isEmpty(errors)
}

export const validateDirectorsPayload = (
  payload: DirectorsPayload,
  setErrors: Dispatch<GenericErrors>,
  setRowsErrors: Dispatch<RowsErrors>
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
    errors = {...validateDirectorshipDates(payload.dateRange)}
  }

  if(Object.keys(errors).length > 0) {
    setErrors(errors)
  }

  return isEmpty(rowErrors) && isEmpty(errors)
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

const beforeMinimumTaxYear = (date: Date) =>
  moment(date).isBefore(moment(appConfig.minTaxYear))

const afterMaximumTaxYear = (date: Date) =>
  moment(date).isAfter(moment(appConfig.maxTaxYear))

const validateDirectorshipDates = (dateRange: GovDateRange) => {
  const dateRangeErrors: GenericErrors = {}
  
  if (!dateRange.from) {
    dateRangeErrors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: 'Start date of directorship must be entered as a real date'
    }
  } else if(beforeMinimumTaxYear(dateRange.from)) {
    dateRangeErrors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: `Start date of directorship must be on or after ${moment(appConfig.minTaxYear).format(govDateFormat)}`
    }
  } else if (afterMaximumTaxYear(dateRange.from)) {
    dateRangeErrors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: `Start date of directorship must be on or before ${moment(appConfig.maxTaxYear).format(govDateFormat)}`
    }
  }

  if (!dateRange.to) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: 'End date of directorship must be entered as a real date'
    }
  } else if (beforeMinimumTaxYear(dateRange.to)) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or after ${moment(appConfig.minTaxYear).format(govDateFormat)}`
    }
  } else if (afterMaximumTaxYear(dateRange.to)) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or before ${moment(appConfig.maxTaxYear).format(govDateFormat)}`
    }
  } else if (!dateRangeErrors.directorshipFromDay && dateRange.from && moment(dateRange.to).isBefore(dateRange.from)) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or after the start date of the directorship`
    }
  } else if (!dateRangeErrors.directorshipFromDay && dateRange.from &&
    extractTaxYearFromDate(dateRange.from, appConfig.taxYears) !==
    extractTaxYearFromDate(dateRange.to, appConfig.taxYears)) {
    const taxYearForMatch = extractTaxYearFromDate(dateRange.from, appConfig.taxYears)
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or before ${moment(taxYearForMatch?.to).format(govDateFormat)} to be in the same tax year as the start date`
    }
  }

  return dateRangeErrors
}
