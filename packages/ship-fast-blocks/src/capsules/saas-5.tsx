import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const SaasKimiPage5 = defineCapsule({
  name: "SaasKimiPage5",
  description:
    "A warm, energetic SaaS landing page — the fifth style sibling to SaasKimiPage — with a glassy sticky navbar, a split hero featuring a floating AI-dashboard mockup card (activity rows + avatar stack + notification toast), a 'trusted by' logo strip with inline brand glyphs, a 6-up colorful feature grid with gradient icon tiles, a 3-step how-it-works band with connector arrows, a bold gradient stats band, a 3-tier pricing table with a highlighted 'Most Popular' plan, a 3-up testimonial row with star ratings and review avatars, an interactive native FAQ accordion, a gradient CTA banner, and a light multi-column footer with social links. Use for AI scheduling, productivity SaaS, calendar assistants, or B2B startups when a friendly, conversion-focused page with playful color accents and rich social proof is desired. Every CTA and link routes through useNavigate; all images use the Image component with alt-driven Unsplash sourcing.",
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
        demoTitle: z.string().optional(),
        trustItems: z.array(z.string()).optional(),
      })
      .optional(),
    logos: z
      .object({
        label: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              svgPath: z.string().optional(),
            }),
          )
          .optional(),
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
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
              avatarAlt: z.string().optional(),
            }),
          )
          .optional(),
        ratingLabel: z.string().optional(),
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
      })
      .optional(),
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

    const brand = props.brand ?? "ChronoAI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Reviews", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Now with GPT-4 scheduling intelligence"
    const heroHeading = props.hero?.heading ?? "Scheduling that"
    const heroHighlight = props.hero?.highlight ?? "just works"
    const heroSub =
      props.hero?.subheading ??
      "ChronoAI eliminates the back-and-forth of finding meeting times. Our AI understands preferences, resolves conflicts, and books the perfect slot for your entire team across any timezone."
    const heroPrimary = props.hero?.primaryCta ?? "Start Free Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "See Demo (2 min)"
    const heroTrust = props.hero?.trustItems ?? [
      "No credit card required",
      "14-day free trial",
      "Cancel anytime",
    ]
    const demoTitle = props.hero?.demoTitle ?? "ChronoAI Dashboard"

    const logosLabel = props.logos?.label ?? "Trusted by innovative teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          {
            name: "Notion",
            svgPath:
              "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
          },
          {
            name: "Figma",
            svgPath:
              "M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.894 8.221l-1.97-.001V18h-3.774v-3.354h-2.09V18H6.287V8.221l-1.971.001V6.225h13.578v1.996z",
          },
          {
            name: "Slack",
            svgPath:
              "M17.472 14.382c-.297-.446-.396-.545-.545-.644-.248-.149-.545-.248-.842-.248-.347 0-.694.099-.99.347-.248.198-.396.446-.446.694-.05.198-.198.545-.248.743-.149.446-.446.644-.892.644-.545 0-1.039-.248-1.336-.644-.545-.693-.693-1.534-.693-2.374 0-.892.248-1.732.743-2.473.446-.644 1.088-.99 1.831-.99.446 0 .842.149 1.188.446.248.198.446.446.594.743.099-.049.198-.099.347-.149.396-.198.842-.297 1.287-.297.644 0 1.287.198 1.782.594.347.297.594.693.743 1.138.149.446.198.892.198 1.336-.05.446-.149.892-.347 1.287z",
          },
          {
            name: "Spotify",
            svgPath:
              "M12.04 3.5c.59 0 1.17.07 1.73.19V.5h3.87v10.08c0 3.17-2.11 5.19-5.6 5.19-3.11 0-5.09-1.73-5.09-4.35 0-2.62 2.01-4.33 5.09-4.33.76 0 1.46.12 2.09.33V3.5zm1.73 7.64c0-1.08-.65-1.73-1.73-1.73s-1.73.65-1.73 1.73.65 1.73 1.73 1.73 1.73-.65 1.73-1.73z",
          },
          {
            name: "Dropbox",
            svgPath:
              "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
          },
          {
            name: "Adobe",
            svgPath:
              "M24 4.515v14.97c0 .57-.43 1.03-.97 1.03h-6.24l-2.48-4.31-2.48 4.31H3.97c-.54 0-.97-.46-.97-1.03V4.515c0-.57.43-1.03.97-1.03h6.24l2.48 4.31 2.48-4.31h6.24c.54 0 .97.46.97 1.03z",
          },
        ]

    const featuresTag = props.features?.tag ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "Everything you need for effortless scheduling"
    const featuresDesc =
      props.features?.description ??
      "ChronoAI combines intelligent automation with human-centered design to make calendar management actually enjoyable."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "AI-Powered Suggestions",
            description:
              "Our GPT-4 model analyzes your preferences, historical patterns, and attendee priorities to recommend the optimal meeting times instantly.",
          },
          {
            title: "Automatic Timezone Sync",
            description:
              "Never calculate timezones again. ChronoAI handles DST changes, international attendees, and displays times in everyone's local zone automatically.",
          },
          {
            title: "Conflict Resolution",
            description:
              "When meetings clash, ChronoAI suggests alternatives, reschedules low-priority items, and even negotiates new times with attendees on your behalf.",
          },
          {
            title: "Focus Time Protection",
            description:
              "Automatically block deep work sessions on your calendar. ChronoAI learns when you're most productive and guards those precious hours.",
          },
          {
            title: "Smart Scheduling Links",
            description:
              'Share your personalized booking link and let others pick from AI-optimized slots. No more "when are you free?" email chains ever again.',
          },
          {
            title: "Analytics Dashboard",
            description:
              "Understand how you spend your time with beautiful visualizations. Track meeting load, find productivity patterns, and optimize your schedule.",
          },
        ]

    const stepsTag = props.steps?.tag ?? "How it works"
    const stepsHeading =
      props.steps?.heading ?? "Get started in minutes, not hours"
    const stepsDesc =
      props.steps?.description ??
      "Three simple steps to transform your calendar chaos into scheduling serenity."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect Your Calendars",
            description:
              "Sync Google Calendar, Outlook, Apple Calendar, and more. We support 15+ calendar providers with bank-level encryption.",
          },
          {
            title: "Set Your Preferences",
            description:
              "Tell ChronoAI your working hours, meeting limits, focus time needs, and scheduling priorities. The more it knows, the smarter it gets.",
          },
          {
            title: "Let AI Handle the Rest",
            description:
              "Simply CC ChronoAI on scheduling emails or share your booking link. Watch as meetings are automatically scheduled, rescheduled, and optimized.",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "500K+", label: "Meetings scheduled" },
          { value: "12M+", label: "Hours saved" },
          { value: "50K+", label: "Happy users" },
          { value: "150+", label: "Countries served" },
        ]

    const pricingTag = props.pricing?.tag ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that fits your scheduling needs. All plans include a 14-day free trial."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "Perfect for individuals",
            price: "$0",
            period: "/month",
            features: [
              "Up to 10 scheduled meetings/month",
              "1 calendar connection",
              "Basic scheduling link",
              "Email support",
            ],
            cta: "Get Started Free",
            popular: false,
          },
          {
            name: "Professional",
            description: "For power users & small teams",
            price: "$12",
            period: "/month",
            features: [
              "Unlimited scheduled meetings",
              "Up to 5 calendar connections",
              "AI-powered suggestions",
              "Custom branding",
              "Priority support",
            ],
            cta: "Start 14-Day Free Trial",
            popular: true,
          },
          {
            name: "Team",
            description: "For growing organizations",
            price: "$29",
            period: "/user/month",
            features: [
              "Everything in Professional",
              "Unlimited team members",
              "Team scheduling pools",
              "Advanced analytics",
              "SSO & admin controls",
              "Dedicated account manager",
            ],
            cta: "Contact Sales",
            popular: false,
          },
        ]

    const testimonialsTag = props.testimonials?.tag ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by thousands of busy professionals"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what our users say about their transformed scheduling experience."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "ChronoAI has completely eliminated the 'when are you free?' dance with my clients. I just share my link and the AI handles finding times that work across three timezones. It's saved me at least 5 hours per week.",
            name: "Marcus Chen",
            role: "Founder, Nexus Consulting",
            avatarAlt:
              "professional headshot of a smiling man in his 40s with short brown hair wearing a blue shirt",
          },
          {
            quote:
              "As a product manager coordinating across engineering, design, and marketing, ChronoAI is a game-changer. The AI actually understands meeting priorities and protects my deep work blocks. Best productivity investment I've made.",
            name: "Sarah Williams",
            role: "Product Manager, Stripe",
            avatarAlt:
              "professional headshot of a woman with shoulder-length brown hair and a warm smile",
          },
          {
            quote:
              "We rolled out ChronoAI to our entire 45-person team and saw immediate results. The team scheduling pools alone eliminated the chaos of finding all-hands meeting times. Implementation took 20 minutes.",
            name: "David Park",
            role: "VP Engineering, Vercel",
            avatarAlt:
              "professional headshot of a man with glasses and dark hair wearing a casual shirt",
          },
        ]
    const ratingLabel =
      props.testimonials?.ratingLabel ?? "4.9/5 from 2,847 reviews"

    const faqTag = props.faq?.tag ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about ChronoAI. Can't find your answer? Contact our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the AI scheduling actually work?",
            answer:
              "ChronoAI uses GPT-4 to understand natural language scheduling requests from emails and messages. It analyzes your calendar history to learn your preferences (morning vs evening, meeting limits, focus time needs) and cross-references with all attendees' availability across timezones. When conflicts arise, it intelligently suggests alternatives based on meeting priority, attendee seniority, and historical rescheduling patterns.",
          },
          {
            question: "Which calendar providers do you support?",
            answer:
              "We support Google Calendar (Gmail & Workspace), Microsoft Outlook (365, Exchange, Live), Apple iCloud Calendar, Fastmail, Zoho Calendar, and any CalDAV-compatible provider. You can connect multiple calendars from different providers and ChronoAI will treat them as a unified view, preventing double-bookings across all platforms.",
          },
          {
            question: "Is my calendar data secure?",
            answer:
              "Absolutely. We use AES-256 encryption at rest and TLS 1.3 for all data in transit. We're SOC 2 Type II certified and GDPR compliant. We never sell or share your data with third parties. Calendar data is only used to provide scheduling services and is never used to train AI models. You can request complete data deletion at any time.",
          },
          {
            question: "Can I cancel or change my plan anytime?",
            answer:
              "Yes, you can upgrade, downgrade, or cancel your plan at any time with no penalties. If you cancel, you'll continue to have access until the end of your billing period. We also offer a 14-day free trial on all paid plans so you can experience the full power of ChronoAI before committing.",
          },
          {
            question: "Do you offer discounts for nonprofits or education?",
            answer:
              "Yes! We offer 50% off all plans for registered nonprofits, educational institutions, and students. We also have a free tier for open-source maintainers. Contact our team with proof of status and we'll apply the discount to your account. We believe great scheduling tools should be accessible to everyone making a positive impact.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to reclaim your calendar?"
    const ctaSub =
      props.cta?.subheading ??
      "Join 50,000+ professionals who've eliminated scheduling stress. Start your free trial today—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Started for Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Watch 2-Min Demo"

    const footerTagline =
      props.footer?.tagline ??
      "Intelligent scheduling that works for everyone. Save time, reduce stress, and take control of your calendar."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Pricing",
              "Integrations",
              "What's New",
              "Roadmap",
            ],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Help Center",
              "Blog",
              "Community",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Contact", "Partners"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies", "GDPR"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground"
            >
              <span
                className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
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
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 14" />
                </svg>
              </span>
              {brand}
            </button>

            <ul className="hidden items-center gap-9 text-sm font-medium text-muted-foreground md:flex">
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
                onClick={() => go("Log in")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {heroPrimary}
              </button>
            </div>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-2 lg:px-8 lg:pb-32 lg:pt-28">
              <div className="max-w-2xl">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                  <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                  {heroBadge}
                </p>
                <h1 className="mb-8 text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
                  {heroHeading}{" "}
                  <span className="text-primary">{heroHighlight}</span>
                </h1>
                <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground">
                  {heroSub}
                </p>
                <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                  {heroTrust.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4 text-primary"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Floating dashboard mockup */}
              <div className="relative">
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-2xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-destructive/70" aria-hidden="true" />
                      <span className="size-3 rounded-full bg-accent" aria-hidden="true" />
                      <span className="size-3 rounded-full bg-primary/50" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {demoTitle}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {featureItems.slice(0, 3).map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4"
                            aria-hidden="true"
                          >
                            <polyline points="12 6 12 12 16 14" />
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-5">
                    <div className="flex -space-x-2" aria-hidden="true">
                      {testimonialItems.map((t, i) => (
                        <span
                          key={i}
                          className="inline-block overflow-hidden rounded-full border-2 border-card"
                        >
                          <Image
                            alt={t.avatarAlt ?? t.name}
                            w={32}
                            h={32}
                            className="size-8 rounded-full object-cover"
                          />
                        </span>
                      ))}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {ratingLabel}
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-4 hidden max-w-[15rem] rounded-xl border border-border/60 bg-card p-4 shadow-xl sm:block">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4"
                        aria-hidden="true"
                      >
                        <polyline points="5 13 9 17 19 7" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {stepItems[0].title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {heroTrust[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo strip */}
          <section
            className="border-y border-border/60 bg-muted/40"
            aria-label={logosLabel}
          >
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-muted-foreground">
                {logoItems.map((logo) => (
                  <span
                    key={logo.name}
                    className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-foreground/70"
                  >
                    {logo.svgPath ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                        aria-hidden="true"
                      >
                        <path d={logo.svgPath} />
                      </svg>
                    ) : null}
                    {logo.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            id="features"
            className="py-24 lg:py-32"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {featuresTag}
                </p>
                <h2
                  id="features-heading"
                  className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border/60 bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-6"
                        aria-hidden="true"
                      >
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
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

          {/* How it works */}
          <section
            className="bg-muted/40 py-24 lg:py-32"
            aria-labelledby="steps-heading"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {stepsTag}
                </p>
                <h2
                  id="steps-heading"
                  className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>

              <div className="grid gap-12 md:grid-cols-3 lg:gap-8">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 ? (
                      <span
                        className="absolute left-16 top-7 hidden h-px w-[calc(100%-3rem)] bg-border md:block"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="mb-8 grid size-14 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
                      {i + 1}
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold text-foreground">
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

          {/* Stats band */}
          <section className="bg-primary text-primary-foreground">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
              {statsItems.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl font-bold tracking-tight md:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary-foreground/80">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="py-24 lg:py-32"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {pricingTag}
                </p>
                <h2
                  id="pricing-heading"
                  className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>

              <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-2xl border p-8",
                      plan.popular
                        ? "border-primary bg-card shadow-xl md:-mt-4 md:mb-4"
                        : "border-border/60 bg-card",
                    )}
                  >
                    {plan.popular ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                        Most Popular
                      </span>
                    ) : null}
                    <h3 className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        {plan.price}
                      </span>
                      {plan.period ? (
                        <span className="text-sm text-muted-foreground">
                          {plan.period}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-0.5 size-5 shrink-0 text-primary"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors",
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            id="reviews"
            className="bg-muted/40 py-24 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {testimonialsTag}
                </p>
                <h2
                  id="testimonials-heading"
                  className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="flex flex-col rounded-2xl border border-border/60 bg-card p-8"
                  >
                    <div className="mb-5 flex gap-1 text-primary" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-5"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <blockquote className="flex-1 text-base leading-relaxed text-foreground">
                      {t.quote}
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt ?? t.name}
                        w={48}
                        h={48}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            className="py-24 lg:py-32"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {faqTag}
                </p>
                <h2
                  id="faq-heading"
                  className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {faqDesc}
                </p>
              </div>

              <div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
                {faqItems.map((item) => (
                  <details key={item.question} className="group px-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground">
                      {item.question}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </summary>
                    <p className="pb-5 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA banner */}
          <section className="px-6 pb-24 lg:px-8 lg:pb-32">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground lg:px-16 lg:py-20">
              <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
                {ctaSub}
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/60 bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
              <div className="max-w-sm">
                <span className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
                  <span
                    className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
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
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 14" />
                    </svg>
                  </span>
                  {brand}
                </span>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {footerTagline}
                </p>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    {col.title}
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-16 border-t border-border/60 pt-8 text-sm text-muted-foreground">
              {footerCopyright}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
