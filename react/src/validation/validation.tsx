import {Class1DebtRow, Class3Row, GovDateRange, TaxYear} from '../interfaces'
import {PeriodLabel} from "../config";
import {Dispatch} from "react";
import {extractTaxYearFromDate, govDateFormat, hasKeys, isEmpty} from "../services/utils";
import moment from "moment";
import {UnofficialDefermentRow} from "../components/calculators/unofficial-deferment/UnofficialDefermentContext";
import {DirectorsRow} from "../components/calculators/directors/DirectorsContext";
import {Row} from "../components/calculators/class1/ClassOneContext";

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

interface UnofficialDefermentPayload {
  rows: UnofficialDefermentRow[]
  taxYear: TaxYear
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

interface LateInterestPayload {
  rows: Array<Class1DebtRow>
  dateRange: GovDateRange
}

export interface GenericErrors {
  [key: string]: ErrorMessage
}

export const beforeMinimumTaxYear = (date: Date, minDate: Date) =>
  moment(date).isBefore(moment(minDate))

export const afterMaximumTaxYear = (date: Date, maxDate: Date) =>
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

export const validateUnofficialDefermentPayload = (
  payload: UnofficialDefermentPayload,
  setErrors: Dispatch<GenericErrors>
) => {
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
  setErrors: Dispatch<GenericErrors>,
  taxYears: TaxYear[]
) => {
  const errors: GenericErrors = {}
  if(payload.enteredNiDate) {
    if(afterMaximumTaxYear(payload.enteredNiDate, taxYears[0].to)) {
      errors.enteredNiDate = {
        name: 'enteredNiDate',
        link: 'enteredNiDateFromDay',
        message: `The date the customer first entered NI must be before ${moment(taxYears[0].to).format(govDateFormat)}`
      }
    }
  }
  validateClass3Rows(payload.rows, setErrors, errors, taxYears)
  if (hasKeys(errors)) {
    setErrors(errors)
    return false
  }
  return true
}

export const validateLateInterestPayload  = (
  payload: LateInterestPayload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {}

  if((payload.dateRange.hasContentFrom || payload.dateRange.hasContentTo) && !payload.dateRange.from) {
    errors.remissionPeriodFromDay = {
      name: 'remissionPeriod',
      link: 'remissionPeriodFromDay',
      message: 'Remission periods from date must be entered as a real date'
    }
  }

  if((payload.dateRange.hasContentFrom || payload.dateRange.hasContentTo) && !payload.dateRange.to) {
    errors.remissionPeriodToDay = {
      name: 'remissionPeriod',
      link: 'remissionPeriodToDay',
      message: 'Remission periods to date must be entered as a real date'
    }
  }

  validateLateInterestRows(payload.rows, setErrors, errors)
  if (hasKeys(errors)) {
    setErrors(errors)
    return false
  }
  return true
}

const validateLateInterestRows = (
  rows: Array<Class1DebtRow>,
  setErrors: Dispatch<GenericErrors>,
  errors: GenericErrors
) => {
  rows.forEach((row: Class1DebtRow, index: number) => {
    if (!row.debt) {
      errors[`${row.id}-class1-debt`] = {
        name: `${row.id}-class1-debt`,
        link: `${row.id}-class1-debt`,
        message: `Class 1 debt for row #${index + 1} must be entered`
      }
    } else if (isNaN(+row.debt)) {
      errors[`${row.id}-class1-debt`] = {
        name: `${row.id}-class1-debt`,
        link: `${row.id}-class1-debt`,
        message: `Class 1 debt for row #${index + 1} must be an amount of money`
      }
    }
  })
}

const validateClass3Rows = (
  rows: Array<Class3Row>,
  setErrors: Dispatch<GenericErrors>,
  errors: GenericErrors,
  taxYears: TaxYear[]
) => {
  const maxDate = taxYears[0].to
  const minDate = taxYears[taxYears.length - 1].from
  const coreMsg = (id: string) => ({name: id, link: id})
  rows.forEach((row: Class3Row, index: number) => {
    const fromId = `${row.id}FromDay`
    const toId = `${row.id}ToDay`
    const earningsFactorId = `${row.id}-earningsFactor`
    const dateRange = row.dateRange
    if(!dateRange.from || !dateRange.to) {
      errors[fromId] = {
        ...coreMsg(fromId),
        message: `Both start and end dates must be entered for row #${index + 1}`
      }
    } else if(beforeMinimumTaxYear(dateRange.from, minDate)) {
      errors[fromId] = {
        ...coreMsg(fromId),
        message: `Start date for row #${index + 1} must be on or after ${moment(minDate).format(govDateFormat)}`
      }
    } else if(afterMaximumTaxYear(dateRange.from, maxDate)) {
      errors[fromId] = {
        ...coreMsg(fromId),
        message: `Start date for row #${index + 1} must be on or before ${moment(maxDate).format(govDateFormat)}`
      }
    }

    if(dateRange.to && beforeMinimumTaxYear(dateRange.to, minDate)) {
      errors[toId] = {
        ...coreMsg(toId),
        message: `End date for row #${index + 1} must be on or after ${moment(minDate).format(govDateFormat)}`
      }
    } else if(dateRange.to && afterMaximumTaxYear(dateRange.to, maxDate)) {
      errors[toId] = {
        ...coreMsg(toId),
        message: `End date for row #${index + 1} must be on or before ${moment(maxDate).format(govDateFormat)}`
      }
    }

    if(!row.earningsFactor) {
      errors[earningsFactorId] = {
        ...coreMsg(earningsFactorId),
        message: `Earnings factor for row #${index + 1} must be entered`
      }
    } else if (isNaN(+row.earningsFactor)) {
      errors[earningsFactorId] = {
        ...coreMsg(earningsFactorId),
        message: `Earnings factor for row #${index + 1} must be an amount of money`
      }
    }

  })
}

const validateClass1Rows = (rows: Array<Row | DirectorsRow>, errors: GenericErrors) => {
  const manyRows = rows.length > 1
  rows.forEach((r: Row | DirectorsRow, index: number) => {
    if (!r.gross) {
      errors[`${r.id}-gross`] = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: manyRows ?
          `Gross pay amount for row #${index + 1} must be entered`
          :
          `Gross pay amount must be entered`
      }
    } else if (isNaN(+r.gross)) {
      errors[`${r.id}-gross`] = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: manyRows ?
          `Gross pay amount for row #${index + 1} must be an amount of money`
          :
          `Gross pay amount must be an amount of money`
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
