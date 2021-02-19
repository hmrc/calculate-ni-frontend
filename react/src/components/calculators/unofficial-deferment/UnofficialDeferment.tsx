import React, {useContext, useEffect, useRef, useState} from 'react'
import {hasKeys, isEmpty} from "../../../services/utils";
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";
import Details from "../shared/Details";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import {validateUnofficialDefermentPayload} from "../../../validation/validation";
import {UnofficialDefermentContext, useUnofficialDefermentForm} from "./UnofficialDefermentContext";
import UnofficialDefermentForm from "./UnofficialDefermentForm";
import UnofficialDefermentTotals from "./UnofficialDefermentTotals";
import UnofficialDefermentPrint from "./UnofficialDefermentPrint";
import {useDocumentTitle} from "../../../services/useDocumentTitle";
import {SuccessNotification} from "../shared/SuccessNotification";
import {SuccessNotificationContext} from '../../../services/SuccessNotificationContext'

const pageTitle = 'Class 1 NI contributions an employer owes due to unofficial deferment'

function UnofficialDefermentPage() {
    const [showSummary, setShowSummary] = useState<boolean>(false)
    const resultRef = useRef() as React.MutableRefObject<HTMLDivElement>
    const {
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
        results
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
            setResults(calculateRows())
            if (showSummaryIfValid) {
                setShowSummary(true)
            }
        }
    }

    const calculateRows = () => ({
        annualMax: '15880',
        liability: '2340',
        difference: '8442',
        ifNotUD: '0'
    })

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
        setResults({})
    }

    useEffect(() => {
        if(results) {
            resultRef.current.focus()
        }
    }, [results, resultRef])

    useEffect(() => {
        if(successNotificationsOn && results) {
            resultRef.current.focus()
        }
    }, [results, resultRef, successNotificationsOn])

    return (
      <div>
          <div className="result-announcement" aria-live="polite" ref={resultRef} tabIndex={-1}>
              {successNotificationsOn && !isEmpty(results) && <SuccessNotification />}
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

                <UnofficialDefermentTotals />

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
