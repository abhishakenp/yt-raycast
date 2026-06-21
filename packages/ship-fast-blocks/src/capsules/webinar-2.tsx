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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

export const WebinarKimiPage2 = defineCapsule({
  name: 'WebinarKimiPage2',
  description:
    'Webinar second style sibling to WebinarKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
      registrations: table({
        email: string(),
        name: string(),
        webinarTitle: string(),
        registeredAt: string(),
      }),
      reminders: table({
        email: string(),
        webinarTitle: string(),
        reminderTime: string(),
        sent: number(),
      }),
    },
    queries: {
      registrations: ({ db }) => db.registrations.orderBy('createdAt').all(),
    },
    mutations: {
      registerForWebinar: (
        { db },
        email: string,
        name: string,
        webinarTitle: string,
      ) => {
        const existing = db.registrations
          .where('email', email)
          .where('webinarTitle', webinarTitle)
          .all()[0]

        if (existing) {
          return db.registrations.all()
        }

        db.registrations.insert({
          email,
          name,
          webinarTitle,
          registeredAt: new Date().toISOString(),
        })

        return db.registrations.all()
      },
      cancelRegistration: ({ db }, email: string, webinarTitle: string) => {
        for (const reg of db.registrations
          .where('email', email)
          .where('webinarTitle', webinarTitle)
          .all()) {
          db.registrations.delete(reg.id)
        }

        return db.registrations.all()
      },
      setReminder: (
        { db },
        email: string,
        webinarTitle: string,
        reminderTime: string,
      ) => {
        const existing = db.reminders
          .where('email', email)
          .where('webinarTitle', webinarTitle)
          .all()[0]

        if (existing) {
          db.reminders.update(existing.id, { reminderTime, sent: 0 })
        } else {
          db.reminders.insert({
            email,
            webinarTitle,
            reminderTime,
            sent: 0,
          })
        }

        return db.reminders.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [registrationsOpen, setRegistrationsOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const auth = lakebed.useAuth()
    const registrations = lakebed.useQuery('registrations')
    const registerForWebinar = lakebed.useMutation('registerForWebinar')
    const cancelRegistration = lakebed.useMutation('cancelRegistration')

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

    const brand =
      props.brand ?? 'Ship Faster 2026 Free Webinar on Modern Web Development'
    const nav = props.nav?.length
      ? props.nav
      : [
          "Ship Faster '26",
          'Agenda',
          'Speakers',
          'Pricing',
          'FAQ',
          'Register Free',
        ]
    const hero = {
      eyebrow: 'Webinar / Variant 2',
      title: 'Ship Faster 2026',
      description:
        "Ship Faster 2026 Free Webinar on Modern Web Development Ship Faster '26 Agenda Speakers Pricing FAQ Register Free Live Webinar June 15, 2026 Ship Faster 2026 Join 12,500+ develo...",
      primaryCta: 'Reserve My Seat Free',
      secondaryCta: "Ship Faster '26",
      imageAlt:
        'Wide shot of a modern tech conference audience seated in a dark auditorium facing a brightly lit stage',
      ...props.hero,
    }

    const myRegistrations: any[] = authEmail
      ? ((registrations as any[] | undefined)?.filter(
          (r: any) => r.email === authEmail,
        ) ?? [])
      : []

    const isRegistered = myRegistrations.some(
      (r: any) => r.webinarTitle === hero.title,
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
            title: 'Reserve your free seat',
            body: "Ship Faster 2026 Free Webinar on Modern Web Development Ship Faster '26 Agenda Speakers Pricing FAQ Register Free Live Webinar June 15, 2026 Ship Faster 2026 Join 12,500+ develo...",
            items: [
              "Last year's event",
              'Choose your pass',
              'Loved by developers',
            ],
          },
          {
            eyebrow: 'Experience',
            title: "What you'll learn in 90 minutes",
            body: "Webinar page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Frequently asked questions',
              'Ready to ship faster?',
              'Edge-First Architecture',
            ],
          },
          {
            eyebrow: 'Proof',
            title: 'Get started in 60 seconds',
            body: "Webinar page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Design Systems at Scale',
              'Zero-Config Deployment',
              'Performance Budgeting',
            ],
          },
          {
            eyebrow: 'Next steps',
            title: "Last year's event",
            body: "Webinar page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Register free',
              'Get calendar invite',
              'Join live + network',
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "What you'll learn in 90 minutes",
            alt: 'Wide shot of a modern tech conference audience seated in a dark auditorium facing a brightly lit stage',
            caption: 'Webinar generated page detail',
          },
          {
            title: 'Get started in 60 seconds',
            alt: 'Professional headshot of Sarah Chen, a smiling woman with short hair wearing a navy blazer',
            caption: 'Webinar generated page detail',
          },
          {
            title: "Last year's event",
            alt: 'Professional headshot of Marcus Johnson, a bearded man in a charcoal suit',
            caption: 'Webinar generated page detail',
          },
        ]

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
              <Sheet
                open={registrationsOpen}
                onOpenChange={setRegistrationsOpen}
              >
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <CalendarIcon />
                    <span className="hidden sm:inline">My Registrations</span>
                    {myRegistrations.length > 0 ? (
                      <span className="ml-1 grid size-5 place-items-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                        {myRegistrations.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">
                      My Registrations
                    </SheetTitle>
                    <SheetDescription>
                      {myRegistrations.length > 0
                        ? `${myRegistrations.length} webinar${myRegistrations.length === 1 ? '' : 's'} registered.`
                        : 'No registrations yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {myRegistrations.length ? (
                      <div className="space-y-4">
                        {myRegistrations.map((reg: any) => (
                          <div
                            key={reg.id}
                            className="rounded-lg border border-border bg-card p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-foreground">
                                  {reg.webinarTitle}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {reg.email}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Registered{' '}
                                  {new Date(
                                    reg.registeredAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  void cancelRegistration(
                                    reg.email,
                                    reg.webinarTitle,
                                  )
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No registrations yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Register for a webinar to get started.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                      >
                        Close
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
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
                        <ChevronDown />
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
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v) => !v)}
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
          {mobileMenuOpen && (
            <div className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
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
                        setMobileMenuOpen(false)
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
                      setMobileMenuOpen(false)
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
                  {isSignedIn ? (
                    isRegistered ? (
                      <button
                        type="button"
                        onClick={() => setRegistrationsOpen(true)}
                        className="rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
                      >
                        ✓ Registered
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          void registerForWebinar(
                            authEmail ?? '',
                            authDisplayName,
                            hero.title,
                          )
                        }}
                        className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        {hero.primaryCta}
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={handleSignIn}
                      disabled={auth.isLoading}
                      className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                    >
                      {hero.primaryCta}
                    </button>
                  )}
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
                {isSignedIn ? (
                  isRegistered ? (
                    <button
                      type="button"
                      onClick={() => setRegistrationsOpen(true)}
                      className="rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
                    >
                      ✓ Registered
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        void registerForWebinar(
                          authEmail ?? '',
                          authDisplayName,
                          hero.title,
                        )
                      }}
                      className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {hero.primaryCta}
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                  >
                    {hero.primaryCta}
                  </button>
                )}
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
