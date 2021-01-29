import {NiFrontend} from '../calculation'
import React, {useEffect, useState} from "react";

interface Calculator {
  calculate: Function
  calculateJson: Function
  calculateProRata: Function
  calculateProRataJson: Function
  getApplicableCategories: Function
  getTaxYears: Array<string>
}

const initCalculator = {
  calculate: () => {},
  calculateJson: () => {},
  calculateProRata: () => {},
  calculateProRataJson: () => {},
  getApplicableCategories: () => {},
  getTaxYears: ['']
}

interface NiFrontendService {
  classOne: Calculator
  classTwo: Calculator
  classThree: Calculator
}

const initService: NiFrontendService = {
  classOne: initCalculator,
  classTwo: initCalculator,
  classThree: initCalculator
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
