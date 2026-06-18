import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { Button } from "#/components/ui/button.tsx"
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

export const CorporateKimiPage3 = defineCapsule({
  name: "CorporateKimiPage3",
  description:
    "Corporate third style sibling to CorporateKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      leads: table({
        source: string(),
        title: string(),
        count: number(),
      }),
    },
    queries: {
      leads: ({ db }) => db.leads.orderBy("createdAt").all(),
    },
    mutations: {
      addLead: ({ db }, title: string, source: string) => {
        const nextTitle = title.trim()
        if (!nextTitle) {
          return db.leads.all()
        }

        const nextSource = source.trim() || "Page Interest"
        const existingLead = db.leads.where("title", nextTitle).all()[0]

        if (existingLead) {
          db.leads.update(existingLead.id, {
            source: nextSource,
            count: existingLead.count + 1,
          })
          return db.leads.all()
        }

        db.leads.insert({
          title: nextTitle,
          source: nextSource,
          count: 1,
        })
        return db.leads.all()
      },
      removeLead: ({ db }, id: string) => {
        const lead = db.leads.get(id)
        if (lead) {
          db.leads.delete(lead.id)
        }

        return db.leads.all()
      },
      clearLeads: ({ db }) => {
        for (const lead of db.leads.all()) {
          db.leads.delete(lead.id)
        }
        return db.leads.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [leadDrawerOpen, setLeadDrawerOpen] = useState(false)
    const brand = props.brand ?? "Vertex Systems Enterprise Cloud Infrastructure"
    const nav = props.nav?.length ? props.nav : ["Vertex Systems", "Solutions", "Customers", "Pricing", "Investors", "Company"]
    const hero = {
      eyebrow: "Corporate / Variant 3",
      title: "Infrastructure that scales with trust",
      description: "Vertex Systems Enterprise Cloud Infrastructure Vertex Systems Solutions Customers Pricing Investors Company Sign in Get started Vertex Series B $180M raised Infrastructure that...",
      primaryCta: "Vertex Systems",
      secondaryCta: "Solutions",
      imageAlt: "Dark themed enterprise analytics dashboard showing real-time infrastructure monitoring charts and data visualizations",
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
            title: "Built for enterprise complexity",
            body: "Vertex Systems Enterprise Cloud Infrastructure Vertex Systems Solutions Customers Pricing Investors Company Sign in Get started Vertex Series B $180M raised Infrastructure that...",
            items: [
              "Predictable pricing at any scale",
              "Trusted by teams building the future",
              "Common questions",
            ],
          },
          {
            eyebrow: "Experience",
            title: "From zero to production in hours",
            body: "Corporate page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready to modernize your infrastructure?",
              "Global Edge Compute",
              "Zero-Trust Security",
            ],
          },
          {
            eyebrow: "Proof",
            title: "The command center for modern infrastructure",
            body: "Corporate page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Real-Time Observability",
              "Governance & Compliance",
              "Multi-Region Databases",
            ],
          },
          {
            eyebrow: "Next steps",
            title: "Predictable pricing at any scale",
            body: "Corporate page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "API-First Architecture",
              "Provision your organization",
              "Design your architecture",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "From zero to production in hours",
            alt: "Dark themed enterprise analytics dashboard showing real-time infrastructure monitoring charts and data visualizations",
            caption: "Corporate generated page detail",
          },
          {
            title: "The command center for modern infrastructure",
            alt: "Team administrator configuring cloud organization settings in a modern SaaS dashboard",
            caption: "Corporate generated page detail",
          },
          {
            title: "Predictable pricing at any scale",
            alt: "Software engineer reviewing infrastructure architecture diagrams on multiple monitors",
            caption: "Corporate generated page detail",
          },
        ]

    const leads = lakebed.useQuery("leads") ?? []
    const addLead = lakebed.useMutation("addLead")
    const removeLead = lakebed.useMutation("removeLead")
    const clearLeads = lakebed.useMutation("clearLeads")
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
    const totalLeadSignals = leads.reduce((total, lead) => total + lead.count, 0)
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <Sheet open={leadDrawerOpen} onOpenChange={setLeadDrawerOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border px-6 py-5">
              <SheetTitle>Lead requests</SheetTitle>
              <SheetDescription>
                Capture and review the lead-intent signals for follow-up.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-4 rounded-md border border-border bg-muted/30 p-3 text-sm">
                <p className="text-foreground/80">
                  Account:
                  <span className="ml-2 font-medium text-foreground">
                    {isSignedIn ? authLabel : "Guest session"}
                  </span>
                </p>
                {isSignedIn ? (
                  <Button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-3 h-9 rounded-full"
                    size="sm"
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="mt-3 h-9 rounded-full"
                    size="sm"
                  >
                    {authLabel}
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {leads.length ? (
                  leads.map((lead) => (
                    <article key={lead.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {lead.title}
                        </p>
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                          x{lead.count}
                        </span>
                      </div>
                      <p className="mb-3 text-xs text-muted-foreground">
                        {lead.source}
                      </p>
                      <Button
                        type="button"
                        onClick={() => void removeLead(lead.id)}
                        size="sm"
                        variant="outline"
                        className="w-full rounded-full"
                      >
                        Remove
                      </Button>
                    </article>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                    No lead requests yet. Use any section action to add one.
                  </div>
                )}
              </div>
            </div>
            <SheetFooter className="border-t border-border p-5">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Unique leads: {leads.length}</p>
                <p>Total signals: {totalLeadSignals}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void clearLeads()
                    setLeadDrawerOpen(false)
                  }}
                  className="w-full rounded-full"
                  disabled={leads.length === 0}
                >
                  Clear
                </Button>
                <SheetClose asChild>
                  <Button type="button" className="w-full rounded-full">
                    Close
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

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
                  onClick={() => {
                    void addLead(item, "Top nav")
                    go(item)
                  }}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                void addLead(hero.primaryCta, "Header CTA")
                setLeadDrawerOpen(true)
                go(hero.primaryCta)
              }}
              className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
              {leads.length ? (
                <span className="absolute -right-2 -top-2 grid size-5 min-w-5 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                  {leads.length}
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
                      void addLead(hero.primaryCta, "Hero primary")
                      setLeadDrawerOpen(true)
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void addLead(hero.secondaryCta, "Hero secondary")
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
                          onClick={() => {
                            void addLead(item, section.eyebrow)
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
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Content-led page moments</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  void addLead(hero.secondaryCta, "Gallery CTA")
                  go(hero.secondaryCta)
                }}
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
                  onClick={() => {
                    void addLead("Request follow-up", "Final CTA")
                    setLeadDrawerOpen(true)
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
            <p className="text-sm text-muted-foreground">(c) {new Date().getFullYear()} {brand}. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    void addLead(item, "Footer")
                    go(item)
                  }}
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
