import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MobileAppKimiPage4 — a complete, self-contained mobile-app LANDING / marketing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Habitude" habit-tracker app
 * site (v04): an editorial, warm-minimalist light aesthetic with serif headlines,
 * generous whitespace, and earthy depth. It pairs a split hero (pill badge +
 * serif headline + App Store / Google Play download buttons with nested labels +
 * star-rating social proof + a phone mockup in a dark bezel with a floating
 * streak-notification card), a "featured in" press-logo strip, a 6-up feature
 * grid with icon tiles, a 3-step "how it works" walkthrough with numbered
 * watermarks and step images, a staggered gallery of four phone-mockup frames,
 * a 3-tier pricing table (Free / Pro / Family) with a highlighted popular plan
 * and feature checklists, an inverted big-number stats band, a 6-up
 * testimonials grid with star ratings and avatar headshots, an accordion FAQ,
 * a final download CTA with the same store buttons as the hero, and a dark
 * multi-column footer with product/company/support link groups and social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item,
 * CTA, download button, footer link, social icon and form-submit routes through
 * `useNavigate` (never a dead "#"). All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 *
 * This is the FOURTH style sibling to MobileAppKimiPage — use it when you want
 * an editorial serif-led page with a warm, gentle mood, darker inverted stats
 * and footer, phone-mockup gallery frames, and staggered step layouts.
 */
