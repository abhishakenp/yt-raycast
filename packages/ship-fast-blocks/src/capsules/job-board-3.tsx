import { useState } from 'react'
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
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

export const JobBoardKimiPage3 = defineCapsule({
  name: "JobBoardKimiPage3",
  description:
    "Job Board third style sibling to JobBoardKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      jobs: table({
        alt: string(),
        category: string(),
        company: string(),
        image: string(),
        location: string(),
        name: string(),
        salary: string(),
        type: string(),
      }),
      savedJobs: table({
        jobName: string(),
      }),
      applications: table({
        jobName: string(),
        status: string(),
      }),
    },
    queries: {
      jobs: ({ db }) => db.jobs.orderBy('createdAt').all(),
      savedJobNames: ({ db }) =>
        new Set(db.savedJobs.all().map((saved) => saved.jobName)),
      applicationStatuses: ({ db }) =>
        db.applications.all().reduce((acc, app) => {
          acc[app.jobName] = app.status
          return acc
        }, {} as Record<string, string>),
    },
    mutations: {
      saveJob: ({ db }, jobName: string) => {
        const existingSaved = db.savedJobs
          .where('jobName', jobName)
          .all()[0]

        if (existingSaved) {
          db.savedJobs.delete(existingSaved.id)
          return false
        }

        db.savedJobs.insert({ jobName })
        return true
      },
      applyToJob: ({ db }, jobName: string) => {
        const existingApplication = db.applications
          .where('jobName', jobName)
          .all()[0]

        if (existingApplication) {
          return existingApplication.status
        }

        db.applications.insert({ jobName, status: 'Applied' })
        return 'Applied'
      },
      withdrawApplication: ({ db }, jobName: string) => {
        for (const app of db.applications.where('jobName', jobName).all()) {
          db.applications.delete(app.id)
        }
        return null
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [savedJobsOpen, setSavedJobsOpen] = useState(false)
    const brand = props.brand ?? "Shift Find Your Next Dream Job"
    const nav = props.nav?.length ? props.nav : ["shift", "Find Jobs", "For Employers", "Salaries", "Blog", "Sign In"]
    const hero = {
      eyebrow: "Job Board / Variant 3",
      title: "Find a job you love , without the friction",
      description: "Shift Find Your Next Dream Job shift Find Jobs For Employers Salaries Blog Sign In Post a Job Find Jobs For Employers Salaries Blog Sign In Post a Job The 1 job board for tech p...",
      primaryCta: "Search Jobs",
      secondaryCta: "Load more jobs",
      imageAlt: "job board hero scene",
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
    "title": "Explore by category",
    "body": "Shift Find Your Next Dream Job shift Find Jobs For Employers Salaries Blog Sign In Post a Job Find Jobs For Employers Salaries Blog Sign In Post a Job The 1 job board for tech p...",
    "items": [
      "Design & UX",
      "Product Management",
      "Data & Analytics"
    ]
  },
  {
    "eyebrow": "Experience",
    "title": "Featured opportunities",
    "body": "Job Board page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Marketing & Growth",
      "Sales & Business Dev",
      "Finance & Legal"
    ]
  },
  {
    "eyebrow": "Proof",
    "title": "Software Engineering",
    "body": "Job Board page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "People & Operations",
      "Senior Frontend Engineer",
      "Staff Product Designer"
    ]
  },
  {
    "eyebrow": "Next steps",
    "title": "Design & UX",
    "body": "Job Board page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "DevOps Engineer",
      "Growth Marketing Manager",
      "Staff Backend Engineer"
    ]
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "Featured opportunities",
    "alt": "job board hero scene",
    "caption": "Job Board generated page detail"
  },
  {
    "title": "Software Engineering",
    "alt": "job board customer experience",
    "caption": "Job Board generated page detail"
  },
  {
    "title": "Design & UX",
    "alt": "job board service detail",
    "caption": "Job Board generated page detail"
  }
]

    // Normalize job items from sections for Lakebed
    const jobItems = sections.flatMap((section) =>
      (section.items ?? []).map((item) => ({
        name: item,
        category: section.title,
        company: brand,
        location: 'Remote',
        salary: '$80k - $120k',
        type: 'Full-time',
        alt: hero.imageAlt,
        image: '',
      }))
    )

    const normalizedJobItems = jobItems.map((job) => ({
      alt: job.alt,
      category: job.category,
      company: job.company,
      image: job.image,
      location: job.location,
      name: job.name,
      salary: job.salary,
      type: job.type,
    }))

    const storedJobs = lakebed.useQuery('jobs')
    const savedJobNames = lakebed.useQuery('savedJobNames')
    const applicationStatuses = lakebed.useQuery('applicationStatuses')
    const auth = lakebed.useAuth()
    const saveJob = lakebed.useMutation('saveJob')
    const applyToJob = lakebed.useMutation('applyToJob')
    const withdrawApplication = lakebed.useMutation('withdrawApplication')

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

    const displayJobs =
      storedJobs && storedJobs.length > 0
        ? storedJobs
        : normalizedJobItems

    const safeSavedJobNames = savedJobNames ?? new Set<string>()
    const savedJobsCount = safeSavedJobNames.size
    const savedJobsList = displayJobs.filter((job) =>
      safeSavedJobNames.has(job.name),
    )

    const safeApplicationStatuses = applicationStatuses ?? {}

    // --- shared sub-components ---

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
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
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
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search jobs"
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <Sheet open={savedJobsOpen} onOpenChange={setSavedJobsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Saved jobs"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <BookmarkIcon />
                    {savedJobsCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {savedJobsCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Saved jobs</SheetTitle>
                    <SheetDescription>
                      {savedJobsCount > 0
                        ? `${savedJobsCount} job${savedJobsCount === 1 ? '' : 's'} saved.`
                        : 'No jobs saved yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {savedJobsList.length ? (
                      <div className="space-y-4">
                        {savedJobsList.map((job) => (
                          <div
                            key={job.name}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-4 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={job.alt}
                                src={job.image || undefined}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {job.category}
                              </p>
                              <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                {job.name}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {job.company}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {job.location}
                              </p>
                              <div className="mt-3 flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    void applyToJob(job.name)
                                  }}
                                >
                                  {safeApplicationStatuses[job.name] || 'Apply'}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void saveJob(job.name)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No saved jobs
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Bookmark jobs from the listings to save them for later.
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
                        Continue browsing
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
                        onClick={() => go('My Applications')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Applications
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Profile')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Profile
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

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search jobs"
          description="Search the jobs seeded for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} jobs...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No jobs found.</CommandEmpty>
            <CommandGroup heading="Jobs">
              {displayJobs.map((job) => (
                <CommandItem
                  key={job.name}
                  value={`${job.company} ${job.name} ${job.category} ${job.location}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(job.name)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {job.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {job.salary}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

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
              {sections.map((section, index) => (
                <article key={section.title} className="rounded-lg border border-border bg-card p-6">
                  <p className="text-sm font-medium text-primary">{section.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">{section.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item) => {
                        const job = displayJobs.find((j) => j.name === item)
                        const isSaved = job ? safeSavedJobNames.has(job.name) : false
                        const applicationStatus = job ? safeApplicationStatuses[job.name] : null

                        return (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <div className="flex flex-1 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (job) void saveJob(job.name)
                                }}
                                aria-pressed={isSaved}
                                aria-label={
                                  isSaved
                                    ? `Remove ${item} from saved jobs`
                                    : `Save ${item} to saved jobs`
                                }
                                className="grid size-8 place-items-center rounded-full hover:bg-muted"
                              >
                                <BookmarkIcon active={isSaved} />
                              </button>
                              <button
                                type="button"
                                onClick={() => go(item)}
                                className="flex-1 text-left"
                              >
                                {item}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              {applicationStatus ? (
                                <span className="text-xs font-medium text-primary">
                                  {applicationStatus}
                                </span>
                              ) : null}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => {
                                  if (job) void applyToJob(job.name)
                                }}
                              >
                                {applicationStatus ? 'Applied' : 'Apply'}
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
              {gallery.map((item) => (
                <article key={item.title} className="overflow-hidden rounded-lg border border-border bg-card">
                  <Image alt={item.alt} w={900} h={700} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                    {item.caption ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.caption}</p> : null}
                  </div>
                </article>
              ))}
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
