import { type FormEvent, useState } from "react"
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

export const ComingSoonKimiPage3 = defineCapsule({
  name: "ComingSoonKimiPage3",
  description:
    "Coming Soon third style sibling to ComingSoonKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
  lakebed: {
    schema: {
      waitlistEntries: table({
        email: string(),
        name: string(),
        source: string(),
        count: number(),
      }),
    },
    queries: {
      waitlistEntries: ({ db }) => db.waitlistEntries.orderBy("createdAt").all(),
    },
    mutations: {
      addWaitlistEntry: ({ db }, email: string, name: string, source: string) => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) return db.waitlistEntries.all()

        const normalizedName = name.trim()
        const normalizedSource = source.trim() || "Coming Soon page"

        const existingEntry = db.waitlistEntries
          .where("email", normalizedEmail)
          .all()[0]

        if (existingEntry) {
          const sources = new Set(
            existingEntry.source
              .split("|")
              .map((item) => item.trim())
              .filter(Boolean),
          )
          sources.add(normalizedSource)

          db.waitlistEntries.update(existingEntry.id, {
            name: normalizedName || existingEntry.name,
            source: [...sources].join(" | "),
            count: existingEntry.count + 1,
          })

          return db.waitlistEntries.all()
        }

        db.waitlistEntries.insert({
          email: normalizedEmail,
          name: normalizedName || "Subscriber",
          source: normalizedSource,
          count: 1,
        })

        return db.waitlistEntries.all()
      },
      removeWaitlistEntry: ({ db }, id: string) => {
        const entry = db.waitlistEntries.get(id)
        if (entry) {
          db.waitlistEntries.delete(entry.id)
        }

        return db.waitlistEntries.all()
      },
      clearWaitlistEntries: ({ db }) => {
        for (const entry of db.waitlistEntries.all()) {
          db.waitlistEntries.delete(entry.id)
        }

        return []
      },
    },
  },
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
      .array(z.object({ value: z.string(), label: z.string() }))
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
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [waitlistOpen, setWaitlistOpen] = useState(false)

    const brand =
      props.brand ??
      "Nexus The Intelligence Layer for Modern Teams. Coming January 2027."
    const nav = props.nav?.length
      ? props.nav
      : ["Nexus", "Features", "How It Works", "Preview", "Stories", "FAQ"]
    const hero = {
      eyebrow: "Coming Soon / Variant 3",
      title: "The Intelligence Layer for Modern Teams",
      description:
        "Nexus The Intelligence Layer for Modern Teams. Coming January 2027. Nexus Features How It Works Preview Stories FAQ Join Waitlist Launching January 15, 2027 The Intelligence Lay...",
      primaryCta: "Get Early Access",
      secondaryCta: "Join Waitlist",
      imageAlt:
        "professional headshot of a smiling product manager with dark hair",
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
            title: "Built for how modern teams actually work",
            body: "Nexus The Intelligence Layer for Modern Teams. Coming January 2027. Nexus Features How It Works Preview Stories FAQ Join Waitlist Launching January 15, 2027 The Intelligence Lay...",
            items: [
              "Pay for outcomes, not seats",
              "Loved by early teams",
              "Questions? We have answers.",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Early access in three steps",
            body: "Coming Soon page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready to stop context-switching?",
              "Contextual AI",
              "Predictive Blockers",
            ],
          },
          {
            eyebrow: "Proof",
            title: "A peek under the hood",
            body: "Coming Soon page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Self-Healing Workflows",
              "Enterprise Security",
              "Zero-Config Integrations",
            ],
          },
          {
            eyebrow: "Next steps",
            title: "Pay for outcomes, not seats",
            body: "Coming Soon page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Real-Time Analytics",
              "Join the Waitlist",
              "Get Your Invitation",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Early access in three steps",
            alt: "professional headshot of a smiling product manager with dark hair",
            caption: "Coming Soon generated page detail",
          },
          {
            title: "A peek under the hood",
            alt: "professional headshot of a bearded software engineer in a navy shirt",
            caption: "Coming Soon generated page detail",
          },
          {
            title: "Pay for outcomes, not seats",
            alt: "professional headshot of a creative director with blonde hair and glasses",
            caption: "Coming Soon generated page detail",
          },
        ]

    const storedWaitlistEntries = lakebed.useQuery("waitlistEntries")
    const addWaitlistEntry = lakebed.useMutation("addWaitlistEntry")
    const removeWaitlistEntry = lakebed.useMutation("removeWaitlistEntry")
    const clearWaitlistEntries = lakebed.useMutation("clearWaitlistEntries")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authDisplayName =
      auth.displayName || auth.user?.displayName || auth.email || auth.user?.email || "Account"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"

    const waitlistEntries = storedWaitlistEntries ?? []
    const waitlistCount = waitlistEntries.reduce(
      (total, entry) => total + entry.count,
      0,
    )
    const uniqueEmails = new Set(
      waitlistEntries.map((entry) => entry.email.toLowerCase()),
    ).size

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const handleWaitlistSubmit = (source: string, e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const email = String(formData.get("email") ?? "").trim()
      const name = String(formData.get("name") ?? "").trim()

      if (!email) return

      void addWaitlistEntry(email, name, source)
      e.currentTarget.reset()
    }

    const openWaitlist = () => {
      setWaitlistOpen(true)
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
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {hero.primaryCta}
                  {waitlistCount > 0 ? (
                    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[11px] text-primary-foreground/90">
                      {waitlistCount}
                    </span>
                  ) : null}
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full overflow-y-auto border-l border-border sm:max-w-md"
              >
                <SheetHeader>
                  <SheetTitle>Coming Soon waitlist</SheetTitle>
                  <SheetDescription>
                    Capture your email for launch updates and early access.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-5">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => void handleWaitlistSubmit(brand, e)}
                  >
                    <div className="space-y-1">
                      <label
                        htmlFor="waitlist-name"
                        className="text-sm font-medium text-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="waitlist-name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="waitlist-email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="waitlist-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {hero.secondaryCta}
                    </button>
                  </form>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <p className="text-sm font-medium">Recent waitlist entries</p>
                      <span className="text-xs text-muted-foreground">
                        {uniqueEmails} unique
                      </span>
                    </div>
                    {waitlistEntries.length ? (
                      <div className="space-y-3">
                        {waitlistEntries.map((entry) => (
                          <article
                            key={entry.id}
                            className="rounded-md border border-border bg-card p-3"
                          >
                            <div className="mb-1 flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-card-foreground">
                                {entry.name || "Subscriber"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {entry.count}x
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">{entry.email}</p>
                            <p className="mt-1 text-xs text-muted-foreground/80">
                              Source: {entry.source}
                            </p>
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() => void removeWaitlistEntry(entry.id)}
                                className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                              >
                                Remove
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No waitlist entries yet.</p>
                    )}
                  </div>
                </div>
                <SheetFooter className="mt-6 border-t border-border pt-4">
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Total submissions</span>
                      <span>{waitlistCount}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {isSignedIn ? (
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:text-foreground"
                        >
                          Sign out
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={auth.isLoading}
                          onClick={handleSignIn}
                          className="rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {authLabel}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void clearWaitlistEntries()}
                        disabled={waitlistEntries.length === 0}
                        className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Clear all
                      </button>
                      <SheetClose asChild>
                        <button
                          type="button"
                          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Close
                        </button>
                      </SheetClose>
                    </div>
                  </div>
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
                    onClick={openWaitlist}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={openWaitlist}
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
                <p className="text-sm font-medium text-primary">Generated visuals</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Content-led page moments
                </h2>
              </div>
              <button
                type="button"
                onClick={openWaitlist}
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
                  onClick={openWaitlist}
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
