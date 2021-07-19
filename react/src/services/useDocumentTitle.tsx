import { useEffect } from "react"
import {serviceName} from "../config";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title
    const suffix = serviceName + ' - GOV.UK'
    document.title = title === serviceName ? suffix : title + ' - ' + suffix
    return () => {
      document.title = prevTitle
    }
  })
}
