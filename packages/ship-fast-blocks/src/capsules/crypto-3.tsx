import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
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
import { string, table } from "@ship-fast/lakebed/server"

export const CryptoKimiPage3 = defineCapsule({
  name: "CryptoKimiPage3",
  description:
    "Crypto third style sibling to CryptoKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
        title: string(),
        category: string(),
        addedBy: string(),
      }),
    },
    queries: {
      watchlist: ({ db }) => db.watchlist.orderBy("createdAt").all(),
    },
    mutations: {
      addWatchlistItem: ({ db }, title: string, category: string) => {
        const normalizedTitle = title.trim()
        if (!normalizedTitle) return db.watchlist.all()

        const normalizedCategory = category.trim() || "Protocol"

        const existing = db.watchlist
          .where("title", normalizedTitle)
          .all()[0]

        if (existing) return db.watchlist.all()

        db.watchlist.insert({
          title: normalizedTitle,
          category: normalizedCategory,
          addedBy: "User saved",
        })

        return db.watchlist.all()
      },
      removeWatchlistItem: ({ db }, id: string) => {
        db.watchlist.delete(id)
        return db.watchlist.all()
      },
      clearWatchlist: ({ db }) => {
        for (const item of db.watchlist.all()) {
          db.watchlist.delete(item.id)
        }
        return db.watchlist.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [watchlistOpen, setWatchlistOpen] = useState(false)

    const brand =
      props.brand ?? "Nexus Protocol Decentralized Liquidity Layer for Web3"
    const nav = props.nav?.length
      ? props.nav
      : ["Nexus", "Ecosystem", "Staking", "Roadmap", "Docs", "Sign In"]
    const hero = {
      eyebrow: "Crypto / Variant 3",
      title: "Unlock the Future of Decentralized Finance",
      description:
        "Nexus Protocol Decentralized Liquidity Layer for Web3 Nexus Ecosystem Staking Roadmap Docs Sign In Launch App Ecosystem Staking Roadmap Docs Launch App Mainnet v2.0 Live Unlock...",
      primaryCta: "Stake Now",
      secondaryCta: "Nexus",
      imageAlt: "community member headshot of a smiling professional",
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            value: "24/7",
            label: "Responsive service",
          },
          {
            value: "98%",
            label: "Positive outcomes",
          },
          {
            value: "4.9",
            label: "Average rating",
          },
          {
            value: "12+",
            label: "Core capabilities",
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            eyebrow: "Overview",
            title: "Built for scale. Designed for users.",
            body: "Nexus Protocol Decentralized Liquidity Layer for Web3 Nexus Ecosystem Staking Roadmap Docs Sign In Launch App Ecosystem Staking Roadmap Docs Launch App Mainnet v2.0 Live Unlock...",
            items: [
              "Staking Tiers",
              "Development Roadmap",
              "What builders are saying",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Get started in minutes",
            body: "Crypto page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Frequently asked questions",
              "Ready to enter the Nexus?",
              "Cross-Chain Swaps",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Platform at a glance",
            body: "Crypto page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Liquid Staking", "DAO Governance", "MEV Protection"],
          },
          {
            eyebrow: "Next steps",
            title: "Staking Tiers",
            body: "Crypto page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Connect Wallet", "Bridge Assets", "Stake & Earn"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Get started in minutes",
            alt: "community member headshot of a smiling professional",
            caption: "Crypto generated page detail",
          },
          {
            title: "Platform at a glance",
            alt: "community member headshot of a confident professional",
            caption: "Crypto generated page detail",
          },
          {
            title: "Staking Tiers",
            alt: "community member headshot of a friendly professional",
            caption: "Crypto generated page detail",
          },
        ]

    const storedWatchlist = lakebed.useQuery("watchlist")
    const addWatchlistItem = lakebed.useMutation("addWatchlistItem")
    const removeWatchlistItem = lakebed.useMutation("removeWatchlistItem")
    const clearWatchlist = lakebed.useMutation("clearWatchlist")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authDisplayName =
      auth.displayName || auth.user?.displayName || auth.email || auth.user?.email
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName || "Account"
        : "Sign in"
    const authInitials = (authDisplayName ?? "Account")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ME"
    const fallbackWatchlist = sections
      .flatMap((section, sectionIndex) =>
        (section.items ?? []).map((item, itemIndex) => ({
          id: `fallback-${sectionIndex}-${itemIndex}`,
          title: item,
          category: section.eyebrow,
          addedBy: section.title,
        })),
      )
      .slice(0, 6)
    const watchlistItems = storedWatchlist ?? fallbackWatchlist
    const watchlistCount = watchlistItems.length
    const storedWatchlistCount = storedWatchlist ? storedWatchlist.length : 0

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const addSectionItem = (itemLabel: string, source: string) => {
      void addWatchlistItem(itemLabel, source)
    }

    const handleClearWatchlist = () => {
      if (!storedWatchlistCount) return
      void clearWatchlist()
    }

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
            <div className="flex items-center gap-2">
              <Sheet open={watchlistOpen} onOpenChange={setWatchlistOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open protocol watchlist"
                    className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Watchlist
                    {watchlistCount > 0 ? (
                      <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                        {watchlistCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border px-6 pb-6 pt-6">
                    <SheetTitle>Protocol Watchlist</SheetTitle>
                    <SheetDescription>
                      Add key protocol moments and revisit them in one place.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {watchlistItems.length ? (
                      <div className="space-y-4">
                        {watchlistItems.map((item) => (
                          <article
                            key={item.id}
                            className="rounded-lg border border-border bg-card p-4"
                          >
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.category}
                              </p>
                            </div>
                            <p className="mb-3 text-xs text-muted-foreground">
                              {item.addedBy}
                            </p>
                            <div className="flex justify-between gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setWatchlistOpen(false)
                                  go(item.title)
                                }}
                              >
                                Open
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => void removeWatchlistItem(item.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                          No saved items yet
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Save section items from the page and revisit later.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="w-full space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Tracked items: {watchlistCount}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClearWatchlist}
                          disabled={!storedWatchlistCount}
                        >
                          Clear all
                        </Button>
                        <SheetClose asChild>
                          <Button type="button" variant="secondary">
                            Done
                          </Button>
                        </SheetClose>
                      </div>
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
                      className="hidden h-10 items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage src={authPicture} alt={authDisplayName || "Account"} />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-28 truncate sm:block">
                        {authDisplayName}
                      </span>
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
                            <AvatarImage src={authPicture} alt={authDisplayName || "Account"} />
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
                            {authEmail ?? "Signed in to this session"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go("Account")}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
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
                  className="hidden h-10 items-center rounded-full bg-foreground px-3 py-2 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  {authLabel}
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
                <Image
                  alt={hero.imageAlt}
                  w={1200}
                  h={900}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-card p-5"
              >
                <p className="text-3xl font-semibold text-card-foreground">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </section>

          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <p className="text-sm font-medium text-primary">
                    {section.eyebrow}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {section.body}
                  </p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            addSectionItem(item, section.eyebrow)
                            go(item)
                          }}
                          className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <span>{item}</span>
                          <span className="text-primary">{index + 1}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">
                  Generated visuals
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Content-led page moments
                </h2>
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
              {gallery.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  <Image
                    alt={item.alt}
                    w={900}
                    h={700}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    {item.caption ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.caption}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-16">
            <div className="rounded-lg border border-border bg-primary p-8 text-primary-foreground md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/70">
                    {brand}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Ready for the next step?
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">
                    {hero.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addSectionItem("Ready for the next step?", "CTA")
                    go(hero.primaryCta)
                  }}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {hero.primaryCta}
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              (c) {new Date().getFullYear()} {brand}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go(item)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
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
