import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { string, table } from "@ship-fast/lakebed/server"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
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

export const ChurchKimiPage2 = defineCapsule({
  name: "ChurchKimiPage2",
  description:
    "Church second style sibling to ChurchKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      plans: table({
        title: string(),
        detail: string(),
        source: string(),
      }),
    },
    queries: {
      plans: ({ db }) => db.plans.orderBy("createdAt").all(),
    },
    mutations: {
      addPlan: ({ db }, title: string, detail: string, source: string) => {
        const existingPlan = db.plans.where("title", title).all()[0]
        if (existingPlan) {
          return db.plans.all()
        }

        db.plans.insert({
          title,
          detail,
          source,
        })

        return db.plans.all()
      },
      removePlan: ({ db }, id: string) => {
        db.plans.delete(id)
        return db.plans.all()
      },
      clearPlans: ({ db }) => {
        for (const plan of db.plans.all()) {
          db.plans.delete(plan.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [planOpen, setPlanOpen] = useState(false)
    const brand = props.brand ?? "Grace Covenant Church"
    const nav = props.nav?.length ? props.nav : ["Services", "Events", "About", "Give"]
    const hero = {
      eyebrow: "Church / Variant 2",
      title: "Welcome Home",
      description:
        "Grace Covenant Church | Welcome Home G Grace Covenant Austin, Texas Services Events About Give Join us this Sunday Welcome Home A diverse community in the heart of Austin, wrest...",
      primaryCta: "G Grace Covenant Austin, Texas",
      secondaryCta: "Services",
      imageAlt: "sunlight streaming through modern church sanctuary windows illuminating wooden pews",
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
            title:
              "There is a place for you here",
            body: "Grace Covenant Church | Welcome Home G Grace Covenant Austin, Texas Services Events About Give Join us this Sunday Welcome Home A diverse community in the heart of Austin, wrest...",
            items: [
              "Grace Kids",
              "Community Groups",
              "Student Ministry",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Plan Your Visit in 3 Easy Steps",
            body: "Church page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Global Outreach", "Prayer & Care", "Check the Schedule"],
          },
          {
            eyebrow: "Proof",
            title: "Dynamic Worship",
            body: "Church page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Stop by the Welcome Center", "Stay for Coffee"],
          },
          {
            eyebrow: "Next steps",
            title: "Grace Kids",
            body: "Church page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Plan Your Visit in 3 Easy Steps",
            alt: "sunlight streaming through modern church sanctuary windows illuminating wooden pews",
            caption: "Church generated page detail",
          },
          {
            title: "Dynamic Worship",
            alt: "church hero scene",
            caption: "Church generated page detail",
          },
          {
            title: "Grace Kids",
            alt: "church customer experience",
            caption: "Church generated page detail",
          },
        ]

    const plans = lakebed.useQuery("plans")
    const addPlan = lakebed.useMutation("addPlan")
    const removePlan = lakebed.useMutation("removePlan")
    const clearPlans = lakebed.useMutation("clearPlans")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Community member"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? "Signed in"
        : "Sign in"
    const safePlans = plans ?? []
    const planCount = safePlans.length
    const authInitials = authDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CM"

    const trackPlan = (title: string, detail: string, source: string) => {
      void addPlan(title, detail, source)
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  trackPlan(hero.primaryCta, "Hero header action", "hero")
                  go(hero.primaryCta)
                }}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
              <button
                type="button"
                onClick={() => setPlanOpen(true)}
                className="relative rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                My Plan
                {planCount > 0 ? (
                  <span className="ml-2 inline-grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {planCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={isSignedIn ? handleSignOut : handleSignIn}
                disabled={auth.isLoading}
                aria-label={isSignedIn ? "Sign out" : "Sign in with Google"}
                className="hidden h-10 items-center rounded-full bg-muted px-4 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
              >
                {isSignedIn ? `Hello ${authInitials}` : authLabel}
              </button>
            </div>
          </div>
        </header>

        <Sheet open={planOpen} onOpenChange={setPlanOpen}>
          <SheetContent side="right" className="w-full max-w-md">
            <SheetHeader>
              <SheetTitle>My Plan</SheetTitle>
              <SheetDescription>
                {planCount > 0
                  ? `${planCount} saved ${planCount === 1 ? "item" : "items"}`
                  : "Use this plan drawer to collect sections and actions to follow later."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {planCount > 0 ? (
                <div className="space-y-4">
                  {safePlans.map((plan) => (
                    <article
                      key={plan.id}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {plan.source}
                          </p>
                          <p className="mt-1 font-semibold text-card-foreground">
                            {plan.title}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {plan.detail}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            void removePlan(plan.id)
                          }}
                          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Your plan is empty
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add actions from sections or hero CTAs to see them here.
                  </p>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total items</span>
                  <span className="font-semibold text-foreground">{planCount}</span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    void clearPlans()
                  }}
                  className="w-full rounded-full"
                  disabled={!planCount}
                >
                  Clear plan
                </Button>
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full rounded-full"
                    onClick={() => go(hero.primaryCta)}
                  >
                    Continue
                  </Button>
                </SheetClose>
              </div>
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
                      trackPlan(hero.primaryCta, "Primary hero action", "hero")
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      trackPlan(hero.secondaryCta, "Secondary hero action", "hero")
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
              <div key={metric.label} className="rounded-lg border border-border bg-card p-5">
                <p className="text-3xl font-semibold text-card-foreground">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.label}</p>
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
                            trackPlan(item, section.title, section.eyebrow)
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
                  trackPlan(hero.secondaryCta, "Gallery section action", "gallery")
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
                    trackPlan(hero.primaryCta, "Closing CTA action", "footer")
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
