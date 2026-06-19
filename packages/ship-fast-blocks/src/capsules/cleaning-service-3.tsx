import { useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { Button } from "#/components/ui/button.tsx"
import { defineCapsule } from "./openui.ts"
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

const parsePrice = (price: string) => {
  const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount)

const defaultHero = {
  eyebrow: "Cleaning Service / Variant 3",
  title: "A cleaner home. A clearer mind.",
  description:
    "Maison Pure | Premium Home Cleaning Services Maison Pure Services How It Works Gallery Pricing Reviews FAQ (555) 987-1234 Book Now Services How It Works Gallery Pricing Reviews...",
  primaryCta: "Maison Pure",
  secondaryCta: "Services",
  imageAlt: "Professional cleaner vacuuming a modern living room with natural light",
}

const defaultMetrics = [
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

const defaultSections = [
  {
    eyebrow: "Overview",
    title: "Everything a home needs to stay pristine",
    body: "Maison Pure | Premium Home Cleaning Services Maison Pure Services How It Works Gallery Pricing Reviews FAQ (555) 987-1234 Book Now Services How It Works Gallery Pricing Reviews...",
    items: [
      "Plans that match your rhythm",
      "What homeowners are saying",
      "Questions we answer every day",
    ],
  },
  {
    eyebrow: "Experience",
    title: "Book in 3 minutes. Relax for days.",
    body: "Cleaning Service page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    items: [
      "Ready to come home to calm?",
      "Recurring Maid Service",
      "Deep & Spring Cleaning",
    ],
  },
  {
    eyebrow: "Proof",
    title: "See the difference detail makes",
    body: "Cleaning Service page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    items: [
      "Move-In / Move-Out",
      "Post-Construction Clean",
      "Green & Eco Cleaning",
    ],
  },
  {
    eyebrow: "Next steps",
    title: "Plans that match your rhythm",
    body: "Cleaning Service page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    items: ["Event & Party Prep", "Tell us about your home", "We arrive fully equipped"],
  },
]

const defaultGallery = [
  {
    title: "Book in 3 minutes. Relax for days.",
    alt: "Professional cleaner vacuuming a modern living room with natural light",
    caption: "Cleaning Service generated page detail",
  },
  {
    title: "See the difference detail makes",
    alt: "Sparkling clean modern kitchen countertop with green plants in natural light",
    caption: "Cleaning Service generated page detail",
  },
  {
    title: "Plans that match your rhythm",
    alt: "Wide angle of a spotless white and wood modern interior living space",
    caption: "Cleaning Service generated page detail",
  },
]

const defaultCleaningServices = [
  {
    name: "Recurring Maid Service",
    description: "Same-day and weekly maintenance plans for a steady routine.",
    price: "$129",
    alt: "Professional cleaner vacuuming a modern living room with natural light",
  },
  {
    name: "Deep & Spring Cleaning",
    description: "Top-to-bottom deep clean of corners, baseboards, and hard-to-reach spaces.",
    price: "$189",
    alt: "Sparkling clean modern kitchen countertop with green plants in natural light",
  },
  {
    name: "Move-In / Move-Out",
    description: "Detailed turnover cleaning for transitions before and after occupancy.",
    price: "$249",
    alt: "Wide angle of a spotless white and wood modern interior living space",
  },
  {
    name: "Post-Construction Clean",
    description: "Debris, dust, and residue removal after renovation projects.",
    price: "$329",
    alt: "Sparkling clean modern kitchen countertop with green plants in natural light",
  },
  {
    name: "Green & Eco Cleaning",
    description: "Bio-safe products and air-conscious cleaning methods.",
    price: "$159",
    alt: "Professional cleaner vacuuming a modern living room with natural light",
  },
  {
    name: "Event & Party Prep",
    description: "Quick-refresh service before your guest visits and gatherings.",
    price: "$139",
    alt: "Wide angle of a spotless white and wood modern interior living space",
  },
]

