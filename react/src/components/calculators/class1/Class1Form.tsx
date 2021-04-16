import React, {ChangeEvent, useContext, useState} from 'react';
import uniqid from 'uniqid';

import numeral from 'numeral'
import 'numeral/locales/en-gb';

import Class1Table from './Class1Table'
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import SelectTaxYear from "../../helpers/formhelpers/SelectTaxYear";
import TextInput from "../../helpers/formhelpers/TextInput";

// types
import { Class1FormProps } from '../../../interfaces';
import {ClassOneContext} from "./ClassOneContext";
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResult(null)
    const repeatTimes = repeatQty > 0 ? repeatQty : 1
    let arrayItemsToAdd = Array.from(Array(repeatTimes).keys())
    const newRows = arrayItemsToAdd.map(r => {
      const lastRow = rows[rows.length - 1]
      const periodNumber = rows.filter(row => row.period === lastRow.period).length + 1
      const id = uniqid()
      return {
        id: id,
        category: lastRow.category,
        period: lastRow.period,
        gross: lastRow.gross,
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

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatQty(parseInt(e.currentTarget.value))
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

            <div className="form-group repeat-button">
              <div style={{float: "left", marginRight: "3px"}}>
                <TextInput
                hiddenLabel={true}
                labelText="Enter the quantity of repeated rows"
                name="repeatRowQty"
                inputClassName="govuk-input govuk-input--width-2 light-border"
                inputValue={repeatQty}
                onChangeCallback={(e) => handleQuantityChange?.(e)}
                />
              </div>
              <SecondaryButton
                label="Repeat row"
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
