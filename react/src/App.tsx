import React, { useState, useEffect } from 'react';
import uniqid from 'uniqid';
import validateInput from './validation/validation'
import configuration from './configuration.json'
import { ClassOne } from './calculation'
import { calcOverUnderPayment, calcNi } from './config'
import { categories as c, periods as p, fpn, fcn, taxYearString } from './config';

// types
import { S, Row, ErrorSummaryProps } from './interfaces'

// css
import './gov-polyfill.css';
import './App.css';
import './Forms.css';
import './Tables.css'
import './Errors.css';

// img
import logo from '../src/logo.png';

import Details from './components/Details'
import Table from './components/Table'
import Totals from './components/Totals'

function App() {    
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

  const [periods] = useState<Array<string>>(p)
  const [categories] = useState<Array<string>>(c)
  const [rows, setRows] = useState<Array<Row>>([{
    id: uniqid(),
    category: categories[0],
    period: periods[0],
    qty: '1',
    gross: '0'
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

  const [niPaidNet, setNiPaidNet] = useState<string>('')
  const [niPaidEmployee, setNiPaidEmployee] = useState<string>('')
  const [niPaidEmployer, setNiPaidEmployer] = useState<number>(0)

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
    } 
    return isValid
  }

  const resetTotals = () => {
    setNetContributionsTotal(0)
    setEmployeeContributionsTotal(0)
    setEmployerContributionsTotal(0)
  }

  const runCalcs = (r: Row[], t: Number, ty: Date) => {

    if (isValid()) {
      const c = new ClassOne(JSON.stringify(configuration));
      setGrossTotal(t)

      const calculations = r.map(r => JSON.parse(c.calculate(ty, parseInt(r.gross), r.category, r.period, parseInt(r.qty), false)))

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
    <div className="App">

      <header>
        <img src={logo} className="App-logo" alt="logo" />
      </header>

      <form onSubmit={handleSubmit} noValidate>
        
        <fieldset className="details">
          <legend className="float-left">Details</legend>
          <button 
            type="button" 
            className="toggle"
            onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Close details' : 'Open details'}
          </button>

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
        </fieldset>

        <div className="form-group table-wrapper">
          <Table 
            runCalcs={runCalcs}
            errors={errors}
            rowsErrors={rowsErrors}
            resetTotals={resetTotals}
            rows={rows}
            setRows={setRows}
            categories={categories}
            periods={periods}
          />
        </div>

        <Totals 
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
        />

      </form>
    </div>
  );
}

export default App;
