import React, {Dispatch} from "react"

interface ExplainToggleProps {
  id: string
  showExplanation: string | undefined
  setShowExplanation: Dispatch<string>
}

export default function ExplainToggle(props: ExplainToggleProps) {
  const { id, setShowExplanation, showExplanation } = props
  return (
    <a className="explain-toggle" href={`#${id}-explain`} onClick={(e) => {
      e.preventDefault()
      setShowExplanation(showExplanation === id ? '' : id)
    }}>
      <strong
        className={`govuk-tag ${showExplanation === id ?
          `govuk-tag--blue` : `govuk-tag--grey`}`}
      >
        <span aria-hidden="true">=</span>
        <span className="govuk-visually-hidden">
          {showExplanation ?
            'Hide the explanation of results in this row' : 'Explain the results in this row'
          }
        </span>
      </strong>
    </a>
  )
}
