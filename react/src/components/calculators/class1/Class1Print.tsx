import React, {useContext} from 'react'
import {ClassOneContext} from "./ClassOneContext";

// components
import CategoryTotals from '../shared/CategoryTotals'
import ClassOneEarningsTable from './Class1ContributionsTable'
import DetailsPrint from "../shared/DetailsPrint";

// types
import {SavePrintBaseProps} from '../../../interfaces'

function Class1Print(props: SavePrintBaseProps) {
  const { title, setShowSummary } = props;
  const {
    rows,
    details
  } = useContext(ClassOneContext)

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

        <ClassOneEarningsTable showBands={true} />
        
        <div className="ni-due">
          <p><strong>NI due</strong> [TBC]</p>
        </div>

        <CategoryTotals rows={rows} />

      </div>
    </div>
  )
}

export default Class1Print
