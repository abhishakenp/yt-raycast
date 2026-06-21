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

export const AutoDealershipKimiPage2 = defineCapsule({
  name: 'AutoDealershipKimiPage2',
  description:
    'Auto Dealership second style sibling to AutoDealershipKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
      vehicles: table({
        alt: string(),
        brand: string(),
        image: string(),
        name: string(),
        price: string(),
        year: string(),
        mileage: string(),
      }),
      testDriveBookings: table({
        vehicleName: string(),
        customerName: string(),
        customerEmail: string(),
        customerPhone: string(),
        preferredDate: string(),
        status: string(),
      }),
      favorites: table({
        vehicleName: string(),
      }),
    },
    queries: {
      vehicles: ({ db }) => db.vehicles.orderBy('createdAt').all(),
      bookings: ({ db }) => db.testDriveBookings.orderBy('createdAt').all(),
      favoriteVehicleNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.vehicleName)),
    },
    mutations: {
      bookTestDrive: (
        { db },
        vehicleName: string,
        customerName: string,
        customerEmail: string,
        customerPhone: string,
        preferredDate: string,
      ) => {
        db.testDriveBookings.insert({
          vehicleName,
          customerName,
          customerEmail,
          customerPhone,
          preferredDate,
          status: 'pending',
        })
        return db.testDriveBookings.all()
      },
      cancelBooking: ({ db }, bookingId: string) => {
        db.testDriveBookings.delete(bookingId)
        return db.testDriveBookings.all()
      },
      toggleFavorite: ({ db }, vehicleName: string) => {
        const existingFavorite = db.favorites
          .where('vehicleName', vehicleName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ vehicleName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [bookingOpen, setBookingOpen] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
    const [customerName, setCustomerName] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [preferredDate, setPreferredDate] = useState('')

    const brand = props.brand ?? 'Velocity Motors'
    const nav = props.nav?.length
      ? props.nav
      : [
          'VELOCITY MOTORS',
          'Inventory',
          'Financing',
          'How It Works',
          'Reviews',
          'FAQ',
        ]
    const hero = {
      eyebrow: 'Auto Dealership / Variant 2',
      title: 'Drive Your Dream Without the Nightmare',
      description:
        'Velocity Motors | Premium Pre-Owned Vehicles & Auto Financing VELOCITY MOTORS Inventory Financing How It Works Reviews FAQ (555) 123-4567 Schedule Test Drive Inventory Financing...',
      primaryCta: 'All',
      secondaryCta: 'Sedans',
      imageAlt:
        'Sleek black sports sedan parked in a modern showroom with dramatic lighting',
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
            title: 'The Smarter Way to Buy a Car',
            body: 'Velocity Motors | Premium Pre-Owned Vehicles & Auto Financing VELOCITY MOTORS Inventory Financing How It Works Reviews FAQ (555) 123-4567 Schedule Test Drive Inventory Financing...',
            items: [
              'Get Pre-Approved in Minutes, Not Days',
              "Don't Take Our Word For It",
              'Frequently Asked Questions',
            ],
          },
          {
            eyebrow: 'Experience',
            title: 'From Browse to Drive in 4 Steps',
            body: "Auto Dealership page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Ready to Find Your Next Vehicle?',
              '90-Day Warranty',
              'Transparent Pricing',
            ],
          },
          {
            eyebrow: 'Proof',
            title: 'Featured Vehicles',
            body: "Auto Dealership page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Bad Credit? No Problem',
              '7-Day Exchange',
              'Browse Online',
            ],
          },
          {
            eyebrow: 'Next steps',
            title: 'Get Pre-Approved in Minutes, Not Days',
            body: "Auto Dealership page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ['Schedule Test Drive', 'Get Financed', 'Drive Home'],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'From Browse to Drive in 4 Steps',
            alt: 'Sleek black sports sedan parked in a modern showroom with dramatic lighting',
            caption: 'Auto Dealership generated page detail',
          },
          {
            title: 'Featured Vehicles',
            alt: 'BMW luxury vehicle brand logo',
            caption: 'Auto Dealership generated page detail',
          },
          {
            title: 'Get Pre-Approved in Minutes, Not Days',
            alt: 'Mercedes-Benz premium automotive brand logo',
            caption: 'Auto Dealership generated page detail',
          },
        ]

    const bookings = lakebed.useQuery('bookings')
    const favoriteVehicleNames = lakebed.useQuery('favoriteVehicleNames')
    const auth = lakebed.useAuth()
    const bookTestDrive = lakebed.useMutation('bookTestDrive')
    const cancelBooking = lakebed.useMutation('cancelBooking')
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

    const handleBookTestDrive = () => {
      if (
        !selectedVehicle ||
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !preferredDate
      )
        return
      void bookTestDrive(
        selectedVehicle,
        customerName,
        customerEmail,
        customerPhone,
        preferredDate,
      )
      setBookingOpen(false)
      setSelectedVehicle(null)
      setCustomerName('')
      setCustomerEmail('')
      setCustomerPhone('')
      setPreferredDate('')
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

    const safeBookings = bookings ?? []
    const bookingCount = safeBookings.length

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
                        onClick={() => go('Bookings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Bookings
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
              <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Test Drive Bookings"
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
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                    <SheetTitle className="text-xl">
                      Test Drive Bookings
                    </SheetTitle>
                    <SheetDescription>
                      {bookingCount > 0
                        ? `${bookingCount} booking${bookingCount === 1 ? '' : 's'} scheduled.`
                        : 'No test drives scheduled yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeBookings.length ? (
                      <div className="space-y-5">
                        {safeBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <div className="flex h-full w-full items-center justify-center text-2xl">
                                🚗
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {booking.vehicleName}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {booking.customerName}
                                  </h3>
                                </div>
                                <span
                                  className={cn(
                                    'text-xs font-semibold px-2 py-1 rounded',
                                    booking.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800',
                                  )}
                                >
                                  {booking.status}
                                </span>
                              </div>
                              <div className="mt-4 space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  📅 {booking.preferredDate}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  📞 {booking.customerPhone}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ✉️ {booking.customerEmail}
                                </p>
                              </div>
                              <div className="mt-4">
                                <button
                                  type="button"
                                  onClick={() => void cancelBooking(booking.id)}
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                                >
                                  Cancel Booking
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No test drives scheduled
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Browse our inventory and schedule your first test
                          drive.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-full"
                      >
                        Continue
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
                            if (item === 'Schedule Test Drive') {
                              setSelectedVehicle('Featured Vehicle')
                              setBookingOpen(true)
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
              {gallery.map((item) => {
                const isFavorite =
                  favoriteVehicleNames?.has(item.title) ?? false
                return (
                  <article
                    key={item.title}
                    className="group overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        alt={item.alt}
                        w={900}
                        h={700}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVehicle(item.title)
                          setBookingOpen(true)
                        }}
                        className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Schedule Test Drive
                      </button>
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
                  onClick={() => go(hero.primaryCta)}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {hero.primaryCta}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Test Drive Booking Form Sheet */}
        <Sheet
          open={bookingOpen && selectedVehicle !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedVehicle(null)
              setCustomerName('')
              setCustomerEmail('')
              setCustomerPhone('')
              setPreferredDate('')
            }
            setBookingOpen(open)
          }}
        >
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Schedule Test Drive</SheetTitle>
              <SheetDescription>
                Book a test drive for {selectedVehicle}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleBookTestDrive()
                }}
              >
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customerEmail"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customerPhone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label
                    htmlFor="preferredDate"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Preferred Date
                  </label>
                  <input
                    id="preferredDate"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </form>
            </div>
            <SheetFooter className="border-t border-border p-6">
              <div className="grid grid-cols-2 gap-2 w-full">
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={handleBookTestDrive}
                  disabled={
                    !selectedVehicle ||
                    !customerName ||
                    !customerEmail ||
                    !customerPhone ||
                    !preferredDate
                  }
                >
                  Book Test Drive
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

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
