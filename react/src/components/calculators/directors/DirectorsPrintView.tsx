import React, {useContext} from 'react'
import {DirectorsContext} from "./DirectorsContext";

// components
import CategoryTotals from '../shared/CategoryTotals'
import DirectorsEarningsTable from './DirectorsContributionsTable'
import DetailsPrint from "../shared/DetailsPrint";

// types
import {SavePrintBaseProps} from '../../../interfaces'
import BackLink from "../../helpers/gov-design-system/BackLink";

function DirectorsPrintView(props: SavePrintBaseProps) {
  const { title, setShowSummary } = props;
  const {
    rows,
    details,
    categoryTotals,
    grossTotal,
    niPaidEmployee,
    niPaidNet
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

        <DirectorsEarningsTable
          showBands={true}
        />

        <div className="ni-due">
          <p><strong>NI due</strong> [TBC]</p>
        </div>

        <CategoryTotals
          rows={rows}
          categoryTotals={categoryTotals}
          grossTotal={grossTotal}
          niPaidEmployee={niPaidEmployee}
          niPaidNet={niPaidNet}
        />

      </div>
    </div>
  )
}

export default DirectorsPrintView
