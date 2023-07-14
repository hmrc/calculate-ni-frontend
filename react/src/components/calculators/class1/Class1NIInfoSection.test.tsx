import React from "react";
import { render, screen } from "@testing-library/react";
import Class1NIInfoSection from "./Class1NIInfoSection";
import warningIcon from "../../../assets/exclamation-in-circle.svg";

jest.mock("../../../assets/exclamation-in-circle.svg", () => "warningIcon");

const taxYear = {
  id: "[2022-04-06, 2023-04-05]",
  from: new Date("2022-04-06T00:00:00.000Z"),
  to: new Date("2023-04-05T00:00:00.000Z"),
};

describe("Class1NIInfoSection", () => {
  describe("when tax year is not null", () => {
    beforeEach(() => {
      render(<Class1NIInfoSection taxYear={taxYear} />);
    });

    it("renders NI info section", () => {
      expect(screen.queryByTestId("ni-info-section")).not.toBeNull();
    });

    it("renders section title", () => {
      expect(screen.queryByTestId("ni-info-section-title")).not.toBeNull();
    });

    it("renders section warning icon", () => {
      const icon = screen.getByTestId("ni-info-section-icon");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("src", warningIcon);
      expect(icon).toHaveAttribute("alt", "warning");
    });

    it("should render correct tax year date range", () => {
      expect(screen.queryByTestId("ni-tax-year")).toHaveTextContent(
        "6 April 2022 - 5 April 2023"
      );
    });
  });

  describe("when tax year is null", () => {
    it("should not render tax year date range", () => {
      render(<Class1NIInfoSection taxYear={null} />);
      expect(screen.queryByTestId("ni-tax-year")).toHaveTextContent("");
    });
  });
});
