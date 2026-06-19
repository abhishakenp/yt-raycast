import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

/**
 * AnalyticsKimiPage — a complete, self-contained SaaS analytics DASHBOARD page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "DataFlow" admin design: a
 * clean, light, data-dense product surface with a fixed left sidebar (brand
 * mark + nav with active state, notification badge, and a user profile card),
 * a sticky top header (page title, search field, date-filter + export
 * actions), a 4-up KPI metric-card grid with up/down trend deltas, a 2/3 + 1/3
 * charts row (revenue line chart + traffic-source doughnut with a legend), a
 * full Recent Transactions data table (avatars, status pills, plan, row
 * actions, pagination), and a 3-up secondary-metrics row (top pages with
 * progress bars, device breakdown, subscription growth). All color via
 * semantic tokens; data-viz uses chart-1..5; status pills use chart/destructive.
 *
 * Every nav item, action button, table action, and pagination control routes
 * through `useNavigate` (never a dead "#"). All photo/content imagery uses the
 * alt-driven <Image> component. Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const AnalyticsKimiPage = defineCapsule({
  name: "AnalyticsKimiPage",
  description:
    "Complete SaaS analytics DASHBOARD / admin overview page with a clean, light, data-dense product UI: a fixed left sidebar (brand mark, primary nav with active state and a notification count badge, plus a user profile card), a sticky top header with page title, an analytics search field, and date-filter + Export actions. Body includes a 4-up KPI metric-card grid (Total Revenue, Active Users, Conversion Rate, Avg. Session) with up/down percentage trend deltas and icon chips, a charts row pairing a wide Revenue Overview line/area chart (with Month/Year toggle) and a Traffic Sources doughnut chart with a labeled percentage legend, a full Recent Transactions data table (customer avatars + emails, date, amount, colored status pills for Completed/Processing/Failed, plan, per-row View action, and Previous/Next pagination), and a 3-up secondary metrics row (Top Performing Pages with progress bars, Device Breakdown desktop/mobile/tablet, and Subscription Growth with churn and LTV). Use as the ROOT/home page for analytics dashboards, admin panels, business-intelligence consoles, metrics/reporting overviews, revenue or product analytics, customer/subscription dashboards, or any data visualization control panel. Supply content only — brand, nav, header copy, KPIs, charts, transactions, and metric panels; the block owns all layout and styling.",
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
    /** Top header copy + action labels. */
    header: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        exportLabel: z.string().optional(),
      })
      .optional(),
    /** KPI metric cards. `trend` "up" renders positive (chart) styling, "down" negative. */
    kpis: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          delta: z.string(),
          trend: z.enum(["up", "down"]),
          caption: z.string(),
        }),
      )
      .optional(),
    /** Revenue Overview chart panel. */
    revenue: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        toggles: z.array(z.string()).optional(),
        /** Monthly data points (label + numeric value) for the area chart. */
        points: z
          .array(z.object({ label: z.string(), value: z.number() }))
          .optional(),
      })
      .optional(),
    /** Traffic Sources doughnut + legend panel. */
    traffic: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        /** Channel slices; rendered as doughnut + legend, percent values. */
        sources: z
          .array(z.object({ label: z.string(), value: z.number() }))
          .optional(),
      })
      .optional(),
    /** Recent Transactions data table. */
    transactions: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        viewAll: z.string().optional(),
        footnote: z.string().optional(),
        rows: z
          .array(
            z.object({
              name: z.string(),
              email: z.string(),
              date: z.string(),
              amount: z.string(),
              status: z.enum(["completed", "processing", "failed"]),
              plan: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Top Performing Pages" panel (progress bars). */
    topPages: z
      .object({
        title: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              percent: z.number(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Device Breakdown" panel (progress bars + icons). */
    devices: z
      .object({
        title: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string(),
              percent: z.number(),
              icon: z.enum(["desktop", "mobile", "tablet"]),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Subscription Growth" panel (label/value rows with deltas). */
    growth: z
      .object({
        title: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string(),
              caption: z.string(),
              value: z.string(),
              delta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      transactions: table({
        name: string(),
        email: string(),
        date: string(),
        amount: string(),
        status: string(),
        plan: string(),
      }),
      notifications: table({
        message: string(),
        type: string(),
        read: string(),
      }),
    },
    queries: {
      transactions: ({ db }) => db.transactions.orderBy('createdAt').all(),
      notifications: ({ db }) => db.notifications.orderBy('createdAt').all(),
      unreadNotificationCount: ({ db }) =>
        db.notifications.where('read', 'false').all().length,
    },
    mutations: {
      markNotificationRead: ({ db }, id: string) => {
        db.notifications.update(id, { read: 'true' })
        return db.notifications.all()
      },
      clearAllNotifications: ({ db }) => {
        for (const item of db.notifications.all()) {
          db.notifications.delete(item.id)
        }
        return []
      },
      addTransaction: ({ db }, transaction: { name: string; email: string; date: string; amount: string; status: string; plan: string }) => {
        db.transactions.insert(transaction)
        return db.transactions.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const brand = props.brand ?? "DataFlow"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Dashboard",
          "Customers",
          "Analytics",
          "Reports",
          "Notifications",
          "Settings",
        ]
    // Lakebed queries and mutations
    const storedTransactions = lakebed.useQuery('transactions')
    const storedNotifications = lakebed.useQuery('notifications')
    const unreadNotificationCount = lakebed.useQuery('unreadNotificationCount')
    const notificationCount =
      (unreadNotificationCount ?? 0) > 0
        ? String(unreadNotificationCount)
        : props.notificationCount ?? "3"
    const markNotificationRead = lakebed.useMutation('markNotificationRead')
    const clearAllNotifications = lakebed.useMutation('clearAllNotifications')
    const addTransaction = lakebed.useMutation('addTransaction')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const userName = props.user?.name ?? authDisplayName ?? "Marcus Chen"
    const userRole = props.user?.role ?? "Product Manager"
    const userAvatarAlt =
      props.user?.avatarAlt ??
      "Professional headshot of a product manager with short brown hair and a friendly smile"

    const headerTitle = props.header?.title ?? "Dashboard Overview"
    const headerSubtitle =
      props.header?.subtitle ?? "Welcome back, here's what's happening"
    const searchPlaceholder =
      props.header?.searchPlaceholder ?? "Search analytics..."
    const exportLabel = props.header?.exportLabel ?? "Export"

    const kpis = props.kpis?.length
      ? props.kpis
      : ([
          {
            label: "Total Revenue",
            value: "$124,592",
            delta: "+12.5%",
            trend: "up",
            caption: "vs last month",
          },
          {
            label: "Active Users",
            value: "8,429",
            delta: "+8.2%",
            trend: "up",
            caption: "vs last month",
          },
          {
            label: "Conversion Rate",
            value: "3.24%",
            delta: "+2.1%",
            trend: "up",
            caption: "vs last month",
          },
          {
            label: "Avg. Session",
            value: "4m 32s",
            delta: "-1.4%",
            trend: "down",
            caption: "vs last month",
          },
        ] as const)

    const revenueTitle = props.revenue?.title ?? "Revenue Overview"
    const revenueSubtitle =
      props.revenue?.subtitle ?? "Monthly revenue and growth trends"
    const revenueToggles = props.revenue?.toggles?.length
      ? props.revenue.toggles
      : ["Month", "Year"]
    const revenuePoints = props.revenue?.points?.length
      ? props.revenue.points
      : [
          { label: "Jan", value: 82000 },
          { label: "Feb", value: 91000 },
          { label: "Mar", value: 105000 },
          { label: "Apr", value: 98200 },
          { label: "May", value: 114000 },
          { label: "Jun", value: 124592 },
        ]

    const trafficTitle = props.traffic?.title ?? "Traffic Sources"
    const trafficSubtitle =
      props.traffic?.subtitle ?? "Visitor acquisition channels"
    const trafficSources = props.traffic?.sources?.length
      ? props.traffic.sources
      : [
          { label: "Organic Search", value: 42 },
          { label: "Direct", value: 28 },
          { label: "Social Media", value: 18 },
          { label: "Referral", value: 12 },
        ]

    const txTitle = props.transactions?.title ?? "Recent Transactions"
    const txSubtitle =
      props.transactions?.subtitle ?? "Latest customer payments and activities"
    const txViewAll = props.transactions?.viewAll ?? "View All"
    const txFootnote =
      props.transactions?.footnote ?? "Showing 6 of 247 transactions"
    const txRows = storedTransactions && storedTransactions.length > 0
      ? storedTransactions.map((t) => ({
          name: t.name,
          email: t.email,
          date: t.date,
          amount: t.amount,
          status: t.status as "completed" | "processing" | "failed",
          plan: t.plan,
        }))
      : props.transactions?.rows?.length
        ? props.transactions.rows
        : ([
            {
              name: "Sarah Miller",
              email: "sarah@techcorp.com",
              date: "May 30, 2026",
              amount: "$299.00",
              status: "completed",
              plan: "Pro Plan",
            },
            {
              name: "James Wilson",
              email: "james@startup.io",
              date: "May 30, 2026",
              amount: "$499.00",
              status: "processing",
              plan: "Enterprise",
            },
            {
              name: "Emily Davis",
              email: "emily@design.studio",
              date: "May 29, 2026",
              amount: "$99.00",
              status: "completed",
              plan: "Starter",
            },
            {
              name: "Michael Brown",
              email: "michael@devteam.net",
              date: "May 29, 2026",
              amount: "$299.00",
              status: "failed",
              plan: "Pro Plan",
            },
            {
              name: "Lisa Anderson",
              email: "lisa@product.co",
              date: "May 28, 2026",
              amount: "$499.00",
              status: "completed",
              plan: "Enterprise",
            },
            {
              name: "David Kim",
              email: "david@innovate.io",
              date: "May 28, 2026",
              amount: "$99.00",
              status: "completed",
              plan: "Starter",
            },
          ] as const)

    const topPagesTitle = props.topPages?.title ?? "Top Performing Pages"
    const topPagesItems = props.topPages?.items?.length
      ? props.topPages.items
      : [
          { label: "/features", value: "12,847 views", percent: 85 },
          { label: "/pricing", value: "8,234 views", percent: 65 },
          { label: "/docs", value: "5,891 views", percent: 45 },
          { label: "/blog", value: "3,456 views", percent: 28 },
        ]

    const devicesTitle = props.devices?.title ?? "Device Breakdown"
    const deviceItems = props.devices?.items?.length
      ? props.devices.items
      : ([
          { label: "Desktop", percent: 58, icon: "desktop" },
          { label: "Mobile", percent: 34, icon: "mobile" },
          { label: "Tablet", percent: 8, icon: "tablet" },
        ] as const)

    const growthTitle = props.growth?.title ?? "Subscription Growth"
    const growthItems = props.growth?.items?.length
      ? props.growth.items
      : [
          {
            label: "This Month",
            caption: "New signups",
            value: "+247",
            delta: "+18% vs last month",
          },
          {
            label: "Churn Rate",
            caption: "Monthly cancellations",
            value: "2.4%",
            delta: "-0.3% vs last month",
          },
          {
            label: "LTV",
            caption: "Customer lifetime value",
            value: "$1,247",
            delta: "+8% vs last month",
          },
        ]

    // Chart tokens cycled for traffic-source slices / progress bars (data viz only).
    const sliceTokens = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4"]

    // Brand logo tile — solid token mark with the brand initial (decorative).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-black text-primary-foreground",
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
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      "aria-hidden": true,
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

    const kpiIcons: ReactNode[] = [
      // currency
      <svg key="currency" {...iconProps}>
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // users
      <svg key="users" {...iconProps}>
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // bars
      <svg key="bars" {...iconProps}>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // clock
      <svg key="clock" {...iconProps}>
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const deviceIcons: Record<string, ReactNode> = {
      desktop: (
        <svg {...iconProps}>
          <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      mobile: (
        <svg {...iconProps}>
          <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      tablet: (
        <svg {...iconProps}>
          <path d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    }

    const TrendUp = () => (
      <svg {...iconProps} width={16} height={16}>
        <path d="M7 17l9.2-9.2M17 17V7H7" />
      </svg>
    )
    const TrendDown = () => (
      <svg {...iconProps} width={16} height={16}>
        <path d="M17 7l-9.2 9.2M7 7v10h10" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const ArrowRight = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const statusStyles: Record<string, string> = {
      completed: "bg-chart-1/15 text-chart-1",
      processing: "bg-chart-2/15 text-chart-2",
      failed: "bg-destructive/15 text-destructive",
    }
    const statusLabels: Record<string, string> = {
      completed: "Completed",
      processing: "Processing",
      failed: "Failed",
    }

    // Build an area-chart path from the revenue points.
    const chartW = 600
    const chartH = 240
    const padX = 8
    const padY = 16
    const maxVal = Math.max(...revenuePoints.map((p) => p.value)) || 1
    const stepX =
      revenuePoints.length > 1
        ? (chartW - padX * 2) / (revenuePoints.length - 1)
        : 0
    const coords = revenuePoints.map((p, i) => {
      const x = padX + i * stepX
      const y = padY + (chartH - padY * 2) * (1 - p.value / maxVal)
      return { x, y, ...p }
    })
    const linePath = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(" ")
    const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(
      1,
    )} ${chartH - padY} L ${coords[0].x.toFixed(1)} ${chartH - padY} Z`

    // Build doughnut stroke-dasharray segments for the traffic chart.
    const trafficTotal =
      trafficSources.reduce((sum, s) => sum + s.value, 0) || 1
    const radius = 70
    const circumference = 2 * Math.PI * radius
    let dashOffsetAcc = 0
    const doughnutSegments = trafficSources.map((s, i) => {
      const fraction = s.value / trafficTotal
      const seg = {
        dash: fraction * circumference,
        gap: circumference - fraction * circumference,
        offset: -dashOffsetAcc,
        token: sliceTokens[i % sliceTokens.length].replace("bg-", "stroke-"),
      }
      dashOffsetAcc += fraction * circumference
      return seg
    })

    const PanelHeader = ({
      title,
      subtitle,
    }: {
      title: string
      subtitle?: string
    }) => (
      <div>
        <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    )

    return (
      <div
        className={cn(
          "relative min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-border bg-card lg:flex">
          <div className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <LogoMark className="size-8 text-sm" />
              <span className="text-lg font-semibold text-card-foreground">
                {brand}
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {nav.map((label, i) => {
              const active = i === 0
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (label === "Notifications") {
                      setNotificationsOpen(true)
                    } else {
                      go(label)
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {navIcons[label] ?? navIcons.Dashboard}
                  <span>{label}</span>
                  {label === "Notifications" ? (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {notificationCount}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </nav>

          <div className="border-t border-border p-4">
            {isSignedIn ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <Avatar size="sm" className="ring-2 ring-background">
                      {authPicture ? (
                        <AvatarImage src={authPicture} alt={authDisplayName} />
                      ) : null}
                      <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                        {authInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {authDisplayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {authEmail ?? 'Signed in'}
                      </p>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={10}
                  className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                >
                  <div className="bg-muted/40 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="ring-2 ring-background">
                        {authPicture ? (
                          <AvatarImage src={authPicture} alt={authDisplayName} />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {authDisplayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {authEmail ?? 'Signed in to this session'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => go('Account')}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Account
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go('Settings')}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Settings
                      <ArrowRight />
                    </button>
                  </div>
                  <div className="border-t border-border p-2">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Sign out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={auth.isLoading}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted"
              >
                <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {authLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
              </button>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="min-h-svh lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Toggle menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
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
                  <p className="text-sm text-muted-foreground">
                    {headerSubtitle}
                  </p>
                </div>
              </div>
              {mobileOpen && (
                <div
                  id="mobile-menu"
                  className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
                >
                  {nav.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        go(label)
                      }}
                      className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(searchPlaceholder)
                  }}
                  className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-2 md:flex"
                >
                  <svg {...iconProps} width={16} height={16} className="text-muted-foreground">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    aria-label="Search analytics"
                    className="w-48 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                  />
                </form>
                <button
                  type="button"
                  aria-label="Date filter"
                  onClick={() => go("Date filter")}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <svg {...iconProps}>
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(exportLabel)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <svg {...iconProps} width={16} height={16}>
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{exportLabel}</span>
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6">
            {/* KPI cards */}
            <section aria-label="Key performance indicators">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, i) => (
                  <article
                    key={kpi.label}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {kpi.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-card-foreground">
                          {kpi.value}
                        </p>
                        <div
                          className={cn(
                            "mt-2 flex items-center gap-1",
                            kpi.trend === "up"
                              ? "text-chart-1"
                              : "text-destructive",
                          )}
                        >
                          {kpi.trend === "up" ? <TrendUp /> : <TrendDown />}
                          <span className="text-sm font-medium">
                            {kpi.delta}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                        {kpiIcons[i % kpiIcons.length]}
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {kpi.caption}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* Charts */}
            <section aria-label="Analytics charts">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue area chart */}
                <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
                  <div className="mb-6 flex items-center justify-between">
                    <PanelHeader
                      title={revenueTitle}
                      subtitle={revenueSubtitle}
                    />
                    <div className="flex items-center gap-2">
                      {revenueToggles.map((t, i) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => go(t)}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                            i === 0
                              ? "bg-muted text-foreground hover:bg-accent"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-72">
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      preserveAspectRatio="none"
                      className="size-full"
                      role="img"
                      aria-label={`${revenueTitle} chart`}
                    >
                      {/* horizontal gridlines */}
                      {[0.25, 0.5, 0.75].map((f) => (
                        <line
                          key={f}
                          x1={padX}
                          x2={chartW - padX}
                          y1={padY + (chartH - padY * 2) * f}
                          y2={padY + (chartH - padY * 2) * f}
                          className="stroke-border"
                          strokeWidth={1}
                        />
                      ))}
                      <path
                        d={areaPath}
                        className="fill-chart-1/10"
                        stroke="none"
                      />
                      <path
                        d={linePath}
                        className="stroke-chart-1"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {coords.map((c) => (
                        <circle
                          key={c.label}
                          cx={c.x}
                          cy={c.y}
                          r={4}
                          className="fill-chart-1 stroke-card"
                          strokeWidth={2}
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="mt-2 flex justify-between px-1 text-xs text-muted-foreground">
                    {revenuePoints.map((p) => (
                      <span key={p.label}>{p.label}</span>
                    ))}
                  </div>
                </div>

                {/* Traffic doughnut */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-2 text-lg font-semibold text-card-foreground">
                    {trafficTitle}
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {trafficSubtitle}
                  </p>
                  <div className="mx-auto flex h-48 items-center justify-center">
                    <svg
                      viewBox="0 0 180 180"
                      className="size-44 -rotate-90"
                      role="img"
                      aria-label={`${trafficTitle} chart`}
                    >
                      {doughnutSegments.map((seg, i) => (
                        <circle
                          key={trafficSources[i].label}
                          cx={90}
                          cy={90}
                          r={radius}
                          fill="none"
                          strokeWidth={26}
                          className={seg.token}
                          strokeDasharray={`${seg.dash} ${seg.gap}`}
                          strokeDashoffset={seg.offset}
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="mt-6 space-y-3">
                    {trafficSources.map((s, i) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-3 rounded-full",
                              sliceTokens[i % sliceTokens.length],
                            )}
                          />
                          <span className="text-sm text-muted-foreground">
                            {s.label}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-card-foreground">
                          {s.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Data table */}
            <section aria-label="Recent transactions">
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <PanelHeader title={txTitle} subtitle={txSubtitle} />
                  <button
                    type="button"
                    onClick={() => go(txViewAll)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {txViewAll} →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        {["Customer", "Date", "Amount", "Status", "Plan", "Actions"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {txRows.map((row) => (
                        <tr
                          key={row.email}
                          className="transition-colors hover:bg-muted"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Image
                                alt={`portrait headshot of ${row.name}`}
                                w={80}
                                h={80}
                                className="size-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-medium text-card-foreground">
                                  {row.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {row.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            {row.date}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-card-foreground">
                            {row.amount}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={cn(
                                "rounded-full px-2 py-1 text-xs font-medium",
                                statusStyles[row.status],
                              )}
                            >
                              {statusLabels[row.status]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            {row.plan}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <button
                              type="button"
                              onClick={() => go(`${row.name} transaction`)}
                              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                              View →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground">{txFootnote}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed px-3 py-1.5 text-sm font-medium text-muted-foreground/50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => go("Next transactions")}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Secondary metrics */}
            <section aria-label="Additional metrics">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Top pages */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                    {topPagesTitle}
                  </h3>
                  <div className="space-y-4">
                    {topPagesItems.map((item, i) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm text-foreground">
                            {item.label}
                          </span>
                          <span className="text-sm font-medium text-card-foreground">
                            {item.value}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              sliceTokens[i % sliceTokens.length],
                            )}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device breakdown */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                    {devicesTitle}
                  </h3>
                  <div className="space-y-4">
                    {deviceItems.map((item, i) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                          {deviceIcons[item.icon]}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {item.label}
                            </span>
                            <span className="text-sm font-medium text-card-foreground">
                              {item.percent}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                sliceTokens[i % sliceTokens.length],
                              )}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription growth */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                    {growthTitle}
                  </h3>
                  <div className="space-y-4">
                    {growthItems.map((item, i) => (
                      <div
                        key={item.label}
                        className={cn(
                          "flex items-center justify-between",
                          i < growthItems.length - 1 &&
                            "border-b border-border pb-4",
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.caption}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-card-foreground">
                            {item.value}
                          </p>
                          <p className="text-xs text-chart-1">{item.delta}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Notifications Drawer */}
        <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Notifications</SheetTitle>
              <SheetDescription>
                {storedNotifications && storedNotifications.length > 0
                  ? `${storedNotifications.length} notification${storedNotifications.length === 1 ? '' : 's'}`
                  : 'No notifications'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {storedNotifications && storedNotifications.length > 0 ? (
                <div className="space-y-4">
                  {storedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "rounded-lg border border-border bg-card p-4",
                        notification.read === 'false' && "bg-muted/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {notification.type}
                          </p>
                        </div>
                        {notification.read === 'false' && (
                          <button
                            type="button"
                            onClick={() => void markNotificationRead(notification.id)}
                            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-base font-semibold text-foreground">
                    No notifications
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              {storedNotifications && storedNotifications.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => void clearAllNotifications()}
                >
                  Clear all
                </Button>
              )}
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full rounded-full"
                >
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
