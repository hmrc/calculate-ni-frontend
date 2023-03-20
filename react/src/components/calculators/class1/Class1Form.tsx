import React, {useContext, useEffect, useState} from 'react';
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
import {forEach} from "lodash";

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
    setResult,
  } = useContext(ClassOneContext);
  const [repeatQty, setRepeatQty] = useState<number>(1);

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxYear(taxYears.find((ty) => ty.id === e.target.value) || taxYears[0]);
    setResult(null);
  };

  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
      console.log('In handleClear - Class1Form');
    e.preventDefault();
    resetTotals();
    setRepeatQty(1);
  };

  const handleMaxValue = (enteredValue: number) => {
      console.log('In handleMaxValue - Class1Form');
    if (enteredValue > 52) {
      setRepeatQty(52);
    } else {
      setRepeatQty(enteredValue);
    }
  };

  const getRowByActiveId = React.useCallback(() => {
      console.log('In getRowByActiveId - Class1Form');
      const activeRow = rows.filter((r) => r.id === activeRowId)[0];
      console.log({ activeRow });
    return rows.filter((r) => r.id === activeRowId)[0];
  },[rows, activeRowId]);

  React.useEffect(() => {
      console.log('In useEffect - Class1Form');
    console.log({ rows });
  }, [rows]);


  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      console.log('In handleClick - Class1Form');
    e.preventDefault();

    // setResult(null);
    const repeatTimes = repeatQty > 0 ? repeatQty : 1;
    let arrayItemsToAdd = Array.from(Array(repeatTimes).keys());

console.log({ arrayItemsToAdd, repeatTimes, activeRowId, rows,toDuplicateFun: getRowByActiveId() });

      const rowToDuplicate: Row = activeRowId
          ? getRowByActiveId()
          : rows[rows.length - 1];

      console.log({ rowToDuplicate, number: rowToDuplicate.number });

      let initialPeriodNumber = rowToDuplicate.number;

      const newRows = arrayItemsToAdd.map((r) => {
      console.log({ rowToDuplicate, repeatTimes });
      const id = uniqid();
          console.log('Before increment',{ initialPeriodNumber });
          initialPeriodNumber += 1;
          console.log('After increment',{ initialPeriodNumber });

          const newRow = {
              id: id,
              category: rowToDuplicate.category,
              period: rowToDuplicate.period,
              gross: rowToDuplicate.gross,
              number: initialPeriodNumber,
              ee: 0,
              er: 0,
          }
            console.log({ newRow });
      return {
        id: id,
        category: rowToDuplicate.category,
        period: rowToDuplicate.period,
        gross: rowToDuplicate.gross,
        number: initialPeriodNumber,
        ee: 0,
        er: 0,
      };
    });

      const newRows2 = [];
      let initialPeriodNumber2 = rowToDuplicate.number;
      for(let i = 0; i < repeatTimes; i++) {
          const id = uniqid();
          console.log('Before increment',{ initialPeriodNumber2 });
          initialPeriodNumber2 += 1;
          console.log('After increment',{ initialPeriodNumber2 });

          const newRow2 = {
              id: id,
              category: rowToDuplicate.category,
              period: rowToDuplicate.period,
              gross: rowToDuplicate.gross,
              number: initialPeriodNumber2,
              ee: 0,
              er: 0,
          }
          console.log({ newRow2 });
            newRows2.push(newRow2);
      }

      console.log({ newRows, newRows2 });


      const selectedIndex = rows.findIndex((r) => r.id === activeRowId);

      let updatedRows = [...rows];

      if(selectedIndex === rows.length - 1) {
          console.log('In if(selectedIndex === rows.length - 1)...')
          updatedRows = [...updatedRows, ...newRows2];

      } else {
          console.log('In else...');
          updatedRows.splice(selectedIndex + 1 ,0, ...newRows2);
      }
      console.log({ selectedIndex, updatedRows, rows, newRows, newRows2   });
      // const updatedRows = [...rows, ...newRows];
    setRows(updatedRows);
    // setActiveRowId(updatedRows[updatedRows.length - 1].id);
  },[repeatQty, activeRowId, rows, getRowByActiveId])

  useEffect(() => {
    console.log({taxYears});
  }, [taxYears]);

  const handleDeleteRow = (e: React.MouseEvent) => {
      console.log('In handleDeleteRow...');
    e.preventDefault();
    if (activeRowId) {
      setPeriodNumbers(activeRowId);
      setErrors({});
      setResult(null);
      setActiveRowId(null);
    }
  };

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

        <Class1Table showBands={false} printView={false} />

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
              <SecondaryButton label="Repeat row" onClick={handleClick} />
              {` x `}
              <label htmlFor="repeatQty" className="govuk-visually-hidden">
                Repeat quantity
              </label>
              <input
                className="govuk-input govuk-input--width-2 borderless"
                type="number"
                name="repeatQty"
                id="repeatQty"
                value={repeatQty}
                onChange={(e) => {
                  handleMaxValue(parseInt(e.currentTarget.value));
                }}
              />
            </div>

            <div className="form-group">
              <SecondaryButton label="Clear table" onClick={handleClear} />
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
  );
}

export default Class1Form;
