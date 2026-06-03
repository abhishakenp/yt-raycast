import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DashboardTopbar — a sticky top app-bar for a SaaS admin dashboard. A bordered
 * card header bar holding a search field with a leading magnifier icon on the
 * left, and on the right a notification bell (with an unread dot), a mail button,
 * a divider and a user chip (avatar + name + role). The bell, mail and user chip
 * route through useNavigate. Use as the top bar of an authenticated admin area,
 * back office, analytics console or internal SaaS tool, paired above the main
 * content column. Renders fully with no props via baked-in "Orbit" defaults.
 */
export const DashboardTopbar = defineComponent({
  name: "DashboardTopbar",
  description:
    "A sticky top app-bar for a SaaS admin dashboard: a bordered card header bar with a left search field (leading magnifier icon), and on the right a notification bell (with an unread dot), a mail button, a divider and a user chip (avatar + name + role). The bell, mail and user chip route through useNavigate. Use as the top bar of an authenticated admin area, back office, analytics console or internal SaaS tool, paired above the main content column.",
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
    const go = useNavigate()
    const searchPlaceholder =
      props.search ?? "Search orders, customers, products..."
    const notificationsTarget = props.notificationsTarget ?? "Notifications"
    const messagesTarget = props.messagesTarget ?? "Messages"
    const userTarget = props.userTarget ?? "Settings"

    const userName = props.user?.name ?? "Alex Morgan"
    const userRole = props.user?.role ?? "Admin"
    const userAvatarAlt =
      props.user?.avatarAlt ??
      `portrait headshot of ${userName}, friendly professional`

    return (
      <header
        className={cn(
          "z-10 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6",
          props.className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
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
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-64 rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary/60 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-80"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => go(notificationsTarget)}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg
              width="20"
              height="20"
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
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
          </button>
          <button
            type="button"
            aria-label="Messages"
            onClick={() => go(messagesTarget)}
            className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"
          >
            <svg
              width="20"
              height="20"
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
          </button>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <button
            type="button"
            onClick={() => go(userTarget)}
            className="flex items-center gap-3"
          >
            <Image
              alt={userAvatarAlt}
              w={64}
              h={64}
              className="size-8 rounded-full object-cover ring-2 ring-muted"
            />
            <span className="hidden text-right lg:block">
              <span className="block text-sm font-semibold leading-tight text-foreground">
                {userName}
              </span>
              <span className="block text-xs leading-tight text-muted-foreground">
                {userRole}
              </span>
            </span>
          </button>
        </div>
      </header>
    )
  },
})
