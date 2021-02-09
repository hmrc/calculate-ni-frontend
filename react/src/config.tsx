import moment from 'moment';
// types
import {GovDateRange, TaxYear} from './interfaces'

export enum NiClassName {
  CLASS_ONE = "classOne",
  CLASS_ONE_AB = "classOneAB",
  CLASS_TWO = "classTwo",
  CLASS_THREE = "classThree",
  CLASS_FOUR = "classFour"
}

// tax year keys are in this format [2013-04-05, 2014-04-05)
export const taxYearStringFormat: RegExp = /^\[[0-9]{4}-[0-9]{2}-[0-9]{2}, [0-9]{4}-[0-9]{2}-[0-9]{2}\)$/
export const extractFromDateString = (ty: string) => ty.substr(1, 10)
export const extractToDateString = (ty: string) => ty.substr(13, 10)
export const sortByTaxYear = (a: TaxYear, b: TaxYear) => (a.id < b.id ? 1 : (a.id > b.id ? -1 : 0))
export const buildTaxYears = (config: Array<string>) => config
  .filter(k => taxYearStringFormat.test(k))
  .map((ty: string) => ({
    id: ty,
    from: new Date(extractFromDateString(ty)),
    to: new Date(extractToDateString(ty))
  })).sort(sortByTaxYear)

export const momentDateFormat = 'D MMMM YYYY'

export const stripSpaces = (str: string) => str.toLowerCase().split(' ').join('-')

export enum PeriodValue {
  WEEKLY = 'W',
  FORTNIGHTLY = '2W',
  MONTHLY = 'M',
  FOURWEEKLY = '4W',
  ANNUAL = 'Ann',
  PRORATA = 'Prr'
}

export enum PeriodLabel {
  WEEKLY = 'Weekly',
  FORTNIGHTLY = 'Fortnightly',
  MONTHLY = 'Monthly',
  FOURWEEKLY = 'Four weekly',
  ANNUAL = 'Annual',
  PRORATA = 'Pro Rata'
}

export const periods: Array<PeriodValue> = [
  PeriodValue.WEEKLY,
  PeriodValue.FORTNIGHTLY,
  PeriodValue.MONTHLY,
  PeriodValue.FOURWEEKLY
]

export const periodValueToLabel = (str: PeriodValue) => {
  switch (str) {
    case PeriodValue.WEEKLY:
      return PeriodLabel.WEEKLY
    case PeriodValue.FORTNIGHTLY:
      return PeriodLabel.FORTNIGHTLY
    case PeriodValue.MONTHLY:
      return PeriodLabel.MONTHLY
    case PeriodValue.FOURWEEKLY:
      return PeriodLabel.FOURWEEKLY
  }
}

export const dateRangeString = (dateRange: GovDateRange) => {
  return `${moment(dateRange.from).format(momentDateFormat)} - ${moment(dateRange.to).format(momentDateFormat)}`
}

export const taxYearString = (ty: TaxYear, onlyStartYear?: boolean) => {
  if (!onlyStartYear) {
    return `${moment(ty.from).format(momentDateFormat)} - ${moment(ty.to).format(momentDateFormat)}`
  } else {
    return `${moment(ty.from).format('YYYY')}`
  }
}

export const taxYearFromString = (ty: TaxYear) => `${moment(ty.from).format(momentDateFormat)}`
  
