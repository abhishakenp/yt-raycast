import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * SaasKimiPage10 — the 10th stylistic sibling to SaasKimiPage.
 *
 * A bright, airy SaaS landing page with a split hero featuring a live calendar
 * dashboard mockup, a 6-up feature grid topped with two large highlight cards
 * (dark focus-time + light booking-links), a numbered "How It Works" trio with a
 * horizontal gradient connector, an image gallery of product shots, a 3-tier
 * pricing table with a dark "Most Popular" tier, a dark stats band, 6
 * testimonial cards with star ratings and real headshots, a simple FAQ list, a
 * gradient primary CTA banner, and a multi-column dark footer.
 *
 * Use for AI scheduling, productivity, calendar SaaS, or B2B tools when you
 * want a clean, professional, slightly playful visual mood distinct from the
 * standard indigo-heavy SaasKimiPage.
 */
export const SaasKimiPage10 = defineComponent({
  name: "SaasKimiPage10",
  description:
    "A bright, cheerful SaaS landing page (the 10th style sibling to SaasKimiPage) with a split hero showing a calendar-dashboard mockup, a 6-up feature grid + two large highlight cards, a numbered How It Works band with a gradient connector, a product image gallery, a 3-tier pricing table with a dark 'Most Popular' tier, a dark stats band, 6 testimonial cards with star ratings and headshots, a simple FAQ list, a gradient CTA banner, and a rich multi-column dark footer. Use for AI scheduling, productivity SaaS, calendar tools, or modern B2B startups when a light, friendly, conversion-focused page with social proof and pricing is wanted.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        demoTitle: z.string().optional(),
        schedule: z
          .array(
            z.object({
              time: z.string(),
              title: z.string().optional(),
              note: z.string().optional(),
              tone: z.enum(["primary", "accent", "muted"]).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
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
    focusCard: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      })
      .optional(),
    schedulingCard: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        urlLabel: z.string().optional(),
        slots: z
          .array(
            z.object({
              day: z.string(),
              time: z.string(),
              active: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              note: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              alt: z.string(),
              w: z.number().optional(),
              h: z.number().optional(),
              span: z.string().optional(),
              tag: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
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
        note: z.string().optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
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
              alt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
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
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        finePrint: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        description: z.string().optional(),
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

    const brand = props.brand ?? "Chrono AI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Reviews", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "New: AI Conflict Resolution 2.0"
    const heroHeading = props.hero?.heading ?? "Your Calendar, "
    const heroHighlight = props.hero?.highlight ?? "Supercharged by AI"
    const heroSub =
      props.hero?.subheading ??
      "Chrono AI automatically schedules meetings, resolves conflicts, and optimizes your day for peak productivity. Connect your calendars and let AI handle the rest."
    const heroPrimary = props.hero?.primaryCta ?? "Get Started Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroProof =
      props.hero?.socialProof ?? "Trusted by 12,000+ professionals"
    const demoTitle = props.hero?.demoTitle ?? "Chrono AI Dashboard"
    const schedule = props.hero?.schedule?.length
      ? props.hero.schedule
      : [
          {
            time: "9:00 AM",
            title: "Product Team Standup",
            note: "30 min \u2022 Zoom",
            tone: "primary" as const,
          },
          {
            time: "10:30 AM",
            title: "Deep Work Block",
            note: "2 hrs \u2022 Focus Time",
            tone: "accent" as const,
          },
          {
            time: "1:00 PM",
            title: "Client Review \u2014 Moved by AI",
            note: "45 min \u2022 Google Meet",
            tone: "primary" as const,
          },
          {
            time: "3:00 PM",
            title: "Sync with Marketing",
            note: "Resolved \u2014 Merged with 1:00 PM",
            tone: "muted" as const,
          },
        ]

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Stripe", "Notion", "Slack", "Figma", "Linear", "Vercel"]

    const featuresTag = props.features?.tag ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need to reclaim your time"
    const featuresDesc =
      props.features?.description ??
      "Chrono AI combines intelligent scheduling with seamless integrations to transform how you manage your calendar."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "AI Smart Scheduling",
            description:
              "Our AI analyzes your work patterns, energy levels, and priorities to automatically schedule meetings at optimal times.",
          },
          {
            title: "Conflict Resolution",
            description:
              "When double-bookings occur, Chrono AI automatically suggests alternative times and notifies all participants instantly.",
          },
          {
            title: "Team Coordination",
            description:
              "Find the perfect meeting time across multiple time zones and busy schedules with one click.",
          },
          {
            title: "Calendar Sync",
            description:
              "Connect Google Calendar, Outlook, Apple Calendar, and more. All your events in one intelligent view.",
          },
          {
            title: "Smart Reminders",
            description:
              "AI-powered notifications that know when to remind you based on travel time, prep needed, and your location.",
          },
          {
            title: "Analytics & Insights",
            description:
              "Understand how you spend your time with detailed reports on meeting load, focus time, and productivity trends.",
          },
        ]

    const focusTitle = props.focusCard?.title ?? "Focus Time Protection"
    const focusDesc =
      props.focusCard?.description ??
      "Automatically block deep work sessions and defend them from meeting creep."
    const focusBullets = props.focusCard?.bullets?.length
      ? props.focusCard.bullets
      : [
          "Auto-decline meetings during focus blocks",
          "Smart Slack status updates",
          "Do Not Disturb automation",
        ]

    const schedTitle = props.schedulingCard?.title ?? "One-Click Scheduling"
    const schedDesc =
      props.schedulingCard?.description ??
      "Share your availability and let others book directly without the back-and-forth."
    const schedUrl = props.schedulingCard?.urlLabel ?? "chrono.ai/book/sarah"
    const schedSlots = props.schedulingCard?.slots?.length
      ? props.schedulingCard.slots
      : [
          { day: "Mon", time: "9a", active: false },
          { day: "Tue", time: "2p", active: false },
          { day: "Wed", time: "10a", active: true },
          { day: "Thu", time: "3p", active: false },
        ]

    const stepsTag = props.steps?.tag ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Get started in minutes, not hours"
    const stepsDesc =
      props.steps?.description ??
      "Chrono AI integrates seamlessly with your existing workflow. No migration headaches, no complex setup."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect Your Calendars",
            description:
              "Link Google Calendar, Outlook, Apple Calendar, and any other calendar you use. We sync bidirectionally in real-time.",
            note: "2-minute setup",
          },
          {
            title: "Set Your Preferences",
            description:
              "Tell Chrono AI your working hours, focus time preferences, meeting limits, and buffer times between calls.",
            note: "Fully customizable",
          },
          {
            title: "Let AI Take Over",
            description:
              "Chrono AI starts scheduling, resolving conflicts, and protecting your focus time automatically.",
            note: "Works 24/7",
          },
        ]

    const galleryTag = props.gallery?.tag ?? "Product Gallery"
    const galleryHeading =
      props.gallery?.heading ??
      "A beautiful interface for complex scheduling"
    const galleryDesc =
      props.gallery?.description ??
      "Every pixel designed to reduce cognitive load and make calendar management effortless."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Unified Calendar View",
            description: "See all your calendars in one intelligent timeline",
            alt: "modern calendar dashboard interface showing weekly schedule with colorful event blocks",
            w: 1200,
            h: 700,
            span: "md:col-span-2 lg:col-span-2",
            tag: "Dashboard",
          },
          {
            title: "Time Analytics",
            description: "Insights into your meeting patterns",
            alt: "analytics dashboard showing colorful pie charts and productivity metrics",
            w: 600,
            h: 400,
          },
          {
            title: "Mobile App",
            description: "Manage on the go",
            alt: "mobile phone showing a scheduling app interface held in hand",
            w: 600,
            h: 400,
          },
          {
            title: "Team Scheduling",
            description: "Coordinate across your entire organization",
            alt: "team collaboration meeting with diverse professionals around a conference table with laptops",
            w: 800,
            h: 500,
            span: "md:col-span-2",
            tag: "Teams",
          },
        ]

    const pricingTag = props.pricing?.tag ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple pricing for every stage"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, upgrade when you're ready. No hidden fees, no surprise charges."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "For individual professionals",
            price: "$0",
            period: "/month",
            features: [
              "1 calendar connection",
              "Basic AI scheduling",
              "10 meetings/month",
              "Email reminders",
            ],
            cta: "Get Started Free",
            popular: false,
          },
          {
            name: "Pro",
            description: "For busy professionals",
            price: "$12",
            period: "/month",
            features: [
              "Unlimited calendars",
              "Advanced AI conflict resolution",
              "Unlimited meetings",
              "Focus time protection",
              "Custom booking links",
              "Analytics dashboard",
            ],
            cta: "Start 14-Day Free Trial",
            popular: true,
          },
          {
            name: "Team",
            description: "For growing teams",
            price: "$29",
            period: "/user/month",
            features: [
              "Everything in Pro",
              "Team scheduling optimization",
              "Shared team calendars",
              "Admin controls & insights",
              "Priority support",
              "SSO & advanced security",
            ],
            cta: "Contact Sales",
            popular: false,
          },
        ]
    const pricingNote =
      props.pricing?.note ??
      "All plans include a 14-day free trial. No credit card required."

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12,000+", label: "Active Professionals" },
          { value: "2.4M", label: "Meetings Scheduled" },
          { value: "847K", label: "Hours Saved" },
          { value: "98.7%", label: "Satisfaction Rate" },
        ]

    const testimonialsTag = props.testimonials?.tag ?? "Reviews"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by professionals worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how Chrono AI is transforming the way people work."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Chrono AI has completely eliminated the back-and-forth of scheduling. What used to take 15 emails now happens automatically. I've reclaimed 6+ hours every week.",
            name: "Sarah Chen",
            role: "Product Manager at Notion",
            alt: "professional headshot of Sarah Chen a product manager with shoulder length dark hair",
          },
          {
            quote:
              "The AI conflict resolution is magic. It caught a double-booking I didn't even notice and suggested a perfect alternative that worked for everyone. Game changer.",
            name: "Marcus Johnson",
            role: "Engineering Manager at Stripe",
            alt: "professional headshot of Marcus Johnson an engineering manager with short hair and friendly smile",
          },
          {
            quote:
              "As a founder, my time is my most valuable asset. Chrono AI's focus time protection ensures I get uninterrupted blocks for deep work. Indispensable.",
            name: "Elena Rodriguez",
            role: "CEO at Brightpath",
            alt: "professional headshot of Elena Rodriguez a startup founder with blonde hair in professional attire",
          },
          {
            quote:
              "Rolled this out to our 50-person team and saw an immediate 30% reduction in scheduling overhead. The ROI was clear within the first week.",
            name: "David Kim",
            role: "Operations Director at Linear",
            alt: "professional headshot of David Kim an operations director with glasses and short dark hair",
          },
          {
            quote:
              "The analytics helped me realize I was spending 70% of my day in meetings. Chrono AI helped me reclaim 15 hours per week for actual work.",
            name: "Jennifer Walsh",
            role: "Design Lead at Figma",
            alt: "professional headshot of Jennifer Walsh a design lead with curly brown hair and confident expression",
          },
          {
            quote:
              "Working across 3 time zones used to be a nightmare. Chrono AI finds optimal meeting times automatically. My international team loves it.",
            name: "Ahmed Hassan",
            role: "Remote Team Lead at GitLab",
            alt: "professional headshot of Ahmed Hassan a remote team lead with beard and warm smile",
          },
        ]

    const faqTag = props.faq?.tag ?? "FAQ"
    const faqHeading =
      props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about Chrono AI."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the AI conflict resolution work?",
            answer:
              "When Chrono AI detects a scheduling conflict, it analyzes the priority of each meeting, the availability of all participants, and your preferences. It then suggests alternative times, sends reschedule requests, and updates all calendars automatically. You can review and approve, or let it handle everything hands-free.",
          },
          {
            question: "Which calendar platforms do you support?",
            answer:
              "We currently support Google Calendar, Microsoft Outlook/Exchange, Apple Calendar, Calendly, and any calendar that supports CalDAV. You can connect multiple calendars from different providers and Chrono AI will keep them all in sync.",
          },
          {
            question: "Is my calendar data secure?",
            answer:
              "Absolutely. We use bank-level AES-256 encryption for all data at rest and TLS 1.3 for data in transit. We're SOC 2 Type II certified and GDPR compliant. Your data is never used to train our AI models, and we never sell or share your information with third parties.",
          },
          {
            question: "Can I try Chrono AI before committing?",
            answer:
              "Yes! Every plan includes a 14-day free trial with full access to all features. No credit card required to start. You can upgrade, downgrade, or cancel at any time.",
          },
          {
            question: "How does the team plan work?",
            answer:
              "Team plans include all Pro features plus shared team calendars, collective scheduling optimization, admin analytics, and advanced permissions. You pay per active user, and we offer volume discounts for teams of 50+.",
          },
          {
            question: "What happens if I want to cancel?",
            answer:
              "You can cancel anytime with no penalties. Your data remains accessible for 30 days after cancellation, giving you plenty of time to export if needed. We also offer prorated refunds for annual plans if you cancel within 30 days.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to reclaim your time?"
    const ctaSub =
      props.cta?.subheading ??
      "Join 12,000+ professionals who have transformed their productivity with Chrono AI. Start your free 14-day trial today."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Watch Demo"
    const ctaFine =
      props.cta?.finePrint ??
      "No credit card required \u2022 14-day free trial \u2022 Cancel anytime"

    const footerDesc =
      props.footer?.description ??
      "Intelligent calendar and scheduling assistant that uses AI to automatically schedule meetings, resolve conflicts, and optimize your day."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "API", "Changelog"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Contact"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "Help Center",
              "Community",
              "Webinars",
              "FAQ",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `\u00a9 ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // ---- decorative inline components ----
    const LogoGlyph = () => (
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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0 text-chart-2"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const CheckPrimary = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0 text-primary"
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
        <polyline points="9 18 15 12 9 6" />
      </svg>
    )

    const Play = () => (
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
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    )

    const featureIconTints = [
      "bg-primary/10 text-primary",
      "bg-accent/10 text-accent",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-1/10 text-chart-1",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
    ]

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <LogoGlyph />
              </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                onClick={() => go("Sign In")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                Start Free Trial
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="grid size-10 place-items-center rounded-lg text-foreground hover:bg-muted md:hidden"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden bg-background">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-70"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-accent/20 to-transparent"
            />

            <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-32 lg:pb-40">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Left copy */}
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <span className="inline-block size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-xl hover:shadow-primary/25"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <Play />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground lg:justify-start">
                    <div className="flex" aria-hidden="true">
                      {[
                        "professional headshot of a smiling woman with dark hair",
                        "professional headshot of a man with short brown hair and friendly smile",
                        "professional headshot of a woman with blonde hair and warm smile",
                        "professional headshot of a man with glasses and beard",
                      ].map((alt, i) => (
                        <span
                          key={i}
                          className={cn(
                            "block size-8 shrink-0 overflow-hidden rounded-full border-2 border-background",
                            i > 0 && "-ml-2",
                          )}
                        >
                          <Image alt={alt} w={64} h={64} className="size-full object-cover" />
                        </span>
                      ))}
                    </div>
                    <span>{heroProof}</span>
                  </div>
                </div>

                {/* Right demo card */}
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl"
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border/60 bg-muted px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="size-3 rounded-full bg-chart-5" />
                        <span className="size-3 rounded-full bg-chart-4" />
                        <span className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <div className="flex-1 text-center text-xs font-medium text-muted-foreground">
                        {demoTitle}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">
                            Today's Schedule
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            Wednesday, January 15
                          </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-chart-2/10 px-3 py-1.5 text-xs font-medium text-chart-2">
                          <span className="size-1.5 rounded-full bg-chart-2" />
                          AI Optimized
                        </div>
                      </div>
                      <div className="space-y-3">
                        {schedule.map((row, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border border-border/60 p-3",
                              row.tone === "primary"
                                ? "bg-primary/10"
                                : row.tone === "accent"
                                  ? "bg-accent/10"
                                  : row.tone === "muted"
                                    ? "bg-muted opacity-60"
                                    : "bg-background",
                              row.tone === "muted" && "line-through",
                            )}
                          >
                            <div className="w-12 text-center">
                              <p
                                className={cn(
                                  "text-xs",
                                  row.tone === "primary"
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              >
                                {row.time.split(" ")[0]}
                              </p>
                              <p
                                className={cn(
                                  "text-xs",
                                  row.tone === "primary"
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              >
                                {row.time.split(" ")[1]}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {row.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {row.note}
                              </p>
                            </div>
                            {row.tone === "primary" && (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                                aria-hidden="true"
                              >
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                              </svg>
                            )}
                            {row.tone === "muted" && (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                                aria-hidden="true"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -bottom-6 -right-6 animate-bounce rounded-xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-chart-2 text-primary-foreground">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Conflict Resolved
                        </p>
                        <p className="text-xs text-muted-foreground">
                          AI found a better time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border/60 bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoNames.map((name) => {
                  const logoSvgs: Record<string, React.ReactNode> = {
                    Stripe: (
                      <svg
                        className="size-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    ),
                    Notion: (
                      <svg
                        className="size-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    ),
                    Slack: (
                      <svg
                        className="size-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <path
                          d="M7 12h10M12 7v10"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    ),
                    Figma: (
                      <svg
                        className="size-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" fill="white" />
                      </svg>
                    ),
                    Linear: (
                      <svg
                        className="size-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ),
                    Vercel: (
                      <svg
                        className="size-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
                        <circle cx="8" cy="8" r="2" />
                        <circle cx="16" cy="16" r="2" />
                      </svg>
                    ),
                  }
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-center gap-2 text-lg font-semibold text-muted-foreground"
                    >
                      {logoSvgs[name] ?? null}
                      <span>{name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-primary">
                  {featuresTag}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
                    className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110",
                        featureIconTints[i % featureIconTints.length],
                      )}
                    >
                      {/* generic feature icon set */}
                      {i % 6 === 0 && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {i % 6 === 1 && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                      {i % 6 === 2 && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                      {i % 6 === 3 && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                      {i % 6 === 4 && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      )}
                      {i % 6 === 5 && (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
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

              {/* Highlight cards */}
              <div className="mt-16 grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl bg-foreground p-8 text-background">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="mb-2 text-xl font-bold">{focusTitle}</h3>
                      <p className="text-sm text-background/70">
                        {focusDesc}
                      </p>
                    </div>
                    <div className="grid size-12 place-items-center rounded-xl bg-background/10">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                        aria-hidden="true"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {focusBullets.map((b) => (
                      <div key={b} className="flex items-center gap-3 text-sm text-background/90">
                        <Check />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-lg shadow-primary/5">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        {schedTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {schedDesc}
                      </p>
                    </div>
                    <div className="grid size-12 place-items-center rounded-xl bg-primary/10">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        C
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {schedUrl}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {schedSlots.map((slot) => (
                        <div
                          key={slot.day}
                          className={cn(
                            "rounded-lg border py-2 text-center",
                            slot.active
                              ? "border-primary/30 bg-primary/10"
                              : "border-border/60 bg-background",
                          )}
                        >
                          <p
                            className={cn(
                              "text-xs",
                              slot.active
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          >
                            {slot.day}
                          </p>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              slot.active
                                ? "text-primary"
                                : "text-foreground",
                            )}
                          >
                            {slot.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-primary">
                  {stepsTag}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>

              <div className="relative grid gap-8 lg:grid-cols-3">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-12 left-1/3 right-1/3 hidden h-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 lg:block"
                />
                {stepItems.map((step, i) => (
                  <article key={step.title} className="relative text-center">
                    <div
                      className={cn(
                        "relative z-10 mx-auto mb-6 grid size-16 place-items-center rounded-2xl text-2xl font-bold text-primary-foreground shadow-lg",
                        i === 0 && "bg-gradient-to-br from-primary to-primary/80 shadow-primary/25",
                        i === 1 && "bg-gradient-to-br from-accent to-accent/80 shadow-accent/25",
                        i === 2 && "bg-gradient-to-br from-chart-2 to-chart-2/80 shadow-chart-2/25",
                      )}
                    >
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {step.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      {i === 0 && (
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      )}
                      {i === 1 && (
                        <svg
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
                          <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      )}
                      {i === 2 && <Check />}
                      <span>{step.note}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-primary">
                  {galleryTag}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm",
                      item.span,
                    )}
                  >
                    <Image
                      alt={item.alt}
                      w={item.w ?? 600}
                      h={item.h ?? 400}
                      className="w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {item.tag && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-primary">
                  {pricingTag}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
                      "relative flex flex-col rounded-2xl p-8",
                      plan.popular
                        ? "bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-2xl shadow-primary/10"
                        : "border border-border bg-muted",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "text-lg font-semibold",
                          plan.popular ? "text-background" : "text-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "mt-1 text-sm",
                          plan.popular
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.popular ? "text-background" : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          plan.popular
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className={cn(
                            "flex items-center gap-3 text-sm",
                            plan.popular
                              ? "text-background/90"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.popular ? <CheckPrimary /> : <Check />}
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "mt-auto w-full rounded-xl py-3 px-4 font-semibold transition-all",
                        plan.popular
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm hover:shadow-lg hover:shadow-primary/25"
                          : "border border-border bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {pricingNote}
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-gradient-to-br from-foreground to-foreground/80 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold text-background sm:text-5xl">
                      {s.value}
                    </div>
                    <p className="text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-primary">
                  {testimonialsTag}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
                    className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
                  >
                    <div className="mb-4 flex gap-0.5 text-chart-4">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} />
                      ))}
                    </div>
                    <blockquote className="mb-6 text-sm leading-relaxed text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-3">
                      <Image
                        alt={t.alt ?? `professional headshot of ${t.name}`}
                        w={96}
                        h={96}
                        className="size-12 shrink-0 rounded-full object-cover"
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
          <section className="bg-background py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-primary">
                  {faqTag}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl bg-muted p-6">
                    <h3 className="mb-2 font-semibold text-foreground">
                      {item.question}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-primary via-primary/80 to-accent py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                {ctaSub}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-semibold text-primary shadow-sm transition-all hover:-translate-y-px hover:bg-muted"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <Play />
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/70">
                {ctaFine}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2 text-xl font-bold text-background">
                  <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <LogoGlyph />
                  </span>
                  <span>{brand}</span>
                </div>
                <p className="mb-6 max-w-xs text-sm text-background/60">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {["Twitter", "GitHub", "LinkedIn"].map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-background/20"
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
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      )}
                      {social === "LinkedIn" && (
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/60 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4 border-t border-background/20 pt-8 text-sm text-background/60 md:flex-row md:justify-between">
              <p>{footerCopyright}</p>
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => go("Privacy Policy")}
                  className="transition-colors hover:text-background"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => go("Terms of Service")}
                  className="transition-colors hover:text-background"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => go("Cookie Policy")}
                  className="transition-colors hover:text-background"
                >
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
