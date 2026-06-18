import { useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
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

export const NewsletterKimiPage3 = defineCapsule({
  name: "NewsletterKimiPage3",
  description:
    "Newsletter third style sibling to NewsletterKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      subscribers: table({
        email: string(),
        source: string(),
        plan: string(),
      }),
      savedHighlights: table({
        title: string(),
        category: string(),
        details: string(),
        source: string(),
        order: number(),
      }),
    },
    queries: {
      subscribers: ({ db }) => db.subscribers.orderBy("createdAt").all(),
      savedHighlights: ({ db }) => db.savedHighlights.orderBy("createdAt").all(),
    },
    mutations: {
      subscribe: ({ db }, email: string, source: string, plan: string) => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) return db.subscribers.all()

        const existing = db.subscribers.where("email", normalizedEmail).all()[0]
        if (existing) return db.subscribers.all()

        db.subscribers.insert({
          email: normalizedEmail,
          source: source.trim(),
          plan: plan.trim(),
        })

        return db.subscribers.all()
      },
      removeSubscriber: ({ db }, id: string) => {
        db.subscribers.delete(id)
        return db.subscribers.all()
      },
      saveHighlight: (
        { db },
        title: string,
        category: string,
        details: string,
        source: string,
      ) => {
        const trimmedTitle = title.trim()
        if (!trimmedTitle) return db.savedHighlights.all()

        const existing = db.savedHighlights
          .where("title", trimmedTitle)
          .all()[0]
        if (existing) return db.savedHighlights.all()

        db.savedHighlights.insert({
          title: trimmedTitle,
          category: category.trim(),
          details: details.trim(),
          source: source.trim(),
          order: db.savedHighlights.all().length + 1,
        })

        return db.savedHighlights.all()
      },
      removeSavedHighlight: ({ db }, id: string) => {
        db.savedHighlights.delete(id)
        return db.savedHighlights.all()
      },
      clearSavedHighlights: ({ db }) => {
        for (const item of db.savedHighlights.all()) {
          db.savedHighlights.delete(item.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [subscriberEmail, setSubscriberEmail] = useState("")
    const storedSubscribers = lakebed.useQuery("subscribers") ?? []
    const savedHighlights = lakebed.useQuery("savedHighlights") ?? []
    const subscribe = lakebed.useMutation("subscribe")
    const removeSubscriber = lakebed.useMutation("removeSubscriber")
    const saveHighlight = lakebed.useMutation("saveHighlight")
    const removeSavedHighlight = lakebed.useMutation("removeSavedHighlight")
    const clearSavedHighlights = lakebed.useMutation("clearSavedHighlights")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "ME"
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

    const brand =
      props.brand ??
      "The Signal Weekly Briefing on Technology, Business & Culture"
    const nav = props.nav?.length
      ? props.nav
      : [
          "The Signal",
          "What You Get",
          "Recent Issues",
          "Readers",
          "FAQ",
          "Subscribe Free",
        ]
    const hero = {
      eyebrow: "Newsletter / Variant 3",
      title: "Stay ahead of the curve",
      description:
        "The Signal Weekly Briefing on Technology, Business & Culture The Signal What You Get Recent Issues Readers FAQ Subscribe Free Join 34,000+ readers every Tuesday Stay ahead of th...",
      primaryCta: "Subscribe Free",
      secondaryCta: "The Signal",
      imageAlt: "Stripe company logo in slate gray on dark background",
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            "value": "24/7",
            "label": "Responsive service",
          },
          {
            "value": "98%",
            "label": "Positive outcomes",
          },
          {
            "value": "4.9",
            "label": "Average rating",
          },
          {
            "value": "12+",
            "label": "Core capabilities",
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            "eyebrow": "Overview",
            "title": "What you get every week",
            "body": "The Signal Weekly Briefing on Technology, Business & Culture The Signal What You Get Recent Issues Readers FAQ Subscribe Free Join 34,000+ readers every Tuesday Stay ahead of th...",
            "items": [
              "Choose your subscription",
              "Loved by readers",
              "Frequently asked questions",
            ],
          },
          {
            "eyebrow": "Experience",
            "title":
              "Why 34,000+ professionals start their week with us",
            "body": "Newsletter page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Join 34,000+ readers today",
              "Deep Dives",
              "Curated Links",
            ],
          },
          {
            "eyebrow": "Proof",
            "title": "Recent issues",
            "body": "Newsletter page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Expert Interviews",
              "Save 10 hours a week",
              "Make better decisions",
            ],
          },
          {
            "eyebrow": "Next steps",
            "title": "Choose your subscription",
            "body": "Newsletter page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Join the conversation",
              "The State of AI Infrastructure in 2025",
              "Fintech's Quiet Consolidation",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            "title": "Why 34,000+ professionals start their week with us",
            "alt": "Stripe company logo in slate gray on dark background",
            "caption": "Newsletter generated page detail",
          },
          {
            "title": "Recent issues",
            "alt": "Google company logo in slate gray on dark background",
            "caption": "Newsletter generated page detail",
          },
          {
            "title": "Choose your subscription",
            "alt": "Andreessen Horowitz venture capital firm logo in slate gray on dark background",
            "caption": "Newsletter generated page detail",
          },
        ]

    return (
      <div
        className={cn(
          "min-h-screen bg-background text-foreground",
          props.className,
        )}
      >
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
              <button
                type="button"
                onClick={() => go(hero.primaryCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open newsletter dashboard"
                    className="relative rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>Reads</span>
                      <span aria-hidden="true">•</span>
                      <span>{storedSubscribers.length}</span>
                    </span>
                    {storedSubscribers.length ? (
                      <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-primary px-0 text-xs font-bold text-primary-foreground">
                        {storedSubscribers.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle>Newsletter Dashboard</SheetTitle>
                    <SheetDescription>
                      {storedSubscribers.length > 0
                        ? `Keep ${storedSubscribers.length} subscriber${
                            storedSubscribers.length === 1 ? "" : "s"
                          } connected to this session.`
                        : "Collect subscribers and bookmark highlights for this newsletter session."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    <section className="rounded-lg border border-border bg-card p-4">
                      <p className="text-sm font-semibold text-card-foreground">
                        Add subscriber
                      </p>
                      <form
                        className="mt-3"
                        onSubmit={(e) => {
                          e.preventDefault()
                          void subscribe(subscriberEmail, "dashboard", "Default")
                          setSubscriberEmail("")
                        }}
                      >
                        <div className="flex flex-wrap gap-2">
                          <input
                            type="email"
                            required
                            value={subscriberEmail}
                            onChange={(e) =>
                              setSubscriberEmail(e.target.value)
                            }
                            placeholder="you@domain.com"
                            aria-label="Newsletter subscriber email address"
                            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            Subscribe
                          </button>
                        </div>
                      </form>
                    </section>

                    <section className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          Saved highlights
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (savedHighlights.length) {
                              void clearSavedHighlights()
                            }
                          }}
                          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                          disabled={!savedHighlights.length}
                        >
                          Clear
                        </button>
                      </div>
                      {savedHighlights.length ? (
                        <div className="space-y-3">
                          {savedHighlights.map((item) => (
                            <article
                              key={item.id}
                              className="rounded-lg border border-border bg-muted/40 p-4"
                            >
                              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {item.category || "Highlight"}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-foreground">
                                {item.title}
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {item.details}
                              </p>
                              <div className="mt-3 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    go(item.title)
                                    setDrawerOpen(false)
                                  }}
                                  className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                                >
                                  Open
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeSavedHighlight(item.id)
                                  }
                                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  Remove
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                          No highlights saved yet.
                        </div>
                      )}
                    </section>

                    <section className="mt-6">
                      <p className="mb-3 text-sm font-semibold text-foreground">
                        Subscribers
                      </p>
                      {storedSubscribers.length ? (
                        <div className="space-y-3">
                          {storedSubscribers.map((subscriber) => (
                            <article
                              key={subscriber.id}
                              className="rounded-lg border border-border bg-muted/40 p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <p className="text-sm text-foreground">
                                  {subscriber.email}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeSubscriber(subscriber.id)
                                  }
                                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  Remove
                                </button>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {subscriber.plan || "Default"} · {subscriber.source}
                              </p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                          No subscribers captured yet.
                        </div>
                      )}
                    </section>
                  </div>
                  <SheetFooter className="border-t border-border p-6 space-y-3">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Subscribers</span>
                        <span>{storedSubscribers.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Highlights</span>
                        <span>{savedHighlights.length}</span>
                      </div>
                    </div>
                    {isSignedIn ? (
                      <div className="space-y-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              aria-label="Open account menu"
                              className="inline-flex h-10 w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground"
                            >
                              <Avatar size="sm" className="ring-2 ring-background">
                                {authPicture ? (
                                  <AvatarImage src={authPicture} alt={authDisplayName} />
                                ) : null}
                                <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                                  {authInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="max-w-32 truncate">{authLabel}</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            sideOffset={10}
                            className="w-72 border-border bg-background p-0 shadow-xl"
                          >
                            <div className="bg-muted/40 px-4 py-3">
                              <p className="truncate text-sm font-bold text-foreground">
                                {authDisplayName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {authEmail ?? "Signed in to this session"}
                              </p>
                            </div>
                            <div className="border-t border-border p-2">
                              <button
                                type="button"
                                onClick={handleSignOut}
                                className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                              >
                                Sign out
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={auth.isLoading}
                        className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60"
                      >
                        {authLabel}
                      </button>
                    )}
                    <SheetClose asChild>
                      <button
                        type="button"
                        className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
                      >
                        Continue
                      </button>
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
                  <p className="text-sm font-medium text-primary">{section.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            void saveHighlight(
                              item,
                              section.eyebrow,
                              section.body,
                              section.title,
                            )
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
                  onClick={() => go(hero.primaryCta)}
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
