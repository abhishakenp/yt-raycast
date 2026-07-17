import { defineCapsule } from '#/capsules/openui.ts'
import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { NavSidebar } from '#/section-kit/NavSidebar.tsx'
import { Image } from '#/lib/img.tsx'
import { dashboardLakebed } from './dashboard-lakebed.ts'

/**
 * DashboardSidebar — a fixed left navigation rail for a SaaS admin dashboard. A
 * full-height bordered card column (hidden below md, with a slide-in mobile
 * drawer + scrim toggled by an exposed hamburger button) holding an indigo brand
 * tile + product name at top, a primary line-icon nav group with an active state
 * and a count badge on the Orders item, a "Support" sub-group below it, and a
 * bottom user footer (avatar, name, email, sign-out). Every nav item, the brand
 * through useNavigate and the footer account button uses Shoo/Lakebed auth.
 * Use as the persistent left rail for an authenticated admin area, back office,
 * analytics console, CRM or internal SaaS tool. Renders fully with no props via
 * baked-in "Orbit" defaults.
 */
export const DashboardSidebar = defineCapsule({
  name: 'DashboardSidebar',
  description:
    "A fixed left navigation rail for a SaaS admin dashboard: a full-height bordered card column (hidden below md, with a slide-in mobile drawer + scrim toggled by an exposed hamburger button) holding an indigo brand tile + product name, a primary line-icon nav group with an active state and a count badge on the Orders item, a 'Support' sub-group, and a bottom user footer wired to Shoo/Lakebed auth. Nav items and the brand route through useNavigate for page-switching. Use as the persistent left rail for an authenticated admin area, back office, analytics console, CRM or internal SaaS tool.",
  props: z.object({
    /** Brand / product name shown at the top of the sidebar. */
    brand: z.string().optional(),
    /** Sidebar nav item labels (must match site routes for page switching). The first item is treated as the active/home view. */
    nav: z.array(z.string()).optional(),
    /** How many leading nav items form the primary group; the remainder fall under "Support". */
    primaryCount: z.number().optional(),
    /** Heading shown above the secondary nav group. */
    supportLabel: z.string().optional(),
    /** Nav label that carries the count badge. */
    badgeLabel: z.string().optional(),
    /** Count badge text shown on `badgeLabel`. */
    badgeCount: z.string().optional(),
    /** Route navigated to when the sign-out button is pressed. */
    signOutTarget: z.string().optional(),
    /** Signed-in user shown in the sidebar footer. */
    user: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        avatarAlt: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: dashboardLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const auth = lakebed.useAuth()
    const brand = props.brand ?? 'Orbit'
    const nav = props.nav?.length
      ? props.nav
      : [
          'Dashboard',
          'Orders',
          'Customers',
          'Products',
          'Analytics',
          'Finance',
          'Tickets',
          'Settings',
        ]
    const primaryCount = props.primaryCount ?? 6
    const primaryNav = nav.slice(0, primaryCount)
    const supportNav = nav.slice(primaryCount)
    const supportLabel = props.supportLabel ?? 'Support'
    const badgeLabel = props.badgeLabel ?? 'Orders'
    const orderSummary = lakebed.useQuery('orderSummary')
    const badgeCount =
      props.badgeCount ??
      (badgeLabel.toLowerCase() === 'orders'
        ? String(orderSummary?.count ?? 0)
        : '')
    const authUser = auth.user
    const isSignedIn = auth.isAuthenticated && !authUser?.isGuest
    const userName = isSignedIn
      ? (authUser?.displayName ?? authUser?.email ?? 'Account')
      : (props.user?.name ?? 'Alex Morgan')
    const userEmail = isSignedIn
      ? (authUser?.email ?? 'Signed in')
      : (props.user?.email ?? 'alex@orbit.dev')
    const userAvatarAlt =
      props.user?.avatarAlt ??
      `portrait headshot of ${userName}, friendly professional`
    const runAuthAction = () => {
      if (isSignedIn) {
        lakebed.signOut()
        return
      }

      void lakebed.signInWithGoogle()
    }

    const [activeNav, setActiveNav] = useState(nav[0])
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    // ── Brand mark — indigo tile + orbit glyph (decorative brand asset). ──
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.5 7.5a9 9 0 1 1-15 0" />
        </svg>
      </span>
    )

    // ── Icon set (Lucide-equivalent inline SVGs). ──
    const icons: Record<string, ReactNode> = {
      Dashboard: (
        <>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </>
      ),
      Orders: (
        <>
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </>
      ),
      Customers: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ),
      Products: (
        <>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </>
      ),
      Analytics: (
        <>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </>
      ),
      Finance: (
        <>
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
        </>
      ),
      Tickets: (
        <>
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
          <line x1="13" y1="5" x2="13" y2="19" />
        </>
      ),
      Settings: (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </>
      ),
    }

    const navIcon = (label) => icons[label] ?? icons.Settings

    const NavButton = ({ label }: { label: string }) => {
      const active = activeNav === label
      const badgeText = label === badgeLabel && badgeCount ? badgeCount : ''
      return (
        <button
          type="button"
          aria-label={badgeText ? `${label} ${badgeText}` : label}
          onClick={() => {
            setActiveNav(label)
            setMobileNavOpen(false)
            go(label)
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
            active
              ? 'bg-primary/10 font-semibold text-primary'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
          )}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {navIcon(label)}
          </svg>
          {label}
          {badgeText ? (
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {badgeText}
            </span>
          ) : null}
        </button>
      )
    }

    const sidebarBody = (
      <>
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-3"
          >
            <BrandLogo
              brand={brand}
              fallback={<LogoMark />}
              labelClassName="text-lg font-bold tracking-tight text-foreground"
            />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {primaryNav.map((label) => (
            <NavButton key={label} label={label} />
          ))}

          {supportNav.length > 0 ? (
            <>
              <Eyebrow
                asChild
                variant="text"
                className="block px-3 pb-2 pt-4 tracking-wider text-muted-foreground/70"
              >
                <div>{supportLabel}</div>
              </Eyebrow>
              {supportNav.map((label) => (
                <NavButton key={label} label={label} />
              ))}
            </>
          ) : null}
        </nav>

        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-3">
            <Image
              alt={userAvatarAlt}
              w={72}
              h={72}
              className="size-9 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-card"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {userName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>
            <button
              type="button"
              aria-label={isSignedIn ? 'Sign out' : 'Sign in with Shoo'}
              onClick={runAuthAction}
              className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </>
    )

    return (
      <div className={cn(props.className)}>
        {/* Mobile open button (visible below md) */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileNavOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Sidebar (desktop) */}
        <NavSidebar
          variant="card"
          className="z-30 hidden w-64 shrink-0 md:flex"
        >
          {sidebarBody}
        </NavSidebar>

        {/* Sidebar (mobile drawer) */}
        {mobileNavOpen ? (
          <>
            <div
              className="fixed inset-0 z-20 bg-foreground/40 md:hidden"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <NavSidebar
              variant="card"
              className="fixed inset-y-0 left-0 z-30 w-64 md:hidden"
            >
              {sidebarBody}
            </NavSidebar>
          </>
        ) : null}
      </div>
    )
  },
})
