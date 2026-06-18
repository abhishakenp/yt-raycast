import { useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
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
  SheetTrigger,
} from "#/components/ui/sheet.tsx"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount)

export const CrowdfundingKimiPage2 = defineCapsule({
  name: "CrowdfundingKimiPage2",
  description:
    "Crowdfunding second style sibling to CrowdfundingKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      supportEntries: table({
        reward: string(),
        source: string(),
        amount: number(),
        note: string(),
      }),
    },
    queries: {
      supportEntries: ({ db }) => db.supportEntries.orderBy("createdAt").all(),
    },
    mutations: {
      addSupportEntry: (
        { db },
        reward: string,
        source: string,
        amount: number,
        note: string,
      ) => {
        db.supportEntries.insert({
          reward,
          source,
          amount,
          note,
        })

        return db.supportEntries.all()
      },
      removeSupportEntry: ({ db }, id: string) => {
        const entry = db.supportEntries.get(id)
        if (entry) {
          db.supportEntries.delete(id)
        }

        return db.supportEntries.all()
      },
      clearSupportEntries: ({ db }) => {
        for (const entry of db.supportEntries.all()) {
          db.supportEntries.delete(entry.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [supportDrawerOpen, setSupportDrawerOpen] = useState(false)

    const brand = props.brand ?? "FLUX Go The Pocket Espresso Machine"
    const nav = props.nav?.length
      ? props.nav
      : ["Story", "Features", "Gallery", "Rewards", "FAQ", "Back This Project"]
    const hero = {
      eyebrow: "Crowdfunding / Variant 2",
      title: "Cafe-Quality Espresso. Anywhere.",
      description:
        "FLUX Go The Pocket Espresso Machine | Crowdfunding Campaign FLUX Story Features Gallery Rewards FAQ Back This Project Live on Kickstarter Cafe-Quality Espresso. Anywhere. FLUX G...",
      primaryCta: "Watch the Film",
      secondaryCta: "500 / 500 Claimed",
      imageAlt:
        "Aerial view of coffee being poured into a ceramic cup on a wooden table with morning sunlight",
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            "value": "24/7",
            "label": "Responsive service",
          },
          {
            "value": "98%",
            "label": "Positive outcomes",
          },
          {
            "value": "4.9",
            "label": "Average rating",
          },
          {
            "value": "12+",
            "label": "Core capabilities",
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            "eyebrow": "Overview",
            "title": "Born from a Bad Cup of Coffee at 10,000 Feet",
            "body": "FLUX Go The Pocket Espresso Machine | Crowdfunding Campaign FLUX Story Features Gallery Rewards FAQ Back This Project Live on Kickstarter Cafe-Quality Espresso. Anywhere. FLUX G...",
            "items": [
              "Choose Your Tier",
              "Loved by Early Backers",
              "Questions? Answered.",
            ],
          },
          {
            "eyebrow": "Experience",
            "title": "Engineering That Fits in Your Pocket",
            "body": "Crowdfunding page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Do not Miss Your Chance. Back FLUX Go Today.",
              "The Problem",
              "The Solution",
            ],
          },
          {
            "eyebrow": "Proof",
            "title": "See FLUX Go in Action",
            "body": "Crowdfunding page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Built for the Planet, Too",
              "15-Bar Pressure Pump",
              "90-Second Heat-Up",
            ],
          },
          {
            "eyebrow": "Next steps",
            "title": "Choose Your Tier",
            "body": "Crowdfunding page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "USB-C Rechargeable",
              "50 Shots Per Charge",
              "IPX6 Waterproof",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            "title": "Engineering That Fits in Your Pocket",
            "alt": "Aerial view of coffee being poured into a ceramic cup on a wooden table with morning sunlight",
            "caption": "Crowdfunding generated page detail",
          },
          {
            "title": "See FLUX Go in Action",
            "alt": "A camper sitting beside a tent on a mountain ridge at sunrise holding a metal mug",
            "caption": "Crowdfunding generated page detail",
          },
          {
            "title": "Choose Your Tier",
            "alt": "Close-up of stainless steel espresso machine portafilter with fresh ground coffee",
            "caption": "Crowdfunding generated page detail",
          },
        ]

    const storedSupportEntries = lakebed.useQuery("supportEntries")
    const addSupportEntry = lakebed.useMutation("addSupportEntry")
    const removeSupportEntry = lakebed.useMutation("removeSupportEntry")
    const clearSupportEntries = lakebed.useMutation("clearSupportEntries")
    const auth = lakebed.useAuth()
    const supportEntries = storedSupportEntries?.length ? storedSupportEntries : []
    const supportCount = supportEntries.length
    const supportTotal = supportEntries.reduce(
      (total, entry) => total + entry.amount,
      0,
    )
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Supporter"
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
    const openSupportDrawer = (
      reward: string,
      source: string,
      amount = 0,
    ) => {
      void addSupportEntry(reward, source, amount, `${source}: ${reward}`)
      setSupportDrawerOpen(true)
      go(reward)
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
            <Sheet
              open={supportDrawerOpen}
              onOpenChange={setSupportDrawerOpen}
            >
              <SheetTrigger asChild>
                <button
                  type="button"
                  onClick={() =>
                    openSupportDrawer(hero.primaryCta, "Header support CTA", 29)
                  }
                  className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {hero.primaryCta}
                  {supportCount > 0 ? (
                    <span className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-background px-1.5 py-0.5 text-xs font-semibold leading-none text-foreground ring-1 ring-primary">
                      {supportCount > 99 ? "99+" : supportCount}
                    </span>
                  ) : null}
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full gap-0 p-0 sm:max-w-md"
              >
                <SheetHeader className="border-b border-border p-6">
                  <SheetTitle className="text-xl">Backer actions</SheetTitle>
                  <SheetDescription>
                    {authEmail
                      ? `Backer notes are synced to ${isSignedIn ? "your account" : "this session"} for ${authEmail}.`
                      : "Backer notes are stored for this session until you sign in."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {supportCount > 0 ? (
                    <div className="space-y-4">
                      {supportEntries.map((entry) => (
                        <article
                          key={entry.id}
                          className="rounded-lg border border-border bg-card p-4"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-foreground">
                                {entry.reward}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {entry.source}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeSupportEntry(entry.id)}
                              className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                          {entry.amount > 0 ? (
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(entry.amount)}
                            </p>
                          ) : null}
                          {entry.note ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {entry.note}
                            </p>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        No support entries yet
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Use any CTA to save your first campaign action.
                      </p>
                    </div>
                  )}
                </div>
                <SheetFooter className="border-t border-border p-6">
                  <div className="mb-3 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total actions</span>
                      <span>{supportCount}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated pledged</span>
                      <span>{formatCurrency(supportTotal)}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => void clearSupportEntries()}
                      disabled={supportCount === 0}
                    >
                      Clear all actions
                    </Button>
                    {isSignedIn ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                        onClick={handleSignOut}
                      >
                        Sign out
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                        onClick={handleSignIn}
                        disabled={auth.isLoading}
                      >
                        {authLabel}
                      </Button>
                    )}
                  </div>
                  <SheetClose asChild>
                    <Button
                      type="button"
                      className="w-full rounded-full"
                    >
                      Continue
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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
                    onClick={() =>
                      openSupportDrawer(
                        hero.primaryCta,
                        "Hero primary CTA",
                        49,
                      )
                    }
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openSupportDrawer(
                        hero.secondaryCta,
                        "Hero secondary CTA",
                        79,
                      )
                    }
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
                                  onClick={() =>
                                    openSupportDrawer(item, section.title, 0)
                                  }
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
                onClick={() =>
                  openSupportDrawer(
                    hero.secondaryCta,
                    "Gallery section CTA",
                    0,
                  )
                }
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
                  onClick={() =>
                    openSupportDrawer(hero.primaryCta, "Final CTA", 129)
                  }
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
