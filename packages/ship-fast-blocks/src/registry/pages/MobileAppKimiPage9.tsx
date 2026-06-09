import { z } from "zod/v4"
import { useState } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MobileAppKimiPage9 — the 9th style sibling to MobileAppKimiPage.
 *
 * A warm, editorial mobile-app landing page for mindfulness and habit-tracking
 * products. Features a soft stone-and-sage aesthetic with a split hero (gradient
 * backdrop, phone mockup with floating streak card, App Store / Google Play
 * download buttons with sub-labels, rating and download proof), a press-logo
 * strip, a 6-up feature grid with pastel icon tiles, a 3-step walkthrough with
 * numbered circles and connector lines, a 4-up app gallery, an inverted
 * big-number stats band, a 3-up testimonial grid with star ratings and avatars,
 * a 3-tier pricing table (Free / Pro / Family) with a highlighted featured plan,
 * an expandable FAQ accordion, a final download CTA with large store buttons,
 * and a multi-column footer (Product / Company / Legal) with social icons. Use
 * for wellness, meditation, fitness, productivity, or lifestyle iOS/Android app
 * launches when a calm, trustworthy, high-conversion marketing page is desired.
 */
export const MobileAppKimiPage9 = defineComponent({
  name: "MobileAppKimiPage9",
  description:
    "Warm, editorial mobile-app landing page (the 9th style sibling to MobileAppKimiPage) with a soft stone-and-sage aesthetic: split hero with gradient backdrop, phone mockup and floating streak card, App Store / Google Play buttons, a press-logo strip, a 6-up feature grid with colored icon tiles, a 3-step walkthrough with numbered circles and connector lines, a 4-up app gallery, an inverted stats band, a 3-up testimonial grid with star ratings and avatars, a 3-tier pricing table (Free / Pro / Family) with a highlighted featured plan, an expandable FAQ accordion, a final download CTA, and a multi-column footer with social icons. Ideal for wellness, meditation, fitness, productivity, or lifestyle iOS/Android app launches needing a calm, trustworthy, high-conversion marketing page.",
  props: z.object({
    /** Brand / app name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (last item is the navbar CTA). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        appStoreLabel: z.string().optional(),
        googlePlayLabel: z.string().optional(),
        rating: z.string().optional(),
        downloads: z.string().optional(),
        imageAlt: z.string().optional(),
        streakTitle: z.string().optional(),
        streakLabel: z.string().optional(),
      })
      .optional(),
    /** "Featured in" press-logo strip. */
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
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** App-screenshot gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              alt: z.string(),
              caption: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Inverted big-number stats band. */
    stats: z
      .object({
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              accent: z.boolean().optional(),
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
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
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
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string().optional(),
              price: z.string(),
              period: z.string().optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
              features: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Final download CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        appStoreLabel: z.string().optional(),
        googlePlayLabel: z.string().optional(),
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
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Zenith"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Stories", "Get Started"]

    const hero = {
      badge: props.hero?.badge ?? "Now on iOS & Android",
      headingTop: props.hero?.headingTop ?? "Master Your",
      headingAccent: props.hero?.headingAccent ?? "Daily Rituals",
      subheading:
        props.hero?.subheading ??
        "Zenith transforms intention into action. Track habits that matter, build streaks that last, and discover patterns that unlock your best self.",
      appStoreLabel: props.hero?.appStoreLabel ?? "App Store",
      googlePlayLabel: props.hero?.googlePlayLabel ?? "Google Play",
      rating: props.hero?.rating ?? "4.9 Rating",
      downloads: props.hero?.downloads ?? "500K+ Downloads",
      imageAlt:
        props.hero?.imageAlt ??
        "iPhone 15 Pro displaying Zenith habit tracking app with elegant dark interface showing daily streak and habit completion circles",
      streakTitle: props.hero?.streakTitle ?? "47 Day Streak",
      streakLabel: props.hero?.streakLabel ?? "Morning Meditation",
    }

    const logosLabel = props.logos?.label ?? "Featured In"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["TechCrunch", "Wired", "The Verge", "Product Hunt", "Forbes"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to build lasting habits"
    const featuresDesc =
      props.features?.description ??
      "Thoughtfully designed tools that make consistency effortless and progress visible."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Intelligent Reminders",
            description:
              "Context-aware notifications that adapt to your schedule. Never miss a habit, never feel nagged.",
          },
          {
            title: "Beautiful Analytics",
            description:
              "Deep insights into your patterns. Weekly reviews, trend analysis, and completion forecasts.",
          },
          {
            title: "Streak Mastery",
            description:
              "Build momentum with meaningful streaks. Protect your progress with flexible recovery options.",
          },
          {
            title: "Mindful Design",
            description:
              "A calm, distraction-free interface that makes habit tracking feel like a moment of peace.",
          },
          {
            title: "Circle Accountability",
            description:
              "Share progress with trusted friends. Private circles that celebrate wins and support comebacks.",
          },
          {
            title: "Time-Based Habits",
            description:
              "Track duration-based activities. Reading, meditation, exercise — log minutes, not just checkmarks.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How It Works"
    const stepsDesc =
      props.steps?.description ?? "Three steps to transformation"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose Your Habits",
            description:
              "Select from 200+ curated templates or create custom habits. Set frequency, reminders, and targets that fit your life.",
          },
          {
            title: "Track Daily",
            description:
              "A delightful check-in experience takes seconds. Widgets, shortcuts, and smart reminders keep you consistent.",
          },
          {
            title: "Grow & Evolve",
            description:
              "Weekly insights show your progress. Celebrate milestones, adjust targets, and build habits that stick.",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "App Gallery"
    const galleryDesc =
      props.gallery?.description ?? "Designed for daily delight"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            alt: "iPhone displaying Zenith habit tracker daily view with circular progress indicators for morning routine habits",
            caption: "Daily Dashboard",
          },
          {
            alt: "iPhone showing Zenith analytics screen with habit completion charts and weekly trend graphs",
            caption: "Insight Analytics",
          },
          {
            alt: "iPhone displaying Zenith streak calendar view with colorful completion badges and monthly overview",
            caption: "Streak Calendar",
          },
          {
            alt: "iPhone showing Zenith achievement badges screen with earned milestone rewards and trophy collection",
            caption: "Achievements",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "500K+", label: "Active Users", accent: false },
          { value: "12M+", label: "Habits Tracked", accent: true },
          { value: "4.9", label: "App Store Rating", accent: false },
          { value: "89%", label: "Retention Rate", accent: true },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ??
      "Lives transformed, one habit at a time"
    const testimonialsDesc = props.testimonials?.description ?? ""
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              '"Zenith helped me build a meditation practice that stuck. After 90 days, I\'m calmer, more focused, and finally consistent. The streak recovery feature saved me during a family emergency."',
            name: "Sarah Chen",
            role: "VP Marketing, Stripe",
            avatarAlt:
              "Professional headshot of Sarah Chen, a marketing executive with shoulder-length dark hair and warm smile",
          },
          {
            quote:
              "\"As a founder, my schedule is chaotic. Zenith's flexibility let me adapt my habits without guilt. The analytics showed me my peak performance hours — game changer for productivity.\"",
            name: "Marcus Rodriguez",
            role: "CEO, Nexus Labs",
            avatarAlt:
              "Professional headshot of Marcus Rodriguez, a tech founder with short curly hair and confident expression",
          },
          {
            quote:
              '"The Family plan transformed our household. We track shared goals like \'eat dinner together\' and \'weekend walks.\' Seeing our collective progress brought us closer. Worth every penny."',
            name: "Elena Vasquez",
            role: "Family Therapist",
            avatarAlt:
              "Professional headshot of Elena Vasquez, a therapist with long wavy hair and warm approachable smile",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free. Upgrade when you're ready to go deeper."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Free",
            tagline: "Perfect for getting started",
            price: "$0",
            period: "/month",
            cta: "Get Started",
            featured: false,
            features: [
              "Up to 5 habits",
              "Basic reminders",
              "7-day history",
              "Streak tracking",
            ],
          },
          {
            name: "Pro",
            tagline: "Billed annually ($59.88/year)",
            price: "$4.99",
            period: "/month",
            cta: "Start Free Trial",
            featured: true,
            features: [
              "Unlimited habits",
              "Advanced analytics",
              "Unlimited history",
              "Widgets & shortcuts",
              "Export data (CSV/JSON)",
            ],
          },
          {
            name: "Family",
            tagline: "Billed annually ($119.88/year)",
            price: "$9.99",
            period: "/month",
            cta: "Get Started",
            featured: false,
            features: [
              "Everything in Pro",
              "Up to 6 family members",
              "Shared group habits",
              "Family insights",
            ],
          },
        ]

    const faqHeading = props.faq?.heading ?? "Questions answered"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Can I use Zenith for free?",
            answer:
              "Yes! The free plan includes up to 5 habits, basic reminders, 7-day history, and streak tracking. It's perfect for starting your habit journey. Upgrade to Pro when you're ready for unlimited habits and deeper analytics.",
          },
          {
            question: "What happens if I break a streak?",
            answer:
              'Life happens. Pro users get 3 "Rest Days" per month that protect your streak. You can also use Recovery Mode to rebuild after a break without losing sight of your long-term progress. We believe in compassion, not perfection.',
          },
          {
            question: "Can I export my data?",
            answer:
              "Pro and Family plans include full data export in CSV and JSON formats. Your data belongs to you. We also offer API access for power users who want to integrate with other tools.",
          },
          {
            question: "Is my data private and secure?",
            answer:
              "Absolutely. Your data is encrypted at rest and in transit. We never sell your information. Pro users can enable end-to-end encryption for sensitive habits. We're SOC 2 Type II certified and GDPR compliant.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes, cancel anytime with no questions asked. If you cancel, you'll keep Pro access until your billing period ends. We also offer a 30-day money-back guarantee if Zenith isn't right for you.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Begin your transformation today"
    const ctaDesc =
      props.cta?.description ??
      "Join 500,000+ people building better lives, one habit at a time. Free forever to start."
    const ctaAppStore = props.cta?.appStoreLabel ?? "App Store"
    const ctaGooglePlay = props.cta?.googlePlayLabel ?? "Google Play"

    const footerTagline =
      props.footer?.tagline ??
      "Beautiful habit tracking for people who care about intentional living."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Roadmap"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies"],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Habits Inc. All rights reserved.`

    const BrandLogo = ({ className }: { className?: string }) => (
      <div
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="size-5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )

    const AppleIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.303 2.303-8.633-8.635z" />
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

    const featureIcons = [
      <svg
        key="check"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>,
      <svg
        key="flame"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>,
      <svg
        key="heart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg
        key="clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const iconStyles = [
      { bg: "bg-primary/10", text: "text-primary" },
      { bg: "bg-muted", text: "text-muted-foreground" },
      { bg: "bg-accent/10", text: "text-accent" },
      { bg: "bg-destructive/10", text: "text-destructive" },
      { bg: "bg-secondary/10", text: "text-secondary" },
      { bg: "bg-chart-3/10", text: "text-chart-3" },
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <BrandLogo />
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
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
              </div>
              <div className="flex items-center gap-4">
                {nav.length > 1 && (
                  <button
                    type="button"
                    onClick={() => go(nav[nav.length - 1])}
                    className="hidden items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                  >
                    {nav[nav.length - 1]}
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6"
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
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-muted via-background to-accent/10"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                    <span className="inline-block size-2 rounded-full bg-primary" />
                    {hero.badge}
                  </div>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {hero.headingTop}
                    <br />
                    <span className="text-primary">{hero.headingAccent}</span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                    {hero.subheading}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(hero.appStoreLabel)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <AppleIcon />
                      <div className="text-left">
                        <div className="text-[10px] uppercase tracking-wider opacity-80">
                          Download on the
                        </div>
                        <div className="text-sm font-semibold -mt-0.5">
                          {hero.appStoreLabel}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(hero.googlePlayLabel)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-muted px-6 py-3 text-foreground transition-colors hover:bg-muted/80"
                    >
                      <PlayIcon />
                      <div className="text-left">
                        <div className="text-[10px] uppercase tracking-wider opacity-80">
                          Get it on
                        </div>
                        <div className="text-sm font-semibold -mt-0.5">
                          {hero.googlePlayLabel}
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    <span className="flex items-center gap-1.5">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-4 text-primary"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {hero.rating}
                    </span>
                    <span className="inline-block size-1 rounded-full bg-muted-foreground/40" />
                    <span>{hero.downloads}</span>
                  </div>
                </div>
                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative">
                    <div
                      className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-accent/20 to-muted opacity-60 blur-2xl"
                      aria-hidden="true"
                    />
                    <Image
                      alt={hero.imageAlt}
                      w={400}
                      h={800}
                      className="relative w-64 rounded-[2.5rem] border-8 border-foreground object-cover shadow-2xl sm:w-72 lg:w-80"
                    />
                    <div className="absolute -bottom-4 -left-8 hidden rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full bg-accent/10">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="size-5 text-accent"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-card-foreground">
                            {hero.streakTitle}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {hero.streakLabel}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60">
                {logoItems.map((logo) => (
                  <span
                    key={logo}
                    className="text-lg font-semibold text-muted-foreground"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted/30 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Features
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => {
                  const style = iconStyles[i % iconStyles.length]
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div
                        className={cn(
                          "mb-6 grid size-12 place-items-center rounded-xl",
                          style.bg,
                          style.text,
                        )}
                      >
                        {featureIcons[i]}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {stepsHeading}
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div
                      className={cn(
                        "mx-auto mb-6 grid size-16 place-items-center rounded-2xl text-2xl font-bold",
                        i === 1
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {i < stepItems.length - 1 && (
                      <div className="absolute left-full top-8 hidden h-px w-full -translate-x-1/2 bg-border md:block">
                        <div className="absolute -top-1 right-0 size-2 rounded-full bg-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  App Gallery
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {galleryItems.map((item) => (
                  <div
                    key={item.alt}
                    className="rounded-2xl bg-card p-4 shadow-sm"
                  >
                    <Image
                      alt={item.alt}
                      w={300}
                      h={600}
                      loading="lazy"
                      className="w-full rounded-xl object-cover"
                    />
                    {item.caption && (
                      <p className="mt-4 text-center text-sm font-medium text-card-foreground">
                        {item.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div
                      className={cn(
                        "mb-2 text-4xl font-bold sm:text-5xl",
                        s.accent ? "text-primary" : "text-card-foreground",
                      )}
                    >
                      {s.value}
                    </div>
                    <div className="text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Stories
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-2xl bg-muted/30 p-8">
                    <div className="mb-6 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <svg
                          key={idx}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="size-5 text-primary"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground/80">
                      {t.quote}
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Pricing
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.featured
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background",
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3
                      className={cn(
                        "text-lg font-semibold",
                        tier.featured
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          tier.featured
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      <span
                        className={cn(
                          tier.featured
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.period}
                      </span>
                    </div>
                    {tier.tagline && (
                      <p
                        className={cn(
                          "mt-2 text-sm",
                          tier.featured
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.tagline}
                      </p>
                    )}
                    <ul className="mt-6 space-y-4">
                      {tier.features?.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <CheckIcon
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              tier.featured
                                ? "text-primary-foreground"
                                : "text-primary",
                            )}
                          />
                          <span
                            className={cn(
                              tier.featured
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground",
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
                        "mt-8 w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "bg-muted text-foreground hover:bg-muted/80",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/30 py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  FAQ
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-muted/50">
                      <span className="font-semibold text-card-foreground">
                        {item.question}
                      </span>
                      <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-180">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="size-5"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-card-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaAppStore)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-background px-6 py-4 text-foreground transition-colors hover:bg-muted"
                >
                  <AppleIcon />
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-wider opacity-70">
                      Download on the
                    </div>
                    <div className="text-lg font-semibold -mt-0.5">
                      {ctaAppStore}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaGooglePlay)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-muted px-6 py-4 text-foreground transition-colors hover:bg-muted/80"
                >
                  <PlayIcon />
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-wider opacity-70">
                      Get it on
                    </div>
                    <div className="text-lg font-semibold -mt-0.5">
                      {ctaGooglePlay}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-card py-16" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <BrandLogo />
                  <span className="text-xl font-semibold text-card-foreground">
                    {brand}
                  </span>
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {footerTagline}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-card-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-card-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerNote}</p>
              <div className="flex items-center gap-4">
                {([
                  "Twitter",
                  "GitHub",
                  "Instagram",
                ] as const).map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {social === "Twitter" && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    )}
                    {social === "GitHub" && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    {social === "Instagram" && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    )}
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
