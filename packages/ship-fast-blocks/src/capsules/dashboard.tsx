import { useState, type ReactNode } from "react"
import { string, table } from "@ship-fast/lakebed/server"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet.tsx"

/**
 * DashboardKimiPage — a complete, self-contained SaaS ADMIN DASHBOARD app shell.
 *
 * A faithful Tailwind v4 port of the Kimi-generated "Orbit" admin design. It
 * reproduces, in order: a fixed left sidebar (brand mark, primary + support nav
 * groups with a count badge, and a user footer), a sticky top bar (search field
 * + notification/mail buttons + user chip), a page header with export / primary
 * actions, a 4-up KPI stat-card row (each with a colored icon tile and an up/down
 * trend badge), a two-column band pairing a revenue area chart (rendered as a
 * smooth inline SVG with an indigo gradient fill, axis ticks and gridlines) with
 * a colored-icon recent-activity feed, and a recent-orders table (avatar +
 * customer, product, date, amount, colored status pill, row actions) with a
 * pagination footer.
 *
 * Kimi's identity is a light slate-on-white admin surface with an indigo
 * (#4f46e5 / #6366f1) primary accent; the block maps the inline slate palette
 * onto Tailwind theme tokens (background/card/muted/border/foreground/
 * muted-foreground) so dark mode works, while preserving the indigo accent on
 * the brand mark, active nav state, primary buttons and chart gradient, and the
 * emerald/sky/amber/red status + trend semantics via the chart-N data-viz
 * tokens. Every nav item, action, link and CTA routes through `useNavigate`
 * (never a dead "#"), and the sidebar/top-level labels match the `nav` array so
 * PageSwitch can swap pages. Callers supply ONLY content data; rich defaults
 * sourced from the original HTML make it render great with no props at all.
 */
