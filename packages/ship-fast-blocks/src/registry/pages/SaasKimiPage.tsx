import { useState } from "react"
import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * SaasKimiPage — a complete, self-contained AI-product SaaS LANDING page.
 *
 * A faithful Tailwind v4 port of the Kimi-generated "Chronos AI" design (an
 * intelligent calendar & scheduling assistant). It reproduces, in order: a
 * glassy sticky navbar, a split hero (gradient-accented copy + a floating
 * "Chronos Assistant" chat mockup with a live calendar preview) over a soft
 * indigo gradient with a radial glow, a grayscale "trusted by" logo strip, a
 * 6-up colored-icon feature grid, a numbered 3-step "how it works" band, a
 * 3-up testimonial row with star ratings, an indigo stats band, a 3-tier
 * pricing table with a highlighted "Most Popular" plan, an interactive FAQ
 * accordion, a gradient CTA banner, and a dark multi-column footer.
 *
 * Kimi's identity is light-themed with an indigo (#4f46e5) primary accent; the
 * block translates the inline CSS color system into Tailwind theme tokens
 * (background/foreground/muted/border) so dark mode works, while preserving the
 * indigo accent + gradients on brand marks, CTAs and the stats/CTA bands.
 * Every nav item / CTA / link routes through `useNavigate` (never a dead "#"),
 * and the navbar labels match the `nav` array so PageSwitch can swap pages.
 * Callers supply ONLY content data; rich defaults sourced from the original
 * HTML make it render great with no props at all.
 */
