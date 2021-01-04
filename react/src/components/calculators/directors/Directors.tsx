import React, {useState} from 'react'
import {RowsErrors, GenericErrors, validateDirectorsPayload} from '../../../validation/validation'
import configuration from '../../../configuration.json'
import {ClassOne} from '../../../calculation'
import {PeriodLabel, PeriodValue, taxYearsCategories, taxYearString} from '../../../config'

// components
import Details from '../../Details'
import DirectorsTable from '../directors/DirectorsTable'
import Totals from '../../Totals'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import {updateRowInResults} from "../../../services/utils";
import DirectorsPrintView from "./DirectorsPrintView";

// types
import {
  Calculated,
  DirectorsRow,
  DirectorsS,
  GovDateRange,
  TaxYear
} from '../../../interfaces'

const pageTitle = 'Directors’ contributions'

function Directors() {
  console.log('render directors')
  const initialState = {
    fullName: '',
    ni: '',
    reference: '',
    preparedBy: '',
    date: ''
  }
  const stateReducer = (state: DirectorsS, action: { [x: string]: string }) => ({
    ...state,
    ...action,
  })
  const [state, dispatch] = React.useReducer(stateReducer, initialState)
  const [earningsPeriod, setEarningsPeriod] = useState<PeriodLabel | null>(null)
  const [errors, setErrors] = useState<GenericErrors>({})
  const [rowsErrors, setRowsErrors] = useState<RowsErrors>({})
  const [reset, setReset] = useState<boolean>(false)
  const defaultRows: Array<DirectorsRow> = [{
    id: 'directorsInput',
    category: taxYearsCategories[0].categories[0],
    gross: '',
    ee: '0',
    er: '0'
  }]

  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const [showDetails, setShowDetails] = useState(false)
  const [taxYear, setTaxYear] = useState<TaxYear>(taxYearsCategories[0])
  const [rows, setRows] = useState<Array<DirectorsRow>>(defaultRows)
  const [grossTotal, setGrossTotal] = useState<Number | null>(null)
  const [dateRange, setDateRange] = useState<GovDateRange>({from: null, to: null})

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ [name]: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setErrors({})
    setRowsErrors({})
    const payload = {
      rows: rows,
      niPaidEmployee: '', // not sure this should be in this payload
      niPaidNet: '', // not sure this should be in this payload
      dateRange: dateRange,
      earningsPeriod: earningsPeriod
    }

    if(validateDirectorsPayload(payload, setErrors, setRowsErrors)) {
      setCalculatedRows(
        calculateRows(rows as DirectorsRow[], taxYear.from) as Calculated[]
      )
    }
  }

  const calculateRows = (rows: Array<DirectorsRow>, taxYear: Date) => {
    const classOneCalculator = new ClassOne(JSON.stringify(configuration));

    setGrossTotal(rows.reduce((grossTotal, nextRow) => {
      return grossTotal + parseInt(nextRow.gross)
    }, 0))

    return rows.map((row: DirectorsRow, index: number) => {
        let calculatedRow: Calculated;
        if (earningsPeriod === PeriodLabel.ANNUAL) {
          calculatedRow = JSON.parse(classOneCalculator
            .calculate(
              taxYear,
              parseFloat(row.gross),
              row.category,
              PeriodValue.ANNUAL,
              1,
              false
            ))
        } else {
          calculatedRow = JSON.parse(classOneCalculator
            .calculateProRata(
              dateRange.from,
              dateRange.to,
              parseFloat(row.gross),
              row.category,
              false
            ))
        }

        setRows(prevState => updateRowInResults(prevState, calculatedRow, index))

        return calculatedRow
      }) as Calculated[]
    }

  const handlePeriodChange = (value: any) => {
    resetTotals()
    setEarningsPeriod(value as PeriodLabel)
  }

  const resetTotals = () => {
    setErrors({})
    setRowsErrors({})
    setRows(defaultRows)
    setCalculatedRows([])
    setReset(true)
    setGrossTotal(0)
  }

  return (
    <main>
      {showSummary ?
        <DirectorsPrintView
          title={pageTitle}
          setShowSummary={setShowSummary}
          details={state}
          taxYearString={taxYearString(taxYear)}
          taxYear={taxYear}
          earningsPeriod={earningsPeriod}
          rows={rows}
          grossTotal={grossTotal}
          calculatedRows={calculatedRows}
          reset={reset}
          setReset={setReset}
        />
        :
        <>
          {(Object.keys(errors).length > 0 || Object.keys(rowsErrors).length > 0) &&
            <ErrorSummary
              errors={errors}
              rowsErrors={rowsErrors}
            />
          }

          <h1>{pageTitle}</h1>
          <div className="clear">
            <h2 className="govuk-heading-m details-heading">Details</h2>
            <button
              type="button"
              className={`toggle icon ${showDetails ? 'arrow-up' : 'arrow-right'}`}
              onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? 'Close details' : 'Open details'}
            </button>
          </div>

          {showDetails &&
            <Details
              fullName={state.fullName}
              ni={state.ni}
              reference={state.reference}
              preparedBy={state.preparedBy}
              date={state.date}
              handleChange={handleChange}
            />
          }
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group table-wrapper">
              <DirectorsTable
                errors={errors}
                rowsErrors={rowsErrors}
                resetTotals={resetTotals}
                rows={rows}
                setRows={setRows}
                taxYear={taxYear}
                setTaxYear={setTaxYear}
                setShowSummary={setShowSummary}
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleChange={handleChange}
                earningsPeriod={earningsPeriod}
                handlePeriodChange={handlePeriodChange}
              />
            </div>
          </form>
        </>
      }
      <Totals
        grossPayTally={showSummary}
        errors={errors}
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

export default Directors
