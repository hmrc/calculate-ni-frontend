import React, {useContext} from 'react'
import {ClassOneContext} from "./ClassOneContext";

// components
import CategoryTotals from '../shared/CategoryTotals'
import ClassOneEarningsTable from './Class1ContributionsTable'
import DetailsPrint from "../shared/DetailsPrint";

// types
import {Calculators, SavePrintBaseProps} from '../../../interfaces'
import BackLink from "../../helpers/gov-design-system/BackLink";

function Class1Print(props: SavePrintBaseProps) {
  const { title, setShowSummary } = props;
  const {
    rows,
    details,
    categoryTotals,
    grossTotal
  } = useContext(ClassOneContext)

  return (
    <div className="save-print-wrapper">
      <div className="print-content">

        <BackLink callBack={() => setShowSummary(false)} />

        <h2 className="govuk-heading-l">
          {title}
        </h2>
        
        <DetailsPrint details={details} />

        <ClassOneEarningsTable showBands={true} />
        
        <div className="ni-due">
          <p><strong>NI due</strong> [TBC]</p>
        </div>

        <CategoryTotals
          rows={rows}
          categoryTotals={categoryTotals}
          grossTotal={grossTotal}
          type={Calculators.CLASS_ONE}
        />

      </div>
    </div>
  )
}

export default Class1Print
