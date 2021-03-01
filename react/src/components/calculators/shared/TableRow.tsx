import React, {Dispatch, useEffect, useRef, useState} from 'react'

interface TableRowProps {
  children: any
  row: {id: string}
  rows: {id: string}[]
  index: number
  activeRowId: string | null
  setActiveRowId: Dispatch<string | null>
}

export default function TableRow(props: TableRowProps) {
  const { children, row, index, rows, activeRowId, setActiveRowId } = props
  const rowRef = useRef() as React.MutableRefObject<HTMLTableRowElement>
  const [retainFocus, setRetainFocus] = useState<boolean>(false)

  useEffect(() => {
    if(!retainFocus && activeRowId === row.id && rowRef.current) {
      rowRef.current.focus()
    } else {
      setRetainFocus(false)
    }
  }, [activeRowId, row.id, rowRef]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickFocus = (event: React.MouseEvent): void => {
    setRetainFocus(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)
    setActiveRowId(row.id)
  }

  const handleKeyDown = ( event: React.KeyboardEvent ) => {
    if(!(event.target instanceof HTMLSelectElement)) {
      event.stopPropagation()
      switch (event.key) {
        case "ArrowUp":
          if(index > 0) {
            setActiveRowId(rows[index - 1].id)
          }
          break
        case "ArrowDown":
          if((index + 1) < rows.length) {
            setActiveRowId(rows[index + 1].id)
          }
          break
        default: break
      }
    }
  }

  return (
    <tr
      className={`no-focus-outline${activeRowId === row.id ? ` active` : ``}`}
      id={row.id}
      onClick={handleClickFocus}
      aria-selected={activeRowId === row.id}
      tabIndex={-1}
      ref={rowRef}
      onKeyDown={handleKeyDown}
    >
      {children}
    </tr>
  )
}
