import React, {useContext, useState} from 'react'
import {ClassOneContext, Row} from "./ClassOneContext";
import {TableProps} from '../../../interfaces'
import Class1TableRow from "./Class1TableRow";
import ExplainRow from "../shared/ExplainRow";
import {getBandNames, getContributionBandNames} from "../../../services/utils";

interface Class1TableProps extends TableProps {
    repeatQty: number
}

export default function Class1Table(props: Class1TableProps) {
  const { showBands, printView, repeatQty } = props
  const [showExplanation, setShowExplanation] = useState<string>('')
  const {
    rows,
    result
  } = useContext(ClassOneContext)

  const bandNames = getBandNames(rows)
  const contributionNames = getContributionBandNames(rows)
  const displayBands: boolean = showBands && bandNames.length > 0

  return (
    <table className="contribution-details" id="results-table" tabIndex={-1} data-testid="payment-table">
      <caption>Contribution payment details</caption>
      <colgroup>
        <col span={4} />
        <col span={displayBands ? bandNames.length + 1 : 1} />
        <col span={printView && result ? 3 : 2} />
        {!printView && result && <col />}
      </colgroup>
      <thead>
        <tr className="clear">
          <td colSpan={4} />
          <th scope="colgroup" className="border" colSpan={displayBands ? bandNames.length + 1 : 1}><span>Earnings</span></th>
          <th scope="colgroup" className="border" colSpan={printView ? 3 : 2}><span>Net contributions</span></th>
          {!printView && result && <td />}
        </tr>
        <tr>
          <th scope="col">
            <strong>Row</strong>
          </th>
          <th scope="col" className="select-period">
            <strong>
              {printView ? 'Period': 'Select period'}
            </strong>
          </th>
          <th scope="col" className="notes"><strong>Period No.</strong></th>
          <th scope="col" className="category-col"><strong>{printView ? 'Cat' : 'Select NI category'}</strong></th>
          <th scope="col" className="gross-pay"><strong>{printView ? 'Gross' : 'Enter gross pay'}</strong></th>
          {displayBands && bandNames.map(name =>
            <th scope="col" key={name}>{name}</th>
          )}

          {printView &&
            <th scope="col"><strong>Total</strong></th>
          }
          <th scope="col"><strong>Employee</strong></th>
          <th scope="col"><strong>Employer</strong></th>
          {!printView && result && <th scope="col"><span className="govuk-visually-hidden">Explain results</span></th>}

          {printView && contributionNames && contributionNames.map((cB: string) => (<th scope="col" key={cB}>{cB}</th>))}
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
              contributionNames={contributionNames}
              bandNames={bandNames}
              repeatQty={repeatQty}
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
