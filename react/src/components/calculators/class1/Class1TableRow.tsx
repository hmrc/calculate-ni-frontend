import React, { Dispatch, useContext } from "react";
import { periods, PeriodValue, periodValueToLabel } from "../../../config";
import numeral from "numeral";
import * as thStyles from "../../../services/mobileHeadingStyles";

// types
import { ClassOneContext, Row } from "./ClassOneContext";

// components
import TextInput from "../../helpers/formhelpers/TextInput";
import MqTableCell from "../shared/MqTableCell";
import ExplainToggle from "../shared/ExplainToggle";
import TableRow from "../shared/TableRow";
import uniqid from "uniqid";
import {
  getBandValue,
  getContributionBandValue,
} from "../../../services/utils";

interface TableRowProps {
  row: Row;
  index: number;
  showBands: boolean;
  printView: boolean;
  setShowExplanation: Dispatch<string>;
  showExplanation?: string;
  contributionNames: string[];
  bandNames?: string[];
  repeatQty: number;
}

export default function Class1TableRow(props: TableRowProps) {
  const {
    row,
    index,
    showBands,
    printView,
    setShowExplanation,
    showExplanation,
    bandNames,
    contributionNames,
    repeatQty
  } = props;
  const {
    activeRowId,
    setActiveRowId,
    rows,
    setRows,
    errors,
    categories,
    result,
    setResult,
    categoryNames,
    niRow,
    setPeriodType,
    setIsRepeatAllow,
    getAllowedRows,
  } = useContext(ClassOneContext);

  const periodRowsValue = {...row};

  const handleChange = (r: Row, e: React.ChangeEvent<HTMLInputElement>) => {
    invalidateResults();
    setRows(
      rows.map((cur: Row) =>
        cur.id === r.id
          ? {
              ...cur,
              [`${e.currentTarget.name.split("-")[1]}`]: e.currentTarget.value,
            }
          : cur
      )
    );
  };

  // category change handler
  const handleSelectChangeCategory = (
    r: Row,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRows(
      rows.map((cur: Row) =>
        cur.id === r.id
          ? { ...cur, [e.currentTarget.name]: e.currentTarget.value }
          : cur
      )
    );
  };

    // period change handler
    const handleSelectChangePeriod = (
        r: Row,
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        let newRows = rows;
        let periodType = e.currentTarget.value;
        setPeriodType(periodType);

        if(periodType === 'W' && newRows.length > 53) { // if period is weekly and table rows are greater than 53
            newRows = rows.slice(0, 53);
        }
        else if(periodType === '2W' && newRows.length > 27) { // if period is fortnightly and table rows are greater than 27
            newRows = rows.slice(0, 27);
        }
        else if(periodType === '4W' && newRows.length > 14) { // if period is 4 weekly and table rows are greater than 14
            newRows = rows.slice(0, 14);
        }
        else if(periodType === 'M' && newRows.length > 12) { // if period is monthly and table rows are greater than 12
            newRows = rows.slice(0, 12);
        }

        // validation for repeat rows
        const currentTotalRows = newRows.length;
        if (getAllowedRows(currentTotalRows, periodType) === 0 || repeatQty > getAllowedRows(currentTotalRows, periodType)) { // validation for repeat qty if maximum limit is reached
            setIsRepeatAllow(false);
        }
        else {
            setIsRepeatAllow(true);
        }

        setRows(
            newRows.map((cur: Row) => {
                return { ...cur, [e.currentTarget.name]: periodType };
            })
        )
    };


    const handlePeriodChange = (r: Row, e: React.ChangeEvent<HTMLInputElement>) => {
        const enteredValue = parseInt(e.currentTarget.value);
        const newPeriod = isNaN(enteredValue) ? "" : enteredValue;
        setRows(
            rows.map((cur: Row) =>
                cur.id === r.id
                    ? { ...cur, [e.currentTarget.name]: newPeriod }
                    : cur
            )
        );
    }

  const invalidateResults = () => {
    setResult(null);
  };

  const createPastedRow = (val: string) => {
    return {
      id: uniqid(),
      category: row.category,
      number: niRow.number !== row.number ? niRow.number : row.number,
      period: row.period,
      gross: val,
      ee: row.ee,
      er: row.er,
    };
  };

  const splitPastedCellsToArray = (pastedText: string) => {
    return pastedText
      .replace(
        /"((?:[^"]*(?:\r\n|\n\r|\n|\r))+[^"]+)"/gm,
        function (match, p1) {
          return p1.replace(/""/g, '"').replace(/\r\n|\n\r|\n|\r/g, " ");
        }
      )
      .split(/\r\n|\n\r|\n|\r/g)
      .filter((l) => l.length > 0);
  };

  const handlePaste = (e: React.ClipboardEvent, r: Row) => {
    const clipboardData = e.clipboardData;
    const pastedText =
      clipboardData.getData("Text") || clipboardData.getData("text/plain");
    if (!pastedText && pastedText.length) {
      return;
    }
    const cellValues = splitPastedCellsToArray(pastedText);
    const activeRowIndex = rows.findIndex((r: Row) => r.id === row.id);
    const remainingPastedRows = cellValues.map((val) => createPastedRow(val));
    setRows([
      ...rows.slice(0, activeRowIndex),
      ...remainingPastedRows,
      ...rows.slice(activeRowIndex + 1),
    ]);
    setActiveRowId(remainingPastedRows[0].id);
  };

  return (
    <TableRow
      row={row}
      rows={rows}
      index={index}
      activeRowId={activeRowId}
      setActiveRowId={setActiveRowId}
    >
      <MqTableCell cellStyle={thStyles.rowNumber}>{index + 1}</MqTableCell>

      <MqTableCell cellStyle={thStyles.selectPeriod} cellClassName="input">
        {printView ? (
          <div>{periodValueToLabel(row.period)}</div>
        ) : (
          <>
            <label
              className="govuk-visually-hidden"
              htmlFor={`row${index}-period`}
            >
              Period for row number {index + 1}
            </label>
            <select
              name="period"
              value={row.period}
              onChange={(e) => handleSelectChangePeriod?.(row, e)}
              className="borderless"
              id={`row${index}-period`}
            >
              {periods.map((p: PeriodValue, i) => (
                <option key={i} value={p}>
                  {periodValueToLabel(p)}
                </option>
              ))}
            </select>
          </>
        )}
      </MqTableCell>

      <MqTableCell cellStyle={thStyles.periodNumber} cellClassName="input">
        {printView ? (
          <div>{periodRowsValue?.number}</div>
        ) : (
          <React.Fragment>
            <TextInput
              hiddenLabel={true}
              // name={`${periodRowsValue?.id}-period`}
              name="number"
              labelText={`Period for row number ${index + 1}`}
              inputClassName="period-number"
              // inputValue={isNaN(periodRowsValue?.number) ? "" : periodRowsValue?.number}
              inputValue={isNaN(row?.number) ? "" : row?.number}
              onChangeCallback={(e: React.ChangeEvent<HTMLInputElement>) => handlePeriodChange(row, e)}
              onPaste={(e: React.ClipboardEvent) =>
                handlePaste(e, row)
              }
            />
          </React.Fragment>
        )}
      </MqTableCell>

      {/* Category */}
      <MqTableCell
        cellStyle={thStyles.selectNICategoryLetter}
        cellClassName="input"
      >
        {printView ? (
          <div>{row.category}</div>
        ) : (
          <>
            <label
              className="govuk-visually-hidden"
              htmlFor={`row${index}-category`}
            >
              NI category for row number {index + 1}
            </label>
            <select
              name="category"
              value={row.category}
              onChange={(e) => handleSelectChangeCategory?.(row, e)}
              className="borderless"
              id={`row${index}-category`}
            >
              {categories.map((c: string, i: number) => (
                <option key={i} value={c}>
                  {`${c}${categoryNames[c] ? ` - ${categoryNames[c]}` : ``}`}
                </option>
              ))}
            </select>
          </>
        )}
      </MqTableCell>

      {/* Gross Pay */}
      <MqTableCell
        cellStyle={thStyles.enterGrossPay}
        cellClassName={`input ${
          errors?.[`${row.id}-gross`] ? "error-cell" : ""
        }`}
      >
        {printView ? (
          <div>£{row.gross}</div>
        ) : (
          <React.Fragment>
            <TextInput
              hiddenLabel={true}
              name={`${row.id}-gross`}
              labelText={`Gross pay for row number ${index + 1}`}
              inputClassName="gross-pay"
              inputValue={row.gross}
              onChangeCallback={(e) => handleChange?.(row, e)}
              error={errors[`${row.id}-gross`]}
              onPaste={(e: React.ClipboardEvent) => handlePaste(e, row)}
            />
          </React.Fragment>
        )}
      </MqTableCell>

      {/* Bands */}
      {showBands &&
        bandNames?.map((k) => (
          <MqTableCell cellStyle={{}} key={`${k}-val`}>
            {getBandValue(row.bands, k)}
          </MqTableCell>
        ))}

      {/* Total */}
      {printView && (
        // Total (if calculate has run)
        <MqTableCell cellStyle={thStyles.total}>
          {numeral((row.ee + row.er).toString()).format("$0,0.00")}
        </MqTableCell>
      )}

      <MqTableCell cellClassName="result-cell" cellStyle={thStyles.employee}>
        {numeral(row.ee).format("$0,0.00")}
      </MqTableCell>
      <MqTableCell cellClassName="result-cell" cellStyle={thStyles.employer}>
        {numeral(row.er).format("$0,0.00")}
      </MqTableCell>

      {printView &&
        contributionNames &&
        contributionNames.map((cB: string) => (
          <MqTableCell cellStyle={{}} key={`${cB}-val`}>
            {getContributionBandValue(row.contributionBands, cB)}
          </MqTableCell>
        ))}

      {!printView && result && row.explain && row.explain.length > 0 && (
        <td>
          <ExplainToggle
            id={row.id}
            showExplanation={showExplanation}
            setShowExplanation={setShowExplanation}
          />
        </td>
      )}
    </TableRow>
  );
}
