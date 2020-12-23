import React from 'react'
import { onlyUnique } from '../../../config'

// components
import CategoryTotals from '../../CategoryTotals'

// helpers
import SummaryListRow from '../../helpers/gov-design-system/SummaryListRow'

// types
import {DirectorsPrint} from '../../../interfaces'
import DirectorsEarningsTable from './DirectorsContributionsTable'

function DirectorsPrintView(props: DirectorsPrint) {
  const { title, details, rows, earningsPeriod, taxYear, taxYearString, setShowSummary } = props;
  const getUniqueCategories = () => {
    return rows
      .map(r => r.category)
      .filter(onlyUnique)
  }

  const notEntered = 'Not entered'

  return (
    <div className="save-print-wrapper">
      <div className="print-content">
        <a href="#hideSummary" className="govuk-back-link" onClick={(e) => {
          e.preventDefault()
          setShowSummary(false)
        }}>Back</a>
        <h2 className="govuk-heading-l">{title}</h2>

        <div className="details">
          <dl className="govuk-summary-list two-col">
            <SummaryListRow
              listKey="Prepared by:"
              listValue={details.preparedBy ? details.preparedBy : notEntered}
              rowClasses="half"
            />

            <SummaryListRow
              listKey="Date:"
              listValue={details.date ? details.date : notEntered}
              rowClasses="half"
            />

            <SummaryListRow
              listKey="Customer’s full name:"
              listValue={details.fullName ? details.fullName : notEntered}
              rowClasses="half"
            />

            <SummaryListRow
              listKey="NI number:"
              listValue={details.ni ? details.ni : notEntered}
              rowClasses="half"
            />

            <SummaryListRow
              listKey="Reference:"
              listValue={details.reference ? details.reference : notEntered}
              rowClasses="half"
            />

            <SummaryListRow
              listKey="Tax year:"
              listValue={taxYearString}
              rowClasses="half"
            />
          </dl>
        </div>

        <DirectorsEarningsTable
          rows={rows}
          taxYear={taxYear}
          showBands={true}
          earningsPeriod={earningsPeriod}
        />

        <div className="ni-due">
          <p><strong>NI due</strong> [TBC]</p>
        </div>

        <CategoryTotals
          rows={rows}
          categoriesList={getUniqueCategories()}
        />

      </div>
    </div>
  )
}

export default DirectorsPrintView
