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
} from "#/components/ui/sheet.tsx"
import { Button } from "#/components/ui/button.tsx"

export const CoworkingKimiPage2 = defineCapsule({
  name: "CoworkingKimiPage2",
  description:
    "Coworking second style sibling to CoworkingKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      tourRequests: table({
        fullName: string(),
        email: string(),
        phone: string(),
        tourType: string(),
        date: string(),
        attendees: number(),
        notes: string(),
      }),
    },
    queries: {
      tourRequests: ({ db }) => db.tourRequests.orderBy("createdAt").all(),
    },
    mutations: {
      submitTourRequest: (
        { db },
        fullName: string,
        email: string,
        phone: string,
        tourType: string,
        date: string,
        attendees: number,
        notes: string,
      ) => {
        const normalizedAttendees = Math.max(1, Math.floor(attendees))

        db.tourRequests.insert({
          fullName,
          email,
          phone,
          tourType,
          date,
          attendees: normalizedAttendees,
          notes,
        })

        return db.tourRequests.all()
      },
      removeTourRequest: ({ db }, id: string) => {
        db.tourRequests.delete(id)
        return db.tourRequests.all()
      },
      clearTourRequests: ({ db }) => {
        for (const request of db.tourRequests.all()) {
          db.tourRequests.delete(request.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [tourDrawerOpen, setTourDrawerOpen] = useState(false)
    const [tourForm, setTourForm] = useState({
      fullName: "",
      email: "",
      phone: "",
      tourType: "Coworking tour",
      date: "",
      attendees: "1",
      notes: "",
    })

    const brand = props.brand ?? "Forge &bull; Coworking Space in Downtown Austin"
    const nav = props.nav?.length
      ? props.nav
      : ["Forge", "Spaces", "Amenities", "Pricing", "Community", "FAQ"]
    const hero = {
      eyebrow: "Coworking / Variant 2",
      title: "Work where ideas ignite.",
      description:
        "Forge &bull; Coworking Space in Downtown Austin Forge Spaces Amenities Pricing Community FAQ Book a Tour Now Open in Downtown Austin Work where ideas ignite. Forge is a bold cow...",
      primaryCta: "Book a Tour",
      secondaryCta: "Forge",
      imageAlt:
        "Modern coworking space interior with high ceilings, industrial lighting, and rows of wooden desks",
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
            title: "Amenities",
            body: "Forge &bull; Coworking Space in Downtown Austin Forge Spaces Amenities Pricing Community FAQ Book a Tour Now Open in Downtown Austin Work where ideas ignite. Forge is a bold cow...",
            items: [
              "What Members Say",
              "Come see it for yourself.",
              "Gigabit Fiber WiFi",
            ],
          },
          {
            eyebrow: "Experience",
            title: "How It Works",
            body: "Coworking page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "24/7 Access",
              "Standing Desks",
              "Podcast & Zoom Studios",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Our Spaces",
            body: "Coworking page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Complimentary Coffee",
              "Downtown Location",
              "Mail & Package Handling",
            ],
          },
          {
            eyebrow: "Next steps",
            title: "What Members Say",
            body: "Coworking page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Monthly Member Events",
              "Printing & Design Station",
              "Book a Free Tour",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "How It Works",
            alt: "Modern coworking space interior with high ceilings, industrial lighting, and rows of wooden desks",
            caption: "Coworking generated page detail",
          },
          {
            title: "Our Spaces",
            alt: "Professional headshot of a smiling woman with curly hair",
            caption: "Coworking generated page detail",
          },
          {
            title: "Pricing",
            alt: "Professional headshot of a man with short beard smiling",
            caption: "Coworking generated page detail",
          },
        ]

    const tourRequests = lakebed.useQuery("tourRequests")
    const submitTourRequest = lakebed.useMutation("submitTourRequest")
    const removeTourRequest = lakebed.useMutation("removeTourRequest")
    const clearTourRequests = lakebed.useMutation("clearTourRequests")
    const auth = lakebed.useAuth()

    const safeTourRequests = tourRequests ?? []
    const requestCount = safeTourRequests.length
    const totalAttendees = safeTourRequests.reduce(
      (total, request) => total + request.attendees,
      0,
    )
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Guest"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"

    const openTourDrawer = (tourType: string) => {
      setTourForm((prev) => ({
        ...prev,
        tourType,
        fullName: prev.fullName || (isSignedIn ? authDisplayName : ""),
        email: prev.email || (isSignedIn ? authEmail || "" : ""),
      }))
      setTourDrawerOpen(true)
    }

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button type="button" onClick={() => go("Home") } className="text-left text-lg font-semibold tracking-tight">
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
            <button
              type="button"
              onClick={() => openTourDrawer(hero.primaryCta)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
            </button>
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
                    onClick={() => openTourDrawer(hero.primaryCta)}
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
                          onClick={() => openTourDrawer(item)}
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
                  onClick={() => openTourDrawer(hero.primaryCta)}
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

        <Sheet open={tourDrawerOpen} onOpenChange={setTourDrawerOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Tour requests</SheetTitle>
              <SheetDescription>
                {isSignedIn
                  ? `Hi ${authLabel}, your saved tour requests are persisted for this session.`
                  : "Submit your tour request and it will be saved for this session."}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <form
                onSubmit={(event) => {
                  event.preventDefault()

                  if (!tourForm.fullName.trim() || !tourForm.email.trim()) return

                  const attendees = Number.parseInt(tourForm.attendees, 10)
                  const normalizedAttendees = Number.isNaN(attendees)
                    ? 1
                    : Math.max(1, attendees)

                  void submitTourRequest(
                    tourForm.fullName.trim(),
                    tourForm.email.trim(),
                    tourForm.phone.trim(),
                    tourForm.tourType || hero.primaryCta,
                    tourForm.date.trim() || "Flexible",
                    normalizedAttendees,
                    tourForm.notes.trim(),
                  )

                  setTourForm((prev) => ({
                    ...prev,
                    fullName: isSignedIn ? prev.fullName : "",
                    email: isSignedIn ? prev.email : "",
                    phone: "",
                    date: "",
                    attendees: "1",
                    notes: "",
                  }))
                  setTourDrawerOpen(false)
                }}
                className="rounded-lg border border-border bg-muted/40 p-4"
              >
                <p className="mb-4 text-sm font-semibold text-foreground">
                  New request
                </p>
                <div className="grid gap-3">
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">Full name</span>
                    <input
                      value={tourForm.fullName}
                      onChange={(event) =>
                        setTourForm((prev) => ({
                          ...prev,
                          fullName: event.target.value,
                        }))
                      }
                      required
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <input
                      type="email"
                      value={tourForm.email}
                      onChange={(event) =>
                        setTourForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      required
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">Phone</span>
                    <input
                      type="tel"
                      value={tourForm.phone}
                      onChange={(event) =>
                        setTourForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">Preferred date</span>
                    <input
                      value={tourForm.date}
                      onChange={(event) =>
                        setTourForm((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }))
                      }
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">How many people</span>
                    <input
                      type="number"
                      min="1"
                      value={tourForm.attendees}
                      onChange={(event) =>
                        setTourForm((prev) => ({
                          ...prev,
                          attendees: event.target.value,
                        }))
                      }
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">Tour interest</span>
                    <input
                      value={tourForm.tourType}
                      onChange={(event) =>
                        setTourForm((prev) => ({
                          ...prev,
                          tourType: event.target.value,
                        }))
                      }
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">Notes</span>
                    <textarea
                      value={tourForm.notes}
                      onChange={(event) =>
                        setTourForm((prev) => ({
                          ...prev,
                          notes: event.target.value,
                        }))
                      }
                      rows={3}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </label>
                </div>
                <div className="mt-4">
                  <Button type="submit" className="w-full rounded-full">
                    Save request
                  </Button>
                </div>
              </form>

              <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Saved requests</p>
                  <span className="text-xs text-muted-foreground">
                    {requestCount} request{requestCount === 1 ? "" : "s"}
                  </span>
                </div>
                {safeTourRequests.length ? (
                  <div className="grid gap-3">
                    {safeTourRequests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-md border border-border bg-background p-3"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {request.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">{request.email}</p>
                          </div>
                          <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                            {request.attendees} member{request.attendees === 1 ? "" : "s"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {request.tourType} · {request.date}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {request.phone || "No phone"}
                          </span>
                          <button
                            type="button"
                            onClick={() => void removeTourRequest(request.id)}
                            className="rounded-md px-2 py-1 text-xs font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tour requests yet.</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm font-semibold text-foreground">Account</p>
                <p className="mt-1 text-sm text-muted-foreground">{authLabel}</p>
                {isSignedIn ? (
                  <Button
                    type="button"
                    onClick={handleSignOut}
                    variant="outline"
                    className="mt-3 w-full rounded-full"
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="mt-3 w-full rounded-full"
                  >
                    {auth.isLoading ? "Checking..." : "Sign in with Google"}
                  </Button>
                )}
              </div>
            </div>

            <SheetFooter className="border-t border-border p-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Total requests</span>
                  <span>{requestCount}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Total people</span>
                  <span>{totalAttendees}</span>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => void clearTourRequests()}
                disabled={!safeTourRequests.length}
                variant="outline"
                className="w-full rounded-full"
              >
                Clear all requests
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <SheetClose asChild>
                  <Button type="button" variant="secondary" className="rounded-full">
                    Close
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
