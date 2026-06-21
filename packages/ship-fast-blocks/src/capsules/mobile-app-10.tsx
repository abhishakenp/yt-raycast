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
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * MobileAppKimiPage10 — complete mobile-app landing page, v10 sibling style.
 *
 * This is the 10th variant sibling to MobileAppKimiPage. It features a vibrant
 * green-forward habit-tracker aesthetic (HabitFlow) with a hero phone-mockup that
 * renders the entire app UI in CSS, floating streak/goal-complete cards, a
 * bento-grid feature wall with a large highlight card, a press-logo strip, a
 * numbered 3-step walkthrough with photos, a masonry screenshot gallery, an
 * inverted gradient stats band, a 3-tier pricing table (Free / Pro / Family),
 * a 6-up testimonials wall with star ratings, an accordion FAQ, a bold gradient
 * download CTA, and a dark multi-column footer with social icons.
 *
 * Every link, CTA, button and nav item routes through useNavigate. All imagery
 * uses the alt-driven <Image> component. All colors are semantic theme tokens.
 */
export const MobileAppKimiPage10 = defineCapsule({
  name: 'MobileAppKimiPage10',
  description:
    'Mobile-app landing page v10 — the 10th style sibling to MobileAppKimiPage. A bright, energetic, conversion-optimized habit-tracker marketing page with a CSS phone-mockup hero, floating streak/goal cards, bento feature grid, press logos, numbered 3-step walkthrough, masonry gallery, inverted stats band, 3-tier pricing, 6-up testimonials with star ratings, FAQ accordion, gradient download CTA, and dark footer. Use for consumer mobile apps, habit trackers, fitness/wellness apps, productivity apps, or any App-Store-distributed product site when a colorful, modern, app-store-conversion-focused page is wanted with strong primary brand presence. Supply brand, nav, hero, logos, features, steps, gallery, stats, testimonials, pricing, faq, cta, footer; the block owns all layout, spacing, and theming.',
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
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProofRating: z.string().optional(),
        socialProofCount: z.string().optional(),
        streakValue: z.string().optional(),
        streakLabel: z.string().optional(),
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
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              large: z.boolean().optional(),
              iconSvg: z.string().optional(),
            }),
          )
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
        items: z
          .array(
            z.object({
              alt: z.string(),
              captionTitle: z.string().optional(),
              captionDesc: z.string().optional(),
              large: z.boolean().optional(),
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
    /** Testimonials wall. */
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
    /** Download CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryLabel: z.string().optional(),
        secondaryLabel: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        socials: z.array(z.string()).optional(),
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      subscriptions: table({
        plan: string(),
        email: string(),
      }),
      favorites: table({
        featureName: string(),
      }),
      subscribers: table({
        email: string(),
      }),
    },
    queries: {
      subscriptions: ({ db }) => db.subscriptions.orderBy('createdAt').all(),
      favoriteFeatureNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.featureName)),
      subscriberCount: ({ db }) => db.subscribers.all().length,
    },
    mutations: {
      subscribeToPlan: ({ db }, plan: string, email: string) => {
        db.subscriptions.insert({ plan, email })
        return db.subscriptions.all()
      },
      toggleFavorite: ({ db }, featureName: string) => {
        const existingFavorite = db.favorites
          .where('featureName', featureName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ featureName })
        return true
      },
      subscribeToNewsletter: ({ db }, email: string) => {
        const existing = db.subscribers.where('email', email).all()[0]
        if (!existing) {
          db.subscribers.insert({ email })
        }
        return db.subscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [subscriptionOpen, setSubscriptionOpen] = useState(false)
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const brand = props.brand ?? 'HabitFlow'

    const favoriteFeatureNames = lakebed.useQuery('favoriteFeatureNames')
    const subscriberCount = lakebed.useQuery('subscriberCount')
    const subscribeToPlan = lakebed.useMutation('subscribeToPlan')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const subscribeToNewsletter = lakebed.useMutation('subscribeToNewsletter')
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

    const handleNewsletterSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (newsletterEmail) {
        void subscribeToNewsletter(newsletterEmail)
        setNewsletterEmail('')
      }
    }
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How It Works', 'Pricing', 'Reviews', 'Download App']

    const heroBadge = props.hero?.badge ?? 'Over 2 million habits tracked'
    const heroTop = props.hero?.headingTop ?? 'Build Better Habits,'
    const heroAccent = props.hero?.headingAccent ?? 'One Day at a Time'
    const heroSub =
      props.hero?.subheading ??
      'Join 500,000+ people using science-backed methods to build lasting habits. Track your streaks, celebrate milestones, and become the person you want to be.'
    const heroPrimary = props.hero?.primaryCta ?? 'Download on the App Store'
    const heroSecondary = props.hero?.secondaryCta ?? 'Get it on Google Play'
    const heroRating = props.hero?.socialProofRating ?? '4.9'
    const heroRatingCount = props.hero?.socialProofCount ?? '12,847'
    const streakValue = props.hero?.streakValue ?? '42'
    const streakLabel = props.hero?.streakLabel ?? 'Current streak'
    const chipTitle = props.hero?.chipTitle ?? 'Goal Complete!'
    const chipSubtitle = props.hero?.chipSubtitle ?? 'You hit your daily target'

    const logosLabel = props.logos?.label ?? 'Featured in leading publications'
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          'TechCrunch',
          'Wired',
          'Forbes',
          'The Verge',
          'Lifehacker',
          'Product Hunt',
        ]

    const featuresHeading =
      props.features?.heading ?? 'Everything you need to build lasting habits'
    const featuresDesc =
      props.features?.description ??
      'Science-backed features designed to help you stay consistent, motivated, and achieve your goals.'
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: 'Smart Reminders That Actually Work',
            description:
              'AI-powered notifications that learn your patterns. Get reminded at the perfect time based on your completion history, location, and daily routine.',
            large: true,
          },
          {
            title: 'Visual Streak Tracking',
            description:
              "Watch your streaks grow with beautiful flame animations. Don't break the chain!",
          },
          {
            title: 'Deep Analytics & Insights',
            description:
              'Track completion rates, identify patterns, and see your progress with beautiful charts.',
          },
          {
            title: 'Habit Groups',
            description:
              'Join communities of people building the same habits. Share progress and stay accountable.',
          },
          {
            title: 'Homescreen Widgets',
            description:
              'Track habits at a glance with iOS and Android widgets. Mark complete without opening the app.',
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? 'Start building habits in 3 simple steps'
    const stepsDesc =
      props.steps?.description ??
      'No complicated setup. Start tracking your first habit in under 60 seconds.'
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Download & Sign Up',
            description:
              'Get the app free from the App Store or Google Play. Create your account in seconds with Apple, Google, or email.',
            imageAlt: 'Person holding smartphone showing app onboarding screen',
          },
          {
            title: 'Add Your Habits',
            description:
              'Choose from 50+ templates like "Drink Water" or create custom habits. Set reminders, goals, and track metrics.',
            imageAlt:
              'Notebook with handwritten habit tracking list and checkmarks',
          },
          {
            title: 'Track & Improve',
            description:
              'Mark habits complete with one tap. Watch your streaks grow and see your progress with beautiful analytics.',
            imageAlt:
              'Digital dashboard showing colorful analytics charts and graphs',
          },
        ]

    const galleryHeading = props.gallery?.heading ?? 'Beautiful by design'
    const galleryDesc =
      props.gallery?.description ??
      'Every pixel crafted for clarity, delight, and motivation.'
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            alt: 'iPhone mockup displaying habit tracker app interface with daily checklist',
            captionTitle: 'Daily Overview',
            captionDesc: 'See all your habits at a glance',
            large: true,
          },
          {
            alt: 'Mobile app screen showing weekly streak statistics with flame icon',
          },
          {
            alt: 'Analytics dashboard showing habit completion charts and graphs',
          },
          {
            alt: 'iPhone screen showing habit group community interface',
          },
          {
            alt: 'Mobile phone showing achievement badge collection screen',
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '2.1M+', label: 'Habits Tracked' },
          { value: '500K+', label: 'Active Users' },
          { value: '847K', label: 'Days Logged' },
          { value: '4.9\u2605', label: 'App Store Rating' },
        ]

    const pricingHeading =
      props.pricing?.heading ?? 'Simple, transparent pricing'
    const pricingDesc =
      props.pricing?.description ??
      "Start free, upgrade when you're ready. No hidden fees, cancel anytime."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: 'Free',
            tagline: 'Perfect for getting started with habit tracking.',
            price: '$0',
            period: '/month',
            cta: 'Get Started Free',
            featured: false,
            features: [
              { label: 'Up to 3 habits', included: true },
              { label: 'Basic reminders', included: true },
              { label: '7-day history', included: true },
              { label: 'Widgets', included: false },
              { label: 'Data export', included: false },
            ],
          },
          {
            name: 'Pro',
            tagline: 'For serious habit builders who want maximum results.',
            price: '$4.99',
            period: '/month',
            cta: 'Start 14-Day Free Trial',
            featured: true,
            features: [
              { label: 'Unlimited habits', included: true },
              { label: 'Smart AI reminders', included: true },
              { label: 'Unlimited history', included: true },
              { label: 'All widgets', included: true },
              { label: 'CSV & JSON export', included: true },
              { label: 'Priority support', included: true },
            ],
          },
          {
            name: 'Family',
            tagline:
              'Share with up to 5 family members. Track together, grow together.',
            price: '$9.99',
            period: '/month',
            cta: 'Start Free Trial',
            featured: false,
            features: [
              { label: 'Everything in Pro', included: true },
              { label: '5 family members', included: true },
              { label: 'Shared challenges', included: true },
              { label: 'Family leaderboards', included: true },
              { label: 'Parent controls', included: true },
            ],
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? 'Loved by thousands'
    const testimonialsDesc =
      props.testimonials?.description ??
      'See what our community has to say about their transformation.'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've tried every habit app out there. HabitFlow is the only one that stuck. I'm 156 days into my reading habit—longest streak of my life. The streak visualization is incredibly motivating.",
            name: 'Sarah Chen',
            role: 'Product Manager at Stripe',
            avatarAlt:
              'Professional headshot of Sarah Chen, a smiling woman with dark hair',
          },
          {
            quote:
              "The family plan has been a game-changer for us. My kids actually compete to see who can keep their streaks going longest. We've never been more consistent with our morning routines.",
            name: 'Marcus Rodriguez',
            role: 'Father of three, Austin TX',
            avatarAlt:
              'Professional headshot of Marcus Rodriguez, a father of three',
          },
          {
            quote:
              "As a therapist, I recommend HabitFlow to all my clients working on behavior change. The data export feature lets us analyze patterns together. It's backed by actual behavioral science.",
            name: 'Dr. Emily Watson',
            role: 'Clinical Psychologist',
            avatarAlt:
              'Professional headshot of Dr. Emily Watson, a clinical psychologist',
          },
          {
            quote:
              "Lost 30 pounds by tracking my daily habits with HabitFlow. The smart reminders knew exactly when to nudge me. Best $5 I've ever spent.",
            name: 'James Kim',
            role: 'Software Engineer, Seattle',
            avatarAlt:
              'Professional headshot of James Kim, a software engineer who lost weight',
          },
          {
            quote:
              "The UI is simply gorgeous. I've used other habit apps that feel cluttered. HabitFlow makes me want to open it every day. The widget on my home screen keeps me accountable.",
            name: 'Priya Patel',
            role: 'UX Designer, Google',
            avatarAlt: 'Professional headshot of Priya Patel, a UX designer',
          },
          {
            quote:
              "Mediated 200+ days of meditation using HabitFlow. The habit groups kept me going when I wanted to quit. Now I'm the one motivating others!",
            name: 'Elena Rodriguez',
            role: 'Yoga Instructor, Barcelona',
            avatarAlt:
              'Professional headshot of Elena Rodriguez, a yoga instructor',
          },
        ]

    const faqHeading = props.faq?.heading ?? 'Frequently asked questions'
    const faqDesc =
      props.faq?.description ?? 'Everything you need to know about HabitFlow.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: 'Is there a free version?',
            answer:
              'Yes! HabitFlow is free to download and use forever with up to 3 habits, basic reminders, and 7-day history. Upgrade to Pro ($4.99/month) or Family ($9.99/month) for unlimited habits, smart reminders, widgets, data export, and more.',
          },
          {
            question: 'Can I export my data?',
            answer:
              'Pro and Family subscribers can export their complete habit history in CSV or JSON format at any time. Your data belongs to you. We also support automatic backups to iCloud, Google Drive, and Dropbox.',
          },
          {
            question: 'How do smart reminders work?',
            answer:
              "Our AI analyzes your completion patterns and suggests the optimal reminder times. For example, if you usually complete your workout at 7:15 AM, we'll remind you at 7:00 AM. If you're at the gym (detected via location), we'll remind you to log your workout before you leave.",
          },
          {
            question: 'Is my data private?',
            answer:
              'Absolutely. Your habit data is encrypted and stored securely. We never sell your data to third parties. You can use HabitFlow completely anonymously if you choose, or sign in with Apple to keep your email private.',
          },
          {
            question: 'Can I use HabitFlow on multiple devices?',
            answer:
              'Yes! Your data syncs seamlessly across all your devices—iPhone, iPad, Android phones and tablets, and Apple Watch. One account, all platforms. Web app coming in Q2 2026.',
          },
          {
            question: 'What if I break my streak?',
            answer:
              'Life happens! HabitFlow has a "Rest Day" feature for planned breaks (vacation, illness) that preserves your streak. If you do miss a day, we show you your "best streak" alongside your current one to keep you motivated. Progress over perfection.',
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? 'Start building better habits today'
    const ctaDesc =
      props.cta?.description ??
      'Join 500,000+ people who are transforming their lives, one habit at a time. Free forever plan available.'
    const ctaPrimary = props.cta?.primaryLabel ?? 'Download on the App Store'
    const ctaSecondary = props.cta?.secondaryLabel ?? 'Get it on Google Play'
    const ctaNote =
      props.cta?.note ?? 'No credit card required. Cancel anytime.'

    const footerTagline =
      props.footer?.tagline ??
      'Build better habits, one day at a time. Join 500,000+ people transforming their lives.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: 'Product',
            links: [
              'Features',
              'Pricing',
              'Download',
              'Integrations',
              'Changelog',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'],
          },
          {
            title: 'Resources',
            links: [
              'Help Center',
              'Community',
              'Habit Guides',
              'API Docs',
              'Status',
            ],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Security', 'Cookies'],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['Twitter', 'Instagram', 'LinkedIn']
    const footerNote =
      props.footer?.note ??
      `\u00A9 ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // --- helper components ---

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn('text-primary', className)}
        aria-hidden="true"
      >
        <rect width="24" height="24" rx="6" fill="currentColor" />
        <path
          d="M7 12.5L10.5 16L17 9.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-background"
        />
      </svg>
    )

    const CheckMarkIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
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

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('text-primary', className)}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
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
        className="size-5"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
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

    const SocialIcon = ({ name }: { name: string }) => {
      if (name === 'Twitter') {
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      }
      if (name === 'Instagram') {
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        )
      }
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    }

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* ========== NAVBAR ========== */}
        <nav
          className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
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
                        <ChevronDownIcon />
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
                  className="hidden items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 sm:inline-flex"
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
          </div>
        </nav>

        {/* ========== HERO ========== */}
        <section
          className="relative overflow-hidden bg-gradient-to-b from-muted via-background to-background pb-24 pt-16"
          aria-label="Hero section"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left column */}
              <div className="text-center lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 shadow-sm">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {heroBadge}
                  </span>
                </div>

                <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  {heroTop}{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {heroAccent}
                  </span>
                </h1>

                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl lg:mx-0">
                  {heroSub}
                </p>

                <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-foreground px-8 py-4 text-base font-semibold text-background shadow-lg shadow-foreground/20 transition-all hover:bg-foreground/90 hover:shadow-xl"
                  >
                    <AppleIcon />
                    <div className="text-left">
                      <div className="text-xs opacity-80">Download on the</div>
                      <div className="text-lg leading-none">App Store</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-all hover:border-primary hover:bg-primary/10"
                  >
                    <PlayIcon />
                    <div className="text-left">
                      <div className="text-xs opacity-60">Get it on</div>
                      <div className="text-lg leading-none">Google Play</div>
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 lg:justify-start">
                  <div className="flex -space-x-3">
                    {[
                      'Professional headshot of a smiling woman with brown hair',
                      'Professional headshot of a man with short curly hair and beard',
                      'Professional headshot of a woman with blonde hair smiling',
                      'Professional headshot of a middle-aged man with glasses',
                    ].map((a) => (
                      <Image
                        key={a}
                        alt={a}
                        w={100}
                        h={100}
                        className="size-10 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {heroRating}
                    </span>{' '}
                    from{' '}
                    <span className="font-semibold text-foreground">
                      {heroRatingCount}
                    </span>{' '}
                    reviews
                  </div>
                </div>
              </div>

              {/* Right column — phone mockup */}
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl"
                />
                <div className="relative mx-auto w-72 sm:w-80">
                  {/* Phone Frame */}
                  <div className="relative rounded-[3rem] bg-foreground p-3 shadow-2xl shadow-foreground/30">
                    <div className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-foreground" />
                    <div className="aspect-[9/19] overflow-hidden rounded-[2.5rem] bg-background">
                      {/* App UI inside mockup */}
                      <div className="flex h-full flex-col bg-gradient-to-b from-muted to-background p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-lg font-bold text-foreground">
                            {brand}
                          </div>
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-semibold text-primary">
                              JD
                            </span>
                          </div>
                        </div>
                        <div className="mb-1 text-2xl font-bold text-foreground">
                          Tuesday, Jan 14
                        </div>
                        <div className="mb-4 text-sm text-muted-foreground">
                          3 of 5 habits completed
                        </div>

                        {/* Habit Items */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-sm">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-5 text-primary"
                                aria-hidden="true"
                              >
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">
                                Morning Workout
                              </div>
                              <div className="text-xs text-muted-foreground">
                                7:00 AM \u2022 24 day streak
                              </div>
                            </div>
                            <div className="flex size-6 items-center justify-center rounded-full bg-primary">
                              <CheckMarkIcon className="size-4 text-background" />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-sm">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/20">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-5 text-accent"
                                aria-hidden="true"
                              >
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">
                                Read 20 Pages
                              </div>
                              <div className="text-xs text-muted-foreground">
                                8:00 AM \u2022 156 day streak
                              </div>
                            </div>
                            <div className="flex size-6 items-center justify-center rounded-full bg-primary">
                              <CheckMarkIcon className="size-4 text-background" />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-sm">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-chart-4/20">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-5 text-chart-4"
                                aria-hidden="true"
                              >
                                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">
                                Drink 8 Glasses
                              </div>
                              <div className="text-xs text-muted-foreground">
                                All day \u2022 42 day streak
                              </div>
                            </div>
                            <div className="size-6 rounded-full border-2 border-border" />
                          </div>
                        </div>

                        {/* Progress Widget */}
                        <div className="mt-4 rounded-xl bg-gradient-to-r from-primary to-accent p-4 text-background">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-semibold">
                              Weekly Progress
                            </span>
                            <span className="text-sm opacity-90">82%</span>
                          </div>
                          <div className="flex gap-1">
                            {[100, 100, 100, 100, 80, 0, 0].map((w, i) => (
                              <div
                                key={i}
                                className="h-2 flex-1 rounded-full bg-background/30 overflow-hidden"
                              >
                                <div
                                  className="h-full rounded-full bg-background"
                                  style={{ width: `${w}%` }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating streak card */}
                  <div className="absolute -left-16 top-20 hidden rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/10 sm:block">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-2xl">
                        <span>🔥</span>
                      </div>
                      <div>
                        <div className="font-bold text-card-foreground">
                          {streakValue} Days
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {streakLabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating goal card */}
                  <div className="absolute -right-12 bottom-32 hidden rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/10 sm:block">
                    <div className="mb-2 flex items-center gap-2">
                      <StarIcon className="size-5" />
                      <span className="font-bold text-card-foreground">
                        {chipTitle}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {chipSubtitle}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== LOGOS ========== */}
        <section
          className="border-y border-border bg-muted/50 py-12"
          aria-label="Featured in"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {logosLabel}
            </p>
            <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
              {logoItems.map((logo) => (
                <div
                  key={logo}
                  className="flex items-center justify-center gap-2 grayscale transition-all hover:grayscale-0"
                >
                  <span className="text-xl font-bold text-muted-foreground">
                    {logo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FEATURES ========== */}
        <section className="py-24" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2
                id="features-heading"
                className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {featuresHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{featuresDesc}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featureItems.map((item, i) => {
                if (item.large) {
                  return (
                    <div
                      key={item.title}
                      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-8 text-background md:col-span-2 lg:col-span-2"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-background/10"
                      />
                      <div className="relative z-10">
                        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-background/20 backdrop-blur-sm">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-7 text-background"
                            aria-hidden="true"
                          >
                            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <h3 className="mb-3 text-2xl font-bold">
                          {item.title}
                        </h3>
                        <p className="mb-6 max-w-md text-background/90">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {['7AM', '12PM', '6PM'].map((t) => (
                              <div
                                key={t}
                                className="flex size-8 items-center justify-center rounded-full bg-background/20 text-xs backdrop-blur-sm"
                              >
                                {t}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-background/80">
                            3 personalized times today
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }

                const isFavorite =
                  favoriteFeatureNames?.has(item.title) ?? false

                return (
                  <div
                    key={item.title}
                    className="group rounded-3xl border border-border bg-card p-6 shadow-lg shadow-foreground/5 transition-all hover:shadow-xl hover:shadow-foreground/10"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={cn(
                          'flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110',
                          i % 4 === 0
                            ? 'bg-gradient-to-br from-primary/20 to-accent/20'
                            : i % 4 === 1
                              ? 'bg-gradient-to-br from-chart-2/20 to-chart-3/20'
                              : i % 4 === 2
                                ? 'bg-gradient-to-br from-chart-4/20 to-chart-5/20'
                                : 'bg-gradient-to-br from-secondary/20 to-muted',
                        )}
                      >
                        {i === 1 ? (
                          <span className="text-3xl">🔥</span>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn(
                              'size-7',
                              i % 4 === 0
                                ? 'text-primary'
                                : i % 4 === 1
                                  ? 'text-chart-2'
                                  : i % 4 === 2
                                    ? 'text-chart-4'
                                    : 'text-secondary',
                            )}
                            aria-hidden="true"
                          >
                            {i === 2 ? (
                              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            ) : i === 3 ? (
                              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            ) : (
                              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            )}
                          </svg>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void toggleFavorite(item.title)}
                        aria-pressed={isFavorite}
                        aria-label={`Save ${item.title} to favorites`}
                        className={cn(
                          'grid size-8 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          isFavorite
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <HeartIcon active={isFavorite} />
                      </button>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>

                    {/* Decorative mini-widgets for specific cards */}
                    {i === 1 && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {['1', '4', '2'].map((n, idx) => (
                            <div
                              key={idx}
                              className="flex size-6 items-center justify-center rounded-sm bg-gradient-to-t from-primary to-accent text-xs font-bold text-background"
                            >
                              {n}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          days streak
                        </span>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="mt-4 flex h-8 items-end gap-1">
                        {[40, 60, 45, 80, 100, 70, 90].map((h, idx) => (
                          <div
                            key={idx}
                            className="w-3 rounded-t"
                            style={{
                              height: `${h}%`,
                              background: `hsl(var(--primary))`,
                              opacity: 0.2 + idx * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {i === 3 && (
                      <div className="mt-4 flex -space-x-2">
                        {[
                          'Headshot of a young woman in a habit group',
                          'Headshot of a young man in a habit group',
                          'Headshot of a woman with curly hair in a habit group',
                        ].map((alt) => (
                          <Image
                            key={alt}
                            alt={alt}
                            w={100}
                            h={100}
                            className="size-8 rounded-full border-2 border-background object-cover"
                          />
                        ))}
                        <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold text-muted-foreground">
                          +2.4k
                        </div>
                      </div>
                    )}
                    {i === 4 && (
                      <div className="mt-4 rounded-xl bg-muted p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm">
                              <span>💧</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              Water
                            </span>
                          </div>
                          <div className="flex size-6 items-center justify-center rounded-md bg-primary">
                            <CheckMarkIcon className="size-4 text-background" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========== STEPS ========== */}
        <section
          className="bg-gradient-to-b from-muted to-background py-24"
          aria-labelledby="steps-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
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
                  <div
                    aria-hidden="true"
                    className={cn(
                      'absolute top-8 hidden h-0.5 w-full bg-gradient-to-r md:block',
                      i < 2 ? 'from-primary/30 to-muted' : 'hidden',
                    )}
                  />
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-foreground/5">
                    <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                      <span className="text-2xl font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {step.title}
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                      {step.description}
                    </p>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={step.imageAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== GALLERY ========== */}
        <section className="py-24" aria-labelledby="gallery-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2
                id="gallery-heading"
                className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {galleryHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{galleryDesc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {galleryItems.map((item) => (
                <div
                  key={item.alt}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl bg-muted',
                    item.large ? 'col-span-2 row-span-2' : '',
                  )}
                >
                  <Image
                    alt={item.alt}
                    w={item.large ? 800 : 400}
                    h={item.large ? 800 : 400}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.captionTitle && (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/60 to-transparent p-6">
                      <div className="text-background">
                        <p className="font-semibold">{item.captionTitle}</p>
                        <p className="text-sm text-background/80">
                          {item.captionDesc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== STATS ========== */}
        <section
          className="bg-gradient-to-r from-primary to-accent py-24"
          aria-label="Statistics"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 text-center sm:grid-cols-2 md:grid-cols-4">
              {statsItems.map((s) => (
                <div key={s.label}>
                  <div className="mb-2 text-4xl font-bold text-background sm:text-5xl">
                    {s.value}
                  </div>
                  <div className="text-background/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== PRICING ========== */}
        <section
          className="bg-muted/50 py-24"
          aria-labelledby="pricing-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2
                id="pricing-heading"
                className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {pricingHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{pricingDesc}</p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    'relative rounded-3xl p-8 shadow-lg shadow-foreground/5',
                    tier.featured
                      ? 'border-2 border-primary shadow-xl shadow-primary/10'
                      : 'border border-border bg-card',
                  )}
                >
                  {tier.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-block rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      'mb-4 text-sm font-semibold uppercase tracking-wider',
                      tier.featured ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {tier.name}
                  </div>

                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>

                  <p className="mb-8 text-muted-foreground">{tier.tagline}</p>

                  <ul className="mb-8 space-y-4">
                    {tier.features?.map((f) => (
                      <li key={f.label} className="flex items-center gap-3">
                        {f.included ? (
                          <CheckMarkIcon
                            className={cn(
                              'size-5 shrink-0',
                              tier.featured ? 'text-primary' : 'text-primary',
                            )}
                          />
                        ) : (
                          <CrossIcon className="size-5 shrink-0 text-muted-foreground/40" />
                        )}
                        <span
                          className={cn(
                            f.included
                              ? tier.featured
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                              : 'text-muted-foreground/60',
                          )}
                        >
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionOpen(true)
                    }}
                    className={cn(
                      'w-full rounded-xl py-3 px-6 font-semibold transition-colors',
                      tier.featured
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : tier.name === 'Family'
                          ? 'bg-foreground text-background hover:bg-foreground/90'
                          : 'bg-muted text-foreground hover:bg-accent',
                    )}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== TESTIMONIALS ========== */}
        <section className="py-24" aria-labelledby="testimonials-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2
                id="testimonials-heading"
                className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {testimonialsHeading}
              </h2>
              <p className="text-lg text-muted-foreground">
                {testimonialsDesc}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonialItems.map((t) => (
                <div key={t.name} className="rounded-2xl bg-muted p-6">
                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="size-5" />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-muted-foreground">
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
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FAQ ========== */}
        <section className="bg-muted/50 py-24" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
                  className="group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                    <span className="font-semibold text-card-foreground">
                      {item.question}
                    </span>
                    <span className="ml-6 shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                      <ChevronDownIcon />
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

        {/* ========== CTA ========== */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-accent py-24"
          aria-label="Download call-to-action"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
              {ctaHeading}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-background/90">
              {ctaDesc}
            </p>
            <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(ctaPrimary)}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-background px-8 py-4 font-semibold text-foreground shadow-xl transition-colors hover:bg-muted"
              >
                <AppleIcon />
                <div className="text-left">
                  <div className="text-xs opacity-60">Download on the</div>
                  <div className="text-lg leading-none font-bold">
                    App Store
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => go(ctaSecondary)}
                className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-background/30 bg-foreground/30 px-8 py-4 font-semibold text-background backdrop-blur-sm transition-colors hover:bg-foreground/40"
              >
                <PlayIcon />
                <div className="text-left">
                  <div className="text-xs opacity-80">Get it on</div>
                  <div className="text-lg leading-none font-bold">
                    Google Play
                  </div>
                </div>
              </button>
            </div>
            <form
              className="mx-auto mb-6 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address for newsletter"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 rounded-full border border-background/20 bg-background/10 px-6 py-4 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-background/30"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-full bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Subscribe
              </button>
            </form>
            {subscriberCount != null && subscriberCount > 0 && (
              <p className="text-sm text-background/60">
                Join {subscriberCount.toLocaleString()} subscribers
              </p>
            )}
            <p className="text-sm text-background/70">{ctaNote}</p>
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer
          className="bg-foreground py-16 text-background/80"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-lg bg-background/10 text-background transition-colors hover:bg-background/20"
                    >
                      <SocialIcon name={social} />
                    </button>
                  ))}
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
                          className="text-sm text-background/60 transition-colors hover:text-background"
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
              <div className="flex items-center gap-6 text-sm text-background/40">
                {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(
                  (l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => go(l)}
                      className="transition-colors hover:text-background"
                    >
                      {l}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </footer>

        {/* ========== SUBSCRIPTION DRAWER ========== */}
        <Sheet open={subscriptionOpen} onOpenChange={setSubscriptionOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Subscribe to {brand}</SheetTitle>
              <SheetDescription>
                Choose a plan that works for you. Start your free trial today.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      'relative rounded-2xl p-6 border',
                      tier.featured
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card',
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-4">
                      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {tier.name}
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          {tier.price}
                        </span>
                        <span className="text-muted-foreground">
                          {tier.period}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tier.tagline}
                      </p>
                    </div>
                    <ul className="mb-4 space-y-2">
                      {tier.features?.map((f) => (
                        <li
                          key={f.label}
                          className="flex items-center gap-2 text-sm"
                        >
                          {f.included ? (
                            <CheckMarkIcon className="size-4 text-primary" />
                          ) : (
                            <CrossIcon className="size-4 text-muted-foreground/40" />
                          )}
                          <span
                            className={cn(
                              f.included
                                ? 'text-foreground'
                                : 'text-muted-foreground/60',
                            )}
                          >
                            {f.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      onClick={() => {
                        if (isSignedIn && authEmail) {
                          void subscribeToPlan(tier.name, authEmail)
                          setSubscriptionOpen(false)
                        } else {
                          handleSignIn()
                        }
                      }}
                    >
                      {isSignedIn
                        ? `Subscribe to ${tier.name}`
                        : 'Sign in to Subscribe'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <SheetFooter className="border-t border-border p-6">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                >
                  Continue Browsing
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
