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
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
  CommandSearch,
  CommandSearchTrigger,
  CommandSearchContent,
  CommandSearchInput,
  CommandSearchList,
  CommandSearchEmpty,
  CommandSearchGroup,
} from '#/section-kit/index.ts'
import type {
  commerceCartLakebed,
  CommerceCatalogProductInput,
  CommerceCartItemInput,
  CommerceSearchInput,
} from './cart-lakebed.ts'
import { commerceCartItemKey } from './cart-lakebed.ts'

export type CommerceLakebed = LakebedClientRuntime<typeof commerceCartLakebed>

type CommerceCartSummary = ReturnType<
  typeof commerceCartLakebed.queries.cartSummary
>
type CommerceCartItem = CommerceCartSummary['items'][number]
type CommerceCatalogProduct = NonNullable<
  ReturnType<typeof commerceCartLakebed.queries.productCatalog>
>[number]

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
  const addItem = useKeyedLakebedMutation(lakebed, 'addItem')
  const itemKey = commerceCartItemKey(item)
  const isButtonPending = addItem.isPending(itemKey)
  const mutationInput = { ...item, itemKey }

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        void addItem.run(itemKey, mutationInput).catch(() => {})
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

  const chooseSearch = useCallback(
    (input: CommerceSearchInput) => {
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
    <div className="grid gap-3 border-b border-border pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {item.label}
          </p>
          {item.price ? (
            <p className="mt-1 text-xs text-muted-foreground">{item.price}</p>
          ) : null}
        </div>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label={`Delete ${item.label}`}
              aria-busy={deletePending}
              disabled={deletePending}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-destructive/20 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              {deletePending ? (
                <CommerceMutationSpinner />
              ) : (
                <Trash2Icon className="size-4" aria-hidden="true" />
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {item.label}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the product from the live cart.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletePending}>
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
                className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {deletePending ? <CommerceMutationSpinner /> : 'Delete item'}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div
        className="inline-grid w-fit grid-cols-[2rem_2.25rem_2rem] items-center rounded-full border border-border bg-muted/40 p-1"
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
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
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
            className="inline-flex size-8 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            {deletePending ? (
              <CommerceMutationSpinner />
            ) : (
              <MinusIcon className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
        <span className="text-center text-sm font-semibold text-foreground">
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
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {incrementPending ? (
            <CommerceMutationSpinner />
          ) : (
            <PlusIcon className="size-4" aria-hidden="true" />
          )}
        </button>
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
          className="rounded-[0.65rem] border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          Clear cart
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Clear cart?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes every item currently in the live cart.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={clearCart.hasPending}>
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
            className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {clearPending ? <CommerceMutationSpinner /> : 'Clear cart'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
  const [open, setOpen] = useState(false)
  const go = useNavigate()
  const summary = lakebed.useQuery('cartSummary')
  const items: CommerceCartItem[] = summary?.items ?? []
  const count = summary?.count ?? fallbackCount

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
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
          className="w-[min(100%,22rem)] gap-0 border-l border-border bg-background p-0 text-foreground shadow-[-8px_0_32px_rgba(0,0,0,0.12)] sm:max-w-[22rem]"
        >
          <SheetHeader className="flex-row items-center justify-between gap-3 border-b border-border px-[1.1rem] py-4">
            <SheetTitle className="text-base font-semibold text-foreground">
              Your cart
            </SheetTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2 py-0.5 text-2xl leading-none text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close cart"
            >
              ×
            </button>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-[1.1rem] py-4">
            <SheetDescription className="m-0 text-sm leading-relaxed text-muted-foreground">
              {count < 1
                ? 'Your bag is empty.'
                : `You have ${count} item${count === 1 ? '' : 's'} in your cart.`}
            </SheetDescription>
            {items.length ? (
              <div className="space-y-3">
                {items.map((item) => (
                  <CommerceCartItemRow
                    key={item.id}
                    item={item}
                    lakebed={lakebed}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                Add a product to see it here instantly.
              </div>
            )}
          </div>

          <SheetFooter className="gap-2 border-t border-border px-[1.1rem] py-4">
            <CommerceClearCartButton
              disabled={!items.length}
              lakebed={lakebed}
            />
            {fullCartTarget ? (
              <button
                type="button"
                disabled={!items.length}
                onClick={() => {
                  setOpen(false)
                  go(fullCartTarget)
                }}
                className="inline-flex items-center justify-center rounded-[0.65rem] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                View full cart
              </button>
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
  const go = useNavigate()

  const navigate = (target?: string) => {
    setOpen(false)
    go(target)
  }
  const homeNavigationTarget = homeTarget ?? nav[0]
  const mobileNavItems = nav.filter(
    (item) => item.trim().toLowerCase() !== 'home',
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
        className="w-[min(100%,22rem)] border-l border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to a store section.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3 py-4">
          <button
            type="button"
            onClick={() => navigate(homeNavigationTarget)}
            className="rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Home
          </button>
          {mobileNavItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => navigate(item)}
              className="rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item}
            </button>
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
