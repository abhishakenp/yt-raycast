import { useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
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
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const ScheduleKimiPage2 = defineCapsule({
  name: "ScheduleKimiPage2",
  description:
    "Schedule second style sibling to ScheduleKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
        className: string(),
        quantity: number(),
      }),
    },
    queries: {
      reservations: ({ db }) => db.reservations.orderBy("createdAt").all(),
    },
    mutations: {
      addReservation: ({ db }, className: string) => {
        const existing = db.reservations.where("className", className).all()[0]

        if (existing) {
          db.reservations.update(existing.id, {
            quantity: existing.quantity + 1,
          })
          return db.reservations.all()
        }

        db.reservations.insert({
          className,
          quantity: 1,
        })
        return db.reservations.all()
      },
      setReservationQuantity: ({ db }, className: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))
        const entries = db.reservations.where("className", className).all()

        for (const reservation of entries) {
          if (nextQuantity === 0) {
            db.reservations.delete(reservation.id)
          } else {
            db.reservations.update(reservation.id, { quantity: nextQuantity })
          }
        }

        return db.reservations.all()
      },
      removeReservation: ({ db }, className: string) => {
        for (const reservation of db.reservations
          .where("className", className)
          .all()) {
          db.reservations.delete(reservation.id)
        }

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
    const brand = props.brand ?? "Class Schedule"
    const nav = props.nav?.length
      ? props.nav
      : ["Schedule", "Classes", "Instructors", "Membership"]
    const [scheduleOpen, setScheduleOpen] = useState(false)
    const hero = {
      eyebrow: "Schedule / Variant 2",
      title: "Class Schedule",
      description:
        "Class Schedule FitLife Studio Schedule Classes Instructors Membership Class Schedule Book your next workout session All Classes Yoga Pilates HIIT Spin Strength MONDAY Morning Fl...",
      primaryCta: "All Classes",
      secondaryCta: "Yoga",
      imageAlt: "schedule hero scene",
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
            title: "Morning Flow Yoga",
            body: "Class Schedule FitLife Studio Schedule Classes Instructors Membership Class Schedule Book your next workout session All Classes Yoga Pilates HIIT Spin Strength MONDAY Morning Fl...",
            items: ["Pilates Core", "Strength Training", "Power Yoga"],
          },
          {
            eyebrow: "Experience",
            title: "HIIT Bootcamp",
            body: "Schedule page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
          {
            eyebrow: "Proof",
            title: "Spin Class",
            body: "Schedule page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
          {
            eyebrow: "Next steps",
            title: "Pilates Core",
            body: "Schedule page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "HIIT Bootcamp",
            alt: "schedule hero scene",
            caption: "Schedule generated page detail",
          },
          {
            title: "Spin Class",
            alt: "schedule customer experience",
            caption: "Schedule generated page detail",
          },
          {
            title: "Pilates Core",
            alt: "schedule service detail",
            caption: "Schedule generated page detail",
          },
        ]

    const reservations = lakebed.useQuery("reservations")
    const addReservation = lakebed.useMutation("addReservation")
    const setReservationQuantity = lakebed.useMutation("setReservationQuantity")
    const removeReservation = lakebed.useMutation("removeReservation")
    const clearReservations = lakebed.useMutation("clearReservations")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials = authDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ME"
    const authLabel = auth.isLoading ? "Checking..." : isSignedIn ? authDisplayName : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const reservationLines = reservations ?? []
    const reservedClasses = reservationLines.reduce(
      (total, reservation) => total + reservation.quantity,
      0,
    )

    return (
      <div
        className={cn("min-h-screen bg-background text-foreground", props.className)}
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
              <Sheet open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label="Open schedule drawer"
                  >
                    Schedule
                    {reservedClasses > 0 ? (
                      <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.7rem] font-bold text-primary-foreground">
                        {reservedClasses}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle>Class schedule</SheetTitle>
                    <SheetDescription>
                      Build and review your session plan for this visit.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {reservationLines.length ? (
                      <div className="space-y-4">
                        {reservationLines.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="rounded-lg border border-border bg-card p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-card-foreground">
                                {reservation.className}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {reservation.quantity} ×
                              </p>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="grid size-9 place-items-center"
                                  onClick={() =>
                                    void setReservationQuantity(
                                      reservation.className,
                                      reservation.quantity - 1,
                                    )
                                  }
                                  aria-label={`Decrease ${reservation.className} sessions`}
                                >
                                  -
                                </Button>
                                <span className="min-w-8 text-center text-sm font-semibold text-foreground">
                                  {reservation.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="grid size-9 place-items-center"
                                  onClick={() =>
                                    void setReservationQuantity(
                                      reservation.className,
                                      reservation.quantity + 1,
                                    )
                                  }
                                  aria-label={`Increase ${reservation.className} sessions`}
                                >
                                  +
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  void removeReservation(reservation.className)
                                }
                                className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-sm text-muted-foreground">
                        No classes added yet. Add a class from the section items below.
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between font-semibold text-foreground">
                        <span>Total classes selected</span>
                        <span>{reservedClasses}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={!reservationLines.length}
                      className="w-full rounded-full"
                      onClick={() => go(hero.primaryCta)}
                    >
                      Start booking
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearReservations()}
                        disabled={!reservationLines.length}
                      >
                        Clear
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
                        >
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                      aria-label="Open account menu"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
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
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-4">
                      <p className="truncate text-sm font-bold text-foreground">
                        {authDisplayName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {authEmail ?? "Signed in to this session"}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go("Account")}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        Account
                      </button>
                      <button
                        type="button"
                        onClick={() => go("Bookings")}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        My bookings
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
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
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
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
                            go(item)
                            void addReservation(item)
                            setScheduleOpen(true)
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
              © {new Date().getFullYear()} {brand}. All rights reserved.
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
