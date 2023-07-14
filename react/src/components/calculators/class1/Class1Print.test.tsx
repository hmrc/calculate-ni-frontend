import React from "react";
import { render, screen } from "@testing-library/react";
import Class1Print from "./Class1Print";
import { ClassOneContext } from "./ClassOneContext";

const mockResult = null;
const setShowSummary = jest.fn();

const mockValue: any = {
  taxYear: {
    id: "[2022-04-06, 2023-04-05]",
    from: new Date("2022-04-06T00:00:00.000Z"),
    to: new Date("2023-04-05T00:00:00.000Z"),
  },
};

const renderComponent = (value: any) =>
  render(
    <ClassOneContext.Provider value={value}>
      <Class1Print
        setShowSummary={setShowSummary}
        title="print-title"
        result={mockResult}
      />
    </ClassOneContext.Provider>
  );

jest.mock("../shared/CategoryTotals", () => () => (
  <div data-testid="category-totals-section">Category Totals Section</div>
));

jest.mock("./Class1Table", () => () => (
  <div data-testid="class1-table">Class 1 Table</div>
));

jest.mock("../shared/DetailsPrint", () => () => (
  <div data-testid="details-print-section">Details Print Section</div>
));

describe("Class1Print", () => {
  beforeEach(() => {
    renderComponent(mockValue);
  });

  it("renders print section", () => {
    expect(screen.queryByTestId("print-section")).not.toBeNull();
  });

  it("renders back link", () => {
    expect(screen.queryByTestId("back-link")).not.toBeNull();
  });

  it("renders print title", () => {
    expect(screen.queryByTestId("print-title")).toHaveTextContent(
      "print-title"
    );
  });

  it("renders details print section", () => {
    expect(screen.queryByTestId("details-print-section")).not.toBeNull();
  });

  it("renders tax year text", () => {
    expect(screen.queryByTestId("print-tax-year-text")).not.toBeNull();
  });

  it("should render class1 table", () => {
    expect(screen.queryByTestId("class1-table")).not.toBeNull();
  });

  it("renders NI due text", () => {
    expect(screen.queryByTestId("print-ni-due-text")).toHaveTextContent(
      "NI due"
    );
  });

  it("renders category totals section", () => {
    expect(screen.queryByTestId("category-totals-section")).not.toBeNull();
  });

  it("should call callback function when back link is clicked", () => {
    const backLink = screen.queryByTestId("back-link");
    backLink?.click();
    expect(setShowSummary).toHaveBeenCalled();
  });
});