export const CleaningServiceKimiPage3 = defineCapsule({
  name: "CleaningServiceKimiPage3",
  description:
    "Cleaning Service third style sibling to CleaningServiceKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      cleaningServices: table({
        name: string(),
        description: string(),
        price: string(),
        alt: string(),
      }),
      bookingLines: table({
        serviceId: string(),
        quantity: number(),
      }),
    },
    queries: {
      cleaningServices: ({ db }) => db.cleaningServices.orderBy("createdAt").all(),
      bookingLines: ({ db }) =>
        db.bookingLines.all().flatMap((line) => {
          const service = db.cleaningServices.get(line.serviceId)
          return service ? [{ ...line, service }] : []
        }),
    },
    mutations: {
      addBooking: (
        { db },
        serviceName: string,
        serviceDescription: string,
        servicePrice: string,
        serviceAlt: string,
      ) => {
        const normalizedName = serviceName.trim()
        if (!normalizedName) return db.bookingLines.all()

        const existingService = db.cleaningServices
          .where("name", normalizedName)
          .all()[0]

        if (!existingService) {
          db.cleaningServices.insert({
            name: normalizedName,
            description: serviceDescription,
            price: servicePrice,
            alt: serviceAlt,
          })
        }

        const service = db.cleaningServices.where("name", normalizedName).all()[0]
        if (!service) return db.bookingLines.all()

        const existingBooking = db.bookingLines
          .where("serviceId", service.id)
          .all()[0]

        if (existingBooking) {
          db.bookingLines.update(existingBooking.id, {
            quantity: existingBooking.quantity + 1,
          })
        } else {
          db.bookingLines.insert({
            serviceId: service.id,
            quantity: 1,
          })
        }

        return db.bookingLines.all()
      },
      updateBookingQuantity: ({ db }, bookingLineId: string, quantity: number) => {
        const bookingLine = db.bookingLines.get(bookingLineId)
        if (!bookingLine) return db.bookingLines.all()

        const nextQuantity = Math.max(0, Math.floor(quantity))
        if (nextQuantity > 0) {
          db.bookingLines.update(bookingLineId, {
            quantity: nextQuantity,
          })
        } else {
          db.bookingLines.delete(bookingLineId)
        }

        return db.bookingLines.all()
      },
      removeBooking: ({ db }, bookingLineId: string) => {
        const bookingLine = db.bookingLines.get(bookingLineId)
        if (bookingLine) {
          db.bookingLines.delete(bookingLine.id)
        }

        return db.bookingLines.all()
      },
      clearBookings: ({ db }) => {
        for (const bookingLine of db.bookingLines.all()) {
          db.bookingLines.delete(bookingLine.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [bookingOpen, setBookingOpen] = useState(false)
    const brand = props.brand ?? "Maison Pure"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "How It Works", "Gallery", "Pricing", "Reviews", "FAQ"]
    const hero = { ...defaultHero, ...props.hero }
    const metrics = props.metrics?.length ? props.metrics : defaultMetrics
    const sections = props.sections?.length ? props.sections : defaultSections
    const gallery = props.gallery?.length ? props.gallery : defaultGallery

    const storedServices = lakebed.useQuery("cleaningServices")
    const bookingLines = lakebed.useQuery("bookingLines")
    const addBooking = lakebed.useMutation("addBooking")
    const updateBookingQuantity = lakebed.useMutation("updateBookingQuantity")
    const removeBooking = lakebed.useMutation("removeBooking")
    const clearBookings = lakebed.useMutation("clearBookings")
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
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const availableServices =
      storedServices && storedServices.length ? storedServices : defaultCleaningServices
    const safeBookingLines = bookingLines ?? []
    const bookingItemCount = safeBookingLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const bookingSubtotal = safeBookingLines.reduce((total, item) => {
      const price = parsePrice(item.service?.price ?? "")
      return total + price * item.quantity
    }, 0)
    const bookingRoute = nav.includes("Pricing") ? "Pricing" : "Services"
    const handleAddToBooking = (
      serviceName: string,
      serviceDescription: string,
      servicePrice: string,
      serviceAlt: string,
    ) => {
      void addBooking(serviceName, serviceDescription, servicePrice, serviceAlt)
      setBookingOpen(true)
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
              <button
                type="button"
                onClick={() => go(hero.primaryCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
              <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Bookings
                    {bookingItemCount > 0 ? (
                      <span className="absolute -right-2 -top-2 inline-grid size-5 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {bookingItemCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle>Booking summary</SheetTitle>
                    <SheetDescription>
                      {bookingItemCount > 0
                        ? `${bookingItemCount} service${bookingItemCount === 1 ? "" : "s"} saved to your request basket.`
                        : "No services selected yet."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeBookingLines.length ? (
                      <div className="space-y-5">
                        {safeBookingLines.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={item.service?.name ?? "Cleaning service"}
                                w={180}
                                h={180}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {brand}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.service?.name ?? "Selected service"}
                                  </h3>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {formatCurrency(
                                    parsePrice(item.service?.price || "") *
                                      item.quantity,
                                  )}
                                </p>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.service?.description ??
                                  "Custom request created in this session."}
                              </p>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateBookingQuantity(
                                        item.id,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Decrease ${item.service?.name ?? "service"} quantity`}
                                  >
                                    -
                                  </button>
                                  <span className="min-w-8 text-center text-sm font-semibold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateBookingQuantity(
                                        item.id,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Increase ${item.service?.name ?? "service"} quantity`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void removeBooking(item.id)}
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No services yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add a service from the quick add panel below.
                        </p>
                      </div>
                    )}
                    <div className="mt-8 space-y-4 border-t border-border pt-6">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Add a service
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quick-add frequently used options.
                        </p>
                      </div>
                      <div className="space-y-3">
                        {availableServices.slice(0, 4).map((service) => (
                          <div
                            key={service.name}
                            className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-lg border border-border p-3"
                          >
                            <div className="aspect-square overflow-hidden rounded-md bg-muted">
                              <Image
                                alt={service.alt}
                                w={96}
                                h={96}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {service.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {service.price}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                void handleAddToBooking(
                                  service.name,
                                  service.description,
                                  service.price,
                                  service.alt,
                                )
                              }
                              className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(bookingSubtotal)}</span>
                      </div>
                      <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                        <span>Total</span>
                        <span>{formatCurrency(bookingSubtotal)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      onClick={
                        isSignedIn
                          ? () => {
                              setBookingOpen(false)
                              go(bookingRoute)
                            }
                          : () => {
                              void handleSignIn()
                            }
                      }
                      disabled={isSignedIn ? bookingItemCount === 0 : false}
                    >
                      {isSignedIn ? "Review your booking" : "Sign in to continue"}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearBookings()}
                        disabled={!bookingItemCount}
                      >
                        Clear
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
                        >
                          Continue browsing
                        </Button>
                      </SheetClose>
                    </div>
                    {isSignedIn ? (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Sign out ({authLabel})
                      </button>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {authLabel} to save bookings across sessions.
                      </p>
                    )}
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
                      {section.items.map((item, itemIndex) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-md border border-border bg-background p-3"
                        >
                          <button
                            type="button"
                            onClick={() => go(item)}
                            className="text-left text-sm font-medium text-foreground transition-colors hover:text-accent"
                          >
                            {item}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAddToBooking(
                                itemIndex === 1
                                  ? "Recurring Maid Service"
                                  : itemIndex === 2
                                    ? "Deep & Spring Cleaning"
                                    : item,
                                section.body,
                                itemIndex === 1
                                  ? "$129"
                                  : itemIndex === 2
                                    ? "$189"
                                    : "$149",
                                hero.imageAlt,
                              )
                            }
                            className="text-xs font-semibold text-primary underline-offset-4 hover:text-accent-foreground hover:underline"
                          >
                            Add
                          </button>
                        </div>
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

