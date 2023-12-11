import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Class1 from "./Class1";
import { ClassOneContext } from "./ClassOneContext";
import { SuccessNotificationContext } from "../../../services/SuccessNotificationContext";
import { PeriodValue } from "../../../config";
import { hasKeys } from "../../../services/utils";
import { NiFrontendContext } from "../../../services/NiFrontendContext";
import { useDocumentTitle } from "../../../services/useDocumentTitle";
import { validateClassOnePayload } from "../../../validation/validation";

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
  validateClassOnePayload: jest.fn(),
  stripCommas: jest.fn(),
}));

jest.mock("../../../services/useDocumentTitle", () => ({
  useDocumentTitle: jest.fn(),
}));

// @ts-ignore
jest.spyOn(React, "useEffect").mockImplementation((f) => f());
jest.spyOn(React, "useRef").mockImplementation(() => ({
  current: {
    focus: jest.fn(),
  },
}));

// @ts-ignore
const mockValidateClassOnePayload = validateClassOnePayload as jest.Mock;

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

const mockResult = {
  categoryTotals: new Map([
    [
      "A",
      {
        gross: 6000,
        employee: 492.9,
        employer: 586.92,
        net: 1079.82,
        resultBands: {},
        resultContributionBands: {},
      },
    ],
  ]),
  resultRows: rows,
  from: "2022-04-06T00:00:00.000Z",
  id: "[2022-04-06, 2022-05-01]",
  to: "2022-05-01T00:00:00.000Z",
  bandTotals: {
    resultBands: new Map([
      [
        "Up to LEL",
        {
          gross: 1476,
          employee: 0,
          employer: 0,
          net: 0,
        },
      ],
      [
        "LEL to PT",
        {
          gross: 804,
          employee: 0,
          employer: 0,
          net: 0,
        },
      ],
      [
        "PT to UEL",
        {
          gross: 3720,
          employee: 492.9,
          employer: 0,
          net: 0,
        },
      ],
    ]),
    resultContributionBands: new Map([
      [
        "Up to LEL",
        {
          gross: 1476,
          employee: 0,
          employer: 0,
          net: 0,
        },
      ],
      [
        "LEL to PT",
        {
          gross: 804,
          employee: 0,
          employer: 0,
          net: 0,
        },
      ],
      [
        "PT to UEL",
        {
          gross: 3720,
          employee: 492.9,
          employer: 0,
          net: 0,
        },
      ],
    ]),
  },
  employerPaid: 0,
  totals: {
    gross: 6000,
    employee: 492.9,
    employer: 586.92,
    net: 1079.82,
  },
  underpayment: {
    employee: 492.9,
    employer: 586.92,
    total: 1079.82,
  },
  overpayment: {
    employee: 0,
    employer: 0,
    total: 0,
  },
  employerContributions: 0,
};

const mockResultMultiple: any = {
  ...mockResult,
  categoryTotals: new Map([
    [
      "A",
      {
        gross: 6000,
        employee: 492.9,
        employer: 586.92,
        net: 1079.82,
        resultBands: {},
        resultContributionBands: {},
      },
    ],
    [
      "V",
      {
        gross: 6000,
        employee: 492.9,
        employer: 586.92,
        net: 1079.82,
        resultBands: {},
        resultContributionBands: {},
      },
    ],
  ]),
  bandTotals: {
    resultBands: new Map([
      [
        "Up to LEL 22",
        {
          gross: 1476,
          employee: 0,
          employer: 0,
          net: 0,
        },
      ],
    ]),
    resultContributionBands: new Map([
      [
        "Up to LEL 22",
        {
          gross: 1476,
          employee: 0,
          employer: 0,
          net: 0,
        },
      ],
    ]),
  },
};

