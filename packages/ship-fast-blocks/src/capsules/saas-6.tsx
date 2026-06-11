import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * SaasKimiPage6 — a complete, self-contained AI-product SaaS LANDING page.
 *
 * Variant 6 (the 6th style sibling to SaasKimiPage): a dark-navy corporate
 * aesthetic with strong contrast bands — a dark hero split with a floating
 * dashboard mockup, a light trusted-by logo strip, a 6-up feature grid on a
 * clean white band, a numbered 3-step how-it-works band on a subtle muted
 * surface, a 6-image product gallery, a 3-tier pricing table with a highlighted
 * "Most Popular" Pro plan, a dark stats band, a 6-up testimonial grid with
 * star ratings on a muted band, an interactive native-details FAQ accordion,
 * a dark CTA banner, and a rich multi-column dark footer.
 *
 * Distinct from SaasKimiPage: darker mood with dark-navy hero/stats/CTA/footer
 * accent bands, a dashboard screenshot mockup (instead of chat bubbles), a
 * gallery section showcasing product imagery, and 6 testimonial cards. Uses
 * semantic theme tokens throughout so it works in any injected theme.
 */
export const SaasKimiPage6 = defineCapsule({
  name: "SaasKimiPage6",
  description:
    "A complete, conversion-focused AI-product SaaS landing page with a dark-navy corporate aesthetic — the 6th style sibling to SaasKimiPage. Features a split hero with a floating dashboard mockup, trusted-by logo strip, 6-up feature grid, 3-step how-it-works band, 6-image product gallery, 3-tier pricing table with a featured middle plan, dark stats metrics band, 6-up testimonial grid with star ratings, an interactive FAQ accordion using native details/summary, a dark CTA banner, and a rich multi-column footer. Use when a trust-focused, data-driven, professional mood with dark accent bands and strong contrast is wanted for AI scheduling, calendar automation, productivity SaaS, B2B tools, or enterprise software homepages.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        demoTitle: z.string().optional(),
        demoImageAlt: z.string().optional(),
        avatars: z.array(z.string()).optional(),
        demoStats: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
      })
      .optional(),
    /** Grayscale "trusted by" logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid — heading + description + up to 6 items. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered "How it works" steps. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Product gallery — up to 6 cards with images. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              alt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark metrics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonial cards. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing dark CTA banner. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        bottomLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Chronos AI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How it works", "Pricing", "Customers", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now SOC 2 Type II certified"
    const heroHeading =
      props.hero?.heading ??
      "Reclaim 8+ hours every week with an AI that schedules for you"
    const heroSub =
      props.hero?.subheading ??
      "Chronos AI reads your calendar, understands your priorities, and books meetings automatically — so you can focus on work that matters."
    const heroPrimary = props.hero?.primaryCta ?? "Start free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Book a demo"
    const heroProof =
      props.hero?.socialProof ?? "Trusted by 12,400+ professionals"
    const demoTitle = props.hero?.demoTitle ?? "chronos.ai/dashboard"
    const demoImageAlt =
      props.hero?.demoImageAlt ??
      "dashboard screenshot showing a weekly calendar grid with color-coded meetings and AI suggestions"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          "professional headshot of a smiling female product manager",
          "professional headshot of a smiling male engineer with short hair",
          "professional headshot of a smiling female executive in a blazer",
        ]
    const demoStats = props.hero?.demoStats?.length
      ? props.hero.demoStats
      : [
          { label: "Meetings today", value: "24" },
          { label: "Focus time", value: "6h" },
          { label: "Efficiency", value: "+18%" },
        ]

    const logosLabel =
      props.logos?.label ?? "Loved by teams at industry-leading companies"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["TechFlow", "Orbita", "Northwind", "Vertex", "Latitude", "Cortex"]

    const featuresHeading =
      props.features?.heading ??
      "Everything you need to run your calendar on autopilot"
    const featuresDesc =
      props.features?.description ??
      "From intelligent scheduling to conflict resolution, Chronos AI handles the busywork so your team stays focused."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Scheduling",
            description:
              "Chronos analyzes your availability, time zones, and preferences to suggest the perfect meeting slots — and books them automatically.",
          },
          {
            title: "Conflict Resolution",
            description:
              "Double-booked? Chronos detects overlaps instantly, reschedules lower-priority meetings, and notifies all attendees with new invites.",
          },
          {
            title: "Team Coordination",
            description:
              "Find the one window that works for 12 people across 4 time zones. Chronos polls availability and locks in the best option.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified, GDPR compliant, end-to-end encryption. Your calendar data never leaves your control.",
          },
          {
            title: "Productivity Analytics",
            description:
              "See exactly where your time goes. Weekly reports break down meetings, focus blocks, and trends so you can optimize your schedule.",
          },
          {
            title: "Integrations",
            description:
              "Works with Google Calendar, Outlook, Zoom, Slack, Teams, Notion, and 40+ tools. One-click setup, zero configuration headaches.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "Set up in minutes, save hours every week"
    const stepsDesc =
      props.steps?.description ??
      "No onboarding marathon. Connect your calendar, set your rules, and let Chronos AI take over."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect your calendar",
            description:
              "Link Google Calendar, Outlook, or Apple Calendar in one click. Chronos reads your existing events — no migration needed.",
          },
          {
            title: "Set your preferences",
            description:
              "Define your working hours, meeting limits, focus blocks, and priority contacts. Chronos learns and adapts over time.",
          },
          {
            title: "Let AI run your schedule",
            description:
              "Chronos books, reschedules, and resolves conflicts automatically. You review a daily digest — or let it run fully hands-off.",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Built for how modern teams work"
    const galleryDesc =
      props.gallery?.description ??
      "A clean, powerful interface that puts your schedule — and your time — back in your control."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Weekly Overview",
            description: "See your entire week at a glance with smart color coding.",
            alt: "software dashboard showing a weekly timeline with color-coded events and AI scheduling suggestions",
          },
          {
            title: "Team Rooms",
            description: "Shared spaces for cross-functional scheduling.",
            alt: "modern office meeting room with a large screen displaying a shared team calendar",
          },
          {
            title: "Time Analytics",
            description: "Understand where every hour goes, weekly.",
            alt: "analytics dashboard with bar charts showing meeting time breakdown by category",
          },
          {
            title: "Cross-Timezone Sync",
            description: "Automatic timezone handling for global teams.",
            alt: "diverse group of colleagues collaborating around a laptop in a bright office",
          },
          {
            title: "Meeting Intelligence",
            description:
              "Prep briefs, agendas, and follow-ups auto-generated.",
            alt: "two professionals shaking hands in a modern conference room after a meeting",
          },
          {
            title: "Mobile Ready",
            description: "Full functionality on iOS and Android.",
            alt: "laptop on a desk showing a mobile-responsive calendar app in dark mode",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple pricing for every team size"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees, no surprises."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "Perfect for individuals getting started with AI scheduling.",
            price: "$0",
            period: "/month",
            features: [
              "1 connected calendar",
              "Up to 10 AI-scheduled meetings/mo",
              "Basic conflict alerts",
              "Email support",
            ],
            cta: "Get started free",
            popular: false,
          },
          {
            name: "Pro",
            description:
              "For professionals who need full AI automation and analytics.",
            price: "$19",
            period: "/user/month",
            features: [
              "Unlimited connected calendars",
              "Unlimited AI-scheduled meetings",
              "Auto conflict resolution",
              "Productivity analytics",
              "Priority email & chat support",
            ],
            cta: "Start 14-day trial",
            popular: true,
          },
          {
            name: "Enterprise",
            description:
              "Advanced security, admin controls, and dedicated support.",
            price: "$49",
            period: "/user/month",
            features: [
              "Everything in Pro",
              "SSO & SCIM provisioning",
              "Audit logs & admin dashboard",
              "Custom AI training",
              "Dedicated account manager",
            ],
            cta: "Contact sales",
            popular: false,
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12,400+", label: "Active professionals" },
          { value: "4.2M", label: "Meetings scheduled" },
          { value: "8.3 hrs", label: "Avg. time saved weekly" },
          { value: "99.97%", label: "Uptime last 12 months" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ??
      "Loved by teams who value their time"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how leaders at fast-moving companies use Chronos AI to run tighter schedules."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Chronos eliminated the back-and-forth of scheduling across three time zones. Our exec team alone saves 10+ hours a week.",
            name: "Daniel Reeves",
            role: "COO, Vertex Analytics",
            avatarAlt:
              "professional headshot of a smiling male executive in a suit",
          },
          {
            quote:
              "The conflict resolution is magic. I used to spend Monday mornings fixing calendar collisions. Now I never think about it.",
            name: "Sarah Lin",
            role: "VP of Operations, Northwind",
            avatarAlt:
              "professional headshot of a smiling female executive in a navy blazer",
          },
          {
            quote:
              "We rolled Chronos out to 200 employees in a week. The SSO integration was seamless, and adoption was instant.",
            name: "Marcus Okafor",
            role: "IT Director, Cortex Health",
            avatarAlt:
              "professional headshot of a smiling male manager in a button-down shirt",
          },
          {
            quote:
              "I was skeptical of AI scheduling. Two weeks in, I canceled my assistant retainer. Chronos does it better, faster, and cheaper.",
            name: "Priya Sharma",
            role: "Founder, Latitude Labs",
            avatarAlt:
              "professional headshot of a smiling female entrepreneur with curly hair",
          },
          {
            quote:
              "The analytics dashboard alone is worth the price. We identified 30% of our meetings could be async emails. Game changer.",
            name: "James Holloway",
            role: "Engineering Lead, Orbita",
            avatarAlt:
              "professional headshot of a smiling male team lead with glasses",
          },
          {
            quote:
              "Customer support is outstanding. We had a custom integration request — they shipped it in 48 hours.",
            name: "Elena Rostova",
            role: "Head of Ops, TechFlow",
            avatarAlt:
              "professional headshot of a smiling female operations manager",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before getting started."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does Chronos AI access my calendar data?",
            answer:
              "Chronos connects via OAuth 2.0 with read-only and write permissions you explicitly grant. We use industry-standard encryption (TLS 1.3) in transit and AES-256 at rest. We are SOC 2 Type II certified and GDPR compliant. Your data is never sold or used to train models.",
          },
          {
            question:
              "Can I keep control and review changes before they happen?",
            answer:
              "Absolutely. You choose between full auto-pilot or review mode. In review mode, Chronos queues suggestions in a daily digest email at 8:00 AM. You approve or reject each action with one click. You can switch modes anytime.",
          },
          {
            question: "Which calendar apps and tools are supported?",
            answer:
              "Google Calendar, Microsoft Outlook/Exchange, Apple Calendar, and CalDAV servers. Integrations include Zoom, Google Meet, Microsoft Teams, Slack, Notion, Salesforce, HubSpot, Asana, Monday.com, and 35+ others via Zapier.",
          },
          {
            question: "What happens when there is a scheduling conflict?",
            answer:
              "Chronos detects conflicts in real time. Based on your priority rules — such as \"client calls > internal standups\" — it automatically proposes a reschedule, finds a new slot that works for all attendees, and sends updated invites. If no suitable slot exists, it alerts you immediately.",
          },
          {
            question: "Is there a free trial for paid plans?",
            answer:
              "Yes. Every paid plan includes a 14-day free trial with full feature access. No credit card required to start. You can cancel anytime during the trial and pay nothing.",
          },
          {
            question:
              "Do you offer discounts for nonprofits and education?",
            answer:
              "Yes. Registered nonprofits and accredited educational institutions receive 50% off Pro and Enterprise plans. Contact our sales team with your organization ID to apply.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to get your time back?"
    const ctaSub =
      props.cta?.subheading ??
      "Join 12,400+ professionals who trust Chronos AI to run their calendars. Start your free trial today — no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start free trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to sales"

    const footerTagline =
      props.footer?.tagline ??
      "The intelligent calendar assistant that schedules, resolves conflicts, and reclaims your time. Built for modern teams."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Security", "Changelog"],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Blog", "Press Kit", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
          },
        ]
    const footerBottom = props.footer?.bottomLinks?.length
      ? props.footer.bottomLinks
      : ["Status", "Sitemap", "Accessibility"]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`

    // Shared clock logo mark
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-primary/10 text-primary",
          className,
        )}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"
            opacity="0.4"
          />
          <path d="M12 6a1 1 0 0 0-1 1v4.59l-2.71 2.7a1 1 0 0 0 1.42 1.42l3-3A1 1 0 0 0 13 12V7a1 1 0 0 0-1-1Z" />
        </svg>
      </span>
    )

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0 text-chart-2"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const Star = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )

    const Chevron = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted-foreground group-open:rotate-180 transition-transform"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const featureIcons = [
      // calendar
      <svg key="cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>,
      // clock
      <svg key="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>,
      // users
      <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      // shield
      <svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>,
      // activity
      <svg key="activity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>,
      // monitor
      <svg key="monitor" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>,
    ]

    const featureIconTints = [
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
      "bg-primary/10 text-primary",
    ]

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("Log in")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => go("Get started")}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/80"
              >
                Get started
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground text-background">
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 to-foreground" aria-hidden="true" />
            <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 md:pt-28 md:pb-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-background/80">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-chart-2 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-chart-2" />
                    </span>
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-background/80 sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-background px-6 py-3.5 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-accent"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border border-background/40 px-6 py-3.5 text-base font-semibold text-background transition-colors hover:bg-background/10"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-background/60">
                    No credit card required. 14-day free trial. Cancel anytime.
                  </p>
                  <div className="mt-8 flex items-center gap-4 text-sm text-background/60">
                    <div className="flex" aria-hidden="true">
                      {heroAvatars.map((alt, i) => (
                        <span
                          key={i}
                          className={cn(
                            "rounded-full border-2 border-foreground",
                            i > 0 && "-ml-2",
                          )}
                        >
                          <Image alt={alt} w={64} h={64} className="size-8 rounded-full object-cover" />
                        </span>
                      ))}
                    </div>
                    <span>{heroProof}</span>
                  </div>
                </div>

                {/* Dashboard mockup */}
                <div className="relative">
                  <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-2xl backdrop-blur sm:p-6 transition-transform hover:-translate-y-1">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-chart-1" />
                        <div className="size-3 rounded-full bg-chart-4" />
                        <div className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {demoTitle}
                      </span>
                    </div>
                    <Image
                      alt={demoImageAlt}
                      w={1200}
                      h={800}
                      className="w-full rounded-xl border border-border/60 object-cover"
                    />
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {demoStats.map((s) => (
                        <div
                          key={s.label}
                          className="rounded-lg border border-border/60 bg-muted/60 p-3 text-center"
                        >
                          <div className="text-lg font-bold text-foreground">
                            {s.value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border/60 bg-background py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70">
                {logoNames.map((name) => (
                  <span
                    key={name}
                    className="flex items-center gap-2 text-lg font-bold text-foreground"
                  >
                    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className={cn(
                        "mb-4 inline-flex size-12 items-center justify-center rounded-xl",
                        featureIconTints[i % featureIconTints.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/40 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <article key={step.title} className="relative">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <div
                    key={item.title}
                    className="overflow-hidden rounded-2xl border border-border/60 bg-muted"
                  >
                    <Image
                      alt={item.alt}
                      w={800}
                      h={600}
                      className="h-56 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="p-5">
                      <h3 className="font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl bg-card p-8",
                      plan.popular
                        ? "border-2 border-primary shadow-lg"
                        : "border border-border/60 shadow-sm",
                    )}
                  >
                    {plan.popular ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                        Most Popular
                      </span>
                    ) : null}
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-foreground">
                        {plan.price}
                      </span>
                      {plan.period ? (
                        <span className="text-sm text-muted-foreground">
                          {plan.period}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-foreground">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors",
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/80"
                          : "border border-primary text-primary hover:bg-primary/10",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-16 text-background md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="text-4xl font-extrabold text-background md:text-5xl">
                      {s.value}
                    </div>
                    <div className="mt-2 text-sm text-background/70">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/40 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
                  >
                    <div className="mb-4 flex gap-0.5 text-chart-4" aria-label="5 stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <blockquote className="mb-6 text-sm leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={128}
                        h={128}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-20 md:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-14 text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border/60 bg-card transition-shadow open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-5 text-left font-semibold text-foreground select-none">
                      {item.question}
                      <Chevron />
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary py-20 text-primary-foreground md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {ctaHeading}
                </h2>
                <p className="mb-8 text-lg text-primary-foreground/80">
                  {ctaSub}
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaPrimary)}
                    className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 text-base font-bold text-foreground shadow-lg transition-colors hover:bg-accent"
                  >
                    {ctaPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaSecondary)}
                    className="inline-flex items-center justify-center rounded-xl border border-primary-foreground/30 px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                  >
                    {ctaSecondary}
                  </button>
                </div>
                <p className="mt-4 text-sm text-primary-foreground/70">
                  14-day free trial &middot; Cancel anytime &middot; No setup fees
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-14 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-background"
                >
                  <LogoMark className="bg-background/10 text-background/70" />
                  {brand}
                </button>
                <p className="max-w-xs text-sm leading-relaxed text-background/70">
                  {footerTagline}
                </p>
                <div className="mt-5 flex items-center gap-4">
                  {(
                    [
                      {
                        label: "Twitter",
                        path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                      },
                      {
                        label: "LinkedIn",
                        path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                      },
                      {
                        label: "GitHub",
                        path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
                      },
                    ] as const
                  ).map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-8 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={social.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-left transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center gap-4 border-t border-background/20 pt-8 text-xs text-background/50 sm:flex-row sm:justify-between">
              <p>{footerCopyright}</p>
              <div className="flex items-center gap-6">
                {footerBottom.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
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
