import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  ArrowRight,
  ChevronDown,
  GithubIcon,
  LinkedinIcon,
  StarIcon,
  dotTokens,
  socialIcon,
} from './internal/portfolio-dev-icons.tsx'
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

/**
 * PortfolioDevKimiPage — a complete, self-contained personal portfolio LANDING
 * page for a software engineer / developer with full-stack Lakebed integration.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Alex Chen — Software
 * Engineer" design: a clean, minimal, light editorial aesthetic with generous
 * whitespace, tight tracking-tight headings, rounded-full pill CTAs and a
 * sticky blurred navbar. It pairs a calm text-first hero (location eyebrow +
 * big headline + dual CTAs with GitHub) with a grayscale logo trust strip, a
 * 2-up selected-projects grid (image-zoom cards with tech-stack chips and
 * favorite toggles), an open-source contributions list (repo cards with star
 * counts, language dots and role badges), a 4-column technical-skills matrix,
 * a dated work-experience timeline with skill tags, a 3-up testimonials grid
 * with avatars, an inverted dark stats band, a centered contact CTA with a
 * Sheet drawer for contact form submissions, and a slim footer with social links.
 *
 * FULL-STACK FEATURES:
 * - Contact form drawer (Sheet) with Lakebed-persisted submissions
 * - Project favoriting with heart toggles (persisted via Lakebed)
 * - Google auth for saving favorites across sessions
 * - Account menu with favorites navigation
 *
 * The block owns ALL layout, spacing, type hierarchy and color. It uses ONLY
 * semantic theme tokens (background/foreground/card/muted/primary/accent +
 * chart-1..5 for the multi-color language dots and role badges) so it is
 * theme-injectable. Every nav item / CTA / project / repo / social / form
 * routes through `useNavigate` (never a dead "#"), and navbar labels match the
 * `nav` array so PageSwitch can swap pages. All content imagery uses the
 * alt-driven <Image> component (never a raw src). Callers supply ONLY content
 * data; rich defaults make it render great with no props at all.
 */
