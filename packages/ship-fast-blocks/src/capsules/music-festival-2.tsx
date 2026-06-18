import { useState } from 'react'
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

export const MusicFestivalKimiPage2 = defineCapsule({
  name: "MusicFestivalKimiPage2",
  description:
    "Music Festival second style sibling to MusicFestivalKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      lineup: table({
        name: string(),
        genre: string(),
        stage: string(),
        day: string(),
        time: string(),
        alt: string(),
      }),
      favorites: table({
        artistName: string(),
      }),
      schedule: table({
        artistName: string(),
        day: string(),
        time: string(),
      }),
    },
    queries: {
      lineup: ({ db }) => db.lineup.orderBy('createdAt').all(),
      favoriteArtistNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.artistName)),
      schedule: ({ db }) =>
        db.schedule.orderBy('day').then('time').all(),
    },
    mutations: {
      toggleFavorite: ({ db }, artistName: string) => {
        const existingFavorite = db.favorites
          .where('artistName', artistName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ artistName })
        return true
      },
      addToSchedule: ({ db }, artistName: string, day: string, time: string) => {
        const artist = db.lineup.where('name', artistName).all()[0]
        if (!artist) return db.schedule.all()

        const existingSchedule = db.schedule
          .where('artistName', artistName)
          .all()[0]

        if (existingSchedule) {
          db.schedule.update(existingSchedule.id, { day, time })
        } else {
          db.schedule.insert({ artistName, day, time })
        }

        return db.schedule.all()
      },
      removeFromSchedule: ({ db }, artistName: string) => {
        for (const item of db.schedule.where('artistName', artistName).all()) {
          db.schedule.delete(item.id)
        }

        return db.schedule.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [favoritesOpen, setFavoritesOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Solstice Sound Festival 2025"
    const nav = props.nav?.length ? props.nav : ["Lineup", "Experience", "Gallery", "FAQ", "SOLSTICE .", "Get Tickets"]

    // Lakebed hooks
    const storedLineup = lakebed.useQuery('lineup')
    const favoriteArtistNames = lakebed.useQuery('favoriteArtistNames')
    const schedule = lakebed.useQuery('schedule')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const addToSchedule = lakebed.useMutation('addToSchedule')
    const removeFromSchedule = lakebed.useMutation('removeFromSchedule')
    const auth = lakebed.useAuth()

    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    // Default lineup data
    const defaultLineup = [
      {
        name: 'Neon Pulse',
        genre: 'Electronic',
        stage: 'Main Stage',
        day: 'Friday',
        time: '8:00 PM',
        alt: 'electronic music performer with colorful lights',
      },
      {
        name: 'Midnight Echo',
        genre: 'Indie Rock',
        stage: 'North Stage',
        day: 'Saturday',
        time: '6:30 PM',
        alt: 'indie rock band performing on stage',
      },
      {
        name: 'Solar Flare',
        genre: 'Hip Hop',
        stage: 'Main Stage',
        day: 'Saturday',
        time: '9:00 PM',
        alt: 'hip hop artist with dynamic stage presence',
      },
      {
        name: 'Velvet Wave',
        genre: 'Synthwave',
        stage: 'South Stage',
        day: 'Sunday',
        time: '7:00 PM',
        alt: 'synthwave artist with retro aesthetic',
      },
    ]

    const displayLineup =
      storedLineup && storedLineup.length > 0
        ? storedLineup
        : defaultLineup

    const safeSchedule = schedule ?? []
    const favoriteCount = favoriteArtistNames?.size ?? 0

    // Icon components
    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const CalendarIcon = () => (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )

    const hero = {
      eyebrow: "Music Festival / Variant 2",
      title: "SOLSTICE SOUND",
      description: "Solstice Sound Festival 2025 | Austin, TX August 15 17 SOLSTICE . Lineup Experience Gallery FAQ Get Tickets August 15 17, 2025 Zilker Park, Austin, TX SOLSTICE SOUND Three days....",
      primaryCta: "Join",
      secondaryCta: "SOLSTICE .",
      imageAlt: "massive music festival crowd with hands raised under dramatic sunset sky and bright stage lights",
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
    "title": "The Lineup",
    "body": "Solstice Sound Festival 2025 | Austin, TX August 15 17 SOLSTICE . Lineup Experience Gallery FAQ Get Tickets August 15 17, 2025 Zilker Park, Austin, TX SOLSTICE SOUND Three days....",
    "items": [
      "The Gallery",
      "Pick Your Pass",
      "What Fans Say"
    ]
  },
  {
    "eyebrow": "Experience",
    "title": "More Than Music",
    "body": "Music Festival page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Frequently Asked Questions",
      "Ready for the Weekend?",
      "Friday, August 15"
    ]
  },
  {
    "eyebrow": "Proof",
    "title": "Plan Your Weekend",
    "body": "Music Festival page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Saturday, August 16",
      "Sunday, August 17",
      "12 Unique Stages"
    ]
  },
  {
    "eyebrow": "Next steps",
    "title": "The Gallery",
    "body": "Music Festival page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Boutique Camping",
      "Artisan Food Hall",
      "Silent Disco"
    ]
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "More Than Music",
    "alt": "massive music festival crowd with hands raised under dramatic sunset sky and bright stage lights",
    "caption": "Music Festival generated page detail"
  },
  {
    "title": "Plan Your Weekend",
    "alt": "silhouetted hip hop performer against explosive purple and red stage pyrotechnics",
    "caption": "Music Festival generated page detail"
  },
  {
    "title": "The Gallery",
    "alt": "pop singer dancing on a brightly lit stage with swirling pink and blue spotlights",
    "caption": "Music Festival generated page detail"
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
            <div className="flex items-center gap-3">
              {/* Favorites Drawer */}
              <Sheet open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="My Favorites"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <HeartIcon />
                    {favoriteCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {favoriteCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">My Favorites</SheetTitle>
                    <SheetDescription>
                      {favoriteCount > 0
                        ? `${favoriteCount} artist${favoriteCount === 1 ? '' : 's'} saved`
                        : 'No favorites yet'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {displayLineup.filter((artist) =>
                      favoriteArtistNames?.has(artist.name)
                    ).length ? (
                      <div className="space-y-4">
                        {displayLineup
                          .filter((artist) => favoriteArtistNames?.has(artist.name))
                          .map((artist) => (
                            <div
                              key={artist.name}
                              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="size-12 overflow-hidden rounded-md bg-muted">
                                  <Image
                                    alt={artist.alt}
                                    w={120}
                                    h={120}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{artist.name}</p>
                                  <p className="text-sm text-muted-foreground">{artist.genre}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => void toggleFavorite(artist.name)}
                                aria-label={`Remove ${artist.name} from favorites`}
                                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                              >
                                <HeartIcon active={true} />
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No favorites yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Heart artists from the lineup to build your personal list.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button type="button" variant="secondary" className="w-full rounded-full">
                        Close
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Auth */}
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                        {authDisplayName}
                      </span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in to this session'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go('My Schedule')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Schedule
                        <CalendarIcon />
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  aria-label="Sign in with Google"
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => go(hero.primaryCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div
              id="mobile-menu"
              className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
            >
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    go(label)
                  }}
                  className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                >
                  {label}
                </button>
              ))}
              <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                {isSignedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg">
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {authDisplayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {authEmail ?? 'Signed in'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignOut()
                      }}
                      className="w-full rounded-full"
                    >
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignIn()
                    }}
                    disabled={auth.isLoading}
                    className="w-full rounded-full"
                  >
                    <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    {authLabel}
                  </Button>
                )}
              </div>
            </div>
          )}
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

          {/* Lineup Section with Interactive Features */}
          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">Artist Lineup</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Featured Performers</h2>
              </div>
              <button
                type="button"
                onClick={() => setFavoritesOpen(true)}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                View Favorites ({favoriteCount})
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {displayLineup.map((artist) => {
                const isFavorite = favoriteArtistNames?.has(artist.name) ?? false
                const inSchedule = safeSchedule.some((s) => s.artistName === artist.name)

                return (
                  <article key={artist.name} className="group">
                    <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-background">
                      <Image
                        alt={artist.alt}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => void toggleFavorite(artist.name)}
                        aria-pressed={isFavorite}
                        aria-label={
                          isFavorite
                            ? `Remove ${artist.name} from favorites`
                            : `Add ${artist.name} to favorites`
                        }
                        className={cn(
                          'absolute top-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          isFavorite
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-foreground hover:bg-background',
                        )}
                      >
                        <HeartIcon active={isFavorite} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {artist.genre}
                      </p>
                      <h3 className="font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
                        {artist.name}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{artist.stage}</span>
                        <span>{artist.day}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{artist.time}</span>
                        {isSignedIn && (
                          <Button
                            type="button"
                            size="sm"
                            variant={inSchedule ? "default" : "outline"}
                            className="rounded-full"
                            onClick={() => {
                              if (inSchedule) {
                                void removeFromSchedule(artist.name)
                              } else {
                                void addToSchedule(artist.name, artist.day, artist.time)
                              }
                            }}
                          >
                            {inSchedule ? 'Scheduled' : 'Add to Schedule'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
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
