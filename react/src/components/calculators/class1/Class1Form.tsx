import React, { useContext, useEffect, useState, useMemo } from "react";
import _ from "lodash";

import numeral from "numeral";
import "numeral/locales/en-gb";

import SelectTaxYear from "../../helpers/formhelpers/SelectTaxYear";

// types
import { Class1FormProps, TaxYearPeriodType } from "../../../interfaces";
import { ClassOneContext } from "./ClassOneContext";
import NiPaidInputs from "../shared/NiPaidInputs";
import moment from "moment";
import Class1PaymentSection from "./Class1PaymentSection";
import Class1NIInfoSection from "./Class1NIInfoSection";

numeral.locale("en-gb");

function Class1Form(props: Class1FormProps) {
  const { resetTotals } = props;
  const {
    taxYears,
    taxYear,
    setTaxYear,
    setResult,
    isMultiYear,
    setIsMultiYear,
  } = useContext(ClassOneContext);
  const [taxYearPeriod, setTaxYearPeriod] = useState<
    TaxYearPeriodType | undefined
  >({ from: "", txYears: [] });

  const memoizedTaxYears = useMemo(() => {
    if (taxYears && taxYears.length > 0) {
      const grouped = _.chain(taxYears)
        .groupBy((ty) => {
            const startDate = moment(ty.from)
            const endDate = moment(ty.to)
            const cutOffDate = moment(`${startDate.year()}-04-06`, "YYYY-MM-DD");
            if(startDate.year() === endDate.year() && startDate.isBefore(cutOffDate)) {
                return startDate.year() -1;
            } else {
                return startDate.year();
            }
        })
        .map((txYears, from) => ({ from, txYears }))
        .orderBy((group) => moment(group.from).year(), ["desc"])
        .value();

      const display = grouped.map((ty) => {
        if (ty.txYears.length > 1) {
          //Get the earliest start date and the latest end date
          const earliestStartDate = moment.min(
            ty.txYears.map((tx) => moment(tx.from))
          );
          const latestEndDate = moment.max(
            ty.txYears.map((tx) => moment(tx.to))
          );
          const dateFormat = "YYYY-MM-DD";
          return {
            id: `[${moment(earliestStartDate).format(dateFormat)}, ${moment(
              latestEndDate
            ).format(dateFormat)}]`,
            from: earliestStartDate.toDate(),
            to: latestEndDate.toDate(),
          };
        } else {
          return ty.txYears[0];
        }
      });

      return { display, grouped };
    }
    return { grouped: [], display: [] };
  }, [taxYears, setTaxYear]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!taxYear && memoizedTaxYears) {
        const {display} = memoizedTaxYears;

        //set default tax year
        if (display.length > 0) {
            setTaxYear(display[0]);
        } else {
            setTaxYear(taxYears[0]);
        }
    }
  }, [memoizedTaxYears, taxYear, setTaxYear, taxYears]);

  useEffect(() => {
    if (taxYear && memoizedTaxYears) {
      const taxYearStart = moment(taxYear.from).year();
      const { grouped } = memoizedTaxYears;
      // @ts-ignore
      const taxYearPeriods = grouped.find((row) => {
        return row.from === taxYearStart.toString();
      });
      // sort tax years by start date ascending
      if (taxYearPeriods) {
        taxYearPeriods.txYears.sort(
          // @ts-ignore
          (a, b) => a.from - b.from
        );
      }

      setTaxYearPeriod(taxYearPeriods);

      if (taxYearPeriods && taxYearPeriods?.txYears?.length > 1) {
        setIsMultiYear(true);
      } else {
        setIsMultiYear(false);
      }
    }
  }, [taxYear, memoizedTaxYears, setIsMultiYear]);

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { display } = memoizedTaxYears;
    // @ts-ignore
    const selectedTaxYear =
      display.find((ty) => ty.id === e.target.value) || display[0];
    setTaxYear(selectedTaxYear);
    setResult(null);
  };

  return (
    <div className="table-wrapper" data-testid="class1-ni-tax-section">
      <div className="container">
        <div className="form-group half">
          <SelectTaxYear
            taxYears={memoizedTaxYears.display}
            taxYear={taxYear}
            handleTaxYearChange={handleTaxYearChange}
          />
        </div>
      </div>

      {isMultiYear && <Class1NIInfoSection taxYear={taxYear} />}

      <NiPaidInputs context={ClassOneContext} />

      <Class1PaymentSection
        memoizedTaxYears={memoizedTaxYears}
        resetTotals={resetTotals}
        taxYearPeriod={taxYearPeriod}
      />
    </div>
  );
}

export default Class1Form;
