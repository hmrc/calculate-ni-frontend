import React, {
  Dispatch,
  useContext,
  useEffect,
  useState,
  SetStateAction,
} from "react";
import {
  CustomRow,
  CustomSplitRows,
  DetailsProps,
  GenericObject,
  TaxYear,
  TotalsInCategories,
} from "../../../interfaces";
import { buildTaxYears, periods, PeriodValue } from "../../../config";
import { GenericErrors } from "../../../validation/validation";
import { mapCategoryTotalsResponse } from "../../../services/utils";
import {
  categoryNamesToObject,
  initClassOneCalculator,
  NiFrontendContext,
} from "../../../services/NiFrontendContext";
import uniqid from "uniqid";


interface TestContext {
myName: string;
setMyName: Function;
}

export const TestContext = React.createContext<TestContext>({
myName: "Stuart",
setMyName: () => {}
});

return {
myName,
setMyName
}