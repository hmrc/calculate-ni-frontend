import React, { useState, useEffect } from 'react';
import uniqid from 'uniqid';
import validateInput from './validation/validation'
import configuration from './configuration.json'
import { ClassOne } from './calculation'
import { 
  calcOverUnderPayment, 
  calcNi, 
  taxYearString, 
  periods as p, 
  taxYearsCategories } from './config'

// types
import { S, Row, ErrorSummaryProps, TaxYear, Calculated } from './interfaces'

// css
import './styles/gov-polyfill.css';
import './styles/App.css';
import './styles/Forms.css';
import './styles/Tables.css'
import './styles/Errors.css';
import './styles/SavePrint.css';

// img
import logo from '../src/logo.png';

import Details from './components/Details'
import Table from './components/Table'
import Totals from './components/Totals'
import SavePrint from './components/SavePrint'

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
  
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYearsCategories[0])
  const [rows, setRows] = useState<Array<Row>>([{
    id: uniqid(),
    category: taxYear.categories[0],
    period: periods[0],
    gross: '0',
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

  const [niData, setNiData] = useState<Calculated[]>([])

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

  const runCalcs = (r: Row[], t: Number, ty: Date) => {

    if (isValid()) {
      const c = new ClassOne(JSON.stringify(configuration));

      setGrossTotal(rows.reduce((c, acc) => {
        return c += parseInt(acc.gross)
      }, 0))

      const calculations = r
        .map((r, i) => {
          // TODO: Remove qty (hard coded as 1 below)
          const res = JSON.parse(c.calculate(ty, parseInt(r.gross), r.category, r.period, 1, false))

          
          const ee = Object.keys(res).reduce((prev, key) => {
            return prev + res[key][1]
          }, 0).toString()

          const er = Object.keys(res).reduce((prev, key) => {
            return prev + res[key][2]
          }, 0).toString()

          const newRows = [...rows]
          newRows[i].ee = ee
          newRows[i].er = er

          // add the bands data to the row
          newRows[i].bands = res
          
          setRows(newRows)
          
          return res
        })

      // TODO: Avoid two calls to calculate (may be superceeded by rows.bands)
      r.map(r => {
        setNiData(prevData => [
          ...prevData, 
          JSON.parse(c.calculate(ty, parseInt(r.gross), r.category, r.period, 1, false))
        ])
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
    <div className="App">
      <div className="main">

        <header>
          <img src={logo} className="App-logo" alt="logo" />
        </header>

        {showSummary ?
          <SavePrint
            setShowSummary={setShowSummary}
            details={state}
            taxYearString={taxYearString(taxYear)}
            taxYear={taxYear}
            rows={rows}
            periods={periods}
            niData={niData}

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
                periods={periods}
                taxYear={taxYear}
                setTaxYear={setTaxYear}
                setShowSummary={setShowSummary}
                niData={niData}
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
              isSaveAndPrint={false}
            />

          </form>

        }
      
      </div>
    </div>
  );
}

export default App;
