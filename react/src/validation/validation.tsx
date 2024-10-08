import { Class1DebtRow, CustomRow, GovDateRange, TaxYear } from "../interfaces";
import { PeriodLabel } from "../config";
import { Dispatch } from "react";
import {
  govDateFormat,
  hasKeys,
  isEmpty,
  validDateRange,
} from "../services/utils";
import moment from "moment";
import { DirectorsUIRow } from "../components/calculators/directors/DirectorsContext";
import { Row } from "../components/calculators/class1/ClassOneContext";

interface ClassOnePayload {
  rows: Array<Row>;
  niPaidNet: string;
  niPaidEmployee: string;
  customRows?: Array<CustomRow>;
}

interface DirectorsPayload {
  niPaidNet: string;
  niPaidEmployee: string;
  dateRange: GovDateRange;
  earningsPeriod: PeriodLabel | null;
  rows: Array<DirectorsUIRow>;
  askApp: boolean | undefined;
  app: string | null;
  taxYear: TaxYear | null;
}

interface Class2Or3Payload {
  paymentEnquiryDate: Date | null;
  earningsFactor: string;
  taxYear: TaxYear | null;
  activeClass: string;
  finalDate: Date | null;
}

interface Class3Payload {
  dateRange: GovDateRange;
}

export interface ErrorMessage {
  name: string;
  link: string;
  message: string;
}

export interface ClassOneErrors {
  niPaidNet?: ErrorMessage;
  niPaidEmployee?: ErrorMessage;
}

interface LateInterestPayload {
  rows: Array<Class1DebtRow>;
  dateRange: GovDateRange;
  hasRemissionPeriod: boolean | null;
}

export interface GenericErrors {
  [key: string]: ErrorMessage;
}

export const beforeMinimumDate = (date: Date, minDate: Date) =>
  moment(date).isBefore(moment(minDate));

export const afterMaximumDate = (date: Date, maxDate: Date) =>
  moment(date).isAfter(moment(maxDate));

export const stripCommas = (val: string) => val.replace(/,/g, "");

const validateNiPaid = (
  errors: GenericErrors,
  niPaidNet: string,
  niPaidEmployee: string
) => {
  const net = stripCommas(niPaidNet);
  const employee = stripCommas(niPaidEmployee);
  if (net === "" && employee !== "") {
    errors.niPaidNet = {
      link: "niPaidNet",
      name: "Net NI paid",
      message: "NI paid net contributions must be entered",
    };
  } else if (employee === "" && net !== "") {
    errors.niPaidEmployee = {
      link: "niPaidEmployee",
      name: "Net NI paid by employee",
      message: "NI paid employee contributions must be entered",
    };
  } else if (net !== "" && employee !== "") {
    if (isNaN(+net)) {
      errors.niPaidNet = {
        link: "niPaidNet",
        name: "Net NI paid",
        message: "NI paid net contributions must be an amount of money",
      };
    }
    if (isNaN(+employee)) {
      errors.niPaidEmployee = {
        link: "niPaidNet",
        name: "Net NI paid",
        message: "NI paid employee contributions must be an amount of money",
      };
    }
    if (
      !isNaN(+net) &&
      !isNaN(+employee) &&
      parseFloat(net) < parseFloat(employee)
    ) {
      errors.niPaidNet = {
        link: "niPaidNet",
        name: "Net NI paid",
        message:
          "NI paid net contributions cannot be less than employee contributions",
      };
    }
  }
};

export const validateClassOnePayload = (
  payload: ClassOnePayload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {};
  validateNiPaid(errors, payload.niPaidNet, payload.niPaidEmployee);
  validateClass1Rows(payload.rows, errors);

  // for period table rows validation
  if (payload.customRows) {
    validateClass1CustomRows(payload.customRows, errors);
  }

  if (hasKeys(errors)) {
    setErrors(errors);
    return false;
  }

  return true;
};

export const validateDirectorsPayload = (
  payload: DirectorsPayload,
  setErrors: Dispatch<GenericErrors>,
  taxYears: TaxYear[]
) => {
  let errors: GenericErrors = {};
  validateNiPaid(errors, payload.niPaidNet, payload.niPaidEmployee);
  if (!payload.earningsPeriod) {
    errors.earningsPeriod = {
      name: "Earnings period",
      link: "earningsPeriod-Annual",
      message: "Select either Annual or Pro Rata",
    };
  } else if (payload.earningsPeriod === PeriodLabel.PRORATA) {
    validateDirectorshipDates(
      payload.taxYear,
      payload.dateRange,
      taxYears,
      errors
    );
  }

  if (payload.askApp && !payload.app) {
    errors.app = {
      name: "app",
      link: "app",
      message:
        "Select yes if an Appropriate Personal Pension Scheme is applicable",
    };
  }

  validateClass1Rows(payload.rows, errors);

  if (hasKeys(errors)) {
    setErrors(errors);
    return false;
  }

  return true;
};

