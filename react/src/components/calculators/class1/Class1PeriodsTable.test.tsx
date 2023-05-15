import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Class1PeriodsTable from "./Class1PeriodsTable";
import { PeriodValue } from "../../../config";

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

const handleDateInputChange = jest.fn();

describe("Class1PeriodsTable", () => {
  describe("when props data passed", () => {
    beforeEach(() => {
      render(
        <Class1PeriodsTable
          // @ts-ignore -- to cover ternary operator condition
          customRows={customRows}
          handleDateInputChange={handleDateInputChange}
        />
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
      const selectOne = screen.getByRole("textbox", {
        name: "Date NI paid for row number 1",
      });
      fireEvent.change(selectOne, {
        target: { value: "abc" },
      });
      expect(handleDateInputChange).toHaveBeenCalledTimes(1);
    });
  });
  describe("when props data not passed", () => {
    beforeEach(() => {
      render(
        // @ts-ignore -- to cover ternary operator condition
        <Class1PeriodsTable customRows={[]} />
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
