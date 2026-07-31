import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'
import {
  MenuIcon,
  MinusIcon,
  PlusIcon,
  Loader2Icon,
  ShoppingBagIcon,
  Trash2Icon,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { normalizeRecords } from '#/lib/normalize-records.ts'
import { cn } from '#/lib/utils.ts'
import {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
} from '#/section-kit/AccountDropdown.tsx'
import {
  CommandSearch,
  CommandSearchTrigger,
  CommandSearchContent,
  CommandSearchInput,
  CommandSearchList,
  CommandSearchEmpty,
  CommandSearchGroup,
} from '#/section-kit/CommandSearch.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import type {
  commerceCartLakebed,
  CommerceCatalogProductInput,
  CommerceCartItemInput,
  CommerceSearchInput,
} from './cart-lakebed.ts'
import { commerceCartItemKey } from './cart-lakebed.ts'
import { useCommerce } from './commerce-provider.tsx'
import type {
  CommerceRuntimeCart,
  PaymentAction,
} from './commerce-contracts.ts'

export type CommerceLakebed = LakebedClientRuntime<typeof commerceCartLakebed>

type CommerceCartSummary = ReturnType<
  typeof commerceCartLakebed.queries.cartSummary
>
type CommerceCartItem = CommerceCartSummary['items'][number]
type CommerceCatalogProduct = NonNullable<
  ReturnType<typeof commerceCartLakebed.queries.productCatalog>
>[number]

type RazorpayCheckout = { open: () => void }
type RazorpayConstructor = new (
  options: Record<string, unknown>,
) => RazorpayCheckout

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hostedCartLines = (cart: CommerceRuntimeCart | undefined) =>
  (cart?.lines ?? cart?.items ?? []).map((line) => {
    const record: Record<string, unknown> = isRecord(line) ? line : {}
    const product = isRecord(record.product) ? record.product : {}
    const total = isRecord(record.total) ? record.total : {}
    const quantity =
      typeof record.quantity === 'number' && Number.isFinite(record.quantity)
        ? Math.max(1, Math.floor(record.quantity))
        : 1
    return {
      id: line.id,
      label:
        typeof product.title === 'string' && product.title.trim()
          ? product.title
          : 'Cart item',
      quantity,
      total:
        typeof total.amount === 'number' &&
        typeof total.currencyCode === 'string'
          ? `${total.currencyCode.toUpperCase()} ${total.amount.toFixed(2)}`
          : '',
    }
  })

function getRazorpay(): RazorpayConstructor | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as { Razorpay?: RazorpayConstructor }).Razorpay
}

const loadRazorpay = async (): Promise<RazorpayConstructor> => {
  const existing = getRazorpay()
  if (existing !== undefined) return existing

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-commerce-razorpay]',
    )
    const script = existing ?? document.createElement('script')
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Razorpay checkout failed to load.')),
      { once: true },
    )
    if (existing === null) {
      script.dataset.commerceRazorpay = 'true'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.head.append(script)
    }
  })

  if (getRazorpay() === undefined) {
    throw new Error('Razorpay checkout is unavailable.')
  }
  return getRazorpay() as RazorpayConstructor
}

export const runCommercePaymentAction = async (
  action: PaymentAction,
  onSuccess: (response?: unknown) => Promise<void>,
) => {
  if (action.type === 'none') {
    await onSuccess()
    return
  }
  if (action.type === 'redirect') {
    window.location.assign(action.url)
    return
  }
  if (!action.provider.toLowerCase().includes('razorpay')) {
    throw new Error(`Unsupported client payment provider: ${action.provider}`)
  }

  const Razorpay = await loadRazorpay()
  new Razorpay({ ...action.data, handler: onSuccess }).open()
}

export function commerceProduct({
  imageAlt,
  itemKey,
  label,
  price,
  subtitle,
}: CommerceCatalogProductInput): CommerceCatalogProductInput {
  return {
    imageAlt: imageAlt ?? '',
    itemKey,
    label,
    price: price ?? '',
    subtitle: subtitle ?? '',
  }
}

