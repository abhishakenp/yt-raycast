import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MobileAppKimiPage7 — a complete, self-contained mobile-app LANDING / marketing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "HabitFlow" habit-tracker app
 * site: a rich, saturated DARK gradient aesthetic with a deep purple/violet
 * gradient page background, frosted-glass card surfaces (backdrop-blur), neon
 * emerald and violet glows, a custom phone-mock-up UI with habit-list and streak
 * tracking, floating achievement/chart chips, a logo bar, a 6-up feature grid
 * with colored icon tiles, a numbered 3-step "how it works" walkthrough with
 * connecting gradient line, an interactive 4-up app gallery, a big-number stats
 * band, a 3-tier pricing table (Free / Pro / Team) with a highlighted popular
 * plan, a 6-up testimonial grid with star ratings, an accordion FAQ, a final
 * download CTA frosted panel, and a multi-column footer with social icons.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item,
 * CTA, download button, footer link, social icon and form-submit routes through
 * `useNavigate` (never a dead "#"). All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */

export const MobileAppKimiPage7 = defineComponent({
  name: "MobileAppKimiPage7",
  description:
    "Complete mobile-app / SaaS-app marketing LANDING page with a rich, dark gradient aesthetic: deep purple/violet gradient surface, frosted-glass card panels with backdrop-blur, neon emerald and violet glow accents. Features a split hero (streak badge + headline + App Store / Google Play download buttons + trust badges, phone mock-up with habit-list UI and floating achievement chips), a 'featured in' press-logo strip, a 6-up feature grid with colored icon tiles, a numbered 3-step 'how it works' walkthrough with a connecting gradient line, a 4-up interactive app gallery with screenshot previews, a big-number stats band, a 3-tier pricing table (Free / Pro / Team) with a highlighted most-popular plan and feature checklists, a 6-up testimonials grid with star ratings and avatars, an accordion FAQ, a final frosted download CTA panel, and a multi-column footer (Product / Company / Resources / Legal) with social icons. This is the 7th distinct visual style variant sibling to MobileAppKimiPage and its other variants (different layout, mood and color direction). Use for consumer habit-tracker, fitness/wellness, productivity or to-do apps, iOS/Android launches, or any App-Store app where a rich, dark, glass-morphism aesthetic with vibrant accent glows is desired.",
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
        trust1: z.string().optional(),
        trust2: z.string().optional(),
      })
      .optional(),
    /** 'Featured in' press-logo strip. */
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
    /** 'How it works' numbered steps. */
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
          .array(
            z.object({
              name: z.string(),
              subtitle: z.string(),
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
    const brand = props.brand ?? "HabitFlow"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Reviews", "FAQ", "Download"]

    const heroBadge =
      props.hero?.badge ?? "Trusted by 2M+ habit builders worldwide"
    const heroTop = props.hero?.headingTop ?? "Build Better Habits,"
    const heroBottom =
      props.hero?.headingBottom ?? "One Day at a Time"
    const heroSub =
      props.hero?.subheading ??
      "Join over 2 million people who have transformed their lives with HabitFlow. Track your daily routines, build unbreakable streaks, and unlock your full potential with personalized insights."
    const heroPrimary = props.hero?.primaryCta ?? "Download for iOS"
    const heroSecondary = props.hero?.secondaryCta ?? "Download for Android"
    const heroTrust1 = props.hero?.trust1 ?? "No credit card required"
    const heroTrust2 = props.hero?.trust2 ?? "14-day free trial"

    const logosLabel =
      props.logos?.label ?? "Featured in leading publications"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "TechCrunch",
          "ProductHunt",
          "Forbes",
          "Wired",
          "Lifehacker",
          "The Verge",
        ]

    const featuresHeading =
      props.features?.heading ?? "Everything You Need to Succeed"
    const featuresDesc =
      props.features?.description ??
      "HabitFlow combines powerful tracking with intelligent insights to help you build habits that actually stick."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Streak Tracking",
            description:
              "Build momentum with visual streak counters. Never break the chain with gentle reminders and celebration animations when you hit milestones.",
          },
          {
            title: "Detailed Analytics",
            description:
              "Track your progress with beautiful charts and insights. See completion rates, trends, and identify your most productive days and times.",
          },
          {
            title: "Smart Reminders",
            description:
              "Get notified at the perfect time based on your routine. AI learns when you're most likely to complete habits and adjusts reminders accordingly.",
          },
          {
            title: "Habit Communities",
            description:
              "Join challenges with friends or like-minded habit builders. Share progress, celebrate wins together, and stay accountable to your goals.",
          },
          {
            title: "Gamification",
            description:
              "Earn badges, unlock achievements, and level up your habit game. Turn self-improvement into an engaging journey with rewards and milestones.",
          },
          {
            title: "Cloud Sync",
            description:
              "Access your habits from any device. Your data automatically syncs across iPhone, Android, iPad, and Web so you never lose your progress.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Build Habits in 3 Easy Steps"
    const stepsDesc =
      props.steps?.description ??
      "Getting started takes less than 60 seconds. Our guided onboarding helps you create your first habit immediately."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create Your Habit",
            description:
              "Choose from 100+ pre-made habit templates or create your own custom routine. Set your target frequency and duration.",
            bullets: ["Daily", "Weekly", "Custom"],
          },
          {
            title: "Track Progress",
            description:
              "Check off habits as you complete them. Add notes, photos, or voice memos to document your journey and reflect on your progress.",
            bullets: [],
          },
          {
            title: "Celebrate Growth",
            description:
              "Watch your streaks grow and earn achievements. Share victories with friends and discover insights about your behavior patterns.",
            bullets: [],
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "See HabitFlow in Action"
    const galleryDesc =
      props.gallery?.description ??
      "Beautifully designed interfaces that make habit tracking a joy. Every screen crafted for clarity and delight."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          { name: "Dashboard Overview", subtitle: "Track weekly progress at a glance" },
          { name: "Habit Details", subtitle: "Calendar view & streak tracking" },
          { name: "Analytics", subtitle: "Deep insights & patterns" },
          { name: "Achievements", subtitle: "Unlock rewards & badges" },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2M+", label: "Active Habit Builders" },
          { value: "50M+", label: "Habits Completed" },
          { value: "4.9", label: "App Store Rating" },
          { value: "180+", label: "Countries Worldwide" },
        ]

    const pricingHeading = props.pricing?.heading ?? "Choose Your Plan"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and upgrade when you're ready. No credit card required to begin your habit journey."
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
              { label: "Basic streak tracking", included: true },
              { label: "Daily reminders", included: true },
              { label: "7-day history", included: true },
              { label: "Advanced analytics", included: false },
              { label: "Community features", included: false },
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
              { label: "Advanced streak tracking", included: true },
              { label: "Smart AI reminders", included: true },
              { label: "Unlimited history", included: true },
              { label: "Full analytics & insights", included: true },
              { label: "Community challenges", included: true },
            ],
          },
          {
            name: "Team",
            tagline: "For organizations & coaches",
            price: "$12.99",
            period: "/user/month",
            cta: "Contact Sales",
            featured: false,
            features: [
              { label: "Everything in Pro", included: true },
              { label: "Team dashboards", included: true },
              { label: "Group challenges", included: true },
              { label: "Admin controls", included: true },
              { label: "SSO & SAML", included: true },
              { label: "Priority support", included: true },
            ],
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by Habit Builders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what our community has to say about their transformation with HabitFlow."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "HabitFlow completely changed my morning routine. I'm now 47 days into meditation and I've never felt more focused. The streak feature keeps me motivated every single day.",
            name: "Sarah Chen",
            role: "Product Manager at Spotify",
            avatarAlt: "Professional headshot of Sarah Chen, a smiling product manager",
          },
          {
            quote:
              "As a startup founder, consistency is everything. HabitFlow helps me maintain my health habits even during crunch time. The analytics help me understand my patterns better.",
            name: "Marcus Johnson",
            role: "CEO at TechStart Inc.",
            avatarAlt: "Professional headshot of Marcus Johnson, a smiling tech entrepreneur",
          },
          {
            quote:
              "I recommend HabitFlow to all my clients. The psychological principles behind the streak feature and gamification actually work. It's not just an app, it's a life changer.",
            name: "Dr. Emily Rodriguez",
            role: "Clinical Psychologist",
            avatarAlt: "Professional headshot of Dr. Emily Rodriguez, a smiling clinical psychologist",
          },
          {
            quote:
              "I lost 30 pounds by tracking my diet and exercise in HabitFlow. The visual progress charts kept me motivated when the scale wasn't moving. Best fitness investment I've made.",
            name: "David Park",
            role: "Personal Trainer & Coach",
            avatarAlt: "Professional headshot of David Park, a smiling fitness trainer",
          },
          {
            quote:
              "The community challenges feature is genius! My friends and I do monthly reading challenges together. The accountability makes all the difference. We've read 15 books this year!",
            name: "Jennifer Walsh",
            role: "Book Club Organizer",
            avatarAlt: "Professional headshot of Jennifer Walsh, a smiling book club organizer",
          },
          {
            quote:
              "I use HabitFlow with my entire team at our marketing agency. We track wellness goals together and it's improved our company culture significantly. The team dashboard is incredibly useful.",
            name: "Michael Torres",
            role: "Marketing Director",
            avatarAlt: "Professional headshot of Michael Torres, a smiling marketing director",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about HabitFlow. Can't find what you're looking for? Contact our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is HabitFlow really free to use?",
            answer:
              "Yes! HabitFlow's core features are completely free forever. You can track up to 3 habits, set basic reminders, and view 7 days of history without paying anything. Our Pro plan unlocks unlimited habits, advanced analytics, and smart reminders for just $4.99/month.",
          },
          {
            question: "Can I use HabitFlow on multiple devices?",
            answer:
              "Absolutely! HabitFlow syncs seamlessly across iPhone, iPad, Android, and Web. Your data is securely backed up to the cloud, so you can check off habits on your phone during the day and review progress on your iPad in the evening. All plans include cloud sync.",
          },
          {
            question: "What happens if I break my streak?",
            answer:
              "Life happens! HabitFlow has a 'Rest Day' feature that lets you pause streaks for vacations or sick days without breaking them. Plus, our research shows that missing one day doesn't hurt habit formation—it's missing two in a row that does. We'll gently nudge you to get back on track.",
          },
          {
            question: "Can I cancel my Pro subscription anytime?",
            answer:
              "Yes, you can cancel your Pro subscription at any time with no questions asked. When you cancel, you'll continue to have Pro access until the end of your billing period, then automatically downgrade to the free plan. Your data is always preserved.",
          },
          {
            question: "How is my data protected?",
            answer:
              "Your privacy is our priority. All data is encrypted in transit and at rest using industry-standard AES-256 encryption. We never sell your data to third parties. HabitFlow is GDPR compliant, and you can export or delete all your data at any time from your account settings.",
          },
          {
            question: "Do you offer student or nonprofit discounts?",
            answer:
              "Yes! We offer a 50% discount for verified students and 30% off for registered nonprofits. Students can verify through SheerID, and nonprofits can contact our sales team with their 501(c)(3) documentation. We believe everyone deserves access to tools that help them grow.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Start Your Habit Journey Today"
    const ctaDesc =
      props.cta?.description ??
      "Join 2 million people building better habits with HabitFlow. Your first 14 days of Pro features are completely free—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Download for iOS"
    const ctaSecondary = props.cta?.secondaryCta ?? "Download for Android"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["Free 14-day trial", "No credit card", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "Building better habits, one day at a time. Join 2 million people transforming their lives through consistent action."
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
            title: "Resources",
            links: ["Help Center", "Community", "Guides", "Webinars", "API Docs"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies", "GDPR"],
          },
        ]
    const footerNote =
      props.footer?.note ?? `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerMadeIn = props.footer?.madeIn ?? "in San Francisco"

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn("text-primary", className)}
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
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.84-.91 1.53.16 2.67 1.15 3.34 2.43-.88.55-1.49 1.42-1.49 2.41 0 1.64 1.34 2.96 3 2.96.34 0 .67-.06.97-.17-.27 1.36-.94 2.69-1.66 3.53zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    )

    const PlayIcon = () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cn("size-5", className)} aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cn("size-5", className)} aria-hidden="true">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )

    const CrossIcon = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cn("size-5", className)} aria-hidden="true">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )

    const ChevronDownIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const BoltIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )

    const ClipboardIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )

    const PhotoIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )

    const TagIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const QuestionIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const MailIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )

    const HeartIcon = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={cn("size-4", className)} aria-hidden="true">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    )

    const featureIcons = [
      <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>,
      <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
    ]

    const socialIcons = [
      <svg key="twitter" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>,
      <svg key="instagram" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>,
      <svg key="linkedin" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>,
      <svg key="youtube" viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>,
    ]

    const glassPanel =
      "backdrop-blur-xl bg-primary-foreground/10 border border-primary-foreground/20"
    const badgePill =
      "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-primary-foreground/10 border border-primary-foreground/20 text-sm font-medium text-primary-foreground/90 mb-4"
    const tierAccent = ["from-accent to-secondary", "from-secondary to-accent", "from-primary to-accent"]
    const galleryAccent = [
      "from-secondary to-primary",
      "from-primary to-secondary",
      "from-accent to-primary",
      "from-accent to-secondary",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-gradient-to-br from-primary via-secondary to-accent font-sans text-primary-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-primary-foreground/20 bg-background/10 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button type="button" onClick={() => go(nav[0])} className="flex items-center gap-2">
                <LogoMark className="size-10" />
                <span className="text-xl font-bold">{brand}</span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="hidden items-center gap-2 rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary-foreground/90 sm:inline-flex shadow-lg"
                >
                  <AppleIcon />
                  {nav[nav.length - 1]}
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-primary-foreground/80 transition-colors hover:text-primary-foreground md:hidden"
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
          <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32" aria-labelledby="hero-heading">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute top-20 left-10 size-72 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute bottom-20 right-10 size-96 rounded-full bg-secondary/20 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground/5 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 backdrop-blur-md">
                    <span className="size-2 animate-pulse rounded-full bg-accent" />
                    <span className="text-sm font-medium text-primary-foreground/90">{heroBadge}</span>
                  </div>

                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl"
                  >
                    {heroTop}
                    <br />
                    <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                      {heroBottom}
                    </span>
                  </h1>

                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-primary-foreground/80 sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>

                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:opacity-90"
                    >
                      <AppleIcon />
                      <span className="text-left">
                        <span className="block text-xs text-primary-foreground/70">Download on the</span>
                        <span className="-mt-0.5 block text-lg font-semibold">{heroPrimary}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:opacity-90"
                    >
                      <PlayIcon />
                      <span className="text-left">
                        <span className="block text-xs text-primary-foreground/70">Get it on</span>
                        <span className="-mt-0.5 block text-lg font-semibold">{heroSecondary}</span>
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-sm text-primary-foreground/60 lg:justify-start">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-5 text-accent" />
                      <span>{heroTrust1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-5 text-accent" />
                      <span>{heroTrust2}</span>
                    </div>
                  </div>
                </div>

                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative">
                    <Image
                      alt="HabitFlow mobile app home screen showing daily habit checklist, streak counter and weekly progress chart"
                      w={640}
                      h={1320}
                      className="w-[280px] rounded-[3rem] border-8 border-primary object-cover shadow-2xl sm:w-[320px]"
                    />
                    {/* Floating achievement chip */}
                    <div className={cn("absolute -top-4 -right-4 rounded-2xl p-3 shadow-xl", glassPanel)}>
                      <div className="flex items-center gap-2">
                        <div className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
                          <CheckIcon className="size-4" />
                        </div>
                        <span className="text-sm font-medium text-primary-foreground">Habit Done!</span>
                      </div>
                    </div>
                    {/* Floating chart chip */}
                    <div className={cn("absolute -bottom-6 -left-6 rounded-2xl p-4 shadow-xl", glassPanel)}>
                      <p className="mb-1 text-xs text-primary-foreground/80">Weekly Progress</p>
                      <div className="flex h-12 items-end gap-1" aria-hidden="true">
                        {["d-60", "d-80", "d-100", "d-75", "d-90", "d-60b"].map((bar) => (
                          <span
                            key={bar}
                            className="w-3 rounded-t bg-accent"
                            style={{ height: `${bar.replace(/\D/g, "")}%` }}
                          />
                        ))}
                        <span className="w-3 rounded-t bg-primary-foreground/30" style={{ height: "40%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-primary-foreground/10 bg-primary-foreground/5 py-16 backdrop-blur-sm" aria-label={logosLabel}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-primary-foreground/60">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 sm:gap-12 lg:gap-16">
                {logoItems.map((name) => (
                  <span key={name} className="text-xl font-bold text-primary-foreground">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32" id="features" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className={badgePill}>
                  <BoltIcon />
                  Powerful Features
                </span>
                <h2 id="features-heading" className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">{featuresDesc}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className={cn(
                      "group rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:bg-primary-foreground/15",
                      glassPanel,
                    )}
                  >
                    <div
                      className={cn(
                        "mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-primary-foreground shadow-lg transition-transform group-hover:scale-110",
                        tierAccent[i % tierAccent.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-primary-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-primary-foreground/70">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-20 lg:py-32" id="how-it-works" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className={badgePill}>
                  <ClipboardIcon />
                  Simple Process
                </span>
                <h2 id="steps-heading" className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">{stepsDesc}</p>
              </div>

              <div className="relative grid gap-8 md:grid-cols-3">
                <div
                  aria-hidden="true"
                  className="absolute left-1/4 right-1/4 top-24 hidden h-0.5 bg-gradient-to-r from-accent via-secondary to-primary md:block"
                />
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div
                      className={cn(
                        "relative z-10 mx-auto mb-6 grid size-20 place-items-center rounded-2xl bg-gradient-to-br text-3xl font-bold text-primary-foreground shadow-xl",
                        tierAccent[i % tierAccent.length],
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className={cn("rounded-3xl p-6", glassPanel)}>
                      <h3 className="mb-3 text-xl font-semibold text-primary-foreground">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-primary-foreground/70">{step.description}</p>
                      {step.bullets && step.bullets.length > 0 && (
                        <div className="mt-4 flex justify-center gap-2">
                          {step.bullets.map((b) => (
                            <span
                              key={b}
                              className="rounded-full bg-accent/20 px-3 py-1 text-xs text-accent-foreground"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32" id="gallery" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className={badgePill}>
                  <PhotoIcon />
                  App Preview
                </span>
                <h2 id="gallery-heading" className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">{galleryDesc}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {galleryItems.map((shot, i) => (
                  <div
                    key={shot.name}
                    className={cn("group relative overflow-hidden rounded-3xl", glassPanel)}
                  >
                    <div className={cn("relative aspect-[9/16] bg-gradient-to-b p-4", galleryAccent[i % galleryAccent.length])}>
                      <Image
                        alt={`HabitFlow app ${shot.name} screen — ${shot.subtitle}`}
                        w={360}
                        h={640}
                        loading="lazy"
                        className="size-full rounded-2xl object-cover"
                      />
                    </div>
                    <div className="bg-primary-foreground/5 p-4 backdrop-blur-md">
                      <h3 className="text-sm font-semibold text-primary-foreground">{shot.name}</h3>
                      <p className="mt-1 text-xs text-primary-foreground/60">{shot.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-20 lg:py-32" aria-label="Key statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label} className={cn("rounded-3xl p-8 text-center", glassPanel)}>
                    <div className="mb-2 text-4xl font-bold text-primary-foreground sm:text-5xl">{s.value}</div>
                    <div className="text-sm text-primary-foreground/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20 lg:py-32" id="pricing" aria-labelledby="pricing-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className={badgePill}>
                  <TagIcon />
                  Simple Pricing
                </span>
                <h2 id="pricing-heading" className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative flex flex-col rounded-3xl p-8",
                      tier.featured
                        ? "border-2 border-accent/50 bg-gradient-to-b from-primary-foreground/20 to-primary-foreground/10 shadow-2xl backdrop-blur-xl md:-translate-y-4"
                        : glassPanel,
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent to-secondary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-lg">
                          <StarIcon className="size-4" />
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-semibold text-primary-foreground">{tier.name}</h3>
                      <p className="text-sm text-primary-foreground/60">{tier.tagline}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-primary-foreground">{tier.price}</span>
                      <span className="text-primary-foreground/60">{tier.period}</span>
                    </div>
                    <ul className="mb-8 flex-1 space-y-4">
                      {tier.features?.map((f) => (
                        <li key={f.label} className="flex items-start gap-3">
                          {f.included ? (
                            <CheckIcon className="mt-0.5 size-5 shrink-0 text-accent" />
                          ) : (
                            <CrossIcon className="mt-0.5 size-5 shrink-0 text-primary-foreground/30" />
                          )}
                          <span className={cn("text-sm", f.included ? "text-primary-foreground/80" : "text-primary-foreground/40")}>
                            {f.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-xl px-6 py-3 font-semibold transition-all",
                        tier.featured
                          ? "bg-gradient-to-r from-accent to-secondary text-primary-foreground shadow-lg hover:opacity-90"
                          : "border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-sm text-primary-foreground/60">
                  All plans include a 14-day free trial. Cancel anytime. No questions asked.
                </p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-32" id="testimonials" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className={badgePill}>
                  <StarIcon className="size-4" />
                  4.9/5 from 50,000+ reviews
                </span>
                <h2 id="testimonials-heading" className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">{testimonialsDesc}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className={cn("rounded-3xl p-6", glassPanel)}>
                    <div className="mb-4 flex items-center gap-1">
                      {["s1", "s2", "s3", "s4", "s5"].map((s) => (
                        <StarIcon key={s} className="size-5 text-accent" />
                      ))}
                    </div>
                    <p className="mb-6 text-sm leading-relaxed text-primary-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full border-2 border-primary-foreground/20 object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold text-primary-foreground">{t.name}</div>
                        <div className="text-xs text-primary-foreground/60">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-32" id="faq" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className={badgePill}>
                  <QuestionIcon />
                  Got Questions?
                </span>
                <h2 id="faq-heading" className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className={cn("group overflow-hidden rounded-2xl", glassPanel)}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 transition-colors hover:bg-primary-foreground/5">
                      <span className="pr-4 font-semibold text-primary-foreground">{item.question}</span>
                      <span className="shrink-0 text-primary-foreground/60 transition-transform duration-200 group-open:rotate-180">
                        <ChevronDownIcon />
                      </span>
                    </summary>
                    <div className="px-6 pb-5">
                      <p className="text-sm leading-relaxed text-primary-foreground/70">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>

              <div className={cn("mt-12 rounded-2xl p-8 text-center", glassPanel)}>
                <p className="mb-2 font-semibold text-primary-foreground">Still have questions?</p>
                <p className="mb-4 text-sm text-primary-foreground/70">
                  Our support team is here to help you get started.
                </p>
                <button
                  type="button"
                  onClick={() => go("Contact Support")}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-6 py-3 font-semibold text-primary transition-all hover:bg-primary-foreground/90"
                >
                  <MailIcon />
                  Contact Support
                </button>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative overflow-hidden py-20 lg:py-32" id="download" aria-labelledby="cta-heading">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-1/4 top-0 size-96 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-secondary/20 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <div className={cn("rounded-3xl p-8 sm:p-12 lg:p-16", glassPanel)}>
                <h2 id="cta-heading" className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                  {ctaHeading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">{ctaDesc}</p>

                <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaPrimary)}
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary-foreground px-8 py-4 font-semibold text-primary shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary-foreground/90"
                  >
                    <AppleIcon />
                    {ctaPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaSecondary)}
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary-foreground px-8 py-4 font-semibold text-primary shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary-foreground/90"
                  >
                    <PlayIcon />
                    {ctaSecondary}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/60">
                  {ctaBadges.map((b) => (
                    <div key={b} className="flex items-center gap-2">
                      <CheckIcon className="size-5 text-accent" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-primary-foreground/10 bg-background/20 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <LogoMark className="size-10" />
                  <span className="text-xl font-bold text-primary-foreground">{brand}</span>
                </div>
                <p className="mb-6 max-w-xs text-sm text-primary-foreground/60">{footerTagline}</p>
                <div className="flex items-center gap-4">
                  {["Twitter", "Instagram", "LinkedIn", "YouTube"].map((social, i) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      aria-label={social}
                      className="grid size-10 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground/60 backdrop-blur-md transition-all hover:bg-primary-foreground/20 hover:text-primary-foreground"
                    >
                      {socialIcons[i]}
                    </button>
                  ))}
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
                          className="text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 sm:flex-row">
              <p className="text-sm text-primary-foreground/40">{footerNote}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary-foreground/40">Made with</span>
                <HeartIcon className="size-4 text-accent" />
                <span className="text-sm text-primary-foreground/40">{footerMadeIn}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
