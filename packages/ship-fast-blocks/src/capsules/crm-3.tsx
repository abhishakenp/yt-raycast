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

type LeadRow = {
  id?: string
  name: string
  company: string
  source: string
  status: string
  score: number
}

export const CrmKimiPage3 = defineCapsule({
  name: "CrmKimiPage3",
  description:
    "Crm third style sibling to CrmKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
        name: string(),
        company: string(),
        source: string(),
        status: string(),
        score: number(),
      }),
    },
    queries: {
      leads: ({ db }) => db.leads.orderBy("createdAt").all(),
    },
    mutations: {
      addLead: ({ db }, name: string, company: string, source: string) => {
        const cleanName = name.trim()
        const cleanCompany = company.trim() || "Guest account"
        const cleanSource = source.trim() || "Manual"

        if (!cleanName) return db.leads.all()

        db.leads.insert({
          name: cleanName,
          company: cleanCompany,
          source: cleanSource,
          status: "New",
          score: 1,
        })

        return db.leads.all()
      },
      advanceLead: ({ db }, leadId: string) => {
        const lead = db.leads.get(leadId)
        if (!lead) return db.leads.all()

        const status =
          lead.status === "New"
            ? "Qualified"
            : lead.status === "Qualified"
              ? "Proposal"
              : "Won"

        db.leads.update(leadId, {
          status,
          score: lead.status === "Won" ? lead.score : lead.score + 1,
        })

        return db.leads.all()
      },
      removeLead: ({ db }, leadId: string) => {
        db.leads.delete(leadId)
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
    const [pipelineOpen, setPipelineOpen] = useState(false)

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

    const brand = props.brand ?? "CloseFlow The CRM Built for Closing Deals"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pipeline", "Pricing", "Customers", "FAQ", "Sign in"]
    const hero = {
      eyebrow: "Crm / Variant 3",
      title: "The CRM that closes deals for you",
      description: "CloseFlow The CRM Built for Closing Deals CloseFlow Features Pipeline Pricing Customers FAQ Sign in Get started Now with AI-powered deal scoring The CRM that closes deals for yo...",
      primaryCta: "CloseFlow",
      secondaryCta: "Features",
      imageAlt: "Modern CRM dashboard interface showing sales pipeline with deal stages and analytics charts",
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            "value": "24/7",
            "label": "Responsive service"
          },
          {
            "value": "98%",
            "label": "Positive outcomes"
          },
          {
            "value": "4.9",
            "label": "Average rating"
          },
          {
            "value": "12+",
            "label": "Core capabilities"
          }
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            "eyebrow": "Overview",
            "title": "Everything you need to run your sales process",
            "body": "CloseFlow The CRM Built for Closing Deals CloseFlow Features Pipeline Pricing Customers FAQ Sign in Get started Now with AI-powered deal scoring The CRM that closes deals for yo...",
            "items": [
              "Up and running in under 10 minutes",
              "Simple pricing that scales with you",
              "Loved by revenue teams everywhere"
            ]
          },
          {
            "eyebrow": "Experience",
            "title": "See every deal. Never let one slip.",
            "body": "Crm page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Questions? We have answers.",
              "Ready to close more deals?",
              "Visual Pipeline"
            ]
          },
          {
            "eyebrow": "Proof",
            "title": "Plays nice with your entire stack",
            "body": "Crm page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "AI Deal Scoring",
              "Smart Sequences",
              "Revenue Analytics"
            ]
          },
          {
            "eyebrow": "Next steps",
            "title": "Up and running in under 10 minutes",
            "body": "Crm page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Team Collaboration",
              "Enterprise Security",
              "Import your data"
            ]
          }
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            "title": "See every deal. Never let one slip.",
            "alt": "Modern CRM dashboard interface showing sales pipeline with deal stages and analytics charts",
            "caption": "Crm generated page detail"
          },
          {
            "title": "Plays nice with your entire stack",
            "alt": "Stark Technologies company logo displayed on a monitor",
            "caption": "Crm generated page detail"
          },
          {
            "title": "Up and running in under 10 minutes",
            "alt": "Meridian Labs company logo on a modern office wall",
            "caption": "Crm generated page detail"
          }
        ]

    const storedLeads = lakebed.useQuery("leads")
    const addLead = lakebed.useMutation("addLead")
    const advanceLead = lakebed.useMutation("advanceLead")
    const removeLead = lakebed.useMutation("removeLead")
    const clearLeads = lakebed.useMutation("clearLeads")

    const seedLeads: LeadRow[] = [
      {
        name: "AI Deal Scoring",
        company: brand,
        source: "Overview",
        status: "Qualified",
        score: 6,
      },
      {
        name: "Smart Sequences",
        company: brand,
        source: "Proof",
        status: "Qualified",
        score: 5,
      },
      {
        name: "Revenue Analytics",
        company: brand,
        source: "Proof",
        status: "Proposal",
        score: 7,
      },
    ]

    const hasStoredLeads = Boolean(storedLeads && storedLeads.length > 0)
    const leads = hasStoredLeads ? storedLeads : seedLeads
    const leadCount = storedLeads?.length ?? 0
    const leadScoreTotal = (storedLeads ?? []).reduce(
      (total, lead) => total + lead.score,
      0,
    )
    const canMutateLead = (lead: LeadRow): lead is LeadRow & { id: string } =>
      typeof lead.id === "string"

    const normalizedNav = new Set(nav.map((item) => item.trim().toLowerCase()))
    const hasPipelineNavItem = normalizedNav.has("pipeline")

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }

    const handleAuthClick = () => {
      if (isSignedIn) {
        go("Account")
        return
      }

      handleSignIn()
    }

    const trackLead = (name: string, source: string) => {
      const cleanName = name.trim()
      if (!cleanName) return

      void addLead(cleanName, brand, source)
      setPipelineOpen(true)
    }

    const handlePipelineClick = (item: string) => {
      go(item)
      setPipelineOpen(true)
    }

    const handleSheetSignOut = () => {
      lakebed.signOut()
      setPipelineOpen(false)
    }

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button type="button" onClick={() => go("Home")} className="text-left text-lg font-semibold tracking-tight">
              {brand}
            </button>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => {
                const lowered = item.trim().toLowerCase()
                const isPipeline = lowered === "pipeline"
                const isSignIn = lowered === "sign in" || lowered === "signin"

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (isPipeline) {
                        handlePipelineClick(item)
                        return
                      }

                      if (isSignIn) {
                        handleAuthClick()
                        return
                      }

                      go(item)
                    }}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {isSignIn ? authLabel : item}
                    {isPipeline && leadCount > 0 ? (
                      <span className="ml-2 inline-grid size-5 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {leadCount}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </nav>
            {!hasPipelineNavItem ? (
              <button
                type="button"
                onClick={() => setPipelineOpen(true)}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Pipeline
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => go(hero.primaryCta)}
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
                    onClick={() => {
                      trackLead(hero.primaryCta, hero.title)
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      trackLead(hero.secondaryCta, "Homepage actions")
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
                            trackLead(item, section.eyebrow)
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
                  trackLead(hero.secondaryCta, "Gallery heading")
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
                    trackLead(hero.primaryCta, "Conversion block")
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

        <Sheet open={pipelineOpen} onOpenChange={setPipelineOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Lead Pipeline</SheetTitle>
              <SheetDescription>
                {leadCount > 0
                  ? `${leadCount} lead${leadCount === 1 ? "" : "s"} currently tracked in this session.`
                  : "No saved leads yet. Use page actions to capture leads into this pipeline."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {leads.length ? (
                <div className="space-y-4">
                  {leads.map((lead, index) => {
                    const id = lead.id
                    return (
                      <article
                        key={id ?? `${lead.name}-${index}`}
                        className="rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {lead.source}
                            </p>
                            <h3 className="mt-1 truncate text-sm font-bold text-foreground">{lead.name}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{lead.company}</p>
                          </div>
                          <span className="rounded-full border border-border bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">{lead.status}</span>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">Confidence score: {lead.score}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              if (!id) return
                              void advanceLead(id)
                            }}
                            disabled={!canMutateLead(lead)}
                          >
                            {lead.status === "Won" ? "Closed" : "Advance"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                              if (!id) return
                              void removeLead(id)
                            }}
                            disabled={!canMutateLead(lead)}
                          >
                            Remove
                          </Button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                  {hasStoredLeads
                    ? "No leads are currently in this pipeline."
                    : "Use the page actions to add leads to your pipeline."}
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              <div className="w-full space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pipeline score</span>
                  <span className="font-semibold text-foreground">{leadScoreTotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tracked leads</span>
                  <span className="font-semibold text-foreground">{leadCount}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                onClick={() => {
                  void clearLeads()
                }}
                disabled={!hasStoredLeads}
              >
                Clear pipeline
              </Button>
              {isSignedIn ? (
                <>
                  <Button
                    type="button"
                    className="w-full rounded-full"
                    onClick={() => {
                      setPipelineOpen(false)
                      go("Account")
                    }}
                  >
                    {authDisplayName}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={handleSheetSignOut}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  className="w-full rounded-full"
                  onClick={() => {
                    setPipelineOpen(false)
                    handleSignIn()
                  }}
                  disabled={auth.isLoading}
                >
                  {authLabel}
                </Button>
              )}
              <SheetClose asChild>
                <Button type="button" variant="secondary" className="w-full rounded-full">
                  Continue
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">(c) {new Date().getFullYear()} {brand}. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => {
                const lowered = item.trim().toLowerCase()
                const isPipeline = lowered === "pipeline"
                const isSignIn = lowered === "sign in" || lowered === "signin"

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (isPipeline) {
                        handlePipelineClick(item)
                        return
                      }
                      if (isSignIn) {
                        handleAuthClick()
                        return
                      }

                      go(item)
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {isSignIn ? authLabel : item}
                    {isPipeline && leadCount > 0 ? (
                      <span className="ml-2 inline-grid size-5 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {leadCount}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
