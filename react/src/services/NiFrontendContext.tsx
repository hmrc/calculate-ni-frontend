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
  config: any
}

export const NiFrontendContext = React.createContext<NiFrontendContext>(
  {
    NiFrontendInterface: initService,
    config: {}
  }
)

export function useNiFrontend() {
  const [NiFrontendInterface, setNiFrontendInterface] = useState<NiFrontendService>(initService)
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

        const config = await response.json()
        setConfig(config)

        const result = new NiFrontend(JSON.stringify(config))
        setNiFrontendInterface(result)

      } catch(error) {
        console.log(error)
      }
    })()
  }, [])
  return {
    config,
    NiFrontendInterface
  }
}