export const validateClass2Or3Payload = (
  payload: Class2Or3Payload,
  setErrors: Dispatch<GenericErrors>
) => {
  const maxDate = payload.finalDate;
  const earningsFactor = stripCommas(payload.earningsFactor);
  let errors: GenericErrors = {};
  if (!payload.activeClass || !payload.taxYear) {
    errors.nationalInsuranceClass = {
      name: "nationalInsuranceClass",
      link: "nationalInsuranceClass",
      message: "Select either Class 2 or Class 3",
    };
  }
  if (!payload.paymentEnquiryDate) {
    errors.paymentEnquiryDate = {
      name: "paymentEnquiryDate",
      link: "paymentEnquiryDateDay",
      message: "Payment/enquiry date must be entered as a real date",
    };
  } else if (maxDate && afterMaximumDate(payload.paymentEnquiryDate, maxDate)) {
    errors.paymentEnquiryDate = {
      name: "paymentEnquiryDate",
      link: "paymentEnquiryDateDay",
      message: `Payment/enquiry date must be on or before ${moment(
        maxDate
      ).format(govDateFormat)}`,
    };
  }

  if (!earningsFactor) {
    errors.earningsFactor = {
      name: "earningsFactor",
      link: "earningsFactor",
      message: "Total earnings factor must be entered",
    };
  } else if (isNaN(+earningsFactor)) {
    errors.earningsFactor = {
      name: "earningsFactor",
      link: "earningsFactor",
      message: "Total earnings factor must be an amount of money",
    };
  } else if (parseFloat(earningsFactor) < 0) {
    errors.earningsFactor = {
      name: "earningsFactor",
      link: "earningsFactor",
      message:
        "Total earnings factor must be an amount of money greater than zero",
    };
  }

  if (Object.keys(errors).length > 0) {
    setErrors(errors);
  }

  return isEmpty(errors);
};

export const validateClass3Payload = (
  payload: Class3Payload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {};
  const dateRange = payload.dateRange;

  if (dateRange.fromParts && !validDateRange(dateRange.fromParts)) {
    errors.wccFromDay = {
      link: "wccFromDay",
      name: "Start date",
      message: "Start date must be entered as a real date",
    };
  }

  if (dateRange.toParts && !validDateRange(dateRange.toParts)) {
    errors.wccToDay = {
      link: "wccToDay",
      name: "End date",
      message: "End date must be entered as a real date",
    };
  }

  if (hasKeys(errors)) {
    setErrors(errors);
    return false;
  }
  return true;
};

export const validateLateInterestPayload = (
  payload: LateInterestPayload,
  setErrors: Dispatch<GenericErrors>
) => {
  const errors: GenericErrors = {};
  console.log("validating payload", payload);

  if (
    payload.hasRemissionPeriod !== true &&
    payload.hasRemissionPeriod !== false
  ) {
    errors.hasRemissionPeriod = {
      name: "hasRemissionPeriod",
      link: "hasRemissionPeriod",
      message: "Select yes if there is a remission period",
    };
  }

  const dateRange = payload.dateRange;

  if (
    payload.hasRemissionPeriod === true &&
    dateRange.fromParts &&
    !validDateRange(dateRange.fromParts)
  ) {
    errors.remissionPeriodFromDay = {
      name: "remissionPeriod",
      link: "remissionPeriodFromDay",
      message: "Remission period start date must be entered as a real date",
    };
  }

  if (
    payload.hasRemissionPeriod === true &&
    dateRange.toParts &&
    !validDateRange(dateRange.toParts)
  ) {
    errors.remissionPeriodToDay = {
      name: "remissionPeriod",
      link: "remissionPeriodToDay",
      message: "Remission period end date must be entered as a real date",
    };
  }

  validateLateInterestRows(payload.rows, setErrors, errors);
  if (hasKeys(errors)) {
    setErrors(errors);
    return false;
  }
  return true;
};

const validateLateInterestRows = (
  rows: Array<Class1DebtRow>,
  setErrors: Dispatch<GenericErrors>,
  errors: GenericErrors
) => {
  rows.forEach((row: Class1DebtRow, index: number) => {
    const debt = stripCommas(row.debt);
    if (!debt) {
      errors[`${row.id}-class1-debt`] = {
        name: `${row.id}-class1-debt`,
        link: `${row.id}-class1-debt`,
        message: `Class 1 debt for row #${index + 1} must be entered`,
      };
    } else if (isNaN(+debt)) {
      errors[`${row.id}-class1-debt`] = {
        name: `${row.id}-class1-debt`,
        link: `${row.id}-class1-debt`,
        message: `Class 1 debt for row #${
          index + 1
        } must be an amount of money`,
      };
    }
  });
};