export const DashboardKimiPage = defineCapsule({
  name: "DashboardKimiPage",
  description:
    "Complete SaaS ADMIN DASHBOARD app shell with a polished, professional light-slate + indigo aesthetic: a fixed left sidebar (brand mark, grouped nav with a count badge and active state, user footer), a sticky top bar with a search field, notification/mail buttons and a user chip, a page header with export + primary CTA, a 4-up KPI stat-card row (colored icon tiles + up/down trend badges), a two-column band pairing a revenue area chart (smooth inline SVG with indigo gradient fill, gridlines and axis ticks) with a colored-icon recent-activity feed, and a recent-orders table (customer avatar, product, date, amount, colored status pill, row actions) with a pagination footer. Use as the ROOT/home of an authenticated admin area, back office, analytics console, e-commerce/orders dashboard, CRM, or any internal SaaS tool home when a metrics overview with charts, an activity feed and a data table is wanted. Supply content only — brand, nav, search, user, headerActions, kpis, chart, activity, orders; the block owns all layout, the chart rendering and styling.",
  props: z.object({
    /** Brand / product name shown in the sidebar. */
    brand: z.string().optional(),
    /** Sidebar nav item labels (must match site routes for page switching). The first item is treated as the active/home view. */
    nav: z.array(z.string()).optional(),
    /** Top-bar search placeholder text. */
    search: z.string().optional(),
    /** Signed-in user shown in the sidebar footer + top bar. */
    user: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        role: z.string().optional(),
      })
      .optional(),
    /** Page-header heading, subtitle and action buttons. */
    header: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        /** Secondary (outline) action label. */
        secondaryAction: z.string().optional(),
        /** Primary (filled) action label. */
        primaryAction: z.string().optional(),
      })
      .optional(),
    /** KPI stat cards. `tone` colors the icon tile + (with `trendUp`) the trend badge. */
    kpis: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          delta: z.string(),
          /** true = green up trend, false = red down trend. */
          trendUp: z.boolean().optional(),
          deltaNote: z.string().optional(),
          tone: z
            .enum(["primary", "orange", "sky", "violet", "emerald"])
            .optional(),
        }),
      )
      .optional(),
    /** Revenue chart panel: titles, range toggles and the plotted series. */
    chart: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        /** Range-toggle button labels; the first is active. */
        ranges: z.array(z.string()).optional(),
        /** X-axis category labels (one per data point). */
        labels: z.array(z.string()).optional(),
        /** Numeric series plotted as the area line. */
        data: z.array(z.number()).optional(),
      })
      .optional(),
    /** Recent-activity feed. `tone` colors the icon tile + chooses the glyph. */
    activity: z
      .object({
        title: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              text: z.string(),
              /** Phrase inside `text` rendered bold (matched verbatim). */
              emphasis: z.string().optional(),
              time: z.string(),
              tone: z
                .enum(["emerald", "sky", "orange", "primary", "violet"])
                .optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Recent-orders table. */
    orders: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        /** Secondary toolbar button labels (e.g. Filter, Export). */
        actions: z.array(z.string()).optional(),
        columns: z.array(z.string()).optional(),
        rows: z
          .array(
            z.object({
              id: z.string(),
              customer: z.string(),
              product: z.string(),
              date: z.string(),
              amount: z.string(),
              status: z.string(),
              statusTone: z
                .enum(["emerald", "sky", "amber", "red"])
                .optional(),
            }),
          )
          .optional(),
        /** Pagination footer summary text. */
        summary: z.string().optional(),
        /** Pagination page labels (the "1" entry renders as the active page). */
        pages: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      orders: table({
        amount: string(),
        customer: string(),
        date: string(),
        orderId: string(),
        product: string(),
        status: string(),
        statusTone: string(),
      }),
    },
    queries: {
      orders: ({ db }) => db.orders.orderBy("createdAt").all(),
    },
    mutations: {
      addOrder: (
        { db },
        orderId: string,
        customer: string,
        product: string,
        date: string,
        amount: string,
        status: string,
        statusTone: string,
      ) => {
        db.orders.insert({
          amount,
          customer,
          date,
          orderId,
          product,
          status,
          statusTone,
        })
        return db.orders.orderBy("createdAt").all()
      },
      clearOrders: ({ db }) => {
        for (const order of db.orders.all()) {
          db.orders.delete(order.id)
        }
        return db.orders.all()
      },
      removeOrder: ({ db }, id: string) => {
        const order = db.orders.get(id)
        if (order) {
          db.orders.delete(order.id)
        }
        return db.orders.orderBy("createdAt").all()
      },
      setOrderStatus: (
        { db },
        id: string,
        status: string,
        statusTone: string,
      ) => {
        const order = db.orders.get(id)
        if (order) {
          db.orders.update(order.id, { status, statusTone })
        }
        return db.orders.orderBy("createdAt").all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Orbit"
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authDisplayName =
      auth.displayName || auth.user?.displayName || auth.user?.email || "Account"
    const authPicture = auth.picture || auth.user?.picture
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const [activeNav, setActiveNav] = useState(props.nav?.[0] ?? "Dashboard")
    const [activeRange, setActiveRange] = useState(
      props.chart?.ranges?.[0] ?? "12 Months",
    )
    const [notificationsOpen, setNotificationsOpen] = useState(false)

    const addOrder = lakebed.useMutation("addOrder")
    const clearOrders = lakebed.useMutation("clearOrders")
    const removeOrder = lakebed.useMutation("removeOrder")
    const setOrderStatus = lakebed.useMutation("setOrderStatus")
    const storedOrders = lakebed.useQuery("orders")

    const nav = props.nav?.length
      ? props.nav
      : [
          "Dashboard",
          "Orders",
          "Customers",
          "Products",
          "Analytics",
          "Finance",
          "Tickets",
          "Settings",
        ]
    // First six are the primary group, the remainder fall under "Support".
    const primaryNav = nav.slice(0, 6)
    const supportNav = nav.slice(6)

    const searchPlaceholder =
      props.search ?? "Search orders, customers, products..."

    const userName = props.user?.name ?? "Alex Morgan"
    const userEmail = isSignedIn
      ? auth.user?.email || "alex@orbit.dev"
      : props.user?.email ?? "alex@orbit.dev"
    const userRole = props.user?.role ?? "Admin"
    const userAvatarAlt = `portrait headshot of ${isSignedIn ? authDisplayName : userName}, friendly professional`

    const headerTitle = props.header?.title ?? "Dashboard"
    const headerSubtitle =
      props.header?.subtitle ??
      `Welcome back, ${(
        isSignedIn ? authDisplayName : userName
      ).split(" ")[0]}. Here's what's happening with your store.`
    const headerSecondary = props.header?.secondaryAction ?? "Export"
    const headerPrimary = props.header?.primaryAction ?? "New Order"

    const kpis = props.kpis?.length
      ? props.kpis
      : [
          {
            label: "Total Revenue",
            value: "$48,294",
            delta: "12.5%",
            trendUp: true,
            deltaNote: "vs last month",
            tone: "primary" as const,
          },
          {
            label: "Orders",
            value: "1,247",
            delta: "8.2%",
            trendUp: true,
            deltaNote: "vs last month",
            tone: "orange" as const,
          },
          {
            label: "Active Customers",
            value: "3,842",
            delta: "5.1%",
            trendUp: true,
            deltaNote: "vs last month",
            tone: "sky" as const,
          },
          {
            label: "Avg. Order Value",
            value: "$87.40",
            delta: "2.3%",
            trendUp: false,
            deltaNote: "vs last month",
            tone: "violet" as const,
          },
        ]

    const chartTitle = props.chart?.title ?? "Revenue Overview"
    const chartSubtitle = props.chart?.subtitle ?? "Monthly revenue performance"
    const chartRanges = props.chart?.ranges?.length
      ? props.chart.ranges
      : ["12 Months", "30 Days"]
    const chartLabels = props.chart?.labels?.length
      ? props.chart.labels
      : [
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
        ]
    const chartData = props.chart?.data?.length
      ? props.chart.data
      : [
          28000, 32000, 30500, 35000, 38000, 36000, 42000, 41000, 44000, 47000,
          46000, 48294,
        ]

    const activityTitle = props.activity?.title ?? "Recent Activity"
    const activityViewAll = props.activity?.viewAll ?? "View all"
    const activityItems = props.activity?.items?.length
      ? props.activity.items
      : [
          {
            text: "Order #4921 completed",
            emphasis: "Order #4921",
            time: "2 minutes ago",
            tone: "emerald" as const,
          },
          {
            text: "New customer Sarah Chen",
            emphasis: "Sarah Chen",
            time: "15 minutes ago",
            tone: "sky" as const,
          },
          {
            text: "Low stock: Wireless Headphones",
            emphasis: "Wireless Headphones",
            time: "32 minutes ago",
            tone: "orange" as const,
          },
          {
            text: "New review from James Wilson",
            emphasis: "James Wilson",
            time: "1 hour ago",
            tone: "primary" as const,
          },
          {
            text: "Order #4918 shipped",
            emphasis: "Order #4918",
            time: "2 hours ago",
            tone: "violet" as const,
          },
        ]

    const ordersTitle = props.orders?.title ?? "Recent Orders"
    const ordersSubtitle =
      props.orders?.subtitle ?? "Latest transactions from your store"
    const ordersActions = props.orders?.actions?.length
      ? props.orders.actions
      : ["Filter", "Export"]
    const ordersColumns = props.orders?.columns?.length
      ? props.orders.columns
      : ["Order ID", "Customer", "Product", "Date", "Amount", "Status", ""]
    const ordersRows = props.orders?.rows?.length
      ? props.orders.rows
      : [
          {
            id: "#4921",
            customer: "Sarah Chen",
            product: "Wireless Headphones Pro",
            date: "May 31, 2026",
            amount: "$249.00",
            status: "Completed",
            statusTone: "emerald" as const,
          },
          {
            id: "#4920",
            customer: "James Wilson",
            product: "Mechanical Keyboard",
            date: "May 31, 2026",
            amount: "$189.50",
            status: "Shipped",
            statusTone: "sky" as const,
          },
          {
            id: "#4919",
            customer: "Priya Patel",
            product: "USB-C Docking Station",
            date: "May 30, 2026",
            amount: "$129.99",
            status: "Processing",
            statusTone: "amber" as const,
          },
          {
            id: "#4918",
            customer: "Marcus Johnson",
            product: ' 4K Monitor 27"',
            date: "May 30, 2026",
            amount: "$449.00",
            status: "Shipped",
            statusTone: "sky" as const,
          },
          {
            id: "#4917",
            customer: "Emma Davis",
            product: "Ergonomic Chair",
            date: "May 29, 2026",
            amount: "$349.00",
            status: "Completed",
            statusTone: "emerald" as const,
          },
          {
            id: "#4916",
            customer: "Li Wei",
            product: "Webcam 4K Pro",
            date: "May 29, 2026",
            amount: "$199.00",
            status: "Cancelled",
            statusTone: "red" as const,
          },
        ]
        const ordersSummary = props.orders?.summary ?? "Showing 1–6 of 1,247 orders"
    const ordersPages = props.orders?.pages?.length
      ? props.orders.pages
      : ["Prev", "1", "2", "3", "Next"]
    const fallbackOrders = ordersRows
    const hasStoredOrders = !!storedOrders && storedOrders.length > 0
    const ordersData = hasStoredOrders
      ? storedOrders.map((order) => ({
          id: order.orderId || order.id,
          customer: order.customer,
          product: order.product,
          date: order.date,
          amount: order.amount,
          status: order.status,
          statusTone: order.statusTone || "sky",
          dbId: order.id,
        }))
      : fallbackOrders.map((row) => ({ ...row, dbId: null }))

    const totalOrderAmount = ordersData.reduce((sum, row) => {
      const value = Number.parseFloat(row.amount.replace(/[^0-9.]+/g, ""))
      return sum + (Number.isFinite(value) ? value : 0)
    }, 0)

    const seedOrderAmount = () => {
      const nextIndex =
        hasStoredOrders && storedOrders ? storedOrders.length : ordersData.length
      const orderNo = 4900 + (nextIndex + 1)
      return {
        orderId: `#${orderNo}`,
        customer: "New Customer",
        product: "Manual order",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        amount: "$0.00",
        status: "Processing",
        statusTone: "sky",
      }
    }

    const onSetActiveNav = (label: string) => {
      setActiveNav(label)
      setMobileNavOpen(false)
      go(label)
    }

    const onAddOrder = () => {
      const next = seedOrderAmount()
      void addOrder(
        next.orderId,
        next.customer,
        next.product,
        next.date,
        next.amount,
        next.status,
        next.statusTone,
      )
      go(headerPrimary)
    }

    const onToggleOrderStatus = (id: string | null) => {
      if (!id) return
      void setOrderStatus(id, "Completed", "emerald")
    }

    const currentUserName = isSignedIn ? authDisplayName : userName
    const currentUserRole = userRole

    // ── Brand mark — indigo tile + orbit glyph (decorative brand asset). ──
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm",
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

    const navIcon = (label: string): ReactNode =>
      icons[label] ?? icons.Settings

    // ── KPI icon tints (data-viz tokens for a multi-color decorative set). ──
    const kpiTones: Record<string, string> = {
      primary: "bg-primary/10 text-primary",
      orange: "bg-chart-3/10 text-chart-3",
      sky: "bg-chart-2/10 text-chart-2",
      violet: "bg-chart-5/10 text-chart-5",
      emerald: "bg-chart-1/10 text-chart-1",
    }
    const kpiIcons: Record<string, ReactNode> = {
      primary: (
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      ),
      orange: (
        <>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </>
      ),
      sky: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ),
      violet: (
        <>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </>
      ),
      emerald: (
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      ),
    }

    // ── Activity feed tints + glyphs. ──
    const activityTones: Record<
      string,
      { wrap: string; icon: ReactNode }
    > = {
      emerald: {
        wrap: "bg-chart-1/10 text-chart-1",
        icon: (
          <>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </>
        ),
      },
      sky: {
        wrap: "bg-chart-2/10 text-chart-2",
        icon: (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </>
        ),
      },
      orange: {
        wrap: "bg-chart-3/10 text-chart-3",
        icon: (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </>
        ),
      },
      primary: {
        wrap: "bg-primary/10 text-primary",
        icon: (
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        ),
      },
      violet: {
        wrap: "bg-chart-5/10 text-chart-5",
        icon: (
          <>
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </>
        ),
      },
    }

    // ── Status pill tints. ──
    const statusTones: Record<string, { pill: string; dot: string }> = {
      emerald: { pill: "bg-chart-1/10 text-chart-1", dot: "bg-chart-1" },
      sky: { pill: "bg-chart-2/10 text-chart-2", dot: "bg-chart-2" },
      amber: { pill: "bg-chart-4/15 text-chart-4", dot: "bg-chart-4" },
      red: { pill: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
    }

    // ── Build a smooth area-chart path (Catmull-Rom → cubic Bézier). ──
    const chartW = 640
    const chartH = 240
    const padX = 8
    const padTop = 12
    const padBottom = 24
    const innerW = chartW - padX * 2
    const innerH = chartH - padTop - padBottom
    const maxVal = Math.max(...chartData)
    const minVal = Math.min(...chartData)
    const span = maxVal - minVal || 1
    const points = chartData.map((v, i) => {
      const x =
        chartData.length === 1
          ? padX + innerW / 2
          : padX + (innerW * i) / (chartData.length - 1)
      const y = padTop + innerH - ((v - minVal) / span) * innerH
      return { x, y }
    })
    const linePath = points
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const prev = points[i - 1]
        const cx = (prev.x + p.x) / 2
        return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`
      })
      .join(" ")
    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${padTop + innerH} L ${points[0].x} ${padTop + innerH} Z`
        : ""
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(
      (t) => padTop + innerH - t * innerH,
    )

    const sidebarBody = (
      <>
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-3"
          >
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-foreground">
              {brand}
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {primaryNav.map((label) => {
            const active = activeNav === label
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  onSetActiveNav(label)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
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
                {label === "Orders" ? (
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    24
                  </span>
                ) : null}
              </button>
            )
          })}

          {supportNav.length > 0 ? (
            <>
              <div className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Support
              </div>
              {supportNav.map((label) => {
                const active = activeNav === label
                return (
                  <button
                    key={label}
                    type="button"
                onClick={() => {
                  onSetActiveNav(label)
                }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
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
                  </button>
                )
              })}
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
              aria-label={isSignedIn ? "Sign out" : "Sign in"}
              onClick={() => {
                if (isSignedIn) {
                  handleSignOut()
                } else {
                  handleSignIn()
                }
              }}
              disabled={auth.isLoading}
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
      <div
        className={cn(
          "flex h-svh overflow-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Sidebar (desktop) */}
        <aside className="z-30 hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
          {sidebarBody}
        </aside>

        {/* Sidebar (mobile drawer) */}
        {mobileNavOpen ? (
          <>
            <div
              className="fixed inset-0 z-20 bg-foreground/40 md:hidden"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card md:hidden">
              {sidebarBody}
            </aside>
          </>
        ) : null}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="z-10 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMobileNavOpen(true)}
                className="-ml-2 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
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
                onClick={() => setNotificationsOpen(true)}
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
                  onClick={() => go("Messages")}
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
                  onClick={() => {
                    if (isSignedIn) {
                      go("Settings")
                    } else {
                      handleSignIn()
                    }
                  }}
                className="flex items-center gap-3"
                >
                  <Image
                    alt={userAvatarAlt}
                    src={authPicture}
                    w={64}
                    h={64}
                    className="size-8 rounded-full object-cover ring-2 ring-muted"
                  />
                  <span className="hidden text-right lg:block">
                    <span className="block text-sm font-semibold leading-tight text-foreground">
                      {isSignedIn ? currentUserName : userName}
                    </span>
                    <span className="block text-xs leading-tight text-muted-foreground">
                      {isSignedIn ? currentUserRole : userRole}
                    </span>
                  </span>
                </button>
              </div>
              <Sheet
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
              >
                <SheetContent
                  side="right"
                  className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle>Notifications</SheetTitle>
                    <SheetDescription>
                      {ordersData.length} recent activity updates
                    </SheetDescription>
                  </SheetHeader>
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
                    {ordersData.length ? (
                      ordersData.map((row) => (
                        <div
                          key={row.dbId ?? row.id}
                          className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
                        >
                          <p className="font-medium text-foreground">
                            {row.id} — {row.customer}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {row.product}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {row.date} · {row.amount}
                          </p>
                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onToggleOrderStatus(row.dbId)
                              }
                              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                row.dbId
                                  ? void removeOrder(row.dbId)
                                  : go("Orders")
                              }
                              className="rounded-full bg-gradient-to-br from-primary to-primary/80 px-3 py-1 text-xs font-medium text-primary-foreground"
                            >
                              {row.dbId ? "Dismiss" : "Open"}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border px-6 py-4">
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold text-foreground">
                          $
                          {totalOrderAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void clearOrders()}
                          disabled={!hasStoredOrders}
                          className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Clear all
                        </button>
                        <SheetClose asChild>
                          <button
                            type="button"
                            className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                          >
                            Close
                          </button>
                        </SheetClose>
                      </div>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
              {/* Page header */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {headerTitle}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {headerSubtitle}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => go(headerSecondary)}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {headerSecondary}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddOrder()}
                    className="rounded-lg bg-gradient-to-br from-primary to-primary/80 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30 transition hover:-translate-y-px hover:shadow-md hover:shadow-primary/40"
                  >
                    + {headerPrimary}
                  </button>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => {
                  const tone = kpi.tone ?? "primary"
                  const up = kpi.trendUp ?? true
                  return (
                    <div
                      key={kpi.label}
                      className="rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_4px_10px_-4px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {kpi.label}
                          </p>
                          <p className="mt-1 text-2xl font-bold text-foreground">
                            {kpi.value}
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <span
                              className={cn(
                                "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold",
                                up
                                  ? "bg-chart-1/10 text-chart-1"
                                  : "bg-destructive/10 text-destructive",
                              )}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                className="mr-0.5"
                              >
                                {up ? (
                                  <>
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                  </>
                                ) : (
                                  <>
                                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                                    <polyline points="17 18 23 18 23 12" />
                                  </>
                                )}
                              </svg>
                              {kpi.delta}
                            </span>
                            {kpi.deltaNote ? (
                              <span className="text-xs text-muted-foreground">
                                {kpi.deltaNote}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "grid size-10 place-items-center rounded-lg",
                            kpiTones[tone],
                          )}
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
                            {kpiIcons[tone]}
                          </svg>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Chart + activity */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue chart */}
                <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        {chartTitle}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {chartSubtitle}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {chartRanges.map((range) => {
                        const active = activeRange === range
                        return (
                          <button
                            key={range}
                            type="button"
                            onClick={() => setActiveRange(range)}
                            className={cn(
                              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                              active
                                ? "border-primary/20 bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {range}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="relative h-64">
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      preserveAspectRatio="none"
                      className="size-full"
                      role="img"
                      aria-label={`${chartTitle} chart`}
                    >
                      <defs>
                        <linearGradient
                          id="dash-revenue-fill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--color-primary)"
                            stopOpacity="0.25"
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-primary)"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      {gridLines.map((y, i) => (
                        <line
                          key={i}
                          x1={padX}
                          y1={y}
                          x2={chartW - padX}
                          y2={y}
                          className="stroke-border"
                          strokeWidth="1"
                          strokeOpacity="0.5"
                        />
                      ))}
                      <path d={areaPath} fill="url(#dash-revenue-fill)" />
                      <path
                        d={linePath}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      {points.map((p, i) =>
                        i === points.length - 1 ? (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="var(--color-primary)"
                            stroke="var(--color-card)"
                            strokeWidth="2"
                          />
                        ) : null,
                      )}
                    </svg>
                    <div className="pointer-events-none mt-1 flex justify-between px-1 text-[0.6875rem] text-muted-foreground">
                      {chartLabels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">
                      {activityTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={() => go(activityViewAll)}
                      className="text-xs font-medium text-primary hover:text-primary/80"
                    >
                      {activityViewAll}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {activityItems.map((item, i) => {
                      const tone = activityTones[item.tone ?? "primary"]
                      const emph = item.emphasis
                      let before = item.text
                      let bold = ""
                      let after = ""
                      if (emph && item.text.includes(emph)) {
                        const idx = item.text.indexOf(emph)
                        before = item.text.slice(0, idx)
                        bold = emph
                        after = item.text.slice(idx + emph.length)
                      }
                      return (
                        <div key={i} className="flex gap-3">
                          <span
                            className={cn(
                              "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                              tone.wrap,
                            )}
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
                              {tone.icon}
                            </svg>
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground">
                              {before}
                              {bold ? (
                                <span className="font-semibold">{bold}</span>
                              ) : null}
                              {after}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.time}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Orders table */}
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex flex-col justify-between gap-3 border-b border-border/60 p-5 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {ordersTitle}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ordersSubtitle}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {ordersActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => go(action)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          {action.toLowerCase().includes("export") ||
                          action.toLowerCase().includes("download") ? (
                            <>
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </>
                          ) : (
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                          )}
                        </svg>
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                        {ordersColumns.map((col, i) => (
                          <th
                            key={i}
                            className={cn(
                              "px-5 py-3 font-semibold",
                              col === "" && "text-right",
                            )}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {ordersData.map((row) => {
                        const tone = statusTones[row.statusTone ?? "sky"]
                        const initial = row.customer.charAt(0).toUpperCase()
                        return (
                          <tr
                            key={row.id}
                            className="transition-colors hover:bg-muted/60"
                          >
                            <td className="px-5 py-3.5 font-medium text-foreground">
                              {row.id}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/70 to-primary text-[0.625rem] font-bold text-primary-foreground">
                                  {initial}
                                </span>
                                <span className="text-foreground/80">
                                  {row.customer}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              {row.product}
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              {row.date}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-foreground">
                              {row.amount}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium",
                                  tone.pill,
                                )}
                              >
                                <span
                                  className={cn(
                                    "inline-block size-2 rounded-full",
                                    tone.dot,
                                  )}
                                />
                                {row.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                type="button"
                                aria-label={`Actions for ${row.id}`}
                              onClick={() => {
                                if (row.dbId) {
                                  void removeOrder(row.dbId)
                                } else {
                                  go(`Orders`)
                                }
                              }}
                                className="text-muted-foreground transition-colors hover:text-foreground"
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
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
                  <p className="text-xs text-muted-foreground">
                    {ordersSummary}
                  </p>
                  <div className="flex gap-1">
                    {ordersPages.map((label) => {
                      const isActive = label === "1"
                      const disabled = label.toLowerCase() === "prev"
                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={disabled}
                          onClick={() => go("Orders")}
                          className={cn(
                            "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                            isActive
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : disabled
                                ? "cursor-not-allowed border-border bg-card text-muted-foreground/50"
                                : "border-border bg-card text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  },
})
