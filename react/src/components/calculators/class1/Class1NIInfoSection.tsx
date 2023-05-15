import React, { useCallback } from "react";

// types
import { TaxYear } from "../../../interfaces";
import { taxYearString } from "../../../config";
import warningIcon from "../../../assets/exclamation-in-circle.svg";

export default function Class1NIInfoSection({
  taxYear,
}: {
  taxYear: TaxYear | null;
}) {
  const formatTaxYear = useCallback(() => {
    if (taxYear) {
      return taxYearString(taxYear);
    }
    return "";
  }, [taxYear]);

  return (
    <div className="ni-info-section" data-testid="ni-info-section">
      <img src={warningIcon} alt="warning" data-testid="ni-info-section-icon" />
      <p data-testid="ni-info-section-title"><span data-testid="ni-tax-year">{formatTaxYear()}</span> is a split tax year, this means there are two or more different NI tax rates during the tax year</p>
    </div>
  );
}
