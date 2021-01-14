import React, {useState, useContext} from 'react'
import {validateClass2Or3Payload} from '../../../validation/validation'

// components
import Details from '../shared/Details'
import SecondaryButton from '../../helpers/gov-design-system/SecondaryButton'
import Class2Or3Form from './Class2Or3Form'

// types
import {Class2Or3Context} from './Class2Or3Context'

const pageTitle = 'Class 2 or 3 NI contributions needed for a qualifying year'

function Class2Or3() {
  const [showSummary, setShowSummary] = useState<boolean>(false)
  const {
    details,
    setDetails,
    paymentEnquiryDate,
    earningsFactor,
    setEarningsFactor,
    errors,
    setErrors
  } = useContext(Class2Or3Context)

  const handleChange = ({
    currentTarget: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ [name]: value })
  }

  const handleEarningsaFactorChange = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setEarningsFactor(value)
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
      paymentEnquiryDate
    }

    if(validateClass2Or3Payload(payload, setErrors)) {
      
    }
  }

  return (
    <main>
      {showSummary ?
        <p>summary</p>
        :
        <>
          <h1>{pageTitle}</h1>

          <Details
            details={details}
            handleChange={handleChange}
          />

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group table-wrapper">
              <Class2Or3Form
                earningsFactor={earningsFactor}
                handleEarningsaFactorChange={handleEarningsaFactorChange}
              />
            </div>
          </form>

          <SecondaryButton
            label="Save and print"
            onClick={handleShowSummary}
          />
        </>
      }
    
    </main>
  )
}

export default Class2Or3