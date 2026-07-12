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
import type {
  AutoVehicleInput,
  autoDealershipLakebed,
} from './auto-dealership-lakebed.ts'
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

export type AutoDealershipLakebed = LakebedClientRuntime<
  typeof autoDealershipLakebed
>

type AutoLeadSummary = ReturnType<
  typeof autoDealershipLakebed.queries.leadSummary
>

export function autoVehicle({
  badge,
  imageAlt,
  name,
  price,
  specs,
}: AutoVehicleInput): AutoVehicleInput {
  return {
    badge: badge ?? '',
    imageAlt: imageAlt ?? '',
    name,
    price: price ?? '',
    specs: specs ?? '',
  }
}

export function AutoMutationSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      aria-hidden="true"
      className={cn('size-4 animate-spin', className)}
    />
  )
}

export function useSyncAutoVehicles(
  lakebed: AutoDealershipLakebed,
  vehicles: AutoVehicleInput[],
) {
  const syncVehicles = lakebed.useMutation('syncVehicles')
  const syncVehiclesRef = useRef(syncVehicles)
  const vehicleKey = useMemo(() => JSON.stringify(vehicles), [vehicles])
  const stableVehicles = useMemo(
    () => vehicles.map((vehicle) => ({ ...vehicle })),
    [vehicleKey],
  )

  useEffect(() => {
    syncVehiclesRef.current = syncVehicles
  }, [syncVehicles])

  useEffect(() => {
    if (!stableVehicles.length) return
    void syncVehiclesRef.current({ vehicles: stableVehicles })
  }, [stableVehicles])
}

export function AutoLeadActionButton({
  action = 'lead',
  children,
  disabled,
  intentKey,
  label,
  lakebed,
  onComplete,
  pendingChildren,
  source,
  type = 'button',
  vehicle,
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  action?: string
  children: ReactNode
  intentKey?: string
  label: string
  lakebed: AutoDealershipLakebed
  onComplete?: () => void
  pendingChildren?: ReactNode
  source?: string
  vehicle?: string
}) {
  const lead = useKeyedLakebedMutation(lakebed, 'recordLead')
  const key = intentKey ?? `${source ?? 'auto'}:${vehicle ?? label}`
  const isPending = lead.isPending(key)

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isPending}
      disabled={disabled || isPending}
      onClick={() => {
        void lead
          .run(key, {
            action,
            label,
            source,
            vehicle: vehicle ?? '',
          })
          .then(
            () => onComplete?.(),
            () => onComplete?.(),
          )
      }}
    >
      {isPending ? (pendingChildren ?? <AutoMutationSpinner />) : children}
    </button>
  )
}

export function AutoLeadBadge({
  className,
  lakebed,
}: {
  className?: string
  lakebed: AutoDealershipLakebed
}) {
  const summary: AutoLeadSummary | null = lakebed.useQuery('leadSummary')
  const label = summary?.currentVehicle || summary?.currentLabel

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

export function AutoSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search vehicles',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: AutoDealershipLakebed
  label?: string
}) {
  const lead = useKeyedLakebedMutation(lakebed, 'recordLead')
  const vehicles = lakebed.useQuery('vehicleCatalog') ?? []

  return (
    <CommandSearch
      search={{
        items: vehicles,
        getKey: (vehicle) => vehicle.id,
        getValue: (vehicle) =>
          `${vehicle.name} ${vehicle.price} ${vehicle.specs} ${vehicle.badge}`,
        onSelect: (vehicle) =>
          lead.run(`search:${vehicle.name}`, {
            action: 'search',
            label: `Selected ${vehicle.name}`,
            source: 'search',
            vehicle: vehicle.name,
          }),
      }}
    >
      <CommandSearchTrigger className={buttonClassName} aria-label={label}>
        {children}
      </CommandSearchTrigger>
      <CommandSearchContent
        title="Search vehicles"
        description="Search inventory and start a test-drive request."
      >
        <CommandSearchInput placeholder="Search by model, price, or specs..." />
        <CommandSearchList>
          <CommandSearchEmpty>No vehicles found.</CommandSearchEmpty>
          <CommandSearchGroup heading="Inventory">
            {(vehicle) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{vehicle.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[vehicle.price, vehicle.specs, vehicle.badge]
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

export function AutoAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: AutoDealershipLakebed
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

export function AutoMobileMenu({
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
  lakebed: AutoDealershipLakebed
  nav: string[]
}) {
  const [open, setOpen] = useState(false)
  const go = useNavigate()
  const navigate = useCallback(
    (target?) => {
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
            Navigate dealership pages or start a test-drive request.
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
          <AutoLeadActionButton
            lakebed={lakebed}
            action="test_drive"
            label={ctaLabel}
            intentKey="mobile-nav-test-drive"
            source="mobile-nav"
            onComplete={() => setOpen(false)}
            pendingChildren={
              <>
                <AutoMutationSpinner />
                Sending
              </>
            }
            className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
          >
            {ctaLabel}
          </AutoLeadActionButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
