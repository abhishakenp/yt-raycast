import * as React from 'react'

const MOBILE_BREAKPOINT = 768

/** Returns true when the viewport is below the mobile breakpoint.
 *  SSR-safe: returns false during the first render, then resolves to the
 *  real value after mount. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      return
    }
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
