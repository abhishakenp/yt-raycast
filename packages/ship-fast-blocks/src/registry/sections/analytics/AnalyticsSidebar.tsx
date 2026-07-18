import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { NavSidebar } from '#/section-kit/NavSidebar.tsx'
import { Image } from '#/lib/img.tsx'
import { analyticsAdminLakebed } from './analytics-admin-lakebed.ts'

/**
 * AnalyticsSidebar — fixed left dashboard sidebar for a SaaS analytics / admin
 * product. A full-height, bordered card column (hidden below lg) with a brand
 * header (solid token logo tile + product name), a primary nav list with
 * line-icons, an active first item, and a count badge on the Notifications item,
 * plus a bottom user profile card (avatar, name, role). Nav items route through
 * useNavigate; notification count and profile auth use shared Lakebed state. Use as
 * the persistent left rail for analytics dashboards, admin panels, BI consoles,
 * or any data-product control surface. Renders fully with no props via baked-in
 * "DataFlow" defaults.
 */
export const AnalyticsSidebar = defineCapsule({
  name: 'AnalyticsSidebar',
  description:
    'Fixed left dashboard sidebar for a SaaS analytics / admin product: a full-height bordered card column (hidden below lg) with a brand header (solid token logo tile + product name), a primary nav list with line-icons and an active first item, a shared Lakebed count badge on the Notifications item, and a bottom Shoo/Lakebed profile card. Nav items route through useNavigate for page-switching. Use as the persistent left rail for analytics dashboards, admin panels, business-intelligence consoles, or any data-product control surface.',
  props: z.object({
    /** Brand / product name shown in the sidebar header. */
    brand: z.string().optional(),
    /** Sidebar nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Count badge shown on the "Notifications" nav item. */
    notificationCount: z.string().optional(),
    /** Sidebar user profile card. */
    user: z
      .object({
        name: z.string().optional(),
        role: z.string().optional(),
        avatarAlt: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: analyticsAdminLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const auth = lakebed.useAuth()
    const unreadCount = (lakebed.useQuery('unreadNotificationCount') ?? 0) as number
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
    const notificationCount =
      unreadCount > 0 ? String(unreadCount) : (props.notificationCount ?? '3')
    const authUser = auth.user
    const isSignedIn = auth.isAuthenticated && !authUser?.isGuest
    const userName = isSignedIn
      ? (authUser?.displayName ?? authUser?.email ?? 'Account')
      : (props.user?.name ?? 'Marcus Chen')
    const userRole = props.user?.role ?? 'Product Manager'
    const userAvatarAlt =
      props.user?.avatarAlt ??
      'Professional headshot of a product manager with short brown hair and a friendly smile'

    // Brand logo tile — solid token mark with the brand initial (decorative).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary font-black text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

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

    const navIcons: Record<string, ReactNode> = {
      Dashboard: (
        <svg {...iconProps}>
          <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      Customers: (
        <svg {...iconProps}>
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      Analytics: (
        <svg {...iconProps}>
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      Reports: (
        <svg {...iconProps}>
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      Notifications: (
        <svg {...iconProps}>
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      Settings: (
        <svg {...iconProps}>
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    }

    return (
      <NavSidebar
        variant="card"
        className={cn(
          'fixed left-0 top-0 z-50 hidden h-full w-64 lg:flex',
          props.className,
        )}
      >
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-8 text-sm" />}
              labelClassName="text-lg font-semibold text-card-foreground"
            />
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map((label, i) => {
            const active = i === 0
            return (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {navIcons[label] ?? navIcons.Dashboard}
                <span>{label}</span>
                {label === 'Notifications' ? (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {notificationCount}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            type="button"
            aria-label={isSignedIn ? 'Sign out' : 'Sign in with Shoo'}
            onClick={() => {
              if (isSignedIn) {
                lakebed.signOut()
                return
              }

              void lakebed.signInWithGoogle()
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted"
          >
            <Image
              alt={userAvatarAlt}
              w={80}
              h={80}
              className="size-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-card-foreground">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
          </button>
        </div>
      </NavSidebar>
    )
  },
})
