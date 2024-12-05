import React, { Dispatch, useContext } from "react";
import { periods, PeriodValue, periodValueToLabel } from "../../../config";
import numeral from "numeral";
import * as thStyles from "../../../services/mobileHeadingStyles";

// types
import { ClassOneContext, Row } from "./ClassOneContext";

// components
import MqTableCell from "../shared/MqTableCell";
import ExplainToggle from "../shared/ExplainToggle";
import TableRow from "../shared/TableRow";
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
    contributionNames
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
  } = useContext(ClassOneContext);

  const periodRowsValue = { ...row };

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
      let periodType = e.currentTarget.value;

      setRows(
          rows.map((cur: Row) =>
              cur.id === r.id ? { ...cur, [e.currentTarget.name]: periodType } : cur
          )
      );
  };

  const handlePeriodChange = (
    r: Row,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enteredValue = parseInt(e.currentTarget.value);
    let newPeriod = isNaN(enteredValue) ? "" : enteredValue;

    setRows(
      rows.map((cur: Row) =>
        cur.id === r.id ? { ...cur, [e.currentTarget.name]: newPeriod } : cur
      )
    );
  };

  const invalidateResults = () => {
    setResult(null);
  };

  const createPastedRow = (val: string) => {
    return {
      ...row,
      gross: val,
    };
  };

  const splitPastedCellsToArray = (pastedText: string) => {
    return pastedText
      .replace(
        /"((?:[^"]*(?:\r\n|\n\r|\n|\r))+[^"]+)"/gm,
        /* istanbul ignore next */
        function (match, p1) {
          return p1.replace(/""/g, '"').replace(/\r\n|\n\r|\n|\r/g, " ");
        }
      )
      .split(/\r\n|\n\r|\n|\r/g)
      .filter((l) => l.length > 0);
  };

  const handlePaste = (e: React.ClipboardEvent, r: Row) => {
    e.preventDefault();

    const clipboardData = e.clipboardData;
    const pastedText =
      clipboardData.getData("Text") || clipboardData.getData("text/plain");
    if (!pastedText) {
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
          <>{periodValueToLabel(row.period)}</>
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
              onChange={(e) => handleSelectChangePeriod(row, e)}
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
          <>{periodRowsValue?.number}</>
        ) : (<>
          <label
              className="govuk-visually-hidden"
              htmlFor={`${row.id}-number`}
            >
               Period Number for row number {index + 1}
            </label>
          <input
            className="period-number"
            name="number"
            type="text"
            id={`${row.id}-number`}
            value={isNaN(row.number) || !row.number ? "" : row.number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handlePeriodChange(row, e)
            }
          />
          </>
        )}
      </MqTableCell>

      {/* Category */}
      <MqTableCell
        cellStyle={thStyles.selectNICategoryLetter}
        cellClassName="input"
      >
        {printView ? (
          <>{row.category}</>
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
              onChange={(e) => handleSelectChangeCategory(row, e)}
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
          errors[`${row.id}-gross`] ? "error-cell" : ""
        }`}
      >
        {printView ? (
          <>£{row.gross}</>
        ) : (
          <>
          <label
              className="govuk-visually-hidden"
              htmlFor={`${row.id}-gross`}
            >
              Gross pay for row number {index + 1}
            </label>
          
          <input
            className={`gross-pay ${
              errors[`${row.id}-gross`] ? ` govuk-input--error` : ``
            }`}
            name={`${row.id}-gross`}
            type="text"
            id={`${row.id}-gross`}
            value={row.gross}
            onChange={(e) => handleChange(row, e)}
            onPaste={(e: React.ClipboardEvent) => handlePaste(e, row)}
          />
          </>
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
