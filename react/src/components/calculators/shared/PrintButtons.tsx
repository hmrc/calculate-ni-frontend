import React from "react"
import SecondaryButton from "../../helpers/gov-design-system/SecondaryButton";

export default function PrintButtons(props: {showSummary: boolean, handleShowSummary: Function}) {
  const { showSummary, handleShowSummary } = props
  return (
    <>
      {showSummary ? (
        <div className="govuk-!-padding-bottom-9 section--top">
          <button className="govuk-button" onClick={() => window.print()}>
            Save and print
          </button>
        </div>
      ) : (
        <div className="container section--top section-outer--top">
          <div className="form-group half">
            <SecondaryButton
              label="Save and print"
              onClick={handleShowSummary}
            />
          </div>
        </div>
      )
      }
    </>
  )
}
