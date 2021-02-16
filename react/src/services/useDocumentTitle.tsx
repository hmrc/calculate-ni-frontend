import React, { useEffect } from "react"

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title + ' - National Insurance (NI) Calculator Support Tool - GOV.UK'
    return () => {
      document.title = prevTitle
    }
  })
}
