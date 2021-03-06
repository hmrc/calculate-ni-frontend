import React, {useContext} from "react"
import BackLink from "../../helpers/gov-design-system/BackLink";
import {SavePrintBaseProps} from "../../../interfaces";
import DetailsPrint from "../shared/DetailsPrint";
import {UnofficialDefermentContext} from "./UnofficialDefermentContext";
import UnofficialDefermentTable from "./UnofficialDefermentTable";
import UnofficialDefermentLimits from "./UnofficialDefermentLimits";

export default function UnofficialDefermentPrint(props: SavePrintBaseProps) {
  const { title, setShowSummary } = props
  const {
    details,
    taxYear
  } = useContext(UnofficialDefermentContext)
  return (
    <div className="save-print-wrapper">
      <div className="print-content">
        <BackLink callBack={() => setShowSummary(false)} />
        <h1 className="govuk-heading-l">{title}</h1>
        <DetailsPrint details={details} />
        <h2 className="govuk-heading-m">
          Tax year: {taxYear}
        </h2>
        <UnofficialDefermentLimits />
        <div className="divider--bottom">
          <div className="section--top">
            <UnofficialDefermentTable printView={true} />
          </div>
        </div>
      </div>
    </div>
  )
}