import React, {useContext, useEffect} from 'react';
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import uniqid from "uniqid";
import {UnofficialDefermentContext, UnofficialDefermentRow} from "./UnofficialDefermentContext";
import SelectTaxYear from "../../helpers/formhelpers/SelectTaxYear";
import UnofficialDefermentTable from "./UnofficialDefermentTable";
import UnofficialDefermentLimits from "./UnofficialDefermentLimits";

numeral.locale('en-gb');

export default function UnofficialDefermentForm(props: any) {
  const { resetTotals } = props
  const {
    rows,
    setRows,
    activeRowId,
    setActiveRowId,
    setErrors,
    defaultRow,
    taxYears,
    taxYear,
    setTaxYear
  } = useContext(UnofficialDefermentContext)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxYear(taxYears.find(ty => ty.id === e.target.value) || taxYears[0])
  }

  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setErrors({})
    setActiveRowId(null)
    resetTotals()
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newId = uniqid()
    setRows([...rows, {...defaultRow, id: newId}])
    setActiveRowId(newId)
  }

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault()
    if(activeRowId) {
      setRows(rows.filter((row: UnofficialDefermentRow) => row.id !== activeRowId))
      // errors are now stale
      setErrors({})
      setActiveRowId(null)
    }
  }

  return (
    <div className="form-group table-wrapper">
      <div className="container half">
        <SelectTaxYear
          taxYears={taxYears}
          taxYear={taxYear}
          handleTaxYearChange={handleTaxYearChange}
        />
      </div>

      <UnofficialDefermentLimits />

      <UnofficialDefermentTable printView={false} />

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
              label="Delete active row"
              onClick={handleDeleteRow}
              disabled={!activeRowId || rows.length === 1}
            />
          </div>

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
