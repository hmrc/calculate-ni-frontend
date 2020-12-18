import React, { useState, useEffect } from 'react'
import uniqid from 'uniqid';
import isEmpty from 'lodash/isEmpty'
import validateInput from '../../../validation/validation'
import configuration from '../../../configuration.json'
import { ClassOne } from '../../../calculation'
import { 
  calcOverUnderPayment, 
  calcNi, 
  taxYearString, 
  periods as p, 
  taxYearsCategories } from '../../../config'

// types
import { Class1S, Row, ErrorSummaryProps, TaxYear } from '../../../interfaces'

// components
import Details from '../../Details'
import Class1Table from './Class1Table'
import Totals from '../../Totals'
import SavePrint from '../../SavePrint'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'

function Class1() {
  const initialState = {
    fullName: '',
    ni: '',
    reference: '',
    preparedBy: '',
    date: '',
  }

  const stateReducer = (state: Class1S, action: { [x: string]: string }) => ({
    ...state,
    ...action,
  })

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

  const [errors, setErrors] = useState<object>({})
  const [rowsErrors, setRowsErrors] = useState<ErrorSummaryProps['rowsErrors']>({})
  const [showDetails, setShowDetails] = useState(false)
  const [state, dispatch] = React.useReducer(stateReducer, initialState)
  const [grossTotal, setGrossTotal] = useState<Number | null>(null)

  const [niPaidNet, setNiPaidNet] = useState<string>('0')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('0')
  const [niPaidEmployer, setNiPaidEmployer] = useState<number>(0)

  const [showSummary, setShowSummary] = useState<Boolean>(false)

  // update NI Paid Employer after Ni Paid Net & Employee have updated
  useEffect(() => {
    setNiPaidEmployer(parseFloat(niPaidNet) - parseFloat(niPaidEmployee))
  }, [niPaidNet, niPaidEmployee])

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ [name]: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
  }

  const isValid = () => {
    const { errors, rowsErrors, isValid } = validateInput({niPaidNet, niPaidEmployee, rows})
    if (!isValid) {
      setErrors(errors)
      setRowsErrors(rowsErrors)
    } else {
      setErrors({})
      setRowsErrors({})
    } 
    return isValid
  }

  const resetTotals = () => {
    setNiPaidNet('0')
    setNiPaidEmployee('0')

    setNetContributionsTotal(0)
    setEmployeeContributionsTotal(0)
    setEmployerContributionsTotal(0)

    setGrossTotal(0)

    setUnderpaymentNet(0)
    setUnderpaymentEmployee(0)
    setUnderpaymentEmployer(0)

    setOverpaymentNet(0)
    setOverpaymentEmployee(0)
    setOverpaymentEmployer(0)

  }

  const runCalcs = (r: Row[], ty: Date) => {

    if (isValid()) {
      const c = new ClassOne(JSON.stringify(configuration));

      setGrossTotal(rows.reduce((c, acc) => {
        return c += parseInt(acc.gross)
      }, 0))

      const calculations = r
        .map((r, i) => {
          const pd = (r.period === 'Frt' ? 'Wk' : r.period)
          const pdQty = (r.period === 'Frt' ? 2 : 1)
          const res = JSON.parse(c.calculate(ty, parseFloat(r.gross), r.category, pd, pdQty, false))

          // Employee Contributions
          const ee = Object.keys(res).reduce((prev, key) => {
            return prev + res[key][1]
          }, 0).toString()

          // Employer Contributions
          const er = Object.keys(res).reduce((prev, key) => {
            return prev + res[key][2]
          }, 0).toString()

          // Add contributions to each row
          const newRows = [...rows]
          newRows[i].ee = ee
          newRows[i].er = er

          // add the bands data to the row
          newRows[i].bands = res
          
          setRows(newRows)
          
          return res
        })

      // Employee Contributions
      const employee = calcNi(calculations, 1)
      setEmployeeContributionsTotal(employee)
      
      // Employer ContributionsemployeeContributionsTotal
      const employer = calcNi(calculations, 2)
      setEmployerContributionsTotal(employer)

      setNetContributionsTotal(employee + employer)

      setUnderpaymentNet(calcOverUnderPayment((employee + employer) - parseFloat(niPaidNet), 'under'))
      setOverpaymentNet(calcOverUnderPayment((employee + employer) - parseFloat(niPaidNet), 'over'))

      setUnderpaymentEmployee(calcOverUnderPayment(employee - parseFloat(niPaidEmployee), 'under'))
      setOverpaymentEmployee(calcOverUnderPayment(employee - parseFloat(niPaidEmployee), 'over'))

      setUnderpaymentEmployer(calcOverUnderPayment(employer - niPaidEmployer, 'under'))
      setOverpaymentEmployer(calcOverUnderPayment(employer - niPaidEmployer, 'over'))
    }
  }

  return (
    <main id="main-content" role="main">

      {showSummary ?
        <SavePrint
          setShowSummary={setShowSummary}
          details={state}
          taxYearString={taxYearString(taxYear)}
          taxYear={taxYear}
          rows={rows}
          periods={periods}

          grossTotal={grossTotal}
          niPaidNet={niPaidNet}
          setNiPaidNet={setNiPaidNet}
          niPaidEmployee={niPaidEmployee}
          setNiPaidEmployee={setNiPaidEmployee}
          niPaidEmployer={niPaidEmployer}
          netContributionsTotal={netContributionsTotal}
          employeeContributionsTotal={employeeContributionsTotal}
          employerContributionsTotal={employerContributionsTotal}
          underpaymentNet={underpaymentNet}
          overpaymentNet={overpaymentNet}
          underpaymentEmployee={underpaymentEmployee}
          overpaymentEmployee={overpaymentEmployee}
          underpaymentEmployer={underpaymentEmployer}
          overpaymentEmployer={overpaymentEmployer}
        />
      :
        <>

          {(!isEmpty(errors) || !isEmpty(rowsErrors)) &&
            <ErrorSummary
              errors={errors}
              rowsErrors={rowsErrors}
            />
          }

          <h1>Calculate Class 1 National Insurance (NI) contributions</h1>
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
              <Class1Table 
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
              grossPayTally={true}
              grossTotal={grossTotal}
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

export default Class1