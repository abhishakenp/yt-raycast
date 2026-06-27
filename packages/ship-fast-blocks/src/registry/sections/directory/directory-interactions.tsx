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
  directoryLakebed,
  DirectoryLeadInput,
  DirectoryListingInput,
  DirectorySearchInput,
  DirectorySelectInput,
} from './directory-lakebed.ts'

export type DirectoryLakebed = LakebedClientRuntime<typeof directoryLakebed>

type DirectoryCatalogItem = NonNullable<
  ReturnType<typeof directoryLakebed.queries.directoryCatalog>
>[number]

export const directoryListing = ({
  address,
  category,
  hours,
  imageAlt,
  name,
  rating,
  reviews,
}: DirectoryListingInput): DirectoryListingInput => ({
  address: address ?? '',
  category: category ?? '',
  hours: hours ?? '',
  imageAlt: imageAlt ?? '',
  name,
  rating: rating ?? '',
  reviews: reviews ?? '',
})

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
    (event: FormEvent<HTMLFormElement>) => {
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
  const [open, setOpen] = useState(false)
  const directorySearch = useDirectorySearch(lakebed)
  const catalog = lakebed.useQuery('directoryCatalog') ?? []

  const chooseItem = (item: DirectoryCatalogItem) => {
    directorySearch.chooseSearch({
      category: item.category,
      query: item.name,
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
        title="Search directory"
        description="Search the generated business directory."
      >
        <CommandInput placeholder="Search businesses..." />
        <CommandList>
          <CommandEmpty>No businesses found.</CommandEmpty>
          <CommandGroup heading="Businesses">
            {catalog.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.name} ${item.category} ${item.address}`}
                onSelect={() => chooseItem(item)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[item.category, item.address].filter(Boolean).join(' · ')}
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
            Navigate to a directory section.
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
