import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'
import {
  CalendarCheckIcon,
  Loader2Icon,
  MenuIcon,
  SearchIcon,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
} from '#/section-kit/index.ts'
import type {
  RestaurantCatalogInput,
  RestaurantMenuItemInput,
  RestaurantReservationInput,
  restaurantLakebed,
} from './restaurant-lakebed.ts'

export type RestaurantLakebed = LakebedClientRuntime<typeof restaurantLakebed>
type RestaurantCatalogItem = ReturnType<
  typeof restaurantLakebed.queries.menuCatalog
>[number]
type RestaurantOrderItem = ReturnType<
  typeof restaurantLakebed.queries.restaurantOrder
>['items'][number]

export function RestaurantMutationSpinner({
  className,
}: {
  className?: string
}) {
  return (
    <Loader2Icon
      className={cn('size-4 animate-spin', className)}
      aria-hidden="true"
    />
  )
}

export function useRestaurantExperience(lakebed: RestaurantLakebed) {
  return lakebed.useQuery('restaurantExperience')
}

export function useRestaurantOrder(lakebed: RestaurantLakebed) {
  const order = lakebed.useQuery('restaurantOrder')
  const addMenuItem = useKeyedLakebedMutation(lakebed, 'addMenuItem')
  const clearRestaurantOrder = useKeyedLakebedMutation(
    lakebed,
    'clearRestaurantOrder',
  )

  const add = useCallback(
    (key: string, input: RestaurantMenuItemInput) =>
      addMenuItem.run(key, input),
    [addMenuItem],
  )
  const clear = useCallback(
    () => clearRestaurantOrder.run('clear-restaurant-order'),
    [clearRestaurantOrder],
  )
  const quantityFor = useCallback(
    (name: string) =>
      normalizeRecords<RestaurantOrderItem>(order?.items).find(
        (item) => item.name === name,
      )?.quantity ?? 0,
    [order],
  )

  return {
    add,
    clear,
    clearPending: clearRestaurantOrder.isPending('clear-restaurant-order'),
    count: order?.count ?? 0,
    isAdding: addMenuItem.isPending,
    lastSelection: order?.lastSelection ?? null,
    order,
    quantityFor,
  }
}

export function useSyncRestaurantCatalog(
  lakebed: RestaurantLakebed,
  items: RestaurantCatalogInput['items'],
) {
  const syncCatalog = lakebed.useMutation('syncMenuCatalog')
  const syncCatalogRef = useRef(syncCatalog)
  const itemKey = useMemo(() => JSON.stringify(items), [items])
  const stableItems = useMemo(
    () => items.map((item) => ({ ...item })),
    [itemKey],
  )

  useEffect(() => {
    syncCatalogRef.current = syncCatalog
  }, [syncCatalog])

  useEffect(() => {
    if (!stableItems.length) return
    void syncCatalogRef.current({ items: stableItems })
  }, [stableItems])
}

export function RestaurantReservationButton({
  children,
  disabled,
  input,
  lakebed,
  pendingChildren,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  children: ReactNode
  input: RestaurantReservationInput
  lakebed: RestaurantLakebed
  pendingChildren?: ReactNode
}) {
  const reserveTable = useKeyedLakebedMutation(lakebed, 'reserveTable')
  const reservationKey = `reserve:${input.source}`
  const pending = reserveTable.isPending(reservationKey)

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={pending}
      disabled={disabled || pending}
      onClick={() => {
        void reserveTable.run(reservationKey, input).catch(() => {})
      }}
    >
      {pending ? (pendingChildren ?? <RestaurantMutationSpinner />) : children}
    </button>
  )
}

export function RestaurantSelectedMenuBadge({
  className,
  lakebed,
}: {
  className?: string
  lakebed: RestaurantLakebed
}) {
  const experience = useRestaurantExperience(lakebed)

  if (!experience?.selectedMenuItem) return null

  return (
    <span
      className={cn(
        'hidden max-w-[12rem] truncate rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:inline-flex',
        className,
      )}
    >
      {experience.selectedMenuItem}
    </span>
  )
}

export function RestaurantSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search menu',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: RestaurantLakebed
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const selectMenuItem = useKeyedLakebedMutation(lakebed, 'selectMenuItem')
  const catalog = lakebed.useQuery('menuCatalog') ?? []
  const select = (item: RestaurantCatalogItem) => {
    void selectMenuItem
      .run(`select:${item.name}`, {
        category: item.category,
        description: item.description,
        name: item.name,
        price: item.price,
        source: 'search',
        tag: item.tag,
      })
      .then(
        () => setOpen(false),
        () => {},
      )
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className={buttonClassName}
      >
        {children ?? <SearchIcon className="size-5" aria-hidden="true" />}
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search menu"
        description="Search the generated restaurant menu."
      >
        <CommandInput placeholder="Search dishes..." />
        <CommandList>
          <CommandEmpty>No dishes found.</CommandEmpty>
          <CommandGroup heading="Menu">
            {catalog.map((item) => (
              <CommandItem
                key={item.id ?? item.name}
                value={`${item.name} ${item.category} ${item.description} ${
                  item.price
                } ${item.tag}`}
                onSelect={() => select(item)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[item.category, item.price, item.tag]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export function RestaurantAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: RestaurantLakebed
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

export function RestaurantMobileMenu({
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
          <SheetTitle className="font-serif text-lg">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to a restaurant section.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3 py-4">
          <button
            type="button"
            onClick={() => navigate(homeTarget ?? nav[0])}
            className="rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Home
          </button>
          {nav.map((item) => (
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

export function RestaurantReservationCount({
  className,
  lakebed,
}: {
  className?: string
  lakebed: RestaurantLakebed
}) {
  const experience = useRestaurantExperience(lakebed)
  const count = experience?.reservationCount ?? 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground',
        className,
      )}
      aria-live="polite"
    >
      <CalendarCheckIcon className="size-3.5" aria-hidden="true" />
      {count ? `${count} reservation${count === 1 ? '' : 's'}` : 'Reserve'}
    </span>
  )
}
