import { useQuery } from '@tanstack/react-query'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react'

import type {
  CommerceCatalogAdapter,
  CommerceError,
  CommerceProduct,
  CommerceRuntimeMode,
  CommerceScope,
} from './commerce-contracts'
import {
  bindCommerceCatalog,
  type BoundCommerceProduct,
} from './commerce-product-binding'
import { commerceQueryKeys } from './commerce-query-keys'

export type CommerceRuntimeStatus =
  | 'degraded'
  | 'disabled'
  | 'loading'
  | 'ready'

export type CommerceController = {
  catalog: Array<BoundCommerceProduct>
  error?: CommerceError
  mode: CommerceRuntimeMode
  refresh: () => Promise<void>
  status: CommerceRuntimeStatus
}

type CommerceProviderProps = PropsWithChildren<{
  adapter?: CommerceCatalogAdapter
  fallbackProducts: Array<CommerceProduct>
  mode: CommerceRuntimeMode
  regionId?: string
  scope: CommerceScope
  tenant: string
}>

const disabledController: CommerceController = {
  catalog: [],
  mode: 'disabled',
  refresh: async () => undefined,
  status: 'disabled',
}

const CommerceContext = createContext<CommerceController>(disabledController)

const runtimeError = (
  error: unknown,
  message = 'Commerce catalog is unavailable.',
): CommerceError => ({
  code: 'COMMERCE_CATALOG_UNAVAILABLE',
  correlationId: 'commerce-runtime',
  message:
    error instanceof Error && error.message.trim() ? error.message : message,
  retryable: true,
})

export const CommerceProvider = ({
  adapter,
  children,
  fallbackProducts,
  mode,
  regionId,
  scope,
  tenant,
}: CommerceProviderProps) => {
  const enabled = mode !== 'disabled' && adapter !== undefined
  const catalogQuery = useQuery({
    enabled,
    queryFn: async () => {
      if (adapter === undefined) throw runtimeError(undefined)
      return await adapter.catalog()
    },
    queryKey: commerceQueryKeys.catalog(scope, tenant, regionId),
    retry: false,
  })

  const slots = useMemo(
    () =>
      fallbackProducts.map((fallback) => ({
        fallback,
        handle: fallback.handle,
        sourceId: fallback.sourceId,
      })),
    [fallbackProducts],
  )

  let status: CommerceRuntimeStatus
  let error: CommerceError | undefined

  if (mode === 'disabled') {
    status = 'disabled'
  } else if (adapter === undefined) {
    status = 'degraded'
    error = runtimeError(undefined, 'Commerce is not configured.')
  } else if (catalogQuery.isPending) {
    status = 'loading'
  } else if (catalogQuery.isError) {
    status = 'degraded'
    error = runtimeError(catalogQuery.error)
  } else {
    status = 'ready'
  }

  const catalog = bindCommerceCatalog(
    slots,
    catalogQuery.data?.products ?? [],
    status === 'ready'
      ? 'ready'
      : status === 'loading'
        ? 'loading'
        : 'degraded',
  )

  const controller = useMemo<CommerceController>(
    () => ({
      catalog,
      ...(error === undefined ? {} : { error }),
      mode,
      refresh: async () => {
        if (!enabled) return
        await catalogQuery.refetch()
      },
      status,
    }),
    [catalog, catalogQuery, enabled, error, mode, status],
  )

  return (
    <CommerceContext.Provider value={controller}>
      {children}
    </CommerceContext.Provider>
  )
}

export const useCommerce = (): CommerceController => useContext(CommerceContext)
