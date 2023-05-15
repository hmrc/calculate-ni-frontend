import React from "react";
import { render, screen } from "@testing-library/react";
import Class1PeriodsSection from "./Class1PeriodsSection";
import { PeriodValue } from "../../../config";

const customRows = [
  {
    id: "[2022-04-06, 2023-04-05]",
    category: "A",
    number: 1,
    period: PeriodValue.MONTHLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2023-04-05T00:00:00.000Z",
  },
];

const handleDateInputChange = jest.fn();

jest.mock("./Class1PeriodsTable", () => () => (
  <div data-testid="class1-periods-table">Periods Table</div>
));

describe("Class1PeriodsSection", () => {
  beforeEach(() => {
    render(
      <Class1PeriodsSection
        customRows={customRows}
        handleDateInputChange={handleDateInputChange}
      />
    );
  });

  it("renders periods section", () => {
    expect(screen.queryByTestId("class1-periods-section")).not.toBeNull();
  });

  it("renders section title", () => {
    expect(screen.queryByTestId("class1-periods-section-title")).not.toBeNull();
  });

  it("renders section subtitle", () => {
    expect(
      screen.queryByTestId("class1-periods-section-subtitle")
    ).not.toBeNull();
  });

  it("should render periods table", () => {
    expect(screen.queryByTestId("class1-periods-table")).not.toBeNull();
  });
});
