import { useState } from 'react'
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from '@ship-fast/lakebed/server'
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

export const InvestingKimiPage3 = defineCapsule({
  name: "InvestingKimiPage3",
  description:
    "Investing third style sibling to InvestingKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    sections: z
      .array(
        z.object({
          eyebrow: z.string(),
          title: z.string(),
          body: z.string(),
          items: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    gallery: z
      .array(
        z.object({
          title: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      watchlist: table({
        symbol: string(),
        name: string(),
        price: string(),
        change: string(),
      }),
      portfolio: table({
        symbol: string(),
        name: string(),
        shares: number(),
        avgPrice: string(),
        currentPrice: string(),
      }),
    },
    queries: {
      watchlist: ({ db }) => db.watchlist.orderBy('createdAt').all(),
      portfolio: ({ db }) => db.portfolio.orderBy('createdAt').all(),
    },
    mutations: {
      addToWatchlist: ({ db }, symbol: string, name: string, price: string, change: string) => {
        const existing = db.watchlist.where('symbol', symbol).all()[0]
        if (!existing) {
          db.watchlist.insert({ symbol, name, price, change })
        }
        return db.watchlist.all()
      },
      removeFromWatchlist: ({ db }, symbol: string) => {
        for (const item of db.watchlist.where('symbol', symbol).all()) {
          db.watchlist.delete(item.id)
        }
        return db.watchlist.all()
      },
      addToPortfolio: ({ db }, symbol: string, name: string, shares: number, avgPrice: string, currentPrice: string) => {
        const existing = db.portfolio.where('symbol', symbol).all()[0]
        if (existing) {
          const totalShares = existing.shares + shares
          const totalCost = Number.parseFloat(existing.avgPrice.replace(/[^0-9.]+/g, '')) * existing.shares + Number.parseFloat(avgPrice.replace(/[^0-9.]+/g, '')) * shares
          const newAvgPrice = `$${(totalCost / totalShares).toFixed(2)}`
          db.portfolio.update(existing.id, { shares: totalShares, avgPrice: newAvgPrice, currentPrice })
        } else {
          db.portfolio.insert({ symbol, name, shares, avgPrice, currentPrice })
        }
        return db.portfolio.all()
      },
      removeFromPortfolio: ({ db }, symbol: string) => {
        for (const item of db.portfolio.where('symbol', symbol).all()) {
          db.portfolio.delete(item.id)
        }
        return db.portfolio.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [watchlistOpen, setWatchlistOpen] = useState(false)
    const [portfolioOpen, setPortfolioOpen] = useState(false)
    const brand = props.brand ?? "Meridian Investing & Trading Platform"
    const nav = props.nav?.length ? props.nav : ["Meridian", "Markets", "Features", "Pricing", "Support", "Log in"]

    const watchlist = lakebed.useQuery('watchlist')
    const portfolio = lakebed.useQuery('portfolio')
    const addToWatchlist = lakebed.useMutation('addToWatchlist')
    const removeFromWatchlist = lakebed.useMutation('removeFromWatchlist')
    const addToPortfolio = lakebed.useMutation('addToPortfolio')
    const removeFromPortfolio = lakebed.useMutation('removeFromPortfolio')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName = auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials = authDisplayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ME'
    const authLabel = auth.isLoading ? 'Checking...' : isSignedIn ? authDisplayName : 'Sign in'

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground"
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

    const StarIcon = ({ filled = false }: { filled?: boolean }) => (
      <svg
        className={cn('size-5', filled ? 'text-primary' : 'text-muted-foreground')}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
    const hero = {
      eyebrow: "Investing / Variant 3",
      title: "Invest with precision. Trade with confidence.",
      description: "Meridian Investing & Trading Platform Meridian Markets Features Pricing Support Log in Get Started Live markets now open Invest with precision. Trade with confidence. Real-time...",
      primaryCta: "Get Started Free",
      secondaryCta: "Meridian",
      imageAlt: "professional headshot of a female trader",
      ...props.hero,
    }
    const metrics = props.metrics?.length ? props.metrics : [
  {
    "value": "24/7",
    "label": "Responsive service"
  },
  {
    "value": "98%",
    "label": "Positive outcomes"
  },
  {
    "value": "4.9",
    "label": "Average rating"
  },
  {
    "value": "12+",
    "label": "Core capabilities"
  }
]
    const sections = props.sections?.length ? props.sections : [
  {
    "eyebrow": "Overview",
    "title": "Everything you need to outperform",
    "body": "Meridian Investing & Trading Platform Meridian Markets Features Pricing Support Log in Get Started Live markets now open Invest with precision. Trade with confidence. Real-time...",
    "items": [
      "Simple, transparent pricing",
      "Trusted by serious investors",
      "Frequently asked questions"
    ]
  },
  {
    "eyebrow": "Experience",
    "title": "Start trading in three minutes",
    "body": "Investing page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Start building wealth today",
      "Live Market Ticker June 1, 2026",
      "Real-Time Market Data"
    ]
  },
  {
    "eyebrow": "Proof",
    "title": "Inside the platform",
    "body": "Investing page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Zero Commission Trades",
      "Advanced Charting",
      "Portfolio Analytics"
    ]
  },
  {
    "eyebrow": "Next steps",
    "title": "Simple, transparent pricing",
    "body": "Investing page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Tax-Loss Harvesting",
      "Institutional Security",
      "Create your account"
    ]
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "Start trading in three minutes",
    "alt": "professional headshot of a female trader",
    "caption": "Investing generated page detail"
  },
  {
    "title": "Inside the platform",
    "alt": "professional headshot of a male investor",
    "caption": "Investing generated page detail"
  },
  {
    "title": "Simple, transparent pricing",
    "alt": "professional headshot of a young analyst",
    "caption": "Investing generated page detail"
  }
]

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button type="button" onClick={() => go("Home")} className="text-left text-lg font-semibold tracking-tight">
              {brand}
            </button>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go(item)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Sheet open={watchlistOpen} onOpenChange={setWatchlistOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <StarIcon filled={false} />
                    <span className="hidden sm:inline">Watchlist</span>
                    {watchlist && watchlist.length > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                        {watchlist.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Watchlist</SheetTitle>
                    <SheetDescription>
                      {watchlist && watchlist.length > 0
                        ? `${watchlist.length} item${watchlist.length === 1 ? '' : 's'} in your watchlist.`
                        : 'Your watchlist is empty.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {watchlist && watchlist.length > 0 ? (
                      <div className="space-y-3">
                        {watchlist.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{item.symbol}</span>
                                <span className="text-sm text-muted-foreground">{item.name}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-3">
                                <span className="font-bold text-foreground">{item.price}</span>
                                <span className={cn('text-sm font-medium', item.change.startsWith('+') ? 'text-primary' : 'text-destructive')}>
                                  {item.change}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeFromWatchlist(item.symbol)}
                              className="ml-3 rounded-md border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">No items in watchlist</p>
                        <p className="mt-2 text-sm text-muted-foreground">Add stocks to track their performance.</p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button type="button" variant="outline" className="w-full rounded-full">
                        Close
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Sheet open={portfolioOpen} onOpenChange={setPortfolioOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    <span className="hidden sm:inline">Portfolio</span>
                    {portfolio && portfolio.length > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                        {portfolio.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Portfolio</SheetTitle>
                    <SheetDescription>
                      {portfolio && portfolio.length > 0
                        ? `${portfolio.length} position${portfolio.length === 1 ? '' : 's'} in your portfolio.`
                        : 'Your portfolio is empty.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {portfolio && portfolio.length > 0 ? (
                      <div className="space-y-3">
                        {portfolio.map((item) => {
                          const currentValue = Number.parseFloat(item.currentPrice.replace(/[^0-9.]+/g, '')) * item.shares
                          const costBasis = Number.parseFloat(item.avgPrice.replace(/[^0-9.]+/g, '')) * item.shares
                          const gainLoss = currentValue - costBasis
                          const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground">{item.symbol}</span>
                                  <span className="text-sm text-muted-foreground">{item.name}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-3">
                                  <span className="text-sm text-muted-foreground">{item.shares} shares</span>
                                  <span className="font-bold text-foreground">{formatCurrency(currentValue)}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className={cn('text-sm font-medium', gainLoss >= 0 ? 'text-primary' : 'text-destructive')}>
                                    {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                  </span>
                                  <span className={cn('text-sm', gainLoss >= 0 ? 'text-primary' : 'text-destructive')}>
                                    ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => void removeFromPortfolio(item.symbol)}
                                className="ml-3 rounded-md border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                              >
                                Remove
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">No positions in portfolio</p>
                        <p className="mt-2 text-sm text-muted-foreground">Start building your investment portfolio.</p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button type="button" variant="outline" className="w-full rounded-full">
                        Close
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar size="sm" className="ring-2 ring-background" aria-hidden="true">
                        {authPicture ? (
                          <AvatarImage src={authPicture} alt={authDisplayName} />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                        {authDisplayName}
                      </span>
                      <ChevronDown />
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
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => go(hero.primaryCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:py-24">
              <div>
                <p className="mb-4 inline-flex rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {hero.eyebrow}
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {hero.title}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  {hero.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => go(hero.primaryCta)}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(hero.secondaryCta)}
                    className="rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {hero.secondaryCta}
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <Image alt={hero.imageAlt} w={1200} h={900} className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => {
              const sampleMetrics = [
                { value: '$2.4M', label: 'Assets tracked', action: () => setPortfolioOpen(true) },
                { value: '98%', label: 'Positive outcomes', action: () => setWatchlistOpen(true) },
                { value: '4.9', label: 'Average rating', action: () => go('Reviews') },
                { value: '12+', label: 'Core capabilities', action: () => go('Features') },
              ]
              const metricData = sampleMetrics[index % sampleMetrics.length]

              return (
                <button
                  key={metric.label}
                  type="button"
                  onClick={metricData.action}
                  className="rounded-lg border border-border bg-card p-5 text-left transition-colors hover:bg-accent"
                >
                  <p className="text-3xl font-semibold text-card-foreground">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.label}</p>
                </button>
              )
            })}
          </section>

          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
              {sections.map((section, index) => (
                <article key={section.title} className="rounded-lg border border-border bg-card p-6">
                  <p className="text-sm font-medium text-primary">{section.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">{section.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item, itemIndex) => {
                        const sampleStocks = [
                          { symbol: 'TSLA', name: 'Tesla Inc.', price: '$248.50', change: '+3.2%' },
                          { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$875.30', change: '+4.1%' },
                          { symbol: 'AMZN', name: 'Amazon.com', price: '$178.25', change: '-1.2%' },
                          { symbol: 'META', name: 'Meta Platforms', price: '$505.75', change: '+2.8%' },
                        ]
                        const stock = sampleStocks[itemIndex % sampleStocks.length]

                        return (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                          >
                            <button
                              type="button"
                              onClick={() => go(item)}
                              className="flex-1 text-left transition-colors hover:text-accent-foreground"
                            >
                              {item}
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void addToWatchlist(stock.symbol, stock.name, stock.price, stock.change)}
                                className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                                title="Add to watchlist"
                              >
                                <StarIcon filled={false} />
                              </button>
                              <button
                                type="button"
                                onClick={() => void addToPortfolio(stock.symbol, stock.name, 5, stock.price, stock.price)}
                                className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                                title="Add to portfolio"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">Generated visuals</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Content-led page moments</h2>
              </div>
              <button
                type="button"
                onClick={() => go(hero.secondaryCta)}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {hero.secondaryCta}
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {gallery.map((item, index) => {
                const sampleStocks = [
                  { symbol: 'AAPL', name: 'Apple Inc.', price: '$189.50', change: '+2.3%' },
                  { symbol: 'MSFT', name: 'Microsoft Corp.', price: '$378.90', change: '+1.8%' },
                  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$141.20', change: '-0.5%' },
                ]
                const stock = sampleStocks[index % sampleStocks.length]
                const isInWatchlist = watchlist && watchlist.some((w) => w.symbol === stock.symbol)

                return (
                  <article key={item.title} className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="relative">
                      <Image alt={item.alt} w={900} h={700} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => isInWatchlist ? void removeFromWatchlist(stock.symbol) : void addToWatchlist(stock.symbol, stock.name, stock.price, stock.change)}
                        className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-background/90 shadow-md transition-all hover:scale-105"
                        title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        <StarIcon filled={isInWatchlist} />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                        <span className="text-sm font-bold text-foreground">{stock.price}</span>
                      </div>
                      {item.caption ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.caption}</p> : null}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">{stock.symbol}</span>
                        <span className={cn('text-xs font-medium', stock.change.startsWith('+') ? 'text-primary' : 'text-destructive')}>
                          {stock.change}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-16">
            <div className="rounded-lg border border-border bg-primary p-8 text-primary-foreground md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/70">{brand}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Ready for the next step?</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">{hero.description}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => go(hero.primaryCta)}
                    className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortfolioOpen(true)}
                    className="rounded-md border border-border bg-background/10 px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-background/20"
                  >
                    View Portfolio
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">(c) {new Date().getFullYear()} {brand}. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button key={item} type="button" onClick={() => go(item)} className="text-sm text-muted-foreground hover:text-foreground">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
