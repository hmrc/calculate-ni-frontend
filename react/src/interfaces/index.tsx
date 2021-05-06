// App

import {PeriodLabel} from "../config";
import {GenericErrors} from "../validation/validation";
import React, {Context, Dispatch} from "react";
import {Class2Or3Result} from "../components/calculators/class-2-or-3/Class2Or3Context";
import {Band, Class1Result, Row} from "../components/calculators/class1/ClassOneContext";
import {DirectorsUIRow} from "../components/calculators/directors/DirectorsContext";

export interface GenericObject {
  [key: string]: string
}

export const NiClassNameLabels: GenericObject = {
  classOne: "Class 1",
  classTwo: "Class 2",
  classThree: "Class 3",
  classFour: "Class 4"
}

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

export interface Calculated {
  [key: string]: number[]
}

export interface Class3Results {
  totalWeeks: number
  years: Class3YearBreakdown[]
}

export interface Class3YearBreakdown {
  endDate: Date
  startDate: Date
  weeks: number
  year: number
}

// Table
export interface TaxYear {
  id: string
  from: Date
  to: Date
}

export interface Class1FormProps {
  resetTotals: () => void
  handleShowSummary: (event: React.FormEvent) => void
}

export interface DirectorsFormProps {
  resetTotals: () => void
  setShowSummary: Dispatch<boolean>
  handlePeriodChange: (value: PeriodLabel) => void
  handleChange: ({ currentTarget: { name, value }, }: React.ChangeEvent<HTMLInputElement>) => void
  handleShowSummary: (event: React.FormEvent) => void
}

export interface Class1DebtRow {
  id: string
  taxYear: TaxYear
  debt: string
  interestDue: string | null
}

export interface TableProps {
  showBands: boolean
  printView: boolean
}

export enum Calculators {
  CLASS_ONE = "Class 1",
  DIRECTORS = "Directors"
}

// Totals
export interface TotalsProps {
  grossPayTally: boolean
  errors?: GenericErrors | null
  result: Class1Result | null
  isSaveAndPrint: boolean
  context: Context<any>
}

// Errors
export interface ErrorSummaryProps {
  errors: GenericErrors
}

// Save Print
export interface SavePrintBaseProps {
  title: string,
  setShowSummary: (v: boolean) => void
}

export interface Class1DirectorsSavePrintProps extends SavePrintBaseProps {
  result: Class1Result | null
}

export interface Class12Or3SavePrintProps extends SavePrintBaseProps {
  result: Class2Or3Result | null
}

export interface LateInterestPrintProps extends SavePrintBaseProps {}
export interface LateRefundPrintProps extends SavePrintBaseProps {}

export interface CategoryTotalsProps {
  rows: Array<Row | DirectorsUIRow>
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
  hint?: string
  hiddenLabel?: boolean 
  name: string
  inputClassName: string
  inputValue: string | number | undefined
  placeholderText?: string
  pattern?: string
  inputMode?: "numeric"
  onChangeCallback: React.ChangeEventHandler<HTMLInputElement>
  onBlurCallback?: React.ChangeEventHandler<HTMLInputElement>
  error?: any // todo
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>
}

export interface DateParts {
  day: string
  month: string
  year: string
}

export interface GovDateRange {
  from: Date | null;
  to: Date | null;
  fromParts?: DateParts
  toParts?: DateParts
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
  bands?: Array<Band>
}

export enum TotalType {
  EE = 'ee',
  ER = 'er',
  GROSS = 'gross'
}

export interface Rate {
  year: number
  start: Date
  end: Date
  rate: number
}