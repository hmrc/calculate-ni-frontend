import React, {useContext, useState} from 'react'
import {hasKeys} from "../../../services/utils";
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";
import Details from "../shared/Details";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import {Class3Context, class3DefaultRows, useClass3Form} from "./Class3Context";
import Class3Form from "./Class3Form";
import {validateClass3Payload} from "../../../validation/validation";
import {Class3Row} from "../../../interfaces";

const pageTitle = 'Weekly contribution conversion'

const Class3Page = () => {
    const [showSummary, setShowSummary] = useState<boolean>(false)
    const {
        rows,
        setRows,
        details,
        setDetails,
        enteredNiDate,
        errors,
        setErrors,
        setActiveRowId
    } = useContext(Class3Context)
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
            enteredNiDate,
            rows
        }
        if(validateClass3Payload(payload, setErrors)) {
            rows.map(stubCalc)
            setShowSummary(showSummaryIfValid)
        }
    }

    // TODO: this is a stub until Frontend.scala provides method
    const stubCalc = (row: Class3Row) => {
        const NOMINAL_AMOUNT_PER_WEEK = 71
        const maxWeeks = row.dateRange.numberOfWeeks || 52
        const actualWeeks = (Math.ceil(parseInt(row.earningsFactor) / NOMINAL_AMOUNT_PER_WEEK))
        const deficiency = maxWeeks - actualWeeks
        row.maxWeeks = maxWeeks
        row.actualWeeks = actualWeeks > 52 ? 52 : actualWeeks
        row.deficiency = deficiency > 0 ? deficiency : 0
        return row
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
      <main>
          {showSummary ?
            <p>Print view</p>
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

      </main>
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
