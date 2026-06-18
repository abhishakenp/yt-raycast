import { useState } from "react"
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

export const MembershipClubKimiPage2 = defineCapsule({
  name: "MembershipClubKimiPage2",
  description:
    "Membership Club second style sibling to MembershipClubKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
    metrics: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
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
        label: string(),
        source: string(),
        count: number(),
      }),
    },
    queries: {
      watchlist: ({ db }) => db.watchlist.orderBy("createdAt").all(),
    },
    mutations: {
      addWatchlist: ({ db }, label: string, source: string) => {
        const existing = db.watchlist.where("label", label).all()[0]

        if (existing) {
          db.watchlist.update(existing.id, {
            count: existing.count + 1,
            source,
          })

          return db.watchlist.all()
        }

        db.watchlist.insert({
          label,
          source,
          count: 1,
        })

        return db.watchlist.all()
      },
      removeWatchlist: ({ db }, watchlistId: string) => {
        db.watchlist.delete(watchlistId)

        return db.watchlist.all()
      },
      clearWatchlist: ({ db }) => {
        for (const watchlistItem of db.watchlist.all()) {
          db.watchlist.delete(watchlistItem.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const [shortlistOpen, setShortlistOpen] = useState(false)
    const go = useNavigate()
    const brand = props.brand ?? "VOLT Collective Join the Creative Membership Club"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Benefits",
          "Tiers",
          "Stories",
          "FAQ",
          "Join now",
          "VOLT Collective",
        ]
    const hero = {
      eyebrow: "Membership Club / Variant 2",
      title: "Where creators build , connect , and thrive .",
      description:
        "VOLT Collective Join the Creative Membership Club VOLT Collective Benefits Tiers Stories FAQ Join now Benefits Tiers Stories FAQ Join now Where creators build , connect , and th...",
      primaryCta: "VOLT Collective",
      secondaryCta: "Benefits",
      imageAlt:
        "Modern coworking loft with warm lighting and long wooden tables",
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
            title: "Everything you need to do your best work",
            body: "VOLT Collective Join the Creative Membership Club VOLT Collective Benefits Tiers Stories FAQ Join now Benefits Tiers Stories FAQ Join now Where creators build , connect , and th...",
            items: [
              "Membership tiers",
              "Loved by creators",
              "Questions? Answered.",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Three steps to plug in",
            body: "Membership Club page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Ready to plug in?", "Flexible Workspace", "Curated Events"],
          },
          {
            eyebrow: "Proof",
            title: "Inside the community",
            body: "Membership Club page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Member Perks", "1:1 Mentorship", "Community Feed"],
          },
          {
            eyebrow: "Next steps",
            title: "Membership tiers",
            body: "Membership Club page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Global Access", "Apply online", "Get matched"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Three steps to plug in",
            alt: "Modern coworking loft with warm lighting and long wooden tables",
            caption: "Membership Club generated page detail",
          },
          {
            title: "Inside the community",
            alt: "Figma logo",
            caption: "Membership Club generated page detail",
          },
          {
            title: "Membership tiers",
            alt: "Notion logo",
            caption: "Membership Club generated page detail",
          },
        ]

    const storedWatchlist = lakebed.useQuery("watchlist")
    const addWatchlist = lakebed.useMutation("addWatchlist")
    const removeWatchlist = lakebed.useMutation("removeWatchlist")
    const clearWatchlist = lakebed.useMutation("clearWatchlist")
    const watchlist = storedWatchlist ?? []
    const shortlistCount = watchlist.reduce(
      (total, item) => total + item.count,
      0,
    )
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authDisplayName =
      auth.displayName || auth.user?.displayName || auth.email || "Member"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const trackInterest = (label: string, source: string) => {
      void addWatchlist(label, source)
    }

    const handleSectionItem = (item: string, sectionLabel: string) => {
      trackInterest(item, sectionLabel)
      go(item)
    }

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button
              type="button"
              onClick={() => go("Home")}
              className="text-left text-lg font-semibold tracking-tight"
            >
              {brand}
            </button>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => {
                const isJoinNow = item.toLowerCase() === "join now"

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      trackInterest(item, "Navigation")
                      if (isJoinNow) {
                        setShortlistOpen(true)
                      }
                      go(item)
                    }}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item}
                  </button>
                  )
              })}
            </nav>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  trackInterest(hero.primaryCta, "Header CTA")
                  go(hero.primaryCta)
                }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
              <Sheet open={shortlistOpen} onOpenChange={setShortlistOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Shortlist
                    {shortlistCount > 0 ? (
                      <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                        {shortlistCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">
                      Membership shortlist
                    </SheetTitle>
                    <SheetDescription>
                      Save membership interests and launch a fast follow-up from the same
                      surface.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {watchlist.length > 0 ? (
                      <div className="space-y-4">
                        {watchlist.map((item) => (
                          <article
                            key={item.id}
                            className="rounded-lg border border-border bg-card p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {item.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.source}
                                </p>
                              </div>
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                {item.count}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                void removeWatchlist(item.id)
                              }}
                              className="mt-3 inline-flex rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              Remove
                            </button>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                        No saved items yet. Add anything from the page to track it.
                      </p>
                    )}
                    <div className="mt-6 rounded-lg border border-border bg-muted p-4 text-sm">
                      <p className="font-semibold text-foreground">
                        {isSignedIn ? authDisplayName : "Guest"}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Sign in for persistent memberships and faster follow-up.
                      </p>
                    </div>
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Total items</span>
                        <span className="font-semibold">{shortlistCount}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setShortlistOpen(false)
                          go("Join now")
                        }}
                        className="rounded-full"
                      >
                        Join now
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void clearWatchlist()}
                        disabled={!shortlistCount}
                        className="rounded-full"
                      >
                        Clear shortlist
                      </Button>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {isSignedIn ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleSignOut}
                          className="rounded-full"
                        >
                          Sign out
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleSignIn}
                          disabled={auth.isLoading}
                          className="rounded-full"
                        >
                          {authLabel}
                        </Button>
                      )}
                    </div>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                      >
                        Close
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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
                    onClick={() => {
                      trackInterest(hero.primaryCta, "Hero primary")
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      trackInterest(hero.secondaryCta, "Hero secondary")
                      go(hero.secondaryCta)
                    }}
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
                          onClick={() =>
                            handleSectionItem(item, section.eyebrow)
                          }
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
                onClick={() => {
                  trackInterest(hero.secondaryCta, "Gallery CTA")
                  go(hero.secondaryCta)
                }}
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
                    trackInterest(hero.primaryCta, "Bottom CTA")
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
                  onClick={() => {
                    trackInterest(item, "Footer")
                    go(item)
                  }}
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
