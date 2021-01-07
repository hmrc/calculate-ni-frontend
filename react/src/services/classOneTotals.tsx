import {useContext, useEffect, useState} from 'react';
import {emptyStringToZero, overUnderPaymentDisplay} from "./utils";
import {OverOrUnder} from "../interfaces";
import {ClassOneContext} from "../components/calculators/class1/ClassOneContext";

export const useClassOneTotals = () => {
  const [niPaidEmployer, setNiPaidEmployer] = useState<number>(0)
  const [netContributionsTotal, setNetContributionsTotal] = useState<number>(0)
  const [employeeContributionsTotal, setEmployeeContributionsTotal] = useState<number>(0)
  const [employerContributionsTotal, setEmployerContributionsTotal] = useState<number>(0)
  const [underpaymentNet, setUnderpaymentNet] = useState<number>(0)
  const [overpaymentNet, setOverpaymentNet] = useState<number>(0)
  const [underpaymentEmployee, setUnderpaymentEmployee] = useState<number>(0)
  const [overpaymentEmployee, setOverpaymentEmployee] = useState<number>(0)
  const [underpaymentEmployer, setUnderpaymentEmployer] = useState<number>(0)
  const [overpaymentEmployer, setOverpaymentEmployer] = useState<number>(0)
  const {
    niPaidNet,
    niPaidEmployee
  } = useContext(ClassOneContext)

  useEffect(() => {
    setNiPaidEmployer(emptyStringToZero(niPaidNet) - emptyStringToZero(niPaidEmployee))
  }, [niPaidNet, niPaidEmployee])

  useEffect(() => {
    setNetContributionsTotal(employeeContributionsTotal + employerContributionsTotal)
  }, [employeeContributionsTotal, employerContributionsTotal])

  useEffect(() => {
    setUnderpaymentNet(overUnderPaymentDisplay((netContributionsTotal) - parseFloat(niPaidNet), OverOrUnder.UNDER))
    setOverpaymentNet(overUnderPaymentDisplay((netContributionsTotal) - parseFloat(niPaidNet), OverOrUnder.OVER))
  }, [netContributionsTotal, niPaidNet])

  useEffect(() => {
    setUnderpaymentEmployee(overUnderPaymentDisplay(employeeContributionsTotal - parseFloat(niPaidEmployee), OverOrUnder.UNDER))
    setOverpaymentEmployee(overUnderPaymentDisplay(employeeContributionsTotal - parseFloat(niPaidEmployee), OverOrUnder.OVER))

    setUnderpaymentEmployer(overUnderPaymentDisplay(employerContributionsTotal - niPaidEmployer, OverOrUnder.UNDER))
    setOverpaymentEmployer(overUnderPaymentDisplay(employerContributionsTotal - niPaidEmployer, OverOrUnder.OVER))
  }, [employeeContributionsTotal, employerContributionsTotal, niPaidEmployee, niPaidEmployer])

  return {
    niPaidEmployer,
    setNiPaidEmployer,
    netContributionsTotal,
    setNetContributionsTotal,
    employeeContributionsTotal,
    setEmployeeContributionsTotal,
    employerContributionsTotal,
    setEmployerContributionsTotal,
    underpaymentNet,
    setUnderpaymentNet,
    overpaymentNet,
    setOverpaymentNet,
    underpaymentEmployee,
    setUnderpaymentEmployee,
    overpaymentEmployee,
    setOverpaymentEmployee,
    underpaymentEmployer,
    setUnderpaymentEmployer,
    overpaymentEmployer,
    setOverpaymentEmployer
  }
}
