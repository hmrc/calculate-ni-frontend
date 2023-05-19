import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";
import { PeriodValue } from "../../../config";
import {
  Band,
  BandTotals,
  CalculatedRow,
  CategoryTotals,
  Class1Result,
  ClassOneContext,
  ContributionBand,
  Row,
  useClassOneForm,
  v,
} from "./ClassOneContext";
import {
  CategoryName,
  NiFrontendContext,
} from "../../../services/NiFrontendContext";
import { SuccessNotificationContext } from "../../../services/SuccessNotificationContext";

const mockNiFrontendContext: any = {
  NiFrontendInterface: {
    classOne: {
      calculate: jest.fn(),
      getApplicableCategories: () => new Date("2022-04-06").toDateString(),
      getTaxYears: ["2022-04-06", "2023-04-05"],
      getCategoryNames: [
        { letter: "A", name: "Category A" },
        { letter: "B", name: "Category B" },
      ],
    },
  },
};

const mockRows = [
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
    name: "row 1",
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

const mockResult: Class1Result | null = {
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

const mockClassOneContext = {
  result: null,
  setResult: jest.fn(),
  rows: [],
  setRows: jest.fn(),
  setPeriodNumbers: jest.fn(),
};

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");

  return {
    ...actualReact,
    useState: jest.fn(),
    useContext: jest.fn(),
  };
});
const setState = jest.fn();

jest.mock("../../../services/NiFrontendContext", () => ({
  // NiFrontendInterface: () => React.useContext(mockNiFrontendContext),
  __esModule: true,
  NiFrontendContext: React.createContext(mockNiFrontendContext),
  categoryNamesToObject: jest.fn(),
}));

const wrapper = ({ children }: any) => (
  <NiFrontendContext.Provider value={mockNiFrontendContext}>
    {children}
  </NiFrontendContext.Provider>
);

/*describe("ClassOneContext", () => {
    it('should render default context values', () => {
        const result = React.useContext(ClassOneContext);
        expect(result).not.toBeNull();
        expect(result).toEqual(mockClassOneContext);
    });
});*/

describe("useClassOneForm", () => {
  beforeEach(() => {
    jest
      .spyOn(React, "useState")
      // @ts-ignore
      .mockImplementation((init) => [init, setState])
      .mockImplementation(() => [mockTaxYearPeriod.txYears, setState])
      .mockImplementation(() => [mockTaxYearPeriod.txYears[0], setState])
      .mockImplementation(() => [mockRows, setState]);
    jest
      .spyOn(React, "useContext")
      .mockImplementation(() => mockNiFrontendContext);
  });

  afterEach(() => {
    //jest.clearAllMocks();
  });

  it("should render the context hook", () => {
    //const { result } = renderHook(() => React.useContext(ClassOneContext));
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current).not.toBeNull();
  });

  it("should reset period number after deleting row", () => {
    //jest.spyOn(React, "useState").mockImplementation(() => [mockRows, setState]);

    const { result } = renderHook(() => useClassOneForm(), { wrapper });

    act(() => {
      result.current.setPeriodNumbers("2");
      // @ts-ignore
      result.current.setResult(mockResult);
    });
    expect(result.current.setRows).toBeCalled();
  });

  it("should render correct count of get allowed rows", () => {
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.getAllowedRows(2)).toBe(2);
    expect(result.current.getAllowedRows(2, "W")).toBe(51);
    expect(result.current.getAllowedRows(2, "2W")).toBe(25);
    expect(result.current.getAllowedRows(2, "4W")).toBe(12);
    expect(result.current.getAllowedRows(2, "M")).toBe(10);
    expect(result.current.getAllowedRows(2, "M", true)).toBe(12);
  });
});

describe("useClassOneForm state", () => {
  it("should update result data", () => {
    //jest.spyOn(React, "useState").mockImplementation(() => [mockResult, setState]);

    // @ts-ignore
    const rows: Array<Row> = mockRows;
    // @ts-ignore
    const result2: Class1Result = mockResult;

    // @ts-ignore
    // useState.mockReturnValueOnce([rows, jest.fn()]);
    // @ts-ignore
    useState.mockReturnValueOnce([result2, jest.fn()]);
/*
    jest
      .spyOn(React, "useState")
      .mockImplementation(() => [rows, setState])
      .mockImplementation(() => [result2, setState]);*/

    const { result, rerender } = renderHook(() => useClassOneForm(), {
      wrapper,
    });
    //jest.spyOn(result.current, "setRows").mockImplementation(() => rows)
    //jest.spyOn(result.current, "setResult").mockImplementation(() => mockResult)

    //rerender()
    /*
    jest
      .spyOn(React, "useState")
      .mockImplementation(() => [rows, setState])
      .mockImplementation(() => [mockResult, setState]);*/

    // @ts-ignore
    expect(result.current.result.resultRows).not.toBeUndefined();
  });
});
