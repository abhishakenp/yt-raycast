import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import { Button } from "#/components/ui/button.tsx"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet.tsx"

export const SpaWellnessKimiPage3 = defineCapsule({
  name: "SpaWellnessKimiPage3",
  description:
    "Spa Wellness third style sibling to SpaWellnessKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      reservations: table({
        treatment: string(),
        source: string(),
        plannedDate: string(),
        guests: number(),
        status: string(),
      }),
    },
    queries: {
      reservations: ({ db }) => db.reservations.orderBy("createdAt").all(),
    },
    mutations: {
      addReservation: ({ db }, treatment: string, source: string, plannedDate: string, guests: number) => {
        const safeGuests = Number.isFinite(guests) && guests > 0 ? Math.floor(guests) : 1

        db.reservations.insert({
          treatment: treatment.trim() || "Wellness request",
          source: source.trim() || "General",
          plannedDate: plannedDate || "TBD",
          guests: safeGuests,
          status: "Requested",
        })

        return db.reservations.all()
      },
      updateReservationGuests: ({ db }, reservationId: string, guests: number) => {
        const existingReservation = db.reservations.get(reservationId)

        if (!existingReservation) {
          return db.reservations.all()
        }

        const safeGuests = Number.isFinite(guests) ? Math.max(1, Math.floor(guests)) : 1
        db.reservations.update(reservationId, { guests: safeGuests })

        return db.reservations.all()
      },
      removeReservation: ({ db }, reservationId: string) => {
        db.reservations.delete(reservationId)
        return db.reservations.all()
      },
      clearReservations: ({ db }) => {
        for (const reservation of db.reservations.all()) {
          db.reservations.delete(reservation.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [reservationDrawerOpen, setReservationDrawerOpen] = useState(false)

    const brand = props.brand ?? "Elysian Springs Luxury Wellness Retreat & Spa"
    const nav = props.nav?.length ? props.nav : ["Elysian Springs", "Treatments", "Gallery", "Packages", "Stories", "FAQ"]
    const hero = {
      eyebrow: "Spa Wellness / Variant 3",
      title: "Where Stillness Meets Renewal",
      description:
        "Elysian Springs Luxury Wellness Retreat & Spa Elysian Springs Treatments Gallery Packages Stories FAQ Book Retreat Treatments Gallery Packages Stories FAQ Book Retreat Est. 2009...",
      primaryCta: "Check Availability",
      secondaryCta: "Request Gift Certificate",
      imageAlt: "Woman relaxing in a candlelit spa pool with floating rose petals at dusk",
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
            "title": "Treatments Rooted in Tradition, Refined by Science",
            "body": "Elysian Springs Luxury Wellness Retreat & Spa Elysian Springs Treatments Gallery Packages Stories FAQ Book Retreat Treatments Gallery Packages Stories FAQ Book Retreat Est. 2009...",
            "items": [
              "Curated Retreats",
              "Voices of Renewal",
              "Everything You Need to Know",
            ],
          },
          {
            "eyebrow": "Experience",
            "title": "Four Steps to Complete Restoration",
            "body": "Spa Wellness page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Begin Your Retreat Today",
              "Thermal Mineral Baths",
              "Holistic Body Therapies",
            ],
          },
          {
            "eyebrow": "Proof",
            "title": "See Where Stillness Lives",
            "body": "Spa Wellness page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Advanced Skin Wellness",
              "Mindfulness & Movement",
              "Essential Escape",
            ],
          },
          {
            "eyebrow": "Next steps",
            "title": "Curated Retreats",
            "body": "Spa Wellness page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": ["Signature Renewal", "Complete Retreat"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            "title": "Four Steps to Complete Restoration",
            "alt": "Woman relaxing in a candlelit spa pool with floating rose petals at dusk",
            "caption": "Spa Wellness generated page detail",
          },
          {
            "title": "See Where Stillness Lives",
            "alt": "Luxury spa treatment room with warm wood walls, massage table, and soft ambient lighting",
            "caption": "Spa Wellness generated page detail",
          },
          {
            "title": "Curated Retreats",
            "alt": "Bamboo walkway crossing a serene koi pond surrounded by moss and ferns",
            "caption": "Spa Wellness generated page detail",
          },
        ]

    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in to save later"

    const reservations = lakebed.useQuery("reservations")
    const addReservation = lakebed.useMutation("addReservation")
    const updateReservationGuests = lakebed.useMutation("updateReservationGuests")
    const removeReservation = lakebed.useMutation("removeReservation")
    const clearReservations = lakebed.useMutation("clearReservations")

    const safeReservations = reservations ?? []
    const reservationCount = safeReservations.length
    const totalGuests = safeReservations.reduce(
      (acc, reservation) => acc + (Number(reservation.guests) || 1),
      0,
    )

    const addToReservations = (label: string, source: string) => {
      void addReservation(label, source, "TBD", 1)
      setReservationDrawerOpen(true)
    }

    const handleSignIn = () => {
      if (auth.isLoading) {
        return
      }

      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
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
            <button
              type="button"
              onClick={() => {
                addToReservations(hero.title, "Header CTA")
                go(hero.primaryCta)
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
              <span
                className={cn(
                  "ml-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground px-1.5 py-0.5 text-xs font-bold text-background",
                  reservationCount ? "visible" : "invisible",
                )}
              >
                {reservationCount}
              </span>
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
                    onClick={() => {
                      addToReservations(hero.title, "Hero primary CTA")
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addToReservations(hero.secondaryCta, "Hero secondary CTA")
                      go(hero.secondaryCta)
                    }}
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
                            addToReservations(item, "Section item")
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
                <p className="text-sm font-medium text-primary">Generated visuals</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Content-led page moments
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  addToReservations(hero.secondaryCta, "Gallery action")
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
                    addToReservations(hero.primaryCta, "Bottom CTA")
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

        <Sheet
          open={reservationDrawerOpen}
          onOpenChange={setReservationDrawerOpen}
        >
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Reservation plan</SheetTitle>
              <SheetDescription className="flex items-center justify-between gap-3">
                <span>
                  Save services, guests, and planned dates for checkout.
                </span>
                {isSignedIn ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                  >
                    {authLabel}
                  </Button>
                )}
              </SheetDescription>
              <p className="mt-1 text-xs text-muted-foreground">
                {isSignedIn
                  ? `Signed in as ${authDisplayName}`
                  : "Sign in to persist your plan across sessions."}
              </p>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-5 overflow-y-auto">
              {safeReservations.length ? (
                safeReservations.map((reservation) => (
                  <article
                    key={reservation.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-card-foreground">
                          {reservation.treatment}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.source} · {reservation.plannedDate} · {reservation.status}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeReservation(reservation.id)}
                        className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                      <button
                        type="button"
                        onClick={() =>
                          void updateReservationGuests(
                            reservation.id,
                            Number(reservation.guests) - 1,
                          )
                        }
                        className="grid size-9 place-items-center text-sm text-muted-foreground hover:text-foreground"
                        aria-label={`Decrease guests for ${reservation.treatment}`}
                      >
                        -
                      </button>
                      <span className="min-w-12 text-center text-sm font-semibold text-foreground">
                        {reservation.guests} guest
                        {reservation.guests === 1 ? "" : "s"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void updateReservationGuests(
                            reservation.id,
                            Number(reservation.guests) + 1,
                          )
                        }
                        className="grid size-9 place-items-center text-sm text-muted-foreground hover:text-foreground"
                        aria-label={`Increase guests for ${reservation.treatment}`}
                      >
                        +
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No reservation plan yet
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Add one of the featured experiences to start building your retreat
                    plan.
                  </p>
                </div>
              )}
            </div>

            <SheetFooter className="border-t border-border p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Plan items</span>
                  <span>{reservationCount}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total guests</span>
                  <span>{totalGuests}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  disabled={!safeReservations.length}
                  onClick={() => go("Book Retreat")}
                  className="w-full rounded-full"
                >
                  Checkout
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void clearReservations()}
                  disabled={!safeReservations.length}
                  className="w-full rounded-full"
                >
                  Clear plan
                </Button>
              </div>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 w-full rounded-full"
                >
                  Continue browsing
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
