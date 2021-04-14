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
    taxYears,
    taxYear,
    setTaxYear,
    dateRange,
    setDateRange,
    results,
    setResults
  } = useContext(Class3Context)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResults(null)
    setDateRange({from: null, to: null})
    const newTaxYear = taxYears.find(ty => ty.id === e.target.value) || taxYears[0]
    setTaxYear(newTaxYear)
  }

  return (
    <div className="form-group table-wrapper">
      <SelectTaxYear
        taxYears={taxYears}
        taxYear={taxYear}
        handleTaxYearChange={handleTaxYearChange}
      />

      {dateRange && dateRange.from && <DateRange
        id="wcc"
        setDateRange={setDateRange}
        dateRange={dateRange}
        errors={errors}
        legends={{
          from: "From",
          to: "To"
        }}
      />
      }

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
