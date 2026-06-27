import type { ButtonHTMLAttributes, ReactNode } from 'react'
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
  AutoVehicleInput,
  autoDealershipLakebed,
} from './auto-dealership-lakebed.ts'

export type AutoDealershipLakebed = LakebedClientRuntime<
  typeof autoDealershipLakebed
>

type AutoLeadSummary = ReturnType<
  typeof autoDealershipLakebed.queries.leadSummary
>

export const autoVehicle = ({
  badge,
  imageAlt,
  name,
  price,
  specs,
}: AutoVehicleInput): AutoVehicleInput => ({
  badge: badge ?? '',
  imageAlt: imageAlt ?? '',
  name,
  price: price ?? '',
  specs: specs ?? '',
})

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
  const [open, setOpen] = useState(false)
  const lead = useKeyedLakebedMutation(lakebed, 'recordLead')
  const vehicles = lakebed.useQuery('vehicleCatalog') ?? []

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
        title="Search vehicles"
        description="Search inventory and start a test-drive request."
      >
        <CommandInput placeholder="Search by model, price, or specs..." />
        <CommandList>
          <CommandEmpty>No vehicles found.</CommandEmpty>
          <CommandGroup heading="Inventory">
            {vehicles.map((vehicle) => (
              <CommandItem
                key={vehicle.id}
                value={`${vehicle.name} ${vehicle.price} ${vehicle.specs} ${vehicle.badge}`}
                onSelect={() => {
                  setOpen(false)
                  void lead.run(`search:${vehicle.name}`, {
                    action: 'search',
                    label: `Selected ${vehicle.name}`,
                    source: 'search',
                    vehicle: vehicle.name,
                  })
                }}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {vehicle.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[vehicle.price, vehicle.specs, vehicle.badge]
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
