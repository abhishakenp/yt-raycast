import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { Loader2Icon, MenuIcon, SparklesIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'
import {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownItem,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
  Card,
  CommandSearch,
  CommandSearchTrigger,
  CommandSearchContent,
  CommandSearchInput,
  CommandSearchList,
  CommandSearchEmpty,
  CommandSearchGroup,
} from '#/section-kit/index.ts'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { cn } from '#/lib/utils.ts'
import { useIsActiveRoute, useRouteHref } from '#/lib/use-navigate.tsx'
import type { SaasPlanInput, saasLakebed } from './saas-lakebed.ts'

type SaasLakebedRuntime = LakebedClientRuntime<typeof saasLakebed>
type SaasAuthValue = ReturnType<SaasLakebedRuntime['useAuth']>

export type SaasLakebed = Omit<SaasLakebedRuntime, 'useAuth'> & {
  useAuth(): Omit<SaasAuthValue, 'user'> & {
    user: SaasAuthValue['user'] | null
  }
}

type SaasSummary = ReturnType<typeof saasLakebed.queries.conversionSummary>
type SaasAuthSessionSummary = ReturnType<
  typeof saasLakebed.queries.authSessionSummary
>

const demoIntentPattern = /\b(book|demo|sales|contact|call|enterprise)\b/i

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'ME'
  )
}

export function saasPlan({
  name,
  period,
  price,
  summary,
}: SaasPlanInput): SaasPlanInput {
  return {
    name,
    period: period ?? '',
    price: price ?? '',
    summary: summary ?? '',
  }
}

export function SaasMutationSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn('size-4 animate-spin', className)}
      aria-hidden="true"
    />
  )
}

export function useSyncSaasPlans(lakebed: SaasLakebed, plans: SaasPlanInput[]) {
  const syncPlans = lakebed.useMutation('syncPlans')
  const syncPlansRef = useRef(syncPlans)
  const planKey = useMemo(() => JSON.stringify(plans), [plans])
  const stablePlans = useMemo(
    () => plans.map((plan) => ({ ...plan })),
    [planKey],
  )

  useEffect(() => {
    syncPlansRef.current = syncPlans
  }, [syncPlans])

  useEffect(() => {
    if (!stablePlans.length) return
    void syncPlansRef.current({ plans: stablePlans })
  }, [stablePlans])
}

export function SaasIntentBadge({
  className,
  lakebed,
}: {
  className?: string
  lakebed: SaasLakebed
}) {
  const summary: SaasSummary | null = lakebed.useQuery('conversionSummary')
  const label = summary?.currentPlan || summary?.currentLabel

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

export function SaasPlanActionButton({
  children,
  disabled,
  intentLabel,
  lakebed,
  pendingChildren,
  plan,
  source,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  children: ReactNode
  intentLabel: string
  lakebed: SaasLakebed
  pendingChildren?: ReactNode
  plan?: string
  source?: string
}) {
  const selectPlan = lakebed.useMutation('selectPlan')
  const requestDemo = lakebed.useMutation('requestDemo')
  const [isButtonPending, setIsButtonPending] = useState(false)
  const isDemoIntent = demoIntentPattern.test(intentLabel)
  const mutation = isDemoIntent ? requestDemo : selectPlan

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        setIsButtonPending(true)
        void mutation({
          label: intentLabel,
          plan: plan ?? intentLabel,
          source,
        }).then(
          () => setIsButtonPending(false),
          () => setIsButtonPending(false),
        )
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <SaasMutationSpinner />)
        : children}
    </button>
  )
}

