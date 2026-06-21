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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

export const PetVeterinaryKimiPage3 = defineCapsule({
  name: 'PetVeterinaryKimiPage3',
  description:
    'Pet Veterinary third style sibling to PetVeterinaryKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
      services: table({
        name: string(),
        description: string(),
        price: string(),
        category: string(),
      }),
      appointments: table({
        serviceId: string(),
        serviceName: string(),
        petName: string(),
        date: string(),
        time: string(),
        status: string(),
      }),
    },
    queries: {
      services: ({ db }) => db.services.orderBy('createdAt').all(),
      appointments: ({ db }) => db.appointments.orderBy('createdAt').all(),
    },
    mutations: {
      bookAppointment: (
        { db },
        serviceName: string,
        petName: string,
        date: string,
        time: string,
      ) => {
        const service = db.services.where('name', serviceName).all()[0]
        if (!service) return db.appointments.all()

        db.appointments.insert({
          serviceId: service.id,
          serviceName,
          petName,
          date,
          time,
          status: 'pending',
        })

        return db.appointments.all()
      },
      cancelAppointment: ({ db }, appointmentId: string) => {
        for (const item of db.appointments.where('id', appointmentId).all()) {
          db.appointments.delete(item.id)
        }

        return db.appointments.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [bookingOpen, setBookingOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [petName, setPetName] = useState('')
    const [appointmentDate, setAppointmentDate] = useState('')
    const [appointmentTime, setAppointmentTime] = useState('')
    const brand = props.brand ?? 'Lumina Veterinary Hospital'
    const nav = props.nav?.length
      ? props.nav
      : [
          'Services',
          'Our Team',
          'Pricing',
          'Reviews',
          'FAQ',
          'Lumina Veterinary Hospital',
        ]
    const hero = {
      eyebrow: 'Pet Veterinary / Variant 3',
      title: 'Where Every Pet Is Family',
      description:
        'Lumina Veterinary Hospital | Compassionate Care for Every Pet Lumina Veterinary Hospital Services Our Team Pricing Reviews FAQ (503) 555-1234 Book Appointment Services Our Team...',
      primaryCta: 'Book Online',
      secondaryCta: 'Lumina Veterinary Hospital',
      imageAlt:
        'Golden retriever receiving gentle examination from a female veterinarian in a modern clinic',
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
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'Simple Process',
            alt: 'Golden retriever receiving gentle examination from a female veterinarian in a modern clinic',
            caption: 'Pet Veterinary generated page detail',
          },
          {
            title: 'Our Facility',
            alt: 'Person using a smartphone to book a medical appointment online',
            caption: 'Pet Veterinary generated page detail',
          },
          {
            title: 'Transparent Pricing',
            alt: 'Veterinarian examining a calm beagle on an examination table in a bright modern clinic',
            caption: 'Pet Veterinary generated page detail',
          },
        ]

    const defaultServices = [
      {
        name: 'Wellness & Preventive Care',
        description: 'Comprehensive health checkups and preventive treatments',
        price: '$75',
        category: 'Wellness',
      },
      {
        name: 'Vaccinations',
        description: 'Core and lifestyle vaccines for all life stages',
        price: '$45',
        category: 'Preventive',
      },
      {
        name: 'Dental Care',
        description: 'Professional cleaning and oral health assessments',
        price: '$150',
        category: 'Dental',
      },
      {
        name: 'Diagnostics & Imaging',
        description: 'Advanced diagnostic testing and imaging services',
        price: '$200',
        category: 'Diagnostics',
      },
      {
        name: '24/7 Emergency Care',
        description: 'Round-the-clock emergency veterinary services',
        price: '$250',
        category: 'Emergency',
      },
      {
        name: 'Surgery',
        description: 'Soft tissue and orthopedic surgical procedures',
        price: '$500',
        category: 'Surgery',
      },
    ]

    const storedServices = lakebed.useQuery('services')
    const appointments = lakebed.useQuery('appointments')
    const bookAppointment = lakebed.useMutation('bookAppointment')
    const cancelAppointment = lakebed.useMutation('cancelAppointment')
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

    const displayServices =
      storedServices && storedServices.length > 0
        ? storedServices
        : defaultServices
    const safeAppointments = appointments ?? []
    const appointmentCount = safeAppointments.length

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
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-20">
            <button
              type="button"
              onClick={() => go('Home')}
              className="text-lg font-bold tracking-tight text-foreground"
            >
              {brand}
            </button>

            <div className="hidden items-center gap-8 lg:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
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
                        onClick={() => go('My Appointments')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Appointments
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('My Pets')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Pets
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
              <Sheet
                open={bookingOpen}
                onOpenChange={(open) => {
                  setBookingOpen(open)
                  if (!open) {
                    setSelectedService(null)
                    setPetName('')
                    setAppointmentDate('')
                    setAppointmentTime('')
                  }
                }}
              >
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="My Appointments"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <CalendarIcon />
                    {appointmentCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {appointmentCount}
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
                      {selectedService ? 'Book Appointment' : 'My Appointments'}
                    </SheetTitle>
                    <SheetDescription>
                      {selectedService
                        ? `Schedule an appointment for ${selectedService}`
                        : appointmentCount > 0
                          ? `${appointmentCount} appointment${appointmentCount === 1 ? '' : 's'} scheduled.`
                          : 'No appointments scheduled yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {selectedService ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            Service
                          </label>
                          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                            {selectedService}
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="petName"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Pet Name
                          </label>
                          <input
                            id="petName"
                            type="text"
                            value={petName}
                            onChange={(e) => setPetName(e.target.value)}
                            placeholder="Enter your pet's name"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="appointmentDate"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Date
                          </label>
                          <input
                            id="appointmentDate"
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="appointmentTime"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Time
                          </label>
                          <select
                            id="appointmentTime"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Select a time</option>
                            <option value="9:00 AM">9:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="1:00 PM">1:00 PM</option>
                            <option value="2:00 PM">2:00 PM</option>
                            <option value="3:00 PM">3:00 PM</option>
                            <option value="4:00 PM">4:00 PM</option>
                          </select>
                        </div>
                      </div>
                    ) : safeAppointments.length ? (
                      <div className="space-y-5">
                        {safeAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                              <CalendarIcon />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {appointment.serviceName}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {appointment.petName}
                                  </h3>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {appointment.date}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  {appointment.time}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void cancelAppointment(appointment.id)
                                  }
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No appointments scheduled
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Book your first appointment from our services to get
                          started.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    {selectedService ? (
                      <>
                        <button
                          type="button"
                          className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                          onClick={() => {
                            if (
                              selectedService &&
                              petName &&
                              appointmentDate &&
                              appointmentTime
                            ) {
                              void bookAppointment(
                                selectedService,
                                petName,
                                appointmentDate,
                                appointmentTime,
                              )
                              setSelectedService(null)
                              setPetName('')
                              setAppointmentDate('')
                              setAppointmentTime('')
                            }
                          }}
                          disabled={
                            !petName || !appointmentDate || !appointmentTime
                          }
                        >
                          Confirm Booking
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                          onClick={() => setSelectedService(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                          onClick={() => {
                            setBookingOpen(false)
                            go('Services')
                          }}
                        >
                          Book New Appointment
                        </button>
                        <SheetClose asChild>
                          <button
                            type="button"
                            className="w-full rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                          >
                            Close
                          </button>
                        </SheetClose>
                      </>
                    )}
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
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
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </button>
                  )}
                </div>
              </div>
            )}
          </nav>
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
                    onClick={() => setBookingOpen(true)}
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
            <div className="mx-auto max-w-7xl px-5 py-14">
              <div className="mb-8">
                <p className="text-sm font-medium text-primary">Our Services</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Veterinary Services
                </h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {displayServices.map((service) => (
                  <article
                    key={service.name}
                    className="rounded-lg border border-border bg-card p-6"
                  >
                    <p className="text-sm font-medium text-primary">
                      {service.category}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-card-foreground">
                      {service.name}
                    </h3>
                    <p className="mt-3 leading-7 text-muted-foreground">
                      {service.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">
                        {service.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedService(service.name)
                          setBookingOpen(true)
                        }}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Book Now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
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
                onClick={() => setBookingOpen(true)}
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
                  onClick={() => setBookingOpen(true)}
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
