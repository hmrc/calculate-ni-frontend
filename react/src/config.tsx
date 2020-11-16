import moment from 'moment';

// types
import { Calculated } from './interfaces'
import { TaxYear } from './components/Table'

export const momentDateFormat = 'MMMM Do YYYY'

export const fcn = (str: string) => {
  switch (str) {
    case 'A':
      return 'A - Regular'
      case 'B':
        return 'B - Married women and widows'
      case 'C':
        return 'C - Pension age'
      case 'J':
        return 'J - Deferred'
      case 'H':
        return 'H - Apprentice under 25'
      case 'M':
        return 'M - Under 21'
      case 'Z':
        return 'Z - Deferred and under 21'
      case 'X':
        return 'X - Exempt'
  }
}

export const categories = [
  'A',
  'B',
  'C',
  'J',
  'H',
  'M',
  'Z',
  'X'
]

export const periods = [
  'Wk',
  'Mnth',
  '4Wk',
  'Ann'
]

export const fpn = (str: string) => {
  switch (str) {
    case 'Wk':
      return 'Weekly'
    case 'Mnth':
      return 'Monthly'
    case '4Wk':
      return 'Four week'
    case 'Ann':
      return 'Yearly'
  }
}

export const taxYearString = (ty: TaxYear) => `${moment(ty.from).format(momentDateFormat)} - ${moment(ty.to).format(momentDateFormat)}`

export const taxYears = [
  {
    from: new Date('2019-4-6'),
    to: new Date('2020-4-5')
  }, 
  {
    from: new Date('2018-4-6'),
    to: new Date('2019-4-5')
  }, 
  {
    from: new Date('2017-4-6'),
    to: new Date('2018-4-5')
  }, 
  {
    from: new Date('2016-4-6'),
    to: new Date('2017-4-5')
  }
]

export const calcOverUnderPayment = (value: number, type: string) => {
  if (type === 'under') {
    return (value > 0) ? value : 0
  } else {
    return (value < 0) ? Math.abs(value) : 0
  }
}

export const calcNi = (c: Calculated[], arrPosition: number) => (
  c.reduce((prev, cur) => {
    return prev + Object.keys(cur).reduce((prev, key) => {
      return prev + cur[key][arrPosition]
    }, 0)
  }, 0)
)
