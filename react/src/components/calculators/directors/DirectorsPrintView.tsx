import React, {useContext} from 'react'
import {DirectorsContext} from "./DirectorsContext";

// components
import CategoryTotals from '../shared/CategoryTotals'
import DirectorsEarningsTable from './DirectorsContributionsTable'
import DetailsPrint from "../shared/DetailsPrint";

// types
import {SavePrintBaseProps} from '../../../interfaces'

function DirectorsPrintView(props: SavePrintBaseProps) {
  const { title, setShowSummary } = props;
  const {
    rows,
    details
  } = useContext(DirectorsContext)

  const handleBackLink = (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    setShowSummary(false)
  }

  return (
    <div className="save-print-wrapper">
      <div className="print-content">

        <a
          href="#hideSummary"
          className="govuk-back-link"
          onClick={handleBackLink}>
          Back
        </a>

        <h2 className="govuk-heading-l">
          {title}
        </h2>

        <DetailsPrint details={details} />

        <DirectorsEarningsTable showBands={true} />

        <div className="ni-due">
          <p><strong>NI due</strong> [TBC]</p>
        </div>

        <CategoryTotals rows={rows} />

      </div>
    </div>
  )
}

export default DirectorsPrintView
