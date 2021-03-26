import React, {useContext} from "react"
import BackLink from "../../helpers/gov-design-system/BackLink";
import {SavePrintBaseProps} from "../../../interfaces";
import DetailsPrint from "../shared/DetailsPrint";
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import UnofficialDefermentTable from "./UnofficialDefermentTable";
import UnofficialDefermentTotals from "./UnofficialDefermentTotals";


export default function UnofficialDefermentPrint(props: SavePrintBaseProps) {
  const { title, setShowSummary } = props
  const {
    details,
    results
  } = useContext(UnofficialDefermentContext)
  return (
    <div className="save-print-wrapper">
      <div className="print-content">
        <BackLink callBack={() => setShowSummary(false)} />
        <h1 className="govuk-heading-l">{title}</h1>
        <DetailsPrint details={details} />
        <div className="divider--bottom">
          <div className="section--top">
            <UnofficialDefermentTable printView={true} />
          </div>
        </div>
      </div>
    </div>
  )
}