export const PortfolioDevKimiPage = defineCapsule({
  name: 'PortfolioDevKimiPage',
  description:
    "Complete personal PORTFOLIO landing page for a software engineer / developer with a clean, minimal, light editorial aesthetic and full-stack Lakebed integration: lots of whitespace, tight tracking-tight headings, rounded-full pill buttons, a sticky blurred navbar and a monochrome professional vibe. Includes a text-first hero (location eyebrow, big headline, intro paragraph, View-My-Work + GitHub CTAs), a grayscale 'trusted by' company-logo strip, a 2-up selected-projects grid (image-zoom cards with TypeScript/React/Go tech-stack chips, View-Project links, and favorite heart toggles), an open-source contributions list (repo cards with star counts, language dots, Maintainer/Contributor/Creator role badges and View-on-GitHub buttons), a 4-column technical-skills matrix (Languages / Frontend / Backend / Infrastructure with colored bullet dots), a dated work-experience timeline (role, company, summary, skill tags), a 3-up testimonials grid with headshot avatars, an inverted dark stats band (years/projects/stars/downloads), a centered contact CTA with a Sheet drawer for contact form submissions (persisted via Lakebed), Google auth for saving favorites across sessions, and a footer with GitHub/Twitter/LinkedIn social links. Use as the ROOT/home page for a developer, software engineer, full-stack engineer, freelancer or technical consultant personal site / resume / dev portfolio when a minimal, credible, content-rich showcase of projects, open-source work, skills and experience is wanted. Supply content only — brand, nav, hero, logos, projects, openSource, skills, experience, testimonials, stats, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Person / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** Grayscale trust / logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        /** Logo alt labels — rendered as grayscale brand marks. */
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Selected projects grid. */
    projects: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              tags: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Open-source contributions list. */
    openSource: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              description: z.string(),
              language: z.string(),
              stars: z.string(),
              license: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Technical skills matrix. */
    skills: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        groups: z
          .array(
            z.object({
              title: z.string(),
              items: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Work-experience timeline. */
    experience: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              period: z.string(),
              role: z.string(),
              company: z.string(),
              summary: z.string(),
              tags: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Inverted dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Contact CTA. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      favorites: table({
        projectTitle: string(),
      }),
      contactSubmissions: table({
        name: string(),
        email: string(),
        message: string(),
      }),
    },
    queries: {
      favoriteProjectTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.projectTitle)),
      contactSubmissions: ({ db }) =>
        db.contactSubmissions.orderBy('createdAt').all(),
    },
    mutations: {
      toggleFavorite: ({ db }, projectTitle: string) => {
        const existingFavorite = db.favorites
          .where('projectTitle', projectTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ projectTitle })
        return true
      },
      submitContact: ({ db }, name: string, email: string, message: string) => {
        db.contactSubmissions.insert({ name, email, message })
        return db.contactSubmissions.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [contactOpen, setContactOpen] = useState(false)
    const [contactForm, setContactForm] = useState({
      name: '',
      email: '',
      message: '',
    })
    const brand = props.brand ?? 'Alex Chen'

    const favoriteProjectTitles = lakebed.useQuery('favoriteProjectTitles')
    const contactSubmissions = lakebed.useQuery('contactSubmissions')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const submitContact = lakebed.useMutation('submitContact')
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

    const nav = props.nav?.length
      ? props.nav
      : ['Projects', 'Open Source', 'Skills', 'Experience', 'Get in Touch']

    const heroEyebrow =
      props.hero?.eyebrow ?? 'Software Engineer — San Francisco, CA'
    const heroHeading =
      props.hero?.heading ??
      'Building reliable systems and developer tools that scale'
    const heroSub =
      props.hero?.subheading ??
      "I'm a full-stack engineer with 8 years of experience designing distributed systems, crafting performant frontends, and contributing to open-source tooling used by thousands of developers."
    const heroPrimary = props.hero?.primaryCta ?? 'View My Work'
    const heroSecondary = props.hero?.secondaryCta ?? 'GitHub'

    const logosLabel = props.logos?.label ?? 'Trusted by engineering teams at'
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ['Stripe', 'Linear', 'Vercel', 'GitHub', 'Notion']

    const projectsHeading = props.projects?.heading ?? 'Selected Projects'
    const projectsDesc =
      props.projects?.description ??
      "A collection of systems and applications I've architected and built from the ground up."
    const projectsCta = props.projects?.cta ?? 'View Project'
    const projectItems = props.projects?.items?.length
      ? props.projects.items
      : [
          {
            title: 'Streamline Analytics',
            description:
              'Real-time event processing pipeline handling 50M+ events daily. Built a React dashboard with WebSocket streams and a Rust ingestion service.',
            imageAlt:
              'Dashboard interface showing real-time analytics charts and data visualization',
            tags: ['TypeScript', 'React', 'Rust'],
          },
          {
            title: 'API Gateway Service',
            description:
              'Distributed API gateway with rate limiting, authentication, and request routing. Serves 10K+ RPS with p99 latency under 20ms.',
            imageAlt:
              'Code editor interface with syntax highlighting showing API documentation',
            tags: ['Go', 'PostgreSQL', 'gRPC'],
          },
          {
            title: 'ML Model Serving Platform',
            description:
              'Infrastructure for deploying and versioning machine learning models. Auto-scaling inference endpoints with A/B testing and monitoring.',
            imageAlt:
              'Developer workspace showing code collaboration tools and terminal windows',
            tags: ['Python', 'TensorFlow', 'AWS'],
          },
          {
            title: 'Infrastructure Automation',
            description:
              'GitOps-based deployment pipeline managing 200+ microservices across 3 cloud regions. Reduced deployment time from 2 hours to 8 minutes.',
            imageAlt:
              'Server room with rows of hardware racks showing infrastructure',
            tags: ['Terraform', 'Kubernetes', 'Prometheus'],
          },
        ]

    const osHeading = props.openSource?.heading ?? 'Open Source Contributions'
    const osDesc =
      props.openSource?.description ??
      "Libraries and tools I've built and maintain for the developer community."
    const osCta = props.openSource?.cta ?? 'View on GitHub'
    const osItems = props.openSource?.items?.length
      ? props.openSource.items
      : [
          {
            name: 'jsonschema-rs',
            role: 'Maintainer',
            description:
              'High-performance JSON Schema validator for Rust with Python bindings. 15x faster than existing Python alternatives.',
            language: 'Rust',
            stars: '4,892 stars',
            license: 'MIT License',
          },
          {
            name: 'react-query-hooks',
            role: 'Contributor',
            description:
              'Enhanced hooks for data fetching with automatic caching, deduplication, and optimistic updates. 2M+ weekly downloads on npm.',
            language: 'TypeScript',
            stars: '12.4k stars',
            license: 'MIT License',
          },
          {
            name: 'distributed-cache',
            role: 'Maintainer',
            description:
              'Consistent hashing cache layer with Redis cluster support. Automatic failover, TTL management, and compression.',
            language: 'Go',
            stars: '1,847 stars',
            license: 'Apache 2.0',
          },
          {
            name: 'terraform-provider-k8s',
            role: 'Creator',
            description:
              'Terraform provider for managing Kubernetes resources with better state handling and drift detection. Downloaded 500K+ times.',
            language: 'HCL',
            stars: '3,156 stars',
            license: 'MPL 2.0',
          },
        ]

    const skillsHeading = props.skills?.heading ?? 'Technical Skills'
    const skillsDesc =
      props.skills?.description ??
      'Technologies and tools I work with daily to build production systems.'
    const skillGroups = props.skills?.groups?.length
      ? props.skills.groups
      : [
          {
            title: 'Languages',
            items: ['TypeScript / JavaScript', 'Rust', 'Go', 'Python', 'SQL'],
          },
          {
            title: 'Frontend',
            items: [
              'React / Next.js',
              'Tailwind CSS',
              'GraphQL / Apollo',
              'WebGL / Three.js',
              'Jest / Testing Library',
            ],
          },
          {
            title: 'Backend',
            items: [
              'Node.js / Express',
              'gRPC / Protocol Buffers',
              'PostgreSQL',
              'Redis',
              'Apache Kafka',
            ],
          },
          {
            title: 'Infrastructure',
            items: [
              'Kubernetes',
              'Terraform',
              'AWS / GCP / Azure',
              'Docker',
              'GitHub Actions',
            ],
          },
        ]

    const expHeading = props.experience?.heading ?? 'Work Experience'
    const expDesc =
      props.experience?.description ??
      'My journey through startups and enterprise companies building software at scale.'
    const expItems = props.experience?.items?.length
      ? props.experience.items
      : [
          {
            period: '2021 — Present',
            role: 'Staff Software Engineer',
            company: 'Stripe',
            summary:
              'Leading the Payments Platform team. Architected a new payment routing system that reduced latency by 40% and increased reliability to 99.999%. Mentoring 8 engineers across two teams. Define technical direction for the next-generation payment APIs.',
            tags: ['Ruby', 'Go', 'Distributed Systems', 'Payment Processing'],
          },
          {
            period: '2018 — 2021',
            role: 'Senior Software Engineer',
            company: 'Netlify',
            summary:
              'Core contributor to the Functions platform. Built the edge compute infrastructure serving 2M+ requests per minute. Implemented incremental static regeneration, reducing build times by 75% for large sites. Open-sourced 5 internal tools.',
            tags: ['Node.js', 'Rust', 'WebAssembly', 'Edge Computing'],
          },
          {
            period: '2016 — 2018',
            role: 'Software Engineer',
            company: 'Segment',
            summary:
              'Built the Personas product from 0 to 1,000 customers. Designed the real-time identity resolution system processing 100K+ events per second. Improved data pipeline reliability from 99.9% to 99.99% through better error handling.',
            tags: ['Go', 'Kafka', 'Kubernetes', 'Data Engineering'],
          },
          {
            period: '2014 — 2016',
            role: 'Full-Stack Developer',
            company: 'Thoughtbot',
            summary:
              'Consulted for startups and Fortune 500 companies. Led agile teams delivering Ruby on Rails and React applications. Introduced test-driven development practices that reduced bug reports by 60%.',
            tags: ['Ruby on Rails', 'React', 'PostgreSQL', 'Consulting'],
          },
        ]

    const testimonialsHeading = props.testimonials?.heading ?? 'Kind Words'
    const testimonialsDesc =
      props.testimonials?.description ??
      'What colleagues and collaborators say about working with me.'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: 'Sarah Mitchell',
            role: 'VP Engineering, Stripe',
            quote:
              'Alex has an exceptional ability to break down complex distributed systems problems into manageable pieces. His work on our payment routing reduced p99 latency by 40%. A true technical leader.',
            avatarAlt:
              'Professional headshot of a woman with dark hair smiling',
          },
          {
            name: 'David Park',
            role: 'CTO, Netlify',
            quote:
              "Working with Alex was a masterclass in systems design. He doesn't just write code—he thinks deeply about maintainability, observability, and the developer experience. Our edge functions wouldn't exist without him.",
            avatarAlt:
              'Professional headshot of a man with short brown hair and glasses',
          },
          {
            name: 'James Rodriguez',
            role: 'Founder, Segment',
            quote:
              "Alex joined as our 20th engineer and immediately elevated the entire team's technical standards. His contributions to our identity resolution system are still core to how we process billions of events.",
            avatarAlt:
              'Professional headshot of a man with dark hair and a beard',
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '8+', label: 'Years Experience' },
          { value: '50+', label: 'Projects Shipped' },
          { value: '12K+', label: 'GitHub Stars' },
          { value: '5M+', label: 'Weekly Downloads' },
        ]

    const contactHeading =
      props.contact?.heading ?? "Let's build something great together"
    const contactDesc =
      props.contact?.description ??
      "I'm currently open to consulting opportunities, advisory roles, and interesting full-time positions. If you're working on challenging technical problems, I'd love to hear from you."
    const contactPrimary = props.contact?.primaryCta ?? 'Send an Email'
    const contactSecondary = props.contact?.secondaryCta ?? 'LinkedIn'

    const footerNote = props.footer?.note ?? 'All rights reserved.'
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['GitHub', 'Twitter', 'LinkedIn']

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                {brand}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
                </button>
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
                          onClick={() => go('Favorites')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Favorites
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
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground md:hidden"
                >
                  <svg
                    className="size-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
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
        </nav>

        <main>
          {/* Hero */}
          <header className="pb-16 pt-24 lg:pb-24 lg:pt-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground lg:text-6xl">
                  {heroHeading}
                </h1>
                <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <ChevronDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <GithubIcon className="mr-2 size-5" />
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Trust / logos */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 lg:gap-16">
                {logoItems.map((logo) => (
                  <span
                    key={logo}
                    className="text-lg font-semibold tracking-tight text-foreground grayscale"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Selected projects */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  {projectsHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {projectsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                {projectItems.map((proj) => {
                  const isFavorite =
                    favoriteProjectTitles?.has(proj.title) ?? false

                  return (
                    <article key={proj.title} className="group">
                      <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                        <Image
                          alt={proj.imageAlt}
                          w={800}
                          h={500}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(proj.title)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${proj.title} from favorites`
                              : `Add ${proj.title} to favorites`
                          }
                          className={cn(
                            'absolute top-4 right-4 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                            isFavorite
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/90 text-foreground',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="mb-3 flex items-center gap-3">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-foreground">
                        {proj.title}
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        {proj.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => go(proj.title)}
                        className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                      >
                        {projectsCta}
                        <ArrowRight className="ml-1" />
                      </button>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Open source */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  {osHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {osDesc}
                </p>
              </div>

              <div className="space-y-4">
                {osItems.map((repo, i) => (
                  <div
                    key={repo.name}
                    className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-border/60 lg:p-8"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <GithubIcon className="size-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold text-card-foreground">
                            {repo.name}
                          </h3>
                          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                            {repo.role}
                          </span>
                        </div>
                        <p className="mb-3 text-muted-foreground">
                          {repo.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span
                              className={cn(
                                'size-3 rounded-full',
                                dotTokens[i % dotTokens.length],
                              )}
                            />
                            {repo.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <StarIcon />
                            {repo.stars}
                          </span>
                          <span>{repo.license}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => go(repo.name)}
                        className="inline-flex shrink-0 items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        {osCta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  {skillsHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {skillsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                {skillGroups.map((group, gi) => (
                  <div key={group.title}>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </h3>
                    <ul className="space-y-3">
                      {group.items.map((item, ii) => (
                        <li key={item} className="flex items-center gap-3">
                          <span
                            className={cn(
                              'size-2 rounded-full',
                              dotTokens[(gi + ii) % dotTokens.length],
                            )}
                          />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Experience */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  {expHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {expDesc}
                </p>
              </div>

              <div className="space-y-12">
                {expItems.map((job) => (
                  <div
                    key={`${job.company}-${job.period}`}
                    className="flex flex-col gap-6 lg:flex-row lg:gap-12"
                  >
                    <div className="shrink-0 lg:w-48">
                      <p className="text-sm font-medium text-muted-foreground">
                        {job.period}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <h3 className="text-xl font-semibold text-foreground">
                          {job.role}
                        </h3>
                        <span className="text-sm font-medium text-muted-foreground">
                          {job.company}
                        </span>
                      </div>
                      <p className="mb-4 text-muted-foreground">
                        {job.summary}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote key={t.name} className="rounded-xl bg-muted p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <p className="leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band (inverted) */}
          <section className="bg-foreground py-16 text-background">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-semibold lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-background/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
                {contactHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground lg:text-xl">
                {contactDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Sheet open={contactOpen} onOpenChange={setContactOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <svg
                        className="mr-2 size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {contactPrimary}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Send a message</SheetTitle>
                      <SheetDescription>
                        Get in touch with {brand}. We'll get back to you
                        within 24 hours.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <form
                        id="contact-form"
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault()
                          void submitContact(
                            contactForm.name,
                            contactForm.email,
                            contactForm.message,
                          )
                          setContactForm({ name: '', email: '', message: '' })
                          setContactOpen(false)
                        }}
                      >
                        <div>
                          <label
                            htmlFor="contact-name"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Name
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            value={contactForm.name}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                name: e.target.value,
                              })
                            }
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-email"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Email
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            value={contactForm.email}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                email: e.target.value,
                              })
                            }
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-message"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Message
                          </label>
                          <textarea
                            id="contact-message"
                            value={contactForm.message}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                message: e.target.value,
                              })
                            }
                            required
                            rows={6}
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            placeholder="Tell me about your project or opportunity..."
                          />
                        </div>
                      </form>
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="submit"
                        form="contact-form"
                        className="w-full rounded-full"
                        disabled={
                          !contactForm.name ||
                          !contactForm.email ||
                          !contactForm.message
                        }
                      >
                        Send Message
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
                        >
                          Cancel
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(contactSecondary)}
                  className="inline-flex items-center rounded-full border border-border px-8 py-4 font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <LinkedinIcon className="mr-2 size-5" />
                  {contactSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  {brand}
                </button>
                <span className="hidden text-border md:block">|</span>
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} {brand}. {footerNote}
                </p>
              </div>
              <div className="flex items-center gap-6">
                {footerSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {socialIcon(social)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
