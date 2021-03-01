import React, {useContext, useState} from 'react'

// types
import {DirectorsContext, DirectorsUIRow} from "./DirectorsContext";
import {TableProps} from '../../../interfaces'

// components
import DirectorsTableRow from './DirectorsTableRow'
import ExplainRow from "../shared/ExplainRow";

function DirectorsTable(props: TableProps) {
  const { showBands, printView } = props
  const [showExplanation, setShowExplanation] = useState<string>('')
  const {
    rows,
    result
  } = useContext(DirectorsContext)

  const firstBands = rows[0].bands ? rows[0].bands : []
  const displayBands = showBands && firstBands.length

  return (
    <table className="contribution-details" id="results-table" tabIndex={-1}>
      <caption>Contribution payment details</caption>
      <colgroup>
        <col span={2} />
        <col span={displayBands ? firstBands.length + 1 : 1} />
        <col span={printView && result ? 3 : 2} />
        {!printView && result && <col />}
      </colgroup>
      <thead>
        <tr className="clear">
          <td colSpan={2} />
          <th scope="colgroup" className="border" colSpan={printView && displayBands ? firstBands.length + 1 : 1}><span>Earnings</span></th>
          <th scope="colgroup" className="border" colSpan={!printView && result ? 3 : 2}><span>Net contributions</span></th>
          {!printView && result && <td />}
        </tr>
        <tr>
          <th scope="col">#<span className="govuk-visually-hidden"> Row number</span></th>
          <th scope="col"><strong>{printView ? '' : 'Select '}NI category letter</strong></th>
          <th scope="col"><strong>{printView ? 'Gross pay' : 'Enter gross pay'}</strong></th>
          {displayBands && firstBands.map(k =>
            <th key={k.name}>{k.name}</th>
          )}

          {displayBands &&
            <th scope="col"><strong>Total</strong></th>
          }
          <th scope="col"><strong><abbr title="Employee">EE</abbr></strong></th>
          <th scope="col"><strong><abbr title="Employer">ER</abbr></strong></th>
          {!printView && result && <th scope="col"><span className="govuk-visually-hidden">Explain results</span></th>}
        </tr>
      </thead>
      
      <tbody>
        {rows.map((r: DirectorsUIRow, i: number) => (
          <React.Fragment key={r.id}>
            <DirectorsTableRow
              row={r}
              index={i}
              printView={printView}
              showBands={showBands}
              setShowExplanation={setShowExplanation}
              showExplanation={showExplanation}
            />
            {!printView && result && showExplanation === r.id &&
            <tr className="explanation-row">
              <td colSpan={8}>
                <ExplainRow
                  id={r.id}
                  explanation={r.explain}
                />
              </td>
            </tr>
            }
          </React.Fragment>

        ))}
      </tbody>
    </table>
  )
}

export default DirectorsTable
