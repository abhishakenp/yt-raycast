import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'
import { Loader2Icon, MenuIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { cn } from '#/lib/utils.ts'
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

import type {
  directoryLakebed,
  DirectoryLeadInput,
  DirectoryListingInput,
  DirectorySearchInput,
  DirectorySelectInput,
} from './directory-lakebed.ts'

export type DirectoryLakebed = LakebedClientRuntime<typeof directoryLakebed>

export function directoryListing({
  address,
  category,
  hours,
  imageAlt,
  name,
  rating,
  reviews,
}: DirectoryListingInput): DirectoryListingInput {
  return {
    address: address ?? '',
    category: category ?? '',
    hours: hours ?? '',
    imageAlt: imageAlt ?? '',
    name,
    rating: rating ?? '',
    reviews: reviews ?? '',
  }
}

export function DirectoryMutationSpinner({
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

export function DirectoryLeadButton({
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
  lakebed: DirectoryLakebed
  pendingChildren?: ReactNode
  source?: string
}) {
  const requestListing = useKeyedLakebedMutation(lakebed, 'requestListing')
  const key = `${source ?? 'directory'}\u0000${action}`
  const isButtonPending = requestListing.isPending(key)
  const input: DirectoryLeadInput =
    source === undefined ? { action } : { action, source }

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        void requestListing.run(key, input).catch(() => {})
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <DirectoryMutationSpinner />)
        : children}
    </button>
  )
}

export function useSyncDirectoryListings(
  lakebed: DirectoryLakebed,
  items: DirectoryListingInput[],
) {
  const syncListings = lakebed.useMutation('syncListings')
  const syncListingsRef = useRef(syncListings)
  const itemKey = useMemo(() => JSON.stringify(items), [items])
  const stableItems = useMemo(
    () => items.map((item) => directoryListing(item)),
    [itemKey],
  )

  useEffect(() => {
    syncListingsRef.current = syncListings
  }, [syncListings])

  useEffect(() => {
    if (!stableItems.length) return
    void syncListingsRef.current({ items: stableItems })
  }, [stableItems])
}

export function useDirectorySearch(lakebed: DirectoryLakebed) {
  const state = lakebed.useQuery('directoryState')
  const setDirectorySearch = lakebed.useMutation('setDirectorySearch')

  const submitSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (setDirectorySearch.isPending) return

      const formData = new FormData(event.currentTarget)
      void setDirectorySearch({
        category: '',
        query: String(formData.get('query') ?? ''),
      })
    },
    [setDirectorySearch],
  )

  const chooseSearch = useCallback(
    (input: DirectorySearchInput) => {
      if (setDirectorySearch.isPending) return
      void setDirectorySearch(input)
    },
    [setDirectorySearch],
  )

  return {
    chooseSearch,
    isPending: setDirectorySearch.isPending,
    state,
    submitSearch,
  }
}

export function useDirectoryListings(lakebed: DirectoryLakebed) {
  const state = lakebed.useQuery('directoryState')
  const selectListing = lakebed.useMutation('selectListing')

  const select = useCallback(
    async (input: DirectorySelectInput) => {
      if (selectListing.isPending) return
      await selectListing(input)
    },
    [selectListing],
  )

  return {
    isSelecting: selectListing.isPending,
    select,
    state,
  }
}

export function DirectorySearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: DirectoryLakebed
  label?: string
}) {
  const directorySearch = useDirectorySearch(lakebed)
  const catalog = lakebed.useQuery('directoryCatalog') ?? []

  return (
    <CommandSearch
      search={{
        items: catalog,
        getKey: (item) => item.id,
        getValue: (item) => `${item.name} ${item.category} ${item.address}`,
        onSelect: (item) =>
          directorySearch.chooseSearch({
            category: item.category,
            query: item.name,
          }),
      }}
    >
      <CommandSearchTrigger className={buttonClassName} aria-label={label}>
        {children}
      </CommandSearchTrigger>
      <CommandSearchContent
        title="Search directory"
        description="Search the generated business directory."
      >
        <CommandSearchInput placeholder="Search businesses..." />
        <CommandSearchList>
          <CommandSearchEmpty>No businesses found.</CommandSearchEmpty>
          <CommandSearchGroup heading="Businesses">
            {(item) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[item.category, item.address].filter(Boolean).join(' · ')}
                </p>
              </div>
            )}
          </CommandSearchGroup>
        </CommandSearchList>
      </CommandSearchContent>
    </CommandSearch>
  )
}

export function DirectoryAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: DirectoryLakebed
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

export function DirectoryMobileMenu({
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
            Navigate to a directory section.
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
