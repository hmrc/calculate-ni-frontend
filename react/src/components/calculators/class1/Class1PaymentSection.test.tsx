import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Class1PaymentSection from "./Class1PaymentSection";
import { PeriodValue } from "../../../config";
import { ClassOneContext } from "./ClassOneContext";

jest.mock("moment", () => {
  const moment = jest.requireActual("moment");
  return moment.utc;
});

const rows = [
  {
    id: "1",
    category: "A",
    number: 1,
    period: PeriodValue.FORTNIGHTLY,
    gross: "100",
    ee: 1,
    er: 1,
  },
  {
    id: "4",
    category: "A",
    number: 4,
    period: PeriodValue.FORTNIGHTLY,
    gross: "100",
    ee: 1,
    er: 1,
  },
  {
    id: "8",
    category: "A",
    number: 8,
    period: PeriodValue.FORTNIGHTLY,
    gross: "100",
    ee: 1,
    er: 1,
  },
  {
    id: "2",
    category: "A",
    number: 2,
    period: PeriodValue.MONTHLY,
    gross: "100",
    ee: 1,
    er: 1,
  },
  {
    id: "3",
    category: "A",
    number: 3,
    period: PeriodValue.WEEKLY,
    gross: "100",
    ee: 1,
    er: 1,
  },
  {
    id: "5",
    category: "A",
    number: 5,
    period: PeriodValue.FOURWEEKLY,
    gross: "100",
    ee: 1,
    er: 1,
  },
];

const mockRows = rows.map((row) => ({
  ...row,
  period: PeriodValue.FOURWEEKLY,
}));
mockRows.sort((a, b) => a.number - b.number);

const mockTaxYearPeriod = {
  from: "6 April 2022-5 April 2023",
  txYears: [
    {
      id: "[2022-02-06, 2022-04-05]",
      from: new Date("2022-02-06"),
      to: new Date("2022-04-05"),
    },
    {
      id: "[2022-04-06, 2022-07-05]",
      from: new Date("2022-04-06"),
      to: new Date("2022-07-05"),
    },
    {
      id: "[2022-07-06, 2022-11-05]",
      from: new Date("2022-07-06"),
      to: new Date("2022-11-05"),
    },
    {
      id: "[2022-11-06, 2023-04-05]",
      from: new Date("2022-11-06"),
      to: new Date("2023-04-05"),
    },
  ],
};

const mockTaxYear = {
  id: "[2022-04-06, 2023-04-05]",
  from: new Date("2022-04-06"),
  to: new Date("2023-04-05"),
};

const setPeriodNumbers = jest.fn();
const setErrors = jest.fn();
const setResult = jest.fn();
const setActiveRowId = jest.fn();
const setIsRepeatAllow = jest.fn();
const setRows = jest.fn();
const setCustomRows = jest.fn();

const mockCustomRows = [
  {
    id: "4",
    category: "A",
    period: "4W",
    gross: "",
    number: 4,
    ee: 0,
    er: 0,
    date: "",
  },
  {
    id: "8",
    category: "A",
    period: "4W",
    gross: "",
    number: 8,
    ee: 0,
    er: 0,
    date: "",
  },
  {
    id: "1",
    category: "A",
    period: "4W",
    gross: "",
    number: 1,
    ee: 0,
    er: 0,
    date: "2022-04-01",
  },
];

const mockCustomSplitRows = {
  "period--1": {
    from: new Date("2022-03-06"),
    rows: [],
  },
  "period-0": {
    from: new Date("2022-04-06"),
    rows: [],
  },
  "period-1": {
    from: new Date("2022-07-06"),
    rows: [
      {
        id: "4",
        category: "A",
        period: "4W",
        gross: "",
        number: 4,
        ee: 0,
        er: 0,
        date: "",
      },
    ],
  },
};

const mockValue: any = {
  rows,
  taxYear: mockTaxYear,
  activeRowId: "1",
  setPeriodNumbers,
  setErrors,
  setResult,
  setActiveRowId,
  getAllowedRows: () => 52,
  isRepeatAllow: true,
  setIsRepeatAllow,
  setRows,
  customRows: mockCustomRows,
  setCustomRows,
  errors: {},
  customSplitRows: mockCustomSplitRows,
  setCustomSplitRows: jest.fn(),
  isMultiYear: true,
};

const mockValueElse: any = {
  ...mockValue,
  taxYear: "",
  getAllowedRows: () => 0,
  isRepeatAllow: false,
  isMultiYear: false,
};

const mockValueRepeatAllow: any = {
  ...mockValueElse,
  activeRowId: "",
  getAllowedRows: () => 0,
  isRepeatAllow: true,
};

const mockValueRepeatAllowMore: any = {
  ...mockValueElse,
  activeRowId: "",
  getAllowedRows: () => 1,
  isRepeatAllow: true,
};

