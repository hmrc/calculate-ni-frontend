import React, {useContext, useState} from 'react'
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {DirectorsContext, DirectorsUIRow} from "./DirectorsContext";
import {TableProps} from '../../../interfaces'

// components
import DirectorsTableRow from './DirectorsTableRow'
import ExplainToggle from "../shared/ExplainToggle";
import ExplainRow from "../shared/ExplainRow";

numeral.locale('en-gb');

function DirectorsEarningsTable(props: TableProps) {
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
      <col />
      <colgroup span={displayBands ? firstBands.length + 1 : 1} />
      <colgroup span={printView && result ? 3 : 2} />
      <thead>
        <tr className="clear">
          <td scope="col" colSpan={1} />
          <th className="border" colSpan={printView && displayBands ? firstBands.length + 1 : 1}><span>Earnings</span></th>
          <th className="border" colSpan={!printView && result ? 3 : 2}><span>Net contributions</span></th>
          {!printView && result && <td scope="col" />}
        </tr>
        <tr>
          <th><strong>{printView ? '' : 'Select '}NI category letter</strong></th>
          <th><strong>{printView ? 'Gross pay' : 'Enter gross pay'}</strong></th>
          {displayBands && firstBands.map(k =>
            <th key={k.name}>{k.name}</th>
          )}

          {displayBands &&
            <th><strong>Total</strong></th>
          }
          <th><strong><abbr title="Employee">EE</abbr></strong></th>
          <th><strong><abbr title="Employer">ER</abbr></strong></th>
          {!printView && result && <th><span className="govuk-visually-hidden">Explain results</span></th>}
        </tr>
      </thead>
      
      <tbody>
        {rows.map((r: DirectorsUIRow, i: number) => (
          <>
            <DirectorsTableRow
              key={r.id}
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
          </>

        ))}
      </tbody>
    </table>
  )
}

export default DirectorsEarningsTable
