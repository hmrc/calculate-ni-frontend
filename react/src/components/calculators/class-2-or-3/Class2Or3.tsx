import React, {useState, useContext, useEffect, useRef} from 'react'
import {validateClass2Or3Payload} from '../../../validation/validation'
import {hasKeys, isEmpty} from "../../../services/utils";
import {useDocumentTitle} from "../../../services/useDocumentTitle";

// components
import Details from '../shared/Details'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'
import Class2Or3Form from './Class2Or3Form'
import Class2Or3Results from './Class2Or3Results'
import Class2Or3Print from './Class2Or3Print'
import {SuccessNotification} from "../shared/SuccessNotification";
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";

// types
import {Class2Or3Context, useClass2Or3Form} from './Class2Or3Context'
import {SuccessNotificationContext} from '../../../services/SuccessNotificationContext'

const pageTitle = 'Class 2 or 3 NI contributions needed for a qualifying year'

const Class2Or3Page = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const resultRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const {
    ClassTwoCalculator,
    ClassThreeCalculator,
    activeClass,
    taxYear,
    details,
    setDetails,
    paymentEnquiryDate,
    earningsFactor,
    errors,
    setErrors,
    result,
    setResult
  } = useContext(Class2Or3Context)

  const { successNotificationsOn } = useContext(SuccessNotificationContext)

  const titleWithPrefix = hasKeys(errors) ? 'Error: ' + pageTitle : pageTitle
  useDocumentTitle(titleWithPrefix)

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ [name]: value })
  }
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    submitForm(false)
  }
  
  const handleShowSummary = (event: React.FormEvent) => {
    event.preventDefault()
    submitForm(true)
  }

  const submitForm = (showSummaryIfValid: boolean) => {
    setErrors({})
    const payload = {
      paymentEnquiryDate,
      earningsFactor,
      taxYear,
      activeClass,
      finalDate: ClassTwoCalculator.getFinalDate(taxYear.from)
    }

    if(validateClass2Or3Payload(payload, setErrors)) {
      const resultFromCalculator = payload.activeClass === 'Class 2' ?
        ClassTwoCalculator.calculate(
          payload.taxYear.from,
          payload.paymentEnquiryDate,
          parseFloat(payload.earningsFactor)
        )
        :
        ClassThreeCalculator.calculate(
          payload.taxYear.from,
          payload.paymentEnquiryDate,
          parseFloat(payload.earningsFactor)
        )

      setResult(resultFromCalculator)

      if(showSummaryIfValid) {
        setShowSummary(true)
      }

    }
  }

  useEffect(() => {
    if(successNotificationsOn && result) {
      resultRef.current.focus()
    }
  }, [result, resultRef, successNotificationsOn])

  return (
    <div>
      <div className="result-announcement" aria-live="polite" ref={resultRef} tabIndex={-1}>
        {successNotificationsOn && result && <SuccessNotification table={false} totals={true} />}
      </div>
      {showSummary ?
        <Class2Or3Print
          title={pageTitle}
          setShowSummary={setShowSummary}
          result={result}
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
            <div className="form-group table-wrapper nomar">
              <Class2Or3Form />
            </div>
          </form>

          <Class2Or3Results />

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

const Class2Or3 = () => (
  <Class2Or3Context.Provider value={useClass2Or3Form()}>
    <Class2Or3Page />
  </Class2Or3Context.Provider>
)

export default Class2Or3
