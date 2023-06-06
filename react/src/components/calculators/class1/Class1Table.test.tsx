import React from "react";
import { render, screen } from "@testing-library/react";
import Class1Table from "./Class1Table";
import { ClassOneContext } from "./ClassOneContext";
import { PeriodValue } from "../../../config";

jest.mock("./Class1TableRow", () => () => (
  <div data-testid="class1-table-row">Class 1 table Row</div>
));

jest.mock("../shared/ExplainRow", () => () => (
  <div data-testid="explain-row">Explain Row</div>
));

jest.mock("../../../assets/select-dropdown-arrows.svg", () => "dropdown-arrow");

jest.mock("../../../services/utils", () => ({
  getBandNames: () => ["A", "B", "C"],
  getContributionBandNames: () => ["A", "B", "C"],
}));

const renderComponent = (props: any) => {
  const { showBands, printView, repeatQty, contextValue } = props;
  return render(
    <ClassOneContext.Provider value={contextValue}>
      <Class1Table
        showBands={showBands}
        printView={printView}
        repeatQty={repeatQty}
      />
    </ClassOneContext.Provider>
  );
};

const setRows = jest.fn();
const setErrors = jest.fn();
const rows = [
  {
    id: "1",
    category: "A",
    number: 1,
    period: PeriodValue.MONTHLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2022-04-05T00:00:00.000Z",
  },
  {
    id: "2",
    category: "A",
    number: 2,
    period: PeriodValue.WEEKLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2023-04-05T00:00:00.000Z",
  },
  {
    id: "3",
    category: "A",
    number: 3,
    period: PeriodValue.FORTNIGHTLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2023-04-05T00:00:00.000Z",
  },
  {
    id: "4",
    category: "A",
    number: 4,
    period: PeriodValue.FOURWEEKLY,
    gross: "100",
    ee: 1,
    er: 1,
    date: "2023-04-05T00:00:00.000Z",
  },
  {
    id: "5",
    category: "A",
    number: 5,
    period: PeriodValue.ANNUAL,
    gross: "100",
    ee: 1,
    er: 1,
  },
];
const result: any = { employerContributions: 2 };
const setState = jest.fn();

const mockValue: any = {
  rows,
  setRows,
  setErrors,
  result,
};

jest.mock("../../../services/utils", () => ({
  getBandNames: () => ["A", "B", "C"],
  getContributionBandNames: () => ["A", "B", "C"],
}));

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");

  return {
    ...actualReact,
    useState: jest.fn(),
  };
});

describe("Class1Table", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("when no bands to show and not a print view", () => {
    beforeEach(() => {
      jest.spyOn(React, "useState").mockImplementation(() => ["1", setState]);

      renderComponent({
        showBands: false,
        printView: false,
        repeatQty: 1,
        contextValue: mockValue,
      });
    });

    it("should render payment contribution table without band columns and without print view", () => {
      expect(screen.queryByTestId("payment-table")).not.toBeNull();
    });
  });

  describe("when bands to show and it is a print view", () => {
    beforeEach(() => {
      jest.spyOn(React, "useState").mockImplementation(() => ["1", setState]);

      renderComponent({
        showBands: true,
        printView: true,
        repeatQty: 4,
        contextValue: mockValue,
      });
    });

    it("should render payment contribution table with band columns and with print view", () => {
      expect(screen.queryByTestId("payment-table")).not.toBeNull();
    });
  });
});
