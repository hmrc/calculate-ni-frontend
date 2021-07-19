import React, {useContext, useState} from 'react';
import uniqid from 'uniqid';

import numeral from 'numeral'
import 'numeral/locales/en-gb';

import Class1Table from './Class1Table'
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import SelectTaxYear from "../../helpers/formhelpers/SelectTaxYear";

// types
import { Class1FormProps } from '../../../interfaces';
import {ClassOneContext, Row} from "./ClassOneContext";
import NiPaidInputs from "../shared/NiPaidInputs";

numeral.locale('en-gb');

function Class1Form(props: Class1FormProps) {
  const { resetTotals } = props
  const {
    taxYears,
    taxYear,
    setTaxYear,
    rows,
    setRows,
    setActiveRowId,
    activeRowId,
    setErrors,
    setPeriodNumbers,
    setResult
  } = useContext(ClassOneContext)
  const [repeatQty, setRepeatQty] = useState<number>(1)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxYear(taxYears.find(ty => ty.id === e.target.value) || taxYears[0])
    setResult(null)
  }

  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault()
    resetTotals()
    setRepeatQty(1)
  }

  const getRowByActiveId = () => {
    return rows.filter(r => (r.id === activeRowId))[0]
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResult(null)
    const repeatTimes = repeatQty > 0 ? repeatQty : 1
    let arrayItemsToAdd = Array.from(Array(repeatTimes).keys())
    const newRows = arrayItemsToAdd.map(r => {
      const rowToDuplicate: Row = activeRowId ? getRowByActiveId() : rows[rows.length - 1]
      const periodNumber = rows.filter(row => row.period === rowToDuplicate.period).length + 1
      const id = uniqid()
      return {
        id: id,
        category: rowToDuplicate.category,
        period: rowToDuplicate.period,
        gross: rowToDuplicate.gross,
        number: periodNumber,
        ee: 0,
        er: 0
      }
    })
    setRows([...rows, ...newRows])
    setActiveRowId(newRows[newRows.length - 1].id)
  }

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault()
    if(activeRowId) {
      setPeriodNumbers(activeRowId)
      setErrors({})
      setResult(null)
      setActiveRowId(null)
    }
  }

  return (
    <>
      <div className="form-group table-wrapper">
        <div className="container">
          <div className="form-group half">
            <SelectTaxYear
              taxYears={taxYears}
              taxYear={taxYear}
              handleTaxYearChange={handleTaxYearChange}
            />
          </div>
        </div>

        <NiPaidInputs context={ClassOneContext} />

        <Class1Table
          showBands={false}
          printView={false}
        />

        <div className="container stack-right">

          <div className="container">
            <div className="form-group repeat-button">
              <SecondaryButton
                label="Delete active row"
                onClick={handleDeleteRow}
                disabled={!activeRowId || rows.length === 1}
              />
            </div>

            <div className="form-group repeat-button repeat-row">
              <SecondaryButton
                label="Repeat row"
                onClick={handleClick}
              />
              {` x `}
              <label htmlFor="repeatQty" className="govuk-visually-hidden">Repeat quantity</label>
              <input
                className="govuk-input govuk-input--width-2 borderless"
                type="number"
                name="repeatQty"
                id="repeatQty"
                value={repeatQty}
                onChange={(e) => {
                  setRepeatQty(parseInt(e.currentTarget.value))
                }}
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
        <div className="form-group">
          <button className="govuk-button nomar" type="submit">
            Calculate
          </button>
        </div>
      </div>
    </>

  )
}

export default Class1Form;
