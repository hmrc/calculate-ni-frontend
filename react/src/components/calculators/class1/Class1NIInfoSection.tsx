import React, {useCallback} from 'react'

// types
import {TaxYear} from '../../../interfaces'
import {taxYearString} from "../../../config";

export default function Class1NIInfoSection({taxYear}: {taxYear: TaxYear | null}) {

    const formatTaxYear = useCallback(() => {
        if (taxYear) {
            return taxYearString(taxYear);
        }
        return "";
    }, [taxYear]);

  return (
      <div className="ni-info-section">
          <img
              src={require("../../../assets/exclamation-in-circle.svg")}
              alt="warning"
          />
          <p>{`${formatTaxYear()} is a split tax year, this means there are two or more different NI tax rates during the tax year`}</p>
      </div>
  )
}
