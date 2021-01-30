import React, {useContext, useState} from 'react'
import {hasKeys} from "../../../services/utils";
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";
import Details from "../shared/Details";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import {validateUnofficialDefermentPayload} from "../../../validation/validation";
import {UnofficialDefermentContext, useUnofficialDefermentForm} from "./UnofficialDefermentContext";
import UnofficialDefermentForm from "./UnofficialDefermentForm";

const pageTitle = 'Class 1 NI contributions an employer owes due to unofficial deferment'

function UnofficialDefermentPage() {
    const [showSummary, setShowSummary] = useState<boolean>(false)
    const {
        ClassOneCalculator,
        taxYear,
        defaultRow,
        rows,
        setRows,
        errors,
        setErrors,
        details,
        setDetails,
        setCalculatedRows,
        setActiveRowId
    } = useContext(UnofficialDefermentContext)

    const handleDetailsChange = ({
         currentTarget: { name, value },
     }: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ [name]: value })
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        setActiveRowId(null)
        submitForm(false)
    }

    const submitForm = (showSummaryIfValid: boolean) => {
        setErrors({})
        const payload = {
            rows: rows,
            taxYear: taxYear
        }

        if (validateUnofficialDefermentPayload(payload, setErrors)) {

            if (showSummaryIfValid) {
                setShowSummary(true)
            }
        }
    }

    const handleShowSummary = (event: React.FormEvent) => {
        event.preventDefault()
        setActiveRowId(null)
        submitForm(true)
    }

    const resetTotals = () => {
        setActiveRowId(null)
        setErrors({})
        setRows([defaultRow])
        setCalculatedRows([])
    }

    return (
      <div>
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
                  handleChange={handleDetailsChange}
                />

                <form onSubmit={handleSubmit} noValidate>
                    <UnofficialDefermentForm resetTotals={resetTotals} />
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
      </div>
    )
}

const UnofficialDeferment = function () {
    return (
      <UnofficialDefermentContext.Provider value={useUnofficialDefermentForm()}>
          <UnofficialDefermentPage />
      </UnofficialDefermentContext.Provider>
    )
}

export default UnofficialDeferment