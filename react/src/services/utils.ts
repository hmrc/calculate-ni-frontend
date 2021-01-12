import moment from 'moment'
import {
  Calculated,
  DirectorsRow,
  OverOrUnder,
  Row,
  TotalsInCategories,
  TotalType,
  TaxYear
} from "../interfaces";

export const emptyStringToZero = (input: string) => input === '' ? 0 : parseFloat(input)

export const isEmpty = (obj: object) => Object.keys(obj).length === 0

export const hasKeys = (obj: object) => Object.keys(obj).length > 0

export function sumOfContributionsInRow(calculatedRow: Calculated, type: number): number {
  return Object.keys(calculatedRow).reduce((prev, key) => {
    return prev + calculatedRow[key][type]
  }, 0)
}

export function addResultsToRow(row: Row | DirectorsRow, calculatedRow: any) {
  row.ee = sumOfContributionsInRow(calculatedRow, 1).toString()
  row.er = sumOfContributionsInRow(calculatedRow, 2).toString()
  row.bands = calculatedRow
  return row
}

export function updateRowInResults(rows: Array<any>, calculatedRow: any, index: number) {
  const newRows = [...rows]
  newRows[index] = addResultsToRow(newRows[index], calculatedRow)
  return newRows;
}

export const calculateNiDue = (calculatedRows: Calculated[], arrPosition: number) => (
  calculatedRows.reduce((totalContributionsDue: number, calculatedRow: Calculated) =>
    totalContributionsDue + sumOfContributionsInRow(calculatedRow, arrPosition)
  , 0)
)

export const overUnderPaymentDisplay = (value: number, type: OverOrUnder) => {
  if (type === OverOrUnder.UNDER) {
    return (value > 0) ? value : 0
  } else {
    return (value < 0) ? Math.abs(value) : 0
  }
}

const onlyUnique = (value: any, index: number, self: any[]) => self.indexOf(value) === index;

const getTotalsInCategory = (type: TotalType, rows: Array<Row | DirectorsRow>, category: string) => {
  return rows
    .filter(row => row.category === category)
    .reduce((total: number, row: Row | DirectorsRow) => {
      return total + parseFloat(row[type])
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
  return day && month && year && moment(`${year}-${month}-${day}`).isValid()
}