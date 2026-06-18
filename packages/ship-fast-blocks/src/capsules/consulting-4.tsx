import { useState, type FormEvent } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
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

export const ConsultingKimiPage4 = defineCapsule({
  name: "ConsultingKimiPage4",
  description:
    "Consulting fourth style sibling to ConsultingKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      inquiries: table({
        name: string(),
        email: string(),
        company: string(),
        service: string(),
        message: string(),
        touches: number(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy("createdAt").all(),
    },
    mutations: {
      submitInquiry: (
        { db },
        name: string,
        email: string,
        company: string,
        service: string,
        message: string,
        touches: number,
      ) => {
        db.inquiries.insert({
          name,
          email,
          company,
          service,
          message,
          touches,
        })

        return db.inquiries.all()
      },
      removeInquiry: ({ db }, id: string) => {
        db.inquiries.delete(id)

        return db.inquiries.all()
      },
      clearInquiries: ({ db }) => {
        for (const inquiry of db.inquiries.all()) {
          db.inquiries.delete(inquiry.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [consultationDrawerOpen, setConsultationDrawerOpen] = useState(false)
    const [inquiryName, setInquiryName] = useState("")
    const [inquiryEmail, setInquiryEmail] = useState("")
    const [inquiryCompany, setInquiryCompany] = useState("")
    const [inquiryService, setInquiryService] = useState("")
    const [inquiryMessage, setInquiryMessage] = useState("")
    const [inquiryFormError, setInquiryFormError] = useState<string | null>(null)

    const brand = props.brand ?? "Meridian Consulting Partners"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Services",
          "Insights",
          "Approach",
          "Contact",
          "Meridian",
          "Get in Touch",
        ]
    const hero = {
      eyebrow: "Consulting / Variant 4",
      title: "Clarity in Complexity. Strategy that Endures.",
      description:
        "Meridian Consulting Partners | Strategy & Management Advisory Meridian Services Insights Approach Contact Get in Touch Services Insights Approach Contact Global Management Advis...",
      primaryCta: "Meridian",
      secondaryCta: "Services",
      imageAlt: "Modern glass skyscrapers reflecting sunrise clouds",
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
            title: "Capabilities built for decisive leaders",
            body: "Meridian Consulting Partners | Strategy & Management Advisory Meridian Services Insights Approach Contact Get in Touch Services Insights Approach Contact Global Management Advis...",
            items: [
              "Transparent investment structures",
              "What leaders say about Meridian",
              "Common questions",
            ],
          },
          {
            eyebrow: "Experience",
            title: "A proven methodology for lasting impact",
            body: "Consulting page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready to change trajectory?",
              "Strategic Transformation",
              "Operational Excellence",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Perspectives that move markets",
            body: "Consulting page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["M&A Advisory", "Digital Innovation", "Leadership & Change"],
          },
          {
            eyebrow: "Next steps",
            title: "Transparent investment structures",
            body: "Consulting page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Market Expansion",
              "Discover",
              "The Consolidation Wave in European Fintech",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "A proven methodology for lasting impact",
            alt: "Modern glass skyscrapers reflecting sunrise clouds",
            caption: "Consulting generated page detail",
          },
          {
            title: "Perspectives that move markets",
            alt: "Executive team reviewing financial charts on a large screen during a board meeting",
            caption: "Consulting generated page detail",
          },
          {
            title: "Transparent investment structures",
            alt: "Diverse professionals collaborating around a laptop in a modern glass office",
            caption: "Consulting generated page detail",
          },
        ]

    const storedInquiries = lakebed.useQuery("inquiries")
    const submitInquiry = lakebed.useMutation("submitInquiry")
    const removeInquiry = lakebed.useMutation("removeInquiry")
    const clearInquiries = lakebed.useMutation("clearInquiries")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Client"

    const inquiries = storedInquiries ?? []
    const inquiryCount = inquiries.length
    const inquiryTouchScore = inquiries.reduce(
      (total, inquiry) => total + inquiry.touches,
      0,
    )

    const openConsultationDrawer = (service?: string) => {
      if (!inquiryName && authDisplayName) setInquiryName(authDisplayName)
      if (!inquiryEmail && authEmail) setInquiryEmail(authEmail)
      setInquiryService(service?.trim() || "General inquiry")
      setInquiryFormError(null)
      setConsultationDrawerOpen(true)
    }

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const handleInquirySubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const nextName = inquiryName.trim() || authDisplayName
      const nextEmail = inquiryEmail.trim() || authEmail || ""
      const nextCompany = inquiryCompany.trim()
      const nextService = inquiryService.trim() || "General inquiry"
      const nextMessage = inquiryMessage.trim()

      if (!nextName || !nextEmail || !nextMessage) {
        setInquiryFormError("Name, email, and message are required.")
        return
      }

      const touches = Math.max(1, Math.min(5, Math.ceil(nextMessage.length / 160)))
      setInquiryFormError(null)
      void submitInquiry(
        nextName,
        nextEmail,
        nextCompany,
        nextService,
        nextMessage,
        touches,
      )

      setInquiryMessage("")
      setInquiryCompany("")
      setInquiryService("General inquiry")
    }

    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? "Client account"
        : "Sign in with Google"

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
                openConsultationDrawer(hero.primaryCta)
                go(hero.primaryCta)
              }}
              className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
              {inquiryCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {inquiryCount}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        <Sheet
          open={consultationDrawerOpen}
          onOpenChange={setConsultationDrawerOpen}
        >
          <SheetContent side="right" className="w-full gap-0 border-l border-border p-0 sm:max-w-lg">
            <SheetHeader className="border-b border-border px-6 py-5">
              <SheetTitle>Consultation requests</SheetTitle>
              <SheetDescription>
                Capture and review inquiry details for follow-up work.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                {auth.isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Checking sign-in status…
                  </p>
                ) : isSignedIn ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      {authDisplayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {authEmail ?? "Signed in to this session"}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleSignOut}
                      className="h-8 rounded-full"
                    >
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="rounded-full"
                  >
                    {authLabel}
                  </Button>
                )}
              </div>

              <form className="space-y-4" onSubmit={handleInquirySubmit}>
                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="consult-name"
                  >
                    Name
                  </label>
                  <input
                    id="consult-name"
                    type="text"
                    value={inquiryName}
                    onChange={(event) => setInquiryName(event.target.value)}
                    placeholder="Your name"
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-offset-2 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="consult-email"
                  >
                    Email
                  </label>
                  <input
                    id="consult-email"
                    type="email"
                    value={inquiryEmail}
                    onChange={(event) => setInquiryEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-offset-2 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="consult-company"
                  >
                    Company
                  </label>
                  <input
                    id="consult-company"
                    type="text"
                    value={inquiryCompany}
                    onChange={(event) => setInquiryCompany(event.target.value)}
                    placeholder="Company name (optional)"
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-offset-2 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="consult-service"
                  >
                    Service of interest
                  </label>
                  <input
                    id="consult-service"
                    type="text"
                    value={inquiryService}
                    onChange={(event) => setInquiryService(event.target.value)}
                    placeholder="Service or topic"
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-offset-2 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="consult-message"
                  >
                    Message
                  </label>
                  <textarea
                    id="consult-message"
                    rows={4}
                    value={inquiryMessage}
                    onChange={(event) => setInquiryMessage(event.target.value)}
                    placeholder="Share your goals and timeline."
                    className="min-h-[6.5rem] rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-offset-2 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {inquiryFormError ? (
                  <p className="text-sm text-destructive">{inquiryFormError}</p>
                ) : null}

                <Button type="submit" className="w-full">
                  Save request
                </Button>
              </form>

              <section className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Recent requests ({inquiryCount})
                </p>
                {inquiries.length ? (
                  <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                    {inquiries.map((inquiry) => (
                      <article
                        key={inquiry.id}
                        className="rounded-md border border-border bg-background p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {inquiry.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {inquiry.email}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Service: {inquiry.service}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void removeInquiry(inquiry.id)}
                            className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {inquiry.message}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    No requests yet. Save one to get started.
                  </p>
                )}
              </section>
            </div>

            <SheetFooter className="border-t border-border px-6 py-4">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total requests</span>
                  <span className="font-semibold text-foreground">
                    {inquiryCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Priority score</span>
                  <span className="font-semibold text-foreground">
                    {inquiryTouchScore}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      void clearInquiries()
                    }}
                    disabled={!inquiryCount}
                  >
                    Clear all
                  </Button>
                  <SheetClose asChild>
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </SheetClose>
                </div>
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
                      openConsultationDrawer(hero.primaryCta)
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openConsultationDrawer(hero.secondaryCta)
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
                onClick={() => {
                  openConsultationDrawer(hero.secondaryCta)
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
                    openConsultationDrawer(hero.primaryCta)
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
