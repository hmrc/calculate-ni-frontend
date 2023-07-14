import React, { useContext } from "react";
import { Class1PeriodsTableProps } from "../../../interfaces";
import TextInput from "../../helpers/formhelpers/TextInput";
import { ClassOneContext } from "./ClassOneContext";

const getPeriodName = (period: string) => {
  if (period === "W") {
    return "Weekly";
  } else if (period === "2W") {
    return "Fortnightly";
  } else if (period === "4W") {
    return "Four weekly";
  } else if (period === "M") {
    return "Monthly";
  }
  return "";
};

export default function Class1PeriodsTable(props: Class1PeriodsTableProps) {
  const { handleDateInputChange } = props;
  const { errors, customRows } = useContext(ClassOneContext);

  return (
    <table className="contribution-details" data-testid="periods-table">
      <thead>
        <tr>
          <th scope="col" className="border" data-testid="header-period-type">
            <strong>Period type</strong>
          </th>
          <th scope="col" className="border" data-testid="header-period">
            <strong>Period</strong>
          </th>
          <th scope="col" className="border" data-testid="header-date-ni-paid">
            <strong>Date NI paid</strong>
          </th>
        </tr>
      </thead>
      <tbody>
        {customRows.map((row, index) => (
          <tr key={row.id} data-testid="periods-table-row">
            <td className="border">{getPeriodName(row.period)}</td>
            <td className="border">{row.number}</td>
            <td
              className={`border table-input ${
                errors[`${row.id}-date`] ? "error-cell" : ""
              }`}
            >
              <TextInput
                hiddenLabel={true}
                name={`${row.id}-date`}
                labelText={`Date NI paid for row number ${index + 1}`}
                inputClassName="gross-pay"
                inputValue={row.date || ""}
                inputType="date"
                error={errors[`${row.id}-date`]}
                onChangeCallback={(e) => handleDateInputChange(row, e)}
                min={row.minDate}
                max={row.maxDate}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
