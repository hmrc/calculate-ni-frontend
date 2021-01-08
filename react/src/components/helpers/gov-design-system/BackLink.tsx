import React from "react";

export default function BackLink(props: {callBack: Function}){
  const handleBackLink = (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    props.callBack()
  }

  return (
    <a
      href="#hideSummary"
      className="govuk-back-link"
      onClick={handleBackLink}>
      Back
    </a>
  )
}