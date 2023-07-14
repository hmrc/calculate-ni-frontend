import React, { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { NiFrontendContext, useNiFrontend } from "./services/NiFrontendContext";

jest.mock("./services/NiFrontendContext", () => {
  const mockNiFrontendContext = {
    NiFrontendInterface: {
      classOne: {
        calculate: jest.fn(),
        getApplicableCategories: () => ["A", "B"],
        getTaxYears: ["2022-04-06", "2023-04-05"],
        getCategoryNames: [
          { letter: "A", name: "Category A" },
          { letter: "B", name: "Category B" },
        ],
      },
      loading: false,
      error: "",
      config: {},
    },
  };

  const mockContext = React.createContext(mockNiFrontendContext);

  return {
    __esModule: true,
    NiFrontendContext: {
      ...mockContext,
      Provider: ({ children }: { children?: ReactNode }) => (
        <mockContext.Provider value={mockNiFrontendContext}>
          {children}
        </mockContext.Provider>
      ),
    },
    useNiFrontend: jest.fn(() => mockNiFrontendContext),
    categoryNamesToObject: jest.fn(),
  };
});

test("renders learn react link", async () => {
    render(<App />);
    const linkElement = await screen.getByTestId("ni-calculation-header");
    expect(linkElement).toBeInTheDocument();
});

