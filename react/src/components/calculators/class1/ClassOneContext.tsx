import React, {
  Dispatch,
  useContext,
  useEffect,
  useState,
  SetStateAction,
} from "react";
import {
  CustomRow,
  CustomSplitRows,
  DetailsProps,
  GenericObject,
  TaxYear,
  TotalsInCategories,
} from "../../../interfaces";
import { buildTaxYears, periods, PeriodValue } from "../../../config";
import { GenericErrors } from "../../../validation/validation";
import { mapCategoryTotalsResponse } from "../../../services/utils";
import {
  categoryNamesToObject,
  initClassOneCalculator,
  NiFrontendContext,
} from "../../../services/NiFrontendContext";
import uniqid from "uniqid";

const initRow = {
  id: uniqid(),
  category: "A",
  gross: "",
  ee: 0,
  er: 0,
  number: 1,
  period: PeriodValue.WEEKLY,
};

const initialDetails = {
  fullName: "",
  ni: "",
  reference: "",
  preparedBy: "",
  date: "",
};

const detailsReducer = (
  state: DetailsProps,
  action: { [x: string]: string }
) => ({
  ...state,
  ...action,
});

export interface Row {
  id: string;
  category: string;
  number: number;
  period: PeriodValue;
  gross: string;
  ee: number;
  er: number;
  bands?: Array<Band>;
  explain?: Array<string>;
  totalContributions?: number;
  contributionBands?: Array<ContributionBand>;
  date?: string;
}

export interface ClassOneRowInterface {
  id: string;
  period: string; // "M", "W" or "4W"
  category: string;
  grossPay: number;
  contractedOutStandardRate: boolean;
}

interface Calculator {
  calculate: Function;
  getApplicableCategories: Function;
  getTaxYears: Array<string>;
}

interface CalculatedTotals {
  gross: number;
  net: number;
  employee: number;
  employer: number;
}

export interface Band {
  name: string;
  amountInBand: number;
}

export interface ContributionBand {
  name: string;
  employeeContributions: number;
}

export interface CalculatedRow {
  name: string;
  resultBands: Array<Band>;
  resultContributionBands: Array<ContributionBand>;
  employee: number;
  employer: number;
  totalContributions: number;
  explain: Array<string>;
}

interface TotalRow {
  employee: number;
  employer: number;
  total: number;
}

export interface BandTotals {
  resultBands: Map<string, v>;
  resultContributionBands: Map<string, v>;
}

export interface v {
  gross: number;
  employee: number;
  employer: number;
  net: number;
}

export interface CategoryTotals {
  gross: number;
  employee: number;
  employer: number;
  net: number;
  resultBands: Map<string, v>;
  resultContributionBands: Map<string, v>;
}

export interface Class1Result {
  resultRows: CalculatedRow[];
  totals: CalculatedTotals;
  overpayment: TotalRow;
  underpayment: TotalRow;
  employerContributions: number;
  categoryTotals: Map<string, CategoryTotals>;
  bandTotals: BandTotals;
}

interface ClassOneContext {
  ClassOneCalculator: Calculator;
  isMultiYear: boolean;
  setIsMultiYear: Dispatch<boolean>;
  taxYears: TaxYear[];
  taxYear: TaxYear | null;
  setTaxYear: Dispatch<TaxYear | null>;
  defaultRow: Row;
  niRow: Row;
  setNiRow: Dispatch<Row>;
  rows: Array<Row>;
  setRows: Dispatch<SetStateAction<Array<Row>>>;
  customRows: Array<CustomRow>;
  setCustomRows: Dispatch<SetStateAction<Array<CustomRow>>>;
  details: DetailsProps;
  setDetails: Function;
  niPaidNet: string;
  setNiPaidNet: Dispatch<string>;
  niPaidEmployee: string;
  setNiPaidEmployee: Dispatch<string>;
  errors: GenericErrors;
  setErrors: Dispatch<GenericErrors>;
  categoryTotals: TotalsInCategories;
  setCategoryTotals: Dispatch<TotalsInCategories>;
  categories: Array<string>;
  setCategories: Dispatch<Array<string>>;
  setDefaultRow: Dispatch<Row>;
  activeRowId: string | null;
  setActiveRowId: Dispatch<string | null>;
  setPeriodNumbers: Function;
  result: Class1Result | null;
  setResult: Dispatch<Class1Result | null>;
  categoryNames: GenericObject;
  periodType: string;
  setPeriodType: Dispatch<string>;
  isRepeatAllow: boolean;
  setIsRepeatAllow: Dispatch<boolean>;
  getAllowedRows: Function;
  customSplitRows: CustomSplitRows;
  setCustomSplitRows: Dispatch<SetStateAction<CustomSplitRows>>;
  myCountry: string | null,
  setMyCountry: Function
}

export const ClassOneContext = React.createContext<ClassOneContext>({
  ClassOneCalculator: initClassOneCalculator,
  isMultiYear: false,
  setIsMultiYear: () => {},
  taxYears: [],
  taxYear: null,
  setTaxYear: () => {},
  defaultRow: initRow,
  niRow: initRow,
  setNiRow: () => {},
  rows: [initRow],
  setRows: () => {},
  customRows: [],
  setCustomRows: () => {},
  details: initialDetails,
  setDetails: () => {},
  niPaidNet: "",
  setNiPaidNet: () => {},
  niPaidEmployee: "",
  setNiPaidEmployee: () => {},
  errors: {},
  setErrors: () => {},
  categoryTotals: {},
  setCategoryTotals: () => {},
  categories: [],
  setCategories: () => {},
  activeRowId: null,
  setActiveRowId: () => {},
  setPeriodNumbers: () => {},
  result: null,
  setResult: () => {},
  categoryNames: {},
  setDefaultRow: () => {},
  periodType: "W",
  setPeriodType: () => "",
  isRepeatAllow: true,
  setIsRepeatAllow: () => "",
  getAllowedRows: () => "",
  customSplitRows: {},
  setCustomSplitRows: () => {},
  myCountry: "England",
  setMyCountry: () => {}
});

