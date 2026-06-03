import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * SaasKimiPage3 — a visually distinct third-style sibling to SaasKimiPage.
 *
 * A dark, immersive, high-contrast SaaS landing page with a cinematic
 * gradient-accented hero, a full-width dashboard preview image, glowing
 * feature cards with violet-to-fuchsia icon tiles, three rich "how it works"
 * steps with embedded mock UIs, a product gallery grid with image overlays and
 * gradient text statistics, six testimonial cards with real avatar photos and
 * star ratings, an interactive FAQ accordion, and a multi-column footer.
 * Reproduces the original Kimi-generated "Chronos AI" dark-theme design while
 * translating every color into semantic Tailwind tokens so theme injection
 * works without `dark:` variants.
 *
 * Use for AI-product, scheduling, automation, B2B SaaS, developer-tool, and
 * productivity startups that want a bold, conversion-focused dark landing
 * experience with social proof, transparent pricing, and a premium aesthetic.
 * Supply content only — brand, nav, hero, logos, features, steps, gallery,
 * pricing, stats, testimonials, faq, cta, footer; the block owns all layout
 * and styling.
 */
export const SaasKimiPage3 = defineComponent({
  name: "SaasKimiPage3",
  description:
    "Visually distinct third-style sibling to SaasKimiPage — a dark, immersive, high-contrast SaaS landing page with a cinematic gradient-accented hero, full-width dashboard preview, glowing feature cards with purple-to-fuchsia icon tiles, three rich how-it-works steps with embedded mock UI, a product gallery grid with image overlays, gradient-text stat counters, six testimonial cards with real avatar photos and star ratings, an interactive FAQ accordion, and a multi-column footer. Use for AI-product, scheduling, automation, B2B SaaS, developer-tool, and productivity startups wanting a bold, conversion-focused dark landing experience with social proof and transparent pricing.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLine1: z.string().optional(),
        headingLine2: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trustItems: z.array(z.string()).optional(),
        dashboardAlt: z.string().optional(),
      })
      .optional(),
    /** Grayscale 'trusted by' logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid: tag + heading + description + up to 6 items. */
    features: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** 'How it works' numbered steps. */
    steps: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Product gallery grid. */
    gallery: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              subtitle: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        tag: z.string().optional(),
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
    /** Metrics band. */
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
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Frequently asked questions accordion. */
    faq: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing gradient CTA banner. */
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
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
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
      : ["Features", "Pricing", "Reviews", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "New: AI Smart Conflict Resolution"
    const heroHeadingLine1 =
      props.hero?.headingLine1 ?? "Your Calendar,"
    const heroHeadingLine2 =
      props.hero?.headingLine2 ?? "Supercharged by AI"
    const heroSub =
      props.hero?.subheading ??
      "Chronos AI automatically schedules meetings, resolves conflicts, and optimizes your day. Join 50,000+ professionals who've reclaimed 8+ hours every week."
    const heroPrimary =
      props.hero?.primaryCta ?? "Start Free Trial — 14 Days"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroTrust = props.hero?.trustItems?.length
      ? props.hero.trustItems
      : [
          "No credit card required",
          "Cancel anytime",
          "Gmail & Outlook sync",
        ]
    const dashboardAlt =
      props.hero?.dashboardAlt ??
      "AI calendar scheduling dashboard interface showing weekly calendar view with automated meeting suggestions"

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Stripe", "Notion", "GitHub", "Figma", "Slack", "Vercel"]

    const featuresTag = props.features?.tag ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need to master your time"
    const featuresDesc =
      props.features?.description ??
      "Chronos AI combines intelligent automation with beautiful design to transform how you schedule and manage your calendar."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Scheduling",
            description:
              "AI automatically finds the perfect meeting times based on everyone's availability, preferences, and time zones. No more back-and-forth emails.",
          },
          {
            title: "Instant Conflict Resolution",
            description:
              "When meetings overlap, Chronos AI suggests alternatives, reschedules automatically, or offers to decline with a polite message.",
          },
          {
            title: "Timezone Intelligence",
            description:
              "Working with global teams? Chronos AI handles timezones automatically, showing everyone's local time and finding overlap hours.",
          },
          {
            title: "Focus Time Blocks",
            description:
              "AI protects your deep work hours by automatically blocking focus time and defending it against meeting requests.",
          },
          {
            title: "AI Meeting Assistant",
            description:
              'Natural language commands like "Schedule a team sync next Tuesday at 2pm" and Chronos AI handles the rest, including invitations.',
          },
          {
            title: "Analytics Dashboard",
            description:
              "Understand how you spend your time with detailed insights. Track meeting load, focus hours, and productivity trends.",
          },
        ]

    const stepsTag = props.steps?.tag ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Get started in 3 simple steps"
    const stepsDesc =
      props.steps?.description ??
      "From signup to fully automated scheduling in under 5 minutes."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect Your Calendar",
            description:
              "Sync with Google Calendar, Outlook, or Apple Calendar in one click. Chronos AI reads your existing events and availability securely.",
          },
          {
            title: "Set Your Preferences",
            description:
              "Tell Chronos AI your working hours, meeting limits, focus time needs, and buffer preferences. It learns and adapts over time.",
          },
          {
            title: "Let AI Take Over",
            description:
              "Chronos AI now handles all scheduling automatically. Share your booking link or let it negotiate times via email on your behalf.",
          },
        ]

    const galleryTag = props.gallery?.tag ?? "Product Gallery"
    const galleryHeading =
      props.gallery?.heading ??
      "A beautiful interface for complex scheduling"
    const galleryDesc =
      props.gallery?.description ??
      "Every interaction designed to save you time and reduce cognitive load."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Intelligent Weekly View",
            subtitle: "See your week at a glance with AI-suggested optimizations",
            imageAlt:
              "Modern calendar dashboard interface showing weekly view with colorful event blocks and AI scheduling suggestions",
          },
          {
            title: "Mobile Companion",
            subtitle: "Schedule on-the-go with full AI capabilities",
            imageAlt:
              "Scheduling assistant mobile app interface showing smart meeting booking and conflict resolution notifications",
          },
          {
            title: "Team Coordination",
            subtitle: "Find the perfect time for everyone instantly",
            imageAlt:
              "Team scheduling coordination view showing multiple calendars side by side with availability overlap highlighting",
          },
          {
            title: "Time Analytics",
            subtitle: "Understand where your time goes with insights",
            imageAlt:
              "Time analytics dashboard showing pie charts and productivity metrics for weekly meeting load and focus time",
          },
        ]

    const pricingTag = props.pricing?.tag ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, scale as you grow. No hidden fees, cancel anytime."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "For individuals getting started",
            price: "$0",
            period: "/month",
            features: [
              "1 calendar connection",
              "10 AI-scheduled meetings/month",
              "Basic conflict detection",
              "Email support",
            ],
            cta: "Get Started Free",
            popular: false,
          },
          {
            name: "Pro",
            description: "For professionals & small teams",
            price: "$12",
            period: "/month",
            features: [
              "Unlimited calendars",
              "Unlimited AI meetings",
              "Advanced conflict resolution",
              "Focus time protection",
              "Analytics dashboard",
              "Priority support",
            ],
            cta: "Start 14-Day Free Trial",
            popular: true,
          },
          {
            name: "Enterprise",
            description: "For organizations at scale",
            price: "$49",
            period: "/user/month",
            features: [
              "Everything in Pro",
              "Team coordination hub",
              "SSO & advanced security",
              "Custom AI training",
              "Dedicated success manager",
              "SLA guarantee",
            ],
            cta: "Contact Sales",
            popular: false,
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active users scheduling smarter" },
          { value: "2.5M+", label: "Meetings auto-scheduled" },
          { value: "8.2 hrs", label: "Average weekly time saved" },
          { value: "99.9%", label: "Uptime reliability" },
        ]

    const testimonialsTag = props.testimonials?.tag ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by professionals worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how Chronos AI is transforming productivity across industries."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Chronos AI has completely eliminated the back-and-forth of scheduling. I've reclaimed nearly 10 hours a week that I now spend on actual work. The AI is scarily accurate at finding optimal times.",
            name: "Sarah Chen",
            role: "VP Product, Linear",
            avatarAlt:
              "Professional headshot of Sarah Chen, VP of Product at a technology startup",
          },
          {
            quote:
              "Managing a remote team across 4 time zones was a nightmare until Chronos. The timezone intelligence alone is worth the subscription. Our team coordination improved overnight.",
            name: "Marcus Rodriguez",
            role: "Engineering Director, Figma",
            avatarAlt:
              "Professional headshot of Marcus Rodriguez, engineering director at a SaaS company",
          },
          {
            quote:
              "As an executive coach, my calendar is my lifeline. Chronos AI protects my focus time while keeping me connected to clients. The focus blocks feature is a game-changer for deep work.",
            name: "Dr. Emily Watson",
            role: "Executive Coach, Mindful Leaders",
            avatarAlt:
              "Professional headshot of Dr. Emily Watson, executive coach and business consultant",
          },
          {
            quote:
              "We rolled Chronos out to our 200-person sales team and saw immediate results. Deal velocity increased 23% because reps spend less time coordinating and more time selling.",
            name: "James Thompson",
            role: "CRO, Notion",
            avatarAlt:
              "Professional headshot of James Thompson, Chief Revenue Officer at an enterprise software company",
          },
          {
            quote:
              "The analytics dashboard revealed I was in meetings 37 hours a week. With Chronos AI's help, I've cut that to 18 hours and my output has actually increased. Data-driven calendar optimization!",
            name: "Priya Sharma",
            role: "UX Lead, Airbnb",
            avatarAlt:
              "Professional headshot of Priya Sharma, freelance UX designer and design consultant",
          },
          {
            quote:
              "Chronos AI handles my investor relations calendar flawlessly. It knows to prioritize board meetings, protect prep time, and batch introductory calls. It's like having an executive assistant.",
            name: "David Park",
            role: "CEO, Chronos (yes, we use it too!)",
            avatarAlt:
              "Professional headshot of David Park, founder and CEO of a venture-backed technology startup",
          },
        ]

    const faqTag = props.faq?.tag ?? "FAQ"
    const faqHeading =
      props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about Chronos AI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question:
              "How does Chronos AI handle my calendar data securely?",
            answer:
              "We use OAuth 2.0 for read-only access to your calendar (we never store your login credentials). All data is encrypted at rest with AES-256 and in transit with TLS 1.3. We're SOC 2 Type II certified and GDPR compliant. You can disconnect and delete all data at any time.",
          },
          {
            question: "Which calendar platforms do you support?",
            answer:
              "Chronos AI integrates seamlessly with Google Calendar (Gmail/G Suite), Microsoft Outlook/Exchange (Office 365), and Apple iCloud Calendar. We also support CalDAV for custom calendar servers. Multi-calendar sync allows you to connect all your calendars in one unified view.",
          },
          {
            question: "Can I override the AI's scheduling decisions?",
            answer:
              "Absolutely. You maintain full control. The AI provides recommendations but requires your approval for any action. You can set different automation levels — from suggestions only to full autopilot — and adjust them per meeting type. Emergency overrides are always available.",
          },
          {
            question: "What happens during the free trial?",
            answer:
              "You get full access to all Pro features for 14 days. No credit card required to start. At the end of the trial, you can choose to upgrade to Pro, continue with the free Starter plan, or export your data and leave. We'll remind you 3 days before the trial ends.",
          },
          {
            question:
              "How does the timezone handling work for global teams?",
            answer:
              "Chronos AI automatically detects and displays all participants' local time zones. When suggesting meeting times, it finds overlapping working hours and respects each person's preferences. Invitations are sent with timezone-aware formatting, and the AI learns patterns to suggest optimal recurring meeting slots.",
          },
          {
            question:
              "Do you offer discounts for non-profits or education?",
            answer:
              "Yes! We offer 50% off Pro plans for verified non-profits, educational institutions, and students. Contact our support team with your organization's details for verification. We also have a free tier specifically designed for students with limited scheduling needs.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to reclaim your time?"
    const ctaSub =
      props.cta?.subheading ??
      "Join 50,000+ professionals who've eliminated scheduling headaches and gained hours back every week. Start your free trial today — no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started for Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"

    const footerTagline =
      props.footer?.tagline ??
      "Intelligent scheduling for modern professionals. Reclaim your time with AI-powered calendar automation."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Documentation",
              "API Reference",
              "Status",
              "Contact",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    const [openFaqs, setOpenFaqs] = useState<boolean[]>(
      faqItems.map(() => true),
    )

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
    )

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[1.125rem] shrink-0 text-chart-2"
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

    const ArrowRight = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    )

    const PlayCircle = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <LogoMark />
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {brand}
              </span>
            </button>
            <ul className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go("Sign in")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="inline-flex items-center justify-center rounded-lg bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Get Started
              </button>
            </div>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
            {/* Background blobs */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/30 via-background to-background"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-chart-1/20 opacity-50 blur-3xl"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {heroBadge}
                  </span>
                </div>

                {/* Heading */}
                <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
                  <span className="bg-gradient-to-r from-foreground via-primary/80 to-accent/80 bg-clip-text text-transparent">
                    {heroHeadingLine1}
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-accent to-chart-1 bg-clip-text text-transparent">
                    {heroHeadingLine2}
                  </span>
                </h1>

                {/* Subheading */}
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>

                {/* CTAs */}
                <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90"
                  >
                    {heroPrimary}
                    <ArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-muted/50 px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <PlayCircle />
                    {heroSecondary}
                  </button>
                </div>

                {/* Trust items */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  {heroTrust.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="relative mt-16">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-chart-1 opacity-30 blur" />
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="size-3 rounded-full bg-chart-5" />
                      <div className="size-3 rounded-full bg-chart-4" />
                      <div className="size-3 rounded-full bg-chart-2" />
                    </div>
                    <div className="flex-1 text-center text-xs text-muted-foreground">
                      Chronos AI Dashboard
                    </div>
                  </div>
                  <Image
                    alt={dashboardAlt}
                    w={1200}
                    h={800}
                    className="w-full"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Logo cloud */}
          <section className="border-y border-border/50 bg-muted/30 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {/* Inline brand icon paths (decorative) */}
                    {name === "Stripe" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    )}
                    {name === "Notion" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    )}
                    {name === "GitHub" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    )}
                    {name === "Figma" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M24 4.515v14.97c0 .57-.424 1.048-.98 1.124l-9.024 1.31c-.25.038-.503.038-.752 0l-9.024-1.31c-.556-.076-.98-.554-.98-1.124V4.515c0-.57.424-1.048.98-1.124l9.024-1.31c.25-.038.502-.038.752 0l9.024 1.31c.556.076.98.554.98 1.124z" />
                      </svg>
                    )}
                    {name === "Slack" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.566-1.007-.953-2.102-.953-1.254 0-2.244.642-2.244 2.006 0 1.64 1.673 2.228 3.35 2.894 2.61 1.1 5.312 2.692 5.312 6.16 0 2.745-1.514 4.626-3.89 5.073V24h-3.45v-2.124c-2.02-.343-3.612-1.69-3.612-4.225 0-2.313 1.266-3.87 3.314-4.245v-.002c-.16-.554-.595-1.104-1.65-1.104-1.386 0-2.486.897-2.486 2.58 0 1.576 1.41 2.23 2.87 2.81 2.613 1.04 5.02 2.39 5.02 5.627 0 2.83-1.52 4.628-3.833 5.085V24H8.42v-2.066c-2.09-.38-3.75-1.824-3.75-4.39 0-2.523 1.34-4.088 3.42-4.486v-.002c-.17-.526-.558-.93-1.546-.93-1.37 0-2.457.785-2.457 2.456 0 1.563 1.39 2.27 2.785 2.86 2.57 1.01 4.97 2.35 4.97 5.578 0 2.88-1.55 4.708-3.88 5.165V24H2V2h20v7.076c0 1.76-.59 2.95-1.528 3.79v.002c.89.672 1.528 1.75 1.528 3.514z" />
                      </svg>
                    )}
                    {name === "Vercel" && (
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    {!['Stripe','Notion','GitHub','Figma','Slack','Vercel'].includes(name) && (
                      <span className="size-6 rounded-full bg-muted" />
                    )}
                    <span className="text-lg font-semibold">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="relative py-24 lg:py-32">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--tw-gradient-stops))] from-accent/20 via-background to-background"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {featuresTag}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card/50 p-8 transition-all hover:border-primary/50"
                  >
                    <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-3">
                      {/* Decorative feature icons — rotate per index */}
                      {i === 0 && (
                        <svg
                          className="size-7 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                      {i === 1 && (
                        <svg
                          className="size-7 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      )}
                      {i === 2 && (
                        <svg
                          className="size-7 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      )}
                      {i === 3 && (
                        <svg
                          className="size-7 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                      )}
                      {i === 4 && (
                        <svg
                          className="size-7 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      )}
                      {i === 5 && (
                        <svg
                          className="size-7 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="border-y border-border/50 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {stepsTag}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                {/* Step 1 */}
                <div className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
                      1
                    </div>
                    <div className="hidden h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {stepItems[0]?.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-muted-foreground">
                    {stepItems[0]?.description}
                  </p>
                  <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-destructive/20">
                        <svg
                          className="size-5 text-destructive"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM12 8.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5z" />
                        </svg>
                      </div>
                      <div className="grid size-10 place-items-center rounded-lg bg-chart-1/20">
                        <svg
                          className="size-5 text-chart-1"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9L7.09 10.96L7.06 11.03Q6.8 10.5 6.5 9.96 6.25 9.5 5.97 9L5.64 8.42H3.73L5.86 12.08L3.59 15.28H5.5L6.12 14.22M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H12V15.75M13.88 11.38V8.25H12V11.38M13.88 7V4.5H8.25V7M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M20.75 7V4.5H15.13V7Z" />
                        </svg>
                      </div>
                      <div className="grid size-10 place-items-center rounded-lg bg-muted/50">
                        <svg
                          className="size-5 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14h-9a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v7a.5.5 0 01-.5.5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-chart-2">
                      <Check />
                      <span>Connected in 12 seconds</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
                      2
                    </div>
                    <div className="hidden h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {stepItems[1]?.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-muted-foreground">
                    {stepItems[1]?.description}
                  </p>
                  <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Working hours
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        9:00 AM — 6:00 PM
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Max meetings/day
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        4 meetings
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Focus blocks
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        2 hours protected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Meeting buffers
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        15 min before/after
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
                      3
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {stepItems[2]?.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-muted-foreground">
                    {stepItems[2]?.description}
                  </p>
                  <div className="rounded-xl border border-border bg-card/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/20">
                        <span className="text-xs font-bold text-primary">
                          AI
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                          I've scheduled your design review with Sarah Chen for
                          Tuesday at 2:00 PM EST (her 11:00 AM PST). Protected
                          your focus block as requested.
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Just now</span>
                          <span>·</span>
                          <span className="text-chart-2">Auto-scheduled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="relative overflow-hidden py-24 lg:py-32">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-chart-1/20 via-background to-background"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-chart-1/30 bg-chart-1/10 px-3 py-1 text-sm font-medium text-chart-1">
                  {galleryTag}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {galleryItems.map((item) => (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card/50"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={500}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="mb-1 text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="border-y border-border/50 py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {pricingTag}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      plan.popular
                        ? "border-2 border-primary bg-card/80"
                        : "border border-border bg-card/50",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-sm text-foreground"
                        >
                          <Check />
                          {feat.startsWith("Unlimited") ? (
                            <span>
                              <span className="font-medium text-foreground">
                                Unlimited
                              </span>{" "}
                              {feat.replace("Unlimited ", "")}
                            </span>
                          ) : (
                            feat
                          )}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                        plan.popular
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
                          : "border border-input bg-transparent text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                All plans include a 14-day free trial. No credit card required to
                start.
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="relative py-24 lg:py-32">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s, i) => (
                  <div key={s.label} className="text-center">
                    <div
                      className={cn(
                        "mb-2 text-4xl font-bold bg-clip-text text-transparent sm:text-5xl",
                        i === 0 &&
                          "bg-gradient-to-r from-foreground to-muted-foreground",
                        i === 1 &&
                          "bg-gradient-to-r from-primary to-accent",
                        i === 2 &&
                          "bg-gradient-to-r from-accent to-chart-1",
                        i === 3 &&
                          "bg-gradient-to-r from-chart-1 to-chart-2",
                      )}
                    >
                      {s.value}
                    </div>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            id="testimonials"
            className="border-y border-border/50 py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {testimonialsTag}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-2xl border border-border bg-card/50 p-8"
                  >
                    <div
                      className="mb-6 flex gap-1 text-chart-4"
                      aria-label="5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt ?? t.name}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
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
          <section id="faq" className="relative py-24 lg:py-32">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-primary/10 via-background to-background"
            />
            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {faqTag}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item, i) => {
                  const open = openFaqs[i] ?? true
                  return (
                    <div
                      key={item.question}
                      className="overflow-hidden rounded-xl border border-border bg-card/50"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqs((prev) =>
                            prev.map((v, idx) =>
                              idx === i ? !v : v,
                            ),
                          )
                        }
                        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
                      >
                        <span className="font-semibold text-foreground">
                          {item.question}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-180",
                          )}
                        >
                          <ChevronDown />
                        </span>
                      </button>
                      <div
                        className={cn(
                          "grid overflow-hidden transition-all",
                          open
                            ? "grid-rows-[1fr] pb-6 opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <p className="min-h-0 px-6 leading-relaxed text-muted-foreground">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden py-24 lg:py-32">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-background"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent blur-3xl"
            />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                <span className="bg-gradient-to-r from-foreground via-primary/80 to-accent/80 bg-clip-text text-transparent">
                  {ctaHeading}
                </span>
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                {ctaSub}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-semibold text-foreground shadow-xl transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/50 px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    width="20"
                    height="20"
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
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                Free 14-day trial • Cancel anytime • Setup in 2 minutes
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              {/* Brand */}
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground"
                >
                  <LogoMark />
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {["Twitter", "GitHub", "LinkedIn"].map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {social === "Twitter" && (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      )}
                      {social === "GitHub" && (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 3.848-2.339 4.695-4.566 4.943.359.372.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      )}
                      {social === "LinkedIn" && (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer columns */}
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-border/50 pt-8 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {footerCopyright}
              </p>
              <div className="flex items-center gap-6">
                {["Privacy", "Terms", "Cookies", "Security"].map(
                  (link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => go(link)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
