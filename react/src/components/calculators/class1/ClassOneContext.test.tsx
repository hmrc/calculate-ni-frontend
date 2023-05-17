import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";
import { PeriodValue } from "../../../config";
import { ClassOneContext, useClassOneForm } from "./ClassOneContext";
import {
  CategoryName,
  NiFrontendContext,
} from "../../../services/NiFrontendContext";

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

const rows = [
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

const mockCat = {
  gross: 100,
  employee: 1,
  employer: 1,
  net: 10,
  resultBands: ["band 1", "band 2"],
  resultContributionBands: ["band 1", "band 2"],
};
const mockResult = {
  employerContributions: 0,
  categoryTotals: ["cat 1", mockCat],
  resultRows: rows,
  from: "2022-04-06T00:00:00.000Z",
  id: "[2022-04-06, 2022-05-01]",
  to: "2022-05-01T00:00:00.000Z",
};
const mockClassOneContext = {
  result: mockResult,
  setResult: jest.fn(),
  rows,
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

/*jest.mock("./ClassOneContext", () => ({
  __esModule: true,
    // @ts-ignore
  ClassOneContext: React.useContext(mockClassOneContext),
  useClassOneForm: jest.fn(),
}));*/

const wrapper = ({ children }: any) => (
  <NiFrontendContext.Provider value={mockNiFrontendContext}>
    {children}
  </NiFrontendContext.Provider>
);

describe("ClassOneContext", () => {
  beforeEach(() => {
    jest
      .spyOn(React, "useState")
      // @ts-ignore
      .mockImplementation((init) => [init, setState])
      .mockImplementation(() => [mockTaxYearPeriod.txYears, setState])
      .mockImplementation(() => [mockTaxYearPeriod.txYears[0], setState]);
    jest
      .spyOn(React, "useContext")
      .mockImplementation(() => mockNiFrontendContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the context hook", () => {
    //const { result } = renderHook(() => React.useContext(ClassOneContext));
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current).not.toBeNull();
  });

  it("should reset period number after deleting row", () => {
    jest.spyOn(React, "useState").mockImplementation(() => [rows, setState]);

    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    result.current.setPeriodNumbers("2");
    // @ts-ignore
    result.current.setResult(mockResult);
    expect(result.current.setRows).toBeCalled();
  });

  it("should render correct count of get allowed rows", () => {
    const { result } = renderHook(() => useClassOneForm(), { wrapper });
    expect(result.current.getAllowedRows(2)).toBe(2);
    expect(result.current.getAllowedRows(2, "W")).toBe(51);
    expect(result.current.getAllowedRows(2, "2W")).toBe(25);
    expect(result.current.getAllowedRows(2, "4W")).toBe(12);
    expect(result.current.getAllowedRows(2, "M")).toBe(10);
  });

  it("should update result data", () => {
    const { result, rerender } = renderHook(() => useClassOneForm(), {
      wrapper,
    });

    // @ts-ignore
    result.current.setRows(rows);
    // @ts-ignore
    result.current.setResult(mockResult);
    rerender();

    expect(result.current.result).not.toBeNull();

    // @ts-ignore
    //expect(result.current.result.resultRows).not.toBeUndefined();
  });
});
