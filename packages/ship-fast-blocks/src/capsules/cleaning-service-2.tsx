import { useState } from "react"
import { number, string, table } from "@ship-fast/lakebed/server"
import { z } from "zod/v4"
import { Button } from "#/components/ui/button.tsx"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
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

const defaultCleaningServices = [
  {
    name: "Simple, Flat-Rate Pricing",
    description: "Fast one-time service estimate with clear transparent pricing.",
    price: "$149",
    alt: "professional cleaner in blue uniform vacuuming a modern living room with natural light",
  },
  {
    name: "Loved by Homeowners",
    description: "Priority support and trusted recurring cleaning plans.",
    price: "$129",
    alt: "cleaner wiping down a pristine white kitchen countertop with a microfiber cloth",
  },
  {
    name: "Questions? Answered.",
    description: "Dedicated support for custom home service scheduling.",
    price: "$99",
    alt: "close-up of a steam cleaner removing grime from bathroom tile grout",
  },
  {
    name: "Ready for a Spotless Home?",
    description: "Kickoff call and inspection to determine the right cleaning package.",
    price: "$79",
    alt: "professional cleaner in blue uniform vacuuming a modern living room with natural light",
  },
  {
    name: "Standard Cleaning",
    description: "General maintenance cleaning for every room and high-traffic area.",
    price: "$129",
    alt: "professional cleaner in blue uniform vacuuming a modern living room with natural light",
  },
  {
    name: "Deep Cleaning",
    description: "Top-to-bottom deep clean including corners, appliances, and baseboards.",
    price: "$229",
    alt: "cleaner wiping down a pristine white kitchen countertop with a microfiber cloth",
  },
  {
    name: "Move-In / Move-Out",
    description: "Comprehensive transition cleaning for new and final-stage homes.",
    price: "$289",
    alt: "professional cleaner in blue uniform vacuuming a modern living room with natural light",
  },
  {
    name: "Post-Construction",
    description: "Specialized cleanup after construction and renovation activities.",
    price: "$349",
    alt: "close-up of a steam cleaner removing grime from bathroom tile grout",
  },
  {
    name: "Carpet & Upholstery",
    description: "Specialized deep extraction and fabric-safe cleaning process.",
    price: "$199",
    alt: "cleaner wiping down a pristine white kitchen countertop with a microfiber cloth",
  },
  {
    name: "Window Washing",
    description: "Interior and window-frame cleaning for clearer views and brighter rooms.",
    price: "$119",
    alt: "professional cleaner in blue uniform vacuuming a modern living room with natural light",
  },
  {
    name: "Book Online",
    description: "Use this option to queue a new cleaning request in your cart.",
    price: "$149",
    alt: "cleaner wiping down a pristine white kitchen countertop with a microfiber cloth",
  },
  {
    name: "We Clean",
    description: "A complete all-in-one cleaning service request to get started quickly.",
    price: "$169",
    alt: "close-up of a steam cleaner removing grime from bathroom tile grout",
  },
]

const getDefaultService = (name: string) => {
  const match = defaultCleaningServices.find((service) => service.name === name)
  return (
    match ?? {
      name,
      description: `${name} service request`,
      price: "$129",
      alt: "professional cleaner in blue uniform vacuuming a modern living room with natural light",
    }
  )
}

