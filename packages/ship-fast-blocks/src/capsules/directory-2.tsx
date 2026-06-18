import { useState } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
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

export const DirectoryKimiPage2 = defineCapsule({
  name: "DirectoryKimiPage2",
  description:
    "Directory second style sibling to DirectoryKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      directoryListings: table({
        name: string(),
        category: string(),
        description: string(),
      }),
      savedDirectoryListings: table({
        listingName: string(),
        listingCategory: string(),
        listingDescription: string(),
      }),
      listingViews: table({
        listingName: string(),
        sourceLabel: string(),
        rating: number(),
      }),
    },
    queries: {
      directoryListings: ({ db }) => db.directoryListings.orderBy("createdAt").all(),
      savedDirectoryListings: ({ db }) =>
        db.savedDirectoryListings.orderBy("createdAt").all(),
      listingViews: ({ db }) => db.listingViews.orderBy("createdAt").all(),
    },
    mutations: {
      addDirectoryListing: (
        { db },
        name: string,
        category: string,
        description: string,
      ) => {
        const existing = db.directoryListings.where("name", name).all()[0]
        if (existing) return db.directoryListings.all()

        db.directoryListings.insert({
          name,
          category,
          description,
        })

        return db.directoryListings.all()
      },
      saveListing: (
        { db },
        listingName: string,
        listingCategory: string,
        listingDescription: string,
      ) => {
        const existing = db.savedDirectoryListings
          .where("listingName", listingName)
          .all()[0]

        if (existing) return db.savedDirectoryListings.all()

        db.savedDirectoryListings.insert({
          listingName,
          listingCategory,
          listingDescription,
        })

        return db.savedDirectoryListings.all()
      },
      removeSavedListing: ({ db }, listingName: string) => {
        for (const item of db.savedDirectoryListings
          .where("listingName", listingName)
          .all()) {
          db.savedDirectoryListings.delete(item.id)
        }

        return db.savedDirectoryListings.all()
      },
      clearSavedListings: ({ db }) => {
        for (const item of db.savedDirectoryListings.all()) {
          db.savedDirectoryListings.delete(item.id)
        }

        return db.savedDirectoryListings.all()
      },
      addListingView: ({ db }, listingName: string, sourceLabel: string, rating: number) => {
        db.listingViews.insert({
          listingName,
          sourceLabel,
          rating,
        })

        return db.listingViews.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [savedOpen, setSavedOpen] = useState(false)
    const brand =
      props.brand ?? "LocalFind Discover the Best Local Businesses Near You"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Explore",
          "Categories",
          "For Business",
          "Reviews",
          "L LocalFind",
          "List Your Business",
        ]
    const hero = {
      eyebrow: "Directory / Variant 2",
      title: "Find the Best Local Businesses",
      description:
        "LocalFind Discover the Best Local Businesses Near You L LocalFind Explore Categories For Business Reviews List Your Business Find the Best Local Businesses Discover top-rated re...",
      primaryCta: "Search",
      secondaryCta: "Get Started",
      imageAlt: "Metro Daily newspaper logo",
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
            "title": "Everything you need to explore your city",
            "body": "LocalFind Discover the Best Local Businesses Near You L LocalFind Explore Categories For Business Reviews List Your Business Find the Best Local Businesses Discover top-rated re...",
            "items": [
              "Grow your business with us",
              "Loved by locals and owners alike",
              "Frequently asked questions",
            ],
          },
          {
            "eyebrow": "Experience",
            "title": "Find your new favorite spot in minutes",
            "body": "Directory page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Ready to put your business on the map?",
              "Verified Reviews",
              "Neighborhood Maps",
            ],
          },
          {
            "eyebrow": "Proof",
            "title": "Trending Local Listings",
            "body": "Directory page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Instant Connect",
              "Search & Filter",
              "Compare & Browse",
            ],
          },
          {
            "eyebrow": "Next steps",
            "title": "Grow your business with us",
            "body": "Directory page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            "items": [
              "Visit or Book",
              "The Morning Grind Cafe",
              "Oak & Iron Tavern",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            "title": "Find your new favorite spot in minutes",
            "alt": "Metro Daily newspaper logo",
            "caption": "Directory generated page detail",
          },
          {
            "title": "Trending Local Listings",
            "alt": "City Weekly magazine logo",
            "caption": "Directory generated page detail",
          },
          {
            "title": "Grow your business with us",
            "alt": "The Local Chronicle publication logo",
            "caption": "Directory generated page detail",
          },
        ]
    const fallbackDirectoryListings = [
      {
        name: "The Morning Grind Cafe",
        category: "Cafe & Coffee",
        description:
          "Neighborhood breakfast spot with signature cold brews and fresh pastries.",
      },
      {
        name: "Oak & Iron Tavern",
        category: "Bar & Lounge",
        description: "Evening venue for craft cocktails, small plates, and live music.",
      },
      {
        name: "City Week Local Market",
        category: "Community",
        description:
          "Weekend market featuring local artisans, food vendors, and pop-up stores.",
      },
      {
        name: "The Morning Review",
        category: "Editorial Guide",
        description:
          "Locally curated weekly recommendations for places worth visiting.",
      },
      {
        name: "LocalFind Concierge",
        category: "Business Support",
        description: "Premium service desk for businesses listing and profile growth.",
      },
    ]
    const storedDirectoryListings = lakebed.useQuery("directoryListings")
    const savedListings = lakebed.useQuery("savedDirectoryListings")
    const listingViews = lakebed.useQuery("listingViews")
    const auth = lakebed.useAuth()
    const addDirectoryListing = lakebed.useMutation("addDirectoryListing")
    const saveListing = lakebed.useMutation("saveListing")
    const removeSavedListing = lakebed.useMutation("removeSavedListing")
    const clearSavedListings = lakebed.useMutation("clearSavedListings")
    const addListingView = lakebed.useMutation("addListingView")

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

    const directoryListingSource =
      storedDirectoryListings && storedDirectoryListings.length > 0
        ? storedDirectoryListings
        : fallbackDirectoryListings

    const activeSaved = savedListings ?? []
    const savedCount = activeSaved.length
    const averageSavedViews =
      (listingViews?.length ?? 0) > 0
        ? (
            (listingViews ?? []).reduce((sum, item) => sum + item.rating, 0) /
            (listingViews ?? []).length
          ).toFixed(1)
        : "0.0"
    const savedNameSet = new Set(activeSaved.map((entry) => entry.listingName))

    const authStatusText =
      auth.isLoading
        ? "Checking account status..."
        : isSignedIn
          ? `Signed in as ${authDisplayName}`
          : "Sign in to sync across devices."

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const upsertAndSaveListing = (
      listingName: string,
      listingCategory: string,
      listingDescription: string,
      sourceLabel: string,
    ) => {
      void addDirectoryListing(listingName, listingCategory, listingDescription)
      void saveListing(listingName, listingCategory, listingDescription)
      void addListingView(listingName, sourceLabel, 4.9)
      setSavedOpen(true)
    }

    const removeSavedListingByName = (listingName: string) => {
      void removeSavedListing(listingName)
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
                onClick={() => go(hero.primaryCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
              <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label="Open saved listings"
                  >
                    Saved
                    {savedCount ? (
                      <span className="ml-2 inline-flex min-w-5 justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                        {savedCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle>Saved listings</SheetTitle>
                    <SheetDescription>
                      {savedCount > 0
                        ? `${savedCount} place${savedCount === 1 ? "" : "s"} saved for later.`
                        : "Save places to build a fast shortlist."}
                    </SheetDescription>
                    <div className="mt-3 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                      {authStatusText}
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {activeSaved.length ? (
                      <div className="space-y-3">
                        {activeSaved.map((item) => (
                          <article
                            key={item.id}
                            className="rounded-lg border border-border bg-card p-4 text-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-card-foreground">
                                  {item.listingName}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {item.listingCategory}
                                </p>
                                <p className="mt-2 leading-6 text-muted-foreground">
                                  {item.listingDescription}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSavedListingByName(item.listingName)}
                                className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                aria-label={`Remove ${item.listingName}`}
                              >
                                Remove
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-5">
                          <p className="text-sm font-medium text-foreground">No saved places yet</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Save a few entries from section items to build your local shortlist.
                          </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                          <p className="mb-3 text-sm font-semibold text-card-foreground">
                            Suggested listings
                          </p>
                          <div className="grid gap-2">
                            {directoryListingSource.slice(0, 3).map((listing) => {
                              const alreadySaved = savedNameSet.has(listing.name)

                              return (
                                <button
                                  key={listing.name}
                                  type="button"
                                  onClick={() =>
                                    upsertAndSaveListing(
                                      listing.name,
                                      listing.category,
                                      listing.description,
                                      "Suggested listing",
                                    )
                                  }
                                  className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                  <p className="font-medium">{listing.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {listing.category}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground/80">
                                    {alreadySaved
                                      ? "Saved"
                                      : "Tap to save this listing"}
                                  </p>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border px-6 py-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Total saved</span>
                        <span>{savedCount}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Average signal</span>
                        <span>{averageSavedViews}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {activeSaved.length ? (
                        <button
                          type="button"
                          onClick={() => void clearSavedListings()}
                          className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          Clear all
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="rounded-md border border-border bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
                        >
                          Clear all
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => go(hero.secondaryCta)}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        {hero.secondaryCta}
                      </button>
                    </div>
                    {auth.isLoading ? null : isSignedIn ? (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="mt-2 w-full rounded-md border border-border bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/70"
                      >
                        Sign out {authInitials}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={auth.isLoading}
                        className="mt-2 w-full rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {authLabel}
                      </button>
                    )}
                    <SheetClose asChild>
                      <button
                        type="button"
                        className="mt-2 w-full rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground"
                      >
                        Continue browsing
                      </button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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
                            go(item)
                            upsertAndSaveListing(
                              item,
                              section.eyebrow,
                              section.body,
                              section.title,
                            )
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
                    <button
                      type="button"
                      onClick={() =>
                        upsertAndSaveListing(
                          item.title,
                          "Generated visual",
                          item.caption || item.title,
                          "Gallery",
                        )
                      }
                      className="mt-4 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {savedNameSet.has(item.title)
                        ? "Saved"
                        : "Save this place"}
                    </button>
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
