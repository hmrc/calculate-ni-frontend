import moment from 'moment'
import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {
  TotalsInCategories,
  TotalType,
  TaxYear, GovDateRange, DateParts
} from "../interfaces";
import {ErrorMessage, stripCommas} from "../validation/validation";
import {Band, ContributionBand, Row} from "../components/calculators/class1/ClassOneContext";
import {DirectorsUIRow} from "../components/calculators/directors/DirectorsContext";

export const emptyStringToZero = (input: string) => input === '' ? 0 : parseFloat(input)

export const isEmpty = (obj: object) => Object.keys(obj).length === 0

export const hasKeys = (obj: object) => Object.keys(obj).length > 0

export const isEmptyString = (str: string) => str.length === 0 || !str.trim()

export const hasNonEmptyStrings = (stringsList: string[]) => stringsList.some(str => !isEmptyString(str))

const onlyUnique = (value: any, index: number, self: any[]) => self.indexOf(value) === index;

const getTotalsInCategory = (
  type: TotalType,
  rows: Array<Row | DirectorsUIRow>,
  category: string
) => {
  return rows
    .filter(row => row.category === category)
    .reduce((total: number, row: Row | DirectorsUIRow) =>
        row.hasOwnProperty(type) ?
          total + parseFloat(stripCommas(row[type].toString())) : total
    , 0)
}

const addBandToTotal = (band: string) =>
  (total: number, row: Row | DirectorsUIRow) => {
    const matchingBand = row.bands?.find(b => b.name === band)
    return matchingBand ? total + matchingBand.amountInBand : total
  }

const getBandTotalsInCategory = (
  band: string,
  rows: Array<Row | DirectorsUIRow>,
  category: string
) => rows
    .filter(row => row.category === category)
    .reduce(addBandToTotal(band), 0)

export const getTotalsInBand = (
  band: string,
  rows: Array<Row | DirectorsUIRow>
) =>
  rows.reduce(addBandToTotal(band), 0)

export const uniqueCategories = (rows: Array<Row | DirectorsUIRow>) => rows
    .map(r => r.category)
    .filter(onlyUnique)

export const getTotalsInCategories = (rows: Array<Row | DirectorsUIRow>) => uniqueCategories(rows)
  .reduce((list: TotalsInCategories, category: string) => {
    const eeTotal = getTotalsInCategory(TotalType.EE, rows, category)
    const erTotal = getTotalsInCategory(TotalType.ER, rows, category)
    list[category] = {
      gross: getTotalsInCategory(TotalType.GROSS, rows, category),
      ee: eeTotal,
      er: erTotal,
      contributionsTotal: eeTotal + erTotal,
      bands: rows[0].bands?.reduce((bands: Band[], nextBand: Band) => {
        bands.push({
          name: nextBand.name,
          amountInBand: getBandTotalsInCategory(nextBand.name, rows, category)
        })
        return bands
      }, [] as Band[])
    }
    return list
  }, {} as TotalsInCategories)

export const extractTaxYearFromDate = (date: Date, taxYears: TaxYear[]) => {
  const dateMoment = moment(date).utc(true)
  const match = [...taxYears]
    .find((ty: TaxYear) =>
      moment(ty.from).isSameOrBefore(dateMoment) && moment(ty.to).isSameOrAfter(dateMoment))
  return match || null
}

export function validDateParts(day: string | undefined, month: string | undefined, year: string | undefined) {
  return day && month && year && moment(`${year}-${month}-${day}`, 'YYYY-M-D').isValid()
}

export function validDateRange(parts: DateParts) {
  return validDateParts(parts.day, parts.month, parts.year)
}

export const govDateString = (date: Date) => moment(date).format(govDateFormat)
export const taxYearForBreakdown = (from: Date, to: Date) => `${from.getFullYear()} - ${to.getFullYear().toString().substr(-2)}`
export const taxYearShorthand = (taxYear: TaxYear) => `${taxYear.from.getFullYear()}/${taxYear.to.getFullYear()}`
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

export enum DatePartsNames {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year'
}

export const extractDatePartString = (part: DatePartsNames, date: Date | null | undefined) => {
  if(!date) {
    return ''
  }
  if(part === DatePartsNames.DAY) {
    return date.getDate().toString()
  }
  if(part === DatePartsNames.MONTH) {
    return (date.getMonth() + 1).toString()
  }
  if(part === DatePartsNames.YEAR) {
    return date.getFullYear().toString()
  }
  return ''
}

export const decimalToPercent = (decimal: number) => parseFloat((decimal * 1000 / 10).toString())

export const isBeforeToday = (d: Date) => moment(d).isBefore(moment())

export const zeroPad = (int: string) => int.length === 1 ? `0${int}` : int

const reduceBandNames = (rows: Row[] | DirectorsUIRow[]) => rows
    .filter((r: Row | DirectorsUIRow) => r.bands && r.bands.length > 0)
    .reduce(
        (list: string[], next: Row | DirectorsUIRow) =>
            [...list, ...next.bands?.map((n: Band) => n.name)], [] as string[]
    )
const reduceContributionBandNames = (rows: Row[] | DirectorsUIRow[]) => rows
    .filter((r: Row | DirectorsUIRow) => r.contributionBands && r.contributionBands.length > 0)
    .reduce(
        (list: string[], next: Row | DirectorsUIRow) =>
            [...list, ...next.contributionBands?.map((n: ContributionBand) => n.name)], [] as string[]
    )

export const getContributionBandNames = (rows: Row[] | DirectorsUIRow[]) => [...new Set<string>(reduceContributionBandNames(rows))]
export const getBandNames = (rows: Row[] | DirectorsUIRow[]) => [...new Set<string>(reduceBandNames(rows))]



