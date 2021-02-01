import {NiFrontend} from '../calculation'
import React, {useEffect, useState} from "react";


interface InterestOnLateClassOne {
  calculate: Function
  getRates: Function
}

export interface ClassOneCalculator {
  calculate: Function
  calculateJson: Function
  calculateProRata: Function
  calculateProRataJson: Function
  getApplicableCategories: Function
  interestOnLateClassOne: InterestOnLateClassOne
  getTaxYears: Array<string>
}

export interface Class2Or3Calculator {
  calculate: Function
  getTaxYears: Array<string>
}

const initClass2Or3Calculator = {
  calculate: () => {},
  getTaxYears: ['']
}

export const initClassOneCalculator = {
  calculate: () => {},
  calculateJson: () => {},
  calculateProRata: () => {},
  calculateProRataJson: () => {},
  getApplicableCategories: () => {},
  interestOnLateClassOne: {
    calculate: () => {},
    getRates: () => {}
  },
  getTaxYears: ['']
}

interface NiFrontendService {
  classOne: ClassOneCalculator
  classTwo: Class2Or3Calculator
  classThree: Class2Or3Calculator
}

const initService: NiFrontendService = {
  classOne: initClassOneCalculator,
  classTwo: initClass2Or3Calculator,
  classThree: initClass2Or3Calculator
}

interface NiFrontendContext {
  NiFrontendInterface: NiFrontendService
  config: any,
  error: string
}

export const NiFrontendContext = React.createContext<NiFrontendContext>(
  {
    NiFrontendInterface: initService,
    config: {},
    error: ''
  }
)

export function useNiFrontend() {
  const [NiFrontendInterface, setNiFrontendInterface] = useState<NiFrontendService>(initService)
  const [error, setError] = useState<string>('Trying to load configuration from /calculate-ni/national-insurance.json')
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
            setNiFrontendInterface(result)
          }
        } else {
          setError('Configuration unable to be loaded from server.')
        }

      } catch(error) {
        setError('Configuration not loaded: ' + error.toString())
        console.log(error)
      }
    })()
  }, [])
  return {
    error,
    config,
    NiFrontendInterface
  }
}
