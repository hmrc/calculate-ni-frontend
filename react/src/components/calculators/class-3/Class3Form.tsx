import React, {useContext, useEffect} from 'react';
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {Class3Context, class3DefaultRows} from "./Class3Context";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import DateInputs from "../../helpers/formhelpers/DateInputs";
import {validDateParts} from "../../../services/utils";
import Class3Table from "./Class3Table";
import uniqid from "uniqid";

numeral.locale('en-gb');

function Class3Form(props: any) {
  const { resetTotals } = props
  const {
    rows,
    setRows,
    setEnteredNiDate,
    day,
    month,
    year,
    setDay,
    setMonth,
    setYear,
    errors,
    setActiveRowId,
    setErrors
  } = useContext(Class3Context)

  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setErrors({})
    setActiveRowId(null)
    resetTotals()
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newId = uniqid()
    setRows([...rows, {...class3DefaultRows[0], id: newId}])
    setActiveRowId(newId)
  }

  useEffect(() => {
    const niDate = validDateParts(day, month, year) ?
      new Date(`${year}-${month}-${day}`) : null
    setEnteredNiDate(niDate)
  }, [day, month, year, setEnteredNiDate])

  return (
    <div className="form-group table-wrapper">
      <div className="container">
          <DateInputs
            description="enteredNiDate"
            legend="Date entered NI"
            day={day}
            month={month}
            year={year}
            setDay={setDay}
            setMonth={setMonth}
            setYear={setYear}
            error={errors.enteredNiDate}
          />
      </div>

      <Class3Table />

      <div className="container">
        <div className="container">
          <div className="form-group">
            <button className="govuk-button nomar" type="submit">
              Calculate
            </button>
          </div>
        </div>

        <div className="container">

          <div className="form-group repeat-button">
            <SecondaryButton
              label="Add row"
              onClick={handleClick}
            />
          </div>

          <div className="form-group">
            <SecondaryButton
              label="Clear table"
              onClick={handleClear}
            />
          </div>
        </div>
      </div>

    </div>
  )
}

export default Class3Form;
