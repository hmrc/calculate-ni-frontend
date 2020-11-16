// App
export interface S {
  fullName: string
  ni: string
  reference: string
  preparedBy: string
  date: string
}

export interface Errors {
  niPaidNet: string
  niPaidEmployee: string
}

export interface Row {
  id: string
  category: string
  period: string
  qty: string
  gross: string
}

export interface Calculated {
  [key: string]: number[]
}

// Table
export interface TableProps {
  rows: Row[]
  setRows: (r: Row[]) => void
  runCalcs: (r: Row[], t: Number, ty: Date) => void
  errors: object
  rowsErrors: ErrorSummaryProps['rowsErrors']
  resetTotals: () => void
  categories: string[]
  periods: string[]
}

export interface TaxYear {
  from: Date
  to: Date
}

// Totals
export interface TotalsProps {
  errors: {
    niPaidNet?: string
    niPaidEmployee?: string
  }
  grossTotal: Number | null
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
  // handleNiChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
  setNiPaidNet: (v: string) => void
  setNiPaidEmployee: (v: string) => void
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