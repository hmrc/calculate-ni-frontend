import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Class1 from "./Class1";
import { ClassOneContext } from "./ClassOneContext";
import { SuccessNotificationContext } from "../../../services/SuccessNotificationContext";
import { PeriodValue } from "../../../config";
import { hasKeys } from "../../../services/utils";
import { NiFrontendContext } from "../../../services/NiFrontendContext";
import { useDocumentTitle } from "../../../services/useDocumentTitle";

jest.mock("./Class1Table", () => () => (
  <div data-testid="class1-table-section">Class1 Table section</div>
));

jest.mock("../shared/Totals", () => () => (
  <div data-testid="totals-section">Totals section</div>
));

jest.mock("./Class1Print", () => () => (
  <div data-testid="class1-print-section">Class1 Print section</div>
));

jest.mock("../../../calculation", () => ({
  ClassOneRow: () => rows[0],
}));

jest.mock("../../helpers/gov-design-system/ErrorSummary", () => () => (
  <div data-testid="error-summary-section">Error Summary section</div>
));

jest.mock("../shared/SuccessNotification", () => ({
  ...jest.requireActual("../shared/SuccessNotification"),
  SuccessNotification: () => (
    <div data-testid="success-notification">Success Notification</div>
  ),
}));

jest.mock("../shared/NiPaidInputs", () => () => (
  <div data-testid="class1-ni-paid-inputs-section">NI Tax section</div>
));

jest.mock("../../../validation/validation", () => ({
  validateClassOnePayload: () => true,
  stripCommas: jest.fn(),
}));

jest.mock("../../../services/useDocumentTitle", () => ({
  useDocumentTitle: jest.fn(),
}));

jest.spyOn(React, "useEffect").mockImplementation((f) => f());
jest.spyOn(React, "useRef").mockImplementation(() => ({
  current: {
    focus: jest.fn(),
  },
}));

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
    totalContributions: 100,
    bands: [
      {
        name: "Band 1",
        amountInBand: 100,
      },
    ],
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

const mockNiFrontendContext: any = {
  NiFrontendInterface: {
    classOne: {
      calculate: () => mockResult,
      getApplicableCategories: () => new Date("2022-04-06").toDateString(),
      getTaxYears: ["2022-04-06", "2023-04-05"],
      getCategoryNames: [
        { letter: "A", name: "Category A" },
        { letter: "B", name: "Category B" },
      ],
    },
  },
};

const mockDetails: any = {
  fullName: "full name",
  ni: "123",
  reference: "ref",
  preparedBy: "prepared by",
  date: "2022-04-06",
};

const mockValue: any = {
  ClassOneCalculator: mockNiFrontendContext.NiFrontendInterface.classOne,
  taxYear: {
    id: "[2022-04-06, 2023-04-05]",
    from: new Date("2022-04-06T00:00:00.000Z"),
    to: new Date("2023-04-05T00:00:00.000Z"),
  },
  setTaxYear: jest.fn(),
  taxYears: [
    {
      id: "[2022-04-06, 2022-12-05]",
      from: new Date("2022-04-06T00:00:00.000Z"),
      to: new Date("2022-12-05T00:00:00.000Z"),
    },
    {
      id: "[2022-12-06, 2023-04-05]",
      from: new Date("2022-12-06T00:00:00.000Z"),
      to: new Date("2023-04-05T00:00:00.000Z"),
    },
  ],
  result: mockResult,
  setResult: jest.fn(),
  rows,
  setRows: jest.fn(),
  setPeriodNumbers: jest.fn(),
  details: mockDetails,
  setDetails: jest.fn(),
  niPaidNet: "100,20",
  setNiPaidNet: jest.fn(),
  defaultRow: rows[0],
  niRow: rows[0],
  setNiRow: jest.fn(),
  niPaidEmployee: "",
  setNiPaidEmployee: jest.fn(),
  errors: {},
  setErrors: jest.fn(),
  categoryTotals: {},
  setCategoryTotals: jest.fn(),
  categories: [],
  setCategories: jest.fn(),
  activeRowId: null,
  setActiveRowId: jest.fn(),
  categoryNames: {},
  setDefaultRow: jest.fn(),
  periodType: "W",
  setPeriodType: jest.fn(),
  isRepeatAllow: true,
  setIsRepeatAllow: jest.fn(),
  getAllowedRows: jest.fn(),
  customRows: [],
  setCustomRows: jest.fn(),
};