export const SaasKimiPage = defineComponent({
  name: "SaasKimiPage",
  description:
    "Complete AI-product / SaaS LANDING page with a polished, premium indigo aesthetic: glassy sticky navbar, a split hero pairing bold gradient-accented copy with a live AI-chat assistant mockup card (chat bubbles + calendar preview), a 'trusted by' grayscale logo strip, a 6-up colored-icon feature grid, a numbered how-it-works band, a 3-up testimonial row with star ratings, an indigo stats band, a 3-tier pricing table (with a highlighted 'most popular' plan), an interactive FAQ accordion, a gradient CTA banner, and a rich multi-column dark footer. Use as the ROOT/home page for AI tools, SaaS apps, productivity/scheduling/automation products, developer tools, or modern B2B startups when a conversion-focused page with social proof, pricing, FAQ and a product-demo visual is wanted. Supply content only — brand, nav, hero, features, steps, testimonials, stats, pricing, faq, cta, footer; the block owns all layout and styling.",
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
        /** Phrase inside the heading rendered with the indigo highlight. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        /** Title shown in the demo card header. */
        demoTitle: z.string().optional(),
        /** Chat bubbles shown in the product-demo mockup. */
        chat: z
          .array(
            z.object({
              from: z.enum(["ai", "user"]),
              avatar: z.string().optional(),
              text: z.string(),
            }),
          )
          .optional(),
        /** Calendar preview rows beneath the chat. */
        calendar: z
          .array(
            z.object({
              time: z.string(),
              label: z.string().optional(),
              tone: z.enum(["free", "busy", "success"]).optional(),
            }),
          )
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
    /** "How it works" numbered steps. */
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
            }),
          )
          .optional(),
      })
      .optional(),
    /** Indigo metrics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
              currency: z.string().optional(),
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
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
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
      : ["Features", "How It Works", "Pricing", "Testimonials", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Now with GPT-4 scheduling intelligence"
    const heroHeading = props.hero?.heading ?? "Reclaim your day with"
    const heroHighlight = props.hero?.highlight ?? "AI-powered scheduling"
    const heroSub =
      props.hero?.subheading ??
      "Chronos AI reads your calendar, understands your priorities, and automatically schedules meetings at the perfect time. No more back-and-forth emails. No more double-bookings. Just focus."
    const heroPrimary = props.hero?.primaryCta ?? "Start free trial"
    const heroSecondary = props.hero?.secondaryCta ?? "See how it works"
    const heroProof =
      props.hero?.socialProof ?? "Trusted by 12,000+ busy professionals"
    const demoTitle = props.hero?.demoTitle ?? "Chronos Assistant"
    const chat = props.hero?.chat?.length
      ? props.hero.chat
      : [
          {
            from: "ai" as const,
            avatar: "AI",
            text: "Good morning! I see you have 3 meeting requests today. Shall I find the best slots?",
          },
          {
            from: "user" as const,
            avatar: "JD",
            text: "Yes, prioritize the product review with Sarah",
          },
          {
            from: "ai" as const,
            avatar: "AI",
            text: "Done. I found Tuesday 2pm for Sarah. Also moved your standup to avoid the conflict.",
          },
        ]
    const calendar = props.hero?.calendar?.length
      ? props.hero.calendar
      : [
          { time: "9am", tone: "free" as const },
          { time: "10am", label: "Standup (moved)", tone: "busy" as const },
          {
            time: "2pm",
            label: "Product Review — Sarah",
            tone: "success" as const,
          },
        ]

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : [
          "Linear",
          "Notion",
          "Vercel",
          "Figma",
          "Stripe",
          "Slack",
          "GitHub",
          "Anthropic",
        ]

    const featuresTag = props.features?.tag ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Your calendar, but it actually works for you"
    const featuresDesc =
      props.features?.description ??
      "Stop treating your calendar like a static grid. Chronos AI turns it into a dynamic assistant that protects your time and eliminates scheduling friction."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Auto-Scheduling",
            description:
              "Chronos analyzes your priorities, energy levels, and existing commitments to automatically place meetings at optimal times. No more 9am standups after late-night deploys.",
          },
          {
            title: "Natural Language Commands",
            description:
              '"Find 30 minutes with the design team before Thursday." Chronos understands context, checks availability across time zones, and proposes the best options instantly.',
          },
          {
            title: "Conflict Resolution",
            description:
              "Double-booked? Chronos detects overlaps instantly and suggests alternative times to all attendees. It can even auto-reschedule lower-priority meetings on your behalf.",
          },
          {
            title: "Cross-Company Scheduling",
            description:
              'Schedule with external partners without the "what about Tuesday?" ping-pong. Chronos shares your availability privately and lets them book directly into open slots.',
          },
          {
            title: "Focus Time Guard",
            description:
              'Set rules like "No meetings before 10am" or "Protect 2-hour deep work blocks." Chronos defends your boundaries and politely declines or reschedules violating invites.',
          },
          {
            title: "Weekly Scheduling Insights",
            description:
              "Get a digest every Monday showing how you spent your time, meeting load trends, and suggestions for better calendar hygiene. Turn data into better habits.",
          },
        ]

    const stepsTag = props.steps?.tag ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "From chaos to clarity in 3 steps"
    const stepsDesc =
      props.steps?.description ??
      "Chronos AI integrates with your existing calendar in under 2 minutes. No migration, no disruption, no learning curve."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect your calendars",
            description:
              "Link Google Calendar, Outlook, or Apple Calendar with one click. Chronos reads your existing events and preferences—no data entry required.",
          },
          {
            title: "Set your rules",
            description:
              "Tell Chronos when you prefer meetings, how much focus time you need, and which types of events take priority. It learns and adapts over time.",
          },
          {
            title: "Let AI handle the rest",
            description:
              "Chronos schedules, reschedules, and protects your time automatically. You review suggestions via chat or email—approve with one tap.",
          },
        ]

    const testimonialsTag = props.testimonials?.tag ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by people who value their time"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of professionals who have eliminated scheduling headaches and reclaimed hours every week."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Chronos has completely changed how I work. I used to spend 45 minutes every morning shuffling meetings around. Now I just check my phone once, tap approve, and my entire day is optimized.",
            name: "Sarah Chen",
            role: "VP of Product, Notion",
          },
          {
            quote:
              "The focus time guard alone is worth the subscription. I finally have uninterrupted blocks for deep work. My team's output increased noticeably within the first month.",
            name: "David Park",
            role: "Engineering Lead, Linear",
          },
          {
            quote:
              "I was skeptical about AI scheduling, but Chronos understands context in a way that surprised me. It knows not to book client calls right after my gym sessions. That's not automation—that's intelligence.",
            name: "Elena Rodriguez",
            role: "Founder, Stellar Studio",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12,000+", label: "Active Professionals" },
          { value: "2.4M", label: "Meetings Scheduled" },
          { value: "8.5 hrs", label: "Avg. Time Saved Weekly" },
          { value: "99.8%", label: "Scheduling Accuracy" },
        ]

    const pricingTag = props.pricing?.tag ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free. Upgrade when you need more power. No hidden fees, no annual contracts required."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Free",
            description: "For individuals getting started",
            currency: "$",
            price: "0",
            period: "/mo",
            features: [
              "1 calendar connection",
              "10 AI schedules/month",
              "Basic conflict detection",
              "Email support",
            ],
            cta: "Get started free",
            popular: false,
          },
          {
            name: "Pro",
            description: "For busy professionals",
            currency: "$",
            price: "12",
            period: "/mo",
            features: [
              "Unlimited calendars",
              "Unlimited AI scheduling",
              "Smart conflict resolution",
              "Focus time guard",
              "Priority support",
            ],
            cta: "Start 14-day trial",
            popular: true,
          },
          {
            name: "Team",
            description: "For teams that sync together",
            currency: "$",
            price: "39",
            period: "/mo",
            features: [
              "Everything in Pro",
              "Up to 10 team members",
              "Shared team availability",
              "Analytics dashboard",
              "Dedicated account manager",
            ],
            cta: "Contact sales",
            popular: false,
          },
        ]

    const faqTag = props.faq?.tag ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Questions? Answered."
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about Chronos AI. Can't find what you're looking for? Reach out to our team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does Chronos AI protect my calendar data?",
            answer:
              "We use bank-level AES-256 encryption for all data at rest and TLS 1.3 for data in transit. We are SOC 2 Type II certified and GDPR compliant. Your calendar data is never used to train AI models, and you can delete your data permanently at any time with one click.",
          },
          {
            question: "Can I use Chronos with multiple calendar providers?",
            answer:
              "Absolutely. Chronos syncs across Google Calendar, Microsoft Outlook, Apple iCloud, and CalDAV. You can connect unlimited calendars on Pro and Team plans, and Chronos will automatically resolve conflicts across all of them.",
          },
          {
            question: "What happens if Chronos schedules something I don't want?",
            answer:
              'By default, Chronos sends you a suggestion before committing any change. You can approve, modify, or decline with one tap. As you build trust, you can enable "Auto-pilot mode" for specific event types while keeping manual approval for others.',
          },
          {
            question: "Is there a limit on how many people I can schedule with?",
            answer:
              "No. You can schedule with anyone, even if they don't use Chronos. For external attendees, Chronos sends a smart scheduling link that respects your availability while letting them pick a time. No account required on their end.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes. There are no annual contracts or cancellation fees. If you cancel, you'll keep access until the end of your billing period. We also offer a 30-day money-back guarantee—no questions asked.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to take back your time?"
    const ctaSub =
      props.cta?.subheading ??
      "Join 12,000+ professionals who have eliminated scheduling chaos. Start your free trial today—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start free 14-day trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to sales"

    const footerTagline =
      props.footer?.tagline ??
      "The intelligent scheduling assistant that eliminates calendar chaos and gives you back hours every week."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog"],
          },
          { title: "Company", links: ["About", "Blog", "Careers", "Press Kit"] },
          {
            title: "Support",
            links: [
              "Help Center",
              "Privacy Policy",
              "Terms of Service",
              "Security",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    const [openFaq, setOpenFaq] = useState<number | null>(0)

    // Shared logo mark — indigo gradient tile + clock glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm",
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
          strokeWidth="2.5"
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
        className="size-[1.125rem] shrink-0 text-primary"
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

    // Feature icon tints rotate through chart data-viz tokens + primary for a multi-color decorative set.
    const featureIconTints = [
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
      "bg-primary/10 text-primary",
    ]

    const featureIcons: ReactNode[] = [
      // calendar
      <svg
        key="cal"
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
      </svg>,
      // chat
      <svg
        key="chat"
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>,
      // clock
      <svg
        key="clock"
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>,
      // users
      <svg
        key="users"
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      // bell
      <svg
        key="bell"
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
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>,
      // activity
      <svg
        key="activity"
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
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <ul className="hidden items-center gap-8 text-[0.9375rem] font-medium text-muted-foreground md:flex">
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="rounded-lg bg-gradient-to-br from-primary to-primary/80 px-5 py-2.5 text-[0.9375rem] font-semibold text-primary-foreground shadow-[0_1px_3px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]"
              >
                Get Started
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
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted/40">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-1/2 -right-[20%] size-[800px] rounded-full bg-primary/[0.08] blur-3xl"
            />
            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-12 lg:py-28">
              <div>
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
                  <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
                  {heroBadge}
                </span>
                <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {heroHeading}{" "}
                  <span className="text-primary">
                    {heroHighlight}
                  </span>
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                  {heroSub}
                </p>
                <div className="mt-8 flex flex-wrap gap-3.5">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_1px_3px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 py-3.5 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
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
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" />
                    </svg>
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <div className="flex" aria-hidden="true">
                    {["a", "b", "c", "d"].map((id, i) => (
                      <span
                        key={id}
                        className={cn(
                          "grid size-9 place-items-center rounded-full border-2 border-background bg-gradient-to-br from-primary/70 to-primary text-[0.625rem] font-bold text-primary-foreground",
                          i > 0 && "-ml-2",
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {heroProof}
                  </p>
                </div>
              </div>

              {/* Product demo mockup card */}
              <div className="flex justify-center" aria-hidden="true">
                <div className="w-full max-w-[520px] overflow-hidden rounded-3xl border border-border bg-card shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
                    <span className="size-2.5 rounded-full bg-chart-5" />
                    <span className="size-2.5 rounded-full bg-chart-4" />
                    <span className="size-2.5 rounded-full bg-chart-2" />
                    <span className="ml-auto text-xs font-medium text-muted-foreground">
                      {demoTitle}
                    </span>
                  </div>
                  <div className="p-5">
                    {chat.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "mb-4 flex items-start gap-3",
                          msg.from === "user" && "flex-row-reverse",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                            msg.from === "ai"
                              ? "bg-primary/10 text-primary"
                              : "bg-accent text-accent-foreground",
                          )}
                        >
                          {msg.avatar ?? (msg.from === "ai" ? "AI" : "JD")}
                        </span>
                        <div
                          className={cn(
                            "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                            msg.from === "ai"
                              ? "rounded-bl-sm bg-muted text-foreground"
                              : "rounded-br-sm bg-primary text-primary-foreground",
                          )}
                        >
                          {msg.text}
                          {msg.from === "ai" && i === chat.length - 1 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {["Accept all", "Modify"].map((chip) => (
                                <span
                                  key={chip}
                                  className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-[0.8125rem] font-medium text-muted-foreground"
                                >
                                  {chip}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}

                    {/* Calendar preview */}
                    <div className="mt-4 rounded-xl bg-muted p-4">
                      {calendar.map((row) => (
                        <div
                          key={row.time}
                          className="mb-2 flex gap-2 last:mb-0"
                        >
                          <span className="w-12 shrink-0 pr-2 text-right text-xs leading-7 text-muted-foreground">
                            {row.time}
                          </span>
                          <div
                            className={cn(
                              "flex h-7 flex-1 items-center rounded-sm border px-2 text-[0.6875rem] font-semibold",
                              row.tone === "success"
                                ? "border-chart-2/30 bg-chart-2/10 text-chart-2"
                                : row.tone === "busy"
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-border/60 bg-background",
                            )}
                          >
                            {row.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo cloud */}
          <section className="border-b border-border/60 py-12">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 opacity-60">
                {logoNames.map((name) => (
                  <span
                    key={name}
                    className="whitespace-nowrap text-xl font-extrabold tracking-tight text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {featuresTag}
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-card p-7 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
                  >
                    <div
                      className={cn(
                        "mb-5 grid size-11 place-items-center rounded-xl",
                        featureIconTints[i % featureIconTints.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-[1.0625rem] font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted/40 py-20">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {stepsTag}
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="relative grid gap-8 md:grid-cols-3">
                {stepItems.map((step, i) => (
                  <article
                    key={step.title}
                    className="relative rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm"
                  >
                    <span className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-primary/10 text-xl font-extrabold text-primary">
                      {i + 1}
                    </span>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {testimonialsTag}
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-2xl border border-border/60 bg-card p-7 transition-all hover:border-border hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
                  >
                    <div
                      className="mb-4 flex gap-0.5 text-chart-4"
                      aria-label="5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <blockquote className="mb-5 text-[0.9375rem] leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-3.5">
                      <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary/70 to-primary text-sm font-bold text-primary-foreground">
                        {t.name.charAt(0)}
                      </span>
                      <div>
                        <div className="text-[0.9375rem] font-bold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-[0.8125rem] text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-gradient-to-br from-primary to-primary/80 py-16 text-primary-foreground">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm font-medium text-primary-foreground/85">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-20">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {pricingTag}
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-start gap-6 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl bg-card p-8",
                      plan.popular
                        ? "border border-primary shadow-[0_0_0_1px_var(--color-primary),0_10px_15px_-3px_rgba(0,0,0,0.1)] md:scale-105 md:z-10"
                        : "border border-border/60 shadow-sm",
                    )}
                  >
                    {plan.popular ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-[0.05em] text-primary-foreground">
                        Most Popular
                      </span>
                    ) : null}
                    <h3 className="mb-1 text-lg font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-5 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="mb-6 flex items-baseline gap-1">
                      {plan.currency ? (
                        <span className="text-xl font-semibold text-foreground">
                          {plan.currency}
                        </span>
                      ) : null}
                      <span className="text-[2.5rem] font-extrabold leading-none tracking-tight text-foreground">
                        {plan.price}
                      </span>
                      {plan.period ? (
                        <span className="text-sm font-medium text-muted-foreground">
                          {plan.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mb-6 flex-1 space-y-1">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-2.5 py-2 text-[0.9375rem] text-muted-foreground"
                        >
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-lg px-5 py-2.5 text-[0.9375rem] font-semibold transition-all",
                        plan.popular
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[0_1px_3px_rgba(79,70,229,0.3)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]"
                          : "border border-border bg-background text-foreground shadow-sm hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.05em] text-primary">
                  {faqTag}
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
              <div className="mx-auto max-w-3xl">
                {faqItems.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <div key={item.question} className="border-b border-border/60">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {item.question}
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
                          className={cn(
                            "shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-180",
                          )}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div
                        className={cn(
                          "grid overflow-hidden transition-all duration-300",
                          open
                            ? "grid-rows-[1fr] pb-5 opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <p className="min-h-0 text-[0.9375rem] leading-relaxed text-muted-foreground">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* CTA banner */}
          <section className="bg-muted/40 py-20">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-6 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-1/2 -left-[20%] size-[600px] rounded-full bg-primary-foreground/[0.12] blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-1/2 -right-[20%] size-[600px] rounded-full bg-primary-foreground/[0.08] blur-3xl"
                />
                <div className="relative">
                  <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                    {ctaHeading}
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/90">
                    {ctaSub}
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-3.5 text-base font-semibold text-primary shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-px hover:bg-accent hover:text-accent-foreground"
                    >
                      {ctaPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border border-primary-foreground/30 px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:border-primary-foreground/50 hover:bg-primary-foreground/10"
                    >
                      {ctaSecondary}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
              <div className="max-w-xs">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 text-xl font-extrabold tracking-tight text-background"
                >
                  <LogoMark />
                  {brand}
                </button>
                <p className="text-[0.9375rem] leading-relaxed">
                  {footerTagline}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.05em] text-background">
                    {col.title}
                  </h4>
                  {col.links.map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => go(link)}
                      className="block py-1.5 text-left text-[0.9375rem] transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4 border-t border-background/20 pt-8 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
              <p>{footerCopyright}</p>
              <div className="flex items-center gap-4">
                {(
                  [
                    {
                      label: "Twitter",
                      path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
                    },
                    {
                      label: "LinkedIn",
                      path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
                    },
                    {
                      label: "GitHub",
                      path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
                    },
                  ] as const
                ).map((social) => (
                  <button
                    key={social.label}
                    type="button"
                    aria-label={social.label}
                    onClick={() => go(social.label)}
                    className="grid size-8 place-items-center rounded-lg bg-background/10 text-background/80 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
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
                      {social.label === "LinkedIn" ? (
                        <>
                          <path d={social.path} />
                          <rect x="2" y="9" width="4" height="12" />
                          <circle cx="4" cy="4" r="2" />
                        </>
                      ) : (
                        <path d={social.path} />
                      )}
                    </svg>
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
