import React, {useContext} from 'react'
import {DirectorsContext} from "./DirectorsContext";

// components
import CategoryTotals from '../shared/CategoryTotals'
import DirectorsTable from './DirectorsTable'
import DetailsPrint from "../shared/DetailsPrint";

// types
import {Class1DirectorsSavePrintProps} from '../../../interfaces'
import BackLink from "../../helpers/gov-design-system/BackLink";
import {govDateString, taxYearShorthand} from "../../../services/utils";
import {PeriodLabel} from "../../../config";

function DirectorsPrintView(props: Class1DirectorsSavePrintProps) {
  const { title, setShowSummary, result } = props;
  const {
    rows,
    details,
    categoryTotals,
    dateRange,
    taxYear,
    earningsPeriod,
    askApp,
    app
  } = useContext(DirectorsContext)

  return (
    <div className="save-print-wrapper">
      <div className="print-content">

        <BackLink
          callBack={() => setShowSummary(false)}
        />

        <h2 className="govuk-heading-l">
          {title}
        </h2>

        <DetailsPrint
          details={details}
        />

        <h2 className="govuk-heading-m">
          Tax year: {taxYear && taxYearShorthand(taxYear)}
        </h2>

        {dateRange.from && dateRange.to && earningsPeriod === PeriodLabel.PRORATA ?
          <div className="pro-rata-print">
            <h3 className="govuk-heading-s">Pro rata dates</h3>
            <p>
              From <strong>{govDateString(dateRange.from)}</strong> to <strong>{govDateString(dateRange.to)}</strong>
              {' '}({dateRange.numberOfWeeks} weeks)
            </p>
          </div>
          :
          <h3 className="govuk-heading-s">Annual directorship</h3>
        }

        {askApp &&
          <div>
            <h3>Appropriate pension scheme: <strong>{app}</strong></h3>
          </div>
        }

        <DirectorsTable
          showBands={true}
          printView={true}
        />

        <h2 className="govuk-heading-m">
          NI due
        </h2>

        <CategoryTotals
          rows={rows}
          categoryTotals={categoryTotals}
          result={result}
        />

      </div>
    </div>
  )
}

export default DirectorsPrintView
