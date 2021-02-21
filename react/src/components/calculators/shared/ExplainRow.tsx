import React from "react"


export default function ExplainRow(props: {explanation: string[] | undefined, id: string}) {
  const { explanation, id } = props
  return (
    <div className="explanation" role="alert">
      {explanation && explanation.map((line: string, index: number) =>
        <span key={`${id}-explain-${index}`}>
          {line.replace(`${id}.`, '')}<br />
        </span>
      )}
    </div>
  )
}