export const MobileAppKimiPage4 = defineComponent({
  name: "MobileAppKimiPage4",
  description:
    "Complete mobile-app / SaaS-app marketing LANDING page with an editorial, warm-minimalist light aesthetic: serif headline hierarchy, generous whitespace, earthy depth, phone mockup imagery in dark bezels, and floating UI chips. Includes a split hero (rounded pill badge, serif headline, App Store + Google Play download buttons with nested labels, star-rating social proof, phone mockup with floating streak-notification card), a 'featured in' press-logo strip, a 6-up feature grid with icon tiles, a numbered 3-step 'how it works' walkthrough with oversized watermark numbers and step images, a staggered gallery of four phone-mockup frames, a 3-tier pricing table (Free / Pro / Family) with a highlighted most-popular plan and feature checklists, an inverted big-number stats band, a 6-up testimonials grid with star ratings and avatar headshots, an expandable FAQ accordion, a final app-download CTA with trust badges, and a dark multi-column footer (Product / Company / Support) with social icons. This is the fourth style sibling to MobileAppKimiPage. Use as the ROOT/home page for a consumer mobile app, habit tracker, fitness/wellness/meditation app, productivity or to-do app, iOS/Android app launch, or any App-Store-distributed product site when an editorial, warm, conversion-focused page with serif headings, download CTAs, app screenshots and social proof is wanted. Supply content only — brand, nav, hero, features, steps, gallery, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / app name shown in the navbar and footer. */
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
        appleSubLabel: z.string().optional(),
        appleLabel: z.string().optional(),
        playSubLabel: z.string().optional(),
        playLabel: z.string().optional(),
        appStoreRating: z.string().optional(),
        playStoreRating: z.string().optional(),
        imageAlt: z.string().optional(),
        chipTitle: z.string().optional(),
        chipSubtitle: z.string().optional(),
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
        preheading: z.string().optional(),
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
        preheading: z.string().optional(),
        heading: z.string().optional(),
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
    /** App-screenshot gallery (phone mockup frames). */
    gallery: z
      .object({
        preheading: z.string().optional(),
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        preheading: z.string().optional(),
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
    /** Inverted big-number stats band. */
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
        preheading: z.string().optional(),
        heading: z.string().optional(),
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
        preheading: z.string().optional(),
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
        note: z.string().optional(),
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
    const brand = props.brand ?? "Habitude"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Reviews", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Over 2 million habits formed"
    const heroHeading =
      props.hero?.heading ?? "Build better habits, one day at a time"
    const heroSub =
      props.hero?.subheading ??
      "Habitude helps you track, build, and maintain lasting habits with beautiful simplicity. Join millions transforming their daily routines."
    const heroPrimaryCta = props.hero?.primaryCta ?? "App Store"
    const heroSecondaryCta = props.hero?.secondaryCta ?? "Google Play"
    const appleSubLabel =
      props.hero?.appleSubLabel ?? "Download on the"
    const appleLabel = props.hero?.appleLabel ?? "App Store"
    const playSubLabel = props.hero?.playSubLabel ?? "GET IT ON"
    const playLabel = props.hero?.playLabel ?? "Google Play"
    const appStoreRating = props.hero?.appStoreRating ?? "4.9"
    const playStoreRating = props.hero?.playStoreRating ?? "4.8"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Habitude mobile app interface showing daily habit tracking dashboard with streak counters and progress rings"
    const chipTitle = props.hero?.chipTitle ?? "7-day streak!"
    const chipSubtitle = props.hero?.chipSubtitle ?? "Keep it up, Sarah"

    const logosLabel = props.logos?.label ?? "Featured in"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["TechCrunch", "Wired", "Fast Company", "Forbes", "The Verge"]

    const featuresPreheading =
      props.features?.preheading ?? "Features"
    const featuresHeading =
      props.features?.heading ??
      "Everything you need to build lasting habits"
    const featuresDesc =
      props.features?.description ??
      "Simple yet powerful tools designed to help you stay consistent and motivated on your journey to self-improvement."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Reminders",
            description:
              "Get intelligent nudges at the right time based on your schedule and past behavior. Never forget a habit again.",
          },
          {
            title: "Visual Progress",
            description:
              "Beautiful charts and streak counters that make tracking your progress addictive. Watch your consistency grow.",
          },
          {
            title: "Flexible Scheduling",
            description:
              "Set habits for specific days, times, or intervals. Morning meditation on weekdays? Evening walks on weekends? Done.",
          },
          {
            title: "Accountability Groups",
            description:
              "Build habits together with friends and family. Share progress, send encouragement, and stay motivated as a team.",
          },
          {
            title: "Mindful Journaling",
            description:
              "Add notes and reflections to each habit completion. Track not just what you did, but how you felt doing it.",
          },
          {
            title: "Widget Support",
            description:
              "Track habits directly from your home screen. Mark habits complete without even opening the app.",
          },
        ]

    const stepsPreheading = props.steps?.preheading ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ??
      "Start building habits in three simple steps"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create Your Habits",
            description:
              "Choose from our library of 200+ pre-made habits or create your own custom routines. Set reminders, frequency, and goals.",
            imageAlt:
              "Person holding smartphone creating a new habit in a habit tracking app",
          },
          {
            title: "Track Daily Progress",
            description:
              "Check off habits as you complete them. See your streak grow and earn achievement badges for consistency milestones.",
            imageAlt:
              "Runner checking fitness progress on smartwatch during outdoor workout",
          },
          {
            title: "Reflect & Improve",
            description:
              "Review detailed insights and weekly reports. Adjust your approach and celebrate your wins with personalized summaries.",
            imageAlt:
              "Analytics dashboard showing colorful charts and graphs tracking progress",
          },
        ]

    const galleryPreheading =
      props.gallery?.preheading ?? "Gallery"
    const galleryHeading =
      props.gallery?.heading ?? "Designed for focus and clarity"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "Habitude app home screen showing daily habit checklist with completion checkmarks",
          "Habitude weekly progress analytics showing bar charts and completion percentages",
          "Habitude habit streak celebration screen showing confetti animation and milestone badge",
          "Habitude app settings screen with reminder time picker and notification preferences",
        ]

    const pricingPreheading =
      props.pricing?.preheading ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and upgrade when you're ready. No hidden fees, cancel anytime."
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
              { label: "Up to 5 habits", included: true },
              { label: "Basic reminders", included: true },
              { label: "7-day streak view", included: true },
              { label: "Widgets", included: false },
              { label: "Data export", included: false },
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
              { label: "Smart reminders", included: true },
              { label: "Full history & insights", included: true },
              { label: "Home screen widgets", included: true },
              { label: "Data export (CSV, PDF)", included: true },
            ],
          },
          {
            name: "Family",
            tagline: "Share with up to 5 people",
            price: "$9.99",
            period: "/month",
            cta: "Choose Family Plan",
            featured: false,
            features: [
              { label: "Everything in Pro", included: true },
              { label: "5 family members", included: true },
              { label: "Shared group habits", included: true },
              { label: "Family progress reports", included: true },
              { label: "Priority support", included: true },
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2M+", label: "Active users worldwide" },
          { value: "18M", label: "Habits completed monthly" },
          { value: "847K", label: "30+ day streaks achieved" },
          { value: "4.9", label: "Average App Store rating" },
        ]

    const testimonialsPreheading =
      props.testimonials?.preheading ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ??
      "Loved by habit builders everywhere"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Habitude completely changed how I approach my morning routine. I'm now at 94 days of meditation and have never felt more centered. The streak feature is surprisingly motivating!",
            name: "Sarah Chen",
            role: "Marketing Director, Austin",
            avatarAlt:
              "Professional headshot of Sarah Chen, a smiling marketing director with shoulder-length dark hair",
          },
          {
            quote:
              "As a software engineer, I've tried every habit app out there. Habitude is the only one that stuck. The minimalist design keeps me focused without overwhelming features.",
            name: "Marcus Johnson",
            role: "Software Engineer, Seattle",
            avatarAlt:
              "Professional headshot of Marcus Johnson, a software engineer with glasses and a friendly smile",
          },
          {
            quote:
              "I use the Family plan with my three teenagers. We've built evening routines together and it's reduced our daily stress significantly. The group accountability is brilliant.",
            name: "Dr. Elena Rodriguez",
            role: "Clinical Psychologist, Miami",
            avatarAlt:
              "Professional headshot of Dr. Elena Rodriguez, a psychologist with warm brown eyes and a confident expression",
          },
          {
            quote:
              "The data export feature is a game changer. I pull my habit data into my annual review and can literally see my personal growth. Worth every penny of the Pro subscription.",
            name: "James Nakamura",
            role: "Product Manager, San Francisco",
            avatarAlt:
              "Professional headshot of James Nakamura, a product manager with a neat beard and professional attire",
          },
          {
            quote:
              "Training for a marathon requires consistency. Habitude keeps me accountable for my daily runs, foam rolling, and hydration goals. Hit my PR last month!",
            name: "Aisha Patel",
            role: "Marathon Runner, Chicago",
            avatarAlt:
              "Professional headshot of Aisha Patel, an athletic training coach with a bright smile and ponytail",
          },
          {
            quote:
              "Started journaling daily two years ago thanks to Habitude. The journaling feature lets me tag entries with mood and weather—looking back at patterns has been incredibly insightful.",
            name: "Thomas Berg",
            role: "Author, Copenhagen",
            avatarAlt:
              "Professional headshot of Thomas Berg, an author with silver hair and a thoughtful expression",
          },
        ]

    const faqPreheading = props.faq?.preheading ?? "FAQ"
    const faqHeading =
      props.faq?.heading ?? "Questions? We've got answers."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Can I use Habitude for free forever?",
            answer:
              "Absolutely! Our free tier lets you track up to 5 habits with basic reminders and a 7-day streak view. Many users find this sufficient for building their core routines. Upgrade anytime when you need more.",
          },
          {
            question: "How does the 14-day free trial work?",
            answer:
              "Start your Pro trial instantly—no credit card required. You'll get full access to unlimited habits, widgets, and data export. At the end of 14 days, choose to upgrade or continue with the free plan. Your data stays intact either way.",
          },
          {
            question: "Can I share habits with my partner or family?",
            answer:
              "Yes! Our Family plan supports up to 5 members with shared group habits. Create a \"Family Walk\" habit and see when everyone completes it. Perfect for building routines together with your household.",
          },
          {
            question: "What happens to my data if I cancel?",
            answer:
              "Your data is yours forever. If you cancel Pro, you'll keep all historical data but return to free tier limits (5 active habits). We never delete your past completions—you can export everything before downgrading.",
          },
          {
            question: "Is my data private and secure?",
            answer:
              "Completely. We use industry-standard encryption, never sell your data, and store everything securely in the cloud with automatic backups. Your habit data syncs across devices but stays encrypted in transit and at rest.",
          },
          {
            question: "Do you offer student or non-profit discounts?",
            answer:
              "Yes! Students with a valid .edu email get 50% off Pro. Verified non-profits receive our Family plan at the Pro price. Contact our support team with proof of status and we'll apply the discount immediately.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to build better habits?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2 million people who have already transformed their daily routines. Start your journey today."
    const ctaNote =
      props.cta?.note ??
      "Free to download. Pro trial available. No credit card required."

    const footerTagline =
      props.footer?.tagline ??
      "Build better habits, one day at a time. The simplest, most beautiful habit tracker for iOS and Android."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Download", "Changelog"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press Kit"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "Privacy Policy",
              "Terms of Service",
            ],
          },
        ]
    const footerNote =
      props.footer?.note ?? `© 2026 ${brand}, Inc. All rights reserved.`
    const footerMadeIn =
      props.footer?.madeIn ?? "Made with care in San Francisco, CA"

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
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-7"
        aria-hidden="true"
      >
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

    const ChevronDownIcon = ({ className }: { className?: string }) => (
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
        <path d="M19 9l-7 7-7-7" />
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
      // clipboard-check
      <svg key="clipboard" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>,
      // chart-line
      <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>,
      // clock
      <svg key="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // users
      <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // heart
      <svg key="heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      // smartphone
      <svg key="phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
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
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="font-serif text-2xl font-semibold tracking-tight">
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
                  onClick={() => go("Get the App")}
                  className="hidden items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  Get the App
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
          <section className="pb-20 pt-32 lg:pb-32 lg:pt-40" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="text-center lg:text-left">
                  <span className="mb-6 inline-block rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-foreground">
                    {heroBadge}
                  </span>
                  <h1
                    id="hero-heading"
                    className="mb-6 font-serif text-5xl font-semibold leading-tight tracking-tight lg:text-7xl"
                  >
                    {heroHeading}
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0 lg:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimaryCta)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <AppleIcon />
                      <div className="text-left">
                        <div className="text-xs opacity-80">{appleSubLabel}</div>
                        <div className="text-lg font-semibold">{appleLabel}</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondaryCta)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-muted px-6 py-4 text-foreground transition-colors hover:bg-accent"
                    >
                      <PlayIcon />
                      <div className="text-left">
                        <div className="text-xs opacity-70">{playSubLabel}</div>
                        <div className="text-lg font-semibold">{playLabel}</div>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    <div className="flex items-center gap-2">
                      <Star />
                      <span className="font-semibold text-foreground">{appStoreRating}</span>
                      <span>App Store</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star />
                      <span className="font-semibold text-foreground">{playStoreRating}</span>
                      <span>Play Store</span>
                    </div>
                  </div>
                </div>
                <div className="relative flex justify-center lg:justify-end">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-muted to-background opacity-100 blur-3xl"
                  />
                  <div className="relative">
                    <div className="mx-auto w-72 lg:w-80">
                      <div className="rounded-[3rem] bg-foreground p-3 shadow-2xl">
                        <div className="overflow-hidden rounded-[2.5rem] bg-background aspect-[9/19]">
                          <Image
                            alt={heroImageAlt}
                            w={400}
                            h={800}
                            className="size-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="absolute -bottom-4 -right-4 hidden rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 place-items-center rounded-full bg-primary/10">
                            <CheckIcon className="size-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-card-foreground">{chipTitle}</p>
                            <p className="text-sm text-muted-foreground">{chipSubtitle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured-in logos */}
          <section className="border-y border-border py-16" aria-label="Featured in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 lg:gap-20">
                {logoItems.map((logo) => (
                  <span
                    key={logo}
                    className="flex items-center gap-2 font-serif text-xl font-semibold text-muted-foreground"
                  >
                    {/* Decorative shape per logo */}
                    {logo === "TechCrunch" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    )}
                    {logo === "Wired" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    )}
                    {logo === "Fast Company" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    {logo === "Forbes" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                        <polygon points="12 2 22 22 2 22" />
                      </svg>
                    )}
                    {logo === "The Verge" && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                      </svg>
                    )}
                    {!logoItems.slice(0, 5).includes(logo) && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24 lg:py-32" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {featuresPreheading}
                </span>
                <h2
                  id="features-heading"
                  className="mt-3 mb-6 font-serif text-4xl font-semibold tracking-tight lg:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-muted text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 font-serif text-xl font-semibold text-card-foreground">
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

          {/* How it works */}
          <section className="bg-card py-24 lg:py-32" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {stepsPreheading}
                </span>
                <h2
                  id="steps-heading"
                  className="mt-3 mb-6 font-serif text-4xl font-semibold tracking-tight lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
              </div>
              <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
                {stepItems.map((step, i) => (
                  <div
                    key={step.title}
                    className={cn(
                      "relative",
                      i === 1 && "lg:mt-12",
                      i === 2 && "lg:mt-24",
                    )}
                  >
                    <div className="absolute -left-2 -top-6 font-serif text-8xl font-bold text-muted-foreground/10">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="relative">
                      <div className="mb-6 aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                        <Image
                          alt={step.imageAlt}
                          w={600}
                          h={450}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </div>
                      <h3 className="mb-3 font-serif text-2xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="overflow-hidden py-24 lg:py-32" aria-label="App screenshots">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {galleryPreheading}
                </span>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight lg:text-5xl">
                  {galleryHeading}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {galleryItems.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "rounded-[2.5rem] bg-foreground p-2 shadow-xl",
                      (i === 1 || i === 3) && "lg:mt-8",
                    )}
                  >
                    <div className="overflow-hidden rounded-[2rem] bg-background aspect-[9/19]">
                      <Image
                        alt={alt}
                        w={300}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-card py-24 lg:py-32" aria-labelledby="pricing-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {pricingPreheading}
                </span>
                <h2
                  id="pricing-heading"
                  className="mt-3 mb-6 font-serif text-4xl font-semibold tracking-tight lg:text-5xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.featured
                        ? "bg-primary text-primary-foreground lg:-mt-4 lg:mb-4"
                        : "border border-border bg-background",
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3 className="font-serif text-2xl font-semibold text-foreground">
                      {tier.name}
                    </h3>
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
                    <div className="mb-8">
                      <span className="font-serif text-5xl font-semibold">
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
                    <ul className="mb-8 space-y-4">
                      {tier.features?.map((f) => (
                        <li key={f.label} className="flex items-center gap-3">
                          {f.included ? (
                            <CheckIcon
                              className={cn(
                                "size-5",
                                tier.featured
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          ) : (
                            <CrossIcon className="size-5 text-muted-foreground/40" />
                          )}
                          <span
                            className={cn(
                              f.included
                                ? tier.featured
                                  ? "text-primary-foreground"
                                  : "text-foreground"
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
                        "w-full rounded-full py-3 px-6 text-sm font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border-2 border-input text-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats (inverted band) */}
          <section className="bg-foreground py-20 text-background lg:py-32" aria-label="Statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 font-serif text-5xl font-semibold lg:text-6xl">
                      {s.value}
                    </div>
                    <p className="text-background/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 lg:py-32" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {testimonialsPreheading}
                </span>
                <h2
                  id="testimonials-heading"
                  className="mt-3 mb-6 font-serif text-4xl font-semibold tracking-tight lg:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card py-24 lg:py-32" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {faqPreheading}
                </span>
                <h2
                  id="faq-heading"
                  className="mt-3 font-serif text-4xl font-semibold tracking-tight lg:text-5xl"
                >
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-6">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group cursor-pointer rounded-xl bg-muted p-6"
                  >
                    <summary className="flex list-none items-center justify-between font-semibold text-lg text-foreground">
                      {item.question}
                      <ChevronDownIcon className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Download CTA */}
          <section className="py-24 lg:py-32" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 font-serif text-4xl font-semibold tracking-tight lg:text-6xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-xl text-muted-foreground">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimaryCta)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <AppleIcon />
                  <div className="text-left">
                    <div className="text-xs opacity-80">{appleSubLabel}</div>
                    <div className="text-lg font-semibold">{appleLabel}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondaryCta)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-muted px-8 py-4 text-foreground transition-colors hover:bg-accent"
                >
                  <PlayIcon />
                  <div className="text-left">
                    <div className="text-xs opacity-70">{playSubLabel}</div>
                    <div className="text-lg font-semibold">{playLabel}</div>
                  </div>
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="font-serif text-2xl font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-background/70">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "Instagram", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                      >
                        {social === "Twitter" && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                          </svg>
                        )}
                        {social === "Instagram" && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        )}
                        {social === "LinkedIn" && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                            <rect x="2" y="9" width="4" height="12" />
                            <circle cx="4" cy="4" r="2" />
                          </svg>
                        )}
                      </button>
                    ),
                  )}
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm text-background/40">{footerNote}</p>
              <p className="text-sm text-background/40">{footerMadeIn}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
