import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Class1PaymentSection from "./Class1PaymentSection";
import { PeriodValue } from "../../../config";
import { ClassOneContext } from "./ClassOneContext";

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
];

const mockValue: any = {
  rows,
  taxYear: mockTaxYearPeriod.txYears[0],
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
};

const mockValueElse: any = {
  ...mockValue,
  taxYear: "",
  getAllowedRows: () => 0,
  isRepeatAllow: false,
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

const renderComponent = (props: any) => {
  const { memoizedTaxYears, resetTotals, taxYearPeriod, contextValue } = props;

  return render(
    <ClassOneContext.Provider value={contextValue}>
      <Class1PaymentSection
        memoizedTaxYears={memoizedTaxYears}
        resetTotals={resetTotals}
        taxYearPeriod={taxYearPeriod}
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

  describe("when remaining allowed rows is greater than zero and repeat row is allow", () => {
    beforeEach(() => {
      renderComponent({
        memoizedTaxYears: {
          taxYears: mockTaxYearPeriod.txYears,
          grouped: [mockTaxYearPeriod],
        },
        resetTotals,
        taxYearPeriod: mockTaxYearPeriod,
        contextValue: mockValue,
      });
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
      await expect(mockValue.setIsRepeatAllow).toHaveBeenCalledWith(true);
    });

    it("should change repeat qty to maximum allowed value when entered more than allowed period wise", async () => {
      const input = screen.getByTestId("repeat-qty");
      fireEvent.change(input, { target: { value: 64 } });
      await expect(setState).toHaveBeenCalledWith(52);
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

  describe("when remaining allowed rows is zero and repeat row is not allow", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});

      renderComponent({
        memoizedTaxYears: {
          taxYears: mockTaxYearPeriod.txYears,
          grouped: [mockTaxYearPeriod],
        },
        resetTotals,
        taxYearPeriod: mockTaxYearPeriod,
        contextValue: mockValueElse,
      });
    });

    it("should render class1 table", () => {
      expect(screen.queryByTestId("class1-table")).not.toBeNull();
    });

    it("should render class1 periods section", () => {
      expect(screen.queryByTestId("class1-periods-section")).not.toBeNull();
    });

    it("should call delete callback function when delete active row button is clicked", () => {
      fireEvent.click(screen.getByText("Delete active row"));
      expect(setPeriodNumbers).toHaveBeenCalled();
    });

    it("should disabled repeat row button", () => {
      expect(screen.queryByText("Repeat row")).toBeDisabled();
    });

    it("should not allow to add more rows as allowed rows count is 0", async () => {
      const input = screen.getByTestId("repeat-qty");
      fireEvent.change(input, { target: { value: 0 } });
      await expect(mockValue.setIsRepeatAllow).toHaveBeenCalledWith(false);
    });
  });

  describe("when remaining allowed rows is zero and repeat row is allow", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
      jest.spyOn(React, "useState").mockImplementation(() => [2, setState]);

      renderComponent({
        memoizedTaxYears: {
          taxYears: mockTaxYearPeriod.txYears,
          grouped: [mockTaxYearPeriod],
        },
        resetTotals,
        taxYearPeriod: mockTaxYearPeriod,
        contextValue: mockValueRepeatAllow,
      });
    });

    it("should call repeat row callback function when repeat row button is clicked ", async () => {
      const button = screen.getByText("Repeat row");
      expect(button).toBeEnabled();

      fireEvent.click(button);
      await expect(mockValue.setRows).toHaveBeenCalled();
    });
  });

  describe("when remaining allowed rows is grater than 0 and repeat row is not allow", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
      jest.spyOn(React, "useState").mockImplementation(() => [0, setState]);

      renderComponent({
        memoizedTaxYears: {
          taxYears: mockTaxYearPeriod.txYears,
          grouped: [mockTaxYearPeriod],
        },
        resetTotals,
        taxYearPeriod: mockTaxYearPeriod,
        contextValue: mockValueRepeatAllowMore,
      });
    });

    it("should call repeat row callback function when repeat row button is clicked ", async () => {
      const button = screen.getByText("Repeat row");
      expect(button).toBeEnabled();

      fireEvent.click(button);
      await expect(mockValue.setRows).toHaveBeenCalled();
    });
  });

  describe("when active row has not a number", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});

      const mockValueNoNumber = {
        ...mockValue,
        rows: [{ ...mockValue.rows[0], number: undefined }],
      };

      renderComponent({
        memoizedTaxYears: {
          taxYears: mockTaxYearPeriod.txYears,
          grouped: [mockTaxYearPeriod],
        },
        resetTotals,
        taxYearPeriod: mockTaxYearPeriod,
        contextValue: mockValueNoNumber,
      });
    });

    it("should not allow to repeat row when repeat row button is clicked", () => {
      const button = screen.getByText("Repeat row");
      expect(button).toBeEnabled();

      fireEvent.click(button);

      expect(mockValue.setIsRepeatAllow).toHaveBeenCalled();
    });
  });

  describe("when repeat qty is more than allowed period wise", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
      jest.spyOn(React, "useState").mockImplementation(() => [12, setState]);

      renderComponent({
        memoizedTaxYears: {
          taxYears: mockTaxYearPeriod.txYears,
          grouped: [mockTaxYearPeriod],
        },
        resetTotals,
        taxYearPeriod: mockTaxYearPeriod,
        contextValue: mockValueRepeatAllowMore,
      });
    });

    it("should not allow to add more rows", async () => {
      const button = screen.getByText("Repeat row");
      fireEvent.click(button);

      await expect(mockValue.setIsRepeatAllow).toHaveBeenCalledWith(false);
    });
  });
});
