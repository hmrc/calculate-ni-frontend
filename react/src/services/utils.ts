import moment from 'moment'
import numeral from 'numeral'
import 'numeral/locales/en-gb';
import {
  TotalsInCategories,
  TotalType,
  TaxYear
} from "../interfaces";
import {ErrorMessage, stripCommas} from "../validation/validation";
import {Band, Row} from "../components/calculators/class1/ClassOneContext";
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

export function validDateParts(day: string, month: string, year: string) {
  return day && month && year && moment(`${year}-${month}-${day}`, 'YYYY-M-D').isValid()
}

export const govDateString = (date: Date) => moment(date).format(govDateFormat)
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

export const maybeFromBounds = (value: string) => {
  const amount = /\(([^)]+)\)/.exec(value)
  return amount ? amount[1] : value
}