const mockNiFrontendContext: any = {
  NiFrontendInterface: {
    classOne: {
      calculate: () => jest.fn(),
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

const mockCustomSplitRows: any = {
  "period-2": {
    rows: [
      {
        id: "1",
        category: "A",
        gross: "1000",
        ee: 0,
        er: 0,
        number: 1,
        period: "2W",
        date: "2022-04-06",
      },
    ],
    from: new Date("2022-04-06"),
  },
};
const mockCustomSplitRowsMulti: any = {
  "period-0": {
    rows: [
      {
        id: "1",
        category: "A",
        gross: "1000",
        ee: 0,
        er: 0,
        number: 1,
        period: "2W",
        date: "2022-04-06",
      },
    ],
    from: new Date("2022-04-06"),
  },
  "period-1": {
    rows: [
      {
        id: "2",
        category: "A",
        gross: "1000",
        ee: 0,
        er: 0,
        number: 2,
        period: "2W",
        date: "2022-07-06",
      },
    ],
    from: new Date("2022-07-06"),
  },
  "period-2": {
    rows: [
      {
        id: "3",
        category: "A",
        gross: "1000",
        ee: 0,
        er: 0,
        number: 3,
        period: "2W",
        date: "2022-11-06",
      },
    ],
    from: new Date("2022-11-06"),
  },
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
  result: [],
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
  isMultiYear: true,
  setIsMultiYear: jest.fn(),
  customSplitRows: mockCustomSplitRows,
  setCustomSplitRows: jest.fn(),
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
// @ts-ignore
const mockUseHasKeys = hasKeys as jest.MockedFunction<typeof hasKeys>;

const setState = jest.fn();

const doCalculate = () => {
  const { container } = render(<Class1 />);

  const button = container.querySelector(
    "button[type='submit']"
  ) as HTMLButtonElement;
  fireEvent.click(button);
};

describe("Class1", () => {
  beforeEach(() => {
    mockValidateClassOnePayload.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when form in print mode", () => {
    it("renders section", () => {
      jest.spyOn(React, "useState").mockImplementation(() => [true, setState]);
      mockUseHasKeys.mockReturnValue(true);
      render(<Class1 />);
      expect(screen.queryByTestId("result-announcement")).not.toBeNull();
    });
  });

  describe("when form in submit mode", () => {
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

    describe("when split year with 3 periods", () => {
      beforeEach(() => {
        mockValue.isMultiYear = true;
      });

      it("should submit form on clicking calculate button and should not set result when result is empty", async () => {
        mockValue.customSplitRows = undefined;
        mockNiFrontendContext.NiFrontendInterface.classOne.calculate = jest
          .fn()
          .mockReturnValue([]);
        mockValue.result = [];

        doCalculate();

        expect(mockValue.setResult).not.toHaveBeenCalled();
      });

      // it("should submit form on clicking calculate button and should set result", async () => {
      //   mockValidateClassOnePayload.mockReturnValue(true);
      //   mockValue.customSplitRows = mockCustomSplitRowsMulti;
      //   mockNiFrontendContext.NiFrontendInterface.classOne.calculate = jest
      //     .fn()
      //     .mockReturnValueOnce(mockResult)
      //     .mockReturnValueOnce(mockResultMultiple)
      //     .mockReturnValue(mockResultMultiple);
      //   mockValue.result = mockResult;
      //
      //   doCalculate();
      //
      //   expect(mockValue.setActiveRowId).toHaveBeenCalled();
      //   expect(mockValue.setResult).toHaveBeenCalled();
      // });
    });

    describe("when split year with 1 period", () => {
      beforeEach(() => {
        mockValue.isMultiYear = true;
        mockValue.customSplitRows = mockCustomSplitRows;
        mockNiFrontendContext.NiFrontendInterface.classOne.calculate = jest
          .fn()
          .mockReturnValue(mockResult);
        mockValue.result = mockResult;
        mockValidateClassOnePayload.mockReturnValue(true);
      });

      it("should submit form on clicking calculate button", () => {
        doCalculate();

        expect(mockValue.setActiveRowId).toHaveBeenCalled();
        expect(mockValue.setResult).toHaveBeenCalled();
      });

      it("when NI paid amount is less than total due NI", () => {
        mockValue.niPaidNet = "1000";
        mockValue.result.totals.net = "1100";

        doCalculate();

        expect(mockValue.result.underpayment.total).toEqual("100.00");
        expect(mockValue.result.overpayment.total).toEqual(0);
      });

      it("when NI paid amount is more than total due NI", () => {
        mockValue.niPaidNet = "1100";
        mockValue.result.totals.net = "1000";

        doCalculate();

        expect(mockValue.result.underpayment.total).toEqual(0);
        expect(mockValue.result.overpayment.total).toEqual("100.00");
      });

      it("when NI paid amount is not entered", () => {
        mockValue.niPaidNet = "";
        mockValue.result.totals.net = "1100";

        doCalculate();

        expect(mockValue.result.underpayment.total).toEqual("1100");
        expect(mockValue.result.overpayment.total).toEqual(0);
      });

      it("when NI paid employee amount is less than total due NI employee", () => {
        mockValue.niPaidEmployee = "1000";
        mockValue.result.totals.employee = "1100";

        doCalculate();

        expect(mockValue.result.underpayment.employee).toEqual("100.00");
        expect(mockValue.result.overpayment.employee).toEqual(0);
      });

      it("when NI paid employee amount is more than total due NI employee", () => {
        mockValue.niPaidEmployee = "1100";
        mockValue.result.totals.employee = "1000";

        doCalculate();

        expect(mockValue.result.underpayment.employee).toEqual(0);
        expect(mockValue.result.overpayment.employee).toEqual("100.00");
      });

      it("when NI paid employee amount is not entered", () => {
        mockValue.niPaidEmployee = "";
        mockValue.result.totals.employee = "1100";

        doCalculate();

        expect(mockValue.result.underpayment.employee).toEqual("1100");
        expect(mockValue.result.overpayment.employee).toEqual(0);
      });

      it("when employer contributions amount is less than total due NI employer", () => {
        mockValue.result.employerContributions = 1000;
        mockValue.result.totals.employer = "1100";

        doCalculate();

        expect(mockValue.result.underpayment.employer).toEqual("100.00");
        expect(mockValue.result.overpayment.employer).toEqual(0);
      });

      it("when employer contributions amount is more than total due NI employer", () => {
        mockValue.result.employerContributions = 1100;
        mockValue.result.totals.employer = "1000";

        doCalculate();

        expect(mockValue.result.underpayment.employer).toEqual(0);
        expect(mockValue.result.overpayment.employer).toEqual("100.00");
      });

      it("when employer contributions amount is not zero", () => {
        mockValue.result.employerContributions = 0;
        mockValue.result.totals.employer = "1100";

        doCalculate();

        expect(mockValue.result.underpayment.employer).toEqual("1100");
        expect(mockValue.result.overpayment.employer).toEqual(0);
      });
    });

    describe("when no split year", () => {
      beforeEach(() => {
        mockValue.isMultiYear = false;
        mockValue.customSplitRows = {};
      });

      it("should submit form on clicking calculate button and should not set result when result is empty", async () => {
        mockNiFrontendContext.NiFrontendInterface.classOne.calculate = jest
          .fn()
          .mockReturnValue(null);
        mockValue.result = null;

        doCalculate();

        expect(mockValue.setResult).not.toHaveBeenCalled();
      });

      it("should submit form on clicking calculate button and should set result", async () => {
        mockNiFrontendContext.NiFrontendInterface.classOne.calculate = jest
          .fn()
          .mockReturnValue(mockResult);
        mockValue.result = mockResult;
        mockValidateClassOnePayload.mockReturnValue(true);

        doCalculate();

        expect(mockValue.setActiveRowId).toHaveBeenCalled();
        expect(mockValue.setResult).toHaveBeenCalledWith(mockResult);
      });

      it("should not set result when data is invalid", () => {
        mockValidateClassOnePayload.mockReturnValue(false);
        mockNiFrontendContext.NiFrontendInterface.classOne.calculate = jest
          .fn()
          .mockReturnValue(null);
        mockValue.result = null;

        doCalculate();

        expect(mockValue.setResult).not.toHaveBeenCalled();
      });
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

    it("should call handleShowSummary callback on clicking Save & Print button and should not show summary as no data", () => {
      const button = screen.getByRole("button", { name: "Save and print" });
      fireEvent.click(button);

      expect(mockValue.setActiveRowId).toHaveBeenCalledWith(null);
    });

    it("should call handleShowSummary callback on clicking Save & Print button and should show summary", () => {
      mockValue.isMultiYear = true;
      mockValue.customSplitRows = mockCustomSplitRows;
      mockNiFrontendContext.NiFrontendInterface.classOne.calculate = jest
        .fn()
        .mockReturnValue(mockResult);
      mockValue.result = mockResult;
      mockValidateClassOnePayload.mockReturnValue(true);

      const { container } = render(<Class1 />);

      const button = Array.from(container.querySelectorAll("button")).find(
        // @ts-ignore
        (el) => el.textContent.includes("Save and print")
      ) as HTMLButtonElement;

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
