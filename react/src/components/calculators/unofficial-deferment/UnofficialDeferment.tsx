import React, {useContext, useEffect, useRef, useState} from 'react'
import {hasKeys} from "../../../services/utils";
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";
import Details from "../shared/Details";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import {validateUnofficialDefermentPayload} from "../../../validation/validation";
import {
    UnofficialDefermentContext, UnofficialDefermentInputRow, UnofficialDefermentRequestRow,
    useUnofficialDefermentForm
} from "./UnofficialDefermentContext";
import UnofficialDefermentForm from "./UnofficialDefermentForm";
import UnofficialDefermentTotals from "./UnofficialDefermentTotals";
import UnofficialDefermentPrint from "./UnofficialDefermentPrint";
import {useDocumentTitle} from "../../../services/useDocumentTitle";
import {SuccessNotification} from "../shared/SuccessNotification";
import {SuccessNotificationContext} from '../../../services/SuccessNotificationContext'
import {UnofficialDefermentRow} from "../../../calculation";

const pageTitle = 'Class 1 NI contributions an employer owes due to unofficial deferment'

function UnofficialDefermentPage() {
    const [showSummary, setShowSummary] = useState<boolean>(false)
    const resultRef = useRef() as React.MutableRefObject<HTMLDivElement>
    const totalsRef = useRef() as React.MutableRefObject<HTMLDivElement>
    const {
        UnofficialDefermentCalculator,
        taxYear,
        defaultRow,
        rows,
        setRows,
        errors,
        setErrors,
        details,
        setDetails,
        setCalculatedRows,
        setActiveRowId,
        setResults,
        results,
        userBands
    } = useContext(UnofficialDefermentContext)

    const { successNotificationsOn } = useContext(SuccessNotificationContext)

    const titleWithPrefix = hasKeys(errors) ? 'Error: ' + pageTitle : pageTitle
    useDocumentTitle(titleWithPrefix)

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
            const requestRows: Array<UnofficialDefermentRequestRow> = rows
              .map((row: UnofficialDefermentInputRow) => new (UnofficialDefermentRow as any)(
                row.id,
                row.nameOfEmployer,
                row.category,
                row.bands,
                parseFloat(row.employeeNICs)
              ))

            const userDefinedBands = userBands.map(b => ({
                label: b.label,
                amount: b.amount
            }))

            setResults(UnofficialDefermentCalculator.calculate(taxYear, requestRows, userDefinedBands))
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
        setResults(null)
    }

    useEffect(() => {
        if(successNotificationsOn && results) {
            resultRef.current.focus()
        } else if (results) {
            totalsRef.current.focus()
        }
    }, [results, resultRef, totalsRef, successNotificationsOn])

    return (
      <div>
          <div className="result-announcement" aria-live="polite" ref={resultRef} tabIndex={-1}>
              {successNotificationsOn && results && <SuccessNotification table={true} totals={true} />}
          </div>
          {showSummary ?
            <UnofficialDefermentPrint
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
                  handleChange={handleDetailsChange}
                />

                <form onSubmit={handleSubmit} noValidate>
                    <UnofficialDefermentForm resetTotals={resetTotals} />
                </form>

                <div tabIndex={-1} className="no-focus-outline" ref={totalsRef}>
                    <UnofficialDefermentTotals />
                </div>

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

const UnofficialDeferment = function() {
    return (
      <UnofficialDefermentContext.Provider value={useUnofficialDefermentForm()}>
          <UnofficialDefermentPage />
      </UnofficialDefermentContext.Provider>
    )
}

export default UnofficialDeferment
