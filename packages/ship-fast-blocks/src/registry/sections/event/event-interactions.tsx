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
import { useNavigate } from '#/lib/use-navigate.tsx'
import type { EventTicketInput, eventLakebed } from './event-lakebed.ts'

export type EventLakebed = LakebedClientRuntime<typeof eventLakebed>

type EventRegistrationSummary = ReturnType<
  typeof eventLakebed.queries.registrationSummary
>

export const eventTicket = ({
  availability,
  cta,
  name,
  price,
  unit,
}: EventTicketInput): EventTicketInput => ({
  availability: availability ?? '',
  cta: cta ?? '',
  name,
  price: price ?? '',
  unit: unit ?? '',
})

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
  const summary: EventRegistrationSummary | null =
    lakebed.useQuery('registrationSummary')
  const label = summary?.currentTier || summary?.currentLabel

  if (!label) return null

  return (
    <span
      className={cn(
        'hidden max-w-44 truncate rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:inline-flex',
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
  const go = useNavigate()
  const navigate = useCallback(
    (target?: string) => {
      setOpen(false)
      go(target)
    },
    [go],
  )

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
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate event pages or reserve a ticket.
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
            className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
          >
            {ctaLabel}
          </EventActionButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
