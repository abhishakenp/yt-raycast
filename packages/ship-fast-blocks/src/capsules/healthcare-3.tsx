import { useState } from "react"
import { z } from "zod/v4"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Button } from "#/components/ui/button.tsx"
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
import { defineCapsule } from "./openui.ts"

export const HealthcareKimiPage3 = defineCapsule({
  name: "HealthcareKimiPage3",
  description:
    "Healthcare third style sibling to HealthcareKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      appointments: table({
        service: string(),
        preferredDate: string(),
        preferredTime: string(),
        patientName: string(),
        durationMinutes: number(),
        notes: string(),
      }),
    },
    queries: {
      appointments: ({ db }) => db.appointments.orderBy("createdAt").all(),
    },
    mutations: {
      bookAppointment: (
        { db },
        service: string,
        preferredDate: string,
        preferredTime: string,
        patientName: string,
        durationMinutes: number,
        notes: string,
      ) => {
        db.appointments.insert({
          service: service.trim() || "General Consultation",
          preferredDate,
          preferredTime,
          patientName: patientName.trim() || "Guest",
          durationMinutes: Number.isFinite(durationMinutes)
            ? Math.max(15, Math.floor(durationMinutes))
            : 30,
          notes: notes.trim(),
        })

        return db.appointments.all()
      },
      cancelAppointment: ({ db }, appointmentId: string) => {
        for (const appointment of db.appointments.where("id", appointmentId).all()) {
          db.appointments.delete(appointment.id)
        }

        return db.appointments.all()
      },
      clearAppointments: ({ db }) => {
        for (const appointment of db.appointments.all()) {
          db.appointments.delete(appointment.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Meridian Health Group"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Meridian Health",
          "Services",
          "How It Works",
          "Pricing",
          "Reviews",
          "FAQ",
        ]
    const hero = {
      eyebrow: "Healthcare / Variant 3",
      title: "Modern Healthcare Designed Around Your Life",
      description:
        "Meridian Health Group | Primary & Urgent Care in Austin, TX Meridian Health Services How It Works Pricing Reviews FAQ Book Now Services How It Works Pricing Reviews FAQ Book Now...",
      primaryCta: "Meridian Health",
      secondaryCta: "Services",
      imageAlt:
        "Board-certified physician reviewing a digital chart with a patient in a sunlit modern examination room",
      ...props.hero,
    }
    const [appointmentsOpen, setAppointmentsOpen] = useState(false)
    const [appointmentService, setAppointmentService] = useState(hero.primaryCta)
    const [appointmentDate, setAppointmentDate] = useState("")
    const [appointmentTime, setAppointmentTime] = useState("")
    const [appointmentPatientName, setAppointmentPatientName] = useState("")
    const [appointmentNotes, setAppointmentNotes] = useState("")
    const [appointmentDuration, setAppointmentDuration] = useState("30")
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            value: "24/7",
            label: "Responsive service",
          },
          {
            value: "98%",
            label: "Positive outcomes",
          },
          {
            value: "4.9",
            label: "Average rating",
          },
          {
            value: "12+",
            label: "Core capabilities",
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            eyebrow: "Overview",
            title: "Comprehensive Services Under One Roof",
            body: "Meridian Health Group | Primary & Urgent Care in Austin, TX Meridian Health Services How It Works Pricing Reviews FAQ Book Now Services How It Works Pricing Reviews FAQ Book Now...",
            items: [
              "Transparent Pricing",
              "Patient Stories",
              "Common Questions",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Your Care Journey",
            body: "Healthcare page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready to Prioritize Your Health?",
              "Primary Care",
              "Urgent Care",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Inside Our Clinic",
            body: "Healthcare page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Pediatrics",
              "Women's Health",
              "Diagnostics & Imaging",
            ],
          },
          {
            eyebrow: "Next steps",
            title: "Transparent Pricing",
            body: "Healthcare page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Mental Wellness", "Book Online", "Pre-Visit Check-In"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Your Care Journey",
            alt: "Board-certified physician reviewing a digital chart with a patient in a sunlit modern examination room",
            caption: "Healthcare generated page detail",
          },
          {
            title: "Inside Our Clinic",
            alt: "Bright, minimalist clinic waiting area with comfortable seating and large windows",
            caption: "Healthcare generated page detail",
          },
          {
            title: "Transparent Pricing",
            alt: "Advanced medical imaging suite featuring a state-of-the-art digital X-ray machine",
            caption: "Healthcare generated page detail",
          },
        ]
    const storedAppointments = lakebed.useQuery("appointments")
    const bookAppointment = lakebed.useMutation("bookAppointment")
    const cancelAppointment = lakebed.useMutation("cancelAppointment")
    const clearAppointments = lakebed.useMutation("clearAppointments")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "ME"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"

    const appointments = storedAppointments ?? []
    const appointmentCount = appointments.length
    const totalMinutes = appointments.reduce(
      (sum, appointment) => sum + appointment.durationMinutes,
      0,
    )

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const scheduleFromLabel = (service = hero.primaryCta) => {
      setAppointmentService(service)
      setAppointmentsOpen(true)
    }

    const resetAppointmentForm = () => {
      setAppointmentService(hero.primaryCta)
      setAppointmentDate("")
      setAppointmentTime("")
      setAppointmentPatientName("")
      setAppointmentNotes("")
      setAppointmentDuration("30")
    }

    const handleSubmitAppointment = (event: { preventDefault: () => void }) => {
      event.preventDefault()
      if (!appointmentService || !appointmentDate || !appointmentTime) return

      const durationMinutes = Number.parseInt(appointmentDuration, 10)

      void bookAppointment(
        appointmentService,
        appointmentDate,
        appointmentTime,
        appointmentPatientName,
        Number.isNaN(durationMinutes) ? 30 : durationMinutes,
        appointmentNotes,
      )

      setAppointmentDate("")
      setAppointmentTime("")
      setAppointmentNotes("")
      setAppointmentPatientName("")
      setAppointmentDuration("30")
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

    const Calendar = () => (
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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )

    return (
      <div
        className={cn("min-h-screen bg-background text-foreground", props.className)}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button
              type="button"
              onClick={() => go("Home")}
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
            <div className="flex items-center gap-2">
              <Sheet open={appointmentsOpen} onOpenChange={setAppointmentsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open appointment requests"
                    className="relative inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Calendar />
                    <span className="ml-2 hidden sm:inline">Visits</span>
                    {appointmentCount > 0 ? (
                      <span className="absolute -right-2 -top-2 grid size-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[0.625rem] font-bold text-background">
                        {appointmentCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle>Visit requests</SheetTitle>
                    <SheetDescription>
                      {appointmentCount > 0
                        ? `${appointmentCount} request${appointmentCount === 1 ? "" : "s"} in your care queue.`
                        : "No requests yet. Add your first preferred visit."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <form
                      className="space-y-3 rounded-lg border border-border bg-card p-4"
                      onSubmit={handleSubmitAppointment}
                    >
                      <div className="space-y-1.5">
                        <label
                          htmlFor="appointment-service"
                          className="text-sm font-medium text-foreground"
                        >
                          Service
                        </label>
                        <input
                          id="appointment-service"
                          value={appointmentService}
                          onChange={(event) =>
                            setAppointmentService(event.target.value)
                          }
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="appointment-date"
                            className="text-sm font-medium text-foreground"
                          >
                            Preferred date
                          </label>
                          <input
                            id="appointment-date"
                            type="date"
                            value={appointmentDate}
                            onChange={(event) =>
                              setAppointmentDate(event.target.value)
                            }
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="appointment-time"
                            className="text-sm font-medium text-foreground"
                          >
                            Preferred time
                          </label>
                          <input
                            id="appointment-time"
                            type="time"
                            value={appointmentTime}
                            onChange={(event) =>
                              setAppointmentTime(event.target.value)
                            }
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="appointment-duration"
                            className="text-sm font-medium text-foreground"
                          >
                            Visit length
                          </label>
                          <select
                            id="appointment-duration"
                            value={appointmentDuration}
                            onChange={(event) =>
                              setAppointmentDuration(event.target.value)
                            }
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="appointment-patient"
                            className="text-sm font-medium text-foreground"
                          >
                            Patient name
                          </label>
                          <input
                            id="appointment-patient"
                            value={appointmentPatientName}
                            onChange={(event) =>
                              setAppointmentPatientName(event.target.value)
                            }
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="appointment-notes"
                          className="text-sm font-medium text-foreground"
                        >
                          Notes
                        </label>
                        <textarea
                          id="appointment-notes"
                          value={appointmentNotes}
                          onChange={(event) =>
                            setAppointmentNotes(event.target.value)
                          }
                          rows={3}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <Button type="submit" className="w-full rounded-md">
                        Add request
                      </Button>
                    </form>
                    <div className="mt-6 space-y-3">
                      {appointments.length ? (
                        appointments.map((appointment) => (
                          <article
                            key={appointment.id}
                            className="rounded-lg border border-border bg-card p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">
                                {appointment.service}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.durationMinutes} min
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {appointment.preferredDate} · {appointment.preferredTime}
                            </p>
                            {appointment.patientName ? (
                              <p className="mt-1 text-sm text-foreground">
                                {appointment.patientName}
                              </p>
                            ) : null}
                            {appointment.notes ? (
                              <p className="mt-2 text-xs text-muted-foreground">
                                {appointment.notes}
                              </p>
                            ) : null}
                            <div className="mt-3 flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void cancelAppointment(appointment.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                          No scheduled visits yet. Add one above to track your
                          next care visit.
                        </div>
                      )}
                    </div>
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Visits requested</span>
                        <span>{appointmentCount}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Total planned time</span>
                        <span>{totalMinutes} min</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void clearAppointments()}
                        disabled={!appointments.length}
                      >
                        Clear
                      </Button>
                      <SheetClose asChild>
                        <Button type="button" variant="secondary">
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage src={authPicture} alt={authDisplayName} />
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
                            {authEmail ?? "Signed in to this session"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go("Account")}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
                        <ChevronDown />
                      </button>
                      <button
                        type="button"
                        onClick={() => go("Appointments")}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Appointments
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
                  aria-label="Sign in with Google"
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
                onClick={() => {
                  go(hero.primaryCta)
                  resetAppointmentForm()
                  scheduleFromLabel(hero.primaryCta)
                  setAppointmentsOpen(true)
                }}
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
                    onClick={() => {
                      go(hero.primaryCta)
                      setAppointmentService(hero.primaryCta)
                      setAppointmentsOpen(true)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      go(hero.secondaryCta)
                      setAppointmentService(hero.secondaryCta)
                      setAppointmentsOpen(true)
                    }}
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
                            go(item)
                            setAppointmentService(item)
                            setAppointmentsOpen(true)
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
                onClick={() => {
                  go(hero.secondaryCta)
                  setAppointmentService(hero.secondaryCta)
                  setAppointmentsOpen(true)
                }}
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
                  onClick={() => {
                    go(hero.primaryCta)
                    setAppointmentService(hero.primaryCta)
                    setAppointmentsOpen(true)
                  }}
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
                  onClick={() => {
                    go(item)
                    setAppointmentService(item)
                    setAppointmentsOpen(true)
                  }}
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
