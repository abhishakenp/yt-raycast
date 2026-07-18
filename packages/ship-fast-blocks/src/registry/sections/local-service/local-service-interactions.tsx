import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { Loader2Icon, MenuIcon, SparklesIcon } from 'lucide-react'

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
  LocalServiceItemInput,
  localServiceLakebed,
} from './local-service-lakebed.ts'

export type LocalServiceLakebed = LakebedClientRuntime<
  typeof localServiceLakebed
>

type BookingSummary = ReturnType<
  typeof localServiceLakebed.queries.bookingSummary
>

export function localServiceItem({
  name,
  price,
  summary,
}: LocalServiceItemInput): LocalServiceItemInput {
  return {
    name,
    price: price ?? '',
    summary: summary ?? '',
  }
}

export function LocalServiceMutationSpinner({
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

export function useSyncLocalServices(
  lakebed: LocalServiceLakebed,
  services: LocalServiceItemInput[],
) {
  const syncServices = lakebed.useMutation('syncServices')
  const syncServicesRef = useRef(syncServices)
  const serviceKey = useMemo(() => JSON.stringify(services), [services])
  const stableServices = useMemo(
    () => services.map((service) => ({ ...service })),
    [serviceKey],
  )

  useEffect(() => {
    syncServicesRef.current = syncServices
  }, [syncServices])

  useEffect(() => {
    if (!stableServices.length) return
    void syncServicesRef.current({ services: stableServices })
  }, [stableServices])
}

export function LocalServiceIntentBadge({
  className,
  lakebed,
}: {
  className?: string
  lakebed: LocalServiceLakebed
}) {
  const summary: BookingSummary | null = lakebed.useQuery('bookingSummary')
  const label = summary?.currentService || summary?.currentLabel

  if (!label) return null

  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:inline-flex',
        className,
      )}
    >
      <SparklesIcon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

export function LocalServiceBookingButton({
  children,
  disabled,
  intentLabel,
  lakebed,
  pendingChildren,
  service,
  source,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  children: ReactNode
  intentLabel: string
  lakebed: LocalServiceLakebed
  pendingChildren?: ReactNode
  service?: string
  source?: string
}) {
  const requestBooking = lakebed.useMutation('requestBooking')
  const [isButtonPending, setIsButtonPending] = useState(false)

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        setIsButtonPending(true)
        void requestBooking({
          label: intentLabel,
          service: service ?? intentLabel,
          source,
        }).then(
          () => setIsButtonPending(false),
          () => setIsButtonPending(false),
        )
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <LocalServiceMutationSpinner />)
        : children}
    </button>
  )
}

export function LocalServiceSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search services',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: LocalServiceLakebed
  label?: string
}) {
  const go = useNavigate()
  const requestBooking = lakebed.useMutation('requestBooking')
  const services = lakebed.useQuery('serviceCatalog') ?? []

  return (
    <CommandSearch
      search={{
        items: services,
        getKey: (service) => service.id,
        getValue: (service) =>
          `${service.name} ${service.price} ${service.summary}`,
        onSelect: (service) => {
          go(service.name)
          return requestBooking({
            label: `Selected ${service.name}`,
            service: service.name,
            source: 'search',
          }).then(() => {})
        },
      }}
    >
      <CommandSearchTrigger className={buttonClassName} aria-label={label}>
        {children}
      </CommandSearchTrigger>
      <CommandSearchContent
        title="Search services"
        description="Search generated services and select one for booking."
      >
        <CommandSearchInput placeholder="Search services..." />
        <CommandSearchList>
          <CommandSearchEmpty>No services found.</CommandSearchEmpty>
          <CommandSearchGroup heading="Services">
            {(service) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{service.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[service.price, service.summary].filter(Boolean).join(' · ')}
                </p>
              </div>
            )}
          </CommandSearchGroup>
        </CommandSearchList>
      </CommandSearchContent>
    </CommandSearch>
  )
}

export function LocalServiceAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: LocalServiceLakebed
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

export function LocalServiceMobileMenu({
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

  const navigate = useCallback(
    (target: string) => {
      setOpen(false)
      go(target)
    },
    [go],
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
            Navigate to local service sections.
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
