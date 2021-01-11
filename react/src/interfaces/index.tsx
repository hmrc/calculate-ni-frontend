// App

import {PeriodLabel, PeriodValue} from "../config";
import {RowsErrors, GenericErrors} from "../validation/validation";
import {Dispatch, SetStateAction} from "react";

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

export interface DetailsForm {
  details: DetailsProps
  handleChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
}

export interface DetailsProps {
  fullName: string
  ni: string
  reference: string
  preparedBy: string
  date: string
}

export interface Class1S {
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
  resetTotals: () => void
  setShowSummary: Dispatch<boolean>
}

export interface DirectorsTableProps {
  resetTotals: () => void
  setShowSummary: Dispatch<boolean>
  dateRange: GovDateRange
  setDateRange: Dispatch<SetStateAction<GovDateRange>>
  handlePeriodChange: (value: PeriodLabel) => void
  handleChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
  handleShowSummary: (event: React.FormEvent) => void
}

export interface EarningsProps {
  showBands: boolean;
}

export interface ClassOneEarningsProps extends EarningsProps {
  activeRowID?: string | null;
  handleChange?: (r: Row, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange?: (r: Row, e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface DirectorsEarningsProps extends EarningsProps {
  handleChange?: (r: DirectorsRow, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange?: (r: DirectorsRow, e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export enum Calculators {
  CLASS_ONE = "Class 1",
  DIRECTORS = "Directors"
}

// Totals
export interface TotalsProps {
  grossPayTally: boolean
  errors?: GenericErrors | null
  grossTotal?: Number | null
  calculatedRows: Array<Calculated>;
  isSaveAndPrint: boolean
  type: Calculators.CLASS_ONE | Calculators.DIRECTORS
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
  calculatedRows: Calculated[]
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

export type NiCategory =
  'X' | 'A' | 'J' | 'M' | 'B' | 'C' | 'H' | 'Z'

export interface TotalsInCategories {
  [key: string]: TotalsInCategory
}

export interface TotalsInCategory {
  gross: number
  ee: number
  er: number
  contributionsTotal: number
}

export enum TotalType {
  EE = 'ee',
  ER = 'er',
  GROSS = 'gross'
}
