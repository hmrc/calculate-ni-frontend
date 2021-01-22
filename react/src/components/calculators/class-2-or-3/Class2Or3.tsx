import React, {useState, useContext} from 'react'
import {validateClass2Or3Payload} from '../../../validation/validation'

// components
import Details from '../shared/Details'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'
import Class2Or3Form from './Class2Or3Form'
import Class2Or3Results from './Class2Or3Results'
import Class2Or3Print from './Class2Or3Print'

// types
import {Class2Or3Context, useClass2Or3Form} from './Class2Or3Context'
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";
import {hasKeys} from "../../../services/utils";

const pageTitle = 'Class 2 or 3 NI contributions needed for a qualifying year'

const Class2Or3Page = () => {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const {
    ClassOneCalculator,
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
      activeClass
    }

    if(validateClass2Or3Payload(payload, setErrors)) {
      const resultFromCalculator = payload.activeClass === 'Class 2' ?
        ClassOneCalculator.calculateClassTwo(
          payload.taxYear.from,
          payload.paymentEnquiryDate,
          parseFloat(payload.earningsFactor)
        )
        :
        ClassOneCalculator.calculateClassThree(
          payload.taxYear.from,
          payload.paymentEnquiryDate,
          parseFloat(payload.earningsFactor)
        )

      setResult(JSON.parse(resultFromCalculator))

      if(showSummaryIfValid) {
        setShowSummary(true)
      }

    }
  }

  return (
    <main>
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
    
    </main>
  )
}

const Class2Or3 = () => (
  <Class2Or3Context.Provider value={useClass2Or3Form()}>
    <Class2Or3Page />
  </Class2Or3Context.Provider>
)

export default Class2Or3
