import React, {useContext, useState, useEffect} from 'react'
import { appConfig } from '../../../config'
import {validDateParts} from '../../../services/utils'

// components
import TextInput from '../../helpers/formhelpers/TextInput'
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear'
import DateInputs from '../../helpers/formhelpers/DateInputs'
import Radios from '../../helpers/formhelpers/Radios'

// types
import {Class2Or3FormProps} from '../../../interfaces'
import {Class2Or3Context} from './Class2Or3Context'


function Class2Or3Form(props: Class2Or3FormProps) {
  const {earningsFactor, handleEarningsaFactorChange} = props
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [activeClass, setActiveClass] = useState('')
  const {
    taxYear,
    setTaxYear, 
    setPaymentEnquiryDate,
    errors
  } = useContext(Class2Or3Context)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxYear(appConfig.taxYears[appConfig.taxYears.findIndex(ty => ty.id === e.target.value)])
  }

  useEffect(() => {
    const paymentEnquiryDate = validDateParts(day, month, year) ?
      new Date(`${day}, ${month}, ${year}`) : null
      setPaymentEnquiryDate(paymentEnquiryDate)
  }, [day, month, year, setPaymentEnquiryDate])

  const handleClassChange = (value: string) => {
    setActiveClass(value)
  }

  return (
    <>
      <Radios
        legend="Select the National insurance class"
        name="nationalInsuranceClass"
        items={['Class 1', 'Class 2']}
        conditionalRevealChildren={[
          <SelectTaxYear
            taxYear={taxYear}
            handleTaxYearChange={handleTaxYearChange}
          />,
          <SelectTaxYear
            taxYear={taxYear}
            handleTaxYearChange={handleTaxYearChange}
          />
        ]}
        handleChange={handleClassChange}
        selected={activeClass}
        errors={errors}
      />

      <DateInputs 
        description="payment-enquiry-date"
        legend="Payment/enquiry date"
        day={day}
        month={month}
        year={year}
        setDay={setDay}
        setMonth={setMonth}
        setYear={setYear}
        error={errors.paymentEnquiryDate}
      />

      <TextInput
        labelText="Total earnings factor"
        name="earnings-factor"
        hint="This must include an element of Class 1"
        inputClassName="form-control full"
        inputValue={earningsFactor}
        onChangeCallback={handleEarningsaFactorChange}
      />

      <div className="container">
        <div className="form-group">
          <button className="govuk-button nomar" type="submit">
            Calculate
          </button>
        </div>
      </div>
    </>
    )
}

export default Class2Or3Form