export function useClassOneForm() {
  const [myCountry, setMyCountry] = useState<string>("England")
  const { NiFrontendInterface } = useContext(NiFrontendContext);
  const ClassOneCalculator = NiFrontendInterface.classOne;
  const [isMultiYear, setIsMultiYear] = useState<boolean>(false);
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [taxYear, setTaxYear] = useState<TaxYear | null>(null);
  const [niRow, setNiRow] = useState<Row>(initRow);
  const [defaultRow, setDefaultRow] = useState<Row>({
    ...initRow,
    number: niRow?.number === initRow.number ? 1 : niRow?.number,
  });

  const [categoryNames, setCategoryNames] = useState<GenericObject>({});
  const [categories, setCategories] = useState<Array<string>>([]);
  const [details, setDetails] = React.useReducer(
    detailsReducer,
    initialDetails
  );
  const [errors, setErrors] = useState<GenericErrors>({});
  const [niPaidNet, setNiPaidNet] = useState<string>("");
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>("");
  const [categoryTotals, setCategoryTotals] = useState<TotalsInCategories>({});
  const [result, setResult] = useState<Class1Result | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<string>("W");
  const [isRepeatAllow, setIsRepeatAllow] = useState<boolean>(true);
  const [customSplitRows, setCustomSplitRows] = useState<CustomSplitRows>({});

  useEffect(() => {
    if (taxYear && taxYear.from) {
      const categoriesForTaxYear = ClassOneCalculator.getApplicableCategories(
        taxYear.from
      );
      if (categoriesForTaxYear) {
        setCategories(categoriesForTaxYear.split(""));
        setDefaultRow((prevState: Row) => ({
          ...prevState,
          category: categoriesForTaxYear[0],
        }));
      }
    }
  }, [taxYear, ClassOneCalculator]);

  // to find the number of allowed rows for selected period type
  const getAllowedRows = (
    currentTotalRows: number,
    getPeriodType: string = "",
    isGetMaxRows: boolean = false
  ) => {
    if (!getPeriodType) {
      getPeriodType = periodType;
    }
    let maxRows = 0;
    if (getPeriodType === "W") {
      // if period is weekly
      maxRows = 53;
    } else if (getPeriodType === "2W") {
      // if period is fortnightly
      maxRows = 27;
    } else if (getPeriodType === "4W") {
      // if period is 4 weekly
      maxRows = 14;
    } else if (getPeriodType === "M") {
      // if period is monthly
      maxRows = 12;
    }

    if (isGetMaxRows) return maxRows;

    return Math.abs(maxRows - currentTotalRows);
  };

  const [rows, setRows] = useState<Array<Row>>([defaultRow]);
  const [customRows, setCustomRows] = useState<Array<CustomRow>>([]);

  useEffect(() => {
    if (result && result.resultRows) {
      setRows((prevState: Row[]) =>
        prevState.map((row) => {
          const matchingRow: CalculatedRow | undefined = result.resultRows.find(
            (resultRow) => resultRow.name === row.id
          );
          if (matchingRow) {
            return {
              ...row,
              ee: matchingRow.employee,
              er: matchingRow.employer,
              totalContributions: matchingRow.totalContributions,
              bands: matchingRow.resultBands,
              explain: matchingRow.explain,
              contributionBands: matchingRow.resultContributionBands,
            };
          }
          return row;
        })
      );
    } else {
      setRows((prevState: Row[]) =>
        prevState.map((row) => {
          delete row.totalContributions;
          delete row.explain;
          row.ee = 0;
          row.er = 0;
          return row;
        })
      );
    }
  }, [result]);

  useEffect(() => {
    if (result && result.categoryTotals) {
      setCategoryTotals(mapCategoryTotalsResponse(result.categoryTotals, rows));
    }
  }, [result, rows]);

  useEffect(() => {
    const taxYearData = buildTaxYears(ClassOneCalculator.getTaxYears);
    setTaxYears(taxYearData);
    setCategoryNames(
      categoryNamesToObject(ClassOneCalculator.getCategoryNames)
    );
  }, [ClassOneCalculator]);

  const setPeriodNumbers = (deletedRow: string | undefined) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (let period in periods) {
      const newRows = deletedRow
        ? [...rows.filter((row: Row) => row.id !== deletedRow)]
        : [...rows];
      setRows(newRows);
    }
  };
  return {
    ClassOneCalculator,
    isMultiYear,
    setIsMultiYear,
    taxYears,
    taxYear,
    setTaxYear,
    defaultRow,
    niRow,
    setNiRow,
    setDefaultRow,
    rows,
    setRows,
    customRows,
    setCustomRows,
    details,
    setDetails,
    errors,
    setErrors,
    niPaidNet,
    setNiPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    categoryTotals,
    setCategoryTotals,
    categories,
    setCategories,
    activeRowId,
    setActiveRowId,
    setPeriodNumbers,
    result,
    setResult,
    categoryNames,
    periodType,
    setPeriodType,
    isRepeatAllow,
    setIsRepeatAllow,
    getAllowedRows,
    customSplitRows,
    setCustomSplitRows,
    myCountry,
    setMyCountry
  };
}