export function SaasSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search plans',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: SaasLakebed
  label?: string
}) {
  const go = useNavigate()
  const selectPlan = lakebed.useMutation('selectPlan')
  const plans = lakebed.useQuery('planCatalog') ?? []

  return (
    <CommandSearch
      search={{
        items: plans,
        getKey: (plan) => plan.id,
        getValue: (plan) =>
          `${plan.name} ${plan.price} ${plan.period} ${plan.summary}`,
        onSelect: (plan) => {
          void selectPlan({
            label: `Selected ${plan.name}`,
            plan: plan.name,
            source: 'search',
          })
          go(plan.name)
        },
      }}
    >
      <CommandSearchTrigger className={buttonClassName} aria-label={label}>
        {children}
      </CommandSearchTrigger>
      <CommandSearchContent
        title="Search plans"
        description="Search generated plans and select one for the workspace."
      >
        <CommandSearchInput placeholder="Search plans..." />
        <CommandSearchList>
          <CommandSearchEmpty>No plans found.</CommandSearchEmpty>
          <CommandSearchGroup heading="Plans">
            {(plan) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{plan.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[plan.price, plan.period, plan.summary]
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

export function SaasAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: SaasLakebed
  label?: string
}) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const auth = lakebed.useAuth()
  const sessionSummary: SaasAuthSessionSummary | null =
    lakebed.useQuery('authSessionSummary')
  const recordAuthSession = lakebed.useMutation('recordAuthSession')
  const clearAuthSessions = lakebed.useMutation('clearAuthSessions')
  const recordAuthSessionRef = useRef(recordAuthSession)
  const recordedSessionKeyRef = useRef('')
  const pendingSessionKeyRef = useRef('')
  const sessionRecordAttemptsRef = useRef<Record<string, number>>({})
  const [sessionRecordRetry, setSessionRecordRetry] = useState(0)
  const user = auth.user ?? {
    displayName: auth.displayName ?? 'Guest',
    email: auth.email,
    id: auth.userId ?? 'guest:local',
    isGuest: auth.isGuest ?? true,
    picture: auth.picture,
    provider: auth.provider ?? 'guest',
    userId: auth.userId ?? 'guest:local',
  }
  const isSignedIn = auth.isAuthenticated && !auth.isGuest && !user.isGuest
  const displayName =
    auth.displayName || user.displayName || auth.email || user.email || 'Guest'
  const email = auth.email || user.email
  const picture = auth.picture || user.picture
  const sessions = sessionSummary?.sessions ?? []
  const initials = initialsFromName(displayName)
  const providerLabel =
    auth.provider === 'google' ? 'Google via Shoo' : 'Shoo profile'
  const statusLabel = auth.isLoading
    ? 'Checking session'
    : isSignedIn
      ? providerLabel
      : 'Guest profile'

  useEffect(() => {
    recordAuthSessionRef.current = recordAuthSession
  }, [recordAuthSession])

  useEffect(() => {
    if (!isSignedIn || !email || auth.isLoading) return

    const sessionKey = `${email.toLowerCase()}:${providerLabel}`
    if (recordedSessionKeyRef.current === sessionKey) return
    if (pendingSessionKeyRef.current === sessionKey) return

    const attempts = sessionRecordAttemptsRef.current[sessionKey] ?? 0
    if (attempts >= 2) return

    pendingSessionKeyRef.current = sessionKey
    sessionRecordAttemptsRef.current = {
      ...sessionRecordAttemptsRef.current,
      [sessionKey]: attempts + 1,
    }
    void recordAuthSessionRef
      .current({
        displayName,
        email,
        provider: providerLabel,
      })
      .then(
        () => {
          pendingSessionKeyRef.current = ''
          sessionRecordAttemptsRef.current = {
            ...sessionRecordAttemptsRef.current,
            [sessionKey]: 0,
          }
          recordedSessionKeyRef.current = sessionKey
        },
        () => {
          pendingSessionKeyRef.current = ''
          if ((sessionRecordAttemptsRef.current[sessionKey] ?? 0) < 2) {
            setSessionRecordRetry((value) => value + 1)
          }
        },
      )
  }, [
    auth.isLoading,
    displayName,
    email,
    isSignedIn,
    providerLabel,
    sessionRecordRetry,
  ])

  return (
    <>
      <AccountDropdown auth={lakebed}>
        <AccountDropdownTrigger aria-label={label} className={buttonClassName}>
          {children}
        </AccountDropdownTrigger>
        <AccountDropdownContent className="w-72 overflow-hidden p-0">
          <AccountDropdownLabel className="bg-muted/40 p-4 font-normal">
            <span className="flex min-w-0 items-center gap-3">
              <Avatar className="size-11 border border-border bg-background">
                {picture ? (
                  <AvatarImage src={picture} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-foreground text-xs font-bold text-background">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {email || statusLabel}
                </span>
              </span>
            </span>
          </AccountDropdownLabel>
          <AccountDropdownSeparator className="m-0" />
          <div className="p-2">
            <AccountDropdownItem
              disabled={auth.isLoading}
              onSelect={() => {
                window.setTimeout(() => setHistoryOpen(true), 0)
              }}
            >
              Session history
            </AccountDropdownItem>
            <AccountDropdownSignOut />
          </div>
        </AccountDropdownContent>
        <AccountDropdownUnauthenticated />
      </AccountDropdown>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent
          side="right"
          className="w-[min(100%,24rem)] gap-0 border-l border-border bg-background p-0 text-foreground sm:max-w-[24rem]"
        >
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle className="text-base font-semibold">
              Session history
            </SheetTitle>
            <SheetDescription>
              {sessions.length
                ? `${sessions.length} Shoo session${
                    sessions.length === 1 ? '' : 's'
                  } recorded.`
                : 'No Shoo sessions recorded yet.'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
            {sessions.length ? (
              sessions.map((session) => (
                <Card
                  key={session.id}
                  className="p-3 rounded-lg p-4"
                >
                  <p className="truncate text-sm font-semibold text-card-foreground">
                    {session.displayName || session.email}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {session.email}
                  </p>
                  <div className="mt-3 flex items-center justify-end gap-3 text-xs text-muted-foreground">
                    <span>
                      {session.signedInAt
                        ? new Date(session.signedInAt).toLocaleString()
                        : 'Unknown time'}
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-5 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No sessions recorded
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in with Shoo to start tracking session history.
                </p>
              </div>
            )}
          </div>
          <SheetFooter className="gap-2 border-t border-border px-5 py-4">
            <button
              type="button"
              disabled={!sessions.length || clearAuthSessions.isPending}
              aria-busy={clearAuthSessions.isPending}
              onClick={() => {
                void clearAuthSessions()
              }}
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              {clearAuthSessions.isPending ? (
                <SaasMutationSpinner />
              ) : (
                'Clear history'
              )}
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Close
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function SaasMobileMenu({
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
  const homeHref = useRouteHref(homeTarget ?? 'Home')
  const isActiveRoute = useIsActiveRoute()
  const normalizedHomeLabel = 'home'
  const targetHome = homeTarget ?? 'Home'
  const links = nav.filter((item) => {
    const navLabel = item.trim()
    return navLabel && navLabel.toLowerCase() !== normalizedHomeLabel
  })

  const closeMenu = useCallback(() => setOpen(false), [])

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
            Navigate to a software section.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3 py-4">
          <a
            href={homeHref}
            onClick={closeMenu}
            aria-current={isActiveRoute(targetHome) ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted',
              isActiveRoute(targetHome) && 'border-l-2 border-primary bg-muted',
            )}
          >
            Home
          </a>
          {links.map((item) => (
            <SaasMobileMenuLink key={item} item={item} onNavigate={closeMenu} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SaasMobileMenuLink({
  item,
  onNavigate,
}: {
  item: string
  onNavigate: () => void
}) {
  const href = useRouteHref(item)
  const isActive = useIsActiveRoute()(item)
  return (
    <a
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        isActive && 'border-l-2 border-primary bg-muted text-foreground',
      )}
    >
      {item}
    </a>
  )
}
