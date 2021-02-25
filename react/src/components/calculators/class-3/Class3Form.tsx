import React, {useContext} from 'react';
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {Class3Context, class3DefaultRows} from "./Class3Context";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import Class3Table from "./Class3Table";
import uniqid from "uniqid";
import {Class3Row} from "../../../interfaces";

numeral.locale('en-gb');

export default function Class3Form(props: any) {
  const { resetTotals } = props
  const {
    rows,
    setRows,
    activeRowId,
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

  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault()
    if(activeRowId) {
      setRows(rows.filter((row: Class3Row) => row.id !== activeRowId))
      // errors are now stale
      setErrors({})
      setActiveRowId(null)
    }
  }

  return (
    <div className="form-group table-wrapper">
      <Class3Table printView={false} />

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
      <div className="form-group">
        <button className="govuk-button nomar" type="submit">
          Calculate
        </button>
      </div>

    </div>
  )
}
