import { useState } from "react"
import { z } from "zod/v4"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
import { Button } from "#/components/ui/button.tsx"
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover.tsx"
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
import { number, string, table } from "@ship-fast/lakebed/server"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { defineCapsule } from "./openui.ts"

const defaultTourRequests = [
  { name: "Private office walkthrough", space: "Nexus Workspace", guests: 1 },
  { name: "Team tour", space: "Community floor", guests: 2 },
]

export const CoworkingKimiPage3 = defineCapsule({
  name: "CoworkingKimiPage3",
  description:
    "Coworking third style sibling to CoworkingKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      tourRequests: table({
        name: string(),
        space: string(),
        guests: number(),
      }),
    },
    queries: {
      tourRequests: ({ db }) => db.tourRequests.orderBy("createdAt").all(),
    },
    mutations: {
      addTourRequest: ({ db }, name: string, space: string, guests = 1) => {
        const nextGuests = Math.max(1, Math.floor(guests))
        db.tourRequests.insert({
          name: name.trim() || "Visit request",
          space: space.trim() || "Coworking tour",
          guests: Number.isNaN(nextGuests) ? 1 : nextGuests,
        })

        return db.tourRequests.all()
      },
      updateTourRequestGuests: ({ db }, requestId: string, guests: number) => {
        const request = db.tourRequests.get(requestId)
        if (!request) return db.tourRequests.all()

        const nextGuests = Math.max(1, Math.floor(guests))

        db.tourRequests.update(request.id, {
          guests: Number.isNaN(nextGuests) ? request.guests : nextGuests,
        })

        return db.tourRequests.all()
      },
      removeTourRequest: ({ db }, requestId: string) => {
        db.tourRequests.delete(requestId)

        return db.tourRequests.all()
      },
      clearTourRequests: ({ db }) => {
        for (const request of db.tourRequests.all()) {
          db.tourRequests.delete(request.id)
        }

        return db.tourRequests.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [tourDrawerOpen, setTourDrawerOpen] = useState(false)
    const brand =
      props.brand ?? "Haven Workspace Premium Coworking in Downtown Austin"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Nexus Workspace",
          "Spaces",
          "Amenities",
          "Pricing",
          "Community",
          "Book a Tour",
        ]
    const hero = {
      eyebrow: "Coworking / Variant 3",
      title: "Work where ambition thrives",
      description:
        "Haven Workspace Premium Coworking in Downtown Austin Nexus Workspace Spaces Amenities Pricing Community Book a Tour Work where ambition thrives Premium coworking spaces in downt...",
      primaryCta: "Nexus Workspace",
      secondaryCta: "Spaces",
      imageAlt:
        "Bright modern coworking lounge with floor to ceiling windows and green plants",
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
            title: "Trusted by leading companies",
            body: "Haven Workspace Premium Coworking in Downtown Austin Nexus Workspace Spaces Amenities Pricing Community Book a Tour Work where ambition thrives Premium coworking spaces in downt...",
            items: [
              "Get started in minutes, not days",
              "See the space for yourself",
              "Simple, transparent pricing",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Everything you need to do your best work",
            body: "Coworking page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "More than desks, it is a network",
              "Loved by hundreds of members",
              "Questions we hear often",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Designed for every way you work",
            body: "Coworking page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Ready to see it in person?", "Gigabit WiFi", "Meeting Rooms"],
          },
          {
            eyebrow: "Next steps",
            title: "Get started in minutes, not days",
            body: "Coworking page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Private Phone Booths",
              "24/7 Keyless Access",
              "Bottomless Coffee & Tea",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Everything you need to do your best work",
            alt: "Bright modern coworking lounge with floor to ceiling windows and green plants",
            caption: "Coworking generated page detail",
          },
          {
            title: "Designed for every way you work",
            alt: "Open plan coworking space with long wooden desks and people working on laptops",
            caption: "Coworking generated page detail",
          },
          {
            title: "Get started in minutes, not days",
            alt: "Quiet focused workspace with individual desks separated by partitions and warm lighting",
            caption: "Coworking generated page detail",
          },
        ]

    const storedTourRequests = lakebed.useQuery("tourRequests")
    const addTourRequest = lakebed.useMutation("addTourRequest")
    const updateTourRequestGuests = lakebed.useMutation("updateTourRequestGuests")
    const removeTourRequest = lakebed.useMutation("removeTourRequest")
    const clearTourRequests = lakebed.useMutation("clearTourRequests")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest

    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
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

    const tourRequests = storedTourRequests ?? []
    const totalTourRequests = tourRequests.length
    const totalGuests = tourRequests.reduce(
      (sum, request) => sum + request.guests,
      0,
    )

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const handleNavClick = (item: string) => {
      if (item.toLowerCase() === "book a tour") {
        void addTourRequest("Book a Tour", "Nexus Workspace", 2)
      }

      go(item)
    }

    const handleSectionItemClick = (section: string, item: string) => {
      if (
        item.toLowerCase().includes("tour") ||
        item.toLowerCase().includes("see") ||
        section.toLowerCase().includes("proof")
      ) {
        void addTourRequest(item, section, 1)
        setTourDrawerOpen(true)
      }

      go(item)
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
                  onClick={() => handleNavClick(item)}
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
              <Sheet
                open={tourDrawerOpen}
                onOpenChange={setTourDrawerOpen}
              >
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setTourDrawerOpen(true)}
                  >
                    My Tour Requests
                    {totalTourRequests > 0 ? (
                      <span className="ml-2 grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {totalTourRequests}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border px-6 py-5">
                    <SheetTitle>Tour requests</SheetTitle>
                    <SheetDescription>
                      Track your selected walkthroughs, private tours, and guest counts.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Add from templates</p>
                        <div className="grid gap-2">
                          {defaultTourRequests.map((request) => (
                            <button
                              key={`${request.name}-${request.space}`}
                              type="button"
                              onClick={() =>
                                void addTourRequest(
                                  request.name,
                                  request.space,
                                  request.guests,
                                )
                              }
                              className="rounded-md border border-border bg-card px-3 py-2 text-left text-sm font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              {request.name} · {request.space}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-muted/40 p-4">
                        {tourRequests.length ? (
                          <div className="space-y-3">
                            {tourRequests.map((request) => (
                              <article
                                key={request.id}
                                className="rounded-md border border-border bg-background p-3"
                              >
                                <div className="mb-2 flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{request.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {request.space}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void removeTourRequest(request.id)}
                                    className="text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="inline-flex h-9 items-center rounded-full border border-border bg-muted/60">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateTourRequestGuests(
                                          request.id,
                                          request.guests - 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-sm font-semibold text-muted-foreground hover:text-foreground"
                                      aria-label={`Decrease ${request.name} guests`}
                                    >
                                      -
                                    </button>
                                    <span className="min-w-8 text-center text-sm font-semibold">
                                      {request.guests}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateTourRequestGuests(
                                          request.id,
                                          request.guests + 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-sm font-semibold text-muted-foreground hover:text-foreground"
                                      aria-label={`Increase ${request.name} guests`}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                    {request.guests} guest{request.guests === 1 ? '' : 's'}
                                  </span>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No active requests. Use the quick buttons above to start building
                            your visit plan.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="space-y-2 border-t border-border px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total request lines</span>
                        <span>{totalTourRequests}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total guests</span>
                        <span>{totalGuests}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!totalTourRequests}
                        onClick={() => void clearTourRequests()}
                      >
                        Clear
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => go("Book a Tour")}
                          disabled={!totalTourRequests}
                        >
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-accent/70"
                    >
                      <Avatar size="sm" className="size-7">
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-20 truncate md:block">
                        {authLabel}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 border-border bg-background p-2" align="end">
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-foreground">{authDisplayName}</p>
                      <p className="text-xs text-muted-foreground">{authEmail ?? 'Signed in to this session'}</p>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
                      >
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-70"
                >
                  {authLabel}
                </button>
              )}
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
                      void addTourRequest("Hero primary plan", hero.title, 1)
                      setTourDrawerOpen(true)
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void addTourRequest("Hero secondary plan", hero.title, 1)
                      setTourDrawerOpen(true)
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
              <div key={metric.label} className="rounded-lg border border-border bg-card p-5">
                <p className="text-3xl font-semibold text-card-foreground">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.label}</p>
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
                          onClick={() => handleSectionItemClick(section.title, item)}
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
                  void addTourRequest("Visual gallery inquiry", hero.secondaryCta, 1)
                  setTourDrawerOpen(true)
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
                    void addTourRequest("Primary CTA check", hero.title, 1)
                    setTourDrawerOpen(true)
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
                  onClick={() => handleNavClick(item)}
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
