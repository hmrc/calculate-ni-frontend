import React, {useState, useContext} from 'react'
import {validateClass2Or3Payload} from '../../../validation/validation'

// components
import Details from '../shared/Details'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'
import Class2Or3Form from './Class2Or3Form'

// types
import {Class2Or3Context} from './Class2Or3Context'
import ErrorSummary from "../../helpers/gov-design-system/ErrorSummary";
import {hasKeys} from "../../../services/utils";

const pageTitle = 'Class 2 or 3 NI contributions needed for a qualifying year'

export default function Class2Or3() {
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
    setShowSummary(true)
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
        <p>summary</p>
        :
        <>
          {hasKeys(errors) &&
            <ErrorSummary
              errors={errors}
              rowsErrors={{}}
            />
          }
          <h1>{pageTitle}</h1>

          <Details
            details={details}
            handleChange={handleChange}
          />

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group table-wrapper">
              <Class2Or3Form />
            </div>
          </form>

          <SecondaryButton
            label="Save and print"
            onClick={handleShowSummary}
          />

          <div className="results divider--top">
            <div className="container">
              <div className="container column third">
                <span className="inline block">Contributions due:</span>
                <div className="value inline width-3">
                  {result?.contributionsDue}
                </div>
              </div>
              <div className="container column third">
                <span className="inline block">Class (x) rate:</span>
                <div className="value inline width-8">
                  {result?.rate}
                </div>
              </div>
              <div className="container column third">
                <span className="inline block">Total amount due:</span>
                <span className="value inline width-8">
                  {result?.totalAmountDue}
                </span>
              </div>
            </div>

            <div className="container column">
              <span className="label block">Date higher rate provisions apply:</span>
              <div className="value inline width-8">
                {result?.dateHigherRateApply}
              </div>
            </div>

            <div className="container column">
              <span className="label block">Final payment date for pension purposes:</span>
              <div className="value inline width-8">
                {result?.finalPaymentDate}
              </div>
            </div>
          </div>
        </>
      }
    
    </main>
  )
}
