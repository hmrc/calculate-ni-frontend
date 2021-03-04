import {Class1DebtRow, Class3Row, GovDateRange, LateRefundsTableRowProps, TaxYear} from '../interfaces'
import {PeriodLabel} from "../config";
import {Dispatch} from "react";
import {extractTaxYearFromDate, govDateFormat, hasKeys, isEmpty} from "../services/utils";
import moment from "moment";
import {UnofficialDefermentInputRow} from "../components/calculators/unofficial-deferment/UnofficialDefermentContext";
import {DirectorsUIRow} from "../components/calculators/directors/DirectorsContext";
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
  rows: Array<DirectorsUIRow>
  askApp: boolean | undefined
  app: string | null
  taxYear: TaxYear | null
}

interface UnofficialDefermentPayload {
  rows: UnofficialDefermentInputRow[]
  taxYear: number
}

interface Class2Or3Payload {
  paymentEnquiryDate: Date | null
  earningsFactor: string
  taxYear: TaxYear | null,
  activeClass: string,
  finalDate: Date | null
}

interface Class3Payload {
  rows: Array<Class3Row>
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
  dateRange: GovDateRange,
  hasRemissionPeriod: boolean | null
}

interface LateRefundsPayload {
  rows: Array<LateRefundsTableRowProps>
  bankHolidaysNo: string
}

export interface GenericErrors {
  [key: string]: ErrorMessage
}

export const beforeMinimumDate = (date: Date, minDate: Date) =>
  moment(date).isBefore(moment(minDate))

export const afterMaximumDate = (date: Date, maxDate: Date) =>
  moment(date).isAfter(moment(maxDate))

export const stripCommas = (val: string) => val.replace(/,/g, '')

const validateNiPaid = (errors: GenericErrors, niPaidNet: string, niPaidEmployee: string) => {
  const net = stripCommas(niPaidNet)
  const employee = stripCommas(niPaidEmployee)
  if(net === '' && employee !== '') {
    errors.niPaidNet = {
      link: 'niPaidNet',
      name: 'Net NI paid',
      message: 'NI paid net contributions must be entered'
    }
  } else if (net !== '' && net !== '') {
    if(isNaN(+net)) {
      errors.niPaidNet = {
        link: 'niPaidNet',
        name: 'Net NI paid',
        message: 'NI paid net contributions must be an amount of money'
      }
    } else if(!isNaN(+employee) && parseFloat(net) < parseFloat(employee)) {
      errors.niPaidNet = {
        link: 'niPaidNet',
        name: 'Net NI paid',
        message: 'NI paid net contributions cannot be less than employee contributions'
      }
    } else if(isNaN(+employee)) {
      errors.niPaidEmployee = {
        link: 'niPaidNet',
        name: 'Net NI paid',
        message: 'NI paid employee contributions must be an amount of money'
      }
    }
  } else if(employee === '' && net !== '') {
    errors.niPaidEmployee = {
      link: 'niPaidEmployee',
      name: 'Net NI paid by employee',
      message: 'NI paid employee contributions must be entered'
    }
  }
}

