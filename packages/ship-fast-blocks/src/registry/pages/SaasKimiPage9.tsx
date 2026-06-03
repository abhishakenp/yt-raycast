import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const SaasKimiPage9 = defineComponent({
  name: "SaasKimiPage9",
  description:
    "Warm-stone editorial SaaS landing page with a serif-accented hero pairing voice-scheduling copy with a live calendar mockup, grayscale trusted-by logo strip, six feature cards with colored icon tints, a horizontal three-step how-it-works band with imagery, a masonry product gallery grid, a three-tier pricing table with a dark 'Most Popular' centerpiece, a dark stats band, a six-card testimonial wall with star ratings, a native details-based FAQ accordion, a warm-gradient CTA banner, and a full dark footer with social links. This is the 9th style variant sibling to SaasKimiPage, offering an earthy, warm aesthetic with editorial typography and rich product photography — ideal for AI productivity tools, scheduling apps, calendar SaaS, and B2B software needing a refined, approachable landing page with extensive social proof and feature showcase.",
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
        notificationTitle: z.string().optional(),
        notificationSub: z.string().optional(),
        imageAlt: z.string().optional(),
        avatars: z
          .array(
            z.object({
              alt: z.string(),
              name: z.string(),
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
        highlight: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              aspect: z.string().optional(),
              rowSpan: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              missing: z.array(z.string()).optional(),
              cta: z.string(),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    testimonials: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
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
    faq: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        items: z
          .array(
            z.object({
              question: z.string(),
              answer: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
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

    const brand = props.brand ?? "Chronos"
    const nav = props.nav?.length ? props.nav : ["Features", "Pricing", "Stories", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with voice scheduling"
    const heroHeading = props.hero?.heading ?? "Your time."
    const heroHighlight = props.hero?.highlight ?? "Effortlessly optimized."
    const heroSub =
      props.hero?.subheading ??
      "Chronos AI learns your preferences, protects your focus time, and automatically schedules meetings at the perfect moments. Join 50,000+ professionals who've reclaimed their calendars."
    const heroPrimary = props.hero?.primaryCta ?? "Start your free 14-day trial"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch demo"
    const heroProof = props.hero?.socialProof ?? "Rated 4.9/5 by 2,400+ users"
    const demoTitle = props.hero?.demoTitle ?? "Chronos AI Calendar"
    const notifTitle = props.hero?.notificationTitle ?? "3 meetings rescheduled"
    const notifSub = props.hero?.notificationSub ?? "AI found better slots for focus time"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern calendar application interface showing AI-scheduled meetings with color-coded events and focus time blocks"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          { alt: "Professional headshot of Sarah Chen, product manager", name: "Sarah Chen" },
          { alt: "Professional headshot of James Mitchell, startup founder", name: "James Mitchell" },
          { alt: "Professional headshot of Elena Rodriguez, design director", name: "Elena Rodriguez" },
          { alt: "Professional headshot of David Park, engineering lead", name: "David Park" },
        ]

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Notion", "Figma", "Webflow", "Linear", "Vercel", "Stripe"]

    const featuresTag = props.features?.tag ?? "Features"
    const featuresHeading = props.features?.heading ?? "Intelligence that understands"
    const featuresHighlight = props.features?.highlight ?? "how you work"
    const featuresDesc =
      props.features?.description ??
      "Chronos AI doesn't just fill your calendar—it optimizes your entire day around what matters most to you."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "AI-Powered Scheduling",
            description:
              "Chronos learns your preferences—morning meetings, afternoon focus blocks, buffer times—and automatically schedules everything at optimal times.",
          },
          {
            title: "Focus Time Protection",
            description:
              "Automatically blocks deep work sessions, learns when you're most productive, and defends these sacred hours from interruptions.",
          },
          {
            title: "Smart Conflict Resolution",
            description:
              "Double-booked? Chronos suggests the best alternative times, handles rescheduling with attendees, and keeps everyone informed.",
          },
          {
            title: "Voice & Natural Language",
            description:
              'Just say "Schedule a 30-minute sync with Sarah next Tuesday morning" and Chronos handles the rest—finding the perfect slot.',
          },
          {
            title: "Universal Calendar Sync",
            description:
              "Seamlessly connects with Google Calendar, Outlook, Apple Calendar, and 50+ tools. No more switching between apps.",
          },
          {
            title: "Productivity Analytics",
            description:
              "Understand how you spend your time with weekly insights: meeting load, focus hours achieved, and optimization suggestions.",
          },
        ]

    const stepsTag = props.steps?.tag ?? "How it works"
    const stepsHeading = props.steps?.heading ?? "Set up in minutes."
    const stepsHighlight = props.steps?.highlight ?? "Optimize for life."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Connect your calendars",
            description:
              "Link Google Calendar, Outlook, or Apple Calendar in one click. Chronos securely syncs your existing events and preferences.",
            imageAlt: "Close-up of hands typing on laptop keyboard connecting calendar accounts",
          },
          {
            title: "Set your preferences",
            description:
              "Tell Chronos when you prefer meetings, your focus hours, lunch breaks, and travel buffers. The AI learns and adapts.",
            imageAlt: "Mobile app settings screen showing calendar preference toggles and time selection",
          },
          {
            title: "Let AI handle the rest",
            description:
              "Forward meeting requests, use voice commands, or let Chronos suggest optimal times. Your calendar now works for you.",
            imageAlt: "Person relaxing at modern workspace with organized calendar on screen showing scheduled day",
          },
        ]

    const galleryTag = props.gallery?.tag ?? "Gallery"
    const galleryHeading = props.gallery?.heading ?? "Beautiful on every"
    const galleryHighlight = props.gallery?.highlight ?? "device and platform"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Weekly Overview",
            description: "Visualize your entire week at a glance",
            imageAlt: "Dashboard showing weekly calendar view with AI-generated focus blocks and meeting clusters",
            aspect: "3/4",
          },
          {
            title: "Mobile Experience",
            description: "Full functionality on iOS and Android",
            imageAlt: "Mobile app interface showing daily schedule with smart suggestions and quick actions",
            rowSpan: true,
          },
          {
            title: "Productivity Insights",
            description: "Data-driven time management",
            imageAlt: "Analytics dashboard showing meeting time distribution and productivity insights",
            aspect: "3/4",
          },
          {
            title: "Smart Suggestions",
            description: "AI finds the perfect meeting times",
            imageAlt: "Smart scheduling assistant interface suggesting optimal meeting times based on AI analysis",
            aspect: "3/2",
          },
          {
            title: "Team Coordination",
            description: "Effortless group scheduling",
            imageAlt: "Team collaboration view showing shared availability and group scheduling interface",
            aspect: "3/2",
          },
        ]

    const pricingTag = props.pricing?.tag ?? "Pricing"
    const pricingHeading = props.pricing?.heading ?? "Simple pricing."
    const pricingHighlight = props.pricing?.highlight ?? "Powerful results."
    const pricingDesc =
      props.pricing?.description ??
      "Start free, upgrade when you're ready. No credit card required for trial."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            description: "For individuals getting started",
            price: "Free",
            period: "",
            features: ["1 connected calendar", "10 AI-scheduled meetings/month", "Basic email support"],
            missing: ["Focus time protection"],
            cta: "Get started free",
            popular: false,
          },
          {
            name: "Professional",
            description: "For busy professionals",
            price: "$12",
            period: "/month",
            features: [
              "Unlimited calendars",
              "Unlimited AI scheduling",
              "Focus time protection",
              "Voice commands",
              "Priority support",
            ],
            missing: [],
            cta: "Start 14-day trial",
            popular: true,
          },
          {
            name: "Team",
            description: "For teams and organizations",
            price: "$29",
            period: "/user/month",
            features: [
              "Everything in Professional",
              "Team scheduling assistant",
              "Shared availability pages",
              "Admin dashboard & analytics",
              "SSO & advanced security",
            ],
            missing: [],
            cta: "Contact sales",
            popular: false,
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Active professionals" },
          { value: "2.4M", label: "Meetings scheduled" },
          { value: "847K", label: "Hours of focus time saved" },
          { value: "4.9", label: "Average rating" },
        ]

    const testimonialsTag = props.testimonials?.tag ?? "Testimonials"
    const testimonialsHeading = props.testimonials?.heading ?? "Loved by leaders"
    const testimonialsHighlight = props.testimonials?.highlight ?? "who value their time"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Chronos has completely transformed how I manage my day. The AI understands that I need mornings for deep work and afternoons for meetings. I've gained 12 hours of focus time per week.",
            name: "Marcus Chen",
            role: "VP Engineering, Notion",
            avatarAlt: "Professional headshot of Marcus Chen, VP of Engineering at Notion",
          },
          {
            quote:
              "As a founder, my calendar was chaos. Chronos brought sanity to my schedule. The voice commands are magic—I just say what I need and it's done. Best productivity investment I've made.",
            name: "Sarah Kim",
            role: "Founder & CEO, Linear",
            avatarAlt: "Professional headshot of Sarah Kim, CEO and founder at Linear",
          },
          {
            quote:
              "The team scheduling feature is a game-changer. What used to take 15 emails now takes one voice command. Our entire company runs on Chronos now.",
            name: "James Wilson",
            role: "Chief of Staff, Webflow",
            avatarAlt: "Professional headshot of James Wilson, Chief of Staff at Webflow",
          },
          {
            quote:
              "I was skeptical about AI calendars, but Chronos won me over in days. The focus time protection alone is worth the subscription. I actually finish projects now.",
            name: "Elena Rodriguez",
            role: "Creative Director, Figma",
            avatarAlt: "Professional headshot of Elena Rodriguez, Creative Director at Figma",
          },
          {
            quote:
              "The analytics dashboard showed me I was spending 28 hours a week in meetings. Chronos helped me reclaim 12 of those. My team's output has doubled.",
            name: "Michael Torres",
            role: "VP Product, Stripe",
            avatarAlt: "Professional headshot of Michael Torres, VP Product at Stripe",
          },
          {
            quote:
              "Scheduling across time zones was a nightmare before Chronos. Now the AI finds times that work for everyone, even our team in Tokyo. Pure magic.",
            name: "Aisha Patel",
            role: "Engineering Manager, Vercel",
            avatarAlt: "Professional headshot of Aisha Patel, Engineering Manager at Vercel",
          },
        ]

    const faqTag = props.faq?.tag ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Questions?"
    const faqHighlight = props.faq?.highlight ?? "We have answers."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How does Chronos AI learn my preferences?",
            answer:
              "Chronos observes your scheduling patterns over the first few weeks—when you prefer meetings, how long you like focus blocks, your typical lunch times, and buffer preferences. You can also explicitly set these in your preferences, and the AI combines both approaches for optimal results.",
          },
          {
            question: "Is my calendar data secure?",
            answer:
              "Absolutely. Chronos uses bank-level AES-256 encryption for all data, both in transit and at rest. We're SOC 2 Type II certified, GDPR compliant, and never sell or share your data. Your calendar information is only used to provide scheduling services to you.",
          },
          {
            question: "Can I still manually schedule if needed?",
            answer:
              "Of course! Chronos is designed to assist, not replace your control. You can always manually schedule, edit AI-suggested times, or override any decision. The AI learns from these overrides to better understand your preferences.",
          },
          {
            question: "Which calendar platforms do you support?",
            answer:
              "Chronos integrates with Google Calendar (Gmail and Workspace), Microsoft Outlook and Exchange, Apple iCloud Calendar, and supports CalDAV for other platforms. We also offer Slack, Teams, and Zoom integrations for seamless workflow.",
          },
          {
            question: "What happens after my free trial?",
            answer:
              "After your 14-day trial, you can choose to upgrade to a paid plan or continue with our free Starter tier with limited features. We won't charge you automatically—if you don't upgrade, you'll simply transition to the free plan. No surprises.",
          },
          {
            question: "Do you offer refunds?",
            answer:
              "Yes, we offer a 30-day money-back guarantee for all paid plans. If Chronos doesn't transform your productivity, simply contact support within 30 days of your first payment for a full refund—no questions asked.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to reclaim your"
    const ctaHighlight = props.cta?.highlight ?? "time and focus?"
    const ctaSub =
      props.cta?.subheading ??
      "Join 50,000+ professionals who've transformed their relationship with their calendar. Start your free 14-day trial today—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start your free trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a demo"

    const footerTagline =
      props.footer?.tagline ??
      "AI-powered calendar assistant that learns your preferences and automatically optimizes your schedule."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Integrations", "Changelog"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press"],
          },
          {
            title: "Support",
            links: ["Help Center", "Contact", "Privacy", "Terms"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand} AI Inc. All rights reserved.`

    const featureIconTints = [
      "bg-chart-1",
      "bg-chart-2",
      "bg-chart-3",
      "bg-chart-4",
      "bg-chart-5",
      "bg-primary",
    ]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn("grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground", className)}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
    )

    const CheckIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 text-chart-2" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const XIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 text-muted-foreground" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )

    const StarIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-chart-4" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )

    const featureSvgs = [
      <svg key="f1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg key="f2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="f3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      <svg key="f4" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>,
      <svg key="f5" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>,
      <svg key="f6" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
    ]

    return (
      <div className={cn("flex min-h-svh flex-col bg-background text-foreground antialiased", props.className)}>
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button type="button" onClick={() => go(nav[0])} className="flex items-center gap-3">
              <LogoMark />
              <span className="font-display text-xl font-medium text-foreground">{brand}</span>
            </button>
            <ul className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
              {nav.map((label) => (
                <li key={label}>
                  <button type="button" onClick={() => go(label)} className="transition-colors hover:text-foreground">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => go("Sign in")} className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
                Sign in
              </button>
              <button type="button" onClick={() => go(heroPrimary)} className="inline-flex items-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                Start free trial
              </button>
            </div>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-accent" aria-hidden="true" />
            <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-32 lg:pb-40">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
                    <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                    <span className="text-xs font-medium text-muted-foreground">{heroBadge}</span>
                  </div>
                  <h1 className="font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                    <br />
                    <span className="italic text-muted-foreground">{heroHighlight}</span>
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">{heroSub}</p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button type="button" onClick={() => go(heroPrimary)} className="inline-flex items-center justify-center rounded-xl bg-foreground px-8 py-4 font-medium text-background shadow-lg transition-all hover:bg-foreground/90">
                      {heroPrimary}
                    </button>
                    <button type="button" onClick={() => go(heroSecondary)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-4 font-medium text-foreground transition-colors hover:bg-muted">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" aria-hidden="true">
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3" aria-hidden="true">
                      {heroAvatars.map((avatar, i) => (
                        <Image
                          key={avatar.name}
                          alt={avatar.alt}
                          w={100}
                          h={100}
                          className={cn("size-10 rounded-full border-2 border-card object-cover", i > 0 && "-ml-3")}
                        />
                      ))}
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{heroProof}</p>
                    </div>
                  </div>
                </div>

                {/* Hero demo card */}
                <div className="relative" aria-hidden="true">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/50 to-muted/50 blur-2xl" />
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-border bg-muted px-6 py-4">
                      <div className="flex gap-1.5">
                        <span className="size-3 rounded-full bg-chart-5" />
                        <span className="size-3 rounded-full bg-chart-4" />
                        <span className="size-3 rounded-full bg-chart-2" />
                      </div>
                      <span className="ml-4 text-xs text-muted-foreground font-mono">{demoTitle}</span>
                    </div>
                    <Image alt={heroImageAlt} w={800} h={600} className="w-full aspect-[4/3] object-cover" />
                    <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-border bg-card/95 backdrop-blur p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full bg-primary">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{notifTitle}</p>
                          <p className="text-xs text-muted-foreground">{notifSub}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="bg-foreground py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">{logosLabel}</p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoNames.map((name) => (
                  <div key={name} className="flex items-center justify-center">
                    <svg className="h-8 text-muted-foreground" viewBox="0 0 140 30" fill="currentColor">
                      <text x="0" y="22" fontFamily="system-ui" fontSize="16" fontWeight="600">{name}</text>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{featuresTag}</span>
                <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                  <br />
                  <span className="italic text-muted-foreground">{featuresHighlight}</span>
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article key={item.title} className="group rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                    <div className={cn("mb-6 grid size-14 place-items-center rounded-xl", featureIconTints[i])}>
                      {featureSvgs[i]}
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-foreground">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-muted-foreground/10 px-3 py-1 text-xs font-medium text-muted-foreground">{stepsTag}</span>
                <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                  <br />
                  <span className="italic text-muted-foreground">{stepsHighlight}</span>
                </h2>
              </div>
              <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-xl bg-foreground font-display text-xl font-medium text-background">
                        {i + 1}
                      </div>
                      {i < stepItems.length - 1 && (
                        <div className="hidden h-px flex-1 bg-border lg:block" />
                      )}
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-foreground">{step.title}</h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">{step.description}</p>
                    <div className="overflow-hidden rounded-xl border border-border shadow-lg">
                      <Image alt={step.imageAlt} w={600} h={400} className="w-full aspect-[3/2] object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{galleryTag}</span>
                <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                  <br />
                  <span className="italic text-muted-foreground">{galleryHighlight}</span>
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <div
                    key={item.title}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border border-border shadow-lg",
                      item.rowSpan && "lg:row-span-2",
                    )}
                  >
                    <Image
                      alt={item.imageAlt}
                      w={600}
                      h={item.rowSpan ? 900 : item.aspect === "3/2" ? 400 : 800}
                      className={cn(
                        "w-full object-cover transition-transform duration-500 group-hover:scale-105",
                        item.rowSpan && "h-full",
                        item.aspect === "3/4" && "aspect-[3/4]",
                        item.aspect === "3/2" && "aspect-[3/2]",
                      )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="font-medium text-background">{item.title}</p>
                      <p className="text-sm text-background/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-muted-foreground/10 px-3 py-1 text-xs font-medium text-muted-foreground">{pricingTag}</span>
                <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                  <br />
                  <span className="italic text-muted-foreground">{pricingHighlight}</span>
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      plan.popular
                        ? "bg-foreground border border-border"
                        : "bg-card border border-border",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                          Most popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className={cn("text-lg font-medium", plan.popular ? "text-background" : "text-foreground")}>
                        {plan.name}
                      </h3>
                      <p className={cn("text-sm", plan.popular ? "text-background/60" : "text-muted-foreground")}>
                        {plan.description}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className={cn("font-display text-4xl font-medium", plan.popular ? "text-background" : "text-foreground")}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className={cn("text-sm", plan.popular ? "text-background/60" : "text-muted-foreground")}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <CheckIcon />
                          <span className={cn(plan.popular ? "text-background/70" : "text-muted-foreground")}>{feat}</span>
                        </li>
                      ))}
                      {plan.missing?.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <XIcon />
                          <span className="text-muted-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 font-medium transition-colors",
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
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">All plans include a 14-day free trial. No credit card required. Cancel anytime.</p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center md:grid-cols-2 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-4xl font-medium text-background lg:text-5xl">{s.value}</div>
                    <p className="mt-2 text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{testimonialsTag}</span>
                <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                  <br />
                  <span className="italic text-muted-foreground">{testimonialsHighlight}</span>
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure key={t.name} className="rounded-2xl border border-border bg-card p-8">
                    <div className="mb-6 flex gap-1" aria-label="5 stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="flex items-center gap-4">
                      <Image alt={t.avatarAlt} w={100} h={100} className="size-12 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-muted-foreground/10 px-3 py-1 text-xs font-medium text-muted-foreground">{faqTag}</span>
                <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                  <br />
                  <span className="italic text-muted-foreground">{faqHighlight}</span>
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details key={item.question} className="group overflow-hidden rounded-xl border border-border bg-card">
                    <summary className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-muted">
                      <span className="font-medium text-foreground">{item.question}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">{item.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section id="cta" className="relative overflow-hidden bg-foreground py-24 lg:py-32">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground to-background" aria-hidden="true" />
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 size-[800px] rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="font-display text-3xl font-medium text-background sm:text-4xl lg:text-5xl">
                {ctaHeading}
                <br />
                <span className="italic text-muted-foreground">{ctaHighlight}</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{ctaSub}</p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button type="button" onClick={() => go(ctaPrimary)} className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90">
                  {ctaPrimary}
                </button>
                <button type="button" onClick={() => go(ctaSecondary)} className="inline-flex items-center justify-center rounded-xl border border-border bg-secondary px-8 py-4 font-medium text-secondary-foreground transition-colors hover:bg-secondary/90">
                  {ctaSecondary}
                </button>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-chart-2" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-chart-2" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-chart-2" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button type="button" onClick={() => go(nav[0])} className="mb-6 flex items-center gap-3">
                  <LogoMark />
                  <span className="font-display text-xl font-medium text-background">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm leading-relaxed text-muted-foreground">{footerTagline}</p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => go("Twitter")} aria-label="Twitter" className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-background">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => go("GitHub")} aria-label="GitHub" className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-background">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => go("LinkedIn")} aria-label="LinkedIn" className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-background">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </button>
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-medium text-background">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button type="button" onClick={() => go(link)} className="text-sm text-muted-foreground transition-colors hover:text-background">
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm sm:flex-row">
              <p className="text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6">
                <button type="button" onClick={() => go("Privacy Policy")} className="text-muted-foreground transition-colors hover:text-background/80">
                  Privacy Policy
                </button>
                <button type="button" onClick={() => go("Terms of Service")} className="text-muted-foreground transition-colors hover:text-background/80">
                  Terms of Service
                </button>
                <button type="button" onClick={() => go("Cookie Settings")} className="text-muted-foreground transition-colors hover:text-background/80">
                  Cookie Settings
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
