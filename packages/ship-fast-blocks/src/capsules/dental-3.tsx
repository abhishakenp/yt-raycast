import { useState } from "react"
import { string, table } from "@ship-fast/lakebed/server"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
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

export const DentalKimiPage3 = defineCapsule({
  name: "DentalKimiPage3",
  description:
    "Dental third style sibling to DentalKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      consultations: table({
        service: string(),
        status: string(),
        note: string(),
      }),
    },
    queries: {
      consultations: ({ db }) => db.consultations.orderBy("createdAt").all(),
    },
    mutations: {
      requestConsultation: ({ db }, service: string) => {
        const normalizedService = service.trim()
        if (!normalizedService) return db.consultations.all()

        db.consultations.insert({
          service: normalizedService,
          status: "Pending",
          note: "",
        })

        return db.consultations.all()
      },
      completeConsultation: ({ db }, consultationId: string) => {
        const consultation = db.consultations.get(consultationId)
        if (!consultation) return db.consultations.all()

        const nextStatus = consultation.status === "Completed" ? "Pending" : "Completed"
        db.consultations.update(consultationId, { status: nextStatus })
        return db.consultations.all()
      },
      cancelConsultation: ({ db }, consultationId: string) => {
        db.consultations.delete(consultationId)
        return db.consultations.all()
      },
      clearConsultations: ({ db }) => {
        for (const consultation of db.consultations.all()) {
          db.consultations.delete(consultation.id)
        }

        return db.consultations.all()
      },
      updateConsultationNote: ({ db }, consultationId: string, note: string) => {
        const consultation = db.consultations.get(consultationId)
        if (!consultation) return db.consultations.all()

        db.consultations.update(consultationId, { note })
        return db.consultations.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedConsultation, setSelectedConsultation] = useState("")
    const brand = props.brand ?? "Apex Dental Arts Premium Dental Care in Seattle"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Apex Dental Arts",
          "Services",
          "Team",
          "Pricing",
          "FAQ",
          "(206) 555-0142",
        ]
    const hero = {
      eyebrow: "Dental / Variant 3",
      title: "Where Art Meets Dentistry",
      description:
        "Apex Dental Arts Premium Dental Care in Seattle Apex Dental Arts Services Team Pricing FAQ (206) 555-0142 Book Online Services Team Pricing FAQ Book Appointment Now accepting ne...",
      primaryCta: "Apex Dental Arts",
      secondaryCta: "Services",
      imageAlt:
        "Bright modern dental treatment room with ergonomic chair and natural lighting",
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
            title: "Comprehensive Services, Studio Quality",
            body: "Apex Dental Arts Premium Dental Care in Seattle Apex Dental Arts Services Team Pricing FAQ (206) 555-0142 Book Online Services Team Pricing FAQ Book Appointment Now accepting ne...",
            items: [
              "Transparent Pricing",
              "Meet Your Care Team",
              "Patient Stories",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Your Journey to a Radiant Smile",
            body: "Dental page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Frequently Asked Questions",
              "Ready for Your Best Smile ?",
              "Cosmetic Dentistry",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Inside the Studio",
            body: "Dental page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Dental Implants", "Invisalign Clear Aligners", "Teeth Whitening"],
          },
          {
            eyebrow: "Next steps",
            title: "Transparent Pricing",
            body: "Dental page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Emergency Dentistry",
              "Preventive Care",
              "Book Online or Call",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Your Journey to a Radiant Smile",
            alt: "Bright modern dental treatment room with ergonomic chair and natural lighting",
            caption: "Dental generated page detail",
          },
          {
            title: "Inside the Studio",
            alt: "Professional headshot of Dr. Elena Vasquez smiling in white coat",
            caption: "Dental generated page detail",
          },
          {
            title: "Transparent Pricing",
            alt: "Spacious modern dental reception with warm wood tones and indoor plants",
            caption: "Dental generated page detail",
          },
        ]

    const consultations = lakebed.useQuery("consultations")
    const requestConsultation = lakebed.useMutation("requestConsultation")
    const completeConsultation = lakebed.useMutation("completeConsultation")
    const cancelConsultation = lakebed.useMutation("cancelConsultation")
    const clearConsultations = lakebed.useMutation("clearConsultations")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? "Sign out"
        : "Sign in"
    const pendingCount = (consultations ?? []).filter(
      (consultation) => consultation.status === "Pending",
    ).length
    const completedCount = (consultations ?? []).filter(
      (consultation) => consultation.status === "Completed",
    ).length
    const consultationTotal = (consultations ?? []).length

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const openConsultationDrawer = (service: string) => {
      const normalizedService = service.trim() || "General Consultation"
      setSelectedConsultation(normalizedService)
      void requestConsultation(normalizedService)
      setDrawerOpen(true)
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
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  openConsultationDrawer(hero.primaryCta)
                  go(hero.primaryCta)
                }}
                className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
                {consultationTotal > 0 ? (
                  <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-card px-0.5 text-xs font-bold text-card-foreground">
                    {consultationTotal}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={isSignedIn ? handleSignOut : handleSignIn}
                disabled={auth.isLoading}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {authLabel}
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
                            openConsultationDrawer(item)
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
                    openConsultationDrawer("Book Appointment")
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

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Dental Consultation Requests</SheetTitle>
              <SheetDescription>
                Review saved consultation requests and update their status.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <p>
                  Last request:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedConsultation || "Start by selecting a service above"}
                  </span>
                </p>
                <p className="mt-2">
                  Pending: {pendingCount} · Completed: {completedCount}
                </p>
              </div>

              {consultationTotal > 0 ? (
                <div className="space-y-4">
                  {consultations?.map((consultation, index) => (
                    <article
                      key={consultation.id}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <p className="text-sm text-muted-foreground">#{index + 1}</p>
                      <h3 className="text-base font-semibold text-card-foreground">
                        {consultation.service}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Status: {consultation.status}
                      </p>
                      <div className="mt-4 grid gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            void completeConsultation(consultation.id)
                          }
                        >
                          {consultation.status === "Completed"
                            ? "Reopen request"
                            : "Mark complete"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          onClick={() => void cancelConsultation(consultation.id)}
                        >
                          Cancel request
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                  No consultations yet. Use the page actions to add one.
                </p>
              )}
            </div>

            <SheetFooter className="grid gap-2 px-6 pb-6">
              <Button
                type="button"
                onClick={() => go("Contact")}
                className="w-full"
              >
                Open contact flow
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void clearConsultations()}
                disabled={consultationTotal === 0}
              >
                Clear all requests
              </Button>
              <SheetClose asChild>
                <Button type="button" className="w-full" variant="secondary">
                  Continue browsing
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
