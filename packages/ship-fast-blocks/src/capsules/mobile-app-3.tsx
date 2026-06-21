import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * MobileAppKimiPage3 — a complete, self-contained mobile-app LANDING / marketing page.
 *
 * Faithful Tailwind v4 port of a Kimi-generated "Streak" habit-tracker app site
 * with a dark, atmospheric, premium aesthetic: deep backgrounds with glowing
 * brand gradients, floating phone-mockup imagery and animated UI chip overlays.
 * This is variant 3 — the third style sibling to MobileAppKimiPage, with a
 * visually distinct mood: dense card grids, bold colorful feature icons, a
 * horizontal-snap app screenshot gallery, numbered step cards with connector
 * lines, gradient stat pills, and a heavier premium-dark feel.
 *
 * Includes a fixed glass navbar, split hero with App Store / Google Play CTAs
 * and floating streak/social-proof chips, a "featured in" press-logo strip,
 * a 6-up feature grid with multi-colored gradient icon tiles, a 3-step walkthrough
 * with connecting gradients, a horizontal-scroll snap gallery, a 3-tier pricing
 * table with a highlighted popular plan, gradient big-number stats, a 6-up
 * testimonials grid with star ratings, an accordion FAQ, a final download CTA
 * with app-store buttons, and a multi-column footer with social icons.
 *
 * All nav items, CTAs, download buttons, footer links and social icons route
 * through `useNavigate` (never a dead "#"). All content imagery uses alt-driven
 * <Image>. Callers supply only content data; rich defaults make it render fully
 * with no props.
 */
