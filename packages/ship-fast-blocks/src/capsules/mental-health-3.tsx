import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { string, table } from "@ship-fast/lakebed/server"
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

export const MentalHealthKimiPage3 = defineCapsule({
  name: "MentalHealthKimiPage3",
  description:
    "Mental Health third style sibling to MentalHealthKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      bookings: table({
        service: string(),
        name: string(),
        email: string(),
        note: string(),
        status: string(),
      }),
      subscribers: table({
        email: string(),
      }),
    },
    queries: {
      bookings: ({ db }) => db.bookings.orderBy("createdAt").all(),
      subscriberCount: ({ db }) => db.subscribers.all().length,
    },
    mutations: {
      requestBooking: ({ db }, service: string, name: string, email: string, note: string) => {
        db.bookings.insert({ service, name, email, note, status: "pending" })
        return db.bookings.all()
      },
      cancelBooking: ({ db }, id: string) => {
        db.bookings.delete(id)
        return db.bookings.all()
      },
      subscribe: ({ db }, email: string) => {
        const existing = db.subscribers.where("email", email).all()[0]
        if (!existing) db.subscribers.insert({ email })
        return db.subscribers.all().length
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [bookingOpen, setBookingOpen] = useState(false)
    const [bookingService, setBookingService] = useState("")
    const [bookingName, setBookingName] = useState("")
    const [bookingEmail, setBookingEmail] = useState("")
    const [bookingNote, setBookingNote] = useState("")
    const [newsletterEmail, setNewsletterEmail] = useState("")

    const brand = props.brand ?? "Horizon Mental Wellness"
    const nav = props.nav?.length ? props.nav : ["Services", "How It Works", "Our Space", "Pricing", "Stories", "FAQ"]
    const hero = {
      eyebrow: "Mental Health / Variant 3",
      title: "Find Your Balance. Reclaim Your Life.",
      description: "Horizon Mental Wellness | Therapy & Counseling in Portland Horizon Wellness Services How It Works Our Space Pricing Stories FAQ Book a Session Services How It Works Our Space Pr...",
      primaryCta: "Horizon Wellness",
      secondaryCta: "Services",
      imageAlt: "Sunlit modern therapy office interior with green plants and comfortable seating",
      ...props.hero,
    }
    const metrics = props.metrics?.length ? props.metrics : [
      { value: "24/7", label: "Responsive service" },
      { value: "98%", label: "Positive outcomes" },
      { value: "4.9", label: "Average rating" },
      { value: "12+", label: "Core capabilities" },
    ]
    const sections = props.sections?.length ? props.sections : [
      {
        eyebrow: "Overview",
        title: "Personalized Care for Every Stage of Life",
        body: "Horizon Mental Wellness | Therapy & Counseling in Portland Horizon Wellness Services How It Works Our Space Pricing Stories FAQ Book a Session Services How It Works Our Space Pr...",
        items: ["No Hidden Fees, No Surprises", "Real People, Real Progress", "What Clients Ask Us"],
      },
      {
        eyebrow: "Experience",
        title: "Getting Started Is Simple",
        body: "Mental Health page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
        items: ["Begin Your Journey Today", "Individual Therapy", "Couples Counseling"],
      },
      {
        eyebrow: "Proof",
        title: "A Sanctuary Designed for Healing",
        body: "Mental Health page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
        items: ["EMDR Therapy", "CBT Programs", "Group Therapy"],
      },
      {
        eyebrow: "Next steps",
        title: "No Hidden Fees, No Surprises",
        body: "Mental Health page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
        items: ["Mindfulness Coaching", "Free Consultation", "Custom Plan"],
      },
    ]
    const gallery = props.gallery?.length ? props.gallery : [
      {
        title: "Getting Started Is Simple",
        alt: "Sunlit modern therapy office interior with green plants and comfortable seating",
        caption: "Mental Health generated page detail",
      },
      {
        title: "A Sanctuary Designed for Healing",
        alt: "Bright modern therapy waiting area with plush sofas and large windows overlooking Portland",
        caption: "Mental Health generated page detail",
      },
      {
        title: "No Hidden Fees, No Surprises",
        alt: "Cozy private therapy room with soft lighting and neutral earth tones",
        caption: "Mental Health generated page detail",
      },
    ]

    // Lakebed
    const storedBookings = lakebed.useQuery("bookings")
    const subscriberCount = lakebed.useQuery("subscriberCount")
    const requestBooking = lakebed.useMutation("requestBooking")
    const cancelBooking = lakebed.useMutation("cancelBooking")
    const subscribe = lakebed.useMutation("subscribe")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName = auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase())
        .join("") || "ME"
    const authLabel = auth.isLoading ? "Checking..." : isSignedIn ? authDisplayName : "Sign in"

    const safeBookings = storedBookings ?? []
    const pendingCount = safeBookings.filter((b) => b.status === "pending").length

    const handleBookingSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!bookingService || !bookingName || !bookingEmail) return
      void requestBooking(bookingService, bookingName, bookingEmail, bookingNote)
      setBookingName("")
      setBookingEmail("")
      setBookingNote("")
    }

    const ChevronDown = () => (
      <svg
        className="size-4 text-muted-foreground"
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
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-9 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
                    >
                      <Avatar size="sm" aria-hidden="true">
                        {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">{authDisplayName}</span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={10} className="w-64 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl">
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">{authInitials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">{authDisplayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{authEmail ?? "Signed in to this session"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go("Account")}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        Account <ArrowRight />
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={() => lakebed.signOut()}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                      >
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={() => { if (!auth.isLoading) void lakebed.signInWithGoogle() }}
                  disabled={auth.isLoading}
                  className="hidden h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">G</span>
                  <span>{authLabel}</span>
                </button>
              )}

              {/* Booking drawer trigger */}
              <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Book a session"
                    className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                    {pendingCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {pendingCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Book a Session</SheetTitle>
                    <SheetDescription>
                      {pendingCount > 0
                        ? `${pendingCount} pending booking${pendingCount === 1 ? "" : "s"} for this session.`
                        : "Request a therapy appointment."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Booking form */}
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Service</label>
                        <select
                          value={bookingService}
                          onChange={(e) => setBookingService(e.target.value)}
                          required
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select a service…</option>
                          {sections.flatMap((s) => s.items ?? []).map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Your name</label>
                        <input
                          type="text"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          required
                          placeholder="Full name"
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                        <input
                          type="email"
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          required
                          placeholder="you@example.com"
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Note (optional)</label>
                        <textarea
                          value={bookingNote}
                          onChange={(e) => setBookingNote(e.target.value)}
                          rows={3}
                          placeholder="Anything you'd like us to know…"
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      </div>
                      <Button type="submit" className="w-full rounded-full">Request Appointment</Button>
                    </form>

                    {/* Existing bookings */}
                    {safeBookings.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Requests</p>
                        {safeBookings.map((b) => (
                          <div key={b.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{b.service}</p>
                              <p className="truncate text-xs text-muted-foreground">{b.name} · {b.email}</p>
                              {b.note ? <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.note}</p> : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => void cancelBooking(b.id)}
                              className="shrink-0 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button type="button" variant="secondary" className="w-full rounded-full">Close</Button>
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
                    onClick={() => setBookingOpen(true)}
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
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-border bg-card p-5">
                <p className="text-3xl font-semibold text-card-foreground">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.label}</p>
              </div>
            ))}
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
                      {section.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => { setBookingService(item); setBookingOpen(true) }}
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
              {gallery.map((item) => (
                <article key={item.title} className="overflow-hidden rounded-lg border border-border bg-card">
                  <Image alt={item.alt} w={900} h={700} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                    {item.caption ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.caption}</p> : null}
                  </div>
                </article>
              ))}
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
                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {hero.primaryCta}
                </button>
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="border-t border-border bg-muted/40">
            <div className="mx-auto max-w-7xl px-5 py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Stay Connected</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  Get wellness tips, mental health resources, and updates from {brand}.
                  {subscriberCount ? ` Join ${subscriberCount} subscribers.` : null}
                </p>
                <form
                  className="flex w-full max-w-sm gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (newsletterEmail) { void subscribe(newsletterEmail); setNewsletterEmail("") }
                  }}
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    aria-label="Newsletter email"
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button type="submit" size="sm" className="rounded-md">Subscribe</Button>
                </form>
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
