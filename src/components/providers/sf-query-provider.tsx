'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useRef, type ReactNode } from 'react'

declare global {
  interface Window {
    __sfQueryClient?: QueryClient
  }
}

export const SfQueryProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<QueryClient | null>(null)
  if (!clientRef.current) {
    clientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 90_000,
          gcTime: 900_000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    })
  }
  const client = clientRef.current
  if (typeof window !== 'undefined') window.__sfQueryClient = client
  useEffect(
    () => () => {
      if (window.__sfQueryClient === client) delete window.__sfQueryClient
    },
    [client],
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
