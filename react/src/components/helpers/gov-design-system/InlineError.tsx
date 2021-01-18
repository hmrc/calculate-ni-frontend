import React from "react";

interface ErrorMessageProps {
  id: string
  errorMessage: string
}

export default function InlineError(props: ErrorMessageProps){
  const { id, errorMessage } = props
  return (
    <span id={`${id}-error`} className="govuk-error-message">
      <span className="govuk-visually-hidden">Error: </span>
      {errorMessage}
    </span>
  )
}