export const CleaningServiceKimiPage2 = defineCapsule({
  name: "CleaningServiceKimiPage2",
  description:
    "Cleaning Service second style sibling to CleaningServiceKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
        const existingService = db.cleaningServices.where("name", serviceName).all()[0]
        if (!existingService) {
          db.cleaningServices.insert({
            name: serviceName,
            description: serviceDescription || getDefaultService(serviceName).description,
            price: servicePrice || getDefaultService(serviceName).price,
            alt: serviceAlt || getDefaultService(serviceName).alt,
          })
        }

        const service = db.cleaningServices.where("name", serviceName).all()[0]
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
        if (nextQuantity) {
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
          db.bookingLines.delete(bookingLineId)
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

    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const brand = props.brand ?? "SparkleClean Professional Home Cleaning Services"
    const nav = props.nav?.length
      ? props.nav
      : ["Sparkle Clean", "Services", "How It Works", "Pricing", "Reviews", "FAQ"]
    const hero = {
      eyebrow: "Cleaning Service / Variant 2",
      title: "A Spotless Home, Zero Effort.",
      description:
        "SparkleClean Professional Home Cleaning Services Sparkle Clean Services How It Works Pricing Reviews FAQ (800) 555-1234 Book Cleaning Same-Day Appointments Available A Spotless...",
      primaryCta: "Sparkle Clean",
      secondaryCta: "Services",
      imageAlt:
        "professional cleaner in blue uniform vacuuming a modern living room with natural light",
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
            title: "Cleaning Built for Real Life",
            body: "SparkleClean Professional Home Cleaning Services Sparkle Clean Services How It Works Pricing Reviews FAQ (800) 555-1234 Book Cleaning Same-Day Appointments Available A Spotless...",
            items: [
              "Simple, Flat-Rate Pricing",
              "Loved by Homeowners",
              "Questions? Answered.",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Book in Minutes, Clean in Hours",
            body: "Cleaning Service page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready for a Spotless Home?",
              "Standard Cleaning",
              "Deep Cleaning",
            ],
          },
          {
            eyebrow: "Proof",
            title: "The SparkleClean Difference",
            body: "Cleaning Service page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Move-In / Move-Out",
              "Post-Construction",
              "Carpet & Upholstery",
            ],
          },
          {
            eyebrow: "Next steps",
            title: "Simple, Flat-Rate Pricing",
            body: "Cleaning Service page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Window Washing", "Book Online", "We Clean"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Book in Minutes, Clean in Hours",
            alt: "professional cleaner in blue uniform vacuuming a modern living room with natural light",
            caption: "Cleaning Service generated page detail",
          },
          {
            title: "The SparkleClean Difference",
            alt: "cleaner wiping down a pristine white kitchen countertop with a microfiber cloth",
            caption: "Cleaning Service generated page detail",
          },
          {
            title: "Simple, Flat-Rate Pricing",
            alt: "close-up of a steam cleaner removing grime from bathroom tile grout",
            caption: "Cleaning Service generated page detail",
          },
        ]

    const storedServices = lakebed.useQuery("cleaningServices")
    const bookingLines = lakebed.useQuery("bookingLines")
    const addBooking = lakebed.useMutation("addBooking")
    const updateBookingQuantity = lakebed.useMutation("updateBookingQuantity")
    const removeBooking = lakebed.useMutation("removeBooking")
    const clearBookings = lakebed.useMutation("clearBookings")

    const safeBookingLines = bookingLines ?? []
    const bookingCount = safeBookingLines.reduce(
      (total, line) => total + line.quantity,
      0,
    )
    const bookingTotal = safeBookingLines.reduce(
      (total, line) =>
        total +
        parsePrice(line.service?.price ?? "$0") * line.quantity,
      0,
    )

    const currentServices =
      storedServices?.length && storedServices.length > 0
        ? storedServices
        : defaultCleaningServices
    const serviceMap = new Map(currentServices.map((service) => [service.name, service]))

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
            <div className="flex items-center gap-2">
              <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {`Requests ${bookingCount > 0 ? `(${bookingCount})` : ""}`}
                    {bookingCount > 0 ? (
                      <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {bookingCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle>Cleaning requests</SheetTitle>
                    <SheetDescription>
                      Keep your selected services and submit in one place.
                    </SheetDescription>
                    {isSignedIn ? (
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-muted/70 px-3 py-2 text-sm text-muted-foreground">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate">{authEmail || "Signed in for this session"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="rounded-full border border-border px-3 py-1 text-xs font-semibold transition-colors hover:bg-background"
                        >
                          Sign out
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-3 w-full rounded-full"
                        onClick={handleSignIn}
                        disabled={auth.isLoading}
                      >
                        {auth.isLoading ? "Checking..." : "Sign in with Google"}
                      </Button>
                    )}
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeBookingLines.length ? (
                      <div className="space-y-5">
                        {safeBookingLines.map((line) => (
                          <div
                            key={line.id}
                            className="grid grid-cols-[1fr_auto] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div>
                              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                {line.service.name}
                              </p>
                              <p className="font-semibold text-foreground">
                                {line.service.price}
                              </p>
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {line.service.description}
                              </p>
                              <div className="mt-4 inline-flex h-9 rounded-full border border-border bg-background">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateBookingQuantity(line.id, line.quantity - 1)
                                  }
                                  aria-label={`Decrease ${line.service.name} quantity`}
                                  className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                >
                                  -
                                </button>
                                <span className="min-w-8 text-center text-sm font-semibold">
                                  {line.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateBookingQuantity(line.id, line.quantity + 1)
                                  }
                                  aria-label={`Increase ${line.service.name} quantity`}
                                  className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeBooking(line.id)}
                              className="mt-1 text-xs font-semibold text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No cleaning requests yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Choose a service from the sections to add it here.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Items</span>
                        <span>{bookingCount}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-foreground">
                        <span>Estimated total</span>
                        <span>{formatCurrency(bookingTotal)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={!safeBookingLines.length}
                      className="w-full rounded-full"
                      onClick={() => {
                        setBookingOpen(false)
                        go(hero.primaryCta)
                      }}
                    >
                      Continue to {hero.secondaryCta}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearBookings()}
                        disabled={!safeBookingLines.length}
                      >
                        Clear all
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
                    onClick={() => {
                      const service = getDefaultService(hero.title)
                      void addBooking(
                        service.name,
                        service.description,
                        service.price,
                        service.alt,
                      )
                      setBookingOpen(true)
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
                            const service = getDefaultService(item)
                            const catalogService = serviceMap.get(item)
                            const selectedService = catalogService ?? service
                            void addBooking(
                              selectedService.name,
                              selectedService.description,
                              selectedService.price,
                              selectedService.alt,
                            )
                            setBookingOpen(true)
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
              {gallery.map((item) => {
                const catalogItem = serviceMap.get(item.title)
                return (
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
                      <Button
                        type="button"
                        size="sm"
                        className="mt-4 rounded-full"
                        onClick={() => {
                          if (catalogItem) {
                            void addBooking(
                              catalogItem.name,
                              catalogItem.description,
                              catalogItem.price,
                              catalogItem.alt,
                            )
                            setBookingOpen(true)
                            return
                          }

                          const fallback = getDefaultService(item.title)
                          void addBooking(
                            fallback.name,
                            fallback.description,
                            fallback.price,
                            fallback.alt,
                          )
                          setBookingOpen(true)
                        }}
                      >
                        Add to request
                      </Button>
                    </div>
                  </article>
                )
              })}
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
                    const service = getDefaultService("We Clean")
                    void addBooking(
                      service.name,
                      service.description,
                      service.price,
                      service.alt,
                    )
                    setBookingOpen(true)
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
    )
  },
})
