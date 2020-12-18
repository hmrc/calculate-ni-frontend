import React from 'react'
import { onlyUnique } from '../config'

// components
import Totals from './Totals'
import CategoryTotals from './CategoryTotals'

// helpers
import SummaryListRow from './helpers/gov-design-system/SummaryListRow'

// types
import { SavePrintProps } from '../interfaces'
import ContributionsTable from './calculators/class1/Class1ContributionsTable'

function SavePrint(props: SavePrintProps) {

  const getUniqueCategories = () => {
    return props.rows
      .map(r => r.category)
      .filter(onlyUnique)
  }

  const notEntered = 'Not entered'

  return (
    <div id="save-print-wrapper">
      <div className="print-content">
        <a href="#" className="govuk-back-link" onClick={() => props.setShowSummary(false)}>Back</a>
        <h2 className="govuk-heading-l">Class 1 NI contributions calculation</h2>
        
        <div className="details">
          <dl className="govuk-summary-list two-col">
            <SummaryListRow 
              listKey="Prepared by:" 
              listValue={props.details.preparedBy ? props.details.preparedBy : notEntered} 
              rowClasses="half"  
            />
            
            <SummaryListRow 
              listKey="Date:" 
              listValue={props.details.date ? props.details.date : notEntered} 
              rowClasses="half" 
            />

            <SummaryListRow 
              listKey="Customer’s full name:" 
              listValue={props.details.fullName ? props.details.fullName : notEntered} 
              rowClasses="half" 
            />

            <SummaryListRow 
              listKey="NI number:" 
              listValue={props.details.ni ? props.details.ni : notEntered} 
              rowClasses="half" 
            />

            <SummaryListRow 
              listKey="Reference:" 
              listValue={props.details.reference ? props.details.reference : notEntered} 
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
          showBands={true}
        />
        
        <div className="ni-due">
          <p><strong>NI due</strong> [TBC]</p>
        </div>

        {/* Category Totals */}
        <CategoryTotals
          rows={props.rows}
          categoriesList={getUniqueCategories()}
        />

        
        <h2 className="heading-sap-sm">Summary</h2>
        <Totals 
          grossPayTally={true}
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
      <button className="button" onClick={() =>  window.print()}>
        Save and print
      </button>
    </div>
  )
}

export default SavePrint