export function CommerceMutationSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn('size-4 animate-spin', className)}
      aria-hidden="true"
    />
  )
}

export function CommerceAddItemButton({
  children,
  disabled,
  item,
  lakebed,
  pendingChildren,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  children: ReactNode
  item: CommerceCartItemInput
  lakebed: CommerceLakebed
  pendingChildren?: ReactNode
}) {
  const commerce = useCommerce()
  const addItem = useKeyedLakebedMutation(lakebed, 'addItem')
  const [livePending, setLivePending] = useState(false)
  const itemKey = commerceCartItemKey(item)
  const liveVariantId = useMemo(() => {
    const stableKey = item.itemKey?.trim()
    if (!stableKey || commerce.mode === 'demo') return undefined

    for (const { product, purchasable } of commerce.catalog) {
      if (!purchasable) continue

      const productMatches =
        product.sourceId === stableKey ||
        product.id === stableKey ||
        product.handle === stableKey ||
        product.sourceHandle === stableKey
      if (productMatches) {
        return product.variants.find((variant) => variant.id !== undefined)?.id
      }

      const matchingVariant = product.variants.find(
        (variant) =>
          variant.id === stableKey ||
          variant.sourceId === stableKey ||
          variant.sku === stableKey,
      )
      if (matchingVariant?.id !== undefined) return matchingVariant.id
    }

    return undefined
  }, [commerce.catalog, commerce.mode, item.itemKey])
  const demoPurchasingEnabled = commerce.mode === 'demo'
  const livePurchasingEnabled =
    !demoPurchasingEnabled &&
    commerce.status === 'ready' &&
    liveVariantId !== undefined
  const isButtonPending = demoPurchasingEnabled
    ? addItem.isPending(itemKey)
    : livePending
  const mutationInput = { ...item, itemKey }

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={
        disabled ||
        isButtonPending ||
        (!demoPurchasingEnabled && !livePurchasingEnabled)
      }
      onClick={() => {
        if (demoPurchasingEnabled) {
          void addItem.run(itemKey, mutationInput).catch(() => {})
          return
        }
        if (liveVariantId === undefined) return
        setLivePending(true)
        void commerce
          .addItem({ quantity: 1, variantId: liveVariantId })
          .catch(() => {})
          .finally(() => setLivePending(false))
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <CommerceMutationSpinner />)
        : children}
    </button>
  )
}

export function useSyncCommerceCatalog(
  lakebed: CommerceLakebed,
  products: CommerceCatalogProductInput[],
) {
  const syncCatalog = lakebed.useMutation('syncCatalog')
  const syncCatalogRef = useRef(syncCatalog)
  const productKey = useMemo(() => JSON.stringify(products), [products])
  const stableProducts = useMemo(
    () => products.map((product) => ({ ...product })),
    [productKey],
  )

  useEffect(() => {
    syncCatalogRef.current = syncCatalog
  }, [syncCatalog])

  useEffect(() => {
    if (!stableProducts.length) return
    void syncCatalogRef.current({ products: stableProducts })
  }, [stableProducts])
}

export function useCommerceSearch(lakebed: CommerceLakebed) {
  const state = lakebed.useQuery('commerceSearchState')
  const setCommerceSearch = lakebed.useMutation('setCommerceSearch')
  const selectCommerceSearch = useKeyedLakebedMutation(
    lakebed,
    'setCommerceSearch',
  )
  const [isQueryPending, setIsQueryPending] = useState(false)
  const queryPendingRef = useRef(false)
  const latestQueryRef = useRef<CommerceSearchInput | null>(null)

  const flushLatestQuery = useCallback(() => {
    if (queryPendingRef.current) return

    const next = latestQueryRef.current
    if (!next) return

    latestQueryRef.current = null
    queryPendingRef.current = true
    setIsQueryPending(true)
    void setCommerceSearch(next).finally(() => {
      queryPendingRef.current = false
      setIsQueryPending(false)
      flushLatestQuery()
    })
  }, [setCommerceSearch])

  const chooseSearch = useCallback<(input: CommerceSearchInput) => void>(
    (input) => {
      if (!input.selectedLabel) {
        latestQueryRef.current = input
        flushLatestQuery()
        return
      }

      const searchKey = input.selectedLabel
        ? `selected:${input.selectedLabel}`
        : 'selected'
      if (selectCommerceSearch.isPending(searchKey)) return
      void selectCommerceSearch.run(searchKey, input)
    },
    [flushLatestQuery, selectCommerceSearch],
  )

  return {
    chooseSearch,
    isPending: isQueryPending || selectCommerceSearch.hasPending,
    state,
  }
}

