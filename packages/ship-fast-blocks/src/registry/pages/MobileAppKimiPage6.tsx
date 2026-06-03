import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MobileAppKimiPage6 — a complete, self-contained mobile-app LANDING / marketing page (variant 6).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "HabitTrack Pro" enterprise habit-tracking
 * site: a refined, professional, navy-forward aesthetic with crisp white surfaces, deep
 * muted-blue gradients for the hero, a custom phone mock-up with habit-list UI, floating
 * achievement chips, a logo bar, a 6-up feature grid with navy icon tiles, a numbered 3-step
 * "how it works" walkthrough with connecting gradient lines, a 4-up app gallery, a 3-tier
 * pricing table with a dark featured plan, a navy stats band, a 6-up testimonial grid,
 * a plain FAQ section, a dark CTA, and a navy-heavy footer with social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy.  It is the 6th visual
 * sibling (distinct mood / structure / whitespace) to MobileAppKimiPage and its other
 * variants. Use for enterprise SaaS landing pages, B2B mobile app marketing, or any app
 * that wants authority / trust + mobile presence.
 */
export const MobileAppKimiPage6 = defineComponent({
  name: "MobileAppKimiPage6",
  description:
    "Professional enterprise mobile-app landing page for a habit-tracker / wellness SaaS.  Features a refined navy-forward light aesthetic, large split hero with a custom phone mock-up showing habit-list UI and floating achievement chips, a 6-up feature grid with navy icon tiles, a numbered 3-step \"how it works\" walkthrough with connecting gradient lines, a 4-up app screenshot gallery, a 3-tier pricing table (Starter / Professional / Enterprise) with a dark-blue highlighted \"Most Popular\" plan, a dark navy stats band, a 6-up testimonial grid with star ratings, a plain FAQ section, and a navy-heavy footer with social icons.  This is the 6th style sibling (distinct layout and mood) to MobileAppKimiPage.  Best for B2B mobile / enterprise wellness / habit-tracking / productivity tools when you want authority, trust and conversion focus.",
  props: z.object({
    /** Brand / app name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        reviewLabel: z.string().optional(),
        avatarAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Trusted by" logo bar. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid. */
    features: z
      .object({
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
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              bullets: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** App-screenshot gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string(), imageAlt: z.string() }))
          .optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              featured: z.boolean().optional(),
              features: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Big-number stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ section. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Final CTA. */
    cta: z
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
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        bottomLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "HabitTrack Pro"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Features",
          "How It Works",
          "Pricing",
          "Customers",
          "FAQ",
          "Get Started",
        ]

    const heroBadge =
      props.hero?.badge ?? "Trusted by 2,000+ Enterprise Teams"
    const heroTop =
      props.hero?.headingTop ?? "Build Better Habits."
    const heroBottom =
      props.hero?.headingBottom ?? "Transform Your Team."
    const heroSub =
      props.hero?.subheading ??
      "HabitTrack Pro helps organizations increase employee wellness by 47%, reduce burnout, and build lasting productivity habits with science-backed tracking and enterprise-grade security."
    const heroPrimary =
      props.hero?.primaryCta ?? "Start Free Trial"
    const heroSecondary =
      props.hero?.secondaryCta ?? "See How It Works"
    const heroSocialProof =
      props.hero?.socialProof ?? "4.9"
    const heroReviewLabel =
      props.hero?.reviewLabel ?? "From 12,847 verified reviews"
    const heroAvatarAlts = props.hero?.avatarAlts?.length
      ? props.hero.avatarAlts
      : [
          "professional headshot of a confident male executive with short hair",
          "professional headshot of a smiling female team leader with brown hair",
          "professional headshot of a young male professional with beard",
          "professional headshot of a businesswoman with blonde hair",
        ]

    const logosLabel =
      props.logos?.label ?? "Trusted by leading organizations worldwide"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["TechCorp", "Velocity", "MediCare+", "FinanceHub", "GlobalNet", "Starlight"]

    const featuresHeading =
      props.features?.heading ?? "Everything Your Team Needs"
    const featuresDesc =
      props.features?.description ??
      "Comprehensive habit tracking, team analytics, and enterprise security—all in one powerful platform."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Habit Tracking",
            description:
              "Set daily, weekly, or custom frequency goals. Track completion with one tap and build consistent routines with intelligent reminders.",
          },
          {
            title: "Team Challenges",
            description:
              "Create friendly competition with team-wide challenges. Wellness challenges boost engagement by 68% and improve team cohesion.",
          },
          {
            title: "Advanced Analytics",
            description:
              "Deep insights into team wellness trends, completion rates, and habit patterns. Export reports for leadership reviews.",
          },
          {
            title: "Enterprise Security",
            description:
              "SOC 2 Type II certified, GDPR compliant, with end-to-end encryption. Your team's data stays protected at all times.",
          },
          {
            title: "Smart Notifications",
            description:
              "AI-powered reminders that adapt to each user's schedule. Reduce notification fatigue while maintaining engagement.",
          },
          {
            title: "SSO Integration",
            description:
              "Seamless integration with Okta, Azure AD, Google Workspace, and SAML 2.0. Provision users automatically via SCIM.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "Get Started in Minutes"
    const stepsDesc =
      props.steps?.description ??
      "Simple onboarding process designed for enterprise deployment at scale."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create Your Workspace",
            description:
              "Set up your organization in under 2 minutes. Import your team via CSV or connect your identity provider for automatic provisioning.",
            bullets: ["Bulk user import", "Department groups"],
          },
          {
            title: "Configure Habit Programs",
            description:
              "Launch pre-built wellness tracks or create custom habits aligned with your company culture and goals.",
            bullets: ["25+ templates included", "Custom branding"],
          },
          {
            title: "Track & Optimize",
            description:
              "Monitor participation, celebrate wins, and use insights to continuously improve your wellness initiatives.",
            bullets: ["Real-time dashboard", "Monthly reports"],
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Powerful Mobile Experience"
    const galleryDesc =
      props.gallery?.description ??
      "Intuitive interface designed for busy professionals who need to track habits on the go."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Dashboard",
            description: "Daily overview with progress visualization",
            imageAlt:
              "mobile app dashboard screen showing daily habit tracking interface with progress circles",
          },
          {
            title: "Analytics",
            description: "Track your streaks and success rates",
            imageAlt:
              "mobile app analytics screen showing weekly habit statistics with bar charts",
          },
          {
            title: "Team Leaderboard",
            description: "Friendly competition with colleagues",
            imageAlt:
              "mobile app team leaderboard screen showing colleague rankings and achievements",
          },
          {
            title: "Create Habits",
            description: "Custom habits with flexible scheduling",
            imageAlt:
              "mobile app habit creation screen showing custom habit setup interface",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, Transparent Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that fits your team size. All plans include a 14-day free trial."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "For small teams getting started",
            price: "$6",
            period: "/user/month",
            cta: "Start Free Trial",
            featured: false,
            features: [
              "Up to 25 team members",
              "10 habit templates",
              "Basic analytics dashboard",
              "Email support",
              "Mobile app access",
            ],
          },
          {
            name: "Professional",
            tagline: "For growing organizations",
            price: "$12",
            period: "/user/month",
            cta: "Start Free Trial",
            featured: true,
            features: [
              "Unlimited team members",
              "All 50+ habit templates",
              "Advanced analytics & exports",
              "Priority chat support",
              "SSO integration",
              "Team challenges & rewards",
            ],
          },
          {
            name: "Enterprise",
            tagline: "For large organizations",
            price: "Custom",
            period: "",
            cta: "Contact Sales",
            featured: false,
            features: [
              "Everything in Professional",
              "Dedicated account manager",
              "Custom integrations",
              "SLA guarantees",
              "On-premise deployment option",
              "24/7 phone support",
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2M+", label: "Active Users" },
          { value: "47%", label: "Avg. Wellness Improvement" },
          { value: "156M", label: "Habits Completed" },
          { value: "98.9%", label: "Uptime SLA" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by Teams Worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how organizations are transforming workplace wellness with HabitTrack Pro."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Since implementing HabitTrack Pro, our team's reported stress levels dropped by 34%. The team challenges have created a culture of wellness we never had before.",
            name: "Michael Chen",
            role: "Chief People Officer, TechCorp",
            avatarAlt:
              "professional headshot of a male chief people officer in a navy suit",
          },
          {
            quote:
              "The analytics dashboard gives me insights I never had before. I can see which departments are thriving and where we need to invest more in wellness initiatives.",
            name: "Sarah Williams",
            role: "VP of HR, MediCare+",
            avatarAlt:
              "professional headshot of a female HR director with glasses wearing a blouse",
          },
          {
            quote:
              "We evaluated 5 different wellness platforms. HabitTrack Pro was the only one that combined powerful features with the enterprise security we require.",
            name: "David Park",
            role: "CTO, FinanceHub",
            avatarAlt:
              "professional headshot of a male chief technology officer in a business suit",
          },
          {
            quote:
              "Our remote team was struggling with isolation. The team challenges brought us together and improved both wellness and collaboration across time zones.",
            name: "Emma Rodriguez",
            role: "Team Lead, GlobalNet",
            avatarAlt:
              "professional headshot of a smiling female team lead with curly dark hair",
          },
          {
            quote:
              "The ROI has been incredible. Reduced sick days, higher retention, and a more engaged workforce. This is the best investment we've made in our people.",
            name: "James Mitchell",
            role: "CEO, Velocity Inc",
            avatarAlt:
              "professional headshot of a male chief executive officer with dark hair in formal attire",
          },
          {
            quote:
              "Implementation was seamless. Their support team had us up and running in a day, and the SSO integration worked perfectly with our existing systems.",
            name: "Lisa Thompson",
            role: "IT Director, Starlight Corp",
            avatarAlt:
              "professional headshot of a female IT director with blonde hair in professional attire",
          },
        ]

    const faqHeading =
      props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about HabitTrack Pro."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does the 14-day free trial work?",
            answer:
              "Start your trial instantly with full access to all Professional plan features. No credit card required. At the end of 14 days, choose a plan or your workspace automatically converts to our limited free tier.",
          },
          {
            question: "Is our data secure and private?",
            answer:
              "Absolutely. We're SOC 2 Type II certified, GDPR compliant, and use end-to-end encryption. Enterprise plans include additional security features like on-premise deployment and custom data retention policies.",
          },
          {
            question: "Can we integrate with our existing tools?",
            answer:
              "Yes, we offer native integrations with Slack, Microsoft Teams, Google Workspace, and 50+ other tools. Our API and webhooks enable custom integrations for enterprise customers.",
          },
          {
            question: "What support options are available?",
            answer:
              "Starter plans include email support with 24-hour response time. Professional plans get priority chat support. Enterprise customers receive 24/7 phone support and a dedicated account manager.",
          },
          {
            question: "Can we customize habit templates for our organization?",
            answer:
              "Professional and Enterprise plans allow you to create unlimited custom habit templates, set organization-wide challenges, and brand the app with your company colors and logo.",
          },
          {
            question: "What happens if someone leaves the company?",
            answer:
              "When an employee departs, their data remains accessible to administrators for compliance purposes, while their personal account is securely archived. SCIM integration enables automatic user provisioning and deprovisioning.",
          },
          {
            question: "Do you offer discounts for nonprofits or education?",
            answer:
              "Yes, we offer 40% discounts for registered nonprofits and educational institutions. Contact our sales team with your organization details to apply.",
          },
          {
            question: "How do team challenges work?",
            answer:
              "Admins can create challenges (like \"Walk 10,000 steps daily for 30 days\") with specific goals and timeframes. Teams compete on leaderboards, earn badges, and unlock rewards based on collective achievement.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to Transform Your Team?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2,000+ organizations already building better habits. Start your free 14-day trial today—no credit card required."
    const ctaPrimary =
      props.cta?.primaryCta ?? "Start Free Trial"
    const ctaSecondary =
      props.cta?.secondaryCta ?? "Schedule Demo"

    const footerTagline =
      props.footer?.tagline ??
      "Enterprise habit tracking platform helping organizations build better teams through science-backed wellness programs."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Pricing",
              "Integrations",
              "Changelog",
              "API Docs",
            ],
          },
          {
            title: "Company",
            links: ["About", "Customers", "Careers", "Blog", "Press"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Contact",
              "FAQ",
              "Status",
              "Security",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerBottomLinks = props.footer?.bottomLinks?.length
      ? props.footer.bottomLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // ---- inline SVG components ----

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn("text-foreground", className)}
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 16L14 20L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = () => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons = [
      /* clipboard-list */
      <svg key="f1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>,
      /* users */
      <svg key="f2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      /* bar-chart */
      <svg key="f3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      /* lock */
      <svg key="f4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      /* lightning-bolt */
      <svg key="f5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      /* globe */
      <svg key="f6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* ── Navbar ── */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button type="button" onClick={() => go(nav[0])} className="flex items-center gap-2">
                <LogoMark className="size-8" />
                <span className="text-xl font-bold tracking-tight">{brand}</span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, 5).map((label) => (
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
                  onClick={() => go(nav[5] ?? "Get Started")}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[5] ?? "Get Started"}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* ── Hero ── */}
          <section className="relative overflow-hidden bg-muted/50" aria-labelledby="hero-heading">
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted" />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* text */}
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                    <span className="size-2 rounded-full bg-chart-3" />
                    <span className="text-xs font-semibold text-foreground">{heroBadge}</span>
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                  >
                    {heroTop}
                    <br />
                    <span className="text-muted-foreground">{heroBottom}</span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg ring-1 ring-primary/20 transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-background px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                    <div className="flex -space-x-2">
                      {heroAvatarAlts.map((a) => (
                        <Image
                          key={a}
                          alt={a}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} />
                          ))}
                        </div>
                        <span className="font-semibold text-foreground">{heroSocialProof}</span>
                      </div>
                      <p className="text-muted-foreground">{heroReviewLabel}</p>
                    </div>
                  </div>
                </div>

                {/* phone mock-up */}
                <div className="relative lg:pl-8">
                  <div className="relative z-10">
                    {/* glow */}
                    <div
                      aria-hidden="true"
                      className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-muted-foreground/20 to-background opacity-50 blur-2xl"
                    />
                    <div className="relative mx-auto w-72 sm:w-80">
                      {/* outer frame */}
                      <div className="rounded-[2.5rem] bg-foreground p-3 shadow-2xl">
                        <div className="overflow-hidden rounded-[2rem] bg-background">
                          {/* status bar*/}
                          <div className="flex items-center justify-between bg-foreground px-5 py-3">
                            <span className="text-sm font-semibold text-background">9:41</span>
                            <div className="flex items-center gap-1">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 text-background" aria-hidden="true">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                              </svg>
                              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 text-background" aria-hidden="true">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                              </svg>
                            </div>
                          </div>
                          {/* habit list */}
                          <div className="p-5">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="grid size-10 place-items-center rounded-xl bg-muted">
                                <CheckIcon className="size-5 text-foreground" />
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground">Daily Habits</h3>
                                <p className="text-xs text-muted-foreground">3 of 5 completed</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {["Morning Meditation", "Drink 8 Glasses Water", "30min Focus Work"].map((h) => (
                                <div key={h} className="flex items-center gap-3 rounded-xl border border-border/50 bg-accent/40 p-3">
                                  <div className="grid size-6 place-items-center rounded-full bg-chart-3">
                                    <CheckIcon className="size-4 text-primary-foreground" />
                                  </div>
                                  <span className="text-sm font-medium text-muted-foreground line-through">{h}</span>
                                </div>
                              ))}
                              {["Evening Walk", "Read 20 Pages"].map((h) => (
                                <div key={h} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/50 p-3">
                                  <div className="size-6 rounded-full border-2 border-border" />
                                  <span className="text-sm font-medium text-foreground">{h}</span>
                                </div>
                              ))}
                            </div>
                            {/* progress bar */}
                            <div className="mt-5 border-t border-border pt-4">
                              <div className="mb-2 flex justify-between text-sm">
                                <span className="text-muted-foreground">Weekly Progress</span>
                                <span className="font-semibold text-foreground">60%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-foreground to-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* floating chips */}
                    <div className="absolute top-8 -right-4 hidden rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full bg-chart-2/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-chart-2" aria-hidden="true">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">Streak: 14 days</p>
                          <p className="text-xs text-muted-foreground">Keep it up!</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -left-8 bottom-16 hidden rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full bg-chart-3/20">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-chart-3" aria-hidden="true">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">Goal Reached!</p>
                          <p className="text-xs text-muted-foreground">+250 XP earned</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* app store badges */}
              <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row lg:mt-16">
                <button type="button" onClick={() => go("App Store")} className="transition-transform hover:scale-105">
                  <span className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-lg">
                    App Store
                  </span>
                </button>
                <button type="button" onClick={() => go("Google Play")} className="transition-transform hover:scale-105">
                  <span className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-lg">
                    Google Play
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* ── Logos ── */}
          <section className="border-b border-border py-12" aria-label="Trusted by">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 sm:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo, i) => (
                  <div key={logo} className="flex items-center justify-center gap-2 text-muted-foreground">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                      {i % 6 === 0 && <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />}
                      {i % 6 === 1 && <path d="M13 10V3L4 14h7v7l9-11h-7z" />}
                      {i % 6 === 2 && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />}
                      {i % 6 === 3 && <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />}
                      {i % 6 === 4 && <circle cx="12" cy="12" r="10" />}
                      {i % 6 === 5 && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />}
                    </svg>
                    <span className="text-lg font-bold">{logo}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Features ── */}
          <section className="py-20 lg:py-28" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-semibold text-foreground">
                  Features
                </span>
                <h2
                  id="features-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg lg:p-8">
                    <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── How it works ── */}
          <section className="bg-foreground py-20 text-primary-foreground lg:py-28" id="how-it-works" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-foreground">
                  How It Works
                </span>
                <h2
                  id="steps-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-background text-3xl font-bold text-foreground shadow-lg">
                      {String(i + 1)}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-primary-foreground">{step.title}</h3>
                    <p className="mb-4 leading-relaxed text-primary-foreground/70">{step.description}</p>
                    <ul className="space-y-2 text-sm text-primary-foreground/50">
                      {step.bullets?.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <CheckIcon className="size-4 text-chart-2" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute top-8 left-full hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-background/50 to-transparent md:block"
                        style={{ maxWidth: "calc(100% - 4rem)" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Gallery ── */}
          <section className="bg-muted/50 py-20 lg:py-28" id="gallery" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground">
                  App Gallery
                </span>
                <h2
                  id="gallery-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {galleryItems.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="mb-4 aspect-[9/16] overflow-hidden rounded-xl bg-muted">
                      <Image alt={item.imageAlt} w={400} h={711} className="size-full object-cover" loading="lazy" />
                    </div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Pricing ── */}
          <section className="py-20 lg:py-28" aria-labelledby="pricing-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-semibold text-foreground">
                  Pricing
                </span>
                <h2
                  id="pricing-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.featured
                        ? "bg-foreground text-primary-foreground"
                        : "border border-border bg-card",
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-chart-2 px-4 py-1 text-sm font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      <p
                        className={cn(
                          "text-sm",
                          tier.featured ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.period && (
                        <span className={cn(tier.featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <ul className="mb-8 space-y-4">
                      {tier.features?.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <CheckIcon
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              tier.featured ? "text-chart-2" : "text-chart-3",
                            )}
                          />
                          <span
                            className={cn(
                              tier.featured ? "text-primary-foreground/90" : "text-muted-foreground",
                            )}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 px-4 text-center text-sm font-semibold transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border-2 border-border bg-background hover:bg-muted",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                All prices in USD. Billed annually. Monthly billing available at +20%.
              </p>
            </div>
          </section>

          {/* ── Stats ── */}
          <section className="bg-foreground py-20 text-primary-foreground lg:py-28" aria-labelledby="stats-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold lg:text-5xl">{s.value}</div>
                    <p className="text-primary-foreground/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section className="bg-muted/50 py-20 lg:py-28" id="testimonials" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground">
                  Testimonials
                </span>
                <h2
                  id="testimonials-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/80">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="py-20 lg:py-28" id="faq" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-semibold text-foreground">
                  FAQ
                </span>
                <h2
                  id="faq-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-xl border border-border bg-muted/50 p-6"
                  >
                    <h3 className="mb-2 font-semibold text-foreground">{item.question}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="bg-foreground py-20 text-primary-foreground lg:py-28" id="cta" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/70 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-semibold text-foreground shadow-lg transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary-foreground/30 bg-transparent px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                <button type="button" onClick={() => go("App Store")} className="transition-transform hover:scale-105">
                  <span className="inline-flex items-center justify-center rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-lg">
                    App Store
                  </span>
                </button>
                <button type="button" onClick={() => go("Google Play")} className="transition-transform hover:scale-105">
                  <span className="inline-flex items-center justify-center rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-lg">
                    Google Play
                  </span>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-border bg-foreground py-16 text-primary-foreground" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8 text-primary-foreground" />
                  <span className="text-xl font-bold text-primary-foreground">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm text-primary-foreground/70">{footerTagline}</p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => go("Twitter")}
                    aria-label="Twitter"
                    className="grid size-10 place-items-center rounded-lg bg-primary-foreground/10 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go("LinkedIn")}
                    aria-label="LinkedIn"
                    className="grid size-10 place-items-center rounded-lg bg-primary-foreground/10 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </button>
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-primary-foreground">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 md:flex-row">
              <p className="text-sm text-primary-foreground/50">{footerCopyright}</p>
              <div className="flex items-center gap-6">
                {footerBottomLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-primary-foreground/50 transition-colors hover:text-primary-foreground"
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