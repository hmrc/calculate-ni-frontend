import React, {useContext} from 'react'
import {onlyUnique} from '../../../config'
import {ClassOneContext} from "./ClassOneContext";

// components
import CategoryTotals from '../../CategoryTotals'
import ClassOneEarningsTable from './Class1ContributionsTable'

// types
import {SavePrintBaseProps} from '../../../interfaces'
import DetailsPrint from "../../DetailsPrint";

function Class1Print(props: SavePrintBaseProps) {
  const { title, setShowSummary } = props;
  const {
    rows,
    details
  } = useContext(ClassOneContext)

  const getUniqueCategories = () => {
    return rows
      .map(r => r.category)
      .filter(onlyUnique)
  }

  return (
    <div className="save-print-wrapper">
      <div className="print-content">
        <a href="#hideSummary" className="govuk-back-link" onClick={(e) => {
          e.preventDefault()
          setShowSummary(false)
        }}>Back</a>
        <h2 className="govuk-heading-l">{title}</h2>
        
        <DetailsPrint details={details} />

        <ClassOneEarningsTable
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

export default Class1Print