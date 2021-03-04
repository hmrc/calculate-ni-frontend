import React, {useContext, useState} from 'react'
import {hasKeys} from "../../../services/utils";
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";
import Details from "../shared/Details";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import {Class3Context, class3DefaultRows, useClass3Form} from "./Class3Context";
import Class3Form from "./Class3Form";
import {stripCommas, validateClass3Payload} from "../../../validation/validation";
import Class3Print from './Class3Print'
import {useDocumentTitle} from "../../../services/useDocumentTitle";

const pageTitle = 'Weekly contribution conversion'

const Class3Page = () => {
    const [showSummary, setShowSummary] = useState<boolean>(false)
    const {
        taxYears,
        rows,
        setRows,
        details,
        setDetails,
        errors,
        setErrors,
        setActiveRowId,
        WeeklyContributionsCalculator
    } = useContext(Class3Context)
    const titleWithPrefix = hasKeys(errors) ? 'Error: ' + pageTitle : pageTitle
    useDocumentTitle(titleWithPrefix)

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        setActiveRowId(null)
        submitForm(false)
    }
    const handleShowSummary = (event: React.FormEvent) => {
        event.preventDefault()
        submitForm(true)
    }

    const submitForm = (showSummaryIfValid: boolean) => {
        setErrors({})
        const payload = {
            rows
        }

        if(validateClass3Payload(payload, setErrors)) {
            rows.map(row => {
                row.actualWeeks = WeeklyContributionsCalculator
                  .calculate(
                    row.dateRange.from,
                    row.dateRange.to
                  )
                return row
            })
            setShowSummary(showSummaryIfValid)
        }
    }

    const handleChange = ({
          currentTarget: { name, value },
      }: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ [name]: value })
    }

    const resetTotals = () => {
        setRows(class3DefaultRows)
    }

    return (
      <div>
          {showSummary ?
            <Class3Print
                title={pageTitle}
                setShowSummary={setShowSummary}
            />
            :
            <>
                {hasKeys(errors) &&
                    <ErrorSummary
                      errors={errors}
                    />
                }
                <h1>{pageTitle}</h1>

                <Details
                  details={details}
                  handleChange={handleChange}
                />

                <form onSubmit={handleSubmit} noValidate>
                    <Class3Form
                      resetTotals={resetTotals}
                    />
                </form>

                <div className="container section--top">
                    <div className="form-group">
                        <SecondaryButton
                          label="Save and print"
                          onClick={handleShowSummary}
                        />
                    </div>
                </div>
            </>
          }

          {showSummary && (
            <div className="govuk-!-padding-bottom-9 section--top">
                <button className="button" onClick={() => window.print()}>
                    Save and print
                </button>
            </div>
          )}
      </div>
    )
}

const Class3 = () => {
    return (
      <Class3Context.Provider value={useClass3Form()}>
          <Class3Page/>
      </Class3Context.Provider>
    )
}

export default Class3
