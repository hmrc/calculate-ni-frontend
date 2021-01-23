// App

import {PeriodLabel, PeriodValue} from "../config";
import {GenericErrors} from "../validation/validation";
import React, {Dispatch, SetStateAction} from "react";
import {Class2Or3Result} from "../components/calculators/class-2-or-3/Class2Or3Context";

interface GenericObject {
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

export interface Class3Row {
  id: string,
  earningsFactor: string,
  dateRange: GovDateRange,
  maxWeeks?: number
  actualWeeks?: number
  deficiency?: number
}

export interface Row {
  id: string
  category: string
  number: number
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

// Class 2 Or 3
export interface Class2Or3FormProps {
  earningsFactor: string
  handleEarningsFactorChange: ({ currentTarget: { value }, }: React.ChangeEvent<HTMLInputElement>) => void
}

// Table
export interface TaxYear {
  id: string
  from: Date
  to: Date
}

export interface Class1TableProps {
  resetTotals: () => void
  handleShowSummary: (event: React.FormEvent) => void
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
}

// Save Print
export interface SavePrintBaseProps {
  title: string,
  setShowSummary: (v: boolean) => void
}

export interface Class1DirectorsSavePrintProps extends SavePrintBaseProps {
  calculatedRows: Calculated[]
}

export interface Class12Or3SavePrintProps extends SavePrintBaseProps {
  result: Class2Or3Result | null
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
  hint?: string
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
  numberOfWeeks?: number
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
