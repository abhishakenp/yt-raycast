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
import type { EventTicketInput, eventLakebed } from './event-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export type EventLakebed = LakebedClientRuntime<typeof eventLakebed>

type EventRegistrationSummary = ReturnType<
  typeof eventLakebed.queries.registrationSummary
>

export function eventTicket({
  availability,
  cta,
  name,
  price,
  unit,
}: EventTicketInput): EventTicketInput {
  return {
    availability: availability ?? '',
    cta: cta ?? '',
    name,
    price: price ?? '',
    unit: unit ?? '',
  }
}

export function EventMutationSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      aria-hidden="true"
      className={cn('size-4 animate-spin', className)}
    />
  )
}

export function useSyncEventTickets(
  lakebed: EventLakebed,
  tickets: EventTicketInput[],
) {
  const syncTickets = lakebed.useMutation('syncTickets')
  const syncTicketsRef = useRef(syncTickets)
  const ticketKey = useMemo(() => JSON.stringify(tickets), [tickets])
  const stableTickets = useMemo(
    () => tickets.map((ticket) => ({ ...ticket })),
    [ticketKey],
  )

  useEffect(() => {
    syncTicketsRef.current = syncTickets
  }, [syncTickets])

  useEffect(() => {
    if (!stableTickets.length) return
    void syncTicketsRef.current({ tickets: stableTickets })
  }, [stableTickets])
}

export function EventActionButton({
  action = 'register',
  children,
  disabled,
  intentKey,
  label,
  lakebed,
  onComplete,
  pendingChildren,
  source,
  tier,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  action?: string
  children: ReactNode
  intentKey?: string
  label: string
  lakebed: EventLakebed
  onComplete?: () => void
  pendingChildren?: ReactNode
  source?: string
  tier?: string
}) {
  const eventAction = useKeyedLakebedMutation(lakebed, 'recordEventAction')
  const key = intentKey ?? `${source ?? 'event'}:${tier ?? label}`
  const isPending = eventAction.isPending(key)

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isPending}
      disabled={disabled || isPending}
      onClick={() => {
        void eventAction
          .run(key, {
            action,
            label,
            source,
            tier: tier ?? '',
          })
          .then(
            () => onComplete?.(),
            () => onComplete?.(),
          )
      }}
    >
      {isPending ? (pendingChildren ?? <EventMutationSpinner />) : children}
    </button>
  )
}

export function EventRegistrationBadge({
  className,
  lakebed,
}: {
  className?: string
  lakebed: EventLakebed
}) {
  const summary: EventRegistrationSummary | null = lakebed.useQuery(
    'registrationSummary',
  )
  const label = summary?.currentTier || summary?.currentLabel

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

export function EventMobileMenu({
  brand,
  buttonClassName,
  ctaLabel,
  homeTarget,
  lakebed,
  nav,
}: {
  brand: string
  buttonClassName?: string
  ctaLabel: string
  homeTarget?: string
  lakebed: EventLakebed
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
        className="w-[min(100%,22rem)] rounded-none border-l border-border bg-background p-0 text-foreground shadow-none sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate event pages or reserve a ticket.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col divide-y divide-border">
          <NavbarRouteLink
            className="rounded-none border-l-2 border-l-primary bg-muted px-5 py-3.5 text-left text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted active:translate-y-px"
            href={homeTarget ?? nav[0]}
            onClick={() => setOpen(false)}
          >
            Home
          </NavbarRouteLink>
          {nav.map((item) => (
            <NavbarRouteLink
              key={item}
              className="rounded-none border-l-2 border-l-transparent px-5 py-3.5 text-left text-sm font-medium text-muted-foreground transition-colors duration-150 hover:border-l-border hover:bg-muted hover:text-foreground active:translate-y-px"
              href={item}
              onClick={() => setOpen(false)}
            >
              {item}
            </NavbarRouteLink>
          ))}
          <EventActionButton
            lakebed={lakebed}
            action="ticket"
            label={ctaLabel}
            intentKey="mobile-nav-ticket"
            source="mobile-nav"
            onComplete={() => setOpen(false)}
            pendingChildren={
              <>
                <EventMutationSpinner />
                Reserving
              </>
            }
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-none bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
          >
            {ctaLabel}
          </EventActionButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
