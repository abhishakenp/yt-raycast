import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Image } from '#/lib/img.tsx'
import {
  Topbar,
  TopbarSection,
  TopbarDivider,
  TopbarIconButton,
} from '#/section-kit/Topbar.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * DashboardTopbar — Swiss-data top app-bar for a SaaS admin dashboard. A
 * hairline-bordered bar holding a square-edged search field with a leading
 * magnifier icon on the left (full-width on phones, fixed-width from sm up),
 * and on the right a notification bell (with a destructive unread dot), a mail
 * button, a hairline divider and a user chip (square avatar + name + mono
 * uppercase role). All controls are rounded-none with press feedback; the
 * bell, mail and user chip route through section-kit route links. Use as the
 * top bar of an authenticated admin area, back office, analytics console or
 * internal SaaS tool, paired above the main content column. Renders fully
 * with no props via baked-in "Orbit" defaults.
 */
export const DashboardTopbar = defineCapsule({
  name: 'DashboardTopbar',
  description:
    'Swiss-data top app-bar for a SaaS admin dashboard: a hairline-bordered bar with a square-edged left search field (leading magnifier icon, full-width on phones), and on the right a notification bell (destructive unread dot), a mail button, a hairline divider and a user chip (square avatar + name + mono uppercase role). All controls rounded-none with press feedback; the bell, mail and user chip route through section-kit route links. Use as the top bar of an authenticated admin area, back office, analytics console or internal SaaS tool, paired above the main content column.',
  props: z.object({
    /** Search field placeholder text. */
    search: z.string().optional(),
    /** Route navigated to when the notification bell is pressed. */
    notificationsTarget: z.string().optional(),
    /** Route navigated to when the mail button is pressed. */
    messagesTarget: z.string().optional(),
    /** Route navigated to when the user chip is pressed. */
    userTarget: z.string().optional(),
    /** Signed-in user shown in the right-hand chip. */
    user: z
      .object({
        name: z.string().optional(),
        role: z.string().optional(),
        avatarAlt: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const searchPlaceholder =
      props.search ?? 'Search orders, customers, products...'
    const notificationsTarget = props.notificationsTarget ?? 'Notifications'
    const messagesTarget = props.messagesTarget ?? 'Messages'
    const userTarget = props.userTarget ?? 'Settings'

    const userName = props.user?.name ?? 'Alex Morgan'
    const userRole = props.user?.role ?? 'Admin'
    const userAvatarAlt =
      props.user?.avatarAlt ??
      `portrait headshot of ${userName}, friendly professional`

    return (
      <Topbar className={props.className}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-xs lg:max-w-sm">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full rounded-none border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
        <TopbarSection className="pl-3">
          <TopbarIconButton
            aria-label="Notifications"
            className="rounded-none active:translate-y-px"
            asChild
          >
            <NavbarRouteLink href={notificationsTarget}>
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
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute right-1.5 top-1.5 size-1.5 bg-destructive ring-2 ring-card" />
            </NavbarRouteLink>
          </TopbarIconButton>
          <TopbarIconButton
            aria-label="Messages"
            className="hidden rounded-none active:translate-y-px sm:block"
            asChild
          >
            <NavbarRouteLink href={messagesTarget}>
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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </NavbarRouteLink>
          </TopbarIconButton>
          <TopbarDivider />
          <NavbarRouteLink
            className="flex shrink-0 items-center gap-3 transition-colors duration-150 active:translate-y-px"
            href={userTarget}
          >
            <Image
              alt={userAvatarAlt}
              w={64}
              h={64}
              className="size-8 rounded-none border border-border object-cover"
            />
            <span className="hidden text-right lg:block">
              <span className="block text-sm font-semibold leading-tight text-foreground">
                {userName}
              </span>
              <span className="block font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-muted-foreground">
                {userRole}
              </span>
            </span>
          </NavbarRouteLink>
        </TopbarSection>
      </Topbar>
    )
  },
})
