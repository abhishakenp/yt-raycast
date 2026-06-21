import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
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

export const EventPlannerKimiPage2 = defineCapsule({
  name: 'EventPlannerKimiPage2',
  description:
    'Event Planner second style sibling to EventPlannerKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
      inquiries: table({
        name: string(),
        email: string(),
        eventType: string(),
        date: string(),
        message: string(),
      }),
      favorites: table({
        galleryTitle: string(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
      favoriteGalleryTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.galleryTitle)),
    },
    mutations: {
      submitInquiry: (
        { db },
        name: string,
        email: string,
        eventType: string,
        date: string,
        message: string,
      ) => {
        db.inquiries.insert({
          name,
          email,
          eventType,
          date,
          message,
        })
        return db.inquiries.all()
      },
      toggleFavorite: ({ db }, galleryTitle: string) => {
        const existingFavorite = db.favorites
          .where('galleryTitle', galleryTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ galleryTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [inquiryOpen, setInquiryOpen] = useState(false)
    const [inquiryForm, setInquiryForm] = useState({
      name: '',
      email: '',
      eventType: '',
      date: '',
      message: '',
    })
    const brand = props.brand ?? 'Aura Event Design'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Process', 'Gallery', 'Pricing', 'FAQ', 'Start Planning']
    const hero = {
      eyebrow: 'Event Planner / Variant 2',
      title: 'Events that leave a mark.',
      description:
        "Aura Event Design | Austin's Premier Event Planning Studio AURA . Services Process Gallery Pricing FAQ Start Planning Services Process Gallery Pricing FAQ Start Planning Rated 5...",
      primaryCta: 'Send Inquiry',
      secondaryCta: 'AURA .',
      imageAlt:
        'elegant wedding reception long table adorned with glowing candles and suspended Edison bulbs',
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
            title: 'Full-service event production',
            body: "Aura Event Design | Austin's Premier Event Planning Studio AURA . Services Process Gallery Pricing FAQ Start Planning Services Process Gallery Pricing FAQ Start Planning Rated 5...",
            items: ['Investment', 'Client love', 'Common questions'],
          },
          {
            eyebrow: 'Experience',
            title: 'How we work',
            body: "Event Planner page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Ready to celebrate?',
              'Strategic Planning',
              'Venue Sourcing',
            ],
          },
          {
            eyebrow: 'Proof',
            title: 'Recent celebrations',
            body: "Event Planner page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ['Creative Direction', 'Guest Management', 'Discovery Call'],
          },
          {
            eyebrow: 'Next steps',
            title: 'Investment',
            body: "Event Planner page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ['Concept & Design', 'Coordination', 'The Celebration'],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'How we work',
            alt: 'elegant wedding reception long table adorned with glowing candles and suspended Edison bulbs',
            caption: 'Event Planner generated page detail',
          },
          {
            title: 'Recent celebrations',
            alt: 'elegant outdoor wedding reception long table adorned with glowing candles and suspended string lights',
            caption: 'Event Planner generated page detail',
          },
          {
            title: 'Investment',
            alt: 'aerial view of an outdoor garden wedding ceremony with white chairs and a floral arch',
            caption: 'Event Planner generated page detail',
          },
        ]

    const inquiries = lakebed.useQuery('inquiries')
    const favoriteGalleryTitles = lakebed.useQuery('favoriteGalleryTitles')
    const auth = lakebed.useAuth()
    const submitInquiry = lakebed.useMutation('submitInquiry')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
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
    const handleInquirySubmit = (e: React.FormEvent) => {
      e.preventDefault()
      void submitInquiry(
        inquiryForm.name,
        inquiryForm.email,
        inquiryForm.eventType,
        inquiryForm.date,
        inquiryForm.message,
      )
      setInquiryForm({
        name: '',
        email: '',
        eventType: '',
        date: '',
        message: '',
      })
      setInquiryOpen(false)
    }

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
                        onClick={() => go('Inquiries')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Inquiries
                        <span className="text-xs text-muted-foreground">
                          {inquiries?.length ?? 0}
                        </span>
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
              <Sheet open={inquiryOpen} onOpenChange={setInquiryOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setInquiryOpen(true)}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Send Inquiry</SheetTitle>
                    <SheetDescription>
                      Tell us about your event and we'll get back to you within
                      24 hours.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={inquiryForm.name}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={inquiryForm.email}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="eventType"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Event Type
                        </label>
                        <input
                          id="eventType"
                          type="text"
                          required
                          value={inquiryForm.eventType}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              eventType: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Wedding, Corporate, etc."
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="date"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Preferred Date
                        </label>
                        <input
                          id="date"
                          type="date"
                          required
                          value={inquiryForm.date}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              date: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="message"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          required
                          value={inquiryForm.message}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              message: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Tell us about your vision..."
                        />
                      </div>
                    </form>
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setInquiryOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="rounded-full"
                      onClick={handleInquirySubmit}
                    >
                      Submit Inquiry
                    </Button>
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
                    onClick={() => setInquiryOpen(true)}
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
              {gallery.map((item) => {
                const isFavorite =
                  favoriteGalleryTitles?.has(item.title) ?? false
                return (
                  <article
                    key={item.title}
                    className="group relative overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <Image
                      alt={item.alt}
                      w={900}
                      h={700}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => void toggleFavorite(item.title)}
                      aria-pressed={isFavorite}
                      aria-label={
                        isFavorite
                          ? `Remove ${item.title} from favorites`
                          : `Add ${item.title} to favorites`
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
                )
              })}
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
                  onClick={() => setInquiryOpen(true)}
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
