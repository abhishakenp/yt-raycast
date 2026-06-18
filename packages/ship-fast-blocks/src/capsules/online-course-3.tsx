import { useState } from 'react'
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
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

export const OnlineCourseKimiPage3 = defineCapsule({
  name: "OnlineCourseKimiPage3",
  description:
    "Online Course third style sibling to OnlineCourseKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      courses: table({
        alt: string(),
        badge: string(),
        category: string(),
        image: string(),
        name: string(),
        price: string(),
        instructor: string(),
      }),
      enrollments: table({
        courseId: string(),
        status: string(),
      }),
      favorites: table({
        courseName: string(),
      }),
    },
    queries: {
      courses: ({ db }) => db.courses.orderBy('createdAt').all(),
      enrollmentLines: ({ db }) =>
        db.enrollments.all().flatMap((item) => {
          const course = db.courses.get(item.courseId)
          return course ? [{ ...item, course }] : []
        }),
      favoriteCourseNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.courseName)),
    },
    mutations: {
      enrollInCourse: ({ db }, courseName: string) => {
        const course = db.courses.where('name', courseName).all()[0]
        if (!course) return db.enrollments.all()

        const existingEnrollment = db.enrollments
          .where('courseId', course.id)
          .all()[0]

        if (existingEnrollment) {
          db.enrollments.update(existingEnrollment.id, {
            status: 'enrolled',
          })
        } else {
          db.enrollments.insert({
            courseId: course.id,
            status: 'enrolled',
          })
        }

        return db.enrollments.all()
      },
      updateEnrollmentStatus: ({ db }, courseId: string, status: string) => {
        for (const item of db.enrollments.where('courseId', courseId).all()) {
          db.enrollments.update(item.id, { status })
        }

        return db.enrollments.all()
      },
      removeFromEnrollments: ({ db }, courseId: string) => {
        for (const item of db.enrollments.where('courseId', courseId).all()) {
          db.enrollments.delete(item.id)
        }

        return db.enrollments.all()
      },
      clearEnrollments: ({ db }) => {
        for (const item of db.enrollments.all()) {
          db.enrollments.delete(item.id)
        }

        return []
      },
      toggleFavorite: ({ db }, courseName: string) => {
        const existingFavorite = db.favorites
          .where('courseName', courseName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ courseName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [enrollmentsOpen, setEnrollmentsOpen] = useState(false)
    const brand = props.brand ?? "Lumina Academy Master New Skills with Expert"
    const nav = props.nav?.length ? props.nav : ["Lumina", "Courses", "Instructors", "Pricing", "Reviews", "FAQ"]
    const hero = {
      eyebrow: "Online Course / Variant 3",
      title: "Master the skills that shape the future",
      description: "Lumina Academy Master New Skills with Expert-Led Courses Lumina Courses Instructors Pricing Reviews FAQ Sign In Get Started Over 2,000 expert-led courses Master the skills that...",
      primaryCta: "Start Free Trial",
      secondaryCta: "Lumina",
      imageAlt: "Team of diverse professionals collaborating on a laptop in a modern coworking space",
      ...props.hero,
    }
    const metrics = props.metrics?.length ? props.metrics : [
  {
    "value": "24/7",
    "label": "Responsive service"
  },
  {
    "value": "98%",
    "label": "Positive outcomes"
  },
  {
    "value": "4.9",
    "label": "Average rating"
  },
  {
    "value": "12+",
    "label": "Core capabilities"
  }
]
    const sections = props.sections?.length ? props.sections : [
  {
    "eyebrow": "Overview",
    "title": "Everything you need to grow",
    "body": "Lumina Academy Master New Skills with Expert-Led Courses Lumina Courses Instructors Pricing Reviews FAQ Sign In Get Started Over 2,000 expert-led courses Master the skills that...",
    "items": [
      "Simple, transparent pricing",
      "Loved by learners worldwide",
      "Learn from industry leaders"
    ]
  },
  {
    "eyebrow": "Experience",
    "title": "Start learning in minutes",
    "body": "Online Course page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Frequently asked questions",
      "Ready to build something extraordinary?",
      "Learn from the Best"
    ]
  },
  {
    "eyebrow": "Proof",
    "title": "Popular Courses",
    "body": "Online Course page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Hands-on Projects",
      "Verified Certificates",
      "Learn at Your Pace"
    ]
  },
  {
    "eyebrow": "Next steps",
    "title": "Simple, transparent pricing",
    "body": "Online Course page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Community Support",
      "AI-Powered Learning",
      "Choose Your Path"
    ]
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "Start learning in minutes",
    "alt": "Team of diverse professionals collaborating on a laptop in a modern coworking space",
    "caption": "Online Course generated page detail"
  },
  {
    "title": "Popular Courses",
    "alt": "Professional headshot of Sarah Chen, lead UX design instructor",
    "caption": "Online Course generated page detail"
  },
  {
    "title": "Simple, transparent pricing",
    "alt": "Developer typing code on a laptop with multiple monitors showing syntax highlighting in a dark themed IDE",
    "caption": "Online Course generated page detail"
  }
]

    const normalizedCourseItems = sections
      .filter((s) => s.items?.length)
      .flatMap((s) => s.items || [])
      .map((itemName, index) => ({
        alt: gallery[index % gallery.length]?.alt || hero.imageAlt,
        badge: index === 0 ? 'Popular' : '',
        category: sections[index % sections.length]?.eyebrow || 'Course',
        image: '',
        name: itemName,
        price: index === 0 ? '$199' : '$149',
        instructor: 'Expert Instructor',
      }))

    const storedCourses = lakebed.useQuery('courses')
    const enrollmentLines = lakebed.useQuery('enrollmentLines')
    const favoriteCourseNames = lakebed.useQuery('favoriteCourseNames')
    const auth = lakebed.useAuth()
    const enrollInCourse = lakebed.useMutation('enrollInCourse')
    const updateEnrollmentStatus = lakebed.useMutation('updateEnrollmentStatus')
    const removeFromEnrollments = lakebed.useMutation('removeFromEnrollments')
    const clearEnrollments = lakebed.useMutation('clearEnrollments')
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
    const displayCourses =
      storedCourses && storedCourses.length > 0
        ? storedCourses
        : normalizedCourseItems
    const safeEnrollmentLines = enrollmentLines ?? []
    const enrollmentCount = safeEnrollmentLines.length

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
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button type="button" onClick={() => go("Home")} className="text-left text-lg font-semibold tracking-tight">
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
                        onClick={() => go('My Courses')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Courses
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Account')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
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
              <Sheet open={enrollmentsOpen} onOpenChange={setEnrollmentsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="My Courses"
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
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    {enrollmentCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {enrollmentCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">My Courses</SheetTitle>
                    <SheetDescription>
                      {enrollmentCount > 0
                        ? `${enrollmentCount} course${enrollmentCount === 1 ? '' : 's'} in your learning path.`
                        : 'You haven\'t enrolled in any courses yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeEnrollmentLines.length ? (
                      <div className="space-y-5">
                        {safeEnrollmentLines.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={item.course.alt}
                                src={item.course.image || undefined}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {item.course.category || 'Course'}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.course.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.course.instructor}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {item.course.price}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                  {item.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeFromEnrollments(item.courseId)
                                  }
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No courses enrolled
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Enroll in a course from the sections below to start your learning journey.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <Button
                      type="button"
                      disabled={!safeEnrollmentLines.length}
                      className="w-full rounded-full"
                      onClick={() => go('Dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearEnrollments()}
                        disabled={!safeEnrollmentLines.length}
                      >
                        Clear All
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
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
                <Image alt={hero.imageAlt} w={1200} h={900} className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-border bg-card p-5">
                <p className="text-3xl font-semibold text-card-foreground">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </section>

          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
              {sections.map((section, sectionIndex) => (
                <article key={section.title} className="rounded-lg border border-border bg-card p-6">
                  <p className="text-sm font-medium text-primary">{section.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">{section.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item, itemIndex) => {
                        const globalIndex = sections
                          .slice(0, sectionIndex)
                          .reduce((sum, s) => sum + (s.items?.length || 0), 0) + itemIndex
                        const course = displayCourses[globalIndex]
                        const isFavorite =
                          favoriteCourseNames?.has(item) ?? false

                        return (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <span className="flex-1">{item}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void toggleFavorite(item)}
                                aria-pressed={isFavorite}
                                aria-label={
                                  isFavorite
                                    ? `Remove ${item} from favorites`
                                    : `Add ${item} to favorites`
                                }
                                className="grid size-8 place-items-center rounded-full transition-all hover:scale-105"
                              >
                                <HeartIcon active={isFavorite} />
                              </button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 rounded-full px-3"
                                onClick={() => {
                                  void enrollInCourse(item)
                                  setEnrollmentsOpen(true)
                                }}
                              >
                                Enroll
                              </Button>
                            </div>
                          </div>
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
                <p className="text-sm font-medium text-primary">Generated visuals</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Content-led page moments</h2>
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
              {gallery.map((item, index) => {
                const course = displayCourses[index]
                const isFavorite =
                  favoriteCourseNames?.has(item.title) ?? false

                return (
                  <article key={item.title} className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="relative">
                      <Image alt={item.alt} w={900} h={700} loading="lazy" className="aspect-[4/3] w-full object-cover" />
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
                      <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                      {item.caption ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.caption}</p> : null}
                      {course ? (
                        <div className="mt-4 flex items-center justify-between">
                          <span className="font-bold text-foreground">{course.price}</span>
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              void enrollInCourse(item.title)
                              setEnrollmentsOpen(true)
                            }}
                          >
                            Enroll
                          </Button>
                        </div>
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
                  <p className="text-sm font-medium text-primary-foreground/70">{brand}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Ready for the next step?</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">{hero.description}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    void enrollInCourse(hero.primaryCta)
                    setEnrollmentsOpen(true)
                  }}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {hero.primaryCta}
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">(c) {new Date().getFullYear()} {brand}. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button key={item} type="button" onClick={() => go(item)} className="text-sm text-muted-foreground hover:text-foreground">
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
