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

export const FitnessKimiPage3 = defineCapsule({
  name: 'FitnessKimiPage3',
  description:
    'Fitness third style sibling to FitnessKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions. Now full-stack with Lakebed: class booking system, contact inquiry form, Google authentication, and a bookings drawer for managing scheduled classes.',
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
      bookings: table({
        className: string(),
        date: string(),
        time: string(),
        status: string(),
      }),
      inquiries: table({
        name: string(),
        email: string(),
        message: string(),
        status: string(),
      }),
    },
    queries: {
      bookings: ({ db }) => db.bookings.orderBy('createdAt').all(),
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
    },
    mutations: {
      addBooking: ({ db }, className: string, date: string, time: string) => {
        db.bookings.insert({
          className,
          date,
          time,
          status: 'confirmed',
        })
        return db.bookings.all()
      },
      cancelBooking: ({ db }, bookingId: string) => {
        db.bookings.delete(bookingId)
        return db.bookings.all()
      },
      submitInquiry: ({ db }, name: string, email: string, message: string) => {
        db.inquiries.insert({
          name,
          email,
          message,
          status: 'pending',
        })
        return db.inquiries.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [bookingsOpen, setBookingsOpen] = useState(false)
    const [inquiryOpen, setInquiryOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [inquiryName, setInquiryName] = useState('')
    const [inquiryEmail, setInquiryEmail] = useState('')
    const [inquiryMessage, setInquiryMessage] = useState('')

    const brand = props.brand ?? 'Apex Fitness Studio Train Without Limits'
    const nav = props.nav?.length
      ? props.nav
      : ['Schedule', 'Trainers', 'Amenities', 'Membership', 'FAQ', 'Join Now']
    const hero = {
      eyebrow: 'Fitness / Variant 3',
      title: 'Forge Your Legacy',
      description:
        'Apex Fitness Studio Train Without Limits APEX Schedule Trainers Amenities Membership FAQ Join Now Now enrolling June 2026 Forge Your Legacy Apex is a 12,500 sq ft training sanct...',
      primaryCta: 'Join',
      secondaryCta: 'APEX',
      imageAlt: 'member headshot portrait: smiling man with short beard',
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
            title: 'Engineered for Excellence',
            body: 'Apex Fitness Studio Train Without Limits APEX Schedule Trainers Amenities Membership FAQ Join Now Now enrolling June 2026 Forge Your Legacy Apex is a 12,500 sq ft training sanct...',
            items: [
              'Inside the Facility',
              'Memberships',
              'Start Training in 3 Moves',
            ],
          },
          {
            eyebrow: 'Experience',
            title: 'Weekly Class Schedule',
            body: "Fitness page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ['What Athletes Say', 'Common Questions', 'Ready to Train?'],
          },
          {
            eyebrow: 'Proof',
            title: 'Meet the Architects',
            body: "Fitness page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ['24/7 Access', 'Olympic Lifting Zone', 'Recovery Suite'],
          },
          {
            eyebrow: 'Next steps',
            title: 'Inside the Facility',
            body: "Fitness page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Climate Controlled',
              'Advanced Air Filtration',
              'Smart Lockers',
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'Weekly Class Schedule',
            alt: 'member headshot portrait: smiling man with short beard',
            caption: 'Fitness generated page detail',
          },
          {
            title: 'Meet the Architects',
            alt: 'member headshot portrait: woman with dark wavy hair',
            caption: 'Fitness generated page detail',
          },
          {
            title: 'Inside the Facility',
            alt: 'member headshot portrait: young man wearing glasses',
            caption: 'Fitness generated page detail',
          },
        ]

    // Lakebed hooks
    const bookings = lakebed.useQuery('bookings')
    const addBooking = lakebed.useMutation('addBooking')
    const cancelBooking = lakebed.useMutation('cancelBooking')
    const submitInquiry = lakebed.useMutation('submitInquiry')
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

    const handleBookClass = (className: string) => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const date = tomorrow.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
      const time = '9:00 AM'
      void addBooking(className, date, time)
      setBookingsOpen(true)
    }

    const handleSubmitInquiry = (e: React.FormEvent) => {
      e.preventDefault()
      if (!inquiryName || !inquiryEmail || !inquiryMessage) return
      void submitInquiry(inquiryName, inquiryEmail, inquiryMessage)
      setInquiryName('')
      setInquiryEmail('')
      setInquiryMessage('')
      setInquiryOpen(false)
    }

    const safeBookings = bookings ?? []
    const bookingCount = safeBookings.length

    // Helper icons
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
                        onClick={() => go('Schedule')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Schedule
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Membership')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Membership
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
              <Sheet open={bookingsOpen} onOpenChange={setBookingsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="My Bookings"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
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
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {bookingCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {bookingCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">My Bookings</SheetTitle>
                    <SheetDescription>
                      {bookingCount > 0
                        ? `${bookingCount} class${bookingCount === 1 ? '' : 'es'} booked.`
                        : 'No classes booked yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeBookings.length ? (
                      <div className="space-y-4">
                        {safeBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {booking.className}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {booking.date} at {booking.time}
                                </p>
                              </div>
                              <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                {booking.status}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => void cancelBooking(booking.id)}
                            >
                              Cancel Booking
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No bookings yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Book a class from the Schedule to get started.
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
              <Sheet open={inquiryOpen} onOpenChange={setInquiryOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Contact Us"
                    className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
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
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Contact Us</SheetTitle>
                    <SheetDescription>
                      Send us a message and we'll get back to you within 24
                      hours.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <form onSubmit={handleSubmitInquiry} className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="inquiry-name"
                          className="text-sm font-medium text-foreground"
                        >
                          Name
                        </label>
                        <input
                          id="inquiry-name"
                          type="text"
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="Your name"
                          required
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="inquiry-email"
                          className="text-sm font-medium text-foreground"
                        >
                          Email
                        </label>
                        <input
                          id="inquiry-email"
                          type="email"
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="inquiry-message"
                          className="text-sm font-medium text-foreground"
                        >
                          Message
                        </label>
                        <textarea
                          id="inquiry-message"
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          placeholder="How can we help you?"
                          required
                          rows={4}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      </div>
                    </form>
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setInquiryOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleSubmitInquiry}
                      disabled={
                        !inquiryName || !inquiryEmail || !inquiryMessage
                      }
                    >
                      Send Message
                    </Button>
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
              <div className="mt-2 space-y-3">
                <div className="rounded-xl border border-border bg-muted/40 p-3">
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => {
                    setMobileOpen(false)
                    setInquiryOpen(true)
                  }}
                >
                  Contact Us
                </Button>
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
                            // Class/schedule-related sections trigger booking
                            if (
                              section.eyebrow === 'Experience' ||
                              section.eyebrow === 'Proof'
                            ) {
                              handleBookClass(item)
                            } else {
                              go(item)
                            }
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
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => go(hero.primaryCta)}
                    className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryOpen(true)}
                    className="rounded-md border border-border bg-background/10 px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-background/20"
                  >
                    Contact Us
                  </button>
                </div>
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
