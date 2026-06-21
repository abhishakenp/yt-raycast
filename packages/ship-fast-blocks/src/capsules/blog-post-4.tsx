import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
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

export const BlogPostKimiPage4 = defineCapsule({
  name: 'BlogPostKimiPage4',
  description:
    'Blog Post fourth style sibling to BlogPostKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
      readingList: table({
        articleTitle: string(),
        articleEyebrow: string(),
      }),
      subscribers: table({
        email: string(),
      }),
    },
    queries: {
      readingListItems: ({ db }) => db.readingList.orderBy('createdAt').all(),
    },
    mutations: {
      addToReadingList: (
        { db },
        articleTitle: string,
        articleEyebrow: string,
      ) => {
        const existing = db.readingList
          .where('articleTitle', articleTitle)
          .all()[0]

        if (existing) {
          db.readingList.delete(existing.id)
          return false
        }

        db.readingList.insert({ articleTitle, articleEyebrow })
        return true
      },
      subscribe: ({ db }, email: string) => {
        const existing = db.subscribers.where('email', email).all()[0]

        if (existing) {
          return db.subscribers.all()
        }

        db.subscribers.insert({ email })
        return db.subscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [subscribeOpen, setSubscribeOpen] = useState(false)
    const [subscribeEmail, setSubscribeEmail] = useState('')
    const brand =
      props.brand ??
      "The Methanol Revolution: How Maersk's New Fleet Is Rewriting the Rules of Ocean Freight"
    const nav = props.nav?.length
      ? props.nav
      : [
          'The Logistical Review',
          'Maritime',
          'Technology',
          'Sustainability',
          'Supply Chain',
          'Subscribe',
        ]
    const hero = {
      eyebrow: 'Blog Post / Variant 4',
      title:
        "The Methanol Revolution: How Maersk's New Fleet Is Rewriting the Rules of Ocean Freight",
      description:
        "The Methanol Revolution: How Maersk's New Fleet Is Rewriting the Rules of Ocean Freight | The Logistical Review The Logistical Review Maritime Technology Sustainability Supply C...",
      primaryCta: 'Subscribe',
      secondaryCta: 'The Logistical Review',
      imageAlt:
        'Professional headshot of Eleanor Vance, a smiling woman with dark hair wearing a navy blazer',
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            value: '24/7',
            label: 'Responsive service',
          },
          {
            value: '98%',
            label: 'Positive outcomes',
          },
          {
            value: '4.9',
            label: 'Average rating',
          },
          {
            value: '12+',
            label: 'Core capabilities',
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            eyebrow: 'Overview',
            title: 'A Supply Chain for a New Fuel',
            body: "The Methanol Revolution: How Maersk's New Fleet Is Rewriting the Rules of Ocean Freight",
            items: [
              'The New Fleet in Pictures',
              'Expert Perspectives',
              'Related Reading',
            ],
          },
          {
            eyebrow: 'Experience',
            title: 'The Scale Problem',
            body: "The Methanol Revolution: How Maersk's New Fleet Is Rewriting the Rules of Ocean Freight | The Logistical Review The Logistical Review Maritime Technology Sustainability Supply C...",
            items: [
              'Weekly Maritime Intelligence',
              'FuelEU Maritime: What Shippers Need to Know Before January 2025',
              "Inside the World's First Methanol Bunkering Terminal",
            ],
          },
          {
            eyebrow: 'Proof',
            title: 'What It Means for Shippers',
            body: "Blog Post page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
          {
            eyebrow: 'Next steps',
            title: 'The New Fleet in Pictures',
            body: "Blog Post page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'A Supply Chain for a New Fuel',
            alt: 'Professional headshot of Eleanor Vance, a smiling woman with dark hair wearing a navy blazer',
            caption: 'Blog Post generated page detail',
          },
          {
            title: 'The Scale Problem',
            alt: 'A massive container ship loaded with colorful cargo containers docked at a commercial port with gantry cranes silhouetted against a golden sunset sky',
            caption: 'Blog Post generated page detail',
          },
          {
            title: 'What It Means for Shippers',
            alt: 'Close-up view of a large marine diesel engine with blue fuel pipes and brass fittings in a brightly lit engine room',
            caption: 'Blog Post generated page detail',
          },
        ]

    const readingListItems = lakebed.useQuery('readingListItems')
    const addToReadingList = lakebed.useMutation('addToReadingList')
    const subscribe = lakebed.useMutation('subscribe')
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
    const readingListCount = readingListItems?.length ?? 0
    const isArticleInReadingList = (title: string) =>
      readingListItems?.some((item) => item.articleTitle === title) ?? false

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground"
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
        className={cn('size-5', active ? 'text-primary' : 'text-foreground')}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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

    const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault()
      if (!subscribeEmail.trim()) return

      void subscribe(subscribeEmail.trim())
      setSubscribeEmail('')
      setSubscribeOpen(false)
    }

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
                        onClick={() => go('Account')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Reading List')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Reading List
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
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={subscribeOpen} onOpenChange={setSubscribeOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Reading List"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <BookmarkIcon />
                    {readingListCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {readingListCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Reading List</SheetTitle>
                    <SheetDescription>
                      {readingListCount > 0
                        ? `${readingListCount} article${readingListCount === 1 ? '' : 's'} saved for later.`
                        : 'Your reading list is empty.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {readingListItems && readingListItems.length > 0 ? (
                      <div className="space-y-4">
                        {readingListItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between rounded-lg border border-border bg-card p-4"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {item.articleEyebrow}
                              </p>
                              <h3 className="mt-1 text-sm font-semibold text-foreground">
                                {item.articleTitle}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                void addToReadingList(
                                  item.articleTitle,
                                  item.articleEyebrow,
                                )
                              }
                              className="ml-3 text-muted-foreground transition-colors hover:text-destructive"
                              aria-label={`Remove ${item.articleTitle} from reading list`}
                            >
                              <svg
                                className="size-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <BookmarkIcon />
                        <p className="mt-4 text-base font-semibold text-foreground">
                          No articles saved
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Click the bookmark icon on any article to save it for
                          later.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-3 w-full">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Subscribe to get the latest articles
                        </p>
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={subscribeEmail}
                            onChange={(e) => setSubscribeEmail(e.target.value)}
                            required
                            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            className="rounded-full"
                          >
                            Subscribe
                          </Button>
                        </form>
                      </div>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-full"
                        >
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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
                    onClick={() => setSubscribeOpen(true)}
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
                const isInReadingList = isArticleInReadingList(section.title)

                return (
                  <article
                    key={section.title}
                    className="rounded-lg border border-border bg-card p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">
                          {section.eyebrow}
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">
                          {section.title}
                        </h2>
                        <p className="mt-3 leading-7 text-muted-foreground">
                          {section.body}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void addToReadingList(section.title, section.eyebrow)
                        }
                        aria-pressed={isInReadingList}
                        aria-label={
                          isInReadingList
                            ? `Remove ${section.title} from reading list`
                            : `Add ${section.title} to reading list`
                        }
                        className={cn(
                          'mt-1 grid size-10 place-items-center rounded-full border border-border transition-all hover:scale-105',
                          isInReadingList
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <BookmarkIcon active={isInReadingList} />
                      </button>
                    </div>
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
                  onClick={() => setSubscribeOpen(true)}
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