export function useCommerceFilteredProducts<TProduct>(
  lakebed: CommerceLakebed,
  products: TProduct[],
  searchableText: (product: TProduct) => Array<string | undefined>,
) {
  const searchState = lakebed.useQuery('commerceSearchState')
  const selectedLabel = (searchState?.selectedLabel ?? '').trim().toLowerCase()
  const query = (selectedLabel || searchState?.query || '').trim().toLowerCase()

  return useMemo(() => {
    if (!query) return products

    const filtered = products.filter((product) =>
      searchableText(product).some((value) =>
        (value ?? '').toLowerCase().includes(query),
      ),
    )

    return filtered.length || selectedLabel ? filtered : products
  }, [products, query, searchableText, selectedLabel])
}

function itemQuantity(item: CommerceCartItem) {
  return typeof item.quantity === 'number' && Number.isFinite(item.quantity)
    ? Math.max(1, Math.floor(item.quantity))
    : 1
}

function CommerceCartItemRow({
  item,
  lakebed,
}: {
  item: CommerceCartItem
  lakebed: CommerceLakebed
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const incrementItem = useKeyedLakebedMutation(lakebed, 'incrementItem')
  const decrementItem = useKeyedLakebedMutation(lakebed, 'decrementItem')
  const deleteItem = useKeyedLakebedMutation(lakebed, 'deleteItem')
  const quantity = itemQuantity(item)
  const incrementKey = `increment:${item.id}`
  const decrementKey = `decrement:${item.id}`
  const deleteKey = `delete:${item.id}`
  const incrementPending = incrementItem.isPending(incrementKey)
  const decrementPending = decrementItem.isPending(decrementKey)
  const deletePending = deleteItem.isPending(deleteKey)

  return (
    <div className="grid gap-3 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {item.label}
        </p>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label={`Delete ${item.label}`}
              aria-busy={deletePending}
              disabled={deletePending}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-none border border-destructive/40 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            >
              {deletePending ? (
                <CommerceMutationSpinner />
              ) : (
                <Trash2Icon className="size-4" aria-hidden="true" />
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm" className="rounded-none border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {item.label}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the product from the live cart.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="rounded-none"
                disabled={deletePending}
              >
                Cancel
              </AlertDialogCancel>
              <button
                type="button"
                aria-label={deletePending ? 'Deleting item' : 'Delete item'}
                aria-busy={deletePending}
                disabled={deletePending}
                onClick={() => {
                  void deleteItem.run(deleteKey, { id: item.id }).then(
                    () => setDeleteDialogOpen(false),
                    () => {},
                  )
                }}
                className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-none bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
              >
                {deletePending ? <CommerceMutationSpinner /> : 'Delete item'}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div
          className="inline-grid w-fit grid-cols-[2rem_2.25rem_2rem] items-center divide-x divide-border rounded-none border border-border bg-muted/40"
          aria-label={`${item.label} quantity`}
        >
          {quantity > 1 ? (
            <button
              type="button"
              aria-label={`Decrease ${item.label} quantity`}
              aria-busy={decrementPending}
              disabled={decrementPending}
              onClick={() => {
                void decrementItem.run(decrementKey, { id: item.id })
              }}
              className="inline-flex size-8 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-background hover:text-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            >
              {decrementPending ? (
                <CommerceMutationSpinner />
              ) : (
                <MinusIcon className="size-4" aria-hidden="true" />
              )}
            </button>
          ) : (
            <button
              type="button"
              aria-label={`Decrease ${item.label} quantity`}
              aria-busy={deletePending}
              disabled={deletePending}
              onClick={() => setDeleteDialogOpen(true)}
              className="inline-flex size-8 items-center justify-center rounded-none text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            >
              {deletePending ? (
                <CommerceMutationSpinner />
              ) : (
                <MinusIcon className="size-4" aria-hidden="true" />
              )}
            </button>
          )}
          <span className="text-center text-sm font-semibold tabular-nums text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            aria-label={`Increase ${item.label} quantity`}
            aria-busy={incrementPending}
            disabled={incrementPending}
            onClick={() => {
              void incrementItem.run(incrementKey, { id: item.id })
            }}
            className="inline-flex size-8 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-background hover:text-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
          >
            {incrementPending ? (
              <CommerceMutationSpinner />
            ) : (
              <PlusIcon className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {item.price ? (
          <p className="shrink-0 font-mono text-sm tabular-nums text-foreground">
            {item.price}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function CommerceClearCartButton({
  disabled,
  lakebed,
}: {
  disabled: boolean
  lakebed: CommerceLakebed
}) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const clearCart = useKeyedLakebedMutation(lakebed, 'clearCart')
  const clearKey = 'clear-cart'
  const clearPending = clearCart.isPending(clearKey)

  return (
    <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-busy={clearPending}
          disabled={disabled || clearCart.hasPending}
          className="rounded-none border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
        >
          Clear cart
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm" className="rounded-none border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Clear cart?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes every item currently in the live cart.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="rounded-none"
            disabled={clearCart.hasPending}
          >
            Cancel
          </AlertDialogCancel>
          <button
            type="button"
            aria-label={clearPending ? 'Clearing cart' : 'Clear cart'}
            aria-busy={clearPending}
            disabled={clearCart.hasPending}
            onClick={() => {
              void clearCart.run(clearKey).then(
                () => setClearDialogOpen(false),
                () => {},
              )
            }}
            className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-none bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
          >
            {clearPending ? <CommerceMutationSpinner /> : 'Clear cart'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function HostedCommerceCheckout({ onBegin }: { onBegin: () => void }) {
  const commerce = useCommerce()
  const [open, setOpen] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [paymentRequested, setPaymentRequested] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    if (!paymentRequested) return
    const action = commerce.checkout.paymentAction
    if (
      action.type === 'none' &&
      commerce.checkout.paymentSessions.length < 1
    ) {
      return
    }
    setPaymentRequested(false)
    void runCommercePaymentAction(action, async () => {
      await commerce.completeCart()
    }).catch((error: unknown) => {
      setPaymentError(
        error instanceof Error ? error.message : 'Payment could not start.',
      )
    })
  }, [commerce, paymentRequested])

  if (commerce.checkout.order !== undefined) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="font-semibold text-foreground">Order confirmed</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Order{' '}
          {commerce.checkout.order.displayId ?? commerce.checkout.order.id}
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        disabled={
          commerce.cartPending || hostedCartLines(commerce.cart).length < 1
        }
        onClick={() => {
          setOpen(true)
          onBegin()
          void Promise.all([
            commerce.loadShippingOptions(),
            commerce.loadPaymentProviders(),
          ]).catch(() => {})
        }}
        className="inline-flex items-center justify-center rounded-[0.65rem] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        Checkout
      </button>
    )
  }

  const selectedPaymentProvider = commerce.checkout.paymentProviders.find(
    (provider) => provider.id === selectedProvider,
  )

  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold text-foreground">
          Delivery
        </legend>
        {commerce.checkout.shippingOptions.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="commerce-shipping"
                checked={selectedShipping === option.id}
                onChange={() => {
                  setSelectedShipping(option.id)
                  void commerce.selectShippingMethod(option.id).catch(() => {})
                }}
              />
              {option.name}
            </span>
            <span className="text-muted-foreground">
              {option.amount.currencyCode.toUpperCase()}{' '}
              {option.amount.amount.toFixed(2)}
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold text-foreground">
          Payment
        </legend>
        {commerce.checkout.paymentProviders.map((provider) => (
          <label
            key={provider.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm"
          >
            <input
              type="radio"
              name="commerce-payment-provider"
              checked={selectedProvider === provider.id}
              onChange={() => setSelectedProvider(provider.id)}
            />
            {provider.name}
          </label>
        ))}
      </fieldset>

      {commerce.checkoutError !== undefined || paymentError ? (
        <p role="alert" className="text-sm text-destructive">
          {paymentError || commerce.checkoutError?.message}
        </p>
      ) : null}

      <button
        type="button"
        disabled={
          commerce.checkoutPending ||
          !selectedShipping ||
          selectedPaymentProvider === undefined
        }
        onClick={() => {
          if (selectedPaymentProvider === undefined) return
          setPaymentError('')
          setPaymentRequested(true)
          void commerce
            .createPaymentSession(selectedPaymentProvider.id)
            .catch(() => setPaymentRequested(false))
        }}
        className="inline-flex items-center justify-center rounded-[0.65rem] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {commerce.checkoutPending
          ? 'Preparing payment…'
          : `Pay with ${selectedPaymentProvider?.name ?? 'payment provider'}`}
      </button>
    </div>
  )
}

export function CommerceCartButton({
  badgeClassName,
  buttonClassName,
  children,
  fallbackCount = 0,
  fullCartTarget,
  lakebed,
  label = 'Cart',
}: {
  badgeClassName?: string
  buttonClassName?: string
  children?: ReactNode
  fallbackCount?: number
  fullCartTarget?: string
  lakebed: CommerceLakebed
  label?: string
}) {
  const commerce = useCommerce()
  const [open, setOpen] = useState(false)
  const summary = lakebed.useQuery('cartSummary')
  const demoItems: CommerceCartItem[] = summary?.items ?? []
  const hostedLines = hostedCartLines(commerce.cart)
  const isHosted = commerce.mode === 'hosted' || commerce.mode === 'sdk'
  const items = isHosted ? hostedLines : demoItems
  const count = isHosted
    ? hostedLines.reduce((total, item) => total + item.quantity, 0)
    : (summary?.count ?? fallbackCount)

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => {
          setOpen(true)
          if (isHosted) void commerce.refreshCart().catch(() => {})
        }}
        className={buttonClassName}
      >
        {children ?? <ShoppingBagIcon className="size-5" aria-hidden="true" />}
        <span
          className={cn(
            'absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground',
            badgeClassName,
          )}
        >
          {count}
        </span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-[min(100%,22rem)] gap-0 border-l border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
        >
          <SheetHeader className="flex-row items-start justify-between gap-3 border-b border-border px-5 py-4">
            <div className="grid gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
                Your cart
              </span>
              <SheetTitle className="text-base font-semibold tracking-tight text-foreground">
                Your cart
              </SheetTitle>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-none border border-border text-lg leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px"
              aria-label="Close cart"
            >
              ×
            </button>
          </SheetHeader>

          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
            <SheetDescription className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {count < 1
                ? 'Your bag is empty.'
                : `You have ${count} item${count === 1 ? '' : 's'} in your cart.`}
            </SheetDescription>
            {items.length ? (
              <div
                className={
                  isHosted
                    ? 'space-y-3'
                    : 'mt-3 divide-y divide-border border-y border-border'
                }
              >
                {isHosted
                  ? hostedLines.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 border-b border-border pb-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Quantity {item.quantity}
                          </p>
                        </div>
                        {item.total ? (
                          <span className="text-sm text-muted-foreground">
                            {item.total}
                          </span>
                        ) : null}
                      </div>
                    ))
                  : demoItems.map((item) => (
                      <CommerceCartItemRow
                        key={item.id}
                        item={item}
                        lakebed={lakebed}
                      />
                    ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-2 rounded-none border border-dashed border-border px-5 py-10 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Empty
                </span>
                <p className="text-sm text-muted-foreground">
                  Add a product to see it here instantly.
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="gap-3 border-t border-border px-5 py-4">
            {isHosted ? (
              <HostedCommerceCheckout onBegin={() => undefined} />
            ) : (
              <CommerceClearCartButton
                disabled={!items.length}
                lakebed={lakebed}
              />
            )}
            {!isHosted && fullCartTarget ? (
              <NavbarRouteLink
                aria-disabled={!items.length}
                className="inline-flex items-center justify-center rounded-none bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
                onClick={() => {
                  setOpen(false)
                }}
                href={fullCartTarget}
              >
                View full cart
              </NavbarRouteLink>
            ) : null}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function CommerceMobileMenu({
  brand,
  buttonClassName,
  children,
  homeTarget,
  label = 'Open menu',
  nav,
}: {
  brand: string
  buttonClassName?: string
  children?: ReactNode
  homeTarget?: string
  label?: string
  nav: string[]
}) {
  const [open, setOpen] = useState(false)
  const navItems = nav
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
  const normalizedHomeTarget =
    typeof homeTarget === 'string' && homeTarget.trim()
      ? homeTarget.trim()
      : undefined
  const homeNavigationTarget = normalizedHomeTarget ?? navItems[0]
  const mobileNavItems = navItems.filter(
    (item) => item.toLowerCase() !== 'home',
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" aria-label={label} className={buttonClassName}>
          {children ?? <MenuIcon className="size-5" aria-hidden="true" />}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,22rem)] rounded-none border-l border-border bg-background p-0 text-foreground shadow-none sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to a store section.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col divide-y divide-border">
          <NavbarRouteLink
            className="rounded-none border-l-2 border-transparent px-5 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted active:translate-y-px"
            href={homeNavigationTarget}
            onClick={() => setOpen(false)}
          >
            Home
          </NavbarRouteLink>
          {mobileNavItems.map((item) => (
            <NavbarRouteLink
              key={item}
              className="rounded-none border-l-2 border-transparent px-5 py-3.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:border-l-border hover:bg-muted hover:text-foreground active:translate-y-px"
              href={item}
              onClick={() => setOpen(false)}
            >
              {item}
            </NavbarRouteLink>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function CommerceSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: CommerceLakebed
  label?: string
}) {
  const commerceSearch = useCommerceSearch(lakebed)
  const searchState = commerceSearch.state
  const catalog = normalizeRecords<CommerceCatalogProduct>(
    lakebed.useQuery('productCatalog'),
  )
  const query = searchState?.query ?? ''

  return (
    <CommandSearch
      search={{
        items: catalog,
        getKey: (product) => product.id ?? product.label,
        getValue: (product) =>
          `${product.label} ${product.subtitle ?? ''} ${product.price ?? ''}`,
        onSelect: (product) =>
          commerceSearch.chooseSearch({
            query: product.label,
            selectedLabel: product.label,
          }),
      }}
    >
      <CommandSearchTrigger className={buttonClassName} aria-label={label}>
        {children}
      </CommandSearchTrigger>
      <CommandSearchContent
        title="Search products"
        description="Search the generated product catalog."
      >
        <CommandSearchInput
          placeholder="Search products..."
          value={query}
          onValueChange={(value) => {
            commerceSearch.chooseSearch({ query: value, selectedLabel: '' })
          }}
        />
        <CommandSearchList>
          <CommandSearchEmpty>No products found.</CommandSearchEmpty>
          <CommandSearchGroup heading="Products">
            {(product) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[product.subtitle, product.price]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            )}
          </CommandSearchGroup>
        </CommandSearchList>
      </CommandSearchContent>
    </CommandSearch>
  )
}

export function CommerceAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: CommerceLakebed
  label?: string
}) {
  return (
    <AccountDropdown auth={lakebed}>
      <AccountDropdownTrigger aria-label={label} className={buttonClassName}>
        {children}
      </AccountDropdownTrigger>
      <AccountDropdownContent>
        <AccountDropdownLabel />
        <AccountDropdownSeparator />
        <AccountDropdownSignOut />
      </AccountDropdownContent>
      <AccountDropdownUnauthenticated />
    </AccountDropdown>
  )
}
