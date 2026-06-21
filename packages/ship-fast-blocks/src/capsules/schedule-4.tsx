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

export const ScheduleKimiPage4 = defineCapsule({
  name: 'ScheduleKimiPage4',
  description:
    'Schedule fourth style sibling to ScheduleKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
      classes: table({
        name: string(),
        instructor: string(),
        time: string(),
        duration: string(),
        level: string(),
        capacity: number(),
        alt: string(),
      }),
      bookings: table({
        className: string(),
        userId: string(),
      }),
    },
    queries: {
      classes: ({ db }) => db.classes.orderBy('createdAt').all(),
      userBookings: ({ db }) =>
        db.bookings.all().flatMap((booking) => {
          const classItem = db.classes.where('name', booking.className).all()[0]
          return classItem ? [{ ...booking, classItem }] : []
        }),
    },
    mutations: {
      bookClass: ({ db }, className: string, userId: string) => {
        const classItem = db.classes.where('name', className).all()[0]
        if (!classItem) return db.bookings.all()

        const existingBooking = db.bookings
          .where('className', className)
          .where('userId', userId)
          .all()[0]

        if (existingBooking) {
          return db.bookings.all()
        }

        db.bookings.insert({
          className,
          userId,
        })

        return db.bookings.all()
      },
      cancelBooking: ({ db }, bookingId: string) => {
        for (const booking of db.bookings.where('id', bookingId).all()) {
          db.bookings.delete(booking.id)
        }

        return db.bookings.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [bookingsOpen, setBookingsOpen] = useState(false)
    const brand = props.brand ?? 'Class Schedule'
    const nav = props.nav?.length
      ? props.nav
      : ['Schedule', 'Workshops', 'Artists', 'Gallery']

    const hero = {
      eyebrow: 'Schedule / Variant 4',
      title: 'Workshop Schedule',
      description:
        'Class Schedule Art Studio Schedule Workshops Artists Gallery Workshop Schedule Unleash your creativity with our art classes All Workshops Painting Drawing Ceramics Photography P...',
      primaryCta: 'All Workshops',
      secondaryCta: 'Painting',
      imageAlt: 'schedule hero scene',
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
            title: 'Watercolor Basics',
            body: 'Class Schedule Art Studio Schedule Workshops Artists Gallery Workshop Schedule Unleash your creativity with our art classes All Workshops Painting Drawing Ceramics Photography P...',
            items: ['Outdoor Photography'],
          },
          {
            eyebrow: 'Experience',
            title: 'Portrait Sketching',
            body: "Schedule page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
          {
            eyebrow: 'Proof',
            title: 'Wheel Throwing 101',
            body: "Schedule page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
          {
            eyebrow: 'Next steps',
            title: 'Outdoor Photography',
            body: "Schedule page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'Portrait Sketching',
            alt: 'schedule hero scene',
            caption: 'Schedule generated page detail',
          },
          {
            title: 'Wheel Throwing 101',
            alt: 'schedule customer experience',
            caption: 'Schedule generated page detail',
          },
          {
            title: 'Outdoor Photography',
            alt: 'schedule service detail',
            caption: 'Schedule generated page detail',
          },
        ]

    const staticClasses = [
      {
        name: 'Watercolor Basics',
        instructor: 'Maya Chen',
        time: 'Mon 10:00 AM',
        duration: '75 min',
        level: 'Beginner',
        capacity: 14,
        alt: 'schedule hero scene',
      },
      {
        name: 'Portrait Sketching',
        instructor: 'Lena Ortiz',
        time: 'Tue 2:00 PM',
        duration: '60 min',
        level: 'Intermediate',
        capacity: 10,
        alt: 'schedule hero scene',
      },
      {
        name: 'Wheel Throwing 101',
        instructor: 'Noah Kim',
        time: 'Wed 4:00 PM',
        duration: '90 min',
        level: 'All levels',
        capacity: 8,
        alt: 'schedule service detail',
      },
      {
        name: 'Outdoor Photography',
        instructor: 'Ari Rivera',
        time: 'Thu 6:30 PM',
        duration: '60 min',
        level: 'Beginner',
        capacity: 12,
        alt: 'schedule customer experience',
      },
    ]

    const storedClasses = lakebed.useQuery('classes')
    const userBookings = lakebed.useQuery('userBookings')
    const auth = lakebed.useAuth()
    const bookClass = lakebed.useMutation('bookClass')
    const cancelBooking = lakebed.useMutation('cancelBooking')

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

    const safeUserBookings = userBookings ?? []
    const bookingCount = safeUserBookings.length
    const displayClasses =
      storedClasses && storedClasses.length > 0 ? storedClasses : staticClasses
    const findClassByName = (name: string) =>
      displayClasses.find((classItem) => classItem.name === name)

    const durationToMinutes = (duration: string) => {
      const normalized = Number.parseInt(duration.replace(/[^0-9]/g, ''), 10)
      return Number.isFinite(normalized) ? normalized : 0
    }
    const bookedMinutes = safeUserBookings.reduce(
      (total, booking) => total + durationToMinutes(booking.classItem.duration),
      0,
    )
    const bookedHours = Math.round((bookedMinutes / 60) * 100) / 100

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const handleSectionItem = (item: string) => {
      const classItem = findClassByName(item)
      if (!classItem) {
        go(item)
        return
      }

      const booking = safeUserBookings.find(
        (entry) => entry.classItem.name === item,
      )

      if (auth.isLoading) return

      if (!isSignedIn) {
        handleSignIn()
        return
      }

      if (booking) {
        void cancelBooking(booking.id)
        return
      }

      void bookClass(item, auth.user?.id || authEmail || 'guest')
      setBookingsOpen(true)
    }

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
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={() => go('My Bookings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Bookings
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
              <Sheet open={bookingsOpen} onOpenChange={setBookingsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="My workshops"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <CalendarIcon />
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
                    <SheetTitle className="text-xl">My Workshops</SheetTitle>
                    <SheetDescription>
                      {bookingCount > 0
                        ? `${bookingCount} workshop${bookingCount === 1 ? '' : 's'} already saved.`
                        : 'No workshops saved yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeUserBookings.length ? (
                      <div className="space-y-4">
                        {safeUserBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-4 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={booking.classItem.alt}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {booking.classItem.instructor}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {booking.classItem.name}
                                  </h3>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {booking.classItem.time}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {booking.classItem.duration} ·{' '}
                                    {booking.classItem.level}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <button
                                  type="button"
                                  onClick={() => void cancelBooking(booking.id)}
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Cancel booking
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No workshops yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Tap a section item to save a workshop into this list.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Booked workshops</span>
                        <span>{bookingCount}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-foreground">
                        <span>Estimated hours</span>
                        <span>{bookedHours}h</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      onClick={() => go(hero.primaryCta)}
                    >
                      {hero.primaryCta}
                    </Button>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                      >
                        Close
                      </Button>
                    </SheetClose>
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
              {sections.map((section) => (
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
                      {section.items.map((item) => {
                        const classItem = findClassByName(item)
                        const isBooked = safeUserBookings.some(
                          (booking) => booking.classItem.name === item,
                        )
                        const itemAction =
                          classItem && !isSignedIn && !auth.isLoading
                            ? 'Sign in to save'
                            : classItem
                              ? isBooked
                                ? 'Booked'
                                : 'Book'
                              : 'Open'

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleSectionItem(item)}
                            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <span>{item}</span>
                            <span className="text-primary">{itemAction}</span>
                          </button>
                        )
                      })}
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
