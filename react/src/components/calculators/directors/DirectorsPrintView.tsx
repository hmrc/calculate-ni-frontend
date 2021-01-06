import React, {useContext} from 'react'
import {onlyUnique, taxYearString} from '../../../config'
import {DirectorsContext} from "./DirectorsContext";
// components
import CategoryTotals from '../../CategoryTotals'
import DirectorsEarningsTable from './DirectorsContributionsTable'

// helpers
import SummaryListRow from '../../helpers/gov-design-system/SummaryListRow'

// types
import {SavePrintBaseProps} from '../../../interfaces'

function DirectorsPrintView(props: SavePrintBaseProps) {
  const { title, setShowSummary } = props;
  const {
    rows,
    details,
    taxYear
  } = useContext(DirectorsContext)

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
              listValue={taxYearString(taxYear)}
              rowClasses="half"
            />
          </dl>
        </div>

        <DirectorsEarningsTable
          showBands={true}
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
