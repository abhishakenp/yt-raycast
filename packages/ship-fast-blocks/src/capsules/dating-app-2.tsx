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
} from "#/components/ui/sheet.tsx"

export const DatingAppKimiPage2 = defineCapsule({
  name: "DatingAppKimiPage2",
  description:
    "Dating App second style sibling to DatingAppKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      savedProfiles: table({
        name: string(),
        detail: string(),
        source: string(),
        affinity: number(),
      }),
    },
    queries: {
      savedProfiles: ({ db }) => db.savedProfiles.orderBy("createdAt").all(),
    },
    mutations: {
      saveProfile: (
        { db },
        name: string,
        detail: string,
        source: string,
        affinity: number,
      ) => {
        const normalizedName = name.trim()
        if (!normalizedName) return db.savedProfiles.all()

        const existing = db.savedProfiles
          .where("name", normalizedName)
          .all()[0]

        if (existing) {
          db.savedProfiles.update(existing.id, {
            detail,
            source,
            affinity: Math.max(existing.affinity ?? 0, affinity),
          })

          return db.savedProfiles.all()
        }

        db.savedProfiles.insert({
          name: normalizedName,
          detail,
          source,
          affinity,
        })

        return db.savedProfiles.all()
      },
      removeSavedProfile: ({ db }, id: string) => {
        for (const profile of db.savedProfiles.where("id", id).all()) {
          db.savedProfiles.delete(profile.id)
        }

        return db.savedProfiles.all()
      },
      clearSavedProfiles: ({ db }) => {
        const rows = db.savedProfiles.all()
        for (const row of rows) {
          db.savedProfiles.delete(row.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const [savedProfilesOpen, setSavedProfilesOpen] = useState(false)
    const go = useNavigate()
    const brand = props.brand ?? "Ember Dating That Feels Human"
    const nav = props.nav?.length
      ? props.nav
      : ["How it Works", "Features", "Stories", "FAQ", "ember", "Log in"]
    const hero = {
      eyebrow: "Dating App / Variant 2",
      title: "Dating that feels human.",
      description:
        "Ember Dating That Feels Human ember How it Works Features Stories FAQ Log in Get the app Dating that feels human. Real connections, zero games. Meet people who actually want to...",
      primaryCta: "ember",
      secondaryCta: "How it Works",
      imageAlt:
        "Ember app interface showing a dating profile photo of a woman hiking at sunset",
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
            title: "Built for real chemistry",
            body: "Ember Dating That Feels Human ember How it Works Features Stories FAQ Log in Get the app Dating that feels human. Real connections, zero games. Meet people who actually want to...",
            items: [
              "Simple, honest pricing",
              "Love stories that started here",
              "Questions? Answered.",
            ],
          },
          {
            eyebrow: "Experience",
            title: "How it works",
            body: "Dating App page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready to meet someone real?",
              "Profiles with depth",
              "Smart Matching",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Real dates, real places",
            body: "Dating App page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Safety First", "Real Dates", "Tell your story"],
          },
          {
            eyebrow: "Next steps",
            title: "Simple, honest pricing",
            body: "Dating App page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Discover matches", "Meet in real life", "Is Ember really free?"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "How it works",
            alt: "Ember app interface showing a dating profile photo of a woman hiking at sunset",
            caption: "Dating App generated page detail",
          },
          {
            title: "Real dates, real places",
            alt: "profile avatar of a smiling woman with dark curly hair wearing a yellow sweater",
            caption: "Dating App generated page detail",
          },
          {
            title: "Simple, honest pricing",
            alt: "couple laughing together over lattes in a cozy sunlit coffee shop",
            caption: "Dating App generated page detail",
          },
        ]

    const savedProfiles = lakebed.useQuery("savedProfiles")
    const addSavedProfile = lakebed.useMutation("saveProfile")
    const removeSavedProfile = lakebed.useMutation("removeSavedProfile")
    const clearSavedProfiles = lakebed.useMutation("clearSavedProfiles")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"

    const savedList = savedProfiles ?? []
    const hasSavedProfiles = savedList.length > 0

    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? `Signed in as ${authDisplayName}`
        : "Sign in"

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const handleNavigate = (destination: string) => {
      if (destination.toLowerCase() === "log in") {
        if (isSignedIn) {
          setSavedProfilesOpen(true)
        } else {
          void handleSignIn()
        }

        return
      }

      go(destination)
    }

    const handleSaveAndNavigate = (
      destination: string,
      detail: string,
      source: string,
    ) => {
      void addSavedProfile(destination, detail, source, 1)
      go(destination)
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
                  onClick={() => handleNavigate(item)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                setSavedProfilesOpen(true)
                go(hero.primaryCta)
              }}
              className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hasSavedProfiles ? (
                <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[0.625rem] font-bold text-background">
                  {savedList.length}
                </span>
              ) : null}
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
                      setSavedProfilesOpen(true)
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
                            setSavedProfilesOpen(true)
                            handleSaveAndNavigate(item, section.body, section.eyebrow)
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
                  setSavedProfilesOpen(true)
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
                    setSavedProfilesOpen(true)
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
                  onClick={() => handleNavigate(item)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </footer>

        <Sheet open={savedProfilesOpen} onOpenChange={setSavedProfilesOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Saved matches</SheetTitle>
              <SheetDescription>
                Quick shortlist of profiles and moments you saved while browsing.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {savedList.length ? (
                <div className="space-y-4">
                  {savedList.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-lg border border-border bg-muted/40 p-4"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.source}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {item.detail}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSavedProfilesOpen(false)
                            go(item.source)
                          }}
                          className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeSavedProfile(item.id)}
                          className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No saved matches yet
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tap any section button to save a profile moment.
                  </p>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Saved count</span>
                  <span>{savedList.length}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-foreground">
                  <span>Affinity total</span>
                  <span>
                    {savedList.reduce((total, item) => total + item.affinity, 0)}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => void clearSavedProfiles()}
                    disabled={!hasSavedProfiles}
                  >
                    Clear all
                  </Button>
                  {isSignedIn ? (
                    <Button
                      type="button"
                      className="rounded-full"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="rounded-full"
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
                    variant="secondary"
                    className="rounded-full"
                  >
                    Continue browsing
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
