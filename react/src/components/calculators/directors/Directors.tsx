import React, {useContext, useState} from 'react'
import {validateDirectorsPayload} from '../../../validation/validation'
import configuration from '../../../configuration.json'
import {ClassOne} from '../../../calculation'
import {PeriodLabel, PeriodValue} from '../../../config'

// components
import Details from '../shared/Details'
import DirectorsForm from './DirectorsForm'
import Totals from '../shared/Totals'
import ErrorSummary from '../../helpers/gov-design-system/ErrorSummary'
import DirectorsPrintView from "./DirectorsPrintView";

// types
import {Calculated, Calculators, DirectorsRow, GovDateRange,} from '../../../interfaces'
import {defaultRows, DirectorsContext} from "./DirectorsContext";

// services
import {updateRowInResults} from "../../../services/utils";

const pageTitle = 'Directors’ contributions'

function Directors() {
  const [calculatedRows, setCalculatedRows] = useState<Array<Calculated>>([])
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<GovDateRange>({from: null, to: null})
  const {
    taxYear,
    rows,
    setRows,
    errors,
    setErrors,
    rowsErrors,
    setRowsErrors,
    details,
    setDetails,
    niPaidNet,
    niPaidEmployee,
    setNiPaidEmployee,
    setNiPaidNet,
    earningsPeriod,
    setEarningsPeriod
  } = useContext(DirectorsContext)

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ [name]: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setErrors({})
    setRowsErrors({})
    const payload = {
      rows: rows,
      niPaidEmployee: niPaidEmployee,
      niPaidNet: niPaidNet,
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

        setRows(updateRowInResults(rows, calculatedRow, index))

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
    setNiPaidEmployee('')
    setNiPaidNet('')
  }

  return (
    <main>
      {showSummary ?
        <DirectorsPrintView
          title={pageTitle}
          setShowSummary={setShowSummary}
          calculatedRows={calculatedRows}
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

          <Details
            details={details}
            handleChange={handleChange}
          />

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group table-wrapper">
              <DirectorsForm
                resetTotals={resetTotals}
                setShowSummary={setShowSummary}
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleChange={handleChange}
                handlePeriodChange={handlePeriodChange}
              />
            </div>
          </form>
        </>
      }
      <Totals
        grossPayTally={showSummary}
        calculatedRows={calculatedRows}
        isSaveAndPrint={showSummary}
        type={Calculators.DIRECTORS}
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
