import React, {useContext} from 'react'
import {ClassOneContext} from "./ClassOneContext";

// components
import CategoryTotals from '../shared/CategoryTotals'
import ClassOneEarningsTable from './Class1ContributionsTable'
import DetailsPrint from "../shared/DetailsPrint";

// types
import {Calculators, Class1DirectorsSavePrintProps} from '../../../interfaces'
import BackLink from "../../helpers/gov-design-system/BackLink";

function Class1Print(props: Class1DirectorsSavePrintProps) {
  const { title, setShowSummary, result } = props;
  const {
    rows,
    details,
    categoryTotals
  } = useContext(ClassOneContext)

  return (
    <div className="save-print-wrapper">
      <div className="print-content">

        <BackLink callBack={() => setShowSummary(false)} />

        <h2 className="govuk-heading-l">
          {title}
        </h2>
        
        <DetailsPrint details={details} />

        <ClassOneEarningsTable
          showBands={true}
          printView={true}
        />
        
        <div className="ni-due">
          <p><strong>NI due</strong> [TBC]</p>
        </div>

        <CategoryTotals
          rows={rows}
          categoryTotals={categoryTotals}
          result={result}
        />

      </div>
    </div>
  )
}

export default Class1Print
