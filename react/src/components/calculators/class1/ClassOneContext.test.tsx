import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { PeriodValue } from "../../../config";
import { CalculatedRow, useClassOneForm, v } from "./ClassOneContext";
import { NiFrontendContext } from "../../../services/NiFrontendContext";

const mockDetails = {
  fullName: "Test User",
  ni: "111",
  reference: "",
  preparedBy: "",
  date: "",
};

const mockNiFrontendContext: any = {
  NiFrontendInterface: {
    classOne: {
      calculate: jest.fn(),
      getApplicableCategories: () => ["A", "B"],
      getTaxYears: ["2022-04-06", "2023-04-05"],
      getCategoryNames: [
        { letter: "A", name: "Category A" },
        { letter: "B", name: "Category B" },
      ],
    },
  },
};

const mockRows: any = [
  {
    id: "1",
    category: "A",
    number: 1,
    period: PeriodValue.MONTHLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: new Date("2022-04-05T00:00:00.000Z"),
    explain: ["Explain 1", "Explain 2"],
    contributionBands: ["Band 1", "Band 2"],
  },
  {
    id: "2",
    category: "A",
    number: 2,
    period: PeriodValue.WEEKLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: new Date("2023-04-05T00:00:00.000Z"),
  },
  {
    id: "3",
    category: "A",
    number: 3,
    period: PeriodValue.FORTNIGHTLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: new Date("2023-04-05T00:00:00.000Z"),
  },
  {
    id: "4",
    category: "A",
    number: 4,
    period: PeriodValue.FOURWEEKLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: new Date("2023-04-05T00:00:00.000Z"),
  },
];

const mockTaxYearPeriod = {
  from: "6 April 2022-5 April 2023",
  txYears: [
    {
      id: "[2022-04-06, 2022-05-01]",
      from: new Date("2022-04-06"),
      to: new Date("2022-05-01"),
    },
    {
      id: "[2022-05-02, 2022-08-05]",
      from: new Date("2022-05-02"),
      to: new Date("2022-08-05"),
    },
    {
      id: "[2022-08-06, 2023-04-05]",
      from: new Date("2022-08-06"),
      to: new Date("2023-04-05"),
    },
  ],
};

const mockResultBands: Map<string, v> = new Map([
  ["band 1", { gross: 100, employee: 1, employer: 1, net: 10 }],
  ["band 2", { gross: 100, employee: 1, employer: 1, net: 10 }],
]);

const mockResultContributionBands: Map<string, v> = new Map([
  ["band 1", { gross: 100, employee: 1, employer: 1, net: 10 }],
  ["band 2", { gross: 100, employee: 1, employer: 1, net: 10 }],
]);

const mockCat = {
  gross: 100,
  employee: 1,
  employer: 1,
  net: 10,
  resultBands: mockResultBands,
  resultContributionBands: mockResultContributionBands,
};

const mockCategoryTotals = new Map([["A", mockCat]]);

const mockResultRows: CalculatedRow[] = [
  {
    name: "1",
    // @ts-ignore
    resultBands: mockResultBands,
    // @ts-ignore
    resultContributionBands: mockResultContributionBands,
    employee: 1,
    employer: 1,
    totalContributions: 1,
    explain: ["Explain 1", "Explain 2"],
  },
];

const mockResult: any = {
  resultRows: mockResultRows,
  totals: {
    gross: 100,
    employee: 0,
    employer: 0,
    net: 0,
  },
  underpayment: {
    employee: 0,
    employer: 0,
    total: 0,
  },
  overpayment: {
    employee: 0,
    employer: 0,
    total: 0,
  },
  employerContributions: 0,
  bandTotals: {
    resultBands: mockResultBands,
    resultContributionBands: mockResultContributionBands,
  },
  categoryTotals: mockCategoryTotals,
};

jest.mock("../../../services/NiFrontendContext", () => ({
  __esModule: true,
  NiFrontendContext: React.createContext(mockNiFrontendContext),
  categoryNamesToObject: jest.fn(),
}));

const wrapper = ({ children }: any) => (
  <NiFrontendContext.Provider value={mockNiFrontendContext}>
    {children}
  </NiFrontendContext.Provider>
);

