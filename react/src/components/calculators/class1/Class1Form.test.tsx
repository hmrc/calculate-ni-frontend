import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Class1Form from "./Class1Form";
import { ClassOneContext } from "./ClassOneContext";

const resetTotals = jest.fn();

jest.mock("./Class1PaymentSection", () => () => (
  <div data-testid="class1-payment-section">Payment section</div>
));

jest.mock("./Class1NIInfoSection", () => () => (
  <div data-testid="class1-ni-info-section">NI Info section</div>
));

jest.mock("../shared/NiPaidInputs", () => () => (
  <div data-testid="class1-ni-paid-inputs-section">NI Tax section</div>
));

const mockValue: any = {
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
  setResult: jest.fn(),
  setIsMultiYear: jest.fn(),
  isMultiYear: true,
};

const mockValueOneTaxYears: any = {
  ...mockValue,
  taxYear: {
    id: "[2022-04-06, 2023-04-05]",
    from: new Date("2022-04-06T00:00:00.000Z"),
    to: new Date("2023-04-05T00:00:00.000Z"),
  },
  taxYears: [
    {
      id: "[2022-04-06, 2022-12-05]",
      from: new Date("2022-04-06T00:00:00.000Z"),
      to: new Date("2022-12-05T00:00:00.000Z"),
    },
  ],
  isMultiYear: false,
};

const mockValueNoTaxYears: any = {
  ...mockValue,
  taxYear: null,
  taxYears: [],
  isMultiYear: false,
};

const renderComponent = (value: any) =>
  render(
    <ClassOneContext.Provider value={value}>
      <Class1Form resetTotals={resetTotals} />
    </ClassOneContext.Provider>
  );

describe("Class1Form", () => {
  describe("when split tax years", () => {
    beforeEach(() => {
      renderComponent(mockValue);
    });

    it("renders section", () => {
      expect(screen.queryByTestId("class1-ni-tax-section")).not.toBeNull();
    });

    it("should render NI paid inputs section", () => {
      expect(
        screen.queryByTestId("class1-ni-paid-inputs-section")
      ).not.toBeNull();
    });

    it("should render payment section", () => {
      expect(screen.queryByTestId("class1-payment-section")).not.toBeNull();
    });

    it("should render NI Info section", () => {
      expect(screen.queryByTestId("class1-ni-info-section")).not.toBeNull();
    });
  });

  describe("when no split tax year", () => {
    beforeEach(() => {
      renderComponent(mockValueOneTaxYears);
    });

    it("should not render NI Info section", () => {
      expect(screen.queryByTestId("class1-ni-info-section")).toBeNull();
    });
  });

  describe("when no tax years", () => {
    beforeEach(() => {
      renderComponent(mockValueNoTaxYears);
    });

    it("should not render NI Info section", () => {
      expect(screen.queryByTestId("class1-ni-info-section")).toBeNull();
    });
  });

  describe("when tax year changed", () => {
    beforeEach(() => {
      renderComponent(mockValueOneTaxYears);
    });

    it("should change value when tax year is selected", () => {
      const selectOne = screen.getByTestId("taxYear");
      fireEvent.change(selectOne, {
        target: { value: "[2022-04-06, 2022-12-05]" },
      });
      expect(selectOne).toHaveValue("[2022-04-06, 2022-12-05]");
    });

    it("should select default value when tax year is not selected", () => {
      const selectOne = screen.getByTestId("taxYear");
      fireEvent.change(selectOne, {
        target: { value: "" },
      });
      expect(selectOne).toHaveValue("[2022-04-06, 2022-12-05]");
    });
  });
});
