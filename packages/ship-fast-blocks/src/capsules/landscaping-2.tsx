import { useState } from "react"
import { number, string, table } from "@ship-fast/lakebed/server"
import { z } from "zod/v4"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "#/components/ui/sheet.tsx"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { defineCapsule } from "./openui.ts"

const formatLeadDate = (value: string | number | undefined | null) => {
  if (!value) return "Recent"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recent"

  return date.toLocaleDateString()
}

export const LandscapingKimiPage2 = defineCapsule({
  name: "LandscapingKimiPage2",
  description:
    "Landscaping second style sibling to LandscapingKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
        email: string(),
        phone: string(),
        service: string(),
        notes: string(),
        areaSqFt: number(),
      }),
    },
    queries: {
      leads: ({ db }) => db.leads.orderBy("createdAt").all(),
    },
    mutations: {
      addLead: (
        { db },
        name: string,
        email: string,
        phone: string,
        service: string,
        notes: string,
        areaSqFt: number,
      ) => {
        db.leads.insert({
          name,
          email,
          phone,
          service,
          notes,
          areaSqFt,
        })

        return db.leads.orderBy("createdAt").all()
      },
      removeLead: ({ db }, id: string) => {
        db.leads.delete(id)
        return db.leads.all()
      },
      clearLeads: ({ db }) => {
        const leads = db.leads.all()
        for (const lead of leads) {
          db.leads.delete(lead.id)
        }
        return db.leads.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [leadDrawerOpen, setLeadDrawerOpen] = useState(false)
    const [leadName, setLeadName] = useState("")
    const [leadEmail, setLeadEmail] = useState("")
    const [leadPhone, setLeadPhone] = useState("")
    const [leadService, setLeadService] = useState("")
    const [leadNotes, setLeadNotes] = useState("")
    const [leadAreaSqFt, setLeadAreaSqFt] = useState("")

    const brand = props.brand ?? "Verdant Edge Landscaping"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Services",
          "Portfolio",
          "Process",
          "Pricing",
          "FAQ",
          "Get a Free Quote",
        ]
    const hero = {
      eyebrow: "Landscaping / Variant 2",
      title: "Transform Your Yard Into a Living Masterpiece",
      description:
        "Verdant Edge Landscaping | Portland Landscape Design, Lawn Care & Hardscaping Verdant Edge Services Portfolio Process Pricing FAQ Get a Free Quote Portland's trusted landscapers...",
      primaryCta: "Verdant Edge",
      secondaryCta: "Services",
      imageAlt:
        "Lush residential backyard garden with a curved stone walkway, vibrant flowering perennials, and mature shade trees designed by professional landscapers",
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
            title: "Why Verdant Edge?",
            body:
              "Verdant Edge Landscaping | Portland Landscape Design, Lawn Care & Hardscaping Verdant Edge Services Portfolio Process Pricing FAQ Get a Free Quote Portland's trusted landscapers...",
            items: [
              "Recent Projects",
              "Simple, Transparent Pricing",
              "What Our Clients Say",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Our Services",
            body:
              "Landscaping page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Frequently Asked Questions",
              "Ready to Reimagine Your Landscape?",
              "Native Plant Expertise",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Our Process",
            body:
              "Landscaping page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Year-Round Maintenance",
              "Custom Hardscaping",
              "Smart Irrigation",
            ],
          },
          {
            eyebrow: "Next steps",
            title: "Recent Projects",
            body:
              "Landscaping page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Eco-Friendly Practices",
              "Satisfaction Guaranteed",
              "Lawn Care & Maintenance",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Our Services",
            alt: "Lush residential backyard garden with a curved stone walkway, vibrant flowering perennials, and mature shade trees designed by professional landscapers",
            caption: "Landscaping generated page detail",
          },
          {
            title: "Our Process",
            alt: "Freshly mowed emerald lawn with neat edging and vibrant green grass in a residential front yard",
            caption: "Landscaping generated page detail",
          },
          {
            title: "Recent Projects",
            alt: "Curved garden pathway bordered by colorful flowering perennials and lush hostas in a professionally designed backyard",
            caption: "Landscaping generated page detail",
          },
        ]

    const auth = lakebed.useAuth()
    const addLead = lakebed.useMutation("addLead")
    const removeLead = lakebed.useMutation("removeLead")
    const clearLeads = lakebed.useMutation("clearLeads")
    const storedLeads = lakebed.useQuery("leads")
    const displayLeads = storedLeads ?? []
    const totalLeads = displayLeads.length

    const serviceDefaults = [
      "Landscape Design",
      "Lawn Care",
      "Hardscaping",
      "Irrigation Setup",
      "Tree & Shrub Care",
    ]
    const serviceCandidates = displayLeads
      .map((lead) => lead.service?.trim())
      .filter((service) => Boolean(service)) as string[]
    const leadServiceOptions =
      serviceCandidates.length > 0
        ? [...new Set(serviceCandidates)]
        : serviceDefaults

    const selectedLeadService = leadService || leadServiceOptions[0] || ""

    const authIsSignedIn = auth.isAuthenticated && !auth.isGuest
    const authLabel = auth.isLoading
      ? "Checking..."
      : authIsSignedIn
        ? auth.displayName || auth.email || "Account"
        : "Sign in"

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const openLeadDrawer = () => {
      setLeadName((prev) => prev.trimStart())
      if (!leadService) {
        setLeadService(leadServiceOptions[0] ?? "")
      }
      setLeadDrawerOpen(true)
    }

    const resetLeadInputs = () => {
      setLeadName("")
      setLeadEmail("")
      setLeadPhone("")
      setLeadService(leadServiceOptions[0] || "")
      setLeadNotes("")
      setLeadAreaSqFt("")
    }

    const isQuoteNavItem = (label: string) =>
      label.toLowerCase().includes("quote")

    const handleLeadSubmit = (event: { preventDefault: () => void }) => {
      event.preventDefault()
      if (!leadName.trim() || !leadEmail.trim() || !selectedLeadService) return

      const parsedArea = Number.parseFloat(leadAreaSqFt.replace(",", ""))
      const areaSqFt = Number.isFinite(parsedArea) ? parsedArea : 0

      void addLead(
        leadName.trim(),
        leadEmail.trim(),
        leadPhone.trim(),
        selectedLeadService.trim(),
        leadNotes.trim(),
        areaSqFt,
      )

      resetLeadInputs()
      setLeadDrawerOpen(true)
    }

    const navNodes = nav.map((item) => {
      if (isQuoteNavItem(item)) {
        return (
          <SheetTrigger key={item} asChild>
            <button
              type="button"
              onClick={openLeadDrawer}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="inline-flex items-center gap-2">
                {item}
                {totalLeads > 0 ? (
                  <span className="grid size-5 place-items-center rounded-full bg-secondary px-1 text-xs text-secondary-foreground">
                    {totalLeads}
                  </span>
                ) : null}
              </span>
            </button>
          </SheetTrigger>
        )
      }

      return (
        <button
          key={item}
          type="button"
          onClick={() => go(item)}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {item}
        </button>
      )
    })

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <Sheet open={leadDrawerOpen} onOpenChange={setLeadDrawerOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <SheetTitle>Request a Landscape Quote</SheetTitle>
                  <SheetDescription>
                    Save quote requests for follow-up and review your latest service inquiries.
                  </SheetDescription>
                </div>
                {totalLeads > 0 ? (
                  <span className="inline-flex rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                    {totalLeads}
                  </span>
                ) : null}
              </div>
            </SheetHeader>

            <div className="space-y-6 overflow-y-auto px-6 py-5">
              {auth.isLoading ? (
                <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Checking auth status...
                </p>
              ) : authIsSignedIn ? (
                <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="font-semibold text-foreground">{authLabel}</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-2 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {authLabel}
                </button>
              )}

              <form className="space-y-3" onSubmit={handleLeadSubmit}>
                <div>
                  <label htmlFor="landscape-lead-name" className="mb-1 block text-sm text-muted-foreground">
                    Name
                  </label>
                  <input
                    id="landscape-lead-name"
                    value={leadName}
                    onChange={(event) => setLeadName(event.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="landscape-lead-email"
                    className="mb-1 block text-sm text-muted-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="landscape-lead-email"
                    type="email"
                    value={leadEmail}
                    onChange={(event) => setLeadEmail(event.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="landscape-lead-phone"
                    className="mb-1 block text-sm text-muted-foreground"
                  >
                    Phone
                  </label>
                  <input
                    id="landscape-lead-phone"
                    type="tel"
                    value={leadPhone}
                    onChange={(event) => setLeadPhone(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div>
                  <label
                    htmlFor="landscape-lead-service"
                    className="mb-1 block text-sm text-muted-foreground"
                  >
                    Service
                  </label>
                  <select
                    id="landscape-lead-service"
                    value={selectedLeadService}
                    onChange={(event) => setLeadService(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {leadServiceOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="landscape-lead-area"
                    className="mb-1 block text-sm text-muted-foreground"
                  >
                    Property size (sq ft)
                  </label>
                  <input
                    id="landscape-lead-area"
                    value={leadAreaSqFt}
                    onChange={(event) => setLeadAreaSqFt(event.target.value)}
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label
                    htmlFor="landscape-lead-notes"
                    className="mb-1 block text-sm text-muted-foreground"
                  >
                    Project notes
                  </label>
                  <textarea
                    id="landscape-lead-notes"
                    value={leadNotes}
                    onChange={(event) => setLeadNotes(event.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Any priorities, constraints, or timeline preferences."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Save request
                </button>
              </form>

              <section>
                <p className="mb-3 text-sm font-medium text-primary">Saved quote requests</p>
                {displayLeads.length ? (
                  <div className="space-y-3">
                    {displayLeads.map((lead) => (
                      <article
                        key={lead.id}
                        className="rounded-lg border border-border bg-card px-3 py-3"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {lead.service} · {lead.email}
                            </p>
                            {lead.phone ? (
                              <p className="text-xs text-muted-foreground">{lead.phone}</p>
                            ) : null}
                            {lead.areaSqFt > 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Property size: {lead.areaSqFt} sq ft
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              void removeLead(lead.id)
                            }}
                            className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            Remove
                          </button>
                        </div>
                        {lead.notes ? (
                          <p className="text-xs leading-5 text-muted-foreground">
                            {lead.notes}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Added {formatLeadDate(lead.createdAt)}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
                    No request saved yet.
                  </p>
                )}
              </section>
            </div>

            <SheetFooter className="border-t border-border px-6 py-4">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total requests</span>
                  <span className="font-semibold text-foreground">{totalLeads}</span>
                </div>
                <div className="grid gap-2">
                  <button
                    type="button"
                    disabled={!displayLeads.length}
                    onClick={() => {
                      void clearLeads()
                    }}
                    className="w-full rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear all requests
                  </button>
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                    >
                      Continue browsing
                    </button>
                  </SheetClose>
                </div>
              </div>
            </SheetFooter>
          </SheetContent>

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
                {navNodes}
              </nav>
              <button
                type="button"
                onClick={openLeadDrawer}
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
                      onClick={openLeadDrawer}
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
                  <p className="text-3xl font-semibold text-card-foreground">{metric.value}</p>
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
                    onClick={openLeadDrawer}
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
        </Sheet>
      </div>
    )
  },
})