describe("useClassOneForm", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the context hook", () => {
    const { result: returnResult } = renderHook(() => useClassOneForm(), {
      wrapper,
    });

    // Access the values returned by the hook
    const {
      ClassOneCalculator,
      isMultiYear,
      taxYears,
      taxYear,
      defaultRow,
      niRow,
      rows,
      customRows,
      details,
      errors,
      niPaidNet,
      niPaidEmployee,
      categoryTotals,
      categories,
      activeRowId,
      result,
      categoryNames,
      isRepeatAllow,
      customSplitRows,
    } = returnResult.current;

    // Write assertions to check the initial values
    expect(ClassOneCalculator).toBeDefined();
    expect(isMultiYear).toBe(false);
    expect(taxYears).toStrictEqual([]);
    expect(taxYear).toBe(null);
    expect(defaultRow).not.toBeNull();
    expect(niRow).not.toBeNull();
    expect(rows.length).toBe(1);
    expect(customRows).toStrictEqual([]);
    expect(details).not.toBeNull();
    expect(errors).toStrictEqual({});
    expect(niPaidNet).toBe("");
    expect(niPaidEmployee).toBe("");
    expect(categoryTotals).toStrictEqual({});
    expect(categories).toStrictEqual([]);
    expect(activeRowId).toBe(null);
    expect(result).toBe(null);
    expect(categoryNames).toStrictEqual(undefined);
    expect(isRepeatAllow).toBe(true);
    expect(customSplitRows).toStrictEqual({});
  });

  it("should update the details", () => {
    const mockDispatch = jest.fn();
    jest
      .spyOn(React, "useReducer")
      .mockReturnValue([mockDetails, mockDispatch]);

    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.isMultiYear).toBe(false);

    act(() => {
      result.current.setDetails(mockDetails);
    });
    expect(result.current.details).toBe(mockDetails);
  });

  it("should update the isMultiYear", () => {
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.isMultiYear).toBe(false);

    act(() => {
      result.current.setIsMultiYear(true);
    });
    expect(result.current.isMultiYear).toBe(true);
  });

  it("should update the taxYear and should update a category for the default row", () => {
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.taxYear).toBe(null);

    act(() => {
      result.current.setTaxYear(mockTaxYearPeriod.txYears[0]);
      result.current.ClassOneCalculator.getApplicableCategories = jest
        .fn()
        .mockReturnValue("AB");
    });
    expect(result.current.taxYear).toBe(mockTaxYearPeriod.txYears[0]);
    expect(result.current.categories).toStrictEqual(["A", "B"]);
  });

  it("should update the taxYear but should not update a category for the default row", () => {
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.taxYear).toBe(null);

    act(() => {
      result.current.setTaxYear(mockTaxYearPeriod.txYears[0]);
      result.current.ClassOneCalculator.getApplicableCategories = jest
        .fn()
        .mockReturnValue(null);
    });
    expect(result.current.taxYear).toBe(mockTaxYearPeriod.txYears[0]);
    expect(result.current.categories).toStrictEqual([]);
  });

  it("should reset period number after deleting row", () => {
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.rows.length).toBe(1);

    act(() => {
      result.current.setRows(mockRows);
    });
    expect(result.current.rows.length).toBe(4);

    act(() => {
      result.current.setPeriodNumbers("2");
    });
    expect(result.current.rows.length).toBe(3);
  });

  it("should show all rows when invalid delete row number passed in setPeriodNumbers callback function", () => {
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.rows.length).toBe(1);

    act(() => {
      result.current.setRows(mockRows);
    });
    expect(result.current.rows.length).toBe(4);

    act(() => {
      result.current.setPeriodNumbers(undefined);
    });
    expect(result.current.rows.length).toBe(4);
  });

  it("should update the result", () => {
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.result).toBe(null);

    act(() => {
      result.current.setRows(mockRows);
      result.current.setResult(mockResult);
    });
    expect(result.current.result).toBe(mockResult);

    const getCatTotals = result.current.categoryTotals;
    const checkKey = getCatTotals.hasOwnProperty("A");
    expect(checkKey).toBe(true);
  });
});