const validateClass1Rows = (
  rows: Array<Row | DirectorsUIRow>,
  errors: GenericErrors
) => {
  const manyRows = rows.length > 1;
  rows.forEach((r: Row | DirectorsUIRow, index: number) => {
    const gross = stripCommas(r.gross);
    if (!gross) {
      errors[`${r.id}-gross`] = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: manyRows
          ? `Gross pay amount for row ${index + 1} must be entered`
          : `Gross pay amount must be entered`,
      };
    } else if (isNaN(+gross)) {
      errors[`${r.id}-gross`] = {
        name: `Gross pay amount`,
        link: `${r.id}-gross`,
        message: manyRows
          ? `Gross pay amount for row ${index + 1} must be an amount of money`
          : `Gross pay amount must be an amount of money`,
      };
    }
  });
};

const validateClass1CustomRows = (
  customRows: Array<CustomRow>,
  errors: GenericErrors
) => {
  const manyRows = customRows.length > 1;
  customRows.forEach((cRow: CustomRow, index: number) => {
    if (cRow.date === "") {
      errors[`${cRow.id}-date`] = {
        name: `NI paid date`,
        link: `${cRow.id}-date`,
        message: manyRows
          ? `NI paid date for row ${index + 1} must be entered`
          : `NI paid date must be entered`,
      };
    } else {
      // date validations
      const dateParts = cRow.date.split("-");
      let getYear: string | number = dateParts[0];
      let errorFlag = false;

      if (!getYear || !dateParts[1] || !dateParts[2]) {
        errorFlag = true;
      } else {
        getYear = Number(dateParts[0]);

        // compare entered date with today's date
        const todayDate = moment().format("YYYY-MM-DD");
        const enteredDate = moment(cRow.date).format("YYYY-MM-DD");

        // check if year is valid and if future date
        if (
          isNaN(getYear) ||
          getYear.toString().length !== 4 ||
          getYear < 1975 ||
          todayDate.localeCompare(enteredDate) < 0
        ) {
          errorFlag = true;
        }
      }

      if (errorFlag) {
        errors[`${cRow.id}-date`] = {
          name: `NI paid date`,
          link: `${cRow.id}-date`,
          message: manyRows
            ? `NI paid date for row ${index + 1} must be a valid date`
            : `NI paid date must be a valid date`,
        };
      }
    }
  });
};

const validateDirectorshipDates = (
  taxYear: TaxYear | null,
  dateRange: GovDateRange,
  taxYears: TaxYear[],
  errors: GenericErrors
) => {
  if (taxYear) {
    const minDate = taxYear?.from;
    const maxDate = taxYear?.to;
    if (dateRange.fromParts && !validDateRange(dateRange.fromParts)) {
      errors.directorshipFromDay = {
        link: "directorshipFromDay",
        name: "Start date of directorship",
        message: "Start date of directorship must be entered as a real date",
      };
    } else if (dateRange.from && beforeMinimumDate(dateRange.from, minDate)) {
      errors.directorshipFromDay = {
        link: "directorshipFromDay",
        name: "Start date of directorship",
        message: `Start date of directorship must be on or after ${moment(
          minDate
        ).format(govDateFormat)}`,
      };
    } else if (dateRange.from && afterMaximumDate(dateRange.from, maxDate)) {
      errors.directorshipFromDay = {
        link: "directorshipFromDay",
        name: "Start date of directorship",
        message: `Start date of directorship must be on or before ${moment(
          maxDate
        ).format(govDateFormat)}`,
      };
    }

    if (dateRange.toParts && !validDateRange(dateRange.toParts)) {
      errors.directorshipToDay = {
        link: "directorshipToDay",
        name: "End date of directorship",
        message: "End date of directorship must be entered as a real date",
      };
    } else if (dateRange.to && beforeMinimumDate(dateRange.to, minDate)) {
      errors.directorshipToDay = {
        link: "directorshipToDay",
        name: "End date of directorship",
        message: `End date of directorship must be on or after ${moment(
          minDate
        ).format(govDateFormat)}`,
      };
    } else if (dateRange.to && afterMaximumDate(dateRange.to, maxDate)) {
      errors.directorshipToDay = {
        link: "directorshipToDay",
        name: "End date of directorship",
        message: `End date of directorship must be on or before ${moment(
          maxDate
        ).format(govDateFormat)}`,
      };
    } else if (
      !errors.directorshipFromDay &&
      dateRange.from &&
      moment(dateRange.to).isBefore(moment(dateRange.from))
    ) {
      errors.directorshipToDay = {
        link: "directorshipToDay",
        name: "End date of directorship",
        message: `End date of directorship must be on or after the start date of the directorship`,
      };
    }
  }
};
