import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MobileAppKimiPage — a complete, self-contained mobile-app LANDING / marketing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "DailyFlow" habit-tracker app
 * site: a clean, minimalist, light aesthetic with calm neutral surfaces, soft
 * rounded cards, phone-mockup imagery and floating UI chip overlays. It pairs a
 * split hero (status pill + App Store / Google Play download buttons + avatar
 * social proof + phone mockup with floating streak/done chips), a "featured in"
 * press logo strip, a 6-up feature grid with icon tiles, a 3-step "how it works"
 * walkthrough with phone screenshots, a masonry app-screenshot gallery, an
 * inverted stats band, a 6-up testimonials grid with star ratings, a 3-tier
 * pricing table (Free / Pro / Teams) with a highlighted popular plan, an
 * accordion FAQ, a final download CTA with trust badges, and a multi-column
 * footer with product/company/support link groups and social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item,
 * CTA, download button, footer link, social icon and form-submit routes through
 * `useNavigate` (never a dead "#"). All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const MobileAppKimiPage = defineComponent({
  name: "MobileAppKimiPage",
  description:
    "Complete mobile-app / SaaS-app marketing LANDING page with a clean, minimalist, light aesthetic: calm neutral surfaces, soft rounded cards, phone-mockup imagery and floating UI chips. Includes a split hero (status badge, headline, App Store + Google Play download buttons, avatar social proof, phone mockup with floating streak/done overlays), a 'featured in' press-logo strip, a 6-up feature grid with icon tiles, a numbered 3-step 'how it works' walkthrough with phone screenshots, a masonry app-screenshot gallery, an inverted big-number stats band, a 6-up testimonials grid with star ratings and avatars, a 3-tier pricing table (Free / Pro / Teams) with a highlighted most-popular plan and feature checklists, an expandable FAQ accordion, a final app-download CTA with trust badges, and a multi-column footer (Product / Company / Support) with social icons. Use as the ROOT/home page for a consumer mobile app, habit tracker, fitness/wellness/meditation app, productivity or to-do app, iOS/Android app launch, or any App-Store-distributed product site when a friendly, conversion-focused page with download CTAs, app screenshots and social proof is wanted. Supply content only — brand, nav, hero, features, steps, gallery, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
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
        imageAlt: z.string().optional(),
        chipTitle: z.string().optional(),
        chipSubtitle: z.string().optional(),
        streakValue: z.string().optional(),
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
    /** App-screenshot gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Inverted big-number stats band. */
    stats: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
              features: z
                .array(z.object({ label: z.string(), included: z.boolean() }))
                .optional(),
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
    /** Final download CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
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
        note: z.string().optional(),
        madeIn: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "DailyFlow"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Reviews", "Download App"]

    const heroBadge = props.hero?.badge ?? "Trusted by 50,000+ habit builders"
    const heroTop = props.hero?.headingTop ?? "Build better habits,"
    const heroBottom = props.hero?.headingBottom ?? "one day at a time"
    const heroSub =
      props.hero?.subheading ??
      "DailyFlow helps you create lasting routines with gentle reminders, visual streak tracking, and insights that actually make sense. No guilt, no pressure—just progress."
    const heroPrimary = props.hero?.primaryCta ?? "App Store"
    const heroSecondary = props.hero?.secondaryCta ?? "Google Play"
    const heroSocialProof =
      props.hero?.socialProof ?? "Joined by 12,847 people this month"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "iPhone displaying a habit tracking mobile app interface with daily progress circles"
    const chipTitle = props.hero?.chipTitle ?? "Morning Meditation"
    const chipSubtitle = props.hero?.chipSubtitle ?? "Done at 7:23 AM"
    const streakValue = props.hero?.streakValue ?? "24"
    const streakLabel = props.hero?.streakLabel ?? "day streak"

    const logosLabel = props.logos?.label ?? "Featured in"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["TechCrunch", "Product Hunt", "Wired", "The Verge", "Fast Company"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to succeed"
    const featuresDesc =
      props.features?.description ??
      "We've stripped away the complexity. DailyFlow gives you just the right tools to build habits that stick—without the overwhelm."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Reminders",
            description:
              "Gentle nudges at the right time. Our AI learns your routine and suggests optimal moments for each habit.",
          },
          {
            title: "Visual Progress",
            description:
              "Beautiful charts and streak counters that make every small win feel meaningful and motivating.",
          },
          {
            title: "Self-Compassion Mode",
            description:
              "Miss a day? No problem. We don't break streaks for small slips—life happens, and we get it.",
          },
          {
            title: "Accountability Groups",
            description:
              "Join small groups of 3-5 people with similar goals. Share progress and celebrate wins together.",
          },
          {
            title: "Dark Mode",
            description:
              "Easy on the eyes, day or night. Automatic switching based on your system preferences.",
          },
          {
            title: "Widget Support",
            description:
              "Track habits right from your home screen with beautiful iOS and Android widgets.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How it works"
    const stepsDesc =
      props.steps?.description ??
      "Get started in less than 60 seconds. No complicated setup, no lengthy onboarding."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose your habits",
            description:
              "Pick from 50+ curated templates or create your own. From drinking more water to reading 10 pages—start small.",
            imageAlt:
              "iPhone displaying habit selection screen with colorful habit icons in a grid layout",
          },
          {
            title: "Set your schedule",
            description:
              "Daily, weekdays only, or just twice a week? You decide. We'll remind you only when it matters.",
            imageAlt:
              "Smartphone showing a scheduling app interface with time selection and reminder settings",
          },
          {
            title: "Track & grow",
            description:
              "Check off habits with a tap. Watch your streaks build and celebrate milestones along the way.",
            imageAlt:
              "Smartphone showing habit tracking completion screen with checkmarks and progress statistics",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "See DailyFlow in action"
    const galleryDesc =
      props.gallery?.description ??
      "A clean, intuitive interface designed to keep you focused on what matters—your progress."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "iPhone displaying habit tracking app dashboard with weekly progress overview and daily check-in circles",
          "Tablet showing detailed habit analytics dashboard with charts and monthly statistics",
          "Smartphone showing habit creation interface with custom reminder time picker",
          "iPhone displaying streak celebration screen with confetti animation and achievement badge",
          "Mobile app showing accountability group chat with habit progress updates from team members",
          "Laptop screen displaying habit heat map visualization over a full year",
          "Smartphone dark mode interface showing evening habit checklist with muted colors",
          "iPhone widget on home screen displaying today's habit completion status at a glance",
        ]

    const statsHeading = props.stats?.heading ?? "Numbers that speak"
    const statsDesc =
      props.stats?.description ??
      "Join thousands of people who are transforming their lives one habit at a time."
    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50,000+", label: "Active users building habits" },
          { value: "2.8M", label: "Habits completed monthly" },
          { value: "87%", label: "Users report lasting change" },
          { value: "4.9", label: "App Store rating (12K reviews)" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by habit builders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what our community has to say about their DailyFlow journey."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "DailyFlow is the only habit tracker that didn't make me feel guilty for missing a day. I've meditated for 45 days straight now—the longest streak of my life.",
            name: "Sarah Chen",
            role: "Product Manager at Stripe",
            avatarAlt:
              "Professional headshot of Sarah Chen, a smiling woman with dark hair wearing a blue blouse",
          },
          {
            quote:
              "The accountability groups changed everything. Having 3 other people cheering me on made me actually stick to my morning workouts for the first time ever.",
            name: "Marcus Johnson",
            role: "Software Engineer at Google",
            avatarAlt:
              "Professional headshot of Marcus Johnson, a man with short curly hair and glasses wearing a gray sweater",
          },
          {
            quote:
              "I've tried 10+ habit apps. DailyFlow is the first one that actually feels peaceful to use. No clutter, no gamification addiction—just pure, simple tracking.",
            name: "Emily Parker",
            role: "UX Designer at Airbnb",
            avatarAlt:
              "Professional headshot of Emily Parker, a woman with blonde hair wearing a white turtleneck",
          },
          {
            quote:
              "The insights feature is incredible. I finally understand which habits trigger my best days. Data-driven self-improvement at its finest.",
            name: "David Kim",
            role: "Founder at TechStart",
            avatarAlt:
              "Professional headshot of David Kim, a man with a well-groomed beard and warm smile",
          },
          {
            quote:
              "As a therapist, I recommend DailyFlow to clients struggling with consistency. It's the only app that focuses on progress over perfection.",
            name: "Dr. Lisa Thompson",
            role: "Clinical Psychologist",
            avatarAlt:
              "Professional headshot of Dr. Lisa Thompson, a woman with shoulder-length brown hair wearing professional attire",
          },
          {
            quote:
              "The widget is a game-changer. I can check off habits without even opening the app. I've now journaled for 90 days straight!",
            name: "Priya Sharma",
            role: "Marketing Director",
            avatarAlt:
              "Professional headshot of Priya Sharma, a young woman with long dark hair and confident expression",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, upgrade when you're ready. No hidden fees, no surprises."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Free",
            tagline: "Perfect for getting started",
            price: "$0",
            period: "/month",
            cta: "Get Started Free",
            featured: false,
            features: [
              { label: "Up to 3 habits", included: true },
              { label: "Basic reminders", included: true },
              { label: "7-day streak history", included: true },
              { label: "Accountability groups", included: false },
              { label: "Advanced insights", included: false },
            ],
          },
          {
            name: "Pro",
            tagline: "For serious habit builders",
            price: "$4.99",
            period: "/month",
            cta: "Start 14-Day Free Trial",
            featured: true,
            features: [
              { label: "Unlimited habits", included: true },
              { label: "Smart AI reminders", included: true },
              { label: "Unlimited history", included: true },
              { label: "Accountability groups", included: true },
              { label: "Advanced insights & export", included: true },
            ],
          },
          {
            name: "Teams",
            tagline: "For organizations",
            price: "$12",
            period: "/user/month",
            cta: "Contact Sales",
            featured: false,
            features: [
              { label: "Everything in Pro", included: true },
              { label: "Team challenges", included: true },
              { label: "Admin dashboard", included: true },
              { label: "SSO integration", included: true },
              { label: "Priority support", included: true },
            ],
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about DailyFlow."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Can I switch between plans at any time?",
            answer:
              "Yes, absolutely. You can upgrade, downgrade, or cancel your subscription at any time. If you downgrade from Pro to Free, you'll keep your Pro features until the end of your billing period.",
          },
          {
            question: "What happens to my data if I cancel?",
            answer:
              "Your data belongs to you. Even on the Free plan, we keep your last 7 days of history. If you decide to come back, everything will be right where you left it. You can also export all your data at any time.",
          },
          {
            question: "Is there a daily reminder limit?",
            answer:
              "Free users get 1 reminder per habit per day. Pro users get unlimited smart reminders that adapt to your schedule. Our AI learns when you're most likely to complete a habit and optimizes reminder timing accordingly.",
          },
          {
            question: "How do accountability groups work?",
            answer:
              "You can create or join a group of 3-5 people with similar goals. Everyone shares their daily progress, and you can send encouraging messages. Research shows this increases success rates by 65%.",
          },
          {
            question: "Is my data private and secure?",
            answer:
              "We take privacy seriously. All data is encrypted at rest and in transit. We never sell your data to third parties. Your habit data is only visible to you (and your accountability group members, if you choose to share).",
          },
          {
            question: "Do you offer student or nonprofit discounts?",
            answer:
              "Yes! Students with a valid .edu email get 50% off Pro. Registered nonprofits can get up to 75% off Teams plans. Contact our support team with proof of status to apply.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Start building better habits today"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ people who are transforming their lives one small step at a time. Free forever plan available."
    const ctaPrimary = props.cta?.primaryCta ?? "Download for iOS"
    const ctaSecondary = props.cta?.secondaryCta ?? "Download for Android"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["Free 14-day Pro trial", "No credit card required", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "Building better habits, one day at a time. Join 50,000+ habit builders worldwide."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Changelog", "Roadmap"],
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
    const footerNote =
      props.footer?.note ?? `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerMadeIn = props.footer?.madeIn ?? "Made with care in San Francisco"

    // Brand logo mark (decorative check-in-circle, brand asset).
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

    const AppleIcon = () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    )

    const PlayIcon = () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
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

    const CrossIcon = ({ className }: { className?: string }) => (
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
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    const Star = () => (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-primary" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons = [
      // clock
      <svg key="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // chart
      <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // heart
      <svg key="heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      // users
      <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // moon
      <svg key="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>,
      // phone
      <svg key="phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">{brand}</span>
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
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="hidden items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  {nav[nav.length - 1]}
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
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
          <section className="bg-muted/50 pb-20 pt-32 lg:pb-32 lg:pt-40" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="text-xs font-medium text-muted-foreground">{heroBadge}</span>
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                  >
                    {heroTop}
                    <br />
                    {heroBottom}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <AppleIcon />
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <PlayIcon />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      {[
                        "Professional headshot of a smiling woman with dark hair",
                        "Professional headshot of a man with short curly hair and glasses",
                        "Professional headshot of a woman with blonde hair smiling",
                        "Professional headshot of a man with beard and warm smile",
                      ].map((a) => (
                        <Image
                          key={a}
                          alt={a}
                          w={100}
                          h={100}
                          className="size-8 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <span>{heroSocialProof}</span>
                  </div>
                </div>
                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute -left-4 -top-4 size-72 rounded-full bg-primary/20 opacity-50 blur-3xl"
                    />
                    <Image
                      alt={heroImageAlt}
                      w={400}
                      h={800}
                      className="relative w-72 rounded-[2.5rem] border-8 border-foreground object-cover shadow-2xl sm:w-80 lg:w-96"
                    />
                    <div className="absolute -bottom-6 -right-6 rounded-2xl border border-border bg-card p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full bg-primary/10">
                          <CheckIcon className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">{chipTitle}</p>
                          <p className="text-xs text-muted-foreground">{chipSubtitle}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-4 -top-4 rounded-2xl border border-border bg-card p-3 shadow-xl">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-card-foreground">{streakValue}</p>
                        <p className="text-xs text-muted-foreground">{streakLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured-in logos */}
          <section className="border-b border-border py-12" aria-label="Featured in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {logoItems.map((logo) => (
                  <span key={logo} className="text-xl font-bold text-muted-foreground">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
                <h2
                  id="features-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="group">
                    <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted/50 py-20 lg:py-32" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
                <h2
                  id="steps-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-4 text-6xl font-bold text-muted-foreground/30">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <Image
                      alt={step.imageAlt}
                      w={300}
                      h={600}
                      loading="lazy"
                      className="mx-auto w-full max-w-[200px] rounded-2xl object-cover shadow-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2
                  id="gallery-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {galleryItems.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "overflow-hidden rounded-2xl shadow-lg",
                      i % 2 === 1 && "sm:mt-12",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={400}
                      h={i % 2 === 0 ? 800 : 600}
                      loading="lazy"
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats (inverted band) */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-32" aria-labelledby="stats-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2
                  id="stats-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {statsHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">{statsDesc}</p>
              </div>
              <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold sm:text-5xl">{s.value}</div>
                    <p className="text-primary-foreground/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/50 py-20 lg:py-32" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
                <h2
                  id="testimonials-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
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

          {/* Pricing */}
          <section className="py-20 lg:py-32" aria-labelledby="pricing-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
                <h2
                  id="pricing-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 lg:gap-6">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.featured
                        ? "bg-primary text-primary-foreground md:-mt-4 md:mb-4"
                        : "border border-border bg-card text-card-foreground",
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3 className="mb-2 text-lg font-semibold">{tier.name}</h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        tier.featured
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.tagline}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{tier.price}</span>
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
                    <ul className="mb-8 space-y-4">
                      {tier.features?.map((f) => (
                        <li key={f.label} className="flex items-start gap-3">
                          {f.included ? (
                            <CheckIcon
                              className={cn(
                                "mt-0.5 size-5 shrink-0",
                                tier.featured
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          ) : (
                            <CrossIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground/40" />
                          )}
                          <span
                            className={cn(
                              f.included
                                ? tier.featured
                                  ? "text-primary-foreground/90"
                                  : "text-muted-foreground"
                                : "text-muted-foreground/60",
                            )}
                          >
                            {f.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "bg-muted text-foreground hover:bg-accent",
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
          <section className="bg-muted/50 py-20 lg:py-32" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="faq-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold text-card-foreground">
                        {item.question}
                      </span>
                      <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-180">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
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

          {/* Download CTA */}
          <section className="py-20 lg:py-32" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                {ctaDesc}
              </p>
              <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <AppleIcon />
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <PlayIcon />
                  {ctaSecondary}
                </button>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                {ctaBadges.map((badge) => (
                  <span key={badge} className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-primary" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-12 lg:py-16" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-semibold tracking-tight">{brand}</span>
                </button>
                <p className="mb-6 max-w-xs text-muted-foreground">{footerTagline}</p>
                <div className="flex gap-4">
                  {(["Twitter", "Instagram", "LinkedIn"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {social === "Twitter" && (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      {social === "Instagram" && (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      )}
                      {social === "LinkedIn" && (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
                  <ul className="space-y-3">
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerNote}</p>
              <p className="text-sm text-muted-foreground">{footerMadeIn}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
