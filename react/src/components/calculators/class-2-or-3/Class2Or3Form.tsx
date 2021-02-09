import React, {useContext, useEffect} from 'react'
import {validDateParts} from '../../../services/utils'

// components
import SelectTaxYear from '../../helpers/formhelpers/SelectTaxYear'
import DateInputs from '../../helpers/formhelpers/DateInputs'
import Radios from '../../helpers/formhelpers/Radios'

// types
import {Class2Or3Context} from './Class2Or3Context'
import CurrencyInput from "../../helpers/gov-design-system/CurrencyInput";
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";
import {NiClassName} from "../../../config";
import {NiClassNameLabels} from "../../../interfaces";


function Class2Or3Form() {
  const {
    earningsFactor,
    setEarningsFactor,
    activeClass,
    setActiveClass,
    class2TaxYears,
    class3TaxYears,
    taxYear,
    setTaxYear,
    day,
    setDay,
    month,
    setMonth,
    year,
    setYear,
    setPaymentEnquiryDate,
    errors,
    setErrors,
    setResult
  } = useContext(Class2Or3Context)

  const handleTaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    invalidateResult()
    const taxYears = activeClass === NiClassName.CLASS_TWO ? class2TaxYears : class3TaxYears
    setTaxYear(taxYears.find(ty => ty.id === e.target.value) || taxYears[0])
  }

  useEffect(() => {
    invalidateResult()
    const paymentEnquiryDate = validDateParts(day, month, year) ?
      new Date(`${year}-${month}-${day}`) : null
      setPaymentEnquiryDate(paymentEnquiryDate)
  }, [day, month, year, setPaymentEnquiryDate])

  const handleClassChange = (value: NiClassName) => {
    invalidateResult()
    setActiveClass(value)
  }

  const handleClearForm = () => {
    // clear form
    setActiveClass('')
    setPaymentEnquiryDate(null)
    setDay('')
    setMonth('')
    setYear('')
    setEarningsFactor('')

    // clear results
    setResult(null)

    // reset errors
    setErrors({})
  }

  const invalidateResult = () => {
    setResult(null)
  }

  return (
    <>
      <Radios
        legend="Select the National insurance class"
        name="nationalInsuranceClass"
        items={[
          {
            label: NiClassNameLabels[NiClassName.CLASS_TWO],
            value: NiClassName.CLASS_TWO,
            conditionalContent: <SelectTaxYear
              taxYears={class2TaxYears}
              taxYear={taxYear}
              handleTaxYearChange={handleTaxYearChange}
            />
          },
          {
            label: NiClassNameLabels[NiClassName.CLASS_THREE],
            value: NiClassName.CLASS_THREE,
            conditionalContent: <SelectTaxYear
              taxYears={class3TaxYears}
              taxYear={taxYear}
              handleTaxYearChange={handleTaxYearChange}
            />
          }
        ]}
        handleChange={handleClassChange}
        selected={activeClass}
        error={errors.nationalInsuranceClass}
      />

      <DateInputs 
        description="paymentEnquiryDate"
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          invalidateResult()
          setEarningsFactor(e.target.value)
        }}
        hint="This must include an element of Class 1"
      />

      <div className="container container-block">
        <div className="form-group">
          <button className="govuk-button govuk-!-margin-right-1" type="submit">
            Calculate
          </button>
          <SecondaryButton
            label="Clear"
            onClick={handleClearForm}
          />
        </div>
      </div>
    </>
    )
}

export default Class2Or3Form
