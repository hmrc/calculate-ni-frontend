import React, {useContext} from 'react';

// types
import {Class3Context} from "./Class3Context";
import {DateRange} from "../shared/DateRange";

export default function Class3Form(props: any) {
  const {
    errors,
    dateRange,
    setDateRange,
  } = useContext(Class3Context)

  return (
    <div className="form-group">
      <DateRange
        id="wcc"
        setDateRange={setDateRange}
        dateRange={dateRange}
        errors={errors}
        legends={{
          from: "From",
          to: "To"
        }}
        hideLabels={false}
      />

      <div className="form-group divider--top section--top">
        <button className="govuk-button nomar" type="submit">
          Calculate
        </button>
      </div>

    </div>
  )
}
