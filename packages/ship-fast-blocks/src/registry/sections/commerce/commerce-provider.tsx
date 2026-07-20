import { useQuery } from '@tanstack/react-query'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  AddCommerceItemInput,
  CommerceAdapter,
  CommerceCartEnvelope,
  CommerceError,
  CommerceOrder,
  CommercePaymentProvider,
  CommercePaymentSession,
  CommerceProduct,
  CommerceRuntimeMode,
  CommerceRuntimeCart,
  CommerceScope,
  CommerceShippingOption,
  CompleteCommerceCartInput,
  CreateCommercePaymentSessionsInput,
  PaymentAction,
  UpdateCommerceItemInput,
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
  addItem: (input: AddCommerceItemInput) => Promise<CommerceRuntimeCart>
  cart?: CommerceRuntimeCart
  cartPending: boolean
  catalog: Array<BoundCommerceProduct>
  checkout: CommerceCheckoutState
  checkoutError?: CommerceError
  checkoutPending: boolean
  clearCart: () => Promise<CommerceRuntimeCart | undefined>
  completeCart: (idempotencyKey?: string) => Promise<CommerceOrder>
  createPaymentSession: (
    providerId: string,
    data?: CreateCommercePaymentSessionsInput['data'],
  ) => Promise<Array<CommercePaymentSession>>
  error?: CommerceError
  loadPaymentProviders: () => Promise<Array<CommercePaymentProvider>>
  loadShippingOptions: () => Promise<Array<CommerceShippingOption>>
  mode: CommerceRuntimeMode
  refreshCart: () => Promise<CommerceRuntimeCart>
  refresh: () => Promise<void>
  removeItem: (lineId: string) => Promise<CommerceRuntimeCart>
  selectShippingMethod: (
    shippingOptionId: string,
  ) => Promise<CommerceRuntimeCart>
  status: CommerceRuntimeStatus
  updateCart: (input: Record<string, unknown>) => Promise<CommerceRuntimeCart>
  updateItem: (
    lineId: string,
    input: UpdateCommerceItemInput,
  ) => Promise<CommerceRuntimeCart>
}

export type CommerceCheckoutState = {
  order?: CommerceOrder
  paymentAction: PaymentAction
  paymentProviders: Array<CommercePaymentProvider>
  paymentSessions: Array<CommercePaymentSession>
  shippingOptions: Array<CommerceShippingOption>
}

type CommerceProviderProps = PropsWithChildren<{
  adapter?: CommerceAdapter
  catalogRefetchIntervalMs?: number | false
  fallbackProducts: Array<CommerceProduct>
  mode: CommerceRuntimeMode
  regionId?: string
  scope: CommerceScope
  tenant: string
}>

const DEFAULT_CATALOG_REFETCH_INTERVAL_MS = 5_000
const MIN_CATALOG_REFETCH_INTERVAL_MS = 1_000
const MAX_CATALOG_REFETCH_INTERVAL_MS = 60_000
const emptyCheckoutState: CommerceCheckoutState = {
  paymentAction: { type: 'none' },
  paymentProviders: [],
  paymentSessions: [],
  shippingOptions: [],
}

const disabledError: CommerceError = {
  code: 'COMMERCE_DISABLED',
  correlationId: 'commerce-runtime',
  message: 'Commerce is disabled.',
  retryable: false,
}

const rejectDisabled: () => Promise<never> = async () => {
  throw disabledError
}

const disabledController: CommerceController = {
  addItem: rejectDisabled,
  cartPending: false,
  catalog: [],
  checkout: emptyCheckoutState,
  checkoutPending: false,
  clearCart: rejectDisabled,
  completeCart: rejectDisabled,
  createPaymentSession: rejectDisabled,
  loadPaymentProviders: rejectDisabled,
  loadShippingOptions: rejectDisabled,
  mode: 'disabled',
  refreshCart: rejectDisabled,
  refresh: async () => undefined,
  removeItem: rejectDisabled,
  selectShippingMethod: rejectDisabled,
  status: 'disabled',
  updateCart: rejectDisabled,
  updateItem: rejectDisabled,
}

const CommerceContext = createContext<CommerceController>(disabledController)

const runtimeError: (
  error: unknown,
  message?: string,
  code?: string,
) => CommerceError = (
  caughtError,
  message = 'Commerce catalog is unavailable.',
  code = 'COMMERCE_CATALOG_UNAVAILABLE',
) => ({
  code,
  correlationId: 'commerce-runtime',
  message:
    caughtError instanceof Error && caughtError.message.trim()
      ? caughtError.message
      : message,
  retryable: true,
})

const cartLineIds: (cart: CommerceRuntimeCart | undefined) => Array<string> = (
  cart,
) => {
  const lineRefs = cart?.lines ?? cart?.items ?? []
  return lineRefs.flatMap((line) =>
    typeof line.id === 'string' && line.id.trim() ? [line.id] : [],
  )
}

