import Validator from 'validator';

// types
import {DirectorsRow, GovDateRange, Row, TaxYear} from '../interfaces'
import {PeriodLabel} from "../config";
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

interface Class2Or3Payload {
  paymentEnquiryDate: Date | null
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
  setErrors: Dispatch<GenericErrors>,
  taxYears: TaxYear[]
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
  setRowsErrors: Dispatch<RowsErrors>,
  taxYears: TaxYear[]
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
    errors = {...validateDirectorshipDates(payload.dateRange, taxYears)}
  }

  if(Object.keys(errors).length > 0) {
    setErrors(errors)
  }

  return isEmpty(rowErrors) && isEmpty(errors)
}

export const validateClass2Or3Payload = (
  payload: Class2Or3Payload,
  setErrors: Dispatch<GenericErrors>
) => {
  let errors: GenericErrors = {}
  if(!payload.paymentEnquiryDate) {
    errors.paymentEnquiryDate = {
      name: 'Payment/enquiry date',
      link: 'payment-enquiry-date',
      message: 'Payment/enquiry date must be entered as a real date'
    }
  }

  if(Object.keys(errors).length > 0) {
    setErrors(errors)
  }

  return isEmpty(errors)
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

const beforeMinimumTaxYear = (date: Date, minDate: Date) =>
  moment(date).isBefore(moment(minDate))

const afterMaximumTaxYear = (date: Date, maxDate: Date) =>
  moment(date).isAfter(moment(maxDate))

const validateDirectorshipDates = (dateRange: GovDateRange, taxYears: TaxYear[]) => {
  const dateRangeErrors: GenericErrors = {}
  const minDate = taxYears[taxYears.length-1].from
  const maxDate = taxYears[0].to
  
  if (!dateRange.from) {
    dateRangeErrors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: 'Start date of directorship must be entered as a real date'
    }
  } else if(beforeMinimumTaxYear(dateRange.from, minDate)) {
    dateRangeErrors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: `Start date of directorship must be on or after ${moment(minDate).format(govDateFormat)}`
    }
  } else if (afterMaximumTaxYear(dateRange.from, maxDate)) {
    dateRangeErrors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: `Start date of directorship must be on or before ${moment(maxDate).format(govDateFormat)}`
    }
  }

  if (!dateRange.to) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: 'End date of directorship must be entered as a real date'
    }
  } else if (beforeMinimumTaxYear(dateRange.to, minDate)) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or after ${moment(minDate).format(govDateFormat)}`
    }
  } else if (afterMaximumTaxYear(dateRange.to, maxDate)) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or before ${moment(maxDate).format(govDateFormat)}`
    }
  } else if (!dateRangeErrors.directorshipFromDay && dateRange.from && moment(dateRange.to).isBefore(dateRange.from)) {
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or after the start date of the directorship`
    }
  } else if (!dateRangeErrors.directorshipFromDay && dateRange.from &&
    extractTaxYearFromDate(dateRange.from, taxYears) !==
    extractTaxYearFromDate(dateRange.to, taxYears)) {
    const taxYearForMatch = extractTaxYearFromDate(dateRange.from, taxYears)
    dateRangeErrors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or before ${moment(taxYearForMatch?.to).format(govDateFormat)} to be in the same tax year as the start date`
    }
  }

  return dateRangeErrors
}
