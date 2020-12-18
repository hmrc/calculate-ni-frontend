import React, { isValidElement, useState } from 'react'
import uniqid from 'uniqid';
import isEmpty from 'lodash/isEmpty'
import validateInput from '../../../validation/validation'
import configuration from '../../../configuration.json'
import { ClassOne } from '../../../calculation'
import { taxYearsCategories, periods as p, calcOverUnderPayment, calcNi } from '../../../config'


// components
import Details from '../../Details'
import DirectorsTable from '../directors/DirectorsTable'
import Totals from '../../Totals'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'

// types
import { DirectorsS, Row, ErrorSummaryProps, TaxYear } from '../../../interfaces'
type PeriodValues = "ANNUAL" | "PRO RATA" | null;

function Directors() {
  const initialState = {
    fullName: '',
    ni: '',
    reference: '',
    preparedBy: '',
    date: '',
    directorshipFromDay: '',
    directorshipFromMonth: '',
    directorshipFromYear:'',
    directorshipToDay: '',
    directorshipToMonth: '',
    directorshipToYear:''
  }
  const stateReducer = (state: DirectorsS, action: { [x: string]: string }) => ({
    ...state,
    ...action,
  })
  const [state, dispatch] = React.useReducer(stateReducer, initialState)
  const [earningsPeriod, setEarningsPeriod] = useState<PeriodValues>(null)

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

  const [grossTotal, setGrossTotal] = useState<Number | null>(null)

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
  }

  const runCalcs = (r: Row[], ty: Date) => {
    if (isValid()) {
      const c = new ClassOne(JSON.stringify(configuration));

      setGrossTotal(rows.reduce((c, acc) => {
        return c += parseInt(acc.gross)
      }, 0))

      const calculations = r
        .map((r, i) => {
          let res: any;

          if (earningsPeriod === "ANNUAL") {
            res = JSON.parse(c.calculate(ty, parseFloat(r.gross), r.category, 'Ann', 1, false))
          } else {
            const from = new Date(`${state.directorshipFromYear}, ${state.directorshipFromMonth}, ${state.directorshipFromDay}`)
            const to = new Date(`${state.directorshipToYear}, ${state.directorshipToMonth}, ${state.directorshipToDay}`)
            res = JSON.parse(c.calculateProRata(from, to, parseFloat(r.gross), r.category, false))
          }
          console.log('---')
          console.log(res)
          console.log('---')

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

  const handlePeriodChange = (value: string) => {
    const p = value.toUpperCase().split('-').join(" ") as PeriodValues
    setEarningsPeriod(p)
  }

  const resetTotals = () => {
  }

  return (
    <main id="main-content" role="main">
      {showSummary ?
        <p>Save and print</p>
        :
        <>
          {(!isEmpty(errors) || !isEmpty(rowsErrors)) &&
            <ErrorSummary
              errors={errors}
              rowsErrors={rowsErrors}
            />
          }

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
                directorshipFromDay={state.directorshipFromDay}
                directorshipFromMonth={state.directorshipFromMonth}
                directorshipFromYear={state.directorshipFromYear}
                directorshipToDay={state.directorshipToDay}
                directorshipToMonth={state.directorshipToMonth}
                directorshipToYear={state.directorshipToYear}
                handleChange={handleChange}
                earningsPeriod={earningsPeriod}
                handlePeriodChange={handlePeriodChange}
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