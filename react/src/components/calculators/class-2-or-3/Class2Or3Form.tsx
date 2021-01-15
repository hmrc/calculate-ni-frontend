import React, {useContext, useState, useEffect} from 'react'
import {validDateParts} from '../../../services/utils'

// components
import TextInput from '../../helpers/formhelpers/TextInput'
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear'
import DateInputs from '../../helpers/formhelpers/DateInputs'
import Radios from '../../helpers/formhelpers/Radios'

// types
import {Class2Or3Context} from './Class2Or3Context'
import CurrencyInput from "../../helpers/gov-design-system/CurrencyInput";


function Class2Or3Form() {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const {
    earningsFactor,
    setEarningsFactor,
    activeClass,
    setActiveClass,
    class2TaxYears,
    class3TaxYears,
    taxYear,
    setTaxYear, 
    setPaymentEnquiryDate,
    errors
  } = useContext(Class2Or3Context)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const taxYears = activeClass === 'Class 2' ? class2TaxYears : class3TaxYears
    setTaxYear(taxYears.find(ty => ty.id === e.target.value) || taxYears[0])
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
        items={['Class 2', 'Class 3']}
        conditionalRevealChildren={[
          <SelectTaxYear
            taxYears={class2TaxYears}
            taxYear={taxYear}
            handleTaxYearChange={handleTaxYearChange}
          />,
          <SelectTaxYear
            taxYears={class3TaxYears}
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

      <CurrencyInput
        id="earningsFactor"
        label="Total earnings factor"
        value={earningsFactor}
        error={errors.earningsFactor}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEarningsFactor(e.target.value)}
        hint="This must include an element of Class 1"
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