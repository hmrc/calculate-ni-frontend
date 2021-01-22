import Validator from 'validator';

// types
import {Class3Row, DirectorsRow, GovDateRange, Row, TaxYear} from '../interfaces'
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
  earningsFactor: string
  taxYear: TaxYear,
  activeClass: string
}

interface Class3Payload {
  rows: Array<Class3Row>
  enteredNiDate: Date | null
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

const beforeMinimumTaxYear = (date: Date, minDate: Date) =>
  moment(date).isBefore(moment(minDate))

const afterMaximumTaxYear = (date: Date, maxDate: Date) =>
  moment(date).isAfter(moment(maxDate))

export const validateClassOnePayload = (
  payload: ClassOnePayload,
  setErrors: Dispatch<GenericErrors>
) => {
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

  validateClass1Rows(payload.rows, errors)

  if (hasKeys(errors)) {
    setErrors(errors)
    return false
  }

  return true
}

export const validateDirectorsPayload = (
  payload: DirectorsPayload,
  setErrors: Dispatch<GenericErrors>,
  taxYears: TaxYear[]
) => {
  let errors: GenericErrors = {}

  if(!payload.earningsPeriod) {
    errors.earningsPeriod = {
      name: 'Earnings period',
      link: 'earningsPeriod',
      message: 'Select either Annual or Pro Rata'
    }
  } else if (payload.earningsPeriod === PeriodLabel.PRORATA) {
    validateDirectorshipDates(payload.dateRange, taxYears, errors)
  }

  validateClass1Rows(payload.rows, errors)

  if(hasKeys(errors)) {
    setErrors(errors)
    return false
  }

  return true
}

export const validateClass2Or3Payload = (
  payload: Class2Or3Payload,
  setErrors: Dispatch<GenericErrors>
) => {
  const minDate = payload.taxYear.from
  const maxDate = payload.taxYear.to
  let errors: GenericErrors = {}
  if(!payload.activeClass) {
    errors.nationalInsuranceClass = {
      name: 'nationalInsuranceClass',
      link: 'nationalInsuranceClass',
      message: 'Select either Class 2 or Class 3'
    }
  }
  if(!payload.paymentEnquiryDate) {
    errors.paymentEnquiryDate = {
      name: 'paymentEnquiryDate',
      link: 'paymentEnquiryDateDay',
      message: 'Payment/enquiry date must be entered as a real date'
    }
  } else if(beforeMinimumTaxYear(payload.paymentEnquiryDate, minDate)) {
    errors.paymentEnquiryDate = {
      name: 'paymentEnquiryDate',
      link: 'paymentEnquiryDateDay',
      message: `Payment/enquiry date must be on or after ${moment(minDate).format(govDateFormat)}`
    }
  } else if (afterMaximumTaxYear(payload.paymentEnquiryDate, maxDate)) {
    errors.paymentEnquiryDate = {
      name: 'paymentEnquiryDate',
      link: 'paymentEnquiryDateDay',
      message: `Payment/enquiry date must be on or before ${moment(maxDate).format(govDateFormat)}`
    }
  }

  if(!payload.earningsFactor) {
    errors.earningsFactor = {
      name: 'earningsFactor',
      link: 'earningsFactor',
      message: 'Total earnings factor must be entered'
    }
  } else if(isNaN(+payload.earningsFactor)) {
    errors.earningsFactor = {
      name: 'earningsFactor',
      link: 'earningsFactor',
      message: 'Total earnings factor must be an amount of money'
    }
  } else if(parseFloat(payload.earningsFactor) < 0) {
    errors.earningsFactor = {
      name: 'earningsFactor',
      link: 'earningsFactor',
      message: 'Total earnings factor must be an amount of money greater than zero'
    }
  }

  if(Object.keys(errors).length > 0) {
    setErrors(errors)
  }

  return isEmpty(errors)
}

export const validateClass3Payload = (
  payload: Class3Payload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {}
  if(!payload.enteredNiDate) {
    errors.enteredNiDate = {
      name: 'enteredNiDate',
      link: 'enteredNiDateDay',
      message: 'Date entered NI must be entered as a real date'
    }
  }
  validateClass3Rows(payload.rows, setErrors, errors)
  if (hasKeys(errors)) {
    setErrors(errors)
    return false
  }
  return true
}

const validateClass3Rows = (rows: Array<Class3Row>, setErrors: Dispatch<GenericErrors>, errors: GenericErrors) => {
  rows.forEach((row: Class3Row, index: number) => {
    if(!row.earningsFactor) {
      errors[`${row.id}-earningsFactor`] = {
        name: `${row.id}-earningsFactor`,
        link: `${row.id}-earningsFactor`,
        message: `Earnings factor for row #${index + 1} must be entered`
      }
    } else if (isNaN(+row.earningsFactor)) {
      errors[`${row.id}-earningsFactor`] = {
        name: `${row.id}-earningsFactor`,
        link: `${row.id}-earningsFactor`,
        message: `Earnings factor for row #${index + 1} must be an amount of money`
      }
    }

  })
}

const validateClass1Rows = (rows: Array<Row | DirectorsRow>, errors: GenericErrors) => {
  rows.forEach((r: Row | DirectorsRow, index: number) => {
    if (!r.gross) {
      errors[`${r.id}-gross`] = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: `Gross pay amount for row #${index + 1} must be entered`
      }
    } else if (isNaN(+r.gross)) {
      errors[`${r.id}-gross`] = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: `Gross pay amount for row #${index + 1} must be an amount of money`
      };
    }
  })
}

const validateDirectorshipDates = (dateRange: GovDateRange, taxYears: TaxYear[], errors: GenericErrors) => {
  const minDate = taxYears[taxYears.length-1].from
  const maxDate = taxYears[0].to
  if (!dateRange.from) {
    errors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: 'Start date of directorship must be entered as a real date'
    }
  } else if(beforeMinimumTaxYear(dateRange.from, minDate)) {
    errors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: `Start date of directorship must be on or after ${moment(minDate).format(govDateFormat)}`
    }
  } else if (afterMaximumTaxYear(dateRange.from, maxDate)) {
    errors.directorshipFromDay = {
      link: 'directorshipFromDay',
      name: 'Start date of directorship',
      message: `Start date of directorship must be on or before ${moment(maxDate).format(govDateFormat)}`
    }
  }

  if (!dateRange.to) {
    errors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: 'End date of directorship must be entered as a real date'
    }
  } else if (beforeMinimumTaxYear(dateRange.to, minDate)) {
    errors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or after ${moment(minDate).format(govDateFormat)}`
    }
  } else if (afterMaximumTaxYear(dateRange.to, maxDate)) {
    errors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or before ${moment(maxDate).format(govDateFormat)}`
    }
  } else if (!errors.directorshipFromDay && dateRange.from && moment(dateRange.to).isBefore(dateRange.from)) {
    errors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or after the start date of the directorship`
    }
  } else if (!errors.directorshipFromDay && dateRange.from &&
    extractTaxYearFromDate(dateRange.from, taxYears) !==
    extractTaxYearFromDate(dateRange.to, taxYears)) {
    const taxYearForMatch = extractTaxYearFromDate(dateRange.from, taxYears)
    errors.directorshipToDay = {
      link: 'directorshipToDay',
      name: 'End date of directorship',
      message: `End date of directorship must be on or before ${moment(taxYearForMatch?.to).format(govDateFormat)} to be in the same tax year as the start date`
    }
  }
}