jest.mock("../../../services/utils", () => ({
  getBandNames: () => ["A", "B", "C"],
  getContributionBandNames: () => ["A", "B", "C"],
  buildDescribedByKeys: () => "test",
}));

const renderComponent = (contextValue: any) => {
  const memoizedTaxYears = {
    taxYears: mockTaxYearPeriod.txYears,
    grouped: [mockTaxYearPeriod],
  };

  return render(
    <ClassOneContext.Provider value={contextValue}>
      <Class1PaymentSection
        // @ts-ignore
        memoizedTaxYears={memoizedTaxYears}
        resetTotals={resetTotals}
        taxYearPeriod={mockTaxYearPeriod}
      />
    </ClassOneContext.Provider>
  );
};

jest.mock("./Class1Table", () => () => (
  <div data-testid="class1-table">Class1 Table</div>
));

const resetTotals = jest.fn();

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");

  return {
    ...actualReact,
    useState: jest.fn(),
  };
});
const setState = jest.fn();

describe("Class1PaymentSection", () => {
  beforeEach(() => {
    jest
      .spyOn(React, "useState")
      .mockImplementation(() => [1, setState])
      .mockImplementation(() => [rows, setState]);
  });

  describe("when repeat row", () => {
    beforeEach(() => {
      renderComponent(mockValue);
    });

    it("should render class1 table", () => {
      expect(screen.queryByTestId("class1-table")).not.toBeNull();
    });

    it("should render class1 periods section", () => {
      expect(screen.queryByTestId("class1-periods-section")).not.toBeNull();
    });

    it("should call input change callback function when input is changed in periods table", () => {
      // @ts-ignore
      const input = screen
        .getByText("Date NI paid for row number 1")
        .closest("tr")
        .querySelector("input") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "2022-05-18" } });
      expect(setCustomRows).toBeCalled();
    });

    it("should change repeat row quantity when repeat row input is changed", async () => {
      const input = screen.getByTestId("repeat-qty");
      fireEvent.change(input, { target: { value: 2 } });
    });

    it("should change repeat qty value", async () => {
      const input = screen.getByTestId("repeat-qty");
      fireEvent.change(input, { target: { value: 64 } });
      await expect(setState).toHaveBeenCalledWith(64);
    });

    it("should call repeat row callback function when repeat row button is clicked", async () => {
      const button = screen.getByText("Repeat row");
      expect(button).toBeEnabled();

      fireEvent.click(button);
      await expect(mockValue.setRows).toHaveBeenCalled();
    });

    it("should enabled delete active row button", () => {
      expect(screen.queryByText("Delete active row")).toBeEnabled();
    });

    it("should call delete callback function when delete active row button is clicked", () => {
      fireEvent.click(screen.getByText("Delete active row"));
      expect(setPeriodNumbers).toHaveBeenCalled();
    });

    it("should clear the table when clear table button is clicked", () => {
      fireEvent.click(screen.getByText("Clear table"));
      expect(resetTotals).toHaveBeenCalled();
      expect(mockValue.setIsRepeatAllow).toHaveBeenCalledWith(true);
    });

    it("should submit the table when Calculate button is clicked", () => {
      fireEvent.click(screen.getByText("Calculate"));
      expect(setResult).toHaveBeenCalled();
    });
  });

  describe("when active row has not a number", () => {
    beforeEach(() => {
      const mockValueNoNumber = {
        ...mockValue,
        rows: [{ ...mockValue.rows[0], number: undefined }],
      };

      renderComponent(mockValueNoNumber);
    });

    it("should not allow to repeat row when repeat row button is clicked", () => {
      const button = screen.getByText("Repeat row");
      expect(button).toBeEnabled();

      fireEvent.click(button);

      expect(mockValue.setIsRepeatAllow).toHaveBeenCalled();
    });
  });

  describe("test split period validations", () => {
    it("should move row to previous period when entered date is less than current period start date", () => {
      let customRows = mockValue.customRows;
      customRows[0].date = "2022-04-01";

      renderComponent({ ...mockValue, customRows, rows: mockRows });

      expect(setCustomRows).toBeCalled();
    });

    it("should move row to previous period when entered date is greater than current period start date and current week start date", () => {
      let customRows = mockValue.customRows;
      customRows.push({
        id: "3",
        category: "A",
        period: "4W",
        gross: "",
        number: 3,
        ee: 0,
        er: 0,
        date: "2022-04-20",
      });

      renderComponent({ ...mockValue, customRows, rows: mockRows });

      expect(setCustomRows).toBeCalled();
    });

    it("should use current week start date when entered date is null", () => {
      let customRows = mockValue.customRows.map((row: any) => {
        if (row.number === 1) {
          row.date = "";
          return row;
        }
        return row;
      });

      renderComponent({ ...mockValue, customRows, rows: mockRows });

      expect(setCustomRows).toBeCalled();
    });
  });
});
