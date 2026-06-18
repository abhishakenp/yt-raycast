import { useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
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
} from "#/components/ui/sheet.tsx"

const toPriceAmount = (price: string) => {
  const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

export const CloudInfraKimiPage3 = defineCapsule({
  name: "CloudInfraKimiPage3",
  description:
    "Cloud Infra third style sibling to CloudInfraKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
  lakebed: {
    schema: {
      deploymentRequests: table({
        plan: string(),
        source: string(),
        status: string(),
        region: string(),
        price: string(),
        requestedBy: string(),
        quantity: number(),
      }),
    },
    queries: {
      deploymentRequests: ({ db }) =>
        db.deploymentRequests.orderBy("createdAt").all(),
    },
    mutations: {
      addDeploymentRequest: (
        { db },
        plan: string,
        source: string,
        status: string,
        region: string,
        price: string,
        requestedBy: string,
      ) => {
        db.deploymentRequests.insert({
          plan,
          source,
          status,
          region,
          price,
          requestedBy,
          quantity: 1,
        })

        return db.deploymentRequests.all()
      },
      removeDeploymentRequest: ({ db }, requestId: string) => {
        const request = db.deploymentRequests.get(requestId)

        if (request) {
          db.deploymentRequests.delete(request.id)
        }

        return db.deploymentRequests.all()
      },
      clearDeploymentRequests: ({ db }) => {
        for (const request of db.deploymentRequests.all()) {
          db.deploymentRequests.delete(request.id)
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
  component: ({ props, lakebed }) => {
    const [requestDrawerOpen, setRequestDrawerOpen] = useState(false)
    const go = useNavigate()
    const brand = props.brand ?? "Nebula Cloud Usage"
    const nav = props.nav?.length
      ? props.nav
      : ["Products", "Pricing", "Solutions", "Docs", "N Nebula Cloud", "Log in"]
    const hero = {
      eyebrow: "Cloud Infra / Variant 3",
      title: "Infrastructure that scales with your traffic",
      description:
        "Nebula Cloud Usage-Based Cloud Infrastructure N Nebula Cloud Products Pricing Solutions Docs Log in Get Started New: Edge Functions now available in 12 regions Infrastructure th...",
      primaryCta: "N Nebula Cloud",
      secondaryCta: "Products",
      imageAlt:
        "High-density server racks in a modern data center illuminated by blue LED lighting",
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
            title: "Everything you need to run at scale",
            body: "Nebula Cloud Usage-Based Cloud Infrastructure N Nebula Cloud Products Pricing Solutions Docs Log in Get Started New: Edge Functions now available in 12 regions Infrastructure th...",
            items: [
              "Transparent, usage-based pricing",
              "Loved by platform teams",
              "Frequently asked questions",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Deploy in minutes, not days",
            body: "Cloud Infra page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready to stop over-provisioning?",
              "Serverless Compute",
              "Managed PostgreSQL",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Built for engineers, by engineers",
            body: "Cloud Infra page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Edge Networking", "Object Storage", "Real-time Observability"],
          },
          {
            eyebrow: "Next steps",
            title: "Transparent, usage-based pricing",
            body: "Cloud Infra page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Vault Secrets", "Push to Git", "Auto-Scale"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Deploy in minutes, not days",
            alt: "High-density server racks in a modern data center illuminated by blue LED lighting",
            caption: "Cloud Infra generated page detail",
          },
          {
            title: "Built for engineers, by engineers",
            alt: "Close-up of a laptop screen showing real-time traffic analytics graphs with blue and green data lines",
            caption: "Cloud Infra generated page detail",
          },
          {
            title: "Transparent, usage-based pricing",
            alt: "Financial dashboard with colorful performance charts displayed on a large desktop monitor",
            caption: "Cloud Infra generated page detail",
          },
        ]

    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials = authDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ME"
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

    const requests = lakebed.useQuery("deploymentRequests")
    const addDeploymentRequest = lakebed.useMutation("addDeploymentRequest")
    const removeDeploymentRequest = lakebed.useMutation("removeDeploymentRequest")
    const clearDeploymentRequests = lakebed.useMutation("clearDeploymentRequests")

    const requestRows = requests && requests.length > 0 ? requests : []
    const requestCount = requestRows.length
    const requestEstimate = requestRows.reduce(
      (total, request) =>
        total + toPriceAmount(request.price) * request.quantity,
      0,
    )

    const queueRequest = (source: string) => {
      void addDeploymentRequest(
        "Growth plan",
        source,
        "Queued",
        "Auto-managed",
        "$0",
        isSignedIn ? authDisplayName : "Guest",
      )
      setRequestDrawerOpen(true)
    }

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
            <button
              type="button"
              onClick={() => {
                queueRequest("Header")
                go(hero.primaryCta)
              }}
              className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
              {requestCount > 0 ? (
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-primary-foreground px-1 text-[0.625rem] font-bold text-primary">
                  {requestCount}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        <Sheet open={requestDrawerOpen} onOpenChange={setRequestDrawerOpen}>
          <SheetContent side="right" className="w-full max-w-md p-0 sm:max-w-lg">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle>Deployment request queue</SheetTitle>
              <SheetDescription>
                {requestCount > 0
                  ? `${requestCount} request${requestCount === 1 ? "" : "s"} in queue`
                  : "No deployment requests yet."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {requestRows.length ? (
                <div className="space-y-4">
                  {requestRows.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <p className="text-sm font-semibold text-card-foreground">
                        {request.plan}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.source} · {request.region}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {request.requestedBy}
                          </p>
                          <p className="text-sm font-semibold text-card-foreground">
                            {request.price}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Status: {request.status}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            void removeDeploymentRequest(request.id)
                          }
                          className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
                  No active requests. Add one from any primary CTA.
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Queued items</span>
                  <span>{requestCount}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-foreground">
                  <span>Estimated baseline</span>
                  <span>${requestEstimate.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequestDrawerOpen(false)
                    go("Pricing")
                  }}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  View pricing
                </button>
                <button
                  type="button"
                  onClick={() => void clearDeploymentRequests()}
                  disabled={!requestRows.length}
                  className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                >
                  Clear queue
                </button>
              </div>
              <div className="mt-2 w-full space-y-2">
                <div className="rounded-md border border-border p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">{authLabel}</p>
                  <p>
                    {auth.isLoading
                      ? "Checking account state…"
                      : isSignedIn
                        ? `${authEmail ?? "Signed in"}`
                        : "Sign in for personalized request history."}
                  </p>
                  {isSignedIn ? (
                    <p className="mt-1">Initials: {authInitials}</p>
                  ) : null}
                </div>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="w-full rounded-md bg-muted px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/90 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Sign in with Google
                  </button>
                )}
              </div>
              <SheetClose asChild>
                <button
                  type="button"
                  className="mt-2 w-full rounded-md border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/90"
                >
                  Continue
                </button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

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
                      queueRequest("Hero primary CTA")
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
                  onClick={() => {
                    queueRequest("Final CTA")
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
