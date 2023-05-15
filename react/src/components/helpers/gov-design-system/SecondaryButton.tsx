import React from "react";

export default function SecondaryButton(props: any) {
  const { label, onClick, disabled } = props
  return (
    <button
      type="button"
      className="button govuk-button govuk-button--secondary nomar"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
