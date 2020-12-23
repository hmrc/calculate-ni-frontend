// App

import {PeriodLabel, PeriodValue} from "../config";
import {RowsErrors, GenericErrors} from "../validation/validation";

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
  period: PeriodValue
  gross: string
  ee: string
  er: string
  bands?: Calculated
}

export interface DirectorsRow {
  id: string
  category: string
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
  errors: object
  rowsErrors: ErrorSummaryProps['rowsErrors']
  resetTotals: () => void
  setTaxYear: (ty: TaxYear) => void
  taxYear: TaxYear
  setShowSummary: (v: boolean) => void
}

export interface DirectorsTableProps {
  rows: DirectorsRow[]
  setRows: (r: DirectorsRow[]) => void
  errors: GenericErrors
  rowsErrors: RowsErrors
  resetTotals: () => void
  setTaxYear: (ty: TaxYear) => void
  taxYear: TaxYear
  setShowSummary: (v: boolean) => void
  dateRange: GovDateRange
  setDateRange: Function
  earningsPeriod: PeriodLabel | null
  handlePeriodChange: (value: PeriodLabel) => void
  handleChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
}

export interface EarningsProps {
  rowsErrors?: RowsErrors;
  taxYear: TaxYear;
  showBands: boolean;
}

export interface ClassOneEarningsProps extends EarningsProps {
  rows: Array<Row>;
  activeRowID?: string | null;
  handleChange?: (r: Row, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange?: (r: Row, e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface DirectorsEarningsProps extends EarningsProps {
  rows: Array<DirectorsRow>;
  handleChange?: (r: DirectorsRow, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange?: (r: DirectorsRow, e: React.ChangeEvent<HTMLSelectElement>) => void;
  earningsPeriod: PeriodLabel | null
}

// Totals
export interface TotalsProps {
  reset: boolean;
  setReset: Function;
  grossPayTally: boolean
  errors?: GenericErrors | null
  grossTotal?: Number | null
  calculatedRows: Array<Calculated>;
  isSaveAndPrint: boolean
}

export enum OverOrUnder {
  OVER = 'over',
  UNDER = 'under'
}

// Errors
export interface ErrorSummaryProps {
  errors: GenericErrors
  rowsErrors: RowsErrors
}

// Save Print
export interface SavePrintBaseProps {
  title: string,
  setShowSummary: (v: boolean) => void
  details: Class1S
  taxYearString: string
  taxYear: TaxYear
  grossTotal: Number | null
  calculatedRows: Calculated[]
  reset: boolean;
  setReset: Function;
}

export interface ClassOnePrint extends SavePrintBaseProps {
  rows: Array<Row>
}

export interface DirectorsPrint extends SavePrintBaseProps {
  rows: Array<DirectorsRow>
  earningsPeriod: PeriodLabel | null
}

export interface CategoryTotalsProps {
  rows: Array<Row | DirectorsRow>
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

export interface GovDateRange {
  from: Date | null;
  to: Date | null;
}
