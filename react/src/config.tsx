import moment from 'moment';
// types
import { TaxYear } from './interfaces'
import configuration from './configuration.json'

export interface NiCategoryNames {
  [key: string]: string
}

interface BaseConfiguration {
  [key: string]: object
}

export interface AppConfig {
  categoryNames: NiCategoryNames
  taxYears: TaxYear[]
  minTaxYear: Date
  maxTaxYear: Date
}
// tax year keys are in this format [2013-04-05,2014-04-05)
const taxYearStringFormat: RegExp = /^\[[0-9]{4}-[0-9]{2}-[0-9]{2},[0-9]{4}-[0-9]{2}-[0-9]{2}\)$/
const extractFromDateString = (ty: string) => ty.substr(1, 10)
const extractToDateString = (ty: string) => ty.substr(12, 10)
const extractCategoriesFromNiClass = (ty: object) => {
  const categories: Array<string> = []
  for(const anyKey in ty) {
    if(ty.hasOwnProperty(anyKey)) {
      const maybeHasCategories: BaseConfiguration = ty[anyKey as keyof object]
      for(const o in maybeHasCategories) {
        if(maybeHasCategories.hasOwnProperty(o) && (o === 'employee' || o === 'employer')) {
          categories.push(...Object
            .keys(maybeHasCategories[o])
            .filter(cat => !categories.includes(cat) && configuration.categoryNames.hasOwnProperty(cat))
          )
        }
      }
    }
  }
  return categories.sort()
}

const sortByTaxYear = (a: TaxYear, b: TaxYear) => (a.id < b.id ? 1 : (a.id > b.id ? -1 : 0))

const getAppConfig = () => {
  const baseConfig: BaseConfiguration = configuration
  const appConfig: AppConfig = {} as AppConfig
  const unSortedTaxYears: TaxYear[] = []
  appConfig.categoryNames = baseConfig.categoryNames as NiCategoryNames
  for (const key in baseConfig) {
    // we know all keys other than categoryNames are Ni Class names
    if (key !== 'categoryNames' && baseConfig.hasOwnProperty(key)) {
      const NiClass = baseConfig[key]
      // we know all children of NiClass are tax years
      for (const taxYearKey in NiClass) {
        if (NiClass.hasOwnProperty(taxYearKey) &&
          taxYearStringFormat.test(taxYearKey) &&
          !unSortedTaxYears.find(u => u.id === taxYearKey)) {
          try {
            const categoriesWithin = extractCategoriesFromNiClass(NiClass[taxYearKey as keyof object])
            if (categoriesWithin.length > 0) {
              unSortedTaxYears.push({
                id: taxYearKey,
                from: new Date(extractFromDateString(taxYearKey)),
                to: new Date(extractToDateString(taxYearKey)),
                categories: categoriesWithin
              })
            }
          } catch(e) {
            throw e
          }
        }
      }
    }
  }
  appConfig.taxYears = unSortedTaxYears.sort(sortByTaxYear)
  appConfig.maxTaxYear = appConfig.taxYears[0].from
  appConfig.minTaxYear = appConfig.taxYears[appConfig.taxYears.length -1].from
  return appConfig
}

export const appConfig = getAppConfig()

console.log('appConfig', appConfig)

export const momentDateFormat = 'D MMMM YYYY'

export const stripSpaces = (str: string) => str.toLowerCase().split(' ').join('-')

export enum PeriodValue {
  WEEKLY = 'Wk',
  FORTNIGHTLY = 'Frt',
  MONTHLY = 'Mnth',
  FOURWEEKLY = '4wk',
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

export const taxYearString = (ty: TaxYear) => `${moment(ty.from).format(momentDateFormat)} - ${moment(ty.to).format(momentDateFormat)}`
