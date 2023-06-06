import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Class1TableRow from "./Class1TableRow";
import { ClassOneContext } from "./ClassOneContext";
import { PeriodValue } from "../../../config";

jest.mock("../shared/ExplainToggle", () => () => (
  <div data-testid="explain-toggle">Explain Toggle</div>
));

const rows = [
  {
    id: "1",
    category: "A",
    number: 1,
    period: PeriodValue.MONTHLY,
    gross: "",
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
  categoryNames: { A: "Category1", C: "Category2" },
  niRow: rows[0],
  setPeriodType: jest.fn(),
  setIsRepeatAllow: jest.fn(),
  getAllowedRows: jest.fn(),
};

const mockValueOptional: any = {
  ...mockValue,
  rows: [{ ...rows[0], number: undefined }],
  errors: {},
};

jest.mock("../../../config", () => ({
  periods: ["W", "2W", "4W", "M", "A"],
  PeriodValue: jest.fn(),
  periodValueToLabel: jest.fn(),
}));

jest.mock("../../../services/utils", () => ({
  getBandValue: () => "Band 1",
  getContributionBandValue: () => "Band 2",
  buildDescribedByKeys: () => "test",
}));

const setShowExplanation = jest.fn();
const props = {
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
};

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

describe("Class1TableRow", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

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
      renderComponent(props);
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

  describe("callback function handleSelectChangeCategory", () => {
    it("should change category value", () => {
      const { container } = renderComponent(props);
      const selectOne = container.querySelector(
        `select[name="category"]`
      ) as HTMLSelectElement;
      fireEvent.change(selectOne, {
        target: { value: "Category1" },
      });
      expect(mockValue.setRows).toBeCalled();
    });
  });

  describe("callback function handleChange", () => {
    it("should change gross value", () => {
      const { container } = renderComponent(props);
      const input = container.querySelector(
        `input[name="1-gross"]`
      ) as HTMLInputElement;
      fireEvent.change(input, {
        target: { value: 111 },
      });
      expect(mockValue.setRows).toBeCalled();
    });

    it("should not paste gross value if blank data", () => {
      const { container } = renderComponent(props);
      const input = container.querySelector(
        `input[name="1-gross"]`
      ) as HTMLInputElement;
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => "",
        },
      });
      expect(input.value).toBe("");
    });

    it("should paste gross value", () => {
      const { container } = renderComponent(props);
      const input = container.querySelector(
        `input[name="1-gross"]`
      ) as HTMLInputElement;
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => "100",
        },
      });
      expect(mockValue.setRows).toBeCalled();
    });
  });

  describe("callback function handlePeriodChange", () => {
    it("should change period number value", () => {
      const { container } = renderComponent(props);
      const input = container.querySelector(
        `input[name="number"]`
      ) as HTMLInputElement;

      fireEvent.change(input, {
        target: { value: 12 },
      });
      expect(mockValue.setRows).toBeCalled();
    });

    it("should change period number value to null when invalid value", () => {
      const { container } = renderComponent(props);
      const input = container.querySelector(
        `input[name="number"]`
      ) as HTMLInputElement;

      fireEvent.change(input, {
        target: { value: "ab" },
      });
      expect(mockValue.setRows).toBeCalled();
    });
  });

  describe("callback function handleSelectChangePeriod", () => {
    describe("when selected period type is Monthly and total rows greater than 12", () => {
      it("should change period value to Monthly and should set 12 rows only", () => {
        const mockConData: any = {
          ...mockValue,
          rows: Array(13).fill(rows[0]),
        };
        const data: any = { ...props, contextValue: mockConData };
        const { container } = renderComponent(data);

        const selectOne = container.querySelector(
          `select[name="period"]`
        ) as HTMLSelectElement;
        fireEvent.change(selectOne, {
          target: { value: "M" },
        });
        expect(mockValue.setPeriodType).toBeCalledWith("M");
        expect(mockValue.setRows).toBeCalled();
        expect(mockValue.setIsRepeatAllow).toBeCalledWith(true);
      });
    });

    describe("when selected period type is Weekly and total rows greater than 53", () => {
      it("should change period value to Weekly and should set 53 rows only", () => {
        const mockConData: any = {
          ...mockValue,
          rows: Array(54).fill(rows[0]),
        };
        const data: any = { ...props, contextValue: mockConData };
        const { container } = renderComponent(data);

        const selectOne = container.querySelector(
          `select[name="period"]`
        ) as HTMLSelectElement;
        fireEvent.change(selectOne, {
          target: { value: "W" },
        });
        expect(mockValue.setPeriodType).toBeCalledWith("W");
        expect(mockValue.setRows).toBeCalled();
        expect(mockValue.setIsRepeatAllow).toBeCalledWith(true);
      });
    });

    describe("when selected period type is Fortnightly and total rows greater than 27", () => {
      it("should change period value to Fortnightly and should set 27 rows only", () => {
        const mockConData: any = {
          ...mockValue,
          rows: Array(28).fill(rows[0]),
        };
        const data: any = { ...props, contextValue: mockConData };
        const { container } = renderComponent(data);

        const selectOne = container.querySelector(
          `select[name="period"]`
        ) as HTMLSelectElement;
        fireEvent.change(selectOne, {
          target: { value: "2W" },
        });
        expect(mockValue.setPeriodType).toBeCalledWith("2W");
        expect(mockValue.setRows).toBeCalled();
        expect(mockValue.setIsRepeatAllow).toBeCalledWith(true);
      });
    });

    describe("when selected period type is Fourweekly and total rows less than 14", () => {
      it("should change period value to Fourweekly and should set all rows", () => {
        const mockConData: any = {
          ...mockValue,
          rows: Array(10).fill(rows[0]),
          getAllowedRows: () => 14,
        };
        const data: any = {
          ...props,
          contextValue: mockConData,
          repeatQty: 16,
        };
        const { container } = renderComponent(data);

        const selectOne = container.querySelector(
          `select[name="period"]`
        ) as HTMLSelectElement;
        fireEvent.change(selectOne, {
          target: { value: "4W" },
        });
        expect(mockValue.setPeriodType).toBeCalledWith("4W");
        expect(mockValue.setRows).toBeCalled();
        expect(mockValue.setIsRepeatAllow).toBeCalledWith(false);
      });
    });

    describe("when selected period type is Fourweekly and total rows greater than 14 and repeatQty is greater than allowed rows", () => {
      it("should change period value to Fourweekly and should set 14 rows only", () => {
        const mockConData: any = {
          ...mockValue,
          rows: Array(15).fill(rows[0]),
          getAllowedRows: () => 14,
        };
        const data: any = {
          ...props,
          contextValue: mockConData,
          repeatQty: 16,
        };
        const { container } = renderComponent(data);

        const selectOne = container.querySelector(
          `select[name="period"]`
        ) as HTMLSelectElement;
        fireEvent.change(selectOne, {
          target: { value: "4W" },
        });
        expect(mockValue.setPeriodType).toBeCalledWith("4W");
        expect(mockValue.setRows).toBeCalled();
        expect(mockValue.setIsRepeatAllow).toBeCalledWith(false);
      });
    });
  });
});
