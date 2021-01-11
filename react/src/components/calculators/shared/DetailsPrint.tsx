import {DetailsProps} from "../../../interfaces";
import SummaryListRow from "../../helpers/gov-design-system/SummaryListRow";
import React from "react";

export default function DetailsPrint(props: { details: DetailsProps }) {
  const { details } = props
  const notEntered = 'Not entered'
  return (
    <div className="details">
      <dl className="govuk-summary-list two-col">
        <SummaryListRow
          listKey="Prepared by:"
          listValue={details.preparedBy ? details.preparedBy : notEntered}
          rowClasses="half"
        />

        <SummaryListRow
          listKey="Date:"
          listValue={details.date ? details.date : notEntered}
          rowClasses="half"
        />

        <SummaryListRow
          listKey="Customer’s full name:"
          listValue={details.fullName ? details.fullName : notEntered}
          rowClasses="half clear-both"
        />

        <SummaryListRow
          listKey="NI number:"
          listValue={details.ni ? details.ni : notEntered}
          rowClasses="half"
        />

        <SummaryListRow
          listKey="Reference:"
          listValue={details.reference ? details.reference : notEntered}
          rowClasses="half clear-both"
        />
      </dl>
    </div>
  )
}