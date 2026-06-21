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

export const InteriorDesignKimiPage2 = defineCapsule({
  name: 'InteriorDesignKimiPage2',
  description:
    'Interior Design second style sibling to InteriorDesignKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
        message: string(),
        status: string(),
      }),
      savedProjects: table({
        projectTitle: string(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
      savedProjectTitles: ({ db }) =>
        new Set(db.savedProjects.all().map((p) => p.projectTitle)),
    },
    mutations: {
      submitInquiry: ({ db }, name: string, email: string, message: string) => {
        db.inquiries.insert({ name, email, message, status: 'pending' })
        return db.inquiries.all()
      },
      toggleSaved: ({ db }, projectTitle: string) => {
        const existing = db.savedProjects
          .where('projectTitle', projectTitle)
          .all()[0]
        if (existing) {
          db.savedProjects.delete(existing.id)
          return false
        }
        db.savedProjects.insert({ projectTitle })
        return true
      },
      deleteInquiry: ({ db }, id: string) => {
        db.inquiries.delete(id)
        return db.inquiries.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [inquiryOpen, setInquiryOpen] = useState(false)
    const [inquiryName, setInquiryName] = useState('')
    const [inquiryEmail, setInquiryEmail] = useState('')
    const [inquiryMessage, setInquiryMessage] = useState('')

    const brand = props.brand ?? 'Atelier Verve Interior Design Studio'
    const nav = props.nav?.length
      ? props.nav
      : ['Atelier Verve', 'Work', 'Services', 'Process', 'Pricing', 'About']
    const hero = {
      eyebrow: 'Interior Design / Variant 2',
      title: 'Spaces that inspire living.',
      description:
        'Atelier Verve Interior Design Studio Atelier Verve Work Services Process Pricing About FAQ Book a Call Award-Winning Interior Design Spaces that inspire living. We design bold,...',
      primaryCta: 'Send Inquiry',
      secondaryCta: 'Atelier Verve',
      imageAlt: 'professional headshot of a smiling woman with dark hair',
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
            title: 'Services designed around your life.',
            body: 'Atelier Verve Interior Design Studio Atelier Verve Work Services Process Pricing About FAQ Book a Call Award-Winning Interior Design Spaces that inspire living. We design bold,...',
            items: [
              'Kind words from people we have worked with.',
              'Investment options for every scope.',
              'Questions we hear often.',
            ],
          },
          {
            eyebrow: 'Experience',
            title: 'How we bring a space to life.',
            body: "Interior Design page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Ready to transform your space?',
              'Residential Design',
              'Hospitality & F&B',
            ],
          },
          {
            eyebrow: 'Proof',
            title: 'Projects that defy the ordinary.',
            body: "Interior Design page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ['Interior Styling', 'Bespoke Furniture', 'Lighting Design'],
          },
          {
            eyebrow: 'Next steps',
            title: 'Kind words from people we have worked with.',
            body: "Interior Design page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Project Management',
              'Discovery & Brief',
              'Concept & Design',
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'How we bring a space to life.',
            alt: 'professional headshot of a smiling woman with dark hair',
            caption: 'Interior Design generated page detail',
          },
          {
            title: 'Projects that defy the ordinary.',
            alt: 'professional headshot of a man with curly hair and glasses',
            caption: 'Interior Design generated page detail',
          },
          {
            title: 'Kind words from people we have worked with.',
            alt: 'professional headshot of a woman with blonde hair smiling',
            caption: 'Interior Design generated page detail',
          },
        ]

    // Lakebed
    const inquiries = lakebed.useQuery('inquiries')
    const savedProjectTitles = lakebed.useQuery('savedProjectTitles')
    const submitInquiry = lakebed.useMutation('submitInquiry')
    const toggleSaved = lakebed.useMutation('toggleSaved')
    const deleteInquiry = lakebed.useMutation('deleteInquiry')
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
        .map((p) => p[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'

    const safeInquiries = inquiries ?? []
    const inquiryCount = safeInquiries.length

    const handleSignIn = () => {
      if (!auth.isLoading) void lakebed.signInWithGoogle()
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
                      className="hidden h-9 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted sm:inline-flex"
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
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        Account <ArrowRight />
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
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
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  aria-label="Sign in with Google"
                  className="hidden h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              {/* Inquiry drawer trigger */}
              <Sheet open={inquiryOpen} onOpenChange={setInquiryOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                    {inquiryCount > 0 && (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {inquiryCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Send an Inquiry</SheetTitle>
                    <SheetDescription>
                      {inquiryCount > 0
                        ? `${inquiryCount} inquiry${inquiryCount === 1 ? '' : 's'} submitted this session.`
                        : "Tell us about your project and we'll get back to you."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="inq-name"
                        className="text-sm font-medium text-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="inq-name"
                        type="text"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="inq-email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="inq-email"
                        type="email"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="inq-message"
                        className="text-sm font-medium text-foreground"
                      >
                        Message
                      </label>
                      <textarea
                        id="inq-message"
                        rows={4}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Describe your project..."
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {safeInquiries.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Submitted
                        </p>
                        <div className="space-y-2">
                          {safeInquiries.map((inq) => (
                            <div
                              key={inq.id}
                              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {inq.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {inq.email}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                  {inq.message}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void deleteInquiry(inq.id)}
                                className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6 gap-2">
                    <Button
                      type="button"
                      className="w-full"
                      disabled={
                        !inquiryName.trim() ||
                        !inquiryEmail.trim() ||
                        !inquiryMessage.trim()
                      }
                      onClick={() => {
                        void submitInquiry(
                          inquiryName.trim(),
                          inquiryEmail.trim(),
                          inquiryMessage.trim(),
                        )
                        setInquiryName('')
                        setInquiryEmail('')
                        setInquiryMessage('')
                      }}
                    >
                      Submit Inquiry
                    </Button>
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
                const isSaved = savedProjectTitles?.has(item.title) ?? false
                return (
                  <article
                    key={item.title}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <div className="relative">
                      <Image
                        alt={item.alt}
                        w={900}
                        h={700}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => void toggleSaved(item.title)}
                        aria-pressed={isSaved}
                        aria-label={
                          isSaved
                            ? `Remove ${item.title} from saved`
                            : `Save ${item.title}`
                        }
                        className={cn(
                          'absolute right-3 top-3 grid size-9 place-items-center rounded-full shadow-md transition-all',
                          isSaved
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-foreground hover:bg-background',
                        )}
                      >
                        <svg
                          className="size-4"
                          fill={isSaved ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
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
