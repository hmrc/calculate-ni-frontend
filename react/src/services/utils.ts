import moment from 'moment'
import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {
  TotalsInCategories,
  TotalType,
  TaxYear
} from "../interfaces";
import {ErrorMessage} from "../validation/validation";
import {Row} from "../components/calculators/class1/ClassOneContext";
import {DirectorsRow} from "../components/calculators/directors/DirectorsContext";

export const emptyStringToZero = (input: string) => input === '' ? 0 : parseFloat(input)

export const isEmpty = (obj: object) => Object.keys(obj).length === 0

export const hasKeys = (obj: object) => Object.keys(obj).length > 0

export const isEmptyString = (str: string) => str.length === 0 || !str.trim()

export const hasNonEmptyStrings = (stringsList: string[]) => stringsList.some(str => !isEmptyString(str))

const onlyUnique = (value: any, index: number, self: any[]) => self.indexOf(value) === index;

const getTotalsInCategory = (type: TotalType, rows: Array<Row | DirectorsRow>, category: string) => {
  return rows
    .filter(row => row.category === category)
    .reduce((total: number, row: Row | DirectorsRow) => {

      if(row.hasOwnProperty(type)) {
        return total + parseFloat(row[type].toString())
      }

      return total
    }, 0)
}

export const uniqueCategories = (rows: Array<Row | DirectorsRow>) => rows
    .map(r => r.category)
    .filter(onlyUnique)

export const getTotalsInCategories = (rows: Array<Row | DirectorsRow>) => uniqueCategories(rows)
  .reduce((list, next: string) => {
    const eeTotal = getTotalsInCategory(TotalType.EE, rows, next)
    const erTotal = getTotalsInCategory(TotalType.ER, rows, next)
    list[next] = {
      gross: getTotalsInCategory(TotalType.GROSS, rows, next),
      ee: eeTotal,
      er: erTotal,
      contributionsTotal: eeTotal + erTotal
    }
    return list
  }, {} as TotalsInCategories)

export const extractTaxYearFromDate = (date: Date, taxYears: TaxYear[]) => {
  const dateMoment = moment(date)
  const match = taxYears
    .find((ty: TaxYear) =>
      moment(ty.from).isSameOrBefore(dateMoment) && moment(ty.to).isSameOrAfter(dateMoment))
  return match || null
}

export function validDateParts(day: string, month: string, year: string) {
  return day && month && year && moment(`${year}-${month}-${day}`, 'YYYY-M-D').isValid()
}

export const govDateString = (date: Date) => moment(date).format(govDateFormat)
export const dateStringSlashSeparated = (date: Date) => moment(date).format('DD/MM/YYYY')

export const goveDateRangeString = (dateRangeObject: TaxYear) => {
  return `${moment(dateRangeObject.from).format(govDateFormat)} - ${moment(dateRangeObject.to).format(govDateFormat)}`
}

export const latestDate = (a: Date, b: Date) => moment(a).isBefore(moment(b)) ? b : a

export const getNumberOfWeeks = (a: Date, b: Date) =>
  moment(b).diff(moment(a), 'weeks' )

export const govDateFormat = 'D MMMM YYYY'

interface DescribedByKeys {
  hint?: string,
  error?: ErrorMessage,
  extraContent?: Array<string>
}
export const buildDescribedByKeys = (
  id: string,
  describedByKeys: DescribedByKeys
) => {
  const keys = []
  if (describedByKeys.hint) {
    keys.push(`${id}-hint`)
  }
  if(describedByKeys.error) {
    keys.push(`${id}-error`)
  }

  describedByKeys.extraContent && describedByKeys.extraContent.forEach(key => {
    keys.push(`${id}-${key}`)
  })

  return keys.join(' ')
}

export const sterlingStringValue = (value: string) => numeral(value).format('$0,0.00')
