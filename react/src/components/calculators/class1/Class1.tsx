import React, { useContext, useEffect, useRef, useState } from "react";
import {
  stripCommas,
  validateClassOnePayload,
} from "../../../validation/validation";
import { ClassOneRow } from "../../../calculation";

// components
import Details from "../shared/Details";
import Class1Form from "./Class1Form";
import Totals from "../shared/Totals";
import Class1Print from "./Class1Print";
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";

// utils
import { hasKeys } from "../../../services/utils";
import {
  ClassOneContext,
  useClassOneForm,
  ClassOneRowInterface,
  Row,
  TestContext,
} from "./ClassOneContext";
import { useDocumentTitle } from "../../../services/useDocumentTitle";
import { SuccessNotification } from "../shared/SuccessNotification";
import { SuccessNotificationContext } from "../../../services/SuccessNotificationContext";
import PrintButtons from "../shared/PrintButtons";

const pageTitle = "This is the calculation for class 1";

const Class1Page = () => {
  const [number, setNumber] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const resultRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const totalsRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const {
    ClassOneCalculator,
    taxYear,
    defaultRow,
    rows,
    setRows,
    customRows,
    errors,
    setErrors,
    details,
    setDetails,
    niPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    setNiPaidNet,
    result,
    setResult,
    setActiveRowId,
    isMultiYear,
    customSplitRows,
  } = useContext(ClassOneContext);
  const { successNotificationsOn } = useContext(SuccessNotificationContext);
  const titleWithPrefix = hasKeys(errors) ? "Error: " + pageTitle : pageTitle;
  const testUse = useContext(TestContext)
  useDocumentTitle(titleWithPrefix);

  const handleChangeValue = () => {

  };

  const handleDetailsChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ [name]: value });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setActiveRowId(null);
    submitForm(false);
  };

  const handleShowSummary = (event: React.FormEvent) => {
    event.preventDefault();
    setActiveRowId(null);
    submitForm(true);
  };

  const submitForm = (showSummaryIfValid: boolean) => {
    setErrors({});

    if (isMultiYear) {
      let getResults: any[] = [];
      const totalPeriods = customSplitRows
        ? Object.keys(customSplitRows).length
        : 0;

      // calculate results for each period
      totalPeriods > 0 &&
        Object.keys(customSplitRows).forEach((key: any) => {
          let getData = customSplitRows[key];
          let getRowResult = calculateRows({
            rows: getData.rows,
            niPaidNet,
            niPaidEmployee,
            customRows,
            from: getData.from,
          });
          getResults.push(getRowResult);
        });

      if (getResults.length === 0 || !getResults[0]) return;

      // combine results
      let finalResultToSet: any = "";
      if (getResults.length > 1) {
        const finalResult = getResults.reduce((acc, obj) => {
          obj.bandTotals.resultBands.forEach((value: any, key: any) => {
            const getExisting = acc.bandTotals.resultBands.get(key);
            if (!getExisting) {
              acc.bandTotals.resultBands.set(key, value);
            } else {
              getExisting.gross += value.gross;
              getExisting.employee += value.employee;
              getExisting.employer += value.employer;
              getExisting.net += value.net;
            }
          });

          obj.bandTotals.resultContributionBands.forEach(
            (value: any, key: any) => {
              const getExisting =
                acc.bandTotals.resultContributionBands.get(key);
              if (!getExisting) {
                acc.bandTotals.resultContributionBands.set(key, value);
              } else {
                getExisting.gross += value.gross;
                getExisting.employee += value.employee;
                getExisting.employer += value.employer;
                getExisting.net += value.net;
              }
            }
          );

          obj.categoryTotals.forEach((value: any, key: any) => {
            const getExisting = acc.categoryTotals.get(key);
            if (!getExisting) {
              acc.categoryTotals.set(key, value);
            } else {
              getExisting.gross += value.gross;
              getExisting.employee += value.employee;
              getExisting.employer += value.employer;
              getExisting.net += value.net;
              getExisting.resultBands = acc.bandTotals.resultBands;
              getExisting.resultContributionBands = acc.bandTotals.resultBands;
            }
          });

          return {
            ...acc,
            resultRows: acc.resultRows.concat(obj.resultRows),
            totals: {
              employee: acc.totals.employee + obj.totals.employee,
              employer: acc.totals.employer + obj.totals.employer,
              net: acc.totals.net + obj.totals.net,
              gross: acc.totals.gross + obj.totals.gross,
            },
          };
        });

        finalResultToSet = finalResult;
      } else {
        finalResultToSet = getResults[0];
      }

      // calculate underpayment and overpayment
      let getUnderpayment = finalResultToSet.underpayment;
      let getOverpayment = finalResultToSet.overpayment;
      let getTotals = finalResultToSet.totals;
      let employerContributions = finalResultToSet.employerContributions;

      if (niPaidNet) {
        // for net contributions
        if (getTotals.net - parseFloat(niPaidNet) >= 0) {
          getUnderpayment.total = (
            getTotals.net - parseFloat(niPaidNet)
          ).toFixed(2);
          getOverpayment.total = 0;
        } else {
          getOverpayment.total = (
            parseFloat(niPaidNet) - getTotals.net
          ).toFixed(2);
          getUnderpayment.total = 0;
        }
      } else {
        getUnderpayment.total = getTotals.net;
        getOverpayment.total = 0;
      }

      if (niPaidEmployee) {
        // for employee contributions
        if (getTotals.employee - parseFloat(niPaidEmployee) >= 0) {
          getUnderpayment.employee = (
            getTotals.employee - parseFloat(niPaidEmployee)
          ).toFixed(2);
          getOverpayment.employee = 0;
        } else {
          getOverpayment.employee = (
            parseFloat(niPaidEmployee) - getTotals.employee
          ).toFixed(2);
          getUnderpayment.employee = 0;
        }
      } else {
        getUnderpayment.employee = getTotals.employee;
        getOverpayment.employee = 0;
      }

      if (employerContributions) {
        // for employer contributions
        if (getTotals.employer - employerContributions >= 0) {
          getUnderpayment.employer = (
            getTotals.employer - employerContributions
          ).toFixed(2);
          getOverpayment.employer = 0;
        } else {
          getOverpayment.employer = (
            employerContributions - getTotals.employer
          ).toFixed(2);
          getUnderpayment.employer = 0;
        }
      } else {
        getUnderpayment.employer = getTotals.employer;
        getOverpayment.employer = 0;
      }

      finalResultToSet.underpayment = getUnderpayment;
      finalResultToSet.overpayment = getOverpayment;
      setResult(finalResultToSet);

      if (showSummaryIfValid) {
        setShowSummary(true);
      }
    } else {
      const getResult =
        taxYear &&
        calculateRows({
          rows,
          niPaidNet,
          niPaidEmployee,
          customRows,
          from: taxYear.from,
        });

      if (getResult) {
        taxYear && setResult(getResult);

        if (showSummaryIfValid) {
          setShowSummary(true);
        }
      }
    }
  };

  const calculateRows = (props: any) => {
    const { rows, niPaidNet, niPaidEmployee, customRows, from } = props;

    const payload = {
      rows: rows,
      niPaidNet: niPaidNet,
      niPaidEmployee: niPaidEmployee,
      customRows: customRows,
    };

    if (validateClassOnePayload(payload, setErrors)) {
      const requestRows: Array<ClassOneRowInterface> = rows.map(
        (row: Row) =>
          new (ClassOneRow as any)(
            row.id,
            row.period,
            row.category,
            parseFloat(stripCommas(row.gross)),
            false
          )
      );

      const netNi = stripCommas(payload.niPaidNet) || "0";
      const employeeNi = stripCommas(payload.niPaidEmployee) || "0";

      const result = ClassOneCalculator.calculate(
        from,
        requestRows,
        netNi,
        employeeNi
      );
      return result;
    } else {
      return "";
    }
  };

  const resetTotals = () => {
    setActiveRowId(null);
    setErrors({});
    setRows([defaultRow]);
    setResult(null);
    setNiPaidEmployee("");
    setNiPaidNet("");
  };

  useEffect(() => {
    if (successNotificationsOn && result) {
      resultRef.current.focus();
    } else if (result) {
      totalsRef.current.focus();
    }
  }, [result, resultRef, totalsRef, successNotificationsOn]);

  return (
    <div>
      <div
        className="result-announcement"
        aria-live="polite"
        ref={resultRef}
        tabIndex={-1}
      >
        {successNotificationsOn && result && (
          <SuccessNotification table={true} totals={true} />
        )}
      </div>
      {showSummary ? (
        <Class1Print
          title={pageTitle}
          setShowSummary={setShowSummary}
          result={result}
        />
      ) : (
        <>
          {hasKeys(errors) && <ErrorSummary errors={errors} />}

          <h1>{TestContext}</h1>

          <form onSubmit={handleSubmit} noValidate>
            <Details details={details} handleChange={handleDetailsChange} />

            <Class1Form resetTotals={resetTotals} />
          </form>
        </>
      )}

      <div
        className="divider--bottom no-focus-outline"
        ref={totalsRef}
        tabIndex={-1}
      >
        <Totals
          grossPayTally={showSummary}
          result={result}
          isSaveAndPrint={showSummary}
          context={ClassOneContext}
        />
      </div>

      <PrintButtons
        showSummary={showSummary}
        handleShowSummary={handleShowSummary}
      />
    </div>
  );
};

const Class1 = function () {
  return (
    <ClassOneContext.Provider value={useClassOneForm()}>
      <Class1Page />
    </ClassOneContext.Provider>
  );
};

export default Class1;
