import React, {useContext, useState} from 'react';

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
    dateRange,
    setDateRange,
    results
  } = useContext(Class3Context)
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYears[0])

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTaxYear = taxYears.find(ty => ty.id === e.target.value) || taxYears[0]
    setTaxYear(newTaxYear)

    if (taxYear) {
      const newDateRange = {
        from: taxYear.from,
        to: taxYear.to
      }
      setDateRange(() => (newDateRange))
    }

  }

  return (
    <div className="form-group table-wrapper">
      <SelectTaxYear
        taxYears={taxYears}
        taxYear={taxYear}
        handleTaxYearChange={handleTaxYearChange}
      />

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
