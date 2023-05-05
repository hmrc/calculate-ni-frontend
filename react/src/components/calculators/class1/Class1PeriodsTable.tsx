import React from 'react'
import { Class1PeriodsTableProps } from "../../../interfaces";
import TextInput from "../../helpers/formhelpers/TextInput";

const getPeriodName = (period: string) => {
    if(period === 'W') {
        return 'Weekly';
    } else if(period === '2W') {
        return 'Fortnightly';
    } else if(period === '4W') {
        return 'Four weekly';
    } else if(period === 'M') {
        return 'Monthly';
    }
    return '';
}

export default function Class1PeriodsTable(props: Class1PeriodsTableProps) {
    const {customRows, handleDateInputChange} = props;

  return (
      <table className="contribution-details">
          <thead>
              <tr>
                  <th scope="col" className="border"><strong>Period type</strong></th>
                  <th scope="col" className="border"><strong>Period</strong></th>
                  <th scope="col" className="border"><strong>Date NI paid</strong></th>
              </tr>
          </thead>
          <tbody>
              {customRows.map((row, index) => (
                  <tr key={row.id}>
                      <td className="border">{getPeriodName(row.period)}</td>
                      <td className="border">{row.number}</td>
                      <td className="border table-input">
                          <TextInput
                              hiddenLabel={true}
                              name={`${row.id}-date`}
                              labelText={`Date NI paid for row number ${index + 1}`}
                              inputClassName="gross-pay"
                              inputValue={row?.date || ''}
                              onChangeCallback={(e) => handleDateInputChange?.(row, e)}
                          />
                      </td>
                  </tr>))}
          </tbody>
      </table>
  )
}
