import React, { useContext } from "react";
import { ClassOneContext } from "./ClassOneContext";

// components
import CategoryTotals from "../shared/CategoryTotals";
import Class1Table from "./Class1Table";
import DetailsPrint from "../shared/DetailsPrint";

// types
import { Class1DirectorsSavePrintProps } from "../../../interfaces";
import BackLink from "../../helpers/gov-design-system/BackLink";
import { taxYearShorthand } from "../../../services/utils";

function Class1Print(props: Class1DirectorsSavePrintProps) {
  const { title, setShowSummary, result } = props;
  const { rows, details, categoryTotals, taxYear } =
    useContext(ClassOneContext);

  return (
    <div className="save-print-wrapper" data-testid="print-section">
      <div className="print-content">
        <BackLink callBack={() => setShowSummary(false)} />

        <h1 className="govuk-heading-l" data-testid="print-title">
          {title}
        </h1>

        <DetailsPrint details={details} />

        <h2 className="govuk-heading-m" data-testid="print-tax-year-text">
          Tax year: {taxYear && taxYearShorthand(taxYear)}
        </h2>

        <Class1Table showBands={true} printView={true} repeatQty={0} />

        <h2 className="govuk-heading-m" data-testid="print-ni-due-text">
          NI due
        </h2>

        <CategoryTotals
          rows={rows}
          categoryTotals={categoryTotals}
          result={result}
        />
      </div>
    </div>
  );
}

export default Class1Print;
