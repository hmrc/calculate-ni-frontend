import React, {useContext} from 'react';

// types
import {Class3Context} from "./Class3Context";
import {TaxYear} from "../../../interfaces";
import SelectTaxYear from "../../helpers/formhelpers/SelectTaxYear";
import {DateRange} from "../shared/DateRange";
import Class3Breakdown from "./Class3Breakdown";

export default function Class3Form(props: any) {
  const {
    errors,
    dateRange,
    setDateRange,
    results
  } = useContext(Class3Context)

  return (
    <div className="form-group table-wrapper">
      <DateRange
        id="wcc"
        setDateRange={setDateRange}
        dateRange={dateRange}
        errors={errors}
        legends={{
          from: "From",
          to: "To"
        }}
      />

      {results &&
        <Class3Breakdown results={results} />
      }

      <div className="form-group">
        <button className="govuk-button nomar" type="submit">
          Calculate
        </button>
      </div>

    </div>
  )
}
