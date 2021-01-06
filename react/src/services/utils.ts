import {Calculated, DirectorsRow, OverOrUnder, Row} from "../interfaces";

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