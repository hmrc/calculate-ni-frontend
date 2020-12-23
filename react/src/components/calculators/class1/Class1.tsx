import React, {useState} from 'react'
import uniqid from 'uniqid';
import {RowsErrors, validateClassOnePayload} from '../../../validation/validation'
import configuration from '../../../configuration.json'
import { ClassOne } from '../../../calculation'
import {
  taxYearString,
  periods,
  taxYearsCategories, PeriodValue
} from '../../../config'

// types
import {Class1S, Row, TaxYear, Calculated} from '../../../interfaces'

// components
import Details from '../../Details'
import Class1Table from './Class1Table'
import Totals from '../../Totals'
import Class1Print from './Class1Print'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'

// utils
import { updateRowInResults } from "../../../services/utils";

const pageTitle = 'Calculate Class 1 National Insurance (NI) contributions'

function Class1() {
  const initialState = {
    fullName: '',
    ni: '',
    reference: '',
    preparedBy: '',
    date: '',
  }

  const defaultRows = [{
    id: uniqid(),
    category: taxYearsCategories[0].categories[0],
    period: periods[0],
    gross: '',
    number: '0',
    ee: '0',
    er: '0'
  }]

  const stateReducer = (state: Class1S, action: { [x: string]: string }) => ({
    ...state,
    ...action,
  })
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYearsCategories[0])
  const [rows, setRows] = useState<Array<Row>>(defaultRows)
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [rowsErrors, setRowsErrors] = useState<RowsErrors>({})
  const [showDetails, setShowDetails] = useState(false)
  const [state, dispatch] = React.useReducer(stateReducer, initialState)
  const [grossTotal, setGrossTotal] = useState<Number | null>(null)
  const [reset, setReset] = useState<boolean>(false)

  const [showSummary, setShowSummary] = useState<boolean>(false)

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ [name]: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setRowsErrors({})
    const payload = {
      rows: rows
    }

    if (validateClassOnePayload(payload, setRowsErrors)) {
      setCalculatedRows(
        calculateRows(rows as Row[], taxYear.from) as Calculated[]
      )
    }
  }

  const resetTotals = () => {
    setRowsErrors({})
    setRows(defaultRows)
    setCalculatedRows([])
    setReset(true)
    setGrossTotal(0)
  }

  const calculateRows = (rows: Row[], taxYear: Date) => {
    const classOneCalculator = new ClassOne(JSON.stringify(configuration));

    setGrossTotal(rows.reduce((grossTotal, row) => {
      return grossTotal + parseFloat(row.gross)
    }, 0))

    return rows
      .map((row, i) => {
        const rowPeriod = (row.period === PeriodValue.FORTNIGHTLY ? PeriodValue.WEEKLY : row.period)
        const rowPeriodQty = (row.period === PeriodValue.FORTNIGHTLY ? 2 : 1)
        const calculatedRow = JSON.parse(
          classOneCalculator
            .calculate(
              taxYear,
              parseFloat(row.gross),
              row.category,
              rowPeriod,
              rowPeriodQty,
              false
            )
        )

        setRows(prevState =>
          updateRowInResults(prevState, calculatedRow, i)
        )

        return calculatedRow
      }) as Calculated[]
  }

  return (
    <main>
      {showSummary ?
        <Class1Print
          title={pageTitle}
          setShowSummary={setShowSummary}
          details={state}
          taxYearString={taxYearString(taxYear)}
          taxYear={taxYear}
          rows={rows}
          grossTotal={grossTotal}
          calculatedRows={calculatedRows}
          reset={reset}
          setReset={setReset}
        />
      :
        <>

          {Object.keys(rowsErrors).length > 0 &&
            <ErrorSummary
              errors={{}}
              rowsErrors={rowsErrors}
            />
          }

          <h1>{pageTitle}</h1>
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
                errors={{}}
                rowsErrors={rowsErrors}
                resetTotals={resetTotals}
                rows={rows}
                setRows={setRows}
                taxYear={taxYear}
                setTaxYear={setTaxYear}
                setShowSummary={setShowSummary}
              />
            </div>

          </form>
        </>
      }
      <Totals
        grossPayTally={showSummary}
        errors={null}
        calculatedRows={calculatedRows}
        isSaveAndPrint={showSummary}
        reset={reset}
        setReset={setReset}
      />
      {showSummary && (
        <div className="govuk-!-padding-bottom-9">
          <button className="button" onClick={() => window.print()}>
            Save and print
          </button>
        </div>
      )}
    </main>
  )
}

export default Class1