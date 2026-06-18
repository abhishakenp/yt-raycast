import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { string, table } from "@ship-fast/lakebed/server"
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
import { Button } from "#/components/ui/button.tsx"

export const TourExperiencesKimiPage2 = defineCapsule({
  name: "TourExperiencesKimiPage2",
  description:
    "Tour Experiences second style sibling to TourExperiencesKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      savedActions: table({
        label: string(),
        source: string(),
      }),
    },
    queries: {
      savedActions: ({ db }) => db.savedActions.orderBy("createdAt").all(),
    },
    mutations: {
      saveSavedAction: ({ db }, label: string, source: string) => {
        db.savedActions.insert({ label, source })
        return db.savedActions.orderBy("createdAt").all()
      },
      removeSavedAction: ({ db }, id: string) => {
        db.savedActions.delete(id)
        return db.savedActions.orderBy("createdAt").all()
      },
      clearSavedActions: ({ db }) => {
        for (const item of db.savedActions.all()) {
          db.savedActions.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [workspaceOpen, setWorkspaceOpen] = useState(false)
    const savedActions = lakebed.useQuery("savedActions")
    const saveSavedAction = lakebed.useMutation("saveSavedAction")
    const removeSavedAction = lakebed.useMutation("removeSavedAction")
    const clearSavedActions = lakebed.useMutation("clearSavedActions")
    const savedActionCount = savedActions?.length ?? 0
    const recordSavedAction = (label: string, source: string) => {
      void saveSavedAction(label, source)
      setWorkspaceOpen(true)
    }
    const brand = props.brand ?? "Vivid Book Unforgettable Experiences"
    const nav = props.nav?.length ? props.nav : ["vivid", "Experiences", "Why Vivid", "How It Works", "Reviews", "Get Started"]
    const hero = {
      eyebrow: "Tour Experiences / Variant 2",
      title: "Adventures that stay with you.",
      description: "Vivid Book Unforgettable Experiences vivid Experiences Why Vivid How It Works Reviews Log in Get Started 2,400+ new experiences added this month Adventures that stay with you. B...",
      primaryCta: "Log in",
      secondaryCta: "Get Started",
      imageAlt: "aerial view of turquoise ocean waves crashing on a tropical beach with lush green coastline",
      ...props.hero,
    }
    const metrics = props.metrics?.length ? props.metrics : [
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
    const sections = props.sections?.length ? props.sections : [
  {
    "eyebrow": "Overview",
    "title": "Every detail, thoughtfully handled.",
    "body": "Vivid Book Unforgettable Experiences vivid Experiences Why Vivid How It Works Reviews Log in Get Started 2,400+ new experiences added this month Adventures that stay with you. B...",
    "items": [
      "Travel credit packages",
      "Don't take our word for it",
      "Your questions, answered"
    ]
  },
  {
    "eyebrow": "Experience",
    "title": "Book in 3 simple steps",
    "body": "Tour Experiences page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Ready for your next adventure?",
      "Handpicked by Experts",
      "Best Price Guarantee"
    ]
  },
  {
    "eyebrow": "Proof",
    "title": "Experiences people can't stop talking about",
    "body": "Tour Experiences page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Instant Confirmation",
      "Free Cancellation",
      "Browse & Discover"
    ]
  },
  {
    "eyebrow": "Next steps",
    "title": "Travel credit packages",
    "body": "Tour Experiences page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Book Securely",
      "Show Up & Enjoy",
      "Sunset Sailing in Santorini"
    ]
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "Book in 3 simple steps",
    "alt": "aerial view of turquoise ocean waves crashing on a tropical beach with lush green coastline",
    "caption": "Tour Experiences generated page detail"
  },
  {
    "title": "Experiences people can't stop talking about",
    "alt": "colorful houses stacked on a hillside in Cinque Terre Italy with blue sea in background",
    "caption": "Tour Experiences generated page detail"
  },
  {
    "title": "Travel credit packages",
    "alt": "misty mountain valley at sunrise with layered hills in soft blue and green tones",
    "caption": "Tour Experiences generated page detail"
  }
]

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
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
                  onClick={() => go(item)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => go(hero.primaryCta)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
            </button>
          </div>
        </header>
        <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="fixed bottom-5 right-5 z-40 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Saved {savedActionCount}
            </button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6 text-left">
              <SheetTitle>Saved workspace</SheetTitle>
              <SheetDescription>Keep track of page actions and follow-ups.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {(savedActions ?? []).length ? (
                (savedActions ?? []).map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.source}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeSavedAction(item.id)}
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                  No saved actions yet. Save this page or any follow-up you want to revisit.
                </div>
              )}
            </div>
            <SheetFooter className="gap-2 border-t border-border p-6 sm:flex-col">
              <Button type="button" onClick={() => recordSavedAction("Saved page", brand)}>
                Save current page
              </Button>
              <Button type="button" variant="outline" onClick={() => void clearSavedActions()}>
                Clear saved actions
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="secondary">
                  Done
                </Button>
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
                    onClick={() => go(hero.primaryCta)}
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
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Content-led page moments</h2>
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
                  onClick={() => go(hero.primaryCta)}
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
                <button key={item} type="button" onClick={() => go(item)} className="text-sm text-muted-foreground hover:text-foreground">
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