export const MobileAppKimiPage3 = defineCapsule({
  name: 'MobileAppKimiPage3',
  description:
    "Complete mobile-app / SaaS-app marketing LANDING page with a dark, atmospheric, premium aesthetic: deep backgrounds, glowing brand gradients, floating phone-mockup imagery with UI chip overlays, and a dense premium UI feel. Includes a glass fixed navbar, split hero with App Store + Google Play CTAs, floating streak and social-proof chips, a 'featured in' press-logo strip, a 6-up feature grid with colorful gradient icon tiles, a numbered 3-step walkthrough with connector lines, a horizontal-snap app gallery, a 3-tier pricing table (Free / Pro / Team) with a highlighted Most Popular plan, gradient big-number stat pills, a 6-up testimonials grid with star ratings and avatars, an expandable FAQ accordion, a final download CTA with app-store buttons, and a multi-column footer (Product / Company / Support) with social icons. This is the third style sibling to MobileAppKimiPage, offering a darker, more premium, conversion-focused mood than the lighter variants. Use for consumer mobile apps, habit trackers, fitness/wellness apps, productivity tools, or any App-Store-distributed product launch. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout, spacing, depth and type hierarchy.",
  props: z.object({
    /** Brand / app name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        appStoreRating: z.string().optional(),
        googlePlayRating: z.string().optional(),
        streakValue: z.string().optional(),
        streakLabel: z.string().optional(),
        joinedLabel: z.string().optional(),
      })
      .optional(),
    /** Press-logo strip. */
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
    /** How-it-works steps. */
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
    /** Horizontal-scrolling gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              period: z.string().optional(),
              tagline: z.string().optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
              features: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats band. */
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
    /** Final CTA / download. */
    cta: z
      .object({
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        platforms: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        copyright: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      waitlist: table({
        email: string(),
        plan: string(),
      }),
      downloads: table({
        platform: string(),
      }),
    },
    queries: {
      waitlistEntries: ({ db }) => db.waitlist.orderBy('createdAt').all(),
      downloadCounts: ({ db }) => db.downloads.all(),
    },
    mutations: {
      joinWaitlist: ({ db }, email: string, plan: string) => {
        const existing = db.waitlist.where('email', email).all()[0]
        if (!existing) {
          db.waitlist.insert({ email, plan })
        }
        return db.waitlist.all()
      },
      trackDownload: ({ db }, platform: string) => {
        db.downloads.insert({ platform })
        return db.downloads.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [waitlistOpen, setWaitlistOpen] = useState(false)
    const [waitlistEmail, setWaitlistEmail] = useState('')
    const [waitlistPlan, setWaitlistPlan] = useState('Free')
    const [submitted, setSubmitted] = useState(false)
    const brand = props.brand ?? 'Streak'

    /* ── Lakebed runtime ── */
    const waitlistEntries = lakebed.useQuery('waitlistEntries')
    const joinWaitlist = lakebed.useMutation('joinWaitlist')
    const trackDownload = lakebed.useMutation('trackDownload')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const waitlistCount = (waitlistEntries ?? []).length

    const handleWaitlistSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!waitlistEmail.trim()) return
      void joinWaitlist(waitlistEmail.trim(), waitlistPlan)
      setSubmitted(true)
    }

    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How It Works', 'Pricing', 'Reviews']

    /* ── Hero defaults ── */
    const heroBadge = props.hero?.badge ?? 'Trusted by 2M+ habit builders'
    const heroTop = props.hero?.headingTop ?? 'Build Better Habits,'
    const heroAccent = props.hero?.headingAccent ?? 'Transform Your Life'
    const heroSub =
      props.hero?.subheading ??
      'The intelligent habit tracker that helps you build lasting routines with AI-powered insights, smart reminders, and beautiful analytics. Start your 147-day streak today.'
    const heroPrimary = props.hero?.primaryCta ?? 'App Store'
    const heroSecondary = props.hero?.secondaryCta ?? 'Google Play'
    const appStoreRating = props.hero?.appStoreRating ?? '4.9'
    const googlePlayRating = props.hero?.googlePlayRating ?? '4.8'
    const streakValue = props.hero?.streakValue ?? '147 Days'
    const streakLabel = props.hero?.streakLabel ?? 'Current Streak'
    const joinedLabel = props.hero?.joinedLabel ?? '+12k joined today'

    /* ── Logos defaults ── */
    const logosLabel =
      props.logos?.label ?? 'Featured in & Trusted by Leading Publications'
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ['TechCrunch', 'Wired', 'Forbes', 'The Verge', 'TNW']

    /* ── Features defaults ── */
    const featuresHeading =
      props.features?.heading ??
      'Everything You Need to Build Habits That Stick'
    const featuresDesc =
      props.features?.description ??
      'From smart reminders to detailed analytics, Streak gives you all the tools you need to transform your daily routines.'
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: 'Smart Analytics',
            description:
              'Track completion rates, identify patterns, and get personalized insights based on your unique behavior and circadian rhythms.',
          },
          {
            title: 'Intelligent Reminders',
            description:
              "AI learns your optimal times and sends contextual nudges exactly when you're most likely to follow through.",
          },
          {
            title: 'Community Challenges',
            description:
              'Join group challenges with friends and the global community. Compete on leaderboards while building habits together.',
          },
          {
            title: 'Achievement System',
            description:
              'Unlock 50+ beautifully designed badges and milestones. Celebrate streaks from 7 days to 365 days and beyond.',
          },
          {
            title: 'Habit Stacking',
            description:
              'Link new habits to existing routines using the proven technique from Atomic Habits. Build chains that stick.',
          },
          {
            title: 'Widget & Watch Support',
            description:
              'Native iOS 17 widgets and Apple Watch complications. Track and complete habits without opening the app.',
          },
        ]

    /* ── Steps defaults ── */
    const stepsHeading =
      props.steps?.heading ?? 'Start Building Better Habits In 3 Simple Steps'
    const stepsDesc =
      props.steps?.description ??
      'No complicated setup. Get started in under 2 minutes and see results within the first week.'
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Choose Your Habits',
            description:
              'Pick from 200+ science-backed habit templates or create custom ones. Categories include fitness, mindfulness, productivity, sleep, and nutrition.',
            imageAlt:
              'Person writing in journal at desk planning daily habits and goals',
          },
          {
            title: 'Set Your Schedule',
            description:
              'Customize frequency, duration, and reminders. Choose daily, weekly, or custom intervals that fit your lifestyle perfectly.',
            imageAlt:
              'Smartphone alarm clock app showing morning schedule notifications',
          },
          {
            title: 'Track & Improve',
            description:
              'Check off completed habits, view your streak grow, and let AI insights guide you to build routines that actually last.',
            imageAlt:
              'Analytics dashboard charts showing upward growth trends and statistics',
          },
        ]

    /* ── Gallery defaults ── */
    const galleryHeading =
      props.gallery?.heading ?? 'Beautifully Designed, Inside and Out'
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          'iPhone displaying dark mode habit tracker app home screen with progress rings',
          'Smartphone screen showing detailed weekly habit analytics charts and graphs',
          'Mobile app interface showing daily habit completion checklist with streak counts',
          'Phone display showing achievement badges and milestone rewards screen',
          'Mobile app community challenges screen showing friend leaderboard rankings',
        ]

    /* ── Pricing defaults ── */
    const pricingHeading =
      props.pricing?.heading ?? 'Simple, Transparent Pricing'
    const pricingDesc =
      props.pricing?.description ??
      "Start free and upgrade when you're ready. No hidden fees, cancel anytime."
    const pricingNote =
      props.pricing?.note ??
      'All plans include a 14-day free trial. No credit card required.'
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: 'Free',
            price: '$0',
            period: '/month',
            tagline: 'Perfect for getting started with habit tracking.',
            cta: 'Get Started Free',
            featured: false,
            features: [
              'Up to 5 habits',
              'Basic analytics',
              'Daily reminders',
              '7-day streak history',
            ],
          },
          {
            name: 'Pro',
            price: '$8',
            period: '/month',
            tagline: 'For serious habit builders who want results.',
            cta: 'Start 14-Day Trial',
            featured: true,
            features: [
              'Unlimited habits',
              'Advanced AI insights',
              'Smart reminders',
              'Unlimited history',
              'Widgets & Watch app',
              'Community access',
            ],
          },
          {
            name: 'Team',
            price: '$12',
            period: '/user/month',
            tagline: 'For teams, coaches, and accountability groups.',
            cta: 'Contact Sales',
            featured: false,
            features: [
              'Everything in Pro',
              'Team challenges',
              'Admin dashboard',
              'Priority support',
            ],
          },
        ]

    /* ── Stats defaults ── */
    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '2.4M+', label: 'Active Users' },
          { value: '47M+', label: 'Habits Tracked' },
          { value: '89%', label: 'Success Rate' },
          { value: '156', label: 'Countries' },
        ]

    /* ── Testimonials defaults ── */
    const testimonialsHeading =
      props.testimonials?.heading ?? 'Loved by Habit Builders Worldwide'
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands who've transformed their lives with Streak."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Streak completely changed how I approach my morning routine. I'm on day 312 of meditating and exercising daily. The AI reminders are incredibly smart — they know exactly when I'm most likely to skip.",
            name: 'David Chen',
            role: 'Product Manager, Google',
            avatarAlt:
              'Professional headshot of a middle-aged man with glasses wearing a blue shirt',
          },
          {
            quote:
              "As a fitness coach, I recommend Streak to all my clients. The group challenges feature is a game-changer — my accountability group has 94% retention vs 40% before. The analytics help me see patterns I'd never catch otherwise.",
            name: 'Sarah Mitchell',
            role: 'Certified Personal Trainer',
            avatarAlt:
              'Professional headshot of a young woman with dark hair wearing fitness attire',
          },
          {
            quote:
              'I tried 6 different habit apps before finding Streak. This is the first one that actually stuck. The interface is gorgeous, the insights are genuinely useful, and I love the Apple Watch integration. 180 days sober thanks to this app.',
            name: 'Marcus Rodriguez',
            role: 'Software Engineer, Spotify',
            avatarAlt:
              'Professional headshot of a young man with short brown hair and friendly smile',
          },
          {
            quote:
              "The habit stacking feature alone is worth the subscription. I've finally been able to add reading and journaling to my nightly routine by linking them to my existing habits. Premium design and worth every penny.",
            name: 'Emma Thompson',
            role: 'Startup Founder',
            avatarAlt:
              'Professional headshot of a woman with blonde hair in her thirties wearing a blazer',
          },
          {
            quote:
              "Our company's wellness program uses Streak Team. Engagement is through the roof — 87% of employees use it daily. The admin dashboard gives us incredible insights into team wellbeing patterns.",
            name: 'James Wilson',
            role: 'VP of People, Stripe',
            avatarAlt:
              'Professional headshot of a middle-aged man in a suit and tie executive portrait',
          },
          {
            quote:
              "I'm a medical student and Streak helps me balance studying, exercise, and sleep. The app's insights showed I was 40% more likely to study when I exercised first. That one insight changed my entire routine.",
            name: 'Dr. Priya Patel',
            role: 'Medical Resident, Johns Hopkins',
            avatarAlt:
              'Professional headshot of a young Asian woman with black hair medical student',
          },
        ]

    /* ── FAQ defaults ── */
    const faqHeading = props.faq?.heading ?? 'Frequently Asked Questions'
    const faqDesc =
      props.faq?.description ?? 'Everything you need to know about Streak.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: 'Can I use Streak for free?',
            answer:
              "Absolutely! Our free plan includes up to 5 habits, basic analytics, and daily reminders. It's perfect for getting started with habit tracking. Many users stick with the free plan indefinitely, while others upgrade when they want advanced features like unlimited habits and AI insights.",
          },
          {
            question: 'Does Streak work offline?',
            answer:
              "Yes! Streak works completely offline. You can check off habits, view your streaks, and access all your data even without an internet connection. Changes sync automatically when you're back online. This makes it perfect for travel, gym sessions, or anywhere with poor signal.",
          },
          {
            question: 'How does the AI insights feature work?',
            answer:
              "Our AI analyzes your completion patterns, time of day preferences, streak lengths, and contextual factors (like weather and day of week). It then provides personalized recommendations — like the best time to schedule a habit, which habits complement each other, and predictions for which habits you're at risk of breaking. All processed on-device for privacy.",
          },
          {
            question: 'Can I export my data?',
            answer:
              'Yes, you own your data. Export everything as CSV, JSON, or PDF at any time from the settings menu. Pro and Team users can also set up automatic weekly or monthly exports to email, Google Drive, Dropbox, or Notion.',
          },
          {
            question: 'What happens if I break a streak?',
            answer:
              "Don't worry — we don't reset your progress to zero! Streak tracks both your current streak and your 'best streak' (all-time record). You can also see rolling averages over 7, 30, and 90 days. Our research shows this approach is more motivating and reduces the 'screw it' effect where one missed day leads to abandoning the habit entirely.",
          },
          {
            question: 'Is my data private and secure?',
            answer:
              "Absolutely. We use end-to-end encryption for all habit data. We never sell your information to third parties. Your data is stored securely and you can delete your account and all associated data at any time. We're GDPR compliant and SOC 2 Type II certified.",
          },
        ]

    /* ── CTA defaults ── */
    const ctaTop = props.cta?.headingTop ?? 'Ready to Build Habits That'
    const ctaAccent = props.cta?.headingAccent ?? 'Actually Stick?'
    const ctaDesc =
      props.cta?.description ??
      'Join 2.4 million people who are transforming their lives, one habit at a time. Start your free 14-day trial of Pro today — no credit card required.'
    const ctaPrimary = props.cta?.primaryCta ?? 'Download for iPhone'
    const ctaSecondary = props.cta?.secondaryCta ?? 'Download for Android'
    const ctaPlatforms =
      props.cta?.platforms ??
      'Available on iOS 15+, Android 8+, Apple Watch, and Web'

    /* ── Footer defaults ── */
    const footerTagline =
      props.footer?.tagline ??
      'The intelligent habit tracker that helps you build lasting routines with AI-powered insights.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: 'Product',
            links: [
              'Features',
              'Pricing',
              'Integrations',
              'Changelog',
              'Roadmap',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Community',
              'API Docs',
              'Status',
              'Security',
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']

    /* ── Icon helpers (inline SVG, currentColor) ── */
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
        className="size-5"
        aria-hidden="true"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h12.03c.83 0 1.5.67 1.5 1.5v2.5l2.5-2.5v17l-2.5-2.5v2.5c0 .83-.67 1.5-1.5 1.5H4.5c-.83 0-1.5-.67-1.5-1.5z" />
      </svg>
    )

    const CheckIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const StarIcon = () => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ChevronDownIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 text-muted-foreground"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const TwitterIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    )

    const GitHubIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    )

    const InstagramIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    )

    const featureIcons = [
      /* 0 — analytics (bar chart) */
      <svg
        key="0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      /* 1 — reminders (clock) */
      <svg
        key="1"
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
      /* 2 — community (users) */
      <svg
        key="2"
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
      /* 3 — achievements (star/sparkle) */
      <svg
        key="3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
      /* 4 — habit stacking (heart) */
      <svg
        key="4"
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
      /* 5 — widget (phone) */
      <svg
        key="5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
    ]

    const stepAccent = [
      'from-primary to-accent',
      'from-secondary to-accent',
      'from-accent to-primary',
    ]

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* ── Navbar ── */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
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
                <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <LogoMark className="size-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">
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
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open account menu"
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                      >
                        <Avatar
                          size="sm"
                          className="ring-2 ring-background"
                          aria-hidden="true"
                        >
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                          {authDisplayName}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={10}
                      className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                    >
                      <div className="bg-muted/40 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg" className="ring-2 ring-background">
                            {authPicture ? (
                              <AvatarImage
                                src={authPicture}
                                alt={authDisplayName}
                              />
                            ) : null}
                            <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                              {authInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {authDisplayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {authEmail ?? 'Signed in to this session'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={() => lakebed.signOut()}
                          className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                        >
                          Sign out
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      !auth.isLoading && void lakebed.signInWithGoogle()
                    }
                    disabled={auth.isLoading}
                    className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {authLabel}
                  </button>
                )}
                <Sheet open={waitlistOpen} onOpenChange={setWaitlistOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90"
                    >
                      Get Started Free
                      {waitlistCount > 0 && (
                        <span className="grid size-5 place-items-center rounded-full bg-primary-foreground/20 text-[0.625rem] font-bold">
                          {waitlistCount}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Join {brand}</SheetTitle>
                      <SheetDescription>
                        {submitted
                          ? "You're on the waitlist! We'll be in touch soon."
                          : `${waitlistCount > 0 ? `${waitlistCount} people have joined. ` : ''}Enter your email to get early access.`}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {submitted ? (
                        <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
                          <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
                            <CheckIcon />
                          </div>
                          <p className="text-base font-semibold">
                            Welcome aboard!
                          </p>
                          <p className="text-sm text-muted-foreground">
                            We'll notify you at{' '}
                            <span className="font-medium text-foreground">
                              {waitlistEmail}
                            </span>{' '}
                            when we launch your plan.
                          </p>
                        </div>
                      ) : (
                        <form
                          onSubmit={handleWaitlistSubmit}
                          className="space-y-4"
                        >
                          <div>
                            <label
                              htmlFor="waitlist-email"
                              className="mb-1.5 block text-sm font-medium"
                            >
                              Email address
                            </label>
                            <input
                              id="waitlist-email"
                              type="email"
                              required
                              value={waitlistEmail}
                              onChange={(e) => setWaitlistEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">
                              Choose a plan
                            </label>
                            <div className="space-y-2">
                              {(props.pricing?.tiers?.length
                                ? props.pricing.tiers
                                : pricingTiers
                              ).map((tier) => (
                                <button
                                  key={tier.name}
                                  type="button"
                                  onClick={() => setWaitlistPlan(tier.name)}
                                  className={cn(
                                    'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all',
                                    waitlistPlan === tier.name
                                      ? 'border-primary bg-primary/10 text-foreground'
                                      : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30',
                                  )}
                                >
                                  <span className="font-medium">
                                    {tier.name}
                                  </span>
                                  <span>
                                    {tier.price}
                                    {tier.period ? tier.period : ''}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <Button type="submit" className="w-full rounded-xl">
                            Join Waitlist
                          </Button>
                        </form>
                      )}
                      {(waitlistEntries ?? []).length > 0 && (
                        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Recent sign-ups
                          </p>
                          <div className="space-y-2">
                            {(waitlistEntries ?? [])
                              .slice(-5)
                              .reverse()
                              .map((entry) => (
                                <div
                                  key={entry.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="truncate text-foreground/80">
                                    {entry.email}
                                  </span>
                                  <span className="ml-2 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                    {entry.plan}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-xl"
                        >
                          {submitted ? 'Close' : 'Maybe Later'}
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* ── Hero ── */}
          <section
            className="relative overflow-hidden pb-20 pt-32 lg:pb-32 lg:pt-40"
            aria-labelledby="hero-heading"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                  >
                    {heroTop}
                    <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      {heroAccent}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        void trackDownload('ios')
                        setWaitlistOpen(true)
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:opacity-90"
                    >
                      <AppleIcon />
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void trackDownload('android')
                        setWaitlistOpen(true)
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-card-foreground transition-colors hover:bg-muted"
                    >
                      <PlayIcon />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground lg:justify-start">
                    <div className="flex items-center gap-1">
                      <StarIcon />
                      <span className="font-medium text-foreground">
                        {appStoreRating}
                      </span>
                      <span>App Store</span>
                    </div>
                    <span className="text-border">•</span>
                    <div className="flex items-center gap-1">
                      <StarIcon />
                      <span className="font-medium text-foreground">
                        {googlePlayRating}
                      </span>
                      <span>Google Play</span>
                    </div>
                  </div>
                </div>

                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-primary/30 to-accent/30 blur-2xl"
                    />
                    <Image
                      alt="iPhone 15 Pro displaying habit tracking app interface with dark theme showing daily progress and streak counter"
                      w={600}
                      h={1200}
                      className="relative w-72 rounded-[2.5rem] border-8 border-background object-cover shadow-2xl sm:w-80 lg:w-96"
                    />
                    {/* Floating streak chip */}
                    <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-card p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
                          <CheckIcon />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {streakLabel}
                          </p>
                          <p className="text-xl font-bold text-card-foreground">
                            {streakValue}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Floating social-proof chip */}
                    <div className="absolute -right-4 -top-4 rounded-2xl border border-border bg-card p-4 shadow-xl">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <Image
                            alt="Young woman with brown hair smiling headshot"
                            w={40}
                            h={40}
                            className="size-8 rounded-full border-2 border-background object-cover"
                          />
                          <Image
                            alt="Professional man in business attire headshot"
                            w={40}
                            h={40}
                            className="size-8 rounded-full border-2 border-background object-cover"
                          />
                          <Image
                            alt="Woman with blonde hair professional headshot"
                            w={40}
                            h={40}
                            className="size-8 rounded-full border-2 border-background object-cover"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {joinedLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Logos ── */}
          <section
            className="border-y border-border bg-muted/30 py-12"
            aria-label="Featured in"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 sm:gap-12 lg:gap-16">
                {logoItems.map((name) => (
                  <span
                    key={name}
                    className="text-lg font-bold text-muted-foreground sm:text-xl"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Features ── */}
          <section
            className="py-20 lg:py-32"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2
                  id="features-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {featuresHeading.split('Build Habits That Stick')[0]}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Build Habits That Stick
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group relative rounded-2xl border border-border bg-muted/50 p-6 transition-all hover:border-primary/30 lg:p-8"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <div className="relative">
                      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20">
                        {featureIcons[i % featureIcons.length]}
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Steps ── */}
          <section
            className="bg-muted/30 py-20 lg:py-32"
            aria-labelledby="steps-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2
                  id="steps-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex items-center gap-4">
                      <div
                        className={cn(
                          'grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-xl font-bold text-primary-foreground shadow-lg',
                          stepAccent[i % stepAccent.length],
                        )}
                      >
                        {i + 1}
                      </div>
                      <div
                        aria-hidden="true"
                        className={cn(
                          'hidden h-px flex-1 bg-gradient-to-r lg:block',
                          stepAccent[i % stepAccent.length],
                        )}
                      />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <Image
                      alt={step.imageAlt}
                      w={400}
                      h={250}
                      loading="lazy"
                      className="w-full rounded-xl object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Gallery (horizontal scroll) ── */}
          <section
            aria-label="App gallery"
            className="overflow-hidden py-20 lg:py-32"
          >
            <div className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {galleryHeading}
              </h2>
            </div>
            <div
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4"
              style={{ scrollbarWidth: 'none' }}
            >
              {galleryItems.map((alt) => (
                <div key={alt} className="flex-shrink-0 snap-center">
                  <Image
                    alt={alt}
                    w={300}
                    h={600}
                    loading="lazy"
                    className="h-96 rounded-[2rem] border-8 border-background object-cover shadow-2xl sm:h-[500px]"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── Pricing ── */}
          <section
            className="bg-muted/30 py-20 lg:py-32"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="pricing-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      'relative rounded-2xl p-6 lg:p-8',
                      tier.featured
                        ? 'border border-primary/30 bg-gradient-to-b from-primary/20 to-primary/5 shadow-xl shadow-primary/10'
                        : 'border border-border bg-muted/50',
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3 className="mb-2 text-lg font-semibold">{tier.name}</h3>
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">
                        {tier.period}
                      </span>
                    </div>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {tier.tagline}
                    </p>
                    <ul className="mb-8 space-y-3">
                      {tier.features?.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm">
                          <CheckIcon />
                          {tier.featured ? (
                            <span className="font-medium">{f}</span>
                          ) : (
                            <span>{f}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        'w-full rounded-xl py-3 font-medium transition-all',
                        tier.featured
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90'
                          : 'bg-card text-card-foreground hover:bg-muted',
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* ── Stats ── */}
          <section className="py-20 lg:py-32" aria-label="Stats">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {statsItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-muted/30 p-6 text-center"
                  >
                    <div className="mb-2 text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent sm:text-4xl lg:text-5xl">
                      {s.value}
                    </div>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section
            className="bg-muted/30 py-20 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="testimonials-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted/50 p-6"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
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

          {/* ── FAQ ── */}
          <section className="py-20 lg:py-32" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2
                  id="faq-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-muted/50"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="text-left font-semibold">
                        {item.question}
                      </span>
                      <span className="transition-transform group-open:rotate-180">
                        <ChevronDownIcon />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="bg-muted/30 py-20 lg:py-32" aria-label="Download">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <div className="relative rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/20 to-primary/5 p-8 lg:p-12">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-3xl bg-primary/10 blur-3xl"
                />
                <div className="relative">
                  <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {ctaTop}{' '}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {ctaAccent}
                    </span>
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                    {ctaDesc}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 justify-center sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-6 py-3 font-semibold text-foreground transition-colors hover:bg-background"
                    >
                      <AppleIcon />
                      {ctaPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-card-foreground transition-colors hover:bg-muted"
                    >
                      <PlayIcon />
                      {ctaSecondary}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ctaPlatforms}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-border py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <LogoMark className="size-5" />
                  </div>
                  <span className="text-xl font-bold">{brand}</span>
                </div>
                <p className="mb-4 max-w-xs text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => go('Twitter')}
                    className="grid size-10 place-items-center rounded-lg bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <TwitterIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => go('GitHub')}
                    className="grid size-10 place-items-center rounded-lg bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <GitHubIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => go('Instagram')}
                    className="grid size-10 place-items-center rounded-lg bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <InstagramIcon />
                  </button>
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
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
            <div className="flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-foreground"
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
