import type { ButtonHTMLAttributes, FormEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'
import { Loader2Icon, MenuIcon, SearchIcon, UserIcon } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import type {
  FoodDeliveryActionInput,
  FoodDeliveryCatalogInput,
  FoodDeliveryRestaurantInput,
  FoodDeliverySearchInput,
  foodDeliveryLakebed,
} from './food-delivery-lakebed.ts'

export type FoodDeliveryLakebed = LakebedClientRuntime<
  typeof foodDeliveryLakebed
>

type FoodRestaurantCatalogItem = NonNullable<
  ReturnType<typeof foodDeliveryLakebed.queries.restaurantCatalog>
>[number]

export const foodDeliveryRestaurant = ({
  category,
  cuisine,
  delivery,
  imageAlt,
  name,
  rating,
  time,
}: FoodDeliveryCatalogInput): FoodDeliveryCatalogInput => ({
  category: category ?? '',
  cuisine: cuisine ?? '',
  delivery: delivery ?? '',
  imageAlt: imageAlt ?? '',
  name,
  rating: rating ?? '',
  time: time ?? '',
})

export function FoodDeliveryMutationSpinner({
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

export function FoodDeliveryActionButton({
  action,
  children,
  disabled,
  lakebed,
  pendingChildren,
  source,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  action: string
  children: ReactNode
  lakebed: FoodDeliveryLakebed
  pendingChildren?: ReactNode
  source?: string
}) {
  const recordFoodAction = useKeyedLakebedMutation(lakebed, 'recordFoodAction')
  const key = `${source ?? 'food-delivery'}\u0000${action}`
  const isButtonPending = recordFoodAction.isPending(key)
  const input: FoodDeliveryActionInput =
    source === undefined ? { action } : { action, source }

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        void recordFoodAction.run(key, input).catch(() => {})
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <FoodDeliveryMutationSpinner />)
        : children}
    </button>
  )
}

export function useSyncFoodDeliveryRestaurants(
  lakebed: FoodDeliveryLakebed,
  items: FoodDeliveryCatalogInput[],
) {
  const syncRestaurants = lakebed.useMutation('syncRestaurants')
  const syncRestaurantsRef = useRef(syncRestaurants)
  const itemKey = useMemo(() => JSON.stringify(items), [items])
  const stableItems = useMemo(
    () => items.map((item) => foodDeliveryRestaurant(item)),
    [itemKey],
  )

  useEffect(() => {
    syncRestaurantsRef.current = syncRestaurants
  }, [syncRestaurants])

  useEffect(() => {
    if (!stableItems.length) return
    void syncRestaurantsRef.current({ items: stableItems })
  }, [stableItems])
}

export function useFoodDeliverySearch(lakebed: FoodDeliveryLakebed) {
  const state = lakebed.useQuery('foodDeliveryState')
  const setFoodSearch = lakebed.useMutation('setFoodSearch')

  const submitSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (setFoodSearch.isPending) return

      const formData = new FormData(event.currentTarget)
      const address = String(formData.get('address') ?? '')
      void setFoodSearch({
        address,
        query: address,
      })
    },
    [setFoodSearch],
  )

  const chooseSearch = useCallback(
    (input: FoodDeliverySearchInput) => {
      if (setFoodSearch.isPending) return
      void setFoodSearch(input)
    },
    [setFoodSearch],
  )

  return {
    chooseSearch,
    isPending: setFoodSearch.isPending,
    state,
    submitSearch,
  }
}

export function useFoodDeliveryRestaurants(lakebed: FoodDeliveryLakebed) {
  const state = lakebed.useQuery('foodDeliveryState')
  const selectRestaurant = lakebed.useMutation('selectRestaurant')

  const select = useCallback(
    async (input: FoodDeliveryRestaurantInput) => {
      if (selectRestaurant.isPending) return
      await selectRestaurant(input)
    },
    [selectRestaurant],
  )

  return {
    isSelecting: selectRestaurant.isPending,
    select,
    state,
  }
}

export function FoodDeliverySearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: FoodDeliveryLakebed
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const foodSearch = useFoodDeliverySearch(lakebed)
  const catalog = lakebed.useQuery('restaurantCatalog') ?? []

  const chooseRestaurant = (restaurant: FoodRestaurantCatalogItem) => {
    foodSearch.chooseSearch({
      address: '',
      query: restaurant.name,
    })
    setOpen(false)
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
        title="Search restaurants"
        description="Search the generated restaurant catalog."
      >
        <CommandInput placeholder="Search restaurants..." />
        <CommandList>
          <CommandEmpty>No restaurants found.</CommandEmpty>
          <CommandGroup heading="Restaurants">
            {catalog.map((restaurant) => (
              <CommandItem
                key={restaurant.id}
                value={`${restaurant.name} ${restaurant.cuisine} ${restaurant.category}`}
                onSelect={() => chooseRestaurant(restaurant)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {restaurant.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[restaurant.cuisine, restaurant.category]
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

export function FoodDeliveryAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: FoodDeliveryLakebed
  label?: string
}) {
  const auth = lakebed.useAuth()
  const user = auth.user
  const displayName = user?.displayName ?? 'Guest'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={label} className={buttonClassName}>
          {children ?? <UserIcon className="size-5" aria-hidden="true" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate">{displayName}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user?.email ?? (user?.isGuest ? 'Guest profile' : 'Signed in')}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {auth.isAuthenticated && !user?.isGuest ? (
          <DropdownMenuItem onSelect={() => lakebed.signOut()}>
            Sign out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={() => {
              void lakebed.signInWithGoogle()
            }}
          >
            Sign in with Shoo
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function FoodDeliveryMobileMenu({
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
          <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to food delivery sections.
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