export const validateClassOnePayload = (
  payload: ClassOnePayload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {}
  validateNiPaid(errors, payload.niPaidNet, payload.niPaidEmployee)
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
  validateNiPaid(errors, payload.niPaidNet, payload.niPaidEmployee)
  if(!payload.earningsPeriod) {
    errors.earningsPeriod = {
      name: 'Earnings period',
      link: 'earningsPeriod',
      message: 'Select either Annual or Pro Rata'
    }
  } else if (payload.earningsPeriod === PeriodLabel.PRORATA) {
    validateDirectorshipDates(payload.taxYear, payload.dateRange, taxYears, errors)
  }

  if(payload.askApp && !payload.app) {
    errors.app = {
      name: 'app',
      link: 'app',
      message: 'Select yes if an Appropriate Personal Pension Scheme is applicable'
    }
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
  const maxDate = payload.finalDate
  const earningsFactor = stripCommas(payload.earningsFactor)
  let errors: GenericErrors = {}
  if(!payload.activeClass || !payload.taxYear) {
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
  } else if (maxDate && afterMaximumDate(payload.paymentEnquiryDate, maxDate)) {
    errors.paymentEnquiryDate = {
      name: 'paymentEnquiryDate',
      link: 'paymentEnquiryDateDay',
      message: `Payment/enquiry date must be on or before ${moment(maxDate).format(govDateFormat)}`
    }
  }

  if(!earningsFactor) {
    errors.earningsFactor = {
      name: 'earningsFactor',
      link: 'earningsFactor',
      message: 'Total earnings factor must be entered'
    }
  } else if(isNaN(+earningsFactor)) {
    errors.earningsFactor = {
      name: 'earningsFactor',
      link: 'earningsFactor',
      message: 'Total earnings factor must be an amount of money'
    }
  } else if(parseFloat(earningsFactor) < 0) {
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
  validateClass3Rows(payload.rows, setErrors, errors)
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

  if(payload.hasRemissionPeriod !== true && payload.hasRemissionPeriod !== false) {
    errors.hasRemissionPeriod = {
      name: 'hasRemissionPeriod',
      link: 'hasRemissionPeriod',
      message: 'Select yes if there is a remission period'
    }
  }

  if(payload.hasRemissionPeriod === true && !payload.dateRange.from) {
    errors.remissionPeriodFromDay = {
      name: 'remissionPeriod',
      link: 'remissionPeriodFromDay',
      message: 'Remission period start date must be entered as a real date'
    }
  }

  if(payload.hasRemissionPeriod === true  && !payload.dateRange.to) {
    errors.remissionPeriodToDay = {
      name: 'remissionPeriod',
      link: 'remissionPeriodToDay',
      message: 'Remission period end date must be entered as a real date'
    }
  }

  validateLateInterestRows(payload.rows, setErrors, errors)
  if (hasKeys(errors)) {
    setErrors(errors)
    return false
  }
  return true
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

  validateLateRefundsRows(payload.rows, setErrors, errors)

  if (hasKeys(errors)) {
    setErrors(errors)
    return false
  }
  return true
}

const validateLateRefundsRows = (
  rows: Array<LateRefundsTableRowProps>,
  setErrors: Dispatch<GenericErrors>,
  errors: GenericErrors
) => {
  rows.forEach((row: LateRefundsTableRowProps, index: number) => {
    const refund = stripCommas(row.refund)
    if(!refund) {
      errors[`${row.id}-refund`] = {
        name: `${row.id}-refund`,
        link: `${row.id}-refund`,
        message: `Refund amount for row #${index + 1} must be entered`
      }
    } else if (isNaN(+refund)) {
      errors[`${row.id}-refund`] = {
        name: `${row.id}-refund`,
        link: `${row.id}-refund`,
        message: `Refund amount for row #${index + 1} must be an amount of money`
      }
    }
  })
}

const validateLateInterestRows = (
  rows: Array<Class1DebtRow>,
  setErrors: Dispatch<GenericErrors>,
  errors: GenericErrors
) => {
  rows.forEach((row: Class1DebtRow, index: number) => {
    const debt = stripCommas(row.debt)
    if (!debt) {
      errors[`${row.id}-class1-debt`] = {
        name: `${row.id}-class1-debt`,
        link: `${row.id}-class1-debt`,
        message: `Class 1 debt for row #${index + 1} must be entered`
      }
    } else if (isNaN(+debt)) {
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
  errors: GenericErrors
) => {
  const coreMsg = (id: string) => ({name: id, link: id})
  rows.forEach((row: Class3Row, index: number) => {
    const fromId = `${row.id}FromDay`
    const toId = `${row.id}ToDay`
    const dateRange = row.dateRange
    if(!dateRange.from || !dateRange.to) {
      errors[fromId] = {
        ...coreMsg(fromId),
        message: `Both start and end dates must be entered for row #${index + 1}`
      }
    } else if(beforeMinimumDate(dateRange.to, dateRange.from)) {
      errors[toId] = {
        ...coreMsg(toId),
        message: `End date for row #${index + 1} must be on or after ${moment(dateRange.from).format(govDateFormat)}`
      }
    }

  })
}

const validateClass1Rows = (rows: Array<Row | DirectorsUIRow>, errors: GenericErrors) => {
  const manyRows = rows.length > 1
  rows.forEach((r: Row | DirectorsUIRow, index: number) => {
    const gross = stripCommas(r.gross)
    if (!gross) {
      errors[`${r.id}-gross`] = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: manyRows ?
          `Gross pay amount for row #${index + 1} must be entered`
          :
          `Gross pay amount must be entered`
      }
    } else if (isNaN(+gross)) {
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

const validateDirectorshipDates = (taxYear: TaxYear | null, dateRange: GovDateRange, taxYears: TaxYear[], errors: GenericErrors) => {
  if(taxYear) {
    const minDate = taxYear?.from
    const maxDate = taxYear?.to
    if (!dateRange.from) {
      errors.directorshipFromDay = {
        link: 'directorshipFromDay',
        name: 'Start date of directorship',
        message: 'Start date of directorship must be entered as a real date'
      }
    } else if(beforeMinimumDate(dateRange.from, minDate)) {
      errors.directorshipFromDay = {
        link: 'directorshipFromDay',
        name: 'Start date of directorship',
        message: `Start date of directorship must be on or after ${moment(minDate).format(govDateFormat)}`
      }
    } else if (afterMaximumDate(dateRange.from, maxDate)) {
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
    } else if (beforeMinimumDate(dateRange.to, minDate)) {
      errors.directorshipToDay = {
        link: 'directorshipToDay',
        name: 'End date of directorship',
        message: `End date of directorship must be on or after ${moment(minDate).format(govDateFormat)}`
      }
    } else if (afterMaximumDate(dateRange.to, maxDate)) {
      errors.directorshipToDay = {
        link: 'directorshipToDay',
        name: 'End date of directorship',
        message: `End date of directorship must be on or before ${moment(maxDate).format(govDateFormat)}`
      }
    } else if (!errors.directorshipFromDay && dateRange.from && moment(dateRange.to).isBefore(moment(dateRange.from))) {
      errors.directorshipToDay = {
        link: 'directorshipToDay',
        name: 'End date of directorship',
        message: `End date of directorship must be on or after the start date of the directorship`
      }
    }
  }
}
