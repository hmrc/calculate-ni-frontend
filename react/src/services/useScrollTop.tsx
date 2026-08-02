import React from "react"
import { usePrevious } from "./usePrevious"
import { useLayoutEffect } from "react"
import { useLocation } from "react-router-dom"

export const useScrollToTop = ({ ref }:{
  ref: React.RefObject<HTMLDivElement | null>
}): void => {
  const { pathname } = useLocation()
  const previousPathname = usePrevious(pathname)

  useLayoutEffect(() => {
    if ((pathname && pathname === previousPathname) || !ref?.current) {
      return
    }

    window.scrollTo(0, 0)

    const clearTimer = setTimeout(() => {
      if (ref.current) {
        ref.current.focus()
      }
    }, 100)

    return (): void => {
      clearTimeout(clearTimer)
    };
  }, [pathname, previousPathname, ref])
}
