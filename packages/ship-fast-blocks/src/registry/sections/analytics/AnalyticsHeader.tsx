import { defineCapsule } from '#/capsules/openui.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod/v4'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet.tsx'
import {
  analyticsAdminLakebed,
  type AnalyticsNotificationRecord,
} from './analytics-admin-lakebed.ts'
import { PageHeader } from '#/section-kit/PageHeader.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * AnalyticsHeader — sticky top header bar for a SaaS analytics dashboard. A
 * blurred, border-bottomed row pinned to the top: on the left a mobile
 * hamburger toggle plus the page title and a subtitle/greeting; on the right an
 * inline search field (md+), a date-filter icon button, and a solid primary
 * Export action with a download glyph. Search/date/export record shared
 * Lakebed actions, notifications open a real Sheet, and mobile navigation uses
 * a Sheet menu. Use as the page-level toolbar above
 * dashboard content for analytics overviews, admin panels, reporting consoles,
 * or any data-product surface that needs a title + search + export row. Renders
 * fully with no props via baked-in "Dashboard Overview" defaults.
 */
export const AnalyticsHeader = defineCapsule({
  name: 'AnalyticsHeader',
  description:
    'Sticky top header bar for a SaaS analytics dashboard: a backdrop-blurred, border-bottomed row pinned to the top with a mobile Sheet menu plus page title and subtitle/greeting on the left, and an inline search field (md+), notification Sheet, date-filter action, and a solid primary Export action with a download glyph on the right. Search/date/export record shared Lakebed actions instead of fake routing. Use as the page-level toolbar above dashboard content for analytics overviews, admin panels, reporting consoles, or any data-product surface needing a title + search + export row.',
  props: z.object({
    /** Page title shown on the left. */
    title: z.string().optional(),
    /** Subtitle / greeting under the title. */
    subtitle: z.string().optional(),
    /** Placeholder text for the search field. */
    searchPlaceholder: z.string().optional(),
    /** Label for the primary Export action. */
    exportLabel: z.string().optional(),
    /** Navigation target for the mobile hamburger toggle. */
    homeTarget: z.string().optional(),
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    notifications: z
      .array(
        z.object({
          message: z.string(),
          read: z.string().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: analyticsAdminLakebed,
  component: ({ props, lakebed }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const recordAction = useKeyedLakebedMutation(lakebed, 'recordAction')
    const markNotificationRead = useKeyedLakebedMutation(
      lakebed,
      'markNotificationRead',
    )
    const clearAllNotifications = useKeyedLakebedMutation(
      lakebed,
      'clearAllNotifications',
    )
    const syncNotifications = lakebed.useMutation('syncNotifications')
    const syncNotificationsRef = useRef(syncNotifications)
    const headerTitle = props.title ?? 'Dashboard Overview'
    const headerSubtitle =
      props.subtitle ?? "Welcome back, here's what's happening"
    const searchPlaceholder = props.searchPlaceholder ?? 'Search analytics...'
    const exportLabel = props.exportLabel ?? 'Export'
    const homeTarget = props.homeTarget ?? 'Dashboard'
    const brand = props.brand ?? 'DataFlow'
    const nav = props.nav?.length
      ? props.nav
      : [
          'Dashboard',
          'Customers',
          'Analytics',
          'Reports',
          'Notifications',
          'Settings',
        ]
    const notifications = (lakebed.useQuery('notifications') ??
      []) as AnalyticsNotificationRecord[]
    const unreadCount = (lakebed.useQuery('unreadNotificationCount') ??
      0) as number
    const defaultNotifications = useMemo(
      () =>
        props.notifications?.length
          ? props.notifications
          : [
              {
                message: 'Weekly revenue report is ready to review',
                read: 'false',
                type: 'Report',
              },
              {
                message: 'Customer cohort anomaly detected',
                read: 'false',
                type: 'Alert',
              },
              {
                message: 'Export job completed successfully',
                read: 'true',
                type: 'Export',
              },
            ],
      [props.notifications],
    )
    const notificationKey = useMemo(
      () => JSON.stringify(defaultNotifications),
      [defaultNotifications],
    )
    const stableNotifications = useMemo(
      () => defaultNotifications.map((notification) => ({ ...notification })),
      [notificationKey],
    )

    useEffect(() => {
      syncNotificationsRef.current = syncNotifications
    }, [syncNotifications])

    useEffect(() => {
      if (!stableNotifications.length) return
      void syncNotificationsRef.current({
        notifications: stableNotifications,
      })
    }, [stableNotifications])

    const runAction = (
      key: string,
      label: string,
      source: string,
      query = '',
    ) => {
      void recordAction.run(key, { label, query, source })
    }

    // ---- Inline icons (decorative, currentColor) ----
    const iconProps = {
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      'aria-hidden': true,
    }

    return (
      <PageHeader
        className={cn(
          'sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            >
              <svg {...iconProps} width={24} height={24}>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {headerTitle}
              </h1>
              <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <form
              aria-label="Analytics search"
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                const query = String(data.get('query') ?? '').trim()
                runAction(
                  `search:${query || searchPlaceholder}`,
                  query ? `Search ${query}` : 'Search analytics',
                  'header-search',
                  query,
                )
              }}
              className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-2 md:flex"
            >
              <svg
                {...iconProps}
                width={16}
                height={16}
                className="text-muted-foreground"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="query"
                placeholder={searchPlaceholder}
                aria-label="Search analytics"
                className="w-48 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
              />
            </form>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(true)}
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
            >
              <svg {...iconProps}>
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.7V5a2 2 0 1 0-4 0v.3A6 6 0 0 0 6 11v3.2a2 2 0 0 1-.6 1.4L4 17h11Z" />
                <path d="M9 17a3 3 0 0 0 6 0" />
              </svg>
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[0.625rem] font-medium leading-none text-primary-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              aria-label="Date filter"
              aria-busy={recordAction.isPending('date-filter')}
              disabled={recordAction.isPending('date-filter')}
              onClick={() => {
                runAction('date-filter', 'Date filter', 'header')
              }}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
            >
              <svg {...iconProps}>
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              aria-busy={recordAction.isPending('export')}
              disabled={recordAction.isPending('export')}
              onClick={() => {
                runAction('export', exportLabel, 'header')
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
            >
              <svg {...iconProps} width={16} height={16}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{exportLabel}</span>
            </button>
          </div>
        </div>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side="left"
            className="w-[min(100%,20rem)] border-r border-border bg-background p-0 text-foreground sm:max-w-[20rem]"
          >
            <SheetHeader className="border-b border-border px-5 py-4 text-left">
              <SheetTitle>{brand}</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate analytics workspace pages.
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-3 py-4">
              <NavbarRouteLink
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                onClick={() => {
                  setMenuOpen(false)
                }}
                href={homeTarget}
              >
                Home
              </NavbarRouteLink>
              {nav.map((label) => (
                <NavbarRouteLink
                  key={label}
                  className="rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setMenuOpen(false)
                  }}
                  href={label}
                >
                  {label}
                </NavbarRouteLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <SheetContent
            side="right"
            className="w-[min(100%,28rem)] gap-0 border-l border-border bg-background p-0 text-foreground sm:max-w-[28rem]"
          >
            <SheetHeader className="border-b border-border px-6 py-5 text-left">
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                {notifications.length
                  ? `${notifications.length} workspace update${notifications.length === 1 ? '' : 's'}`
                  : 'No workspace updates'}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-3 px-6 py-5">
              {notifications.length ? (
                notifications.map((notification) => {
                  const read = notification.read === 'true'
                  const key = `read:${notification.id}`

                  return (
                    <Card
                      key={notification.id}
                      className={cn(!read && 'bg-muted/40', 'rounded-lg p-4')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notification.type}
                          </p>
                        </div>
                        {!read ? (
                          <button
                            type="button"
                            aria-busy={markNotificationRead.isPending(key)}
                            disabled={markNotificationRead.isPending(key)}
                            onClick={() => {
                              void markNotificationRead.run(key, {
                                id: notification.id,
                              })
                            }}
                            className="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-60"
                          >
                            Mark read
                          </button>
                        ) : null}
                      </div>
                    </Card>
                  )
                })
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    All caught up
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    New analytics updates will appear here.
                  </p>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border px-6 py-5">
              {notifications.length ? (
                <button
                  type="button"
                  aria-busy={clearAllNotifications.isPending('clear-all')}
                  disabled={clearAllNotifications.isPending('clear-all')}
                  onClick={() => {
                    void clearAllNotifications.run('clear-all')
                  }}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                >
                  Clear all
                </button>
              ) : null}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </PageHeader>
    )
  },
})
