import React from 'react'

// components
import Totals from './Totals'
import SavePrintSummary from './SavePrintSummary'

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
          niData={props.niData}
        />
        
        <div className="ni-due">
          <p><strong>NI due</strong> [TBC]</p>
        </div>

        
        <h2 className="heading-sap-sm">Summary</h2>
        <Totals 
          grossTotal={props.grossTotal}
          niPaidNet={props.niPaidNet}
          setNiPaidNet={props.setNiPaidNet}
          niPaidEmployee={props.niPaidEmployee}
          setNiPaidEmployee={props.setNiPaidEmployee}
          niPaidEmployer={props.niPaidEmployer}
          netContributionsTotal={props.netContributionsTotal}
          employeeContributionsTotal={props.employeeContributionsTotal}
          employerContributionsTotal={props.employerContributionsTotal}
          underpaymentNet={props.underpaymentNet}
          overpaymentNet={props.overpaymentNet}
          underpaymentEmployee={props.underpaymentEmployee}
          overpaymentEmployee={props.overpaymentEmployee}
          underpaymentEmployer={props.underpaymentEmployer}
          overpaymentEmployer={props.overpaymentEmployer}
          isSaveAndPrint={true}
        />
        
      </div>
    </div>
  )
}

export default SavePrint