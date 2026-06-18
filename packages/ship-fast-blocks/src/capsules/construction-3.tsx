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

export const ConstructionKimiPage3 = defineCapsule({
  name: "ConstructionKimiPage3",
  description:
    "Construction third style sibling to ConstructionKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      quoteRequests: table({
        serviceName: string(),
        clientName: string(),
        clientEmail: string(),
        notes: string(),
        status: string(),
        count: number(),
      }),
    },
    queries: {
      quoteRequests: ({ db }) => db.quoteRequests.orderBy("createdAt").all(),
    },
    mutations: {
      addQuoteRequest: (
        { db },
        serviceName: string,
        clientName: string,
        clientEmail: string,
        notes: string,
      ) => {
        const existingRequest = db.quoteRequests
          .where("serviceName", serviceName)
          .all()[0]

        if (existingRequest) {
          db.quoteRequests.update(existingRequest.id, {
            count: existingRequest.count + 1,
            status: "Pending",
            clientName: clientName || existingRequest.clientName || "Visitor",
            clientEmail: clientEmail || existingRequest.clientEmail,
            notes: existingRequest.notes
              ? `${existingRequest.notes} · ${notes}`
              : notes,
          })
          return db.quoteRequests.all()
        }

        db.quoteRequests.insert({
          serviceName,
          clientName: clientName || "Visitor",
          clientEmail,
          status: "Pending",
          notes,
          count: 1,
        })

        return db.quoteRequests.all()
      },
      updateQuoteRequestStatus: ({ db }, id: string, status: string) => {
        const quoteRequest = db.quoteRequests.get(id)

        if (!quoteRequest) {
          return db.quoteRequests.all()
        }

        db.quoteRequests.update(id, { status })
        return db.quoteRequests.all()
      },
      removeQuoteRequest: ({ db }, id: string) => {
        for (const quoteRequest of db.quoteRequests.where("id", id).all()) {
          db.quoteRequests.delete(quoteRequest.id)
        }

        return db.quoteRequests.all()
      },
      clearQuoteRequests: ({ db }) => {
        for (const quoteRequest of db.quoteRequests.all()) {
          db.quoteRequests.delete(quoteRequest.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false)
    const [activeRequestService, setActiveRequestService] = useState("")
    const brand = props.brand ?? "Atlas Construction & Contracting Build with Confidence"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Projects", "Process", "Pricing", "FAQ", "Get a Quote"]
    const hero = {
      eyebrow: "Construction / Variant 3",
      title: "Build with precision. Deliver with pride.",
      description:
        "Atlas Construction & Contracting Build with Confidence Atlas Construction Services Projects Process Pricing FAQ Get a Quote Services Projects Process Pricing FAQ Get a Quote Ser...",
      primaryCta: "Submit Quote Request",
      secondaryCta: "Atlas Construction",
      imageAlt:
        "Aerial view of a large commercial construction site with cranes and steel framing at golden hour",
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
            title: "Comprehensive Construction Services",
            body: "Atlas Construction & Contracting Build with Confidence Atlas Construction Services Projects Process Pricing FAQ Get a Quote Services Projects Process Pricing FAQ Get a Quote Ser...",
            items: [
              "Service Packages",
              "Client Testimonials",
              "Frequently Asked Questions",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Our Build Process",
            body:
              "Construction page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Request a Free Quote",
              "Commercial Construction",
              "Residential Remodeling",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Featured Projects",
            body:
              "Construction page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Project Management",
              "Design-Build",
              "Concrete & Foundation",
            ],
          },
          {
            eyebrow: "Next steps",
            title: "Service Packages",
            body:
              "Construction page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Interior Fit-Outs",
              "Discovery & Budget",
              "Design & Permitting",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Our Build Process",
            alt: "Aerial view of a large commercial construction site with cranes and steel framing at golden hour",
            caption: "Construction generated page detail",
          },
          {
            title: "Featured Projects",
            alt: "Partner company logo for Summit Realty Group",
            caption: "Construction generated page detail",
          },
          {
            title: "Service Packages",
            alt: "Partner company logo for Meridian Development Partners",
            caption: "Construction generated page detail",
          },
        ]

    const quoteRequests = lakebed.useQuery("quoteRequests")
    const addQuoteRequest = lakebed.useMutation("addQuoteRequest")
    const updateQuoteRequestStatus = lakebed.useMutation(
      "updateQuoteRequestStatus",
    )
    const removeQuoteRequest = lakebed.useMutation("removeQuoteRequest")
    const clearQuoteRequests = lakebed.useMutation("clearQuoteRequests")

    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email || ""
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Visitor"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in to save request details"

    const storedQuoteRequests = quoteRequests ?? []
    const quoteTotalCount = storedQuoteRequests.reduce(
      (total, request) => total + request.count,
      0,
    )
    const pendingQuoteCount = storedQuoteRequests.filter(
      (request) => request.status === "Pending",
    ).length
    const reviewedQuoteCount = storedQuoteRequests.length - pendingQuoteCount

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const queueQuoteRequest = (serviceName: string, notes?: string) => {
      const noteText = notes
        ? notes
        : `Requested from ${hero.eyebrow} · ${serviceName}`
      setActiveRequestService(serviceName)
      void addQuoteRequest(
        serviceName,
        isSignedIn ? authDisplayName : "Visitor",
        isSignedIn ? authEmail : "",
        noteText,
      )
      setIsQuoteDrawerOpen(true)
    }

    return (
      <div
        className={cn(
          "min-h-screen bg-background text-foreground",
          props.className,
        )}
      >
        <Sheet open={isQuoteDrawerOpen} onOpenChange={setIsQuoteDrawerOpen}>
          <SheetContent
            side="right"
            className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-lg"
          >
            <SheetHeader className="border-b border-border px-6 py-5">
              <SheetTitle>Construction quote requests</SheetTitle>
              <SheetDescription>
                Track and manage every quote request captured from this page.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-3 border-b border-border px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                {isSignedIn ? (
                  <p className="text-sm text-muted-foreground">
                    Signed in as{" "}
                    <span className="font-medium text-foreground">
                      {authDisplayName}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    {authLabel}
                  </button>
                )}
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-md border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Sign out
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeRequestService
                  ? `Most recent request: ${activeRequestService}`
                  : "Open a request to begin."}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {storedQuoteRequests.length ? (
                <div className="space-y-4">
                  {storedQuoteRequests.map((request) => (
                    <article
                      key={request.id}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {request.serviceName}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.clientName}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.clientEmail || "No email provided"}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {request.notes}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground">
                          {request.count}x
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            request.status === "Pending"
                              ? "bg-primary/10 text-primary"
                              : "bg-foreground/10 text-foreground",
                          )}
                        >
                          {request.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void updateQuoteRequestStatus(
                                request.id,
                                request.status === "Pending"
                                  ? "Reviewed"
                                  : "Pending",
                              )
                            }
                            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {request.status === "Pending"
                              ? "Mark reviewed"
                              : "Reopen"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeQuoteRequest(request.id)}
                            className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No quote requests yet
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Trigger a CTA to add your first request.
                  </p>
                </div>
              )}
            </div>

            <SheetFooter className="border-t border-border px-6 py-5">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Total line items</span>
                  <span className="font-semibold text-foreground">
                    {quoteTotalCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending</span>
                  <span className="font-semibold text-foreground">
                    {pendingQuoteCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reviewed</span>
                  <span className="font-semibold text-foreground">
                    {reviewedQuoteCount}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void clearQuoteRequests()}
                  disabled={storedQuoteRequests.length === 0}
                  className="rounded-md bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-60"
                >
                  Clear all
                </button>
                <SheetClose asChild>
                  <button
                    type="button"
                    onClick={() => go(hero.secondaryCta)}
                    className="rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                  >
                    Continue
                  </button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

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
                queueQuoteRequest(hero.primaryCta)
                go(hero.primaryCta)
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
              {quoteTotalCount ? (
                <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {quoteTotalCount}
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
                      queueQuoteRequest(hero.primaryCta)
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      queueQuoteRequest(hero.secondaryCta, "Requested from secondary CTA")
                      go(hero.secondaryCta)
                    }}
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
                            queueQuoteRequest(item, section.title)
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
                onClick={() => {
                  queueQuoteRequest(
                    hero.secondaryCta,
                    "Requested from gallery CTA",
                  )
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
                    queueQuoteRequest(hero.primaryCta, "Requested from final CTA")
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
