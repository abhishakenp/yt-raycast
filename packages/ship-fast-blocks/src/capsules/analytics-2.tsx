import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * AnalyticsKimiPage2 — a SECOND, visually DISTINCT analytics dashboard variant
 * (sibling/alternative to AnalyticsKimiPage). A faithful Tailwind v4 port of a
 * Kimi-generated "MetricFlow" admin design.
 *
 * Where AnalyticsKimiPage is a quiet single-column shell, THIS variant is a
 * busier, grouped-navigation product surface: a fixed top navbar (logo +
 * wide search field + notification bell with dot + named user avatar), a fixed
 * left sidebar whose links are grouped under Overview / Insights / Settings
 * captions and capped by a gradient "Pro Plan trial" upsell card, then a main
 * column with a page header (title + Day/Week/Month/Year segmented control +
 * Export Report), a 4-up KPI grid where EACH card carries its own micro
 * visualization (sparkline bars, stacked user avatars, a goal progress bar, a
 * mobile/desktop split), a wide dual-line revenue chart (2024 vs 2023 legend),
 * a doughnut Traffic Sources card, and a Recent Transactions table with
 * customer avatars, status pills, payment-method rows, and numbered pagination.
 * All color via semantic tokens; data-viz uses chart-1..5.
 */
export const AnalyticsKimiPage2 = defineCapsule({
  name: 'AnalyticsKimiPage2',
  description:
    "Alternative / SECOND-style SaaS analytics DASHBOARD page (a visually distinct sibling to AnalyticsKimiPage) ported from a Kimi 'MetricFlow' admin design: busier and more navigation-rich. Layout pairs a fixed TOP navbar (brand logo, a wide 'Search analytics, reports, or metrics' field, a notification bell with an unread dot, and a named user avatar with role) with a fixed LEFT sidebar whose links are grouped under Overview / Insights / Settings section captions (Dashboard, Analytics, Revenue, Customers, Reports, Trends, Experiments, Settings, Help Center) and topped off by a gradient 'Pro Plan — days left in trial / Upgrade Now' upsell card. The main column has a page header with a Day/Week/Month/Year segmented date toggle and an Export Report button, a 4-up KPI metric grid where every card embeds its own micro-visualization (a sparkline bar chart for Total Revenue, stacked active-user avatars, a goal progress bar for Conversion Rate, and a mobile/desktop session split), a wide dual-line Revenue Overview chart comparing 2024 vs 2023 with a legend, a doughnut Traffic Sources chart with a labeled percentage legend and a total-visitors center stat, and a Recent Transactions data table (transaction IDs, customer avatars + emails, date/time, amount, Completed/Processing/Failed/Refunded status pills, payment-method rows, per-row detail action, and numbered 1·2·3…475 pagination). Use as the ROOT/home page for analytics dashboards, admin panels, business-intelligence consoles, revenue or product-metrics overviews, customer/subscription reporting, or any data-visualization control panel when a denser, grouped-nav alternative style is wanted. Supply content only — brand, nav, header copy, KPIs, charts, transactions; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar + sidebar. */
    brand: z.string().optional(),
    /** Sidebar nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navbar search field placeholder. */
    searchPlaceholder: z.string().optional(),
    /** Navbar user identity. */
    user: z
      .object({
        name: z.string().optional(),
        role: z.string().optional(),
        avatarAlt: z.string().optional(),
      })
      .optional(),
    /** Sidebar grouped nav captions, mapped over `nav` in chunks. */
    navGroups: z
      .array(z.object({ caption: z.string(), count: z.number() }))
      .optional(),
    /** Gradient upsell card at the bottom of the sidebar. */
    upsell: z
      .object({
        plan: z.string().optional(),
        note: z.string().optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Page header copy + actions. */
    header: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        toggles: z.array(z.string()).optional(),
        exportLabel: z.string().optional(),
      })
      .optional(),
    /** Total Revenue KPI (with sparkline). */
    revenueKpi: z
      .object({
        label: z.string().optional(),
        value: z.string().optional(),
        delta: z.string().optional(),
        caption: z.string().optional(),
        bars: z.array(z.number()).optional(),
      })
      .optional(),
    /** Active Users KPI (with avatar stack). */
    usersKpi: z
      .object({
        label: z.string().optional(),
        value: z.string().optional(),
        delta: z.string().optional(),
        caption: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Conversion Rate KPI (with goal progress bar). */
    conversionKpi: z
      .object({
        label: z.string().optional(),
        value: z.string().optional(),
        delta: z.string().optional(),
        target: z.string().optional(),
        percent: z.number().optional(),
      })
      .optional(),
    /** Avg. Session KPI (mobile/desktop split). */
    sessionKpi: z
      .object({
        label: z.string().optional(),
        value: z.string().optional(),
        delta: z.string().optional(),
        mobile: z.string().optional(),
        desktop: z.string().optional(),
      })
      .optional(),
    /** Revenue Overview dual-line chart. */
    revenue: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        currentLabel: z.string().optional(),
        priorLabel: z.string().optional(),
        current: z.array(z.number()).optional(),
        prior: z.array(z.number()).optional(),
        months: z.array(z.string()).optional(),
      })
      .optional(),
    /** Traffic Sources doughnut + legend. */
    traffic: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        total: z.string().optional(),
        totalCaption: z.string().optional(),
        sources: z
          .array(z.object({ label: z.string(), value: z.number() }))
          .optional(),
      })
      .optional(),
    /** Recent Transactions table. */
    transactions: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        filterLabel: z.string().optional(),
        footnote: z.string().optional(),
        pages: z.array(z.string()).optional(),
        rows: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              date: z.string(),
              time: z.string(),
              amount: z.string(),
              status: z.enum(['completed', 'processing', 'failed', 'refunded']),
              payment: z.string(),
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
        id: string(),
        name: string(),
        email: string(),
        date: string(),
        time: string(),
        amount: string(),
        status: string(),
        payment: string(),
      }),
      savedReports: table({
        name: string(),
        description: string(),
        dateRange: string(),
      }),
      alerts: table({
        title: string(),
        message: string(),
        timestamp: string(),
        read: string(),
      }),
    },
    queries: {
      transactions: ({ db }) => db.transactions.orderBy('createdAt').all(),
      savedReports: ({ db }) => db.savedReports.orderBy('createdAt').all(),
      unreadAlerts: ({ db }) =>
        db.alerts.where('read', 'false').orderBy('createdAt').all(),
    },
    mutations: {
      saveReport: (
        { db },
        name: string,
        description: string,
        dateRange: string,
      ) => {
        db.savedReports.insert({ name, description, dateRange })
        return db.savedReports.all()
      },
      deleteReport: ({ db }, reportId: string) => {
        db.savedReports.delete(reportId)
        return db.savedReports.all()
      },
      markAlertRead: ({ db }, alertId: string) => {
        db.alerts.update(alertId, { read: 'true' })
        return db.alerts.all()
      },
      markAllAlertsRead: ({ db }) => {
        for (const alert of db.alerts.where('read', 'false').all()) {
          db.alerts.update(alert.id, { read: 'true' })
        }
        return db.alerts.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const brand = props.brand ?? 'MetricFlow'
    const nav = props.nav?.length
      ? props.nav
      : [
          'Dashboard',
          'Analytics',
          'Revenue',
          'Customers',
          'Reports',
          'Trends',
          'Experiments',
          'Settings',
          'Help Center',
        ]

    const searchPlaceholder =
      props.searchPlaceholder ?? 'Search analytics, reports, or metrics...'

    const userRole = props.user?.role ?? 'Product Manager'
    const userAvatarAlt =
      props.user?.avatarAlt ??
      'Professional headshot of Sarah Chen, Product Manager'

    const navGroups = props.navGroups?.length
      ? props.navGroups
      : [
          { caption: 'Overview', count: 4 },
          { caption: 'Insights', count: 3 },
          { caption: 'Settings', count: 2 },
        ]

    const upsellPlan = props.upsell?.plan ?? 'Pro Plan'
    const upsellNote = props.upsell?.note ?? '12 days left in trial'
    const upsellCta = props.upsell?.cta ?? 'Upgrade Now'

    const headerTitle = props.header?.title ?? 'Dashboard Overview'
    const headerSubtitle =
      props.header?.subtitle ??
      'Track your key metrics and performance indicators'
    const headerToggles = props.header?.toggles?.length
      ? props.header.toggles
      : ['Day', 'Week', 'Month', 'Year']
    const activeToggle = 'Month'
    const exportLabel = props.header?.exportLabel ?? 'Export Report'

    const revenueKpi = {
      label: props.revenueKpi?.label ?? 'Total Revenue',
      value: props.revenueKpi?.value ?? '$284,592',
      delta: props.revenueKpi?.delta ?? '+12.5%',
      caption: props.revenueKpi?.caption ?? 'vs last month',
      bars: props.revenueKpi?.bars?.length
        ? props.revenueKpi.bars
        : [40, 60, 45, 80, 55, 70, 100],
    }
    const usersKpi = {
      label: props.usersKpi?.label ?? 'Active Users',
      value: props.usersKpi?.value ?? '48,293',
      delta: props.usersKpi?.delta ?? '+8.2%',
      caption: props.usersKpi?.caption ?? 'vs last month',
      note: props.usersKpi?.note ?? '+2,847 new today',
    }
    const conversionKpi = {
      label: props.conversionKpi?.label ?? 'Conversion Rate',
      value: props.conversionKpi?.value ?? '3.24%',
      delta: props.conversionKpi?.delta ?? '-2.1%',
      target: props.conversionKpi?.target ?? 'Target: 4.0%',
      percent: props.conversionKpi?.percent ?? 81,
    }
    const sessionKpi = {
      label: props.sessionKpi?.label ?? 'Avg. Session',
      value: props.sessionKpi?.value ?? '4m 32s',
      delta: props.sessionKpi?.delta ?? '+18.3%',
      mobile: props.sessionKpi?.mobile ?? '2m 48s',
      desktop: props.sessionKpi?.desktop ?? '6m 15s',
    }

    const revenueTitle = props.revenue?.title ?? 'Revenue Overview'
    const revenueSubtitle =
      props.revenue?.subtitle ?? 'Monthly revenue performance'
    const revenueCurrentLabel = props.revenue?.currentLabel ?? '2024'
    const revenuePriorLabel = props.revenue?.priorLabel ?? '2023'
    const revenueMonths = props.revenue?.months?.length
      ? props.revenue.months
      : [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
    const revenueCurrent = props.revenue?.current?.length
      ? props.revenue.current
      : [40, 70, 120, 100, 160, 140, 200, 180, 220, 210, 240, 260]
    const revenuePrior = props.revenue?.prior?.length
      ? props.revenue.prior
      : [60, 80, 100, 90, 120, 110, 140, 130, 160, 150, 180, 200]

    const trafficTitle = props.traffic?.title ?? 'Traffic Sources'
    const trafficSubtitle =
      props.traffic?.subtitle ?? 'Where your visitors come from'
    const trafficTotal = props.traffic?.total ?? '482K'
    const trafficTotalCaption = props.traffic?.totalCaption ?? 'Total Visitors'
    const trafficSources = props.traffic?.sources?.length
      ? props.traffic.sources
      : [
          { label: 'Organic Search', value: 45 },
          { label: 'Direct', value: 25 },
          { label: 'Social Media', value: 18 },
          { label: 'Referral', value: 12 },
        ]

    const txTitle = props.transactions?.title ?? 'Recent Transactions'
    const txSubtitle =
      props.transactions?.subtitle ?? 'Latest customer orders and payments'
    const txSearchPlaceholder =
      props.transactions?.searchPlaceholder ?? 'Search transactions...'
    const txFilterLabel = props.transactions?.filterLabel ?? 'Filter'
    const txFootnote =
      props.transactions?.footnote ?? 'Showing 1-6 of 2,847 transactions'
    const txPages = props.transactions?.pages?.length
      ? props.transactions.pages
      : ['1', '2', '3', '...', '475']
    const txRows = props.transactions?.rows?.length
      ? props.transactions.rows
      : ([
          {
            id: '#TRX-2024-8842',
            name: 'Sarah Chen',
            email: 'sarah@techflow.io',
            date: 'May 28, 2024',
            time: '2:34 PM',
            amount: '$2,450.00',
            status: 'completed',
            payment: 'Visa ending in 4242',
          },
          {
            id: '#TRX-2024-8841',
            name: 'Marcus Johnson',
            email: 'marcus@designstudio.co',
            date: 'May 28, 2024',
            time: '11:15 AM',
            amount: '$899.00',
            status: 'completed',
            payment: 'Mastercard •••• 8856',
          },
          {
            id: '#TRX-2024-8840',
            name: 'Emily Rodriguez',
            email: 'emily@startup.xyz',
            date: 'May 27, 2024',
            time: '4:52 PM',
            amount: '$4,999.00',
            status: 'processing',
            payment: 'Visa ending in 8391',
          },
          {
            id: '#TRX-2024-8839',
            name: 'David Kim',
            email: 'david@techventures.com',
            date: 'May 27, 2024',
            time: '10:30 AM',
            amount: '$1,299.00',
            status: 'failed',
            payment: 'Amex •••• 1024',
          },
          {
            id: '#TRX-2024-8838',
            name: 'Jessica Williams',
            email: 'jessica@creative.agency',
            date: 'May 26, 2024',
            time: '3:45 PM',
            amount: '$3,750.00',
            status: 'completed',
            payment: 'Visa ending in 6572',
          },
          {
            id: '#TRX-2024-8837',
            name: 'Michael Foster',
            email: 'michael@enterprise.io',
            date: 'May 26, 2024',
            time: '9:12 AM',
            amount: '$12,500.00',
            status: 'refunded',
            payment: 'Mastercard •••• 4401',
          },
        ] as const)

    // Lakebed hooks
    const storedTransactions = lakebed.useQuery('transactions')
    const unreadAlerts = lakebed.useQuery('unreadAlerts')
    const auth = lakebed.useAuth()
    const markAlertRead = lakebed.useMutation('markAlertRead')
    const markAllAlertsRead = lakebed.useMutation('markAllAlertsRead')

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

    // Use stored transactions if available, otherwise fall back to static defaults
    const displayTxRows =
      storedTransactions && storedTransactions.length > 0
        ? storedTransactions
        : txRows

    const alertCount = unreadAlerts?.length ?? 0

    // Chart tokens cycled for doughnut slices / legend dots (data viz only).
    const sliceTokens = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4']

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
      Analytics: (
        <svg {...iconProps}>
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      Revenue: (
        <svg {...iconProps}>
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      Customers: (
        <svg {...iconProps}>
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      Reports: (
        <svg {...iconProps}>
          <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      Trends: (
        <svg {...iconProps}>
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      Experiments: (
        <svg {...iconProps}>
          <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      Settings: (
        <svg {...iconProps}>
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'Help Center': (
        <svg {...iconProps}>
          <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    }

    const statusStyles: Record<string, string> = {
      completed: 'bg-chart-1/15 text-chart-1',
      processing: 'bg-chart-3/15 text-chart-3',
      failed: 'bg-destructive/15 text-destructive',
      refunded: 'bg-chart-2/15 text-chart-2',
    }
    const statusLabels: Record<string, string> = {
      completed: 'Completed',
      processing: 'Processing',
      failed: 'Failed',
      refunded: 'Refunded',
    }

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

    // Build grouped sidebar sections by chunking `nav` per navGroups counts.
    let cursor = 0
    const navSections = navGroups.map((g) => {
      const items = nav.slice(cursor, cursor + g.count)
      cursor += g.count
      return { caption: g.caption, items }
    })
    if (cursor < nav.length) {
      navSections.push({ caption: 'More', items: nav.slice(cursor) })
    }

    // ---- Dual-line revenue chart geometry ----
    const chartW = 800
    const chartH = 300
    const allRev = [...revenueCurrent, ...revenuePrior]
    const maxRev = Math.max(...allRev, 1)
    const stepX =
      revenueMonths.length > 1 ? chartW / (revenueMonths.length - 1) : 0
    const toPoints = (series: number[]) =>
      series
        .map((v, i) => {
          const x = i * stepX
          const y = chartH - (v / maxRev) * (chartH - 20) - 10
          return `${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
    const currentPts = toPoints(revenueCurrent)
    const priorPts = toPoints(revenuePrior)
    const areaPts = `0,${chartH} ${currentPts} ${chartW},${chartH}`

    // ---- Doughnut geometry (stroke-dasharray) ----
    const trafficSum = trafficSources.reduce((sum, s) => sum + s.value, 0) || 1
    const radius = 40
    const circumference = 2 * Math.PI * radius
    let dashAcc = 0
    const segments = trafficSources.map((s, i) => {
      const frac = s.value / trafficSum
      const seg = {
        dash: frac * circumference,
        gap: circumference - frac * circumference,
        offset: -dashAcc,
        token: sliceTokens[i % sliceTokens.length].replace('bg-', 'stroke-'),
      }
      dashAcc += frac * circumference
      return seg
    })

    return (
      <div
        className={cn(
          'relative min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
          <div className="border-b border-border p-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-2xl font-bold text-primary"
            >
              <LogoMark className="size-8 text-base" />
              {brand}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            {navSections.map((section) => (
              <div key={section.caption} className="mb-4">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.caption}
                </p>
                <div className="space-y-1">
                  {section.items.map((label) => {
                    const active = label === nav[0]
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => go(label)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {navIcons[label] ?? navIcons.Dashboard}
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-border p-4">
            <div className="rounded-xl bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground">
              <p className="text-sm font-semibold">{upsellPlan}</p>
              <p className="mt-1 text-xs text-primary-foreground/80">
                {upsellNote}
              </p>
              <button
                type="button"
                onClick={() => go(upsellCta)}
                className="mt-3 w-full rounded-lg bg-card px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted"
              >
                {upsellCta}
              </button>
            </div>
          </div>
        </aside>

        {/* Top navbar */}
        <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-card lg:pl-64">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="rounded-lg p-2 text-muted-foreground hover:text-foreground"
              >
                <svg {...iconProps} width={24} height={24}>
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-xl font-bold text-primary">{brand}</span>
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
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
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                go(searchPlaceholder)
              }}
              className="hidden flex-1 lg:flex"
            >
              <div className="relative w-full max-w-md">
                <svg
                  {...iconProps}
                  className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  aria-label="Search"
                  className="w-full rounded-lg border border-input bg-muted py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:bg-background focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>

            <div className="flex items-center gap-3 lg:gap-4">
              <Sheet
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
              >
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <svg {...iconProps} width={24} height={24}>
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {alertCount > 0 ? (
                      <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Notifications</SheetTitle>
                    <SheetDescription>
                      {alertCount > 0
                        ? `${alertCount} unread notification${alertCount === 1 ? '' : 's'}`
                        : 'No unread notifications'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {unreadAlerts && unreadAlerts.length > 0 ? (
                      <div className="space-y-4">
                        {unreadAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="rounded-lg border border-border bg-muted/40 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                  {alert.title}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {alert.message}
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {alert.timestamp}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void markAlertRead(alert.id)}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Mark as read"
                              >
                                <svg {...iconProps} width={16} height={16}>
                                  <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
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
                          You're all caught up! Check back later for updates.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="flex w-full gap-2">
                      {unreadAlerts && unreadAlerts.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 rounded-full"
                          onClick={() => void markAllAlertsRead()}
                        >
                          Mark all read
                        </Button>
                      )}
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex-1 rounded-full"
                        >
                          Close
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="flex items-center gap-3 border-l border-border pl-3 text-left"
                    >
                      {authPicture ? (
                        <Avatar size="sm" className="ring-2 ring-background">
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Image
                          alt={userAvatarAlt}
                          w={80}
                          h={80}
                          className="size-8 rounded-full object-cover"
                        />
                      )}
                      <div className="hidden md:block">
                        <p className="text-sm font-semibold text-card-foreground">
                          {authDisplayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userRole}
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
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
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
                        onClick={() => go('Settings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Settings
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Reports')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Saved Reports
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
                  aria-label="Sign in with Google"
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="min-h-svh pt-16 lg:pl-64">
          <div className="mx-auto max-w-7xl space-y-8 p-4 lg:p-8">
            {/* Page header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                  {headerTitle}
                </h1>
                <p className="mt-1 text-muted-foreground">{headerSubtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border bg-card p-1">
                  {headerToggles.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => go(t)}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        t === activeToggle
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go(exportLabel)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <svg {...iconProps}>
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">{exportLabel}</span>
                </button>
              </div>
            </div>

            {/* KPI grid */}
            <section aria-label="Key performance indicators">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {/* Total Revenue — sparkline */}
                <article className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {revenueKpi.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-card-foreground lg:text-3xl">
                        {revenueKpi.value}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <svg
                          {...iconProps}
                          width={16}
                          height={16}
                          className="text-chart-1"
                        >
                          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm font-semibold text-chart-1">
                          {revenueKpi.delta}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {revenueKpi.caption}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-chart-1/10 p-3 text-chart-1">
                      <svg {...iconProps} width={24} height={24}>
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex h-12 items-end gap-1">
                    {revenueKpi.bars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-chart-1/40"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </article>

                {/* Active Users — avatar stack */}
                <article className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {usersKpi.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-card-foreground lg:text-3xl">
                        {usersKpi.value}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <svg
                          {...iconProps}
                          width={16}
                          height={16}
                          className="text-chart-1"
                        >
                          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm font-semibold text-chart-1">
                          {usersKpi.delta}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <svg {...iconProps} width={24} height={24}>
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[
                        'Active user profile photo of young woman with curly hair',
                        'Active user profile photo of professional man with beard',
                        'Active user profile photo of smiling businesswoman',
                        'Active user profile photo of young man in casual attire',
                      ].map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={80}
                          h={80}
                          className="size-8 rounded-full border-2 border-card object-cover"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {usersKpi.note}
                    </span>
                  </div>
                </article>

                {/* Conversion Rate — goal progress */}
                <article className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {conversionKpi.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-card-foreground lg:text-3xl">
                        {conversionKpi.value}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <svg
                          {...iconProps}
                          width={16}
                          height={16}
                          className="text-destructive"
                        >
                          <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                        <span className="text-sm font-semibold text-destructive">
                          {conversionKpi.delta}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                      <svg {...iconProps} width={24} height={24}>
                        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {conversionKpi.target}
                      </span>
                      <span className="font-medium text-card-foreground">
                        {conversionKpi.percent}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-destructive"
                        style={{ width: `${conversionKpi.percent}%` }}
                      />
                    </div>
                  </div>
                </article>

                {/* Avg. Session — mobile/desktop split */}
                <article className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {sessionKpi.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-card-foreground lg:text-3xl">
                        {sessionKpi.value}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <svg
                          {...iconProps}
                          width={16}
                          height={16}
                          className="text-chart-1"
                        >
                          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm font-semibold text-chart-1">
                          {sessionKpi.delta}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-chart-4/10 p-3 text-chart-4">
                      <svg {...iconProps} width={24} height={24}>
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="mb-1 text-xs text-muted-foreground">
                        Mobile
                      </p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {sessionKpi.mobile}
                      </p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="flex-1">
                      <p className="mb-1 text-xs text-muted-foreground">
                        Desktop
                      </p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {sessionKpi.desktop}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* Charts */}
            <section aria-label="Analytics charts">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue dual-line chart */}
                <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-card-foreground">
                        {revenueTitle}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {revenueSubtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="size-3 rounded-full bg-chart-1" />
                        {revenueCurrentLabel}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="size-3 rounded-full bg-muted-foreground/40" />
                        {revenuePriorLabel}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-64 lg:h-80">
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      preserveAspectRatio="none"
                      className="size-full"
                      role="img"
                      aria-label={`${revenueTitle} chart`}
                    >
                      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                        <line
                          key={f}
                          x1={0}
                          x2={chartW}
                          y1={chartH * f}
                          y2={chartH * f}
                          className="stroke-border"
                          strokeWidth={1}
                        />
                      ))}
                      <polygon
                        points={areaPts}
                        className="fill-chart-1/15"
                        stroke="none"
                      />
                      <polyline
                        points={priorPts}
                        fill="none"
                        className="stroke-muted-foreground/40"
                        strokeWidth={3}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <polyline
                        points={currentPts}
                        fill="none"
                        className="stroke-chart-1"
                        strokeWidth={3}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {revenueCurrent.map((v, i) => (
                        <circle
                          key={i}
                          cx={i * stepX}
                          cy={chartH - (v / maxRev) * (chartH - 20) - 10}
                          r={5}
                          className="fill-chart-1"
                        />
                      ))}
                    </svg>
                    <div className="mt-2 flex justify-between px-2 text-xs text-muted-foreground">
                      {revenueMonths.map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Traffic doughnut */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-card-foreground">
                      {trafficTitle}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {trafficSubtitle}
                    </p>
                  </div>
                  <div className="relative mx-auto mb-6 size-48">
                    <svg
                      viewBox="0 0 100 100"
                      className="size-full -rotate-90"
                      role="img"
                      aria-label={`${trafficTitle} chart`}
                    >
                      <circle
                        cx={50}
                        cy={50}
                        r={radius}
                        fill="none"
                        className="stroke-muted"
                        strokeWidth={12}
                      />
                      {segments.map((seg, i) => (
                        <circle
                          key={trafficSources[i].label}
                          cx={50}
                          cy={50}
                          r={radius}
                          fill="none"
                          strokeWidth={12}
                          strokeLinecap="round"
                          className={seg.token}
                          strokeDasharray={`${seg.dash} ${seg.gap}`}
                          strokeDashoffset={seg.offset}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-card-foreground">
                          {trafficTotal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trafficTotalCaption}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {trafficSources.map((s, i) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'size-3 rounded-full',
                              sliceTokens[i % sliceTokens.length],
                            )}
                          />
                          <span className="text-sm text-foreground">
                            {s.label}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-card-foreground">
                          {s.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Transactions table */}
            <section aria-label="Recent transactions">
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-card-foreground">
                        {txTitle}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {txSubtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          go(txSearchPlaceholder)
                        }}
                        className="relative"
                      >
                        <svg
                          {...iconProps}
                          className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground"
                        >
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="search"
                          placeholder={txSearchPlaceholder}
                          aria-label="Search transactions"
                          className="w-full rounded-lg border border-input bg-muted py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-ring sm:w-64"
                        />
                      </form>
                      <button
                        type="button"
                        onClick={() => go(txFilterLabel)}
                        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <svg {...iconProps}>
                          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {txFilterLabel}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        {[
                          'Transaction ID',
                          'Customer',
                          'Date',
                          'Amount',
                          'Status',
                          'Payment Method',
                        ].map((h) => (
                          <th
                            key={h}
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {displayTxRows.map((row) => (
                        <tr
                          key={row.id}
                          className="transition-colors hover:bg-muted"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-sm font-medium text-primary">
                              {row.id}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Image
                                alt={`Customer profile photo of ${row.name}`}
                                w={80}
                                h={80}
                                className="size-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-medium text-card-foreground">
                                  {row.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {row.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-sm text-foreground">
                              {row.date}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {row.time}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-sm font-semibold text-card-foreground">
                              {row.amount}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                statusStyles[row.status],
                              )}
                            >
                              {statusLabels[row.status]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              <svg
                                width={20}
                                height={20}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                                className="text-muted-foreground"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                              </svg>
                              <span className="text-sm text-foreground">
                                {row.payment}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <button
                              type="button"
                              aria-label={`View ${row.id} details`}
                              onClick={() => go(`${row.id} details`)}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <svg {...iconProps}>
                                <path d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-border px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {txFootnote}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled
                        aria-label="Previous page"
                        className="cursor-not-allowed rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground opacity-50"
                      >
                        <svg {...iconProps}>
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      {txPages.map((p, i) =>
                        p === '...' ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="px-2 text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => go(`Transactions page ${p}`)}
                            className={cn(
                              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                              i === 0
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border text-foreground hover:bg-muted',
                            )}
                          >
                            {p}
                          </button>
                        ),
                      )}
                      <button
                        type="button"
                        aria-label="Next page"
                        onClick={() => go('Next transactions')}
                        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                      >
                        <svg {...iconProps}>
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    )
  },
})