export const CommerceProvider = ({
  adapter,
  catalogRefetchIntervalMs,
  children,
  fallbackProducts,
  mode,
  regionId,
  scope,
  tenant,
}: CommerceProviderProps) => {
  const enabled = mode !== 'disabled' && adapter !== undefined
  const [cart, setCart] = useState<CommerceRuntimeCart | undefined>()
  const [checkout, setCheckout] =
    useState<CommerceCheckoutState>(emptyCheckoutState)
  const [checkoutError, setCheckoutError] = useState<
    CommerceError | undefined
  >()
  const [cartPending, setCartPending] = useState(false)
  const [checkoutPending, setCheckoutPending] = useState(false)
  const cartRef = useRef<CommerceRuntimeCart | undefined>(undefined)
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve())
  const pollsCatalog = mode === 'hosted' || mode === 'sdk'
  const catalogRefetchInterval =
    pollsCatalog && catalogRefetchIntervalMs !== false
      ? Math.min(
          MAX_CATALOG_REFETCH_INTERVAL_MS,
          Math.max(
            MIN_CATALOG_REFETCH_INTERVAL_MS,
            Number.isFinite(catalogRefetchIntervalMs)
              ? (catalogRefetchIntervalMs ??
                  DEFAULT_CATALOG_REFETCH_INTERVAL_MS)
              : DEFAULT_CATALOG_REFETCH_INTERVAL_MS,
          ),
        )
      : false
  const catalogQuery = useQuery({
    enabled,
    queryFn: async () => {
      if (adapter === undefined) throw runtimeError(undefined)
      return await adapter.catalog()
    },
    queryKey: commerceQueryKeys.catalog(scope, tenant, regionId),
    refetchInterval: enabled ? catalogRefetchInterval : false,
    refetchIntervalInBackground: false,
    retry: false,
  })

  useEffect(() => {
    cartRef.current = cart
  }, [cart])

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

  const recordCheckoutError = useCallback<
    (caughtError: unknown) => CommerceError
  >((caughtError) => {
    const normalized = runtimeError(
      caughtError,
      'Commerce cart update failed.',
      'COMMERCE_CART_MUTATION_FAILED',
    )
    setCheckoutError(normalized)
    return normalized
  }, [])

  const requireAdapter = useCallback<() => CommerceAdapter>(() => {
    if (!enabled || adapter === undefined) {
      throw disabledError
    }
    return adapter
  }, [adapter, enabled])

  const storeCart = useCallback((envelope: CommerceCartEnvelope) => {
    setCart(envelope.cart)
    cartRef.current = envelope.cart
    return envelope.cart
  }, [])

  const recoverOrCreateCart =
    useCallback(async (): Promise<CommerceRuntimeCart> => {
      const commerceAdapter = requireAdapter()
      const existingCart = cartRef.current
      if (existingCart !== undefined) return existingCart

      try {
        return storeCart(await commerceAdapter.getCart())
      } catch {
        return storeCart(
          await commerceAdapter.createCart(
            regionId === undefined ? {} : { regionId },
          ),
        )
      }
    }, [regionId, requireAdapter, storeCart])

  const enqueueCartMutation = useCallback(
    <T,>(operation: () => Promise<T>): Promise<T> => {
      const run = async () => {
        setCartPending(true)
        setCheckoutError(undefined)
        try {
          return await operation()
        } catch (caughtError) {
          recordCheckoutError(caughtError)
          throw caughtError
        } finally {
          setCartPending(false)
        }
      }
      const next = mutationQueueRef.current.catch(() => undefined).then(run)
      mutationQueueRef.current = next.then(
        () => undefined,
        () => undefined,
      )
      return next
    },
    [recordCheckoutError],
  )

  const runCheckoutStep = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      setCheckoutPending(true)
      setCheckoutError(undefined)
      try {
        return await operation()
      } catch (caughtError) {
        recordCheckoutError(caughtError)
        throw caughtError
      } finally {
        setCheckoutPending(false)
      }
    },
    [recordCheckoutError],
  )

  const refreshCart = useCallback(
    () =>
      enqueueCartMutation(async () => {
        const commerceAdapter = requireAdapter()
        const existingCart = cartRef.current
        if (existingCart === undefined) return await recoverOrCreateCart()
        try {
          return storeCart(await commerceAdapter.getCart(existingCart.id))
        } catch {
          setCart(undefined)
          cartRef.current = undefined
          return await recoverOrCreateCart()
        }
      }),
    [enqueueCartMutation, recoverOrCreateCart, requireAdapter, storeCart],
  )

  const addItem = useCallback(
    (input: AddCommerceItemInput) =>
      enqueueCartMutation(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        return storeCart(await commerceAdapter.addItem(input, activeCart.id))
      }),
    [enqueueCartMutation, recoverOrCreateCart, requireAdapter, storeCart],
  )

  const updateCart = useCallback(
    (input: Record<string, unknown>) =>
      enqueueCartMutation(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        return storeCart(await commerceAdapter.updateCart(input, activeCart.id))
      }),
    [enqueueCartMutation, recoverOrCreateCart, requireAdapter, storeCart],
  )

  const updateItem = useCallback(
    (lineId: string, input: UpdateCommerceItemInput) =>
      enqueueCartMutation(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        return storeCart(
          await commerceAdapter.updateItem(lineId, input, activeCart.id),
        )
      }),
    [enqueueCartMutation, recoverOrCreateCart, requireAdapter, storeCart],
  )

  const removeItem = useCallback(
    (lineId: string) =>
      enqueueCartMutation(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        return storeCart(
          await commerceAdapter.removeItem(lineId, activeCart.id),
        )
      }),
    [enqueueCartMutation, recoverOrCreateCart, requireAdapter, storeCart],
  )

  const clearCart = useCallback(
    () =>
      enqueueCartMutation(async () => {
        const commerceAdapter = requireAdapter()
        let activeCart = await recoverOrCreateCart()
        const lineIds = cartLineIds(activeCart)
        for (const lineId of lineIds) {
          activeCart = storeCart(
            await commerceAdapter.removeItem(lineId, activeCart.id),
          )
        }
        return activeCart
      }),
    [enqueueCartMutation, recoverOrCreateCart, requireAdapter, storeCart],
  )

  const loadShippingOptions = useCallback(
    () =>
      runCheckoutStep(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        const envelope = await commerceAdapter.getShippingOptions(activeCart.id)
        setCheckout((current) => ({
          ...current,
          shippingOptions: envelope.shippingOptions,
        }))
        return envelope.shippingOptions
      }),
    [recoverOrCreateCart, requireAdapter, runCheckoutStep],
  )

  const selectShippingMethod = useCallback(
    (shippingOptionId: string) =>
      runCheckoutStep(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        return storeCart(
          await commerceAdapter.addShippingMethod(
            { shippingOptionId },
            activeCart.id,
          ),
        )
      }),
    [recoverOrCreateCart, requireAdapter, runCheckoutStep, storeCart],
  )

  const loadPaymentProviders = useCallback(
    () =>
      runCheckoutStep(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        const envelope = await commerceAdapter.getPaymentProviders(
          activeCart.id,
        )
        setCheckout((current) => ({
          ...current,
          paymentProviders: envelope.paymentProviders,
        }))
        return envelope.paymentProviders
      }),
    [recoverOrCreateCart, requireAdapter, runCheckoutStep],
  )

  const createPaymentSession = useCallback(
    (providerId: string, data?: CreateCommercePaymentSessionsInput['data']) =>
      runCheckoutStep(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        const envelope = await commerceAdapter.createPaymentSessions(
          data === undefined ? { providerId } : { data, providerId },
          activeCart.id,
        )
        setCheckout((current) => ({
          ...current,
          paymentAction: envelope.paymentAction,
          paymentSessions: envelope.paymentSessions,
        }))
        return envelope.paymentSessions
      }),
    [recoverOrCreateCart, requireAdapter, runCheckoutStep],
  )

  const completeCart = useCallback(
    (idempotencyKey?: CompleteCommerceCartInput['idempotencyKey']) =>
      runCheckoutStep(async () => {
        const commerceAdapter = requireAdapter()
        const activeCart = await recoverOrCreateCart()
        const envelope = await commerceAdapter.completeCart(
          idempotencyKey === undefined ? {} : { idempotencyKey },
          activeCart.id,
        )
        setCart(undefined)
        cartRef.current = undefined
        setCheckout((current) => ({
          ...current,
          order: envelope.order,
        }))
        return envelope.order
      }),
    [recoverOrCreateCart, requireAdapter, runCheckoutStep],
  )

  const controller = useMemo<CommerceController>(
    () => ({
      addItem,
      ...(cart === undefined ? {} : { cart }),
      cartPending,
      catalog,
      checkout,
      ...(checkoutError === undefined ? {} : { checkoutError }),
      checkoutPending,
      clearCart,
      completeCart,
      createPaymentSession,
      ...(error === undefined ? {} : { error }),
      loadPaymentProviders,
      loadShippingOptions,
      mode,
      refreshCart,
      refresh: async () => {
        if (!enabled) return
        await catalogQuery.refetch()
      },
      removeItem,
      selectShippingMethod,
      status,
      updateCart,
      updateItem,
    }),
    [
      addItem,
      cart,
      cartPending,
      catalog,
      catalogQuery,
      checkout,
      checkoutError,
      checkoutPending,
      clearCart,
      completeCart,
      createPaymentSession,
      enabled,
      error,
      loadPaymentProviders,
      loadShippingOptions,
      mode,
      refreshCart,
      removeItem,
      selectShippingMethod,
      status,
      updateCart,
      updateItem,
    ],
  )

  return (
    <CommerceContext.Provider value={controller}>
      {children}
    </CommerceContext.Provider>
  )
}

export const useCommerce: () => CommerceController = () =>
  useContext(CommerceContext)
