import React from 'react'
import { Class1PeriodsTableProps } from "../../../interfaces";
import Class1PeriodsTable from "./Class1PeriodsTable";

export default function Class1PeriodsSection(props: Class1PeriodsTableProps) {
    const {customRows, handleDateInputChange} = props;

  return (
      <div className="class1-periods-section">
          <div className="class1-periods-section-title">
              Enter the date when NI was paid for the following periods, for example 21/04/2023
          </div>
          <div className="class1-periods-section-subtitle">
              We will calculate the correct tax rate for the period based on the date you enter.
          </div>
          <Class1PeriodsTable customRows={customRows} handleDateInputChange={handleDateInputChange} />
      </div>
  )
}
