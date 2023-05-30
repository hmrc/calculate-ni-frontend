import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Class1PaymentSectionProps, CustomRow } from "../../../interfaces";
import Class1Table from "./Class1Table";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import Class1PeriodsSection from "./Class1PeriodsSection";
import { ClassOneContext, Row } from "./ClassOneContext";
import uniqid from "uniqid";
import moment from "moment/moment";

const DATE_FORMAT_DD_MM_YYYY = "DD-MM-YYYY";
const DATE_FORMAT_YYYY_MM_DD = "YYYY-MM-DD";

export default function Class1PaymentSection(props: Class1PaymentSectionProps) {
  const { memoizedTaxYears, resetTotals, taxYearPeriod } = props;
  const {
    rows,
    taxYear,
    setRows,
    setActiveRowId,
    activeRowId,
    setErrors,
    setPeriodNumbers,
    setResult,
    isRepeatAllow,
    setIsRepeatAllow,
    getAllowedRows,
    customRows,
    setCustomRows,
    errors,
    isMultiYear,
    customSplitRows,
    setCustomSplitRows,
    setPeriodType,
  } = useContext(ClassOneContext);

  const [repeatQty, setRepeatQty] = useState<number>(1);
  const [isUpdateFlag, setIsUpdateFlag] = useState<boolean>(false);

  // to clear the table
  const handleClear = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault();
    resetTotals();
    setRepeatQty(1);
    setIsRepeatAllow(true);
    setPeriodType("W");
  };

  // to handle maximum value for repeat row input
  const handleMaxValue = (enteredValue: number) => {
    const currentTotalRows = rows.length;
    const allowedRows = getAllowedRows(currentTotalRows);
    if (enteredValue > allowedRows) {
      // don't allow to add more rows
      setRepeatQty(allowedRows);
    } else if (getAllowedRows(currentTotalRows) === 0) {
      // validation for repeat qty if maximum limit is reached
      setIsRepeatAllow(false);
    } else {
      setRepeatQty(enteredValue);
      setIsRepeatAllow(true);
    }
  };

  // to get the selected row by id
  const getRowByActiveId = useCallback(() => {
    return rows.filter((r) => r.id === activeRowId)[0];
  }, [rows, activeRowId]);

  // to get the number of weeks between two dates
  const getWeeksBetween = useCallback((startDate, endDate) => {
    const startMoment = moment(startDate, DATE_FORMAT_DD_MM_YYYY);
    const endMoment = moment(endDate, DATE_FORMAT_DD_MM_YYYY);
    return endMoment.diff(startMoment, "weeks") + 1;
  }, []);

  // to get list of weeks for selected tax year with start and end date
  const memoizedTaxYearWeeks = useMemo(() => {
    if (taxYear) {
      const startDate = moment(taxYear.from, DATE_FORMAT_DD_MM_YYYY);
      const endDate = moment(taxYear.to, DATE_FORMAT_DD_MM_YYYY);
      const numOfWeeks = getWeeksBetween(
        moment(startDate).format(DATE_FORMAT_DD_MM_YYYY),
        moment(endDate).format(DATE_FORMAT_DD_MM_YYYY)
      );
      const weeks = [];

      for (let i = 1; i <= numOfWeeks; i++) {
        const weekStartDate = startDate.clone().add((i - 1) * 7, "days");
        let weekEndDate = weekStartDate.clone().add(6, "days").endOf("day");
        if (weekEndDate.isAfter(endDate)) {
          weekEndDate = endDate.clone().endOf("day");
        }
        weeks.push({
          week: i,
          startDateOfWeek: weekStartDate.format(DATE_FORMAT_DD_MM_YYYY),
          endDateOfWeek: weekEndDate.format(DATE_FORMAT_DD_MM_YYYY),
        });
      }
      return weeks;
    }
    return [];
  }, [taxYear, getWeeksBetween]);

  useEffect(
    () => {
      if (rows && rows.length > 0) {
        setCustomRows([]);
        let splitRows: any = {};

        rows.forEach((row) => {
          const period = row.period;
          const rowNumber = row.number;
          let firstWeekNumber = rowNumber;
          let lastWeekNumber = rowNumber;

          //  get week for period
          const week = memoizedTaxYearWeeks.find((w) => w.week === rowNumber);
          let startDateOfWeek = week?.startDateOfWeek;
          let endDateOfWeek = week?.endDateOfWeek;

          if (period === "2W") {
            // if period is fortnightly
            lastWeekNumber = rowNumber * 2;
            firstWeekNumber = lastWeekNumber - 1;
          } else if (period === "4W") {
            // if period is 4 weekly
            lastWeekNumber = rowNumber * 4;
            firstWeekNumber = lastWeekNumber - 3;
          }

          // to set last week number if it is greater than total weeks in tax year
          if (lastWeekNumber > memoizedTaxYearWeeks.length) {
            lastWeekNumber = memoizedTaxYearWeeks.length;
          }

          // get week for first and last week number
          if (period !== "W") {
            const firstWeek = memoizedTaxYearWeeks.find(
              (w) => w.week === firstWeekNumber
            );
            startDateOfWeek = firstWeek?.startDateOfWeek;
            // get week for last week number if period is fortnightly or 4 weekly
            if (period !== "M") {
              const lastWeek = memoizedTaxYearWeeks.find(
                (w) => w.week === lastWeekNumber
              );
              endDateOfWeek = lastWeek?.endDateOfWeek;
            }
            // if period is monthly
            else {
              const yearFirstWeek = memoizedTaxYearWeeks.find(
                (w) => w.week === 1
              );
              const yearFirstWeekDate = yearFirstWeek?.startDateOfWeek;
              // add number of months to year start date
              startDateOfWeek = moment(
                yearFirstWeekDate,
                DATE_FORMAT_DD_MM_YYYY
              )
                .add(rowNumber - 1, "month")
                .format(DATE_FORMAT_DD_MM_YYYY);
              // add 30 days to start date to get end date of month
              endDateOfWeek = moment(startDateOfWeek, DATE_FORMAT_DD_MM_YYYY)
                .add(1, "month")
                .subtract(1, "day")
                .format(DATE_FORMAT_DD_MM_YYYY);
            }
          }

          // to check if period is between start and end date of tax year range
          if (
            startDateOfWeek &&
            endDateOfWeek &&
            taxYearPeriod &&
            taxYearPeriod.txYears.length > 1
          ) {
            const matchingPeriods: any[] = [];
            const getDateValue = customRows.find((r) => r.id === row.id);
            taxYearPeriod.txYears.forEach((ty, index) => {
              const { from, to } = ty;
              let customRowFlag = false;
              const periodKey = `period-${index}`;
              const fromDate = moment(from, DATE_FORMAT_DD_MM_YYYY).format(
                DATE_FORMAT_YYYY_MM_DD
              );
              const toDate = moment(to, DATE_FORMAT_DD_MM_YYYY).format(
                DATE_FORMAT_YYYY_MM_DD
              );

              const formattedStartDateOfWeek = moment(
                startDateOfWeek,
                DATE_FORMAT_DD_MM_YYYY
              ).format(DATE_FORMAT_YYYY_MM_DD);
              const formattedEndDateOfWeek = moment(
                endDateOfWeek,
                DATE_FORMAT_DD_MM_YYYY
              ).format(DATE_FORMAT_YYYY_MM_DD);
              /*console.log(
                "from---",
                fromDate,
                toDate,
                formattedStartDateOfWeek,
                formattedEndDateOfWeek
              );*/
              let splitWeekFlag = false;
              if (
                moment(fromDate).isBetween(
                  formattedStartDateOfWeek,
                  formattedEndDateOfWeek
                ) ||
                moment(toDate).isBetween(
                  formattedStartDateOfWeek,
                  formattedEndDateOfWeek
                )
              ) {
                //console.log("split", rowNumber, row.id, getDateValue?.id);
                matchingPeriods.push(ty);
                splitWeekFlag = true;
              }

              // if split year
              if (
                isMultiYear &&
                moment(formattedEndDateOfWeek).isSameOrAfter(fromDate) &&
                moment(formattedEndDateOfWeek).isSameOrBefore(toDate)
              ) {
                customRowFlag = true;
              }

              // if period group match
              if (customRowFlag) { console.log("vv----", getDateValue?.date, fromDate, rowNumber)
                // compare split period ni paid date with from date of tax year
                if (
                  getDateValue?.date &&
                  moment(getDateValue?.date).isBefore(fromDate) &&
                  rowNumber !== 1
                ) {
                  // move week to previous period
                  let previousPeriodKey = `period-${index - 1}`;
                  splitRows[previousPeriodKey].rows.push({
                    ...row,
                    date: getDateValue.date,
                  });
                } else if (
                  moment(formattedStartDateOfWeek).isBefore(fromDate) &&
                  rowNumber !== 1 &&
                  !getDateValue?.date
                ) {
                  // move week to previous period
                  let previousPeriodKey = `period-${index - 1}`;
                  splitRows[previousPeriodKey].rows.push({
                    ...row,
                    date: formattedStartDateOfWeek,
                  });
                } else {
                  if (!splitRows[periodKey]) {
                    let splitRowFromDate = from;
                    if (splitWeekFlag) {
                      if (getDateValue?.date) {
                        splitRowFromDate = new Date(getDateValue.date);
                      } else {
                        splitRowFromDate = new Date(formattedStartDateOfWeek);
                      }
                    }

                    splitRows[periodKey] = {
                      rows: [],
                      from: splitRowFromDate,
                    };
                  }

                  let customWeekStartDate = fromDate;
                  if (splitRows[periodKey].rows.length > 0) {
                    customWeekStartDate = getDateValue?.date
                      ? moment(getDateValue.date).format(DATE_FORMAT_YYYY_MM_DD)
                      : moment(startDateOfWeek, DATE_FORMAT_DD_MM_YYYY).format(
                          DATE_FORMAT_YYYY_MM_DD
                        );
                  }
                  splitRows[periodKey].rows.push({
                    ...row,
                    date: customWeekStartDate,
                  });
                }
              }
            });

            // if period is between start and end date of tax year range
            if (matchingPeriods.length > 1) {
              setCustomRows((prevState) => [
                ...prevState,
                {
                  ...row,
                  date: getDateValue?.date
                    ? moment(getDateValue.date).format(DATE_FORMAT_YYYY_MM_DD)
                    : moment(startDateOfWeek, DATE_FORMAT_DD_MM_YYYY).format(
                        DATE_FORMAT_YYYY_MM_DD
                      ),
                  minDate: moment(
                    startDateOfWeek,
                    DATE_FORMAT_DD_MM_YYYY
                  ).format(DATE_FORMAT_YYYY_MM_DD),
                  maxDate: moment(endDateOfWeek, DATE_FORMAT_DD_MM_YYYY).format(
                    DATE_FORMAT_YYYY_MM_DD
                  ),
                },
              ]);
            }
          }
        });

        if (isMultiYear) {
          setCustomSplitRows(splitRows);
        }
      }
      isUpdateFlag && setIsUpdateFlag(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      rows,
      taxYear,
      memoizedTaxYearWeeks,
      memoizedTaxYears,
      taxYearPeriod,
      setCustomRows,
      setCustomSplitRows,
      isUpdateFlag,
    ]
  );

  // repeat row button click handler
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      const rowToDuplicate: Row = activeRowId
        ? getRowByActiveId()
        : rows[rows.length - 1];

      if (!rowToDuplicate.number) return false;

      let repeatTimes = repeatQty > 0 ? repeatQty : 1;
      const currentTotalRows = rows.length + repeatQty;
      const remAllowedRows = getAllowedRows(currentTotalRows);
      const maxAllowedRows = getAllowedRows(currentTotalRows, "", true);
      const getMaxPeriod = Math.max(...rows.map((r) => r.number));
      const getPeriodRowsAllowed = Math.abs(maxAllowedRows - getMaxPeriod);
      let initialPeriodNumber = getMaxPeriod;

      // validations for max limit of rows allowed
      if (getAllowedRows(rows.length) === 0 || getPeriodRowsAllowed === 0) {
        // validation for repeat qty if maximum limit is reached
        setIsRepeatAllow(false);
        return false;
      } else {
        if (repeatTimes > remAllowedRows) {
          // don't allow to add more rows
          setIsRepeatAllow(false);
        }

        if (repeatTimes > getPeriodRowsAllowed) {
          repeatTimes = getPeriodRowsAllowed;
          setIsRepeatAllow(false);
        } else {
          setIsRepeatAllow(true);
        }
      }

      const newRows = [];
      for (let i = 0; i < repeatTimes; i++) {
        const id = uniqid();
        initialPeriodNumber += 1;

        const newRow = {
          id: id,
          category: rowToDuplicate.category,
          period: rowToDuplicate.period,
          gross: rowToDuplicate.gross,
          number: initialPeriodNumber,
          ee: 0,
          er: 0,
        };
        newRows.push(newRow);
      }

      const updatedRows = [...rows, ...newRows];
      setRows(updatedRows);
    },
    [
      repeatQty,
      activeRowId,
      rows,
      getRowByActiveId,
      setRows,
      getAllowedRows,
      setIsRepeatAllow,
    ]
  );

  // delete selected row button click handler
  const handleDeleteRow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeRowId) {
      setPeriodNumbers(activeRowId);
      setErrors({});
      setResult(null);
      setActiveRowId(null);

      // validation for repeat qty if maximum limit is reached
      const currentTotalRows = rows.length - 1;
      if (
        getAllowedRows(currentTotalRows) === 0 ||
        repeatQty > getAllowedRows(currentTotalRows)
      ) {
        // validation for repeat qty if maximum limit is reached
        setIsRepeatAllow(false);
      } else {
        setIsRepeatAllow(true);
      }
    }
  };

  // handle change in date input in custom rows for period
  const handleDateInputChange = useCallback(
    (row, e: React.ChangeEvent<HTMLInputElement>) => {
      setIsUpdateFlag(true);
      const { value } = e.target;

      if (value) {
        // remove id from errors
        delete errors[row.id];
        setErrors(errors);

        const updatedRow = { ...row, date: value };
        const updatedRows = customRows.map((r) => {
          if (r.id === row.id) {
            return updatedRow;
          }
          return r;
        });
        setCustomRows(updatedRows);

        const getCurrentRow = Object.values(customSplitRows)
          .flatMap((obj) => obj.rows)
          .find((oRow) => oRow.id === row.id);

        // Update the date value
        if (getCurrentRow) {
          getCurrentRow.date = value;
        }

        // Get the parent key of the updated value
        let parentKey;
        Object.entries(customSplitRows).forEach(([key, value]) => {
          const updatedRow = value.rows.find((uRow) => uRow.id === row.id);
          if (updatedRow) {
            parentKey = key;
            return true;
          }
        });

        // Update the from value
        if (parentKey) {
          // @ts-ignore
          customSplitRows[parentKey].from = new Date(value);
        }

        setCustomSplitRows(customSplitRows);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customRows, errors, setCustomRows, setErrors, setIsUpdateFlag]
  );

  return (
    <>
      <Class1Table showBands={false} printView={false} repeatQty={repeatQty} />

      <div className="container stack-left">
        <div className="container">
          <div className="form-group repeat-button repeat-row">
            <SecondaryButton
              label="Repeat row"
              onClick={handleClick}
              disabled={!isRepeatAllow}
            />
            {` x `}
            <label htmlFor="repeatQty" className="govuk-visually-hidden">
              Repeat quantity
            </label>
            <input
              className="govuk-input govuk-input--width-2 borderless"
              type="number"
              name="repeatQty"
              id="repeatQty"
              data-testid="repeat-qty"
              value={repeatQty || ""}
              onChange={(e) => {
                handleMaxValue(parseInt(e.currentTarget.value));
              }}
            />
          </div>

          <div className="form-group repeat-button">
            <SecondaryButton
              label="Delete active row"
              onClick={handleDeleteRow}
              disabled={!activeRowId || rows.length === 1}
            />
          </div>

          <div className="form-group">
            <SecondaryButton label="Clear table" onClick={handleClear} />
          </div>
        </div>
      </div>

      {customRows.length > 0 && (
        <Class1PeriodsSection handleDateInputChange={handleDateInputChange} />
      )}

      <div className="form-group" style={{ marginTop: "25px" }}>
        <button className="govuk-button nomar" type="submit">
          Calculate
        </button>
      </div>
    </>
  );
}
