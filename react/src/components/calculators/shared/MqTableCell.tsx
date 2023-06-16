import React from 'react';

interface MqTableCellProps {
  children: any,
  cellStyle: any,
  cellClassName?: string
}

function MqTableCell(props: MqTableCellProps) {
  const { children, cellStyle, cellClassName } = props
  return (
    <td className={cellClassName} css={cellStyle}>{children}</td>
  )
}

export default MqTableCell
