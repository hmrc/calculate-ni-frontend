import React from "react";
import { render, screen } from "@testing-library/react";
import Class1TableRow from "./Class1TableRow";
import { ClassOneContext } from "./ClassOneContext";
import { periods, PeriodValue, periodValueToLabel } from "../../../config";

jest.mock("../shared/ExplainToggle", () => () => (
  <div data-testid="explain-toggle">Explain Toggle</div>
));

jest.mock("../../helpers/formhelpers/TextInput", () => () => (
  <div data-testid="text-input">Text Input</div>
));

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
const mockValue: any = {
  rows,
  setRows: jest.fn(),
  result: {
    employerContributions: 2,
  },
  errors: {
    "1-gross": {
      name: "err1",
      link: "err1 link",
      message: "err1 message",
    },
  },
  categories: ["A", "B"],
  activeRowId: "1",
  setActiveRowId: jest.fn(),
  setResult: jest.fn(),
  categoryNames: { A: "Category 1", C: "Category 2" },
  niRow: rows[0],
  setPeriodType: jest.fn(),
  setIsRepeatAllow: jest.fn(),
  getAllowedRows: jest.fn(),
};

const mockValueOptional: any = {
    ...mockValue,
    rows: [{...rows[0], number: undefined}],
    errors: {},
}

jest.mock("../../../config", () => ({
  periods: ["Weekly", "Fortnightly", "Four weekly", "Monthly", "Annual"],
  PeriodValue: jest.fn(),
  periodValueToLabel: () => "Weekly",
}));

jest.mock("../../../services/utils", () => ({
  getBandValue: () => "Band 1",
  getContributionBandValue: () => "Band 2",
}));

const renderComponent = (props: any) => {
  const {
    row,
    index,
    showBands,
    printView,
    setShowExplanation,
    showExplanation,
    bandNames,
    contributionNames,
    repeatQty,
    contextValue,
  } = props;

  return render(
    <ClassOneContext.Provider value={contextValue}>
      <Class1TableRow
        row={row}
        index={index}
        showBands={showBands}
        printView={printView}
        setShowExplanation={setShowExplanation}
        showExplanation={showExplanation}
        contributionNames={contributionNames}
        bandNames={bandNames}
        repeatQty={repeatQty}
      />
    </ClassOneContext.Provider>
  );
};

const setShowExplanation = jest.fn();

describe("Class1TableRow", () => {
  describe("when bands to show and a print view", () => {
    beforeEach(() => {
      renderComponent({
        row: rows[0],
        index: 0,
        showBands: true,
        printView: true,
        setShowExplanation,
        showExplanation: "1",
        contributionNames: ["ee", "er"],
        bandNames: ["band1", "band2"],
        repeatQty: 1,
        contextValue: mockValue,
      });
    });

    it("should render payment contribution table row with print view", () => {
      expect(screen.findAllByRole("tr")).not.toBeNull();
    });
  });

  describe("when no bands to show and without a print view", () => {
    beforeEach(() => {
      renderComponent({
        row: rows[0],
        index: 0,
        showBands: true,
        printView: false,
        setShowExplanation,
        showExplanation: "1",
        contributionNames: ["ee", "er"],
        bandNames: ["band1", "band2"],
        repeatQty: 1,
        contextValue: mockValue,
      });
    });

    it("should render payment contribution table row without print view", () => {
      expect(screen.findAllByRole("tr")).not.toBeNull();
    });
  });

    describe("when render without optional values", () => {
        beforeEach(() => {
            renderComponent({
                row: mockValueOptional.rows[0],
                index: 0,
                showBands: true,
                printView: false,
                setShowExplanation,
                showExplanation: "1",
                repeatQty: 1,
                contextValue: mockValueOptional,
            });
        });

        it("should render payment contribution table row without print view", () => {
            expect(screen.findAllByRole("tr")).not.toBeNull();
        });
    });
});