const mockNotiValue: any = {
  successNotificationsOn: true,
  setSuccessNotificationsOn: jest.fn(),
};

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");

  return {
    ...actualReact,
    useState: jest.fn(),
    useEffect: jest.fn(),
    useRef: jest.fn(),
    useContext: (context: any) => {
      if (context === ClassOneContext) {
        return mockValue;
      } else if (context === SuccessNotificationContext) {
        return mockNotiValue;
      } else if (context === NiFrontendContext) {
        return mockNiFrontendContext;
      }
    },
  };
});

jest.mock("../../../services/utils");
const mockUseHasKeys = hasKeys as jest.MockedFunction<typeof hasKeys>;

const setState = jest.fn();

describe("Class1", () => {
  describe("when have to show summary", () => {
    beforeEach(() => {
      jest.spyOn(React, "useState").mockImplementation(() => [true, setState]);
      mockUseHasKeys.mockReturnValue(true);
      render(<Class1 />);
    });

    it("renders section", () => {
      expect(screen.queryByTestId("result-announcement")).not.toBeNull();
    });
  });

  describe("when don't have to show summary", () => {
    beforeEach(() => {
      jest.spyOn(React, "useState").mockImplementation(() => [false, setState]);
      mockUseHasKeys.mockReturnValue(true);
      render(<Class1 />);
    });

    it("renders section", () => {
      expect(screen.queryByTestId("result-announcement")).not.toBeNull();
    });

    it("renders form", () => {
      expect(screen.queryByTestId("class-one-form")).not.toBeNull();
    });

    it("should submit form on clicking calculate button", async () => {
      const button = screen.getByRole("button", { name: "Calculate" });
      fireEvent.click(button);

      expect(mockValue.setActiveRowId).toHaveBeenCalled();
      expect(mockValue.setResult).toHaveBeenCalledWith(mockResult);
    });

    it("should call reset callback on clicking clear table button", () => {
      const button = screen.getByRole("button", { name: "Clear table" });
      fireEvent.click(button);

      expect(mockValue.setActiveRowId).toHaveBeenCalledWith(null);
      expect(mockValue.setErrors).toHaveBeenCalledWith({});
      expect(mockValue.setRows).toHaveBeenCalledWith([rows[0]]);
      expect(mockValue.setResult).toHaveBeenCalledWith(null);
      expect(mockValue.setNiPaidEmployee).toHaveBeenCalledWith("");
      expect(mockValue.setNiPaidNet).toHaveBeenCalledWith("");
    });

    it("should call handleShowSummary callback on clicking Save & Print button", () => {
      const button = screen.getByRole("button", { name: "Save and print" });
      fireEvent.click(button);

      expect(mockValue.setActiveRowId).toHaveBeenCalledWith(null);
      expect(mockValue.setResult).toHaveBeenCalled();
    });

    it("should call handleDetailsChange callback on changing details", () => {
      const input = screen.getByLabelText("NI number (optional)");
      fireEvent.change(input, { target: { value: "123456789" } });

      expect(mockValue.setDetails).toHaveBeenCalled();
    });
  });

  describe("document title", () => {
    it("should render page title with prefix Error: when has any errors", () => {
      mockUseHasKeys.mockReturnValue(true);
      render(<Class1 />);

      expect(useDocumentTitle).toHaveBeenCalledWith(
        "Error: Calculate Class 1 National Insurance (NI) contributions"
      );
    });

    it("should not render page title with prefix Error: when there is not any errors", () => {
      mockUseHasKeys.mockReturnValue(false);

      const test = React.useContext(SuccessNotificationContext);
      test.successNotificationsOn = false;

      render(<Class1 />);

      expect(useDocumentTitle).toHaveBeenCalledWith(
        "Calculate Class 1 National Insurance (NI) contributions"
      );
    });
  });
});
