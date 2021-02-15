import React, {useContext, useState} from 'react'
import numeral from 'numeral'
import 'numeral/locales/en-gb';

// types
import {DirectorsContext, DirectorsUIRow} from "./DirectorsContext";
import {TableProps} from '../../../interfaces'

// components
import DirectorsTableRow from './DirectorsTableRow'
import Class1TableRow from "../class1/Class1TableRow";

numeral.locale('en-gb');

function DirectorsEarningsTable(props: TableProps) {
  const { showBands, printView } = props
  const [showExplanation, setShowExplanation] = useState<string>('')
  const {
    rows,
    result
  } = useContext(DirectorsContext)

  return (
    <table className="contribution-details">
      <thead>
        <tr className="clear">
          <th className="lg" colSpan={2}><span>Contribution payment details</span></th>
          {showBands && rows[0].bands &&
            <th className="border" colSpan={rows[0].bands.length}><span>Earnings</span></th>
          }
          <th className="border" colSpan={showBands && rows[0].bands ? 2 : 1}><span>Net contributions</span></th>
        </tr>
        <tr>
          <th><strong>{printView ? '' : 'Select '}NI category letter</strong></th>
          <th><strong>{printView ? 'Gross pay' : 'Enter gross pay'}</strong></th>
          {/* Bands - by tax year, so we can just take the first band to map the rows */}
          {showBands && rows[0].bands && rows[0].bands.map(k =>
            <th key={k.name}>{k.name}</th>
          )}

          {showBands && rows[0].bands &&
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
            <tr aria-live="polite" className="explanation-row">
              <td colSpan={8}>
                <div className="explanation">
                  {r.explain && r.explain.map((line: string, index: number) =>
                      <span key={`${r.id}-explain-${index}`}>
                        {line.replace(`${r.id}.`, '')}<br />
                      </span>
                  )}
                </div>
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
