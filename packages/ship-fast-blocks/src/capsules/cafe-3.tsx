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

export const CafeKimiPage3 = defineCapsule({
  name: "CafeKimiPage3",
  description:
    "Cafe third style sibling to CafeKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
        name: string(),
        note: string(),
        guests: number(),
      }),
    },
    queries: {
      reservations: ({ db }) => db.reservations.orderBy("createdAt").all(),
    },
    mutations: {
      addReservation: ({ db }, name: string, guests: number, note: string) => {
        const trimmedName = name.trim()
        if (!trimmedName) return db.reservations.all()

        const nextGuests = Math.max(1, Math.floor(guests))
        const existing = db.reservations.where("name", trimmedName).all()[0]

        if (existing) {
          db.reservations.update(existing.id, {
            guests: existing.guests + nextGuests,
            note: note || existing.note,
          })
          return db.reservations.all()
        }

        db.reservations.insert({
          name: trimmedName,
          note: note || "",
          guests: nextGuests,
        })
        return db.reservations.all()
      },
      setReservationGuests: ({ db }, reservationId: string, guests: number) => {
        const reservation = db.reservations.get(reservationId)
        if (!reservation) return db.reservations.all()

        const nextGuests = Math.floor(guests)

        if (nextGuests <= 0) {
          db.reservations.delete(reservationId)
          return db.reservations.all()
        }

        db.reservations.update(reservationId, {
          guests: nextGuests,
        })
        return db.reservations.all()
      },
      removeReservation: ({ db }, reservationId: string) => {
        const reservation = db.reservations.get(reservationId)
        if (!reservation) return db.reservations.all()

        db.reservations.delete(reservation.id)
        return db.reservations.all()
      },
      clearReservations: ({ db }) => {
        for (const reservation of db.reservations.all()) {
          db.reservations.delete(reservation.id)
        }

        return db.reservations.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [reservationDrawerOpen, setReservationDrawerOpen] = useState(false)

    const brand = props.brand ?? "Velvet Roast Cafe Artisan Coffee in Portland"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Velvet Roast",
          "Story",
          "Gallery",
          "Reviews",
          "Location",
          "Order Ahead",
        ]
    const hero = {
      eyebrow: "Cafe / Variant 3",
      title: "Coffee worth slowing down for.",
      description:
        "Velvet Roast Cafe Artisan Coffee in Portland Velvet Roast Menu Story Gallery Reviews Location Order Ahead Est. 2018 | Pearl District, Portland Coffee worth slowing down for. Sin...",
      primaryCta: "Join the List",
      secondaryCta: "Velvet Roast",
      imageAlt: "artisan latte with rosetta latte art on dark wooden table",
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
            title: "Made in house, every day.",
            body: "Velvet Roast Cafe Artisan Coffee in Portland Velvet Roast Menu Story Gallery Reviews Location Order Ahead Est. 2018 | Pearl District, Portland Coffee worth slowing down for. Sin...",
            items: [
              "What regulars say.",
              "Questions we hear often.",
              "Bring Velvet Roast home.",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Started with a roaster and a stubborn refusal to cut corners.",
            body:
              "Cafe page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Come by. The door is always open at 6:30.", "Espresso Bar", "Pastry Case"],
          },
          {
            eyebrow: "Proof",
            title: "Look around.",
            body:
              "Cafe page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
          {
            eyebrow: "Next steps",
            title: "What regulars say.",
            body:
              "Cafe page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Started with a roaster and a stubborn refusal to cut corners.",
            alt: "artisan latte with rosetta latte art on dark wooden table",
            caption: "Cafe generated page detail",
          },
          {
            title: "Look around.",
            alt: "interior of a cozy coffee shop with warm wood and exposed brick",
            caption: "Cafe generated page detail",
          },
          {
            title: "What regulars say.",
            alt: "close up of espresso being extracted into a ceramic cup with golden crema",
            caption: "Cafe generated page detail",
          },
        ]

    const reservationDefaultItems = sections.flatMap((section, sectionIndex) =>
      (section.items ?? []).map((item, itemIndex) => ({
        id: `seed-${sectionIndex}-${itemIndex}`,
        name: item,
        note: section.eyebrow,
        guests: ((sectionIndex + itemIndex) % 4) + 1,
      })),
    )
    const reservationDefaults =
      reservationDefaultItems.length > 0
        ? reservationDefaultItems
        : [
            {
              id: "seed-default",
              name: "Reserve window table",
              note: "Welcome table",
              guests: 2,
            },
            {
              id: "seed-default-2",
              name: "Try the espresso flight",
              note: "House recommendation",
              guests: 1,
            },
          ]

    const storedReservations = lakebed.useQuery("reservations")
    const addReservation = lakebed.useMutation("addReservation")
    const setReservationGuests = lakebed.useMutation("setReservationGuests")
    const removeReservation = lakebed.useMutation("removeReservation")
    const clearReservations = lakebed.useMutation("clearReservations")
    const auth = lakebed.useAuth()

    const reservationList = storedReservations?.length
      ? storedReservations
      : reservationDefaults
    const reservationCount = reservationList.length
    const hasPersistedReservations = Boolean(storedReservations?.length)
    const persistedReservations = storedReservations ?? []
    const persistedReservationCount = hasPersistedReservations
      ? persistedReservations.length
      : 0
    const persistedGuestCount = hasPersistedReservations
      ? persistedReservations.reduce(
          (sum, reservation) => sum + Math.max(0, reservation.guests),
          0,
        )
      : 0

    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authDisplayName =
      auth.displayName ||
      auth.user?.displayName ||
      auth.email ||
      auth.user?.email ||
      "Account"
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

    const handleAddToReservations = (name: string, note: string) => {
      const trimmedName = name.trim()
      if (!trimmedName) return

      void addReservation(trimmedName, 1, note)
      setReservationDrawerOpen(true)
    }

    return (
      <Sheet
        open={reservationDrawerOpen}
        onOpenChange={setReservationDrawerOpen}
      >
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
                  handleAddToReservations(hero.primaryCta, hero.eyebrow)
                  go(hero.primaryCta)
                }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                {hero.primaryCta}
                {persistedGuestCount > 0 ? (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-xs font-bold text-foreground">
                    {persistedGuestCount}
                  </span>
                ) : null}
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
                        handleAddToReservations(hero.primaryCta, hero.eyebrow)
                        go(hero.primaryCta)
                      }}
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
                              handleAddToReservations(item, section.title)
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
                      handleAddToReservations(hero.primaryCta, "Footer")
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

        <SheetContent className="w-full p-0 sm:max-w-md" side="right">
          <SheetHeader className="border-b border-border p-6">
            <SheetTitle>Visit list ({persistedReservationCount})</SheetTitle>
            <SheetDescription>
              {hasPersistedReservations
                ? `${persistedGuestCount} guest${persistedGuestCount === 1 ? '' : 's'} queued for upcoming visits.`
                : 'Add items from the page to start building your visit list.'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {reservationCount ? (
              <div className="space-y-4">
                {reservationList.map((reservation) => {
                  const reservationId = String(reservation.id)

                  return (
                    <article
                      key={reservationId}
                      className="rounded-lg border border-border bg-background p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {reservation.note}
                          </p>
                          <h3 className="text-sm font-semibold text-foreground">
                            {reservation.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {reservation.guests} guest(s)
                          </p>
                        </div>
                        {hasPersistedReservations ? (
                          <button
                            type="button"
                            onClick={() => void removeReservation(reservationId)}
                            className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                          <button
                            type="button"
                            onClick={() =>
                              void setReservationGuests(
                                reservationId,
                                (reservation.guests || 0) - 1,
                              )
                            }
                            disabled={!hasPersistedReservations}
                            className="grid size-9 place-items-center text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                            aria-label={`Decrease ${reservation.name} party size`}
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold">
                            {reservation.guests}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void setReservationGuests(
                                reservationId,
                                (reservation.guests || 0) + 1,
                              )
                            }
                            disabled={!hasPersistedReservations}
                            className="grid size-9 place-items-center text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                            aria-label={`Increase ${reservation.name} party size`}
                          >
                            +
                          </button>
                        </div>
                        {hasPersistedReservations ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReservationDrawerOpen(false)
                              go("Reservation Checkout")
                            }}
                            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            Reserve this
                          </button>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                <p className="text-base font-semibold text-foreground">
                  Your visit list is empty.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use page actions to add a few favorites to your list.
                </p>
              </div>
            )}
          </div>
          <SheetFooter className="border-t border-border p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Total party size</span>
                <span>{persistedGuestCount}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                <span>Saved spots</span>
                <span>{persistedReservationCount}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={!hasPersistedReservations}
              onClick={() => {
                setReservationDrawerOpen(false)
                go("Order Ahead")
              }}
              className="mt-5 w-full rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              Reserve now
            </button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void clearReservations()}
                disabled={!hasPersistedReservations}
                className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear list
              </button>
              <SheetClose asChild>
                <button
                  type="button"
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent"
                >
                  Continue browsing
                </button>
              </SheetClose>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {isSignedIn ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate">Signed in as {authDisplayName}</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {authLabel}
                </button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  },
})
