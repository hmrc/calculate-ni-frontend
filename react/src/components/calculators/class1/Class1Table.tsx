import React, {useContext, useEffect, useState} from 'react'
import {CalculatedRow, ClassOneContext, ContributionBand, Row} from "./ClassOneContext";
import {TableProps} from '../../../interfaces'
import Class1TableRow from "./Class1TableRow";
import SortToggle from "../../../assets/select-dropdown-arrows.svg"
import ExplainRow from "../shared/ExplainRow";
import {DirectorsUIRow} from "../directors/DirectorsContext";
import {getBandNames, getContributionBandNames} from "../../../services/utils";

export default function Class1Table(props: TableProps) {
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

  // const firstBands = rows[0].bands ? rows[0].bands : []
  const firstBands = getBandNames(rows)
  // const rowWithContributionBands = rows.find((r: Row) => r.contributionBands && r.contributionBands.length > 0)
  const rowWithContributionBands = getContributionBandNames(rows)
  const displayBands: boolean = showBands && firstBands.length > 0

  return (
    <table className="contribution-details" id="results-table" tabIndex={-1}>
      <caption>Contribution payment details</caption>
      <colgroup>
        <col span={4} />
        <col span={displayBands ? firstBands.length + 1 : 1} />
        <col span={printView && result ? 3 : 2} />
        {!printView && result && <col />}
      </colgroup>
      <thead>
        <tr className="clear">
          <td colSpan={4} />
          <th scope="colgroup" className="border" colSpan={displayBands ? firstBands.length + 1 : 1}><span>Earnings</span></th>
          <th scope="colgroup" className="border" colSpan={printView ? 3 : 2}><span>Net contributions</span></th>
          {!printView && result && <td />}
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
          <th scope="col" className="category-col"><strong>{printView ? 'Cat' : 'Select NI category'}</strong></th>
          <th scope="col" className="gross-pay"><strong>{printView ? 'Gross' : 'Enter gross pay'}</strong></th>
          {displayBands && firstBands.map(name =>
            <th scope="col" key={name}>{name}</th>
          )}

          {printView &&
            <th scope="col"><strong>Total</strong></th>
          }
          <th scope="col"><strong><abbr title="Employee">EE</abbr></strong></th>
          <th scope="col"><strong><abbr title="Employer">ER</abbr></strong></th>
          {!printView && result && <th scope="col"><span className="govuk-visually-hidden">Explain results</span></th>}

          {printView && rowWithContributionBands && rowWithContributionBands.map((cB: string) => (<th scope="col" key={cB}>{cB}</th>))}
        </tr>
      </thead>
      
      <tbody>
        {rows.map((r: Row, i: number) => (
          <React.Fragment key={`row-${i}`}>
            <Class1TableRow
              row={r}
              index={i}
              showBands={showBands}
              printView={printView}
              setShowExplanation={setShowExplanation}
              showExplanation={showExplanation}
              rowWithContributionBands={rowWithContributionBands}
            />
            {!printView && result && showExplanation === r.id &&
              <tr aria-live="polite" className="explanation-row">
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
