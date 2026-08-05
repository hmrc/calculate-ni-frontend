import { useRef, useEffect } from "react"

export const usePrevious = function<T>(value: T | undefined): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value;
  }, [value])

  return ref.current;
}
