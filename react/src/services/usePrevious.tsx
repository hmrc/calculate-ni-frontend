import { useRef, useEffect } from "react"

export const usePrevious = function<T>(value: T | undefined): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value;
  }, [value])

  return ref.current;
}
