import React from 'react'

// helpers
import SummaryListRow from './helpers/SummaryListRow'

// types
import { SavePrintProps } from '../interfaces'
import ContributionsTable from './ContributionsTable'

function SavePrint(props: SavePrintProps) {
  return (
    <div id="save-print-wrapper">
      <div className="print-content">
        <button type="button" onClick={() => props.setShowSummary(false)}>Close summary</button>
        <h2 className="govuk-heading-l">Class 1 NI Assessment</h2>
        
        <div className="details">
          <dl className="govuk-summary-list two-col">
            <SummaryListRow 
              listKey="Prepared by:" 
              listValue={props.details.preparedBy} 
              rowClasses="half"  
            />
            
            <SummaryListRow 
              listKey="Date:" 
              listValue={props.details.date} 
              rowClasses="half" 
            />

            <SummaryListRow 
              listKey="Full name:" 
              listValue={props.details.fullName} 
              rowClasses="half" 
            />

            <SummaryListRow 
              listKey="NI number:" 
              listValue={props.details.ni} 
              rowClasses="half" 
            />

            <SummaryListRow 
              listKey="Reference:" 
              listValue={props.details.reference} 
              rowClasses="half" 
            />

            <SummaryListRow 
              listKey="Tax year:" 
              listValue={props.taxYearString} 
              rowClasses="half" 
            />
          </dl>
        </div>
        
        <ContributionsTable 
          rows={props.rows}
          periods={props.periods}
          taxYear={props.taxYear}
        />
        
      </div>
    </div>
  )
}

export default SavePrint