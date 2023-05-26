import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Class1PeriodsTable from "./Class1PeriodsTable";
import { PeriodValue } from "../../../config";
import { ClassOneContext } from "./ClassOneContext";

const customRows = [
  {
    id: 1,
    category: "A",
    number: 1,
    period: PeriodValue.MONTHLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2022-04-05T00:00:00.000Z",
  },
  {
    id: 2,
    category: "A",
    number: 2,
    period: PeriodValue.WEEKLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2023-04-05T00:00:00.000Z",
  },
  {
    id: 3,
    category: "A",
    number: 3,
    period: PeriodValue.FORTNIGHTLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2023-04-05T00:00:00.000Z",
  },
  {
    id: 4,
    category: "A",
    number: 4,
    period: PeriodValue.FOURWEEKLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2023-04-05T00:00:00.000Z",
  },
  {
    id: 5,
    category: "A",
    number: 5,
    period: PeriodValue.ANNUAL,
    gross: "100",
    ee: 1,
    er: 1,
  },
];

const mockValue: any = {
  customRows,
  errors: {},
};

const mockValueWithErrors: any = {
  ...mockValue,
  errors: {
    "1-date": {
      date: "Date is required",
    },
  },
};

const handleDateInputChange = jest.fn();

describe("Class1PeriodsTable", () => {
  describe("when props data passed", () => {
    beforeEach(() => {
      render(
        <ClassOneContext.Provider value={mockValue}>
          <Class1PeriodsTable handleDateInputChange={handleDateInputChange} />
        </ClassOneContext.Provider>
      );
    });

    it("should render periods table", () => {
      expect(screen.queryByTestId("periods-table")).not.toBeNull();
    });

    it("should render correct table headers", () => {
      expect(screen.getAllByTestId(/^header-*/)).toHaveLength(3);
      expect(screen.queryByTestId("header-period-type")).toHaveTextContent(
        "Period type"
      );
      expect(screen.queryByTestId("header-period")).toHaveTextContent("Period");
      expect(screen.queryByTestId("header-date-ni-paid")).toHaveTextContent(
        "Date NI paid"
      );
    });

    it("should render correct numbers of table data rows", () => {
      expect(screen.getAllByTestId("periods-table-row")).toHaveLength(5);
    });

    it("should call callback function when text input is changed", () => {
      // @ts-ignore
      const input = screen
        .getByText("Date NI paid for row number 1")
        .closest("tr")
        .querySelector("input") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "2022-05-18" } });
      expect(handleDateInputChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("when props data passed with errors", () => {
    beforeEach(() => {
      render(
        <ClassOneContext.Provider value={mockValueWithErrors}>
          <Class1PeriodsTable handleDateInputChange={handleDateInputChange} />
        </ClassOneContext.Provider>
      );
    });

    it("should show error", () => {
      // @ts-ignore
      const input = screen
        .getByText("Date NI paid for row number 1")
        .closest("tr")
        .querySelector("input") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "" } });

      const getErrorCell = (input.closest("td") as HTMLDivElement) || null;
      expect(getErrorCell).toHaveClass("error-cell");
    });
  });

  describe("when props data not passed", () => {
    beforeEach(() => {
      render(
        // @ts-ignore -- to cover ternary operator condition
        <Class1PeriodsTable />
      );
    });

    it("should render periods table", () => {
      expect(screen.queryByTestId("periods-table")).not.toBeNull();
    });

    it("should render correct table headers", () => {
      expect(screen.getAllByTestId(/^header-*/)).toHaveLength(3);
      expect(screen.queryByTestId("header-period-type")).toHaveTextContent(
        "Period type"
      );
      expect(screen.queryByTestId("header-period")).toHaveTextContent("Period");
      expect(screen.queryByTestId("header-date-ni-paid")).toHaveTextContent(
        "Date NI paid"
      );
    });

    it("should not render table data rows", () => {
      expect(screen.queryAllByTestId("periods-table-row")).toHaveLength(0);
    });
  });
});
