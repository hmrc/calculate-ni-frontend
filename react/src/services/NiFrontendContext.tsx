import {NiFrontend} from '../calculation'
import React, {useEffect, useState} from "react";
import {GenericObject} from "../interfaces";

export interface InterestOnLateClassOne {
  calculate: Function
  getRates: Function
}

export interface InterestOnRefundsClassOne {
  calculate: Function
  getRates: Function
}

export interface CategoryName {
  letter: string
  name: string
}

export interface ClassOneCalculator {
  calculate: Function
  getApplicableCategories: Function
  getTaxYears: Array<string>
  getCategoryNames: Array<CategoryName>
}

export interface DirectorsCalculator {
  calculate: Function
  isAppropriatePersonalPensionSchemeApplicable: Function
  getTaxYearsWithOptions: Array<string>
}

export interface Class2Or3Calculator {
  calculate: Function
  getTaxYears: Array<string>
  getFinalDate: Function
}

export interface WeeklyContributionsCalculator {
  breakdown: Function
}

export interface UnofficialDefermentCalculator {
  calculate: Function,
  getBandsForTaxYear: Function
  getTaxYears: number[]
  getCategories: Function,
  getBandInputNames: Function
}

export const initClass2Or3Calculator = {
  calculate: () => {},
  getTaxYears: [''],
  getFinalDate: () => {}
}

export const initWeeklyContributionsCalculator = {
  breakdown: () => {}
}

export const initUnofficialDefermentCalculator = {
  calculate: () => {},
  getBandsForTaxYear: () => {},
  getTaxYears: [],
  getCategories: () => {},
  getBandInputNames: () => {}
}

export const initClassOneCalculator = {
  calculate: () => {},
  getApplicableCategories: () => {},
  getTaxYears: [''],
  getCategoryNames: [{letter: '', name: ''}]
}

export const initDirectorsCalculator = {
  calculate: () => {},
  isAppropriatePersonalPensionSchemeApplicable: () => {},
  getTaxYearsWithOptions: ['']
}

export const initInterestOnLateClassOne = {
  calculate: () => {},
  getRates: () => {}
}

export const initInterestOnRefundsClassOne = {
  calculate: () => {},
  getRates: () => {}
}

export const categoryNamesToObject = (arr: Array<CategoryName>) =>
  arr.reduce((list, next) => {
    list[next.letter] = next.name
    return list
  }, {} as GenericObject)

interface NiFrontendService {
  classOne: ClassOneCalculator
  classTwo: Class2Or3Calculator
  classThree: Class2Or3Calculator
  weeklyContributions: WeeklyContributionsCalculator
  interestOnLateClassOne: InterestOnLateClassOne
  interestOnRefundsClassOne: InterestOnRefundsClassOne
  directors: DirectorsCalculator
  unofficialDeferment: UnofficialDefermentCalculator
}

const initService: NiFrontendService = {
  classOne: initClassOneCalculator,
  classTwo: initClass2Or3Calculator,
  classThree: initClass2Or3Calculator,
  weeklyContributions: initWeeklyContributionsCalculator,
  interestOnLateClassOne: initInterestOnLateClassOne,
  interestOnRefundsClassOne: initInterestOnRefundsClassOne,
  directors: initDirectorsCalculator,
  unofficialDeferment: initUnofficialDefermentCalculator
}

interface NiFrontendContext {
  NiFrontendInterface: NiFrontendService
  loading: boolean
  config: any
  error: string
}

export const NiFrontendContext = React.createContext<NiFrontendContext>(
  {
    NiFrontendInterface: initService,
    config: {},
    error: '',
    loading: true
  }
)

export function useNiFrontend() {
  const [NiFrontendInterface, setNiFrontendInterface] = useState<NiFrontendService>(initService)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [config, setConfig] = useState({
    classOne: {},
    classTwo: {},
    classThree: {},
    classFour: {}
  })
  useEffect(() => {
    (async function getConfig() {
      try {
        const response = await fetch(
          "/calculate-ni/national-insurance.json",
          {
            mode: "no-cors"
          })

        if(response.ok) {
          const config = await response.json()
          if (config) {
            setError('')
            setConfig(config)

            const result = new NiFrontend(JSON.stringify(config))
              console.log({config, result});
            setNiFrontendInterface(result)
          }
        } else {
          setError('Configuration unable to be loaded from server.')
        }

        setLoading(false)

      } catch(error) {
        setLoading(false)
        setError('Configuration not loaded: ' + error.toString())
        console.log(error)
      }
    })()
  }, [])
  return {
    loading,
    error,
    config,
    NiFrontendInterface
  }
}
