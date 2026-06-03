import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * JobBoardKimiPage — a complete, self-contained job-board / careers MARKETPLACE
 * landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "WorkFlow" design: a clean,
 * light, neutral editorial aesthetic on a soft surface, built around job
 * discovery. It pairs a centered hero (jobs-available pill + headline + a real
 * dual-field search box with title + location inputs and popular-search chips),
 * a trusted-by company logo strip, a browse-by-category icon grid, a 3-up "why
 * choose us" feature row, a featured-job listings feed (filter chips + rich job
 * cards with company logo, role, tags, salary, posted date and Apply buttons),
 * a dark stats band, a 3-up success-story testimonial grid with headshots, a
 * 3-step "how it works" timeline, a dark CTA panel, and a fat 5-column footer
 * with social icons.
 *
 * The block owns ALL layout, spacing, type hierarchy and depth. Every nav item,
 * CTA, filter, chip, job-apply, footer link, social and the search form route
 * through `useNavigate` (never a dead "#"). All imagery — company logos, job
 * thumbnails and testimonial headshots — uses the alt-driven <Image> component
 * (never a raw src). Callers supply ONLY content data; rich defaults make it
 * render great with no props at all.
 */
export const JobBoardKimiPage = defineComponent({
  name: "JobBoardKimiPage",
  description:
    "Complete job-board / careers MARKETPLACE landing page with a clean, light, neutral editorial aesthetic centered on job discovery. Includes a centered hero (jobs-available badge, headline, and a real dual-field search box with role/keyword + location inputs plus popular-search chips), a 'trusted by' company logo strip, a browse-by-category icon grid with per-category job counts, a 3-up feature row (verified employers, one-click apply, smart alerts), a featured-jobs listings feed with filter chips and rich job cards (company logo, role title, New/Featured badge, skill + salary tags, posted date, Apply button) and a load-more, a dark stats band, a 3-up success-story testimonial grid with candidate headshots, a 3-step 'how it works' timeline, a dark conversion CTA panel, and a fat multi-column footer with social icons and legal links. Use as the ROOT/home page for job boards, careers sites, hiring marketplaces, recruiting platforms, talent networks, gig/freelance marketplaces, or 'find a job / post a job' products when a trustworthy, conversion-focused page with prominent search and live listings is wanted. Supply content only — brand, nav, hero, categories, features, jobs, stats, testimonials, steps, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section: badge, headline, search box, and popular-search chips. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        locationPlaceholder: z.string().optional(),
        searchCta: z.string().optional(),
        popularLabel: z.string().optional(),
        popular: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Trusted by" logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        companies: z.array(z.string()).optional(),
      })
      .optional(),
    /** Browse-by-category icon grid. */
    categories: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), count: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-up "why choose us" feature row. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Featured-jobs listings feed: filters + job cards. */
    jobs: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        filters: z.array(z.string()).optional(),
        loadMore: z.string().optional(),
        applyLabel: z.string().optional(),
        items: z
          .array(
            z.object({
              role: z.string(),
              company: z.string(),
              logoAlt: z.string(),
              tags: z.array(z.string()),
              description: z.string(),
              posted: z.string(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Success-story testimonial grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** 3-step "how it works" timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark conversion CTA panel. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        secondary: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content: tagline, link columns, and legal row. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "WorkFlow"
    const nav = props.nav?.length
      ? props.nav
      : ["Browse Jobs", "Companies", "Categories", "Success Stories"]

    const heroBadge = props.hero?.badge ?? "Over 12,000 jobs available this week"
    const heroHeading =
      props.hero?.heading ?? "Find work that moves your career forward"
    const heroSub =
      props.hero?.subheading ??
      "Connect with top employers hiring remote, hybrid, and on-site roles. From startups to Fortune 500s, discover opportunities that match your skills and aspirations."
    const searchPlaceholder =
      props.hero?.searchPlaceholder ?? "Job title, keywords, or company"
    const locationPlaceholder =
      props.hero?.locationPlaceholder ?? "City, state, or remote"
    const searchCta = props.hero?.searchCta ?? "Search Jobs"
    const popularLabel = props.hero?.popularLabel ?? "Popular:"
    const popular = props.hero?.popular?.length
      ? props.hero.popular
      : ["Remote", "Engineering", "Design", "Marketing", "Product"]

    const logosHeading =
      props.logos?.heading ?? "Trusted by leading companies worldwide"
    const logoCompanies = props.logos?.companies?.length
      ? props.logos.companies
      : ["Stripe", "Notion", "Figma", "Shopify", "Webflow", "Linear"]

    const categoriesHeading =
      props.categories?.heading ?? "Browse by category"
    const categoriesDesc =
      props.categories?.description ??
      "Explore opportunities across industries and find roles that match your expertise"
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          { title: "Engineering", count: "2,847 jobs" },
          { title: "Design", count: "1,523 jobs" },
          { title: "Marketing", count: "982 jobs" },
          { title: "Product", count: "756 jobs" },
          { title: "Sales", count: "1,134 jobs" },
          { title: "Finance", count: "643 jobs" },
          { title: "Support", count: "421 jobs" },
          { title: "Operations", count: "389 jobs" },
        ]

    const featuresHeading =
      props.features?.heading ?? "Why job seekers choose WorkFlow"
    const featuresDesc =
      props.features?.description ??
      "We have designed every feature to help you land your dream job faster"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Verified Employers",
            description:
              "Every company is vetted to ensure legitimate opportunities. No scams, no fake listings, just real jobs from real businesses.",
          },
          {
            title: "One-Click Apply",
            description:
              "Apply to multiple positions with your saved profile. No more filling out the same information over and over again.",
          },
          {
            title: "Smart Alerts",
            description:
              "Get notified instantly when jobs matching your skills are posted. Be among the first applicants and increase your chances.",
          },
        ]

    const jobsHeading = props.jobs?.heading ?? "Featured jobs"
    const jobsDesc =
      props.jobs?.description ?? "Hand-picked opportunities from top companies"
    const jobsViewAll = props.jobs?.viewAll ?? "View all 12,483 jobs"
    const jobsLoadMore = props.jobs?.loadMore ?? "Load more jobs"
    const jobsApplyLabel = props.jobs?.applyLabel ?? "Apply Now"
    const jobFilters = props.jobs?.filters?.length
      ? props.jobs.filters
      : ["All Jobs", "Remote", "Engineering", "Design", "Full-time", "Contract"]
    const jobItems = props.jobs?.items?.length
      ? props.jobs.items
      : [
          {
            role: "Senior Frontend Engineer",
            company: "Stripe — San Francisco, CA or Remote",
            logoAlt: "Stripe company logo mark",
            tags: ["React", "TypeScript", "Remote", "$140k–$190k"],
            description:
              "Join our payments platform team building the future of internet commerce. Work on high-scale systems processing billions in transactions annually.",
            posted: "2 days ago",
            badge: "New",
          },
          {
            role: "Product Designer",
            company: "Notion — New York, NY (Hybrid)",
            logoAlt: "Notion productivity app logo mark",
            tags: ["Figma", "Design Systems", "Hybrid", "$120k–$160k"],
            description:
              "Shape the future of connected workspaces. Design intuitive features that help millions of users organize their work and lives.",
            posted: "4 days ago",
          },
          {
            role: "Engineering Manager",
            company: "Figma — San Francisco, CA or Remote",
            logoAlt: "Figma collaborative design tool logo mark",
            tags: ["Leadership", "TypeScript", "Remote", "$180k–$240k"],
            description:
              "Lead a team of 8-10 engineers building the multiplayer editing experience. Drive technical strategy and mentorship.",
            posted: "1 week ago",
          },
          {
            role: "Senior Backend Engineer",
            company: "Shopify — Toronto, ON or Remote",
            logoAlt: "Shopify e-commerce platform logo mark",
            tags: ["Ruby on Rails", "MySQL", "Remote", "$130k–$175k"],
            description:
              "Build commerce infrastructure used by millions of merchants worldwide. Scale systems handling peak loads during Black Friday and flash sales.",
            posted: "3 days ago",
            badge: "Featured",
          },
          {
            role: "Full Stack Developer",
            company: "Linear — Remote (Global)",
            logoAlt: "Linear project management tool logo mark",
            tags: ["React", "GraphQL", "Remote", "$150k–$200k"],
            description:
              "Help build the future of issue tracking and project management. Work across the stack to deliver fast, keyboard-first experiences.",
            posted: "5 days ago",
          },
          {
            role: "Developer Relations Engineer",
            company: "Vercel — Remote (US)",
            logoAlt: "Vercel deployment platform logo mark",
            tags: ["Next.js", "Community", "Remote", "$110k–$150k"],
            description:
              "Educate and inspire developers building on the Next.js ecosystem. Create content, speak at events, and build meaningful community connections.",
            posted: "1 week ago",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12k+", label: "Active job listings" },
          { value: "3.2k", label: "Companies hiring" },
          { value: "48k", label: "Successful placements" },
          { value: "14 days", label: "Average time to hire" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Success stories from our community"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from professionals who found their dream roles through WorkFlow"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I was skeptical about another job board, but WorkFlow connected me with Stripe within 3 weeks. The quality of listings here is unmatched.",
            name: "Sarah Chen",
            role: "Senior Engineer at Stripe",
            avatarAlt:
              "Professional headshot of a smiling software engineer with dark hair",
          },
          {
            quote:
              "After months of searching elsewhere, I found the perfect remote design role at Figma in just two weeks. The filtering actually works.",
            name: "Marcus Johnson",
            role: "Product Designer at Figma",
            avatarAlt:
              "Professional headshot of a product designer with a warm smile",
          },
          {
            quote:
              "The one-click apply feature saved me hours. Landed interviews with three top-tier companies and accepted an offer at Notion.",
            name: "Emily Rodriguez",
            role: "Marketing Lead at Notion",
            avatarAlt:
              "Professional headshot of a marketing manager with a confident expression",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How it works"
    const stepsDesc =
      props.steps?.description ??
      "Three simple steps to your next career opportunity"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your profile",
            description:
              "Upload your resume, set your preferences, and let employers discover you. Complete profiles get 3x more views.",
          },
          {
            title: "Discover & apply",
            description:
              "Browse curated listings, filter by what matters to you, and apply with one click using your saved profile.",
          },
          {
            title: "Get hired",
            description:
              "Connect directly with hiring managers, interview, and land your next role. Average placement in 14 days.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to find your next role?"
    const ctaDesc =
      props.cta?.description ??
      "Join 48,000+ professionals who found their dream jobs through WorkFlow. Your next opportunity is waiting."
    const ctaPrimary = props.cta?.primary ?? "Browse all jobs"
    const ctaSecondary = props.cta?.secondary ?? "Post a job"
    const ctaNote =
      props.cta?.note ?? "Free for job seekers. No credit card required."

    const footerTagline =
      props.footer?.tagline ??
      "Connecting exceptional talent with world-class companies. Find your next career move or hire your dream team."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "For Candidates",
            links: [
              "Browse Jobs",
              "Companies",
              "Salary Guide",
              "Resume Builder",
              "Career Advice",
            ],
          },
          {
            title: "For Employers",
            links: [
              "Post a Job",
              "Search Resumes",
              "Pricing",
              "Recruiting Solutions",
              "Employer Blog",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Contact", "Help Center"],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    const postCta = "Post a Job"

    // Brand logo tile — decorative brand mark (briefcase glyph).
    const BriefcaseMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const categoryIcons: ReactNode[] = [
      // code (Engineering)
      <svg key="code" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>,
      // pen (Design)
      <svg key="pen" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>,
      // pie (Marketing)
      <svg key="pie" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>,
      // bars (Product)
      <svg key="bars" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>,
      // users (Sales)
      <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      // dollar (Finance)
      <svg key="dollar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>,
      // headset (Support)
      <svg key="headset" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>,
      // building (Operations)
      <svg key="building" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </svg>,
    ]

    const featureIcons: ReactNode[] = [
      // check-circle (Verified)
      <svg key="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>,
      // bolt (One-Click Apply)
      <svg key="bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>,
      // bell (Smart Alerts)
      <svg key="bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>,
    ]

    const socialIcons: { label: string; icon: ReactNode }[] = [
      {
        label: "Twitter",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      },
      {
        label: "LinkedIn",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        ),
      },
      {
        label: "GitHub",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        ),
      },
    ]

    const inputCls =
      "w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 text-foreground"
              >
                <BriefcaseMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
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
                <button
                  type="button"
                  onClick={() => go("Sign In")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go(postCta)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {postCta}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative border-b border-border bg-background">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="mx-auto max-w-3xl text-center">
                <span className="mb-6 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {heroBadge}
                </span>
                <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {heroHeading}
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {heroSub}
                </p>

                {/* Search box */}
                <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-2 shadow-lg sm:p-4">
                  <form
                    className="flex flex-col gap-3 sm:flex-row"
                    role="search"
                    aria-label="Job search"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(searchCta)
                    }}
                  >
                    <div className="relative flex-1">
                      <svg
                        className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        placeholder={searchPlaceholder}
                        aria-label="Search for jobs by title, keywords, or company"
                        className={inputCls}
                      />
                    </div>
                    <div className="relative flex-1">
                      <svg
                        className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <input
                        type="text"
                        placeholder={locationPlaceholder}
                        aria-label="Search location"
                        className={inputCls}
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:whitespace-nowrap"
                    >
                      {searchCta}
                    </button>
                  </form>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>{popularLabel}</span>
                    {popular.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => go(p)}
                        className="rounded-full bg-muted px-3 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-muted/40 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
                {logoCompanies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => go(c)}
                    className="flex items-center justify-center text-lg font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="bg-background py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
                  {categoriesHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {categoriesDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categoryItems.map((cat, i) => (
                  <button
                    key={cat.title}
                    type="button"
                    onClick={() => go(cat.title)}
                    className="group rounded-xl border border-border bg-muted/40 p-6 text-left transition-all hover:border-foreground/30 hover:shadow-md"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-lg bg-card text-foreground shadow-sm transition-transform group-hover:scale-105">
                      {categoryIcons[i % categoryIcons.length]}
                    </div>
                    <h3 className="mb-1 font-semibold text-foreground">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{cat.count}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted/40 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
                  {featuresHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="text-center">
                    <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl border border-border bg-card text-foreground shadow-sm">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Jobs listings */}
          <section className="bg-background py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
                    {jobsHeading}
                  </h2>
                  <p className="text-muted-foreground">{jobsDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(jobsViewAll)}
                  className="inline-flex items-center gap-2 font-medium text-foreground hover:underline"
                >
                  {jobsViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>

              {/* Filters */}
              <div className="mb-8 flex flex-wrap gap-3">
                {jobFilters.map((filter, i) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => go(filter)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Job cards */}
              <div className="space-y-4">
                {jobItems.map((job) => (
                  <article
                    key={job.role}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/30 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <Image
                        alt={job.logoAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                          <h3 className="text-lg font-semibold text-card-foreground transition-colors group-hover:text-foreground/70">
                            {job.role}
                          </h3>
                          {job.badge ? (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                job.badge === "New"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-secondary text-secondary-foreground",
                              )}
                            >
                              {job.badge}
                            </span>
                          ) : null}
                        </div>
                        <p className="mb-3 text-muted-foreground">
                          {job.company}
                        </p>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {job.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {job.description}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-row items-center gap-3 sm:mt-0 sm:flex-col sm:items-end sm:gap-2">
                        <span className="text-sm text-muted-foreground">
                          {job.posted}
                        </span>
                        <button
                          type="button"
                          onClick={() => go(`${jobsApplyLabel}: ${job.role}`)}
                          className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          {jobsApplyLabel}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => go(jobsLoadMore)}
                  className="rounded-xl border border-input px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {jobsLoadMore}
                </button>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-20 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-4xl font-bold sm:text-5xl">
                      {s.value}
                    </div>
                    <p className="text-background/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
                  {testimonialsHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted/40 p-8"
                  >
                    <blockquote className="mb-6">
                      <p className="leading-relaxed text-foreground/80">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </blockquote>
                    <figcaption className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <cite className="font-semibold not-italic text-foreground">
                          {t.name}
                        </cite>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/40 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
                  {stepsHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="relative grid gap-8 md:grid-cols-3">
                <div
                  aria-hidden="true"
                  className="absolute left-1/6 right-1/6 top-16 hidden h-0.5 bg-border md:block"
                />
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div className="relative z-10 mx-auto mb-6 grid size-12 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-foreground p-8 text-center text-background sm:p-12 lg:p-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {ctaHeading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-background/60">
                  {ctaDesc}
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaPrimary)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-background/90"
                  >
                    {ctaPrimary}
                    <ArrowRight className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaSecondary)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-background/30 px-8 py-4 font-semibold text-background transition-colors hover:bg-background/10"
                  >
                    {ctaSecondary}
                  </button>
                </div>
                <p className="mt-6 text-sm text-background/50">{ctaNote}</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/40">
          <h2 className="sr-only">Footer</h2>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 text-foreground"
                >
                  <BriefcaseMark className="size-8" />
                  <span className="text-xl font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {socialIcons.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      aria-label={s.label}
                      onClick={() => go(s.label)}
                      className="grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      {s.icon}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerNote}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
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
