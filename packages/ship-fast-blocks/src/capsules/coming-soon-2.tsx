import { useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { Button } from "#/components/ui/button.tsx"
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

export const ComingSoonKimiPage2 = defineCapsule({
  name: "ComingSoonKimiPage2",
  description:
    "Coming Soon second style sibling to ComingSoonKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      waitlist: table({
        email: string(),
        name: string(),
        source: string(),
        notes: string(),
        position: number(),
      }),
    },
    queries: {
      waitlist: ({ db }) => db.waitlist.orderBy("createdAt").all(),
    },
    mutations: {
      addLead: ({ db }, email: string, source: string, name: string, notes: string) => {
        const normalizedEmail = email.trim()
        if (!normalizedEmail) return db.waitlist.orderBy("createdAt").all()

        const normalizedName = name.trim()
        const normalizedSource = source.trim() || "Coming Soon page"
        const nextPosition =
          Math.max(0, ...db.waitlist.all().map((entry) => entry.position)) + 1

        db.waitlist.insert({
          email: normalizedEmail,
          name: normalizedName || "Guest",
          source: normalizedSource,
          notes: notes.trim(),
          position: nextPosition,
        })

        return db.waitlist.orderBy("createdAt").all()
      },
      removeLead: ({ db }, id: string) => {
        db.waitlist.delete(id)
        return db.waitlist.orderBy("createdAt").all()
      },
      clearWaitlist: ({ db }) => {
        for (const entry of db.waitlist.all()) {
          db.waitlist.delete(entry.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [waitlistOpen, setWaitlistOpen] = useState(false)
    const [waitlistSource, setWaitlistSource] = useState("")
    const [leadName, setLeadName] = useState("")
    const [leadEmail, setLeadEmail] = useState("")
    const [leadNotes, setLeadNotes] = useState("")
    const brand = props.brand ?? "Pulse Coming Soon"
    const nav = props.nav?.length
      ? props.nav
      : ["Pulse", "Features", "Pricing", "FAQ", "Join waitlist"]
    const hero = {
      eyebrow: "Coming Soon / Variant 2",
      title: "One workspace. Infinite momentum.",
      description:
        "Pulse Coming Soon Pulse Features Pricing FAQ Join waitlist Launching June 15, 2026 One workspace. Infinite momentum. Pulse unifies your projects, docs, and conversations into a...",
      primaryCta: "Join waitlist",
      secondaryCta: "Pulse",
      imageAlt: "Close-up of a laptop screen showing code in a dark IDE theme",
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
            title: "Everything you need",
            body: "Pulse Coming Soon Pulse Features Pricing FAQ Join waitlist Launching June 15, 2026 One workspace. Infinite momentum. Pulse unifies your projects, docs, and conversations into a...",
            items: [
              "Early-bird pricing",
              "Loved by early adopters",
              "Frequently asked questions",
            ],
          },
          {
            eyebrow: "Experience",
            title: "How early access works",
            body: "Coming Soon page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Ready to jump in?", "Unified Inbox", "Real-time Sync"],
          },
          {
            eyebrow: "Proof",
            title: "A sneak peek inside Pulse",
            body: "Coming Soon page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["AI Assistant", "Enterprise Security", "Join the waitlist"],
          },
          {
            eyebrow: "Next steps",
            title: "Early-bird pricing",
            body: "Coming Soon page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Get early access", "Transform your workflow", "Enterprise"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "How early access works",
            alt: "Close-up of a laptop screen showing code in a dark IDE theme",
            caption: "Coming Soon generated page detail",
          },
          {
            title: "A sneak peek inside Pulse",
            alt: "Diverse product team collaborating around a monitor in a modern office",
            caption: "Coming Soon generated page detail",
          },
          {
            title: "Early-bird pricing",
            alt: "Dashboard interface with colorful analytics charts on a screen",
            caption: "Coming Soon generated page detail",
          },
        ]

    const waitlist = lakebed.useQuery("waitlist")
    const addLead = lakebed.useMutation("addLead")
    const removeLead = lakebed.useMutation("removeLead")
    const clearWaitlist = lakebed.useMutation("clearWaitlist")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const entries = waitlist ?? []
    const waitlistCount = entries.length
    const openWaitlist = (source: string) => {
      setWaitlistSource(source)
      setLeadName(isSignedIn ? authDisplayName : "")
      setLeadEmail(isSignedIn ? authEmail || "" : "")
      setLeadNotes("")
      setWaitlistOpen(true)
    }
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

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
            <Sheet open={waitlistOpen} onOpenChange={setWaitlistOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  onClick={() => openWaitlist(hero.primaryCta)}
                  className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  aria-label="Open waitlist"
                >
                  {hero.primaryCta}
                  {waitlistCount > 0 ? (
                    <span className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-background px-1 text-xs font-bold leading-none text-foreground ring-1 ring-primary">
                      {waitlistCount > 99 ? "99+" : waitlistCount}
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
                    Early-access waitlist
                  </SheetTitle>
                  <SheetDescription>
                    {waitlistSource
                      ? `Save your spot for ${waitlistSource.toLowerCase()}.`
                      : "Save your spot for launch updates and early access."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      void addLead(leadEmail, waitlistSource, leadName, leadNotes)
                      setLeadNotes("")
                    }}
                    className="space-y-3"
                  >
                    <label
                      htmlFor="waitlist-name"
                      className="text-sm text-muted-foreground"
                    >
                      Name
                    </label>
                    <input
                      id="waitlist-name"
                      value={leadName}
                      onChange={(event) => setLeadName(event.target.value)}
                      placeholder="Your name (optional)"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <label
                      htmlFor="waitlist-email"
                      className="text-sm text-muted-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="waitlist-email"
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(event) => setLeadEmail(event.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <label
                      htmlFor="waitlist-notes"
                      className="text-sm text-muted-foreground"
                    >
                      Notes
                    </label>
                    <textarea
                      id="waitlist-notes"
                      value={leadNotes}
                      onChange={(event) => setLeadNotes(event.target.value)}
                      placeholder="Any focus area? (optional)"
                      className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button type="submit" className="w-full rounded-md">
                      Join waitlist
                    </Button>
                  </form>

                  <div className="mt-8">
                    <p className="mb-3 text-sm font-semibold text-foreground">
                      Recent entries
                    </p>
                    {entries.length ? (
                      <div className="space-y-3">
                        {entries.map((entry) => (
                          <article
                            key={entry.id}
                            className="rounded-lg border border-border bg-card p-4 text-sm"
                          >
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <p className="font-semibold text-foreground">
                                {entry.name || entry.email}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  void removeLead(entry.id)
                                }}
                                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="mb-1 text-xs text-muted-foreground">
                              {entry.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.source} · #{entry.position}
                            </p>
                            {entry.notes ? (
                              <p className="mt-2 text-xs text-muted-foreground">
                                {entry.notes}
                              </p>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                        <p className="text-sm font-semibold text-foreground">
                          No waitlist entries yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Add your first entry from this sheet to populate it.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <SheetFooter className="border-t border-border p-6">
                  <div className="mb-3 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total entries</span>
                      <span>{waitlistCount}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => void clearWaitlist()}
                      disabled={entries.length === 0}
                    >
                      Clear all entries
                    </Button>
                    {isSignedIn ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                        onClick={handleSignOut}
                      >
                        Sign out
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                        onClick={handleSignIn}
                        disabled={auth.isLoading}
                      >
                        {authLabel}
                      </Button>
                    )}
                  </div>
                  <SheetClose asChild>
                    <Button type="button" className="w-full rounded-full">
                      Continue
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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
                    onClick={() => openWaitlist("Hero section")}
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
                          onClick={() => go(item)}
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
                  onClick={() => openWaitlist("Bottom CTA")}
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
