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
import type {
  HotelRoomInput,
  hotelResortLakebed,
} from './hotel-resort-lakebed.ts'
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

export type HotelResortLakebed = LakebedClientRuntime<typeof hotelResortLakebed>

type HotelBookingSummary = ReturnType<
  typeof hotelResortLakebed.queries.bookingSummary
>

export function hotelRoom({
  description,
  meta,
  name,
  price,
}: HotelRoomInput): HotelRoomInput {
  return {
    description: description ?? '',
    meta: meta ?? '',
    name,
    price: price ?? '',
  }
}

function fieldsFromForm(form: HTMLFormElement) {
  const formData = new FormData(form)
  const fields: Record<string, string> = {}

  for (const [key, value] of formData.entries()) {
    fields[key] = String(value)
  }

  return fields
}

export function HotelMutationSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn('size-4 animate-spin', className)}
      aria-hidden="true"
    />
  )
}

export function useSyncHotelRooms(
  lakebed: HotelResortLakebed,
  rooms: HotelRoomInput[],
) {
  const syncRooms = lakebed.useMutation('syncRooms')
  const syncRoomsRef = useRef(syncRooms)
  const roomKey = useMemo(() => JSON.stringify(rooms), [rooms])
  const stableRooms = useMemo(
    () => rooms.map((room) => ({ ...room })),
    [roomKey],
  )

  useEffect(() => {
    syncRoomsRef.current = syncRooms
  }, [syncRooms])

  useEffect(() => {
    if (!stableRooms.length) return
    void syncRoomsRef.current({ rooms: stableRooms })
  }, [stableRooms])
}

export function useHotelAvailabilitySubmission({
  lakebed,
  source,
  successMessage = 'Thanks. We received your availability request.',
}: {
  lakebed: HotelResortLakebed
  source: string
  successMessage?: string
}) {
  const [submitted, setSubmitted] = useState(false)
  const summary: HotelBookingSummary | null = lakebed.useQuery('bookingSummary')
  const requestBooking = lakebed.useMutation('requestBooking')
  const count = summary?.count ?? 0

  const submitForm = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (requestBooking.isPending) return

      const form = event.currentTarget
      const fields = fieldsFromForm(form)
      const room = fields.roomType ?? ''

      void requestBooking({
        action: 'availability',
        fields,
        label: 'Availability request',
        room,
        source,
      }).then(
        () => {
          setSubmitted(true)
          form.reset()
        },
        () => {},
      )
    },
    [requestBooking, source],
  )

  return {
    count,
    isPending: requestBooking.isPending,
    statusText: submitted
      ? `${successMessage} ${count} total ${
          count === 1 ? 'request' : 'requests'
        }.`
      : `${count} ${count === 1 ? 'request' : 'requests'} received.`,
    submitForm,
  }
}

export function HotelBookingBadge({
  className,
  lakebed,
}: {
  className?: string
  lakebed: HotelResortLakebed
}) {
  const summary: HotelBookingSummary | null = lakebed.useQuery('bookingSummary')
  const label = summary?.currentRoom || summary?.currentLabel

  if (!label) return null

  return (
    <span
      className={cn(
        'hidden max-w-44 truncate rounded-none border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary lg:inline-flex',
        className,
      )}
    >
      {label}
    </span>
  )
}

export function HotelBookingActionButton({
  action = 'booking',
  children,
  disabled,
  intentKey,
  intentLabel,
  lakebed,
  onComplete,
  pendingChildren,
  room,
  source,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  action?: string
  children: ReactNode
  intentKey?: string
  intentLabel: string
  lakebed: HotelResortLakebed
  onComplete?: () => void
  pendingChildren?: ReactNode
  room?: string
  source?: string
}) {
  const booking = useKeyedLakebedMutation(lakebed, 'requestBooking')
  const key = intentKey ?? `${source ?? 'hotel'}:${room ?? intentLabel}`
  const isPending = booking.isPending(key)

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isPending}
      disabled={disabled || isPending}
      onClick={() => {
        void booking
          .run(key, {
            action,
            label: intentLabel,
            room: room ?? '',
            source,
          })
          .then(
            () => onComplete?.(),
            () => onComplete?.(),
          )
      }}
    >
      {isPending ? (pendingChildren ?? <HotelMutationSpinner />) : children}
    </button>
  )
}

export function HotelSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search rooms',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: HotelResortLakebed
  label?: string
}) {
  const booking = useKeyedLakebedMutation(lakebed, 'requestBooking')
  const rooms = lakebed.useQuery('roomCatalog') ?? []

  return (
    <CommandSearch
      search={{
        items: rooms,
        getKey: (room) => room.id ?? room.name,
        getValue: (room) =>
          `${room.name} ${room.price} ${room.meta} ${room.description}`,
        onSelect: (room) =>
          booking.run(`search:${room.name}`, {
            action: 'search',
            label: `Selected ${room.name}`,
            room: room.name,
            source: 'search',
          }),
      }}
    >
      <CommandSearchTrigger className={buttonClassName} aria-label={label}>
        {children}
      </CommandSearchTrigger>
      <CommandSearchContent
        title="Search rooms"
        description="Search room categories and start an availability request."
      >
        <CommandSearchInput placeholder="Search rooms..." />
        <CommandSearchList>
          <CommandSearchEmpty>No rooms found.</CommandSearchEmpty>
          <CommandSearchGroup heading="Rooms">
            {(room) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{room.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[room.price, room.meta, room.description]
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

export function HotelAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: HotelResortLakebed
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

export function HotelMobileMenu({
  brand,
  buttonClassName,
  ctaLabel,
  ctaTarget,
  homeTarget,
  lakebed,
  nav,
}: {
  brand: string
  buttonClassName?: string
  ctaLabel: string
  ctaTarget: string
  homeTarget?: string
  lakebed: HotelResortLakebed
  nav: string[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={buttonClassName}
        >
          <MenuIcon className="size-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,22rem)] border-l border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-5 text-left">
          <SheetTitle className="font-serif text-xl font-normal tracking-tight">
            {brand}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to a resort section.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col px-3 py-4">
          <NavbarRouteLink
            className="border-b border-border px-3 py-3.5 text-left text-sm text-foreground transition-colors hover:text-muted-foreground"
            href={homeTarget ?? nav[0]}
            onClick={() => setOpen(false)}
          >
            Home
          </NavbarRouteLink>
          {nav.map((item) => (
            <NavbarRouteLink
              key={item}
              className="border-b border-border px-3 py-3.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
              href={item}
              onClick={() => setOpen(false)}
            >
              {item}
            </NavbarRouteLink>
          ))}
          <HotelBookingActionButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            intentKey="mobile-nav-booking"
            source="mobile-nav"
            onComplete={() => setOpen(false)}
            pendingChildren={
              <>
                <HotelMutationSpinner />
                Sending
              </>
            }
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-none bg-foreground px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
          >
            {ctaLabel}
          </HotelBookingActionButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
