import React, { useState } from 'react'
import uniqid from 'uniqid';

import { taxYearsCategories, periods as p } from '../../../config'

// types
import { S, Row, ErrorSummaryProps, TaxYear } from '../../../interfaces'

// components
import Details from '../../Details'
import DirectorsTable from '../directors/DirectorsTable'
import Totals from '../../Totals'

function Directors() {
  const initialState = {
    fullName: '',
    ni: '',
    reference: '',
    preparedBy: '',
    date: '',
  }
  const stateReducer = (state: S, action: { [x: string]: string }) => ({
    ...state,
    ...action,
  })
  const [state, dispatch] = React.useReducer(stateReducer, initialState)

  const [errors, setErrors] = useState<object>({})
  const [rowsErrors, setRowsErrors] = useState<ErrorSummaryProps['rowsErrors']>({})
  
  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ [name]: value })
  }

  const [showSummary, setShowSummary] = useState<Boolean>(false)
  const [showDetails, setShowDetails] = useState(false)

  const [periods] = useState<Array<string>>(p)
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYearsCategories[0])
  const [rows, setRows] = useState<Array<Row>>([{
    id: uniqid(),
    category: taxYear.categories[0],
    period: periods[0],
    gross: '',
    number: '0',
    ee: '0',
    er: '0'
  }])

  const [netContributionsTotal, setNetContributionsTotal] = useState<number>(0)
  const [employeeContributionsTotal, setEmployeeContributionsTotal] = useState<number>(0)
  const [employerContributionsTotal, setEmployerContributionsTotal] = useState<number>(0)

  const [underpaymentNet, setUnderpaymentNet] = useState<number>(0)
  const [overpaymentNet, setOverpaymentNet] = useState<number>(0)
  
  const [underpaymentEmployee, setUnderpaymentEmployee] = useState<number>(0)
  const [overpaymentEmployee, setOverpaymentEmployee] = useState<number>(0)
  
  const [underpaymentEmployer, setUnderpaymentEmployer] = useState<number>(0)
  const [overpaymentEmployer, setOverpaymentEmployer] = useState<number>(0)

  const [niPaidNet, setNiPaidNet] = useState<string>('0')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('0')
  const [niPaidEmployer, setNiPaidEmployer] = useState<number>(0)

  // Directorship state
  // const [directorshipFrom, setDirectorshipFrom] = useState<>()
  // from
  const [dirFromDay, setDirFromDay] = useState<string>('')
  const [dirFromMonth, setDirFromMonth] = useState<string>('')
  const [dirFromYear, setDirFromYear] = useState<string>('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
  }

  const runCalcs = (r: Row[], ty: Date) => {
  }

  const resetTotals = () => {
  }

  return (
    <main id="main-content" role="main">
      {showSummary ?
        <p>Save and print</p>
        :
        <>
          <h1>Directors contributions</h1>
          <form onSubmit={handleSubmit} noValidate>

            <div className="clear">
              <h2 className="govuk-heading-m details-heading">Details</h2>
              <button 
                type="button" 
                className={`toggle icon ${showDetails ? 'arrow-up' : 'arrow-right'}`}
                onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? 'Close details' : 'Open details'}
              </button>
            </div>

            {showDetails ? 
              <Details
                fullName={state.fullName}
                ni={state.ni}
                reference={state.reference}
                preparedBy={state.preparedBy}
                date={state.date}
                handleChange={handleChange}
              /> : null
            }

            <div className="form-group table-wrapper">
              <DirectorsTable 
                runCalcs={runCalcs}
                errors={errors}
                rowsErrors={rowsErrors}
                resetTotals={resetTotals}
                rows={rows}
                setRows={setRows}
                periods={periods}
                taxYear={taxYear}
                setTaxYear={setTaxYear}
                setShowSummary={setShowSummary}
              />
            </div>

            <Totals 
              grossPayTally={false}
              niPaidNet={niPaidNet}
              setNiPaidNet={setNiPaidNet}
              niPaidEmployee={niPaidEmployee}
              setNiPaidEmployee={setNiPaidEmployee}
              niPaidEmployer={niPaidEmployer}
              errors={errors}
              netContributionsTotal={netContributionsTotal}
              employeeContributionsTotal={employeeContributionsTotal}
              employerContributionsTotal={employerContributionsTotal}
              underpaymentNet={underpaymentNet}
              overpaymentNet={overpaymentNet}
              underpaymentEmployee={underpaymentEmployee}
              overpaymentEmployee={overpaymentEmployee}
              underpaymentEmployer={underpaymentEmployer}
              overpaymentEmployer={overpaymentEmployer}
              isSaveAndPrint={false}
            />

          </form>
        </>
      }

    </main>
  )
}

export default Directors