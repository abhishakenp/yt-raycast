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
  SheetTrigger,
} from "#/components/ui/sheet.tsx"
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

export const AuthKimiPage4 = defineCapsule({
  name: "AuthKimiPage4",
  description:
    "Auth fourth style sibling to AuthKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      sessions: table({
        email: string(),
        lastLogin: string(),
      }),
      preferences: table({
        key: string(),
        value: string(),
      }),
    },
    queries: {
      sessions: ({ db }) => db.sessions.orderBy('createdAt').all(),
      preferences: ({ db }) => db.preferences.all(),
    },
    mutations: {
      recordSession: ({ db }, email: string) => {
        const existing = db.sessions.where('email', email).all()[0]
        if (existing) {
          db.sessions.update(existing.id, { lastLogin: new Date().toISOString() })
        } else {
          db.sessions.insert({ email, lastLogin: new Date().toISOString() })
        }
        return db.sessions.all()
      },
      setPreference: ({ db }, key: string, value: string) => {
        const existing = db.preferences.where('key', key).all()[0]
        if (existing) {
          db.preferences.update(existing.id, { value })
        } else {
          db.preferences.insert({ key, value })
        }
        return db.preferences.all()
      },
      clearSessions: ({ db }) => {
        for (const item of db.sessions.all()) {
          db.sessions.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [accountOpen, setAccountOpen] = useState(false)
    const brand = props.brand ?? "Sign In"
    const auth = lakebed.useAuth()
    const sessions = lakebed.useQuery('sessions')
    const preferences = lakebed.useQuery('preferences')
    const recordSession = lakebed.useMutation('recordSession')
    const setPreference = lakebed.useMutation('setPreference')
    const clearSessions = lakebed.useMutation('clearSessions')
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName = auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials = authDisplayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ME'
    const authLabel = auth.isLoading ? 'Checking...' : isSignedIn ? authDisplayName : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const ChevronDown = () => (
      <svg
        className="size-4 text-muted-foreground"
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

    const ArrowRight = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const nav = props.nav?.length ? props.nav : ["Overview", "Services", "Work", "Pricing", "Contact"]
    const hero = {
      eyebrow: "Auth / Variant 4",
      title: "Welcome to Our Platform",
      description: "Sign In Welcome to Our Platform Sign in to access your dashboard and manage your projects efficiently. 10K+ Active Users 99.9% Uptime 24/7 Support Sign In Enter your email and p...",
      primaryCta: "Sign In",
      secondaryCta: "Google",
      imageAlt: "auth hero scene",
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
    "title": "Auth strategy",
    "body": "Sign In Welcome to Our Platform Sign in to access your dashboard and manage your projects efficiently. 10K+ Active Users 99.9% Uptime 24/7 Support Sign In Enter your email and p...",
    "items": []
  },
  {
    "eyebrow": "Experience",
    "title": "Auth services",
    "body": "Auth page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": []
  },
  {
    "eyebrow": "Proof",
    "title": "Auth results",
    "body": "Auth page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": []
  },
  {
    "eyebrow": "Next steps",
    "title": "Auth support",
    "body": "Auth page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": []
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "Auth visual 1",
    "alt": "auth hero scene",
    "caption": "Auth generated page detail"
  },
  {
    "title": "Auth visual 2",
    "alt": "auth customer experience",
    "caption": "Auth generated page detail"
  },
  {
    "title": "Auth visual 3",
    "alt": "auth service detail",
    "caption": "Auth generated page detail"
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
                      onClick={() => {
                        setAccountOpen(true)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Account
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go('Settings')}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Settings
                      <ArrowRight />
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
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
              >
                {authLabel}
              </button>
            )}
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

        <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Account</SheetTitle>
              <SheetDescription>
                Manage your session and preferences
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Session History</h3>
                  {sessions && sessions.length > 0 ? (
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="rounded-lg border border-border bg-muted/40 px-3 py-2"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {session.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last login: {new Date(session.lastLogin).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No session history yet. Sign in to track your sessions.
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Preferences</h3>
                  {preferences && preferences.length > 0 ? (
                    <div className="space-y-2">
                      {preferences.map((pref) => (
                        <div
                          key={pref.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {pref.key}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {pref.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No preferences set yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <SheetFooter className="border-t border-border p-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void clearSessions()}
                disabled={!sessions || sessions.length === 0}
              >
                Clear Session History
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="secondary" className="w-full">
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
