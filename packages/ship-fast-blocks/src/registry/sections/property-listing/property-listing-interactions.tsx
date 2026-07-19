import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'
import { HeartIcon, Loader2Icon, MenuIcon } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { cn } from '#/lib/utils.ts'
import type {
  PropertyListingCatalogInput,
  PropertyListingInquiryInput,
  PropertyListingSaveInput,
  PropertyListingSearchInput,
  PropertyListingSelectInput,
  propertyListingLakebed,
} from './property-listing-lakebed.ts'
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
  NavbarRouteLink,
} from '#/section-kit/index.ts'

export type PropertyListingLakebed = LakebedClientRuntime<
  typeof propertyListingLakebed
>

export function propertyListingCatalogItem({
  address,
  baths,
  beds,
  price,
  sqft,
  tag,
}: PropertyListingCatalogInput): PropertyListingCatalogInput {
  return {
    address,
    baths,
    beds,
    price,
    sqft,
    tag: tag ?? '',
  }
}

export function PropertyListingMutationSpinner({
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

export function useSyncPropertyListings(
  lakebed: PropertyListingLakebed,
  listings: PropertyListingCatalogInput[],
) {
  const syncListings = lakebed.useMutation('syncPropertyListings')
  const syncListingsRef = useRef(syncListings)
  const listingKey = useMemo(() => JSON.stringify(listings), [listings])
  const stableListings = useMemo(
    () => listings.map((listing) => propertyListingCatalogItem(listing)),
    [listingKey],
  )

  useEffect(() => {
    syncListingsRef.current = syncListings
  }, [syncListings])

  useEffect(() => {
    if (!stableListings.length) return
    void syncListingsRef.current({ listings: stableListings })
  }, [stableListings])
}

export function usePropertyListingSearch(lakebed: PropertyListingLakebed) {
  const state = lakebed.useQuery('propertyListingState')
  const setPropertySearch = lakebed.useMutation('setPropertySearch')

  const submitSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (setPropertySearch.isPending) return

      const formData = new FormData(event.currentTarget)
      void setPropertySearch({
        filter: String(formData.get('filter') ?? ''),
        location: String(formData.get('location') ?? ''),
        query: '',
      })
    },
    [setPropertySearch],
  )

  const chooseSearch = useCallback(
    async (input: PropertyListingSearchInput) => {
      if (setPropertySearch.isPending) return undefined
      return setPropertySearch(input)
    },
    [setPropertySearch],
  )

  return {
    chooseSearch,
    isPending: setPropertySearch.isPending,
    state,
    submitSearch,
  }
}

export function usePropertyListingActions(lakebed: PropertyListingLakebed) {
  const state = lakebed.useQuery('propertyListingState')
  const saveListing = useKeyedLakebedMutation(lakebed, 'saveListing')
  const selectListing = lakebed.useMutation('selectListing')

  const save = useCallback(
    async (input: PropertyListingSaveInput) => {
      const key = input.address.trim()
      if (!key) return
      await saveListing.run(key, input)
    },
    [saveListing],
  )

  const select = useCallback(
    async (input: PropertyListingSelectInput) => {
      if (selectListing.isPending) return
      await selectListing(input)
    },
    [selectListing],
  )

  return {
    isSaving: saveListing.hasPending,
    isSelecting: selectListing.isPending,
    save,
    select,
    state,
  }
}

export function PropertyListingSaveButton({
  address,
  children,
  disabled,
  lakebed,
  pendingChildren,
  price,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  address: string
  children: ReactNode
  lakebed: PropertyListingLakebed
  pendingChildren?: ReactNode
  price?: string
}) {
  const saveListing = useKeyedLakebedMutation(lakebed, 'saveListing')
  const key = `save\u0000${address}`
  const isButtonPending = saveListing.isPending(key)
  const input: PropertyListingSaveInput =
    price === undefined ? { address } : { address, price }

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        void saveListing.run(key, input).catch(() => {})
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <PropertyListingMutationSpinner />)
        : children}
    </button>
  )
}

export function PropertyListingInquiryButton({
  address,
  children,
  disabled,
  intent,
  lakebed,
  pendingChildren,
  source,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  address?: string
  children: ReactNode
  intent: string
  lakebed: PropertyListingLakebed
  pendingChildren?: ReactNode
  source?: string
}) {
  const recordPropertyInquiry = useKeyedLakebedMutation(
    lakebed,
    'recordPropertyInquiry',
  )
  const key = `${source ?? 'property-listing'}\u0000${intent}\u0000${
    address ?? ''
  }`
  const isButtonPending = recordPropertyInquiry.isPending(key)
  const input: PropertyListingInquiryInput = { intent }
  if (address !== undefined) input.address = address
  if (source !== undefined) input.source = source

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        void recordPropertyInquiry.run(key, input).catch(() => {})
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <PropertyListingMutationSpinner />)
        : children}
    </button>
  )
}

export function PropertyListingStatusBadge({
  className,
  lakebed,
}: {
  className?: string
  lakebed: PropertyListingLakebed
}) {
  const state = lakebed.useQuery('propertyListingState')
  const savedCount = state?.savedCount ?? 0
  const inquiryCount = state?.inquiryCount ?? 0
  const label =
    savedCount > 0
      ? `${savedCount} saved`
      : inquiryCount > 0
        ? `${inquiryCount} request${inquiryCount === 1 ? '' : 's'}`
        : ''

  if (!label) return null

  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:inline-flex',
        className,
      )}
    >
      <HeartIcon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

export function PropertyListingSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search listings',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: PropertyListingLakebed
  label?: string
}) {
  const search = usePropertyListingSearch(lakebed)
  const selectListing = lakebed.useMutation('selectListing')
  const listings = lakebed.useQuery('propertyCatalog') ?? []

  return (
    <CommandSearch
      search={{
        items: listings,
        getKey: (listing) => listing.id ?? listing.address,
        getValue: (listing) =>
          `${listing.address} ${listing.price} ${listing.beds} ${listing.baths} ${listing.sqft} ${listing.tag}`,
        onSelect: (listing) =>
          search
            .chooseSearch({
              filter: listing.price.includes('/mo') ? 'For Rent' : 'For Sale',
              location: '',
              query: listing.address,
            })
            .then(() => selectListing({ address: listing.address })),
      }}
    >
      <CommandSearchTrigger className={buttonClassName} aria-label={label}>
        {children}
      </CommandSearchTrigger>
      <CommandSearchContent
        title="Search listings"
        description="Search the generated property catalog."
      >
        <CommandSearchInput placeholder="Search listings..." />
        <CommandSearchList>
          <CommandSearchEmpty>No listings found.</CommandSearchEmpty>
          <CommandSearchGroup heading="Listings">
            {(listing) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {listing.address}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {[listing.price, `${listing.beds} bd`, listing.tag]
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

export function PropertyListingAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: PropertyListingLakebed
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

export function PropertyListingMobileMenu({
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
            Navigate to property listing sections.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3 py-4">
          <NavbarRouteLink
            className="rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            href={homeTarget ?? nav[0]}
            onClick={() => setOpen(false)}
          >
            Home
          </NavbarRouteLink>
          {nav.map((item) => (
            <NavbarRouteLink
              key={item}
              className="rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
