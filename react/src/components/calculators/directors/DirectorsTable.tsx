import React, {useContext, useState} from 'react'

// types
import {DirectorsContext, DirectorsUIRow} from "./DirectorsContext";
import {TableProps} from '../../../interfaces'

// components
import DirectorsTableRow from './DirectorsTableRow'
import ExplainRow from "../shared/ExplainRow";
import {getBandNames, getContributionBandNames} from "../../../services/utils";

function DirectorsTable(props: TableProps) {
  const { showBands, printView } = props
  const [showExplanation, setShowExplanation] = useState<string>('')
  const {
    rows,
    result
  } = useContext(DirectorsContext)

  const bandNames = getBandNames(rows)
  const contributionNames = getContributionBandNames(rows)
  const displayBands = showBands && bandNames.length

  return (
    <table className="contribution-details" id="results-table" tabIndex={-1}>
      <caption>Contribution payment details</caption>
      <colgroup>
        <col span={2} />
        <col span={displayBands ? bandNames.length + 1 : 1} />
        <col span={printView && result ? 3 : 2} />
        {!printView && result && <col />}
      </colgroup>
      <thead>
        <tr className="clear">
          <td colSpan={2} />
          <th scope="colgroup" className="border" colSpan={printView && displayBands ? bandNames.length + 1 : 1}><span>Earnings</span></th>
          <th scope="colgroup" className="border" colSpan={!printView && result ? 3 : 2}><span>Net contributions</span></th>
          {!printView && result && <td />}
        </tr>
        <tr>
          <th scope="col">#<span className="govuk-visually-hidden"> Row number</span></th>
          <th scope="col" className="category-col"><strong>{printView ? 'Cat' : 'Select NI category'}</strong></th>
          <th scope="col"><strong>{printView ? 'Gross pay' : 'Enter gross pay'}</strong></th>
          {displayBands && bandNames.map(name =>
            <th key={name}>{name}</th>
          )}

          {printView &&
            <th scope="col"><strong>Total</strong></th>
          }
          <th scope="col"><strong><abbr title="Employee">EE</abbr></strong></th>
          <th scope="col"><strong><abbr title="Employer">ER</abbr></strong></th>

          {!printView && result && <th scope="col"><span className="govuk-visually-hidden">Explain results</span></th>}

          {printView && contributionNames && contributionNames.map((cB: string) => (<th scope="col" key={cB}>{cB}</th>))}
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
              contributionNames={contributionNames}
              bandNames={bandNames}
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
