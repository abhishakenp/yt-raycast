import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
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
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'

export const MarketingKimiPage2 = defineCapsule({
  name: 'MarketingKimiPage2',
  description:
    'Marketing second style sibling to MarketingKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
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
      subscribers: table({
        email: string(),
      }),
      savedItems: table({
        title: string(),
        section: string(),
      }),
      leads: table({
        name: string(),
        email: string(),
        message: string(),
        count: number(),
      }),
    },
    queries: {
      subscribers: ({ db }) => db.subscribers.orderBy('createdAt').all(),
      savedItems: ({ db }) => db.savedItems.orderBy('createdAt').all(),
      savedTitles: ({ db }) =>
        new Set(db.savedItems.all().map((item) => item.title)),
    },
    mutations: {
      subscribe: ({ db }, email: string) => {
        const existing = db.subscribers.where('email', email).all()[0]
        if (!existing) {
          db.subscribers.insert({ email })
        }
        return db.subscribers.all()
      },
      toggleSaved: ({ db }, title: string, section: string) => {
        const existing = db.savedItems.where('title', title).all()[0]
        if (existing) {
          db.savedItems.delete(existing.id)
          return false
        }
        db.savedItems.insert({ title, section })
        return true
      },
      removeSaved: ({ db }, id: string) => {
        db.savedItems.delete(id)
        return db.savedItems.all()
      },
      clearSaved: ({ db }) => {
        for (const item of db.savedItems.all()) {
          db.savedItems.delete(item.id)
        }
        return []
      },
      submitLead: ({ db }, name: string, email: string, message: string) => {
        db.leads.insert({ name, email, message, count: 1 })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [emailInput, setEmailInput] = useState('')
    const [subscribed, setSubscribed] = useState(false)

    const brand = props.brand ?? 'Stride Ship Faster. Stress Less.'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Customers', 'Pricing', 'FAQ', 'Sign in', 'Get started']
    const hero = {
      eyebrow: 'Marketing / Variant 2',
      title: 'Ship faster. Stress less.',
      description:
        'Stride Ship Faster. Stress Less. Stride Features Customers Pricing FAQ Sign in Get started Features Customers Pricing FAQ Sign in Get started Now with AI sprint planning Ship fa...',
      primaryCta: 'Features',
      secondaryCta: 'Customers',
      imageAlt:
        'professional headshot of a customer named David Park, a smiling startup founder',
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          { value: '24/7', label: 'Responsive service' },
          { value: '98%', label: 'Positive outcomes' },
          { value: '4.9', label: 'Average rating' },
          { value: '12+', label: 'Core capabilities' },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            eyebrow: 'Overview',
            title: 'Everything you need to move faster',
            body: 'Stride Ship Faster. Stress Less. Stride Features Customers Pricing FAQ Sign in Get started Features Customers Pricing FAQ Sign in Get started Now with AI sprint planning Ship fa...',
            items: [
              'Loved by engineering leaders',
              'Simple, transparent pricing',
              'Frequently asked questions',
            ],
          },
          {
            eyebrow: 'Experience',
            title: 'Get started in minutes, not months',
            body: "Marketing page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Ready to ship faster?',
              'AI Sprint Planning',
              'Cycle Time Analytics',
            ],
          },
          {
            eyebrow: 'Proof',
            title: 'Inside the platform',
            body: "Marketing page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Ephemeral Environments',
              'One-Click Integrations',
              'Smart Notifications',
            ],
          },
          {
            eyebrow: 'Next steps',
            title: 'Loved by engineering leaders',
            body: "Marketing page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Enterprise Security',
              'Connect your codebase',
              'Let the AI analyze velocity',
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'Get started in minutes, not months',
            alt: 'professional headshot of a customer named David Park, a smiling startup founder',
            caption: 'Marketing generated page detail',
          },
          {
            title: 'Inside the platform',
            alt: 'professional headshot of a customer named Sarah Chen, a smiling engineering executive with short dark hair',
            caption: 'Marketing generated page detail',
          },
          {
            title: 'Loved by engineering leaders',
            alt: 'professional headshot of a customer named Marcus Whitfield, a bearded technology executive',
            caption: 'Marketing generated page detail',
          },
        ]

    // Lakebed hooks
    const savedItems = lakebed.useQuery('savedItems')
    const savedTitles = lakebed.useQuery('savedTitles')
    const subscribers = lakebed.useQuery('subscribers')
    const auth = lakebed.useAuth()
    const toggleSaved = lakebed.useMutation('toggleSaved')
    const removeSaved = lakebed.useMutation('removeSaved')
    const clearSaved = lakebed.useMutation('clearSaved')
    const subscribe = lakebed.useMutation('subscribe')

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
        .map((part: string) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'

    const safeSavedItems = savedItems ?? []
    const savedCount = safeSavedItems.length
    const subscriberCount = subscribers?.length ?? 0

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

    const BookmarkIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-4',
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
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    )

    return (
      <div
        className={cn(
          'min-h-screen bg-background text-foreground',
          props.className,
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button
              type="button"
              onClick={() => go('Home')}
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
            <div className="flex items-center gap-3">
              {/* Auth */}
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-9 max-w-44 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
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
                    className="w-64 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-3">
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
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={() => lakebed.signOut()}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                      >
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!auth.isLoading) void lakebed.signInWithGoogle()
                  }}
                  disabled={auth.isLoading}
                  aria-label="Sign in with Google"
                  className="hidden h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}

              {/* Reading list drawer trigger */}
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Reading list"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <BookmarkIcon />
                    {savedCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {savedCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Reading list</SheetTitle>
                    <SheetDescription>
                      {savedCount > 0
                        ? `${savedCount} saved item${savedCount === 1 ? '' : 's'}.`
                        : 'Bookmark sections to read later.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeSavedItems.length ? (
                      <div className="space-y-3">
                        {safeSavedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                                {item.section}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-card-foreground">
                                {item.title}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeSaved(item.id)}
                              className="shrink-0 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          Nothing saved yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Click the bookmark icon on any section to save it
                          here.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Inline subscribe form */}
                  <div className="border-t border-border px-6 py-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">
                      Stay in the loop
                    </p>
                    {subscribed ? (
                      <p className="text-sm text-muted-foreground">
                        ✓ You're subscribed!
                        {subscriberCount > 1
                          ? ` (${subscriberCount} total)`
                          : ''}
                      </p>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (!emailInput.trim()) return
                          void subscribe(emailInput.trim())
                          setSubscribed(true)
                          setEmailInput('')
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          aria-label="Email for newsletter"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <Button type="submit" size="sm">
                          Subscribe
                        </Button>
                      </form>
                    )}
                  </div>

                  <SheetFooter className="border-t border-border p-6">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearSaved()}
                        disabled={!safeSavedItems.length}
                      >
                        Clear all
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
                        >
                          Done
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <button
                type="button"
                onClick={() => go(hero.primaryCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
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
              {sections.map((section, index) => {
                const isSaved = savedTitles?.has(section.title) ?? false
                return (
                  <article
                    key={section.title}
                    className="rounded-lg border border-border bg-card p-6"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-primary">
                        {section.eyebrow}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          void toggleSaved(section.title, section.eyebrow)
                          if (!isSaved) setDrawerOpen(true)
                        }}
                        aria-pressed={isSaved}
                        aria-label={
                          isSaved
                            ? `Remove "${section.title}" from reading list`
                            : `Save "${section.title}" to reading list`
                        }
                        className={cn(
                          'grid size-7 place-items-center rounded-md transition-colors',
                          isSaved
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        <BookmarkIcon active={isSaved} />
                      </button>
                    </div>
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
                )
              })}
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
