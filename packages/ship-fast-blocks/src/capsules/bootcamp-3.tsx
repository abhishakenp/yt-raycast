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

export const BootcampKimiPage3 = defineCapsule({
  name: "BootcampKimiPage3",
  description:
    "Bootcamp third style sibling to BootcampKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      interests: table({
        title: string(),
        quantity: number(),
      }),
    },
    queries: {
      interests: ({ db }) => db.interests.orderBy("createdAt").all(),
      interestTitles: ({ db }) =>
        new Set(db.interests.all().map((interest) => interest.title)),
    },
    mutations: {
      addInterest: ({ db }, title: string) => {
        const existing = db.interests.where("title", title).all()[0]

        if (existing) {
          db.interests.update(existing.id, { quantity: existing.quantity + 1 })
        } else {
          db.interests.insert({
            title,
            quantity: 1,
          })
        }

        return db.interests.all()
      },
      decrementInterest: ({ db }, id: string) => {
        const existing = db.interests.get(id)
        if (!existing) return db.interests.all()

        const nextQuantity = existing.quantity - 1
        if (nextQuantity > 0) {
          db.interests.update(existing.id, { quantity: nextQuantity })
        } else {
          db.interests.delete(existing.id)
        }

        return db.interests.all()
      },
      removeInterest: ({ db }, id: string) => {
        db.interests.delete(id)
        return db.interests.all()
      },
      clearInterests: ({ db }) => {
        for (const interest of db.interests.all()) {
          db.interests.delete(interest.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const brand = props.brand ?? "StackForge Academy"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Nexus",
          "Curriculum",
          "Outcomes",
          "Tuition",
          "FAQ",
          "Apply Now",
        ]
    const hero = {
      eyebrow: "Bootcamp / Variant 3",
      title: "Master full-stack engineering in 16 weeks",
      description:
        "StackForge Academy | Premium Full-Stack Coding Bootcamp Nexus Curriculum Outcomes Tuition FAQ Apply Now Curriculum Outcomes Tuition FAQ Apply Now Now enrolling: Cohort 42 starts...",
      primaryCta: "Nexus",
      secondaryCta: "Curriculum",
      imageAlt:
        "Team of software engineers collaborating around laptops in a modern office space",
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
            title: "A curriculum built for production",
            body: "StackForge Academy | Premium Full-Stack Coding Bootcamp Nexus Curriculum Outcomes Tuition FAQ Apply Now Curriculum Outcomes Tuition FAQ Apply Now Now enrolling: Cohort 42 starts...",
            items: [
              "Alumni stories",
              "Invest in your move",
              "Frequently asked questions",
            ],
          },
          {
            eyebrow: "Experience",
            title: "How it works",
            body: "Bootcamp page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Your engineering career starts here.", "Modern Stack", "Real Projects"],
          },
          {
            eyebrow: "Proof",
            title: "Inside the classroom",
            body: "Bootcamp page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["1:1 Mentorship", "Career Launch", "Apply & Interview"],
          },
          {
            eyebrow: "Next steps",
            title: "Alumni stories",
            body: "Bootcamp page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Foundations Sprint", "Immersive Build", "Launch & Land"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "How it works",
            alt: "Team of software engineers collaborating around laptops in a modern office space",
            caption: "Bootcamp generated page detail",
          },
          {
            title: "Inside the classroom",
            alt: "Professional headshot of a smiling female software engineer",
            caption: "Bootcamp generated page detail",
          },
          {
            title: "Alumni stories",
            alt: "Professional headshot of a young male developer with glasses",
            caption: "Bootcamp generated page detail",
          },
        ]

    const storedInterests = lakebed.useQuery("interests")
    const storedInterestTitles = lakebed.useQuery("interestTitles")
    const addInterest = lakebed.useMutation("addInterest")
    const decrementInterest = lakebed.useMutation("decrementInterest")
    const removeInterest = lakebed.useMutation("removeInterest")
    const clearInterests = lakebed.useMutation("clearInterests")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
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

    const interestList = storedInterests ?? []
    const hasInterests = interestList.length > 0
    const totalInterestCount = interestList.reduce(
      (total, interest) => total + interest.quantity,
      0,
    )
    const openDrawer = () => {
      setDrawerOpen(true)
    }

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    return (
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
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
              <button
                type="button"
                onClick={() => {
                  go(hero.primaryCta)
                  openDrawer()
                }}
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
                        go(hero.primaryCta)
                        openDrawer()
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
                              void addInterest(item)
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
                      go(hero.primaryCta)
                      openDrawer()
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

        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border p-5">
            <SheetTitle>Application list</SheetTitle>
            <SheetDescription>
              Capture your most relevant interest tracks from this page.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-4 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                {hasInterests
                  ? `${totalInterestCount} saved item${totalInterestCount === 1 ? "" : "s"}`
                  : "No saved items yet"}
              </p>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={auth.isLoading}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                {authLabel}
              </button>
            </div>
            <div className="mb-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {isSignedIn ? (
                <p className="truncate">
                  Signed in as: {authDisplayName}
                  <span className="ml-2 inline-flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {authInitials}
                  </span>
                </p>
              ) : (
                <p>Sign in to keep your shortlist across sessions.</p>
              )}
            </div>
            {hasInterests ? (
              <div className="space-y-3">
                {interestList.map((interest) => (
                  <article
                    key={interest.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {interest.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {storedInterestTitles?.has(interest.title)
                            ? "Selected"
                            : "Not selected"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeInterest(interest.id)}
                        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => void decrementInterest(interest.id)}
                        className="rounded-md border border-border px-3 py-1 text-sm font-semibold text-foreground"
                        aria-label={`Decrease ${interest.title} count`}
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-foreground">
                        {interest.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => void addInterest(interest.title)}
                        className="rounded-md border border-border px-3 py-1 text-sm font-semibold text-foreground"
                        aria-label={`Increase ${interest.title} count`}
                      >
                        +
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No interests saved yet. Add items from the page to build your
                  application list.
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="border-t border-border p-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Saved count</span>
                <span className="font-semibold text-foreground">
                  {totalInterestCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (hasInterests) {
                    setDrawerOpen(false)
                    go("Apply Now")
                  }
                }}
                disabled={!hasInterests}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proceed to apply
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void clearInterests()}
                  disabled={!hasInterests}
                  className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear list
                </button>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition-colors"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors"
                  >
                    Sign in
                  </button>
                )}
              </div>
              <SheetClose asChild>
                <button
                  type="button"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors"
                >
                  Continue
                </button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  },
})
