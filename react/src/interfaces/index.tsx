// App

export interface RouteName {
  pathname: string
  name: string
}

export interface HeaderProps {
  serviceName: string
}

export interface PhaseBannerProps {
  type: "ALPHA" | "BETA"
  link: string
}

export interface DetailsProps {
  fullName: string
  ni: string
  reference: string
  preparedBy: string
  date: string
  handleChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
}

export interface Class1S {
  fullName: string
  ni: string
  reference: string
  preparedBy: string
  date: string
}

export interface DirectorsS {
  fullName: string
  ni: string
  reference: string
  preparedBy: string
  date: string
  directorshipFromDay: string
  directorshipFromMonth: string
  directorshipFromYear: string
  directorshipToDay: string
  directorshipToMonth: string
  directorshipToYear: string
}

export interface Errors {
  niPaidNet: string
  niPaidEmployee: string
}

export interface Calculated {
  [key: string]: number[]
}

export interface Row {
  id: string
  category: string
  number: string
  period: string
  gross: string
  ee: string
  er: string
  bands?: Calculated
}

// Table
export interface TaxYear {
  id: string
  from: Date
  to: Date
  categories: string[]
}

export interface Class1TableProps {
  rows: Row[]
  setRows: (r: Row[]) => void
  runCalcs: (r: Row[], ty: Date) => void
  errors: object
  rowsErrors: ErrorSummaryProps['rowsErrors']
  resetTotals: () => void
  periods: string[]
  setTaxYear: (ty: TaxYear) => void
  taxYear: TaxYear
  setShowSummary: (v: Boolean) => void
}

export interface DirectorsTableProps {
  rows: Row[]
  setRows: (r: Row[]) => void
  runCalcs: (r: Row[], ty: Date) => void
  errors: object
  rowsErrors: ErrorSummaryProps['rowsErrors']
  resetTotals: () => void
  periods: string[]
  setTaxYear: (ty: TaxYear) => void
  taxYear: TaxYear
  setShowSummary: (v: Boolean) => void
  directorshipFromDay: string
  directorshipFromMonth: string
  directorshipFromYear: string
  directorshipToDay: string
  directorshipToMonth: string
  directorshipToYear: string
  earningsPeriod: string | null
  handlePeriodChange: (value: string) => void
  handleChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
}

export interface CT {
  rows: Row[]
  rowsErrors?: ErrorSummaryProps['rowsErrors']
  activeRowID?: string | null
  periods: string[]
  taxYear: TaxYear
  // niData: Calculated[]
  handleChange?: (r: Row, e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectChange?: (r: Row, e: React.ChangeEvent<HTMLSelectElement>) => void
  showBands: boolean
}


// Totals
export interface TotalsProps {
  grossPayTally: boolean
  errors?: {
    niPaidNet?: string
    niPaidEmployee?: string
  }
  grossTotal?: Number | null
  niPaidNet: string
  niPaidEmployee: string
  niPaidEmployer: number
  netContributionsTotal: number
  employeeContributionsTotal: number
  employerContributionsTotal: number
  underpaymentNet: number
  overpaymentNet: number
  underpaymentEmployee: number
  overpaymentEmployee: number
  underpaymentEmployer: number
  overpaymentEmployer: number
  setNiPaidNet: (v: string) => void
  setNiPaidEmployee: (v: string) => void
  isSaveAndPrint: boolean
}

// Errors
export interface ErrorSummaryProps {
  errors: {
    niPaidNet?: string
    niPaidEmployee?: string
  }
  rowsErrors: {
    [id: string]: {
      [rowName: string]: {
        link?: string
        message?: string
        name?: string
      }
    }
  }
}

// Save Print
export interface SavePrintProps {
  setShowSummary: (v: Boolean) => void
  details: Class1S
  taxYearString: string
  rows: Row[]
  periods: string[]
  taxYear: TaxYear
  // niData: Calculated[]
  grossTotal: Number | null
  niPaidNet: string
  setNiPaidNet: (v: string) => void
  niPaidEmployee: string
  setNiPaidEmployee: (v: string) => void
  niPaidEmployer: number
  netContributionsTotal: number
  employeeContributionsTotal: number
  employerContributionsTotal: number
  underpaymentNet: number
  overpaymentNet: number
  underpaymentEmployee: number
  overpaymentEmployee: number
  underpaymentEmployer: number
  overpaymentEmployer: number
}

export interface CategoryTotalsProps {
  rows: Row[]
  categoriesList: string[]
}

// Helpers
export interface  SummaryListRowProps {
  listKey: string
  listValue: string
  rowClasses?: String
}

export interface TextInputProps {
  labelText: string
  labelClass?: string
  hiddenLabel?: boolean 
  name: string
  inputClassName: string
  inputValue: string
  placeholderText?: string
  pattern?: string
  inputMode?: "numeric"
  onChangeCallback: React.ChangeEventHandler<HTMLInputElement>
  onBlurCallback?: React.ChangeEventHandler<HTMLInputElement>
}