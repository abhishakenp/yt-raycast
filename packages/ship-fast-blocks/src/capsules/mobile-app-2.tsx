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
 * MobileAppKimiPage2 — a complete, self-contained mobile-app LANDING / marketing page with full-stack Lakebed functionality.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "HabitStack" habit-tracker app
 * site. This is the SECOND, visually DISTINCT style sibling to MobileAppKimiPage:
 * where the first is a calm, minimalist, airy layout, this variant is bolder and
 * more vibrant — a tinted gradient hero glow with a floating animated phone mockup
 * carrying TWO overlay chips (a green streak badge + a community avatar stack),
 * App-Store / Google-Play store-badge buttons with star ratings, a publication
 * logo strip with inline brand glyphs, a 6-up feature grid of soft-tinted cards
 * with scale-on-hover icon tiles and save-to-favorites heart buttons, a numbered 3-step "how it works" walkthrough
 * with screenshots and trust pills, a horizontal-scrolling phone-screenshot gallery
 * with hover captions and dot indicators, a solid full-bleed stats band, a 3-tier
 * pricing table (Free / Pro / Teams) with a raised most-popular plan and billing
 * notes, an expandable FAQ accordion with a contact-support link, a vibrant
 * gradient-panel final download CTA with trust badges and newsletter subscription form, and an inverted multi-column
 * footer (Product / Company / Legal) with social icons.
 *
 * FULL-STACK FEATURES (Lakebed):
 * - Saved Features drawer: users can save features they're interested in with heart icons, view them in a slide-out drawer, and clear all
 * - Newsletter subscription: email capture form with persistence
 * - Google Auth: sign-in/sign-out with account menu popover
 * - All state persists across sessions via Lakebed database
 *
 * Use as the ROOT/home page for a consumer mobile app, habit tracker, fitness /
 * wellness / meditation app, productivity or to-do app, or any iOS/Android launch
 * when a punchy, conversion-focused page with download CTAs, app screenshots and
 * social proof is wanted — and pick this over MobileAppKimiPage when a livelier,
 * more colorful and energetic aesthetic fits better. The block owns ALL layout and
 * styling; callers supply content only and rich defaults render the full page.
 */
