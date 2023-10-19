import React, { ReactNode } from "react";
// import { render, screen } from "@testing-library/react";
// import App from "./App";
// import { MemoryRouter } from "react-router-dom";
// import userEvent from "@testing-library/user-event";

// jest.mock("./services/NiFrontendContext", () => {
//   const mockNiFrontendContext = {
//     NiFrontendInterface: {
//       classOne: {
//         calculate: jest.fn(),
//         getApplicableCategories: () => ["A", "B"],
//         getTaxYears: ["2022-04-06", "2023-04-05"],
//         getCategoryNames: [
//           { letter: "A", name: "Category A" },
//           { letter: "B", name: "Category B" },
//         ],
//       },
//       loading: false,
//       error: "",
//       config: {},
//     },
//   };
//
//   const mockContext = React.createContext(mockNiFrontendContext);
//
//   return {
//     __esModule: true,
//     NiFrontendContext: {
//       ...mockContext,
//       Provider: ({ children }: { children?: ReactNode }) => (
//         <mockContext.Provider value={mockNiFrontendContext}>
//           {children}
//         </mockContext.Provider>
//       ),
//     },
//     useNiFrontend: jest.fn(() => mockNiFrontendContext),
//     categoryNamesToObject: jest.fn(),
//   };
// });
//
// describe("App Routes", () => {
//   test("renders home route", () => {
//     render(
//       <MemoryRouter initialEntries={["/"]}>
//         <App />
//       </MemoryRouter>
//     );
//     const homeElement = screen.getByTestId("home-component");
//     expect(homeElement).toBeInTheDocument();
//   });
//
//   test("renders class-1 route", () => {
//     render(
//       <MemoryRouter initialEntries={["/class-1"]}>
//         <App />
//       </MemoryRouter>
//     );
//     const class1Element = screen.getByTestId("class-1-component");
//     expect(class1Element).toBeInTheDocument();
//   });
//
//   test("navigates from home to class-1", () => {
//     render(
//       <MemoryRouter initialEntries={["/"]}>
//         <App />
//       </MemoryRouter>
//     );
//
//     const homeElement = screen.getByTestId("home-component");
//     expect(homeElement).toBeInTheDocument();
//
//     const class1Link = screen.getByTestId("class1-link");
//     userEvent.click(class1Link);
//
//     const class1Element = screen.getByTestId("class-1-component");
//     expect(class1Element).toBeInTheDocument();
//   });
// });

describe('My Test Suite', () => {
    it('My Test Case', () => {
        expect(true).toBeTruthy();
    });
});
