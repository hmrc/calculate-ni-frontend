import React, {useContext, useState} from 'react'
import {ClassOneContext, Row} from "./ClassOneContext";

// types
import {TableProps} from '../../../interfaces'

import numeral from 'numeral'
import 'numeral/locales/en-gb';
import Class1TableRow from "./Class1TableRow";

import SortToggle from "../../../assets/select-dropdown-arrows.svg"

numeral.locale('en-gb');



function ClassOneEarningsTable(props: TableProps) {
  const { showBands, printView } = props
  const [showExplanation, setShowExplanation] = useState<string>('')
  const {
    rows,
    setRows,
    setErrors,
    result
  } = useContext(ClassOneContext)

  const [periodSortDirection, setPeriodSortDirection] = useState<'ascending' | 'descending' | 'none' | undefined>('none')

  const handleSortPeriod = (e: React.MouseEvent) => {
    e.preventDefault()
    setErrors({})
    setRows(rows
      .slice()
      .sort((a: Row, b: Row) =>
        (a.period < b.period ? 1 : (a.period > b.period) ? -1 : 0)))
    setPeriodSortDirection('descending')
  }

  const displayBands = showBands && rows[0].bands

  return (
    <table className="contribution-details" id="results-table" tabIndex={-1}>
      <caption>Contribution payment details</caption>
      <colgroup span={4} />
      <colgroup span={displayBands && rows[0].bands ? rows[0].bands?.length + 1 : 1} />
      <colgroup span={!printView && result ? 3 : 2} />
      <col />
      <thead>
        <tr className="clear">
          <td scope="col" colSpan={4} />
          <th scope="colgroup" className="border" colSpan={displayBands && rows[0].bands ? rows[0].bands?.length + 1 : 1}><span>Earnings</span></th>
          <th scope="colgroup" className="border" colSpan={displayBands ? 3 : 2}><span>Net contributions</span></th>
        </tr>
        <tr>
          <th scope="col">
            #<span className="govuk-visually-hidden"> Row number</span>
          </th>
          <th scope="col" className="column-toggle select-period" aria-sort={periodSortDirection} onClick={handleSortPeriod}>
            <strong>
              {printView ? 'Period': 'Select period'}
              {!printView &&
                <abbr title="Sort periods">
                  <img src={SortToggle} alt="Sort by period" />
                </abbr>
              }
            </strong>
          </th>
          <th scope="col" className="notes"><strong>Period No.</strong></th>
          <th scope="col" className="category-col"><strong>{printView ? '' : 'Select '}NI category letter</strong></th>
          <th scope="col" className="gross-pay"><strong>{printView ? 'Gross pay' : 'Enter gross pay'}</strong></th>
          {/* Bands - by tax year, so we can just take the first band to map the rows */}
          {showBands && rows[0].bands && rows[0].bands.map(k =>
            <th scope="col" key={k.name}>{k.name}</th>
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
        {rows.map((r: Row, i: number) => (
          <>
            <Class1TableRow
              key={`row-${i}`}
              row={r}
              index={i}
              showBands={showBands}
              printView={printView}
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

export default ClassOneEarningsTable