export const MobileAppKimiPage2 = defineCapsule({
  name: 'MobileAppKimiPage2',
  description:
    "Complete mobile-app / SaaS-app marketing LANDING page in a bold, vibrant, energetic aesthetic — the second, visually DISTINCT style sibling to MobileAppKimiPage (which is the calmer, minimalist alternative). Includes a tinted gradient-glow hero with a floating animated phone mockup carrying two overlay chips (a streak badge + a community avatar stack), App Store + Google Play store-badge download buttons with star ratings and download count, a 'featured in' publication logo strip with inline brand glyphs, a 6-up feature grid of soft-tinted cards with scale-on-hover icon tiles and save-to-favorites heart buttons (streak tracking, intelligent reminders, analytics, accountability groups, habit templates, health sync), a numbered 3-step 'how it works' walkthrough with screenshots and trust pills, a horizontal-scrolling phone-screenshot gallery with hover captions and dot indicators, a solid full-bleed big-number stats band, a 3-tier pricing table (Free / Pro / Teams) with a raised highlighted most-popular plan and billing notes, an expandable FAQ accordion with a contact-support link, a vibrant gradient-panel final download CTA with trust badges and newsletter subscription form, and an inverted multi-column footer (Product / Company / Legal) with social icons. FULL-STACK: saved features drawer with Lakebed persistence, newsletter subscription, Google auth with account menu. Use as the ROOT/home page for a consumer mobile app, habit tracker, fitness/wellness/meditation app, productivity or to-do app, iOS/Android app launch, or any App-Store-distributed product site when a punchy, colorful, conversion-focused page with download CTAs, app screenshots and social proof is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
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
        headingHighlight: z.string().optional(),
        headingRest: z.string().optional(),
        subheading: z.string().optional(),
        appStoreCta: z.string().optional(),
        playStoreCta: z.string().optional(),
        appStoreRating: z.string().optional(),
        playStoreRating: z.string().optional(),
        downloads: z.string().optional(),
        imageAlt: z.string().optional(),
        chipTitle: z.string().optional(),
        chipSubtitle: z.string().optional(),
        communityLabel: z.string().optional(),
        communitySubtitle: z.string().optional(),
        communityAvatars: z.array(z.string()).optional(),
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
        eyebrow: z.string().optional(),
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
        eyebrow: z.string().optional(),
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
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** App-screenshot gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ label: z.string(), imageAlt: z.string() }))
          .optional(),
      })
      .optional(),
    /** Full-bleed big-number stats band. */
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
        eyebrow: z.string().optional(),
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
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              billingNote: z.string().optional(),
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
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
        contactPrompt: z.string().optional(),
        contactCta: z.string().optional(),
      })
      .optional(),
    /** Final download CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        appStoreCta: z.string().optional(),
        playStoreCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        madeIn: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedFeatures: table({
        featureTitle: string(),
        featureDescription: string(),
      }),
      newsletterSubscribers: table({
        email: string(),
      }),
    },
    queries: {
      savedFeatures: ({ db }) => db.savedFeatures.orderBy('createdAt').all(),
      subscriberEmails: ({ db }) =>
        new Set(db.newsletterSubscribers.all().map((sub) => sub.email)),
    },
    mutations: {
      saveFeature: (
        { db },
        featureTitle: string,
        featureDescription: string,
      ) => {
        const existing = db.savedFeatures
          .where('featureTitle', featureTitle)
          .all()[0]
        if (existing) {
          db.savedFeatures.delete(existing.id)
          return false
        }
        db.savedFeatures.insert({ featureTitle, featureDescription })
        return true
      },
      removeFeature: ({ db }, featureTitle: string) => {
        for (const item of db.savedFeatures
          .where('featureTitle', featureTitle)
          .all()) {
          db.savedFeatures.delete(item.id)
        }
        return db.savedFeatures.all()
      },
      subscribeNewsletter: ({ db }, email: string) => {
        const existing = db.newsletterSubscribers.where('email', email).all()[0]
        if (existing) return false
        db.newsletterSubscribers.insert({ email })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [savedOpen, setSavedOpen] = useState(false)
    const brand = props.brand ?? 'HabitStack'

    const savedFeatures = lakebed.useQuery('savedFeatures')
    const saveFeature = lakebed.useMutation('saveFeature')
    const removeFeature = lakebed.useMutation('removeFeature')
    const subscribeNewsletter = lakebed.useMutation('subscribeNewsletter')
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
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const savedCount = savedFeatures?.length ?? 0
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How It Works', 'Pricing', 'Reviews', 'FAQ', 'Get App']

    const heroBadge = props.hero?.badge ?? 'Over 2 Million Habits Tracked'
    const heroTop = props.hero?.headingTop ?? 'Build Better'
    const heroHighlight = props.hero?.headingHighlight ?? 'Habits'
    const heroRest = props.hero?.headingRest ?? 'That Stick'
    const heroSub =
      props.hero?.subheading ??
      'Join 500,000+ people using HabitStack to track daily routines, build streaks, and transform their lives with science-backed habit formation techniques.'
    const heroAppStore = props.hero?.appStoreCta ?? 'App Store'
    const heroPlayStore = props.hero?.playStoreCta ?? 'Google Play'
    const heroAppRating = props.hero?.appStoreRating ?? '4.9'
    const heroPlayRating = props.hero?.playStoreRating ?? '4.8'
    const heroDownloads = props.hero?.downloads ?? '500K+ Downloads'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'iPhone displaying HabitStack app dashboard with daily habit tracking interface and colorful progress rings'
    const chipTitle = props.hero?.chipTitle ?? 'Morning Workout'
    const chipSubtitle = props.hero?.chipSubtitle ?? '7-day streak!'
    const communityLabel = props.hero?.communityLabel ?? '+2.4k today'
    const communitySubtitle =
      props.hero?.communitySubtitle ?? 'Join the community'
    const communityAvatars = props.hero?.communityAvatars?.length
      ? props.hero.communityAvatars
      : [
          'Profile photo of Sarah Chen, a smiling woman with dark hair',
          'Profile photo of Marcus Johnson, a man with short hair and glasses',
          'Profile photo of Emma Wilson, a woman with blonde hair smiling',
        ]

    const logosLabel = props.logos?.label ?? 'Featured in leading publications'
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ['TechCrunch', 'Product Hunt', 'The Verge', 'Lifehacker', 'Wired']

    const featuresEyebrow = props.features?.eyebrow ?? 'Powerful Features'
    const featuresHeading =
      props.features?.heading ?? 'Everything you need to build lasting habits'
    const featuresDesc =
      props.features?.description ??
      'HabitStack combines behavioral science with intuitive design to make habit formation easier than ever before.'
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: 'Smart Streak Tracking',
            description:
              "Visualize your progress with beautiful flame streaks. Don't break the chain—our algorithm accounts for life happening with flexible rest days.",
          },
          {
            title: 'Intelligent Reminders',
            description:
              'Context-aware notifications that adapt to your schedule. Get reminded at the right time based on your location and routine patterns.',
          },
          {
            title: 'Detailed Analytics',
            description:
              'Comprehensive insights into your habits with completion rates, trends, and personalized recommendations to optimize your routine.',
          },
          {
            title: 'Accountability Groups',
            description:
              'Join or create habit groups with friends, family, or coworkers. Share progress, compete on leaderboards, and motivate each other.',
          },
          {
            title: 'Habit Templates',
            description:
              'Start instantly with 200+ science-backed habit templates covering fitness, mindfulness, productivity, sleep, and relationships.',
          },
          {
            title: 'Apple Health Sync',
            description:
              'Seamlessly integrate with Apple Health, Google Fit, and 50+ fitness apps. Your workouts automatically count toward your habit goals.',
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? 'How It Works'
    const stepsHeading =
      props.steps?.heading ?? 'Start building habits in 3 simple steps'
    const stepsDesc =
      props.steps?.description ??
      'Our proven framework makes habit formation effortless and enjoyable.'
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Choose Your Habits',
            description:
              'Pick from 200+ templates or create custom habits. Set your target frequency—daily, weekly, or specific days.',
            imageAlt:
              'Mobile app interface showing habit selection screen with colorful habit icons and categories',
          },
          {
            title: 'Track Daily',
            description:
              'Check off habits with one tap. Add notes, photos, and mood ratings to build a rich history of your journey.',
            imageAlt:
              'Habit tracking dashboard showing daily progress checklist with completion checkmarks',
          },
          {
            title: 'Watch Yourself Grow',
            description:
              'Celebrate milestones, earn badges, and see your transformation with beautiful charts and insights.',
            imageAlt:
              'Analytics dashboard showing habit progress charts and statistics with colorful graphs',
          },
        ]
    const stepBadges = props.steps?.badges?.length
      ? props.steps.badges
      : [
          'No credit card required',
          'Free forever plan available',
          'Cancel anytime',
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? 'App Gallery'
    const galleryHeading =
      props.gallery?.heading ?? 'Beautiful design, powerful functionality'
    const galleryDesc =
      props.gallery?.description ??
      'Every detail crafted to make habit tracking delightful and effective.'
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            label: 'Homescreen',
            imageAlt:
              'HabitStack app homescreen showing daily habit checklist with colorful completion indicators',
          },
          {
            label: 'Analytics',
            imageAlt:
              'HabitStack statistics screen with colorful weekly progress charts and trend analysis',
          },
          {
            label: 'Achievements',
            imageAlt:
              'HabitStack achievements screen displaying earned badges and milestone rewards',
          },
          {
            label: 'Community',
            imageAlt:
              'HabitStack community groups interface showing team challenges and leaderboard',
          },
          {
            label: 'Create Habit',
            imageAlt:
              'HabitStack habit creation screen with customizable reminders and scheduling options',
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '2M+', label: 'Habits Tracked' },
          { value: '500K+', label: 'Active Users' },
          { value: '94%', label: 'Success Rate' },
          { value: '4.9★', label: 'Average Rating' },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? 'Testimonials'
    const testimonialsHeading =
      props.testimonials?.heading ?? 'Loved by thousands'
    const testimonialsDesc =
      props.testimonials?.description ??
      'See how HabitStack has transformed lives around the world.'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "HabitStack completely changed my morning routine. I've meditated for 127 consecutive days now—a streak I never thought possible. The visual progress tracking keeps me incredibly motivated.",
            name: 'Sarah Chen',
            role: 'Marketing Director, Airbnb',
            avatarAlt:
              'Professional headshot of Sarah Chen, a marketing director with shoulder-length dark hair',
          },
          {
            quote:
              "As a startup founder, my schedule is chaotic. HabitStack's flexible reminders and accountability groups with my co-founders have been game-changing. We've built a culture of health alongside our company.",
            name: 'Marcus Johnson',
            role: 'CEO, TechFlow',
            avatarAlt:
              'Professional headshot of Marcus Johnson, a tech startup founder with short hair and glasses',
          },
          {
            quote:
              "I've tried dozens of habit apps over the years. HabitStack is the only one that stuck. The social features and beautiful design make tracking habits actually enjoyable. I've lost 30 pounds and read 52 books this year!",
            name: 'Emma Wilson',
            role: 'Software Engineer, Google',
            avatarAlt:
              'Professional headshot of Emma Wilson, a software engineer with blonde hair and a friendly smile',
          },
          {
            quote:
              'The analytics in HabitStack Pro helped me identify that I skip workouts on Thursdays. Now I schedule lighter activities that day and my consistency shot up to 94%. Data-driven habit building actually works!',
            name: 'David Park',
            role: 'Data Analyst, Spotify',
            avatarAlt:
              'Professional headshot of David Park, a data analyst with short dark hair and a confident expression',
          },
          {
            quote:
              'My therapy clients use HabitStack to track their mental health habits between sessions. The insights they bring to our meetings have dramatically improved our work together. I recommend it to everyone.',
            name: 'Dr. Lisa Martinez',
            role: 'Clinical Psychologist',
            avatarAlt:
              'Professional headshot of Dr. Lisa Martinez, a clinical psychologist with warm smile and professional attire',
          },
          {
            quote:
              'Rolling out HabitStack to our 200-person team improved employee wellness scores by 34% in just six months. The team challenges feature creates incredible camaraderie across departments.',
            name: 'James Thompson',
            role: 'VP People Ops, Stripe',
            avatarAlt:
              'Professional headshot of James Thompson, a VP of People Operations with short hair and friendly demeanor',
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? 'Pricing'
    const pricingHeading =
      props.pricing?.heading ?? 'Simple, transparent pricing'
    const pricingDesc =
      props.pricing?.description ??
      "Start free and upgrade when you're ready to supercharge your habits."
    const pricingNote =
      props.pricing?.note ??
      'All plans include a 14-day free trial. No credit card required to start.'
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: 'Free',
            tagline: 'Perfect for getting started',
            price: '$0',
            period: '/month',
            cta: 'Get Started Free',
            featured: false,
            features: [
              'Up to 3 habits',
              'Basic streak tracking',
              'Daily reminders',
              '7-day history',
            ],
          },
          {
            name: 'Pro',
            tagline: 'For serious habit builders',
            price: '$4.99',
            period: '/month',
            billingNote: 'Billed annually ($59.88/year)',
            cta: 'Start Pro Trial',
            featured: true,
            features: [
              'Unlimited habits',
              'Advanced analytics',
              'Smart reminders',
              'Unlimited history',
              'Accountability groups',
              'Apple Health sync',
            ],
          },
          {
            name: 'Teams',
            tagline: 'For organizations',
            price: '$9.99',
            period: '/user/mo',
            billingNote: 'Minimum 5 users',
            cta: 'Contact Sales',
            featured: false,
            features: [
              'Everything in Pro',
              'Team challenges',
              'Admin dashboard',
              'Priority support',
              'Custom branding',
            ],
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? 'FAQ'
    const faqHeading = props.faq?.heading ?? 'Frequently asked questions'
    const faqDesc =
      props.faq?.description ?? 'Everything you need to know about HabitStack.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: 'Is HabitStack really free?',
            answer:
              "Yes! Our free plan lets you track up to 3 habits with basic features forever. No credit card required, no time limits. Upgrade to Pro when you're ready for unlimited habits and advanced features.",
          },
          {
            question: 'Can I sync with Apple Health or Google Fit?',
            answer:
              'Absolutely! Pro users can sync with Apple Health, Google Fit, Samsung Health, Fitbit, Garmin, and over 50 other fitness apps. Your workouts automatically count toward your exercise habits.',
          },
          {
            question: 'What happens if I break a streak?',
            answer:
              'Life happens! HabitStack Pro includes “Rest Days” and “Sick Days” that protect your streak. You can also customize streak rules—some users prefer counting “4 out of 7 days” as a week success rather than demanding perfection.',
          },
          {
            question: 'Can I share habits with friends?',
            answer:
              'Yes! Pro users can create or join accountability groups. Share progress, compete on leaderboards, send encouraging messages, and build habits together. Many of our users report that social accountability doubles their success rate.',
          },
          {
            question: 'Is my data private and secure?',
            answer:
              "Your privacy is our priority. All data is encrypted in transit and at rest. We never sell your data to third parties. Export or delete all your data anytime from your account settings. We're GDPR compliant and SOC 2 certified.",
          },
          {
            question: 'How do I cancel my subscription?',
            answer:
              "You can cancel anytime from your account settings—no phone calls or emails required. If you cancel, you'll keep Pro features until the end of your billing period. We also offer a 30-day money-back guarantee, no questions asked.",
          },
        ]
    const faqContactPrompt = props.faq?.contactPrompt ?? 'Still have questions?'
    const faqContactCta = props.faq?.contactCta ?? 'Contact our support team'

    const ctaHeading = props.cta?.heading ?? 'Ready to transform your life?'
    const ctaDesc =
      props.cta?.description ??
      'Join 500,000+ people building better habits with HabitStack. Start your free trial today—no credit card required.'
    const ctaAppStore = props.cta?.appStoreCta ?? 'Download for iOS'
    const ctaPlayStore = props.cta?.playStoreCta ?? 'Download for Android'
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ['Secure & Private', '14-day free trial', 'Cancel anytime']

    const footerTagline =
      props.footer?.tagline ??
      'Build better habits, one day at a time. Join 500,000+ people transforming their lives through small, consistent actions.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: 'Product',
            links: [
              'Features',
              'Pricing',
              'Templates',
              'Integrations',
              'Changelog',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Security', 'Cookies'],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerMadeIn =
      props.footer?.madeIn ?? 'Made with care in San Francisco'

    // Brand logo mark (decorative check-in-circle, brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
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
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const AppStoreIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M17.707 10.708L16.293 9.294 13 12.586V3h-2v9.586l-3.293-3.292-1.414 1.414L12 16.414l5.707-5.706zM5 16v4h14v-4h2v4c0 1.103-.897 2-2 2H5c-1.103 0-2-.897-2-2v-4h2z" />
      </svg>
    )

    const PlayStoreIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('size-5', className)}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const CheckCircleIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('size-5', className)}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('size-5 shrink-0', className)}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const ArrowRight = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const featureIcons = [
      // flame / streak
      <svg
        key="flame"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>,
      // bell
      <svg
        key="bell"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>,
      // chart
      <svg
        key="chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // users
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
      // clock
      <svg
        key="clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // sync
      <svg
        key="sync"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          'min-h-svh bg-muted/30 font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav
            className="w-full px-4 sm:px-6 lg:px-8 xl:px-12"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground lg:size-10">
                  <LogoMark className="size-5 lg:size-6" />
                </span>
                <span className="text-xl font-bold tracking-tight lg:text-2xl">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Saved features"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {savedCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {savedCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">
                        Saved Features
                      </SheetTitle>
                      <SheetDescription>
                        {savedCount > 0
                          ? `${savedCount} feature${savedCount === 1 ? '' : 's'} saved for later.`
                          : 'No features saved yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {savedFeatures && savedFeatures.length > 0 ? (
                        <div className="space-y-4">
                          {savedFeatures.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-4 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                                <svg
                                  className="size-8 text-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-foreground">
                                  {item.featureTitle}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.featureDescription}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No saved features
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Click the heart icon on any feature to save it for
                            later.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={() => {
                          for (const item of savedFeatures ?? []) {
                            void removeFeature(item.featureTitle)
                          }
                        }}
                        disabled={!savedFeatures || savedFeatures.length === 0}
                      >
                        Clear All
                      </Button>
                      <SheetClose asChild>
                        <Button type="button" className="w-full rounded-full">
                          Continue
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
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
                        <ChevronDown />
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
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Settings')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Settings
                          <ArrowRight />
                        </button>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Sign out
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    aria-label="Sign in with Google"
                    className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    <span>{authLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 lg:px-5 lg:py-2.5"
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
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
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden pb-16 pt-32 lg:pb-24 lg:pt-40"
            aria-labelledby="hero-heading"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
            <div
              aria-hidden="true"
              className="absolute right-0 top-20 -z-10 size-96 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 -z-10 size-72 rounded-full bg-accent/30 blur-3xl"
            />

            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="flex size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
                  >
                    {heroTop}
                    <br />
                    <span className="text-primary">{heroHighlight}</span>{' '}
                    {heroRest}
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>

                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroAppStore)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-foreground px-6 py-3 text-background shadow-xl shadow-foreground/20 transition-all hover:bg-foreground/90"
                    >
                      <AppStoreIcon className="size-7" />
                      <span className="text-left">
                        <span className="block text-xs text-background/70">
                          Download on the
                        </span>
                        <span className="block text-sm font-bold">
                          {heroAppStore}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroPlayStore)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-foreground px-6 py-3 text-background shadow-xl shadow-foreground/20 transition-all hover:bg-foreground/90"
                    >
                      <PlayStoreIcon className="size-7" />
                      <span className="text-left">
                        <span className="block text-xs text-background/70">
                          Get it on
                        </span>
                        <span className="block text-sm font-bold">
                          {heroPlayStore}
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    <span className="flex items-center gap-2">
                      <StarIcon className="text-primary" />
                      <span className="font-semibold text-foreground">
                        {heroAppRating}
                      </span>{' '}
                      App Store
                    </span>
                    <span className="flex items-center gap-2">
                      <StarIcon className="text-primary" />
                      <span className="font-semibold text-foreground">
                        {heroPlayRating}
                      </span>{' '}
                      Google Play
                    </span>
                    <span>{heroDownloads}</span>
                  </div>
                </div>

                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-primary to-accent opacity-30 blur-2xl"
                    />
                    <div className="relative">
                      <Image
                        alt={heroImageAlt}
                        w={400}
                        h={800}
                        className="w-64 rounded-[2.5rem] border-8 border-foreground object-cover shadow-2xl sm:w-72 lg:w-80"
                      />
                      <div className="absolute -bottom-4 -left-8 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-xl">
                        <div className="grid size-12 place-items-center rounded-full bg-primary/15">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-6 text-primary"
                            aria-hidden="true"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-card-foreground">
                            {chipTitle}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {chipSubtitle}
                          </div>
                        </div>
                      </div>
                      <div className="absolute -right-8 -top-4 rounded-2xl bg-card p-4 shadow-xl">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {communityAvatars.map((a) => (
                              <Image
                                key={a}
                                alt={a}
                                w={80}
                                h={80}
                                className="size-8 rounded-full border-2 border-card object-cover"
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-card-foreground">
                            {communityLabel}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {communitySubtitle}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured-in logos */}
          <section
            className="border-y border-border bg-background py-12 lg:py-16"
            aria-label="Featured in"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {logoItems.map((logo) => (
                  <div
                    key={logo}
                    className="flex items-center gap-2 text-xl font-bold text-foreground"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-8"
                      aria-hidden="true"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            id="features"
            className="bg-background py-20 lg:py-28"
            aria-labelledby="features-heading"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {featuresEyebrow}
                </span>
                <h2
                  id="features-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {featureItems.map((item, i) => {
                  const isSaved =
                    savedFeatures?.some((f) => f.featureTitle === item.title) ??
                    false
                  return (
                    <div
                      key={item.title}
                      className="group relative rounded-2xl bg-muted/60 p-6 transition-colors hover:bg-primary/10 lg:p-8"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void saveFeature(item.title, item.description)
                        }
                        aria-pressed={isSaved}
                        aria-label={
                          isSaved
                            ? `Remove ${item.title} from saved features`
                            : `Save ${item.title} to features`
                        }
                        className={cn(
                          'absolute right-4 top-4 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          isSaved
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-foreground hover:bg-background',
                        )}
                      >
                        <HeartIcon active={isSaved} />
                      </button>
                      <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                        {featureIcons[i % featureIcons.length]}
                      </div>
                      <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section
            id="how-it-works"
            className="bg-muted/40 py-20 lg:py-28"
            aria-labelledby="steps-heading"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {stepsEyebrow}
                </span>
                <h2
                  id="steps-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="flex items-start gap-6 lg:flex-col lg:items-center">
                      <div className="relative z-10 grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/30">
                        {i + 1}
                      </div>
                      <div className="flex-1 lg:text-center">
                        <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                        <p className="mb-4 text-muted-foreground">
                          {step.description}
                        </p>
                        <Image
                          alt={step.imageAlt}
                          w={300}
                          h={200}
                          loading="lazy"
                          className="mx-auto w-full rounded-xl object-cover shadow-lg lg:w-64"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 flex justify-center lg:mt-20">
                <div className="flex flex-wrap justify-center gap-4">
                  {stepBadges.map((badge) => (
                    <span
                      key={badge}
                      className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm"
                    >
                      <CheckCircleIcon className="text-primary" />
                      <span className="text-sm font-medium text-card-foreground">
                        {badge}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section
            className="overflow-hidden bg-background py-20 lg:py-28"
            aria-labelledby="gallery-heading"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {galleryEyebrow}
                </span>
                <h2
                  id="gallery-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>

              <div className="relative">
                <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8">
                  {galleryItems.map((item) => (
                    <div key={item.label} className="shrink-0 snap-center">
                      <div className="group relative">
                        <Image
                          alt={item.imageAlt}
                          w={300}
                          h={600}
                          loading="lazy"
                          className="h-[500px] w-64 rounded-[2rem] border-8 border-foreground object-cover shadow-2xl"
                        />
                        <div className="absolute inset-0 flex items-end justify-center rounded-[2rem] bg-gradient-to-t from-foreground/60 via-transparent to-transparent pb-8 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="font-semibold text-background">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  {galleryItems.map((item, i) => (
                    <span
                      key={item.label}
                      className={cn(
                        'size-2 rounded-full',
                        i === 0 ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section
            className="bg-primary py-16 text-primary-foreground lg:py-20"
            aria-label="Statistics"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold lg:text-5xl">
                      {s.value}
                    </div>
                    <div className="font-medium text-primary-foreground/70">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="bg-muted/40 py-20 lg:py-28"
            aria-labelledby="pricing-heading"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {pricingEyebrow}
                </span>
                <h2
                  id="pricing-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 lg:gap-8">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      'relative rounded-2xl bg-card p-6 lg:p-8',
                      tier.featured
                        ? 'border-2 border-primary shadow-xl lg:-translate-y-4'
                        : 'border border-border shadow-sm',
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-xl font-bold text-card-foreground">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-card-foreground">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground">
                        {tier.period}
                      </span>
                    </div>
                    {tier.billingNote && (
                      <p className="mb-6 text-sm text-muted-foreground">
                        {tier.billingNote}
                      </p>
                    )}
                    <ul className="mb-8 space-y-3">
                      {tier.features?.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <CheckIcon className="text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        'block w-full rounded-xl px-4 py-3 text-center font-semibold transition-colors',
                        tier.featured
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90'
                          : 'bg-muted text-foreground hover:bg-accent',
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

          {/* Testimonials */}
          <section
            id="testimonials"
            className="bg-background py-20 lg:py-28"
            aria-labelledby="testimonials-heading"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2
                  id="testimonials-heading"
                  className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
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
                    className="rounded-2xl bg-muted/60 p-6 lg:p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="text-primary" />
                      ))}
                    </div>
                    <p className="mb-6 text-foreground/80">
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

          {/* FAQ */}
          <section
            id="faq"
            className="bg-muted/40 py-20 lg:py-28"
            aria-labelledby="faq-heading"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="mx-auto max-w-3xl">
                <div className="mb-16 text-center lg:mb-20">
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {faqEyebrow}
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
                    <details
                      key={item.question}
                      className="group rounded-xl border border-border bg-card"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                        <span className="text-lg font-semibold text-card-foreground">
                          {item.question}
                        </span>
                        <span className="ml-6 shrink-0">
                          <ChevronDown />
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-muted-foreground">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <p className="mb-4 text-muted-foreground">
                    {faqContactPrompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(faqContactCta)}
                    className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    {faqContactCta}
                    <ArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Download CTA */}
          <section
            id="download"
            className="bg-background py-20 lg:py-28"
            aria-labelledby="cta-heading"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent">
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 size-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
                />

                <div className="relative px-8 py-16 text-center lg:px-16 lg:py-20">
                  <h2
                    id="cta-heading"
                    className="mb-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl"
                  >
                    {ctaHeading}
                  </h2>
                  <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80 lg:text-xl">
                    {ctaDesc}
                  </p>

                  <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(ctaAppStore)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-background px-8 py-4 font-bold text-foreground shadow-xl transition-colors hover:bg-muted"
                    >
                      <AppStoreIcon className="size-6" />
                      {ctaAppStore}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaPlayStore)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-background px-8 py-4 font-bold text-foreground shadow-xl transition-colors hover:bg-muted"
                    >
                      <PlayStoreIcon className="size-6" />
                      {ctaPlayStore}
                    </button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/80">
                    {ctaBadges.map((badge) => (
                      <span key={badge} className="flex items-center gap-2">
                        <CheckCircleIcon />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mx-auto mt-16 max-w-4xl text-center">
                <h3 className="mb-4 text-2xl font-bold text-foreground lg:text-3xl">
                  Stay Updated
                </h3>
                <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground lg:text-lg">
                  Get the latest tips, features, and updates delivered to your
                  inbox.
                </p>
                <form
                  className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const email = form.querySelector(
                      'input[type="email"]',
                    ) as HTMLInputElement
                    if (email.value) {
                      void subscribeNewsletter(email.value)
                      email.value = ''
                    }
                  }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    aria-label="Email address for newsletter"
                    required
                    className="flex-1 rounded-full border border-border bg-background px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="mt-4 text-sm text-muted-foreground">
                  By subscribing, you agree to our Privacy Policy. Unsubscribe
                  anytime.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="bg-foreground py-12 text-background/70 lg:py-16"
          aria-label="Footer"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <LogoMark className="size-5" />
                  </span>
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {(['Twitter', 'Instagram', 'LinkedIn'] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {social === 'Twitter' && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5"
                            aria-hidden="true"
                          >
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        )}
                        {social === 'Instagram' && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {social === 'LinkedIn' && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
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

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">{footerNote}</p>
              <p className="text-sm text-background/50">{footerMadeIn}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
