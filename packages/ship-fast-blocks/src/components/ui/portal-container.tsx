import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

const PortalContainerContext = createContext<HTMLElement | null>(null)

export function PortalContainerProvider({
  children,
  container,
}: {
  children: ReactNode
  container: HTMLElement | null
}) {
  return (
    <PortalContainerContext.Provider value={container}>
      {children}
    </PortalContainerContext.Provider>
  )
}

export function usePortalContainer() {
  return useContext(PortalContainerContext)
}
