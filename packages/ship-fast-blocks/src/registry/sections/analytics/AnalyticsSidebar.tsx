import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { NavSidebar } from '#/section-kit/NavSidebar.tsx'
import { Image } from '#/lib/img.tsx'
import { analyticsAdminLakebed } from './analytics-admin-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * AnalyticsSidebar — Swiss data-grid left sidebar rail for a SaaS analytics /
 * admin product. An inline, hairline-bordered column (hidden below lg — mobile
 * navigation is served by the header's hamburger drawer) that stays contained
 * within its own section bounds when stacked, with a brand header (sharp solid
 * token logo tile + product name), a primary nav ledger where each row pairs
 * an aria-hidden mono tabular index numeral with its label — the active first
 * row floods with a full ink inversion and a primary left rule, and the
 * Notifications row carries a sharp tabular count badge — plus a
 * hairline-topped bottom user profile row (square avatar, name, mono
 * uppercase role). Nav items route through section-kit route links;
 * notification count and profile auth use shared Lakebed state. Use as the
 * left rail column of analytics dashboards, admin panels, BI consoles, or any
 * data-product control surface. Renders fully with no props via baked-in
 * "DataFlow" defaults.
 */
export const AnalyticsSidebar = defineCapsule({
  name: 'AnalyticsSidebar',
  description:
    "Swiss data-grid left dashboard sidebar rail for a SaaS analytics / admin product: an inline hairline-bordered column (hidden below lg — mobile navigation comes from the header's hamburger drawer) contained within its own section bounds, with a brand header (sharp solid token logo tile + product name), a primary nav ledger pairing mono tabular index numerals with labels — active first row flooded with full ink inversion and a primary left rule, shared Lakebed count badge on the Notifications row — and a hairline-topped bottom Shoo/Lakebed profile row with a square avatar and mono uppercase role. Nav items route through section-kit route links for page-switching. Use as the left rail column of analytics dashboards, admin panels, business-intelligence consoles, or any data-product control surface.",
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
    const auth = lakebed.useAuth()
    const unreadCount = (lakebed.useQuery('unreadNotificationCount') ??
      0) as number
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

    // Brand logo tile — sharp solid token mark with the brand initial.
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-primary font-black text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <NavSidebar
        variant="card"
        className={cn(
          'relative hidden min-h-[32rem] w-64 flex-col rounded-none lg:flex',
          props.className,
        )}
      >
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <BrandLogo brand={brand}>
              <LogoImage fallback={<LogoMark className="size-8 text-sm" />} />
              <LogoLabel className="text-lg font-semibold tracking-tight text-card-foreground" />
            </BrandLogo>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {nav.map((label, i) => {
            const active = i === 0
            return (
              <NavbarRouteLink
                key={label}
                className={cn(
                  'flex w-full items-center gap-3 rounded-none border-l-2 px-4 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary bg-foreground text-background'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground',
                )}
                href={label}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'font-mono text-[10px] tabular-nums tracking-[0.1em]',
                    active ? 'text-background/60' : 'text-muted-foreground/60',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{label}</span>
                {label === 'Notifications' ? (
                  <span
                    className={cn(
                      'ml-auto rounded-none bg-primary px-2 py-0.5 font-mono text-xs tabular-nums text-primary-foreground',
                    )}
                  >
                    {notificationCount}
                  </span>
                ) : null}
              </NavbarRouteLink>
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
            className="flex w-full items-center gap-3 rounded-none border border-transparent px-4 py-3 text-left transition-colors hover:border-border hover:bg-muted/40"
          >
            <Image
              alt={userAvatarAlt}
              w={80}
              h={80}
              className="size-10 rounded-none object-cover"
            />
            <div>
              <p className="text-sm font-medium tracking-tight text-card-foreground">
                {userName}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {userRole}
              </p>
            </div>
          </button>
        </div>
      </NavSidebar>
    )
  },
})
