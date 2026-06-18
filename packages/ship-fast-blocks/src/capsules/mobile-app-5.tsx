import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

/**
 * MobileAppKimiPage5 — complete mobile-app / SaaS-app marketing LANDING page.
 *
 * The fifth style sibling to MobileAppKimiPage — a playful, colorful, high-energy
 * variant for habit-tracker, wellness, and lifestyle apps. Features a split hero with
 * built-from-divs phone mockup showing an interactive habit UI (streak cards, habit
 * checklist, floating notification), a gradient headline, inline hero stats, dark
 * App Store / Google Play badges, a "featured in" press-logo strip, a 9-up feature
 * grid with emoji icons in colored circles, a 3-step numbered walkthrough with a
 * connecting gradient line, a 4-screen CSS-built app preview gallery, a 3-tier pricing
 * table (Free / Pro / Family) with a scaled highlighted popular plan, an inverted
 * dark stats band with a CTA, a 6-up testimonials grid with star ratings and avatars,
 * a simple non-accordion boxed FAQ, a vibrant gradient download CTA, and a dark
 * multi-column footer with social icons. Use as the ROOT page for a consumer mobile
 * app, habit tracker, fitness/wellness product, or any App-Store-distributed launch
 * when a warm, friendly, rainbow-tinted aesthetic with emoji iconography and built-in
 * phone mockups is preferred over the minimalist photographic style of
 * MobileAppKimiPage. Supply content only — brand, nav, hero, logos, features, steps,
 * gallery, stats, testimonials, pricing, faq, cta, footer; the block owns all layout
 * and styling.
 */
export const MobileAppKimiPage5 = defineCapsule({
  name: "MobileAppKimiPage5",
  description:
    "Complete mobile-app / SaaS-app marketing LANDING page, the fifth style sibling (variant 5) to MobileAppKimiPage, featuring a playful, colorful, high-energy aesthetic with built-from-divs phone mockups, emoji-driven feature icons, a gradient hero with inline stats and dark App Store / Google Play badges, a 'featured in' press-logo strip, a 9-up feature grid with colored icon tiles, a 3-step walkthrough with numbered circles and a connecting gradient line, a 4-screen CSS-built app preview gallery, a 3-tier pricing table (Free / Pro / Family) with a scaled highlighted popular plan, an inverted dark stats band with a CTA, a 6-up testimonials grid with star ratings and avatars, a simple non-accordion boxed FAQ, a vibrant gradient download CTA, and a dark multi-column footer with social icons. Use as the ROOT page for a consumer habit tracker, wellness, fitness, or lifestyle mobile app when a warm, friendly, conversion-focused design with playful colors, streak counters, and app-store distribution is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
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
  lakebed: {
    schema: {
      habits: table({
        name: string(),
        icon: string(),
        target: string(),
        frequency: string(),
      }),
      habitCompletions: table({
        habitId: string(),
        date: string(),
        completed: string(),
      }),
    },
    queries: {
      habits: ({ db }) => db.habits.orderBy('createdAt').all(),
      habitCompletions: ({ db }) => db.habitCompletions.all(),
      todayCompletions: ({ db }) => {
        const today = new Date().toISOString().split('T')[0]
        return db.habitCompletions.where('date', today).where('completed', 'true').all()
      },
    },
    mutations: {
      addHabit: ({ db }, name: string, icon: string, target: string, frequency: string) => {
        db.habits.insert({ name, icon, target, frequency })
        return db.habits.all()
      },
      completeHabit: ({ db }, habitId: string, date: string) => {
        const existing = db.habitCompletions.where('habitId', habitId).where('date', date).all()[0]
        if (existing) {
          db.habitCompletions.update(existing.id, { completed: 'true' })
        } else {
          db.habitCompletions.insert({ habitId, date, completed: 'true' })
        }
        return db.habitCompletions.all()
      },
      uncompleteHabit: ({ db }, habitId: string, date: string) => {
        const existing = db.habitCompletions.where('habitId', habitId).where('date', date).all()[0]
        if (existing) {
          db.habitCompletions.delete(existing.id)
        }
        return db.habitCompletions.all()
      },
      deleteHabit: ({ db }, habitId: string) => {
        for (const habit of db.habits.where('id', habitId).all()) {
          db.habits.delete(habit.id)
        }
        for (const completion of db.habitCompletions.where('habitId', habitId).all()) {
          db.habitCompletions.delete(completion.id)
        }
        return db.habits.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [habitsOpen, setHabitsOpen] = useState(false)
    const brand = props.brand ?? "HabitBud"
    
    const habits = lakebed.useQuery('habits')
    const todayCompletions = lakebed.useQuery('todayCompletions')
    const addHabit = lakebed.useMutation('addHabit')
    const completeHabit = lakebed.useMutation('completeHabit')
    const uncompleteHabit = lakebed.useMutation('uncompleteHabit')
    const deleteHabit = lakebed.useMutation('deleteHabit')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName = auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials = authDisplayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ME'
    const authLabel = auth.isLoading ? 'Checking...' : isSignedIn ? authDisplayName : 'Sign in'
    
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    
    const today = new Date().toISOString().split('T')[0]
    const displayHabits = habits && habits.length > 0 ? habits : []
    const completedHabitIds = new Set(todayCompletions?.map(c => c.habitId) || [])
    const completedCount = completedHabitIds.size
    const totalHabits = displayHabits.length
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Reviews", "Get Started Free"]

    const heroBadge = props.hero?.badge ?? "Join 2M+ happy habit builders"
    const heroTop = props.hero?.headingTop ?? "Build habits that"
    const heroBottom = props.hero?.headingBottom ?? "actually stick"
    const heroSub =
      props.hero?.subheading ??
      "Turn daily goals into lasting routines with streaks, reminders, and rewards. Track water, workouts, reading, meditation, and 50+ habits — all in one playful, colorful app."
    const heroPrimary = props.hero?.primaryCta ?? "App Store"
    const heroSecondary = props.hero?.secondaryCta ?? "Google Play"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Phone mockup displaying a habit tracker app interface with daily habits and streak card"
    const chipTitle = props.hero?.chipTitle ?? "Habit Complete!"
    const chipSubtitle = props.hero?.chipSubtitle ?? "Water goal reached"
    const streakValue = props.hero?.streakValue ?? "12"
    const streakLabel = props.hero?.streakLabel ?? "Day Streak!"

    const logosLabel = props.logos?.label ?? "Featured in & trusted by"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["TechCrunch", "Product Hunt", "Forbes", "App Store", "Lifehacker"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to build lasting habits"
    const featuresDesc =
      props.features?.description ??
      "From daily reminders to deep analytics, HabitBud gives you all the tools to transform your life, one habit at a time."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Visual Streaks",
            description:
              "Watch your habit chains grow day by day. Don't break the streak! Visual progress keeps you motivated and on track.",
          },
          {
            title: "Smart Reminders",
            description:
              "Gentle nudges at the perfect time. Customize reminders for each habit — morning water, afternoon walks, evening meditation.",
          },
          {
            title: "Goal Setting",
            description:
              "Set daily, weekly, or monthly targets. Want to read 10 pages a day or exercise 3 times a week? We've got you covered.",
          },
          {
            title: "Deep Analytics",
            description:
              "Beautiful charts showing your progress over time. See completion rates, best streaks, and patterns in your behavior.",
          },
          {
            title: "Buddy System",
            description:
              "Build habits together! Add friends, share progress, and cheer each other on. Accountability makes habits stick.",
          },
          {
            title: "Rewards & Badges",
            description:
              "Earn colorful badges for milestones — 7 days, 30 days, 100 days! Collect them all and share your achievements.",
          },
          {
            title: "Dark Mode",
            description:
              "Easy on the eyes, day or night. Our beautiful dark theme makes evening check-ins a delight.",
          },
          {
            title: "Cloud Sync",
            description:
              "Your data, everywhere. Seamlessly sync between phone, tablet, and web. Never lose your progress.",
          },
          {
            title: "Private & Secure",
            description:
              "Your habits are personal. End-to-end encryption, no data selling, and full GDPR compliance guaranteed.",
          },
        ]

    const stepsHeading =
      props.steps?.heading ?? "Start building habits in 3 simple steps"
    const stepsDesc =
      props.steps?.description ??
      "Getting started takes less than 2 minutes. Here's how HabitBud helps you transform your daily routine."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create Your Habits",
            description:
              "Choose from 50+ templates — water, exercise, reading, meditation — or create your own custom habits with personalized icons and colors.",
            imageAlt:
              "iPhone displaying habit selection screen with colorful habit icons in a grid layout",
          },
          {
            title: "Set Your Schedule",
            description:
              "Pick how often and when. Daily morning yoga? Twice-weekly guitar practice? Evening gratitude journaling? You decide.",
            imageAlt:
              "Smartphone showing a scheduling app interface with time selection and reminder settings",
          },
          {
            title: "Track & Celebrate",
            description:
              "Check off habits as you complete them. Watch your streaks grow, earn badges, and see your progress in beautiful charts.",
            imageAlt:
              "Smartphone showing habit tracking completion screen with checkmarks and progress statistics",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Inside the app"
    const galleryDesc =
      props.gallery?.description ??
      "A peek at the colorful, intuitive interface that makes habit tracking feel like a joy, not a chore."

    const statsHeading = props.stats?.heading ?? "Trusted by millions worldwide"
    const statsDesc =
      props.stats?.description ??
      "Join a global community of habit builders who are transforming their lives, one day at a time."
    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2M+", label: "Active Users" },
          { value: "50M+", label: "Habits Logged" },
          { value: "180+", label: "Countries" },
          { value: "4.9★", label: "App Store Rating" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by habit builders everywhere"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See how real people are using HabitBud to change their lives for the better."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've tried 5 different habit apps, and HabitBud is the only one that stuck. I've meditated for 45 days straight now — my anxiety has never been better!",
            name: "Jennifer Walsh",
            role: "Yoga Instructor, Austin TX",
            avatarAlt:
              "Professional headshot of a smiling woman with blonde hair in her 30s",
          },
          {
            quote:
              "The buddy feature is a game-changer. My brother and I have a friendly competition going. We've both hit 30-day streaks on our morning runs!",
            name: "Marcus Chen",
            role: "Software Engineer, Seattle WA",
            avatarAlt:
              "Professional headshot of a smiling man with short dark hair wearing a casual shirt",
          },
          {
            quote:
              "As a busy mom of three, I needed something simple. HabitBud's gentle reminders help me drink water and take 5 minutes for myself every day.",
            name: "Sofia Rodriguez",
            role: "Marketing Director, Miami FL",
            avatarAlt:
              "Professional headshot of a smiling woman with brown curly hair and warm eyes",
          },
          {
            quote:
              "I finally read 52 books in a year thanks to HabitBud's reading tracker. The visual streak was incredibly motivating — I couldn't bear to break it!",
            name: "David Park",
            role: "University Professor, Boston MA",
            avatarAlt:
              "Professional headshot of a smiling man with glasses and a beard in his 40s",
          },
          {
            quote:
              "The Family plan lets me track my kids' chores and my own habits together. We celebrate our 7-day streaks with pizza night!",
            name: "Emma Thompson",
            role: "Stay-at-Home Mom, Denver CO",
            avatarAlt:
              "Professional headshot of a smiling young woman with red hair and freckles",
          },
          {
            quote:
              "The analytics helped me realize I skip workouts on Thursdays. Now I plan around it and have a 60-day fitness streak going. Life changing!",
            name: "James Miller",
            role: "Personal Trainer, San Diego CA",
            avatarAlt:
              "Professional headshot of a smiling man with short hair and stubble in his 30s",
          },
        ]

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
            cta: "Get Started",
            featured: false,
            features: [
              { label: "Up to 5 habits", included: true },
              { label: "Basic streak tracking", included: true },
              { label: "Daily reminders", included: true },
              { label: "7-day analytics", included: true },
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
              { label: "Advanced analytics", included: true },
              { label: "Custom reminders", included: true },
              { label: "All badges & rewards", included: true },
              { label: "Buddy system", included: true },
              { label: "Cloud sync", included: true },
            ],
          },
          {
            name: "Family",
            tagline: "Share with loved ones",
            price: "$9.99",
            period: "/month",
            cta: "Start 14-Day Free Trial",
            featured: false,
            features: [
              { label: "Everything in Pro", included: true },
              { label: "Up to 6 family members", included: true },
              { label: "Shared group habits", included: true },
              { label: "Family leaderboards", included: true },
              { label: "Priority support", included: true },
            ],
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about HabitBud."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is HabitBud really free to use?",
            answer:
              "Yes! Our free plan includes up to 5 habits, basic streak tracking, and daily reminders. It's perfect for getting started. Upgrade to Pro anytime for unlimited habits and advanced features.",
          },
          {
            question: "Can I sync between my iPhone and Android tablet?",
            answer:
              "Absolutely! Pro and Family plans include cloud sync across all your devices — iOS, Android, and Web. Your habits stay in sync no matter which device you use.",
          },
          {
            question: "What happens to my data if I cancel?",
            answer:
              "Your data is yours. If you cancel, you'll keep all your habit history and can continue using the free plan. We never delete your data — you can always pick up where you left off.",
          },
          {
            question: "How does the buddy system work?",
            answer:
              "Add friends by username or email, then choose which habits to share. You can see each other's streaks, send encouragement, and even compete on leaderboards. It's accountability made fun!",
          },
          {
            question: "Can I track habits multiple times per day?",
            answer:
              "Yes! You can set habits to track multiple times — like Drink Water 8 times daily, or Take a Break every 2 hours. You can also track quantity (pages read, miles run, etc.).",
          },
          {
            question: "Is my data private and secure?",
            answer:
              "100%. We use end-to-end encryption, never sell your data, and are fully GDPR compliant. Your habit data is stored securely and only visible to you (and buddies you explicitly choose to share with).",
          },
          {
            question: "Do you offer student or nonprofit discounts?",
            answer:
              "Yes! Students get 50% off Pro with a valid .edu email. Verified nonprofits and educators can apply for free Pro access through our community program. Contact support for details.",
          },
          {
            question: "What if I break my streak accidentally?",
            answer:
              "Life happens! Pro users can use Streak Freeze up to 3 times per month for emergencies. You can also set rest days for habits that don't need daily completion.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to build habits that last?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2 million people who are transforming their lives with HabitBud. Download free today and start your first streak!"
    const ctaPrimary = props.cta?.primaryCta ?? "App Store"
    const ctaSecondary = props.cta?.secondaryCta ?? "Google Play"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["Free download", "No credit card required", "Pro trial available"]

    const footerTagline =
      props.footer?.tagline ??
      "Build better habits, track your progress, and achieve your goals with the friendliest habit tracker on the planet."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Templates", "Changelog", "Roadmap"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press Kit", "Contact"],
          },
          {
            title: "Support",
            links: ["Help Center", "Community", "API Docs", "Privacy", "Terms"],
          },
        ]
    const footerNote =
      props.footer?.note ?? `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // ===== Sub-components =====

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
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    )

    const PlayIcon = () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-8" aria-hidden="true">
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

    const Star = () => (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-primary" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ArrowRightIcon = () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ChevronDown = () => (
      <svg className="size-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const featureIcons = ["📊", "🔔", "🎯", "📈", "👥", "🏆", "🌙", "☁️", "🔒"]
    const stepIcons = ["✨", "📅", "🎉"]
    const bgRota = ["bg-primary", "bg-secondary", "bg-accent"]
    const borderRota = ["border-primary/20", "border-secondary/20", "border-accent/20"]
    const bgLightRota = ["bg-primary/10", "bg-secondary/10", "bg-accent/10"]

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
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                  <LogoMark className="size-6 text-background" />
                </div>
                <span className="text-xl font-bold tracking-tight">{brand}</span>
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
                        <Avatar size="sm" className="ring-2 ring-background" aria-hidden="true">
                          {authPicture ? (
                            <AvatarImage src={authPicture} alt={authDisplayName} />
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
                    <PopoverContent align="end" sideOffset={10} className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl">
                      <div className="bg-muted/40 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg" className="ring-2 ring-background">
                            {authPicture ? (
                              <AvatarImage src={authPicture} alt={authDisplayName} />
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
                          onClick={() => setHabitsOpen(true)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          My Habits
                          <ArrowRightIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                          <ArrowRightIcon />
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
                <Sheet open={habitsOpen} onOpenChange={setHabitsOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="My Habits"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      {completedCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {completedCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Today's Habits</SheetTitle>
                      <SheetDescription>
                        {totalHabits > 0
                          ? `${completedCount} of ${totalHabits} habit${totalHabits === 1 ? '' : 's'} completed today.`
                          : 'No habits yet. Add your first habit to get started!'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {displayHabits.length ? (
                        <div className="space-y-4">
                          {displayHabits.map((habit) => {
                            const isCompleted = completedHabitIds.has(habit.id)
                            return (
                              <div key={habit.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
                                <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-2xl">
                                  {habit.icon || '🎯'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground truncate">{habit.name}</h3>
                                  <p className="text-sm text-muted-foreground">{habit.target || 'Daily'}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isCompleted) {
                                      void uncompleteHabit(habit.id, today)
                                    } else {
                                      void completeHabit(habit.id, today)
                                    }
                                  }}
                                  aria-pressed={isCompleted}
                                  className={cn(
                                    "grid size-10 place-items-center rounded-full transition-all",
                                    isCompleted
                                      ? "bg-primary text-primary-foreground"
                                      : "border-2 border-border hover:border-primary",
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckIcon className="size-5 text-primary-foreground" />
                                  ) : null}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No habits yet
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Sign in and add your first habit to start tracking your progress.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        className="w-full rounded-full"
                        onClick={() => go('Pricing')}
                      >
                        Upgrade for Unlimited Habits
                      </Button>
                      <SheetClose asChild>
                        <Button type="button" variant="secondary" className="rounded-full">
                          Close
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="hidden items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 sm:inline-flex"
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          {authPicture ? (
                            <AvatarImage src={authPicture} alt={authDisplayName} />
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
                          setHabitsOpen(true)
                        }}
                        className="w-full rounded-full"
                      >
                        My Habits
                      </Button>
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
          <section className="overflow-hidden bg-gradient-to-b from-primary/10 to-background pb-16 pt-24 lg:pb-24 lg:pt-32" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
                {/* Left: copy */}
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                  >
                    {heroTop}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                      {heroBottom}
                    </span>
                  </h1>
                  <p className="mb-8 text-lg text-muted-foreground sm:text-xl max-w-xl mx-auto lg:mx-0">
                    {heroSub}
                  </p>

                  {/* App Store Badges */}
                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-6 py-3 text-background transition-colors hover:bg-foreground/90"
                    >
                      <AppleIcon />
                      <div className="text-left">
                        <div className="text-xs text-background/70">Download on the</div>
                        <div className="text-lg font-semibold">{heroPrimary}</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-6 py-3 text-background transition-colors hover:bg-foreground/90"
                    >
                      <PlayIcon />
                      <div className="text-left">
                        <div className="text-xs text-background/70">Get it on</div>
                        <div className="text-lg font-semibold">{heroSecondary}</div>
                      </div>
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap justify-center gap-8 text-center lg:justify-start">
                    {[
                      { v: "4.9★", l: "127K reviews" },
                      { v: "2M+", l: "Downloads" },
                      { v: "50M+", l: "Habits logged" },
                    ].map((s) => (
                      <div key={s.l}>
                        <div className="text-3xl font-bold text-foreground">{s.v}</div>
                        <div className="text-sm text-muted-foreground">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: phone mockup */}
                <div className="relative flex justify-center lg:justify-end">
                  <div className="absolute -top-20 -left-20 size-72 rounded-full bg-secondary/20 blur-3xl opacity-60" />
                  <div className="absolute -bottom-20 -right-20 size-72 rounded-full bg-accent/20 blur-3xl opacity-60" />

                  <div
                    className="relative w-[280px] sm:w-[320px]"
                    role="img"
                    aria-label={heroImageAlt}
                  >
                    {/* Phone frame */}
                    <div className="rounded-[3rem] bg-foreground p-3 shadow-2xl">
                      <div className="overflow-hidden rounded-[2.5rem] bg-background">
                        {/* Status bar */}
                        <div className="flex h-7 items-center justify-between bg-primary px-6">
                          <span className="text-xs font-semibold text-background">9:41</span>
                          <div className="flex items-center gap-1">
                            <svg className="size-4 text-background" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                            <svg className="size-4 text-background" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                          </div>
                        </div>

                        {/* App content */}
                        <div className="p-4">
                          {/* Header */}
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <h2 className="text-lg font-bold text-foreground">
                                {isSignedIn ? `Hello, ${authDisplayName.split(' ')[0]}! 👋` : 'Hello, Sarah! 👋'}
                              </h2>
                              <p className="text-xs text-muted-foreground">
                                {totalHabits > 0 ? `You have ${totalHabits} habit${totalHabits === 1 ? '' : 's'} today` : 'You have 3 habits today'}
                              </p>
                            </div>
                            <div className="size-10 overflow-hidden rounded-full bg-secondary/20">
                              {isSignedIn && authPicture ? (
                                <Image alt={authDisplayName} src={authPicture} w={100} h={100} className="size-full object-cover" />
                              ) : (
                                <Image alt="Smiling young woman with brown hair" w={100} h={100} className="size-full object-cover" />
                              )}
                            </div>
                          </div>

                          {/* Streak card */}
                          <div className="mb-4 rounded-2xl bg-gradient-to-r from-accent/20 to-accent/40 p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">🔥</div>
                              <div>
                                <div className="text-sm font-semibold text-foreground">{streakValue} {streakLabel}</div>
                                <div className="text-xs text-muted-foreground">You're on fire! Keep it up.</div>
                              </div>
                            </div>
                          </div>

                          {/* Today's Habits */}
                          <h3 className="mb-3 text-sm font-bold text-foreground">Today's Habits</h3>
                          <div className="space-y-2">
                            {displayHabits.length > 0 ? (
                              displayHabits.slice(0, 3).map((habit, i) => {
                                const isCompleted = completedHabitIds.has(habit.id)
                                const colorClasses = [
                                  { border: 'border-primary/20', bg: 'bg-primary/10', iconBg: 'bg-primary/20', completed: 'bg-primary', incomplete: 'border-2 border-primary/30' },
                                  { border: 'border-secondary/20', bg: 'bg-secondary/10', iconBg: 'bg-secondary/20', completed: 'bg-secondary', incomplete: 'border-2 border-secondary/30' },
                                  { border: 'border-accent/20', bg: 'bg-accent/10', iconBg: 'bg-accent/20', completed: 'bg-accent', incomplete: 'border-2 border-accent/30' },
                                ]
                                const colors = colorClasses[i % 3]
                                return (
                                  <div key={habit.id} className={cn(
                                    "flex items-center gap-3 rounded-xl border-2 p-3",
                                    colors.border,
                                    colors.bg,
                                  )}>
                                    <div className={cn(
                                      "grid size-10 place-items-center rounded-full text-xl",
                                      colors.iconBg,
                                    )}>
                                      {habit.icon || '🎯'}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-semibold text-foreground">{habit.name}</div>
                                      <div className="text-xs text-muted-foreground">{habit.target || 'Daily'}</div>
                                    </div>
                                    <div className={cn(
                                      "grid size-6 place-items-center rounded-full",
                                      isCompleted ? colors.completed : colors.incomplete,
                                    )}>
                                      {isCompleted ? (
                                        <CheckIcon className="size-4 text-background" />
                                      ) : null}
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <>
                                <div className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/10 p-3">
                                  <div className="grid size-10 place-items-center rounded-full bg-primary/20 text-xl">💧</div>
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-foreground">Drink Water</div>
                                    <div className="text-xs text-muted-foreground">6 / 8 glasses</div>
                                  </div>
                                  <div className="grid size-6 place-items-center rounded-full bg-primary">
                                    <CheckIcon className="size-4 text-background" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border-2 border-secondary/20 bg-secondary/10 p-3">
                                  <div className="grid size-10 place-items-center rounded-full bg-secondary/20 text-xl">📚</div>
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-foreground">Read 30 mins</div>
                                    <div className="text-xs text-muted-foreground">0 / 1 sessions</div>
                                  </div>
                                  <div className="size-6 rounded-full border-2 border-secondary/30" />
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border-2 border-accent/20 bg-accent/10 p-3">
                                  <div className="grid size-10 place-items-center rounded-full bg-accent/20 text-xl">🏃</div>
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-foreground">Morning Run</div>
                                    <div className="text-xs text-muted-foreground">3.2 / 5 km</div>
                                  </div>
                                  <div className="size-6 rounded-full border-2 border-accent/30" />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating notification */}
                    <div className="absolute -right-4 top-20 rounded-2xl bg-background p-4 shadow-xl animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-lg">🎉</div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{chipTitle}</div>
                          <div className="text-xs text-muted-foreground">{chipSubtitle}</div>
                        </div>
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
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo === "TechCrunch" && (
                      <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    )}
                    {logo === "Product Hunt" && (
                      <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                    )}
                    {logo === "Forbes" && (
                      <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                    {logo === "App Store" && (
                      <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    )}
                    {logo === "Lifehacker" && (
                      <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    )}
                    <span className="text-lg font-bold">{logo}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-28" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
                  Features
                </span>
                <h2
                  id="features-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className={cn(
                      "group rounded-3xl border p-6 transition-all hover:shadow-xl",
                      borderRota[i % 3],
                      bgLightRota[i % 3],
                    )}
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-14 place-items-center rounded-2xl text-2xl transition-transform group-hover:scale-110",
                        bgRota[i % 3],
                        "text-background",
                      )}
                    >
                      {featureIcons[i]}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted/50 py-20 lg:py-28" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                  How It Works
                </span>
                <h2
                  id="steps-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="relative grid gap-8 lg:grid-cols-3">
                {/* Connection line */}
                <div className="absolute left-0 right-0 top-10 mx-24 hidden h-1 rounded-full bg-gradient-to-r from-primary via-secondary to-accent lg:block" />
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div
                      className={cn(
                        "relative z-10 mx-auto mb-6 flex size-20 items-center justify-center rounded-full text-3xl font-bold text-background shadow-xl",
                        bgRota[i % 3],
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="rounded-3xl border border-border bg-background p-8 shadow-lg">
                      <div className="mb-4 text-5xl">{stepIcons[i]}</div>
                      <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery — CSS-built phone mockups */}
          <section className="overflow-hidden py-20 lg:py-28" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
                  App Preview
                </span>
                <h2
                  id="gallery-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Screen 1 — Habit list */}
                <div className="flex justify-center">
                  <div className="w-[200px] rounded-[2rem] bg-foreground p-2 shadow-xl">
                    <div className="flex h-5 items-center justify-center rounded-t-[1.5rem] bg-primary">
                      <div className="h-1 w-16 rounded-full bg-background/30" />
                    </div>
                    <div className="aspect-[9/16] rounded-b-[1.5rem] bg-background p-3">
                      <div className="mb-3 h-4 w-24 rounded bg-muted" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2">
                          <div className="size-8 rounded-full bg-primary/20" />
                          <div className="h-3 flex-1 rounded bg-muted" />
                          <div className="size-5 rounded-full bg-primary" />
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-secondary/10 p-2">
                          <div className="size-8 rounded-full bg-secondary/20" />
                          <div className="h-3 flex-1 rounded bg-muted" />
                          <div className="size-5 rounded-full border-2 border-secondary/30" />
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-accent/10 p-2">
                          <div className="size-8 rounded-full bg-accent/20" />
                          <div className="h-3 flex-1 rounded bg-muted" />
                          <div className="size-5 rounded-full border-2 border-accent/30" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screen 2 — Streak */}
                <div className="flex justify-center">
                  <div className="w-[200px] rounded-[2rem] bg-foreground p-2 shadow-xl">
                    <div className="flex h-5 items-center justify-center rounded-t-[1.5rem] bg-secondary">
                      <div className="h-1 w-16 rounded-full bg-background/30" />
                    </div>
                    <div className="aspect-[9/16] rounded-b-[1.5rem] bg-background p-3">
                      <div className="mb-4 flex justify-center">
                        <div className="grid size-20 place-items-center rounded-full bg-secondary/20 text-3xl">🔥</div>
                      </div>
                      <div className="mx-auto mb-2 h-4 w-32 rounded bg-muted" />
                      <div className="mx-auto mb-4 h-3 w-24 rounded bg-muted" />
                      <div className="grid grid-cols-7 gap-1">
                        {[0,1,2,3,4].map((k) => <div key={k} className="aspect-square rounded bg-primary" />)}
                        {[0,1].map((k) => <div key={k} className="aspect-square rounded bg-muted" />)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screen 3 — Buddies */}
                <div className="flex justify-center">
                  <div className="w-[200px] rounded-[2rem] bg-foreground p-2 shadow-xl">
                    <div className="flex h-5 items-center justify-center rounded-t-[1.5rem] bg-accent">
                      <div className="h-1 w-16 rounded-full bg-background/30" />
                    </div>
                    <div className="aspect-[9/16] rounded-b-[1.5rem] bg-background p-3">
                      <div className="mb-4 h-4 w-28 rounded bg-muted" />
                      <div className="space-y-3">
                        <div className="flex h-16 items-center gap-2 rounded-xl bg-accent/10 px-3">
                          <div className="size-10 rounded-full bg-accent/20" />
                          <div className="flex-1">
                            <div className="mb-1 h-3 w-20 rounded bg-muted" />
                            <div className="h-2 w-16 rounded bg-muted" />
                          </div>
                        </div>
                        <div className="flex h-16 items-center gap-2 rounded-xl bg-primary/10 px-3">
                          <div className="size-10 rounded-full bg-primary/20" />
                          <div className="flex-1">
                            <div className="mb-1 h-3 w-20 rounded bg-muted" />
                            <div className="h-2 w-16 rounded bg-muted" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screen 4 — Analytics */}
                <div className="flex justify-center">
                  <div className="w-[200px] rounded-[2rem] bg-foreground p-2 shadow-xl">
                    <div className="flex h-5 items-center justify-center rounded-t-[1.5rem] bg-muted">
                      <div className="h-1 w-16 rounded-full bg-background/30" />
                    </div>
                    <div className="aspect-[9/16] rounded-b-[1.5rem] bg-background p-3">
                      <div className="mb-4 h-4 w-24 rounded bg-muted" />
                      <div className="mb-3 flex h-32 items-end gap-2">
                        <div className="h-[40%] flex-1 rounded-t-lg bg-secondary/30" />
                        <div className="h-[60%] flex-1 rounded-t-lg bg-secondary/40" />
                        <div className="h-[80%] flex-1 rounded-t-lg bg-secondary/50" />
                        <div className="h-[100%] flex-1 rounded-t-lg bg-secondary/60" />
                        <div className="h-[70%] flex-1 rounded-t-lg bg-secondary/50" />
                        <div className="h-[50%] flex-1 rounded-t-lg bg-secondary/40" />
                        <div className="h-[30%] flex-1 rounded-t-lg bg-secondary/30" />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-gradient-to-b from-primary/5 to-background py-20 lg:py-28" aria-labelledby="pricing-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  Pricing
                </span>
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
                      "relative flex flex-col rounded-3xl p-8",
                      tier.featured
                        ? "bg-gradient-to-br from-primary to-accent shadow-xl md:scale-105"
                        : "border border-border bg-background shadow-lg",
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-accent px-4 py-1 text-sm font-semibold text-background">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className={cn("text-xl font-bold", tier.featured ? "text-background" : "text-foreground")}>
                        {tier.name}
                      </h3>
                      <p className={cn("text-sm", tier.featured ? "text-background/70" : "text-muted-foreground")}>
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className={cn("text-4xl font-bold", tier.featured ? "text-background" : "text-foreground")}>
                        {tier.price}
                      </span>
                      <span className={cn(tier.featured ? "text-background/70" : "text-muted-foreground")}>
                        {tier.period}
                      </span>
                    </div>
                    <ul className="mb-8 flex-1 space-y-4">
                      {tier.features?.map((f) => (
                        <li key={f.label} className="flex items-center gap-3">
                          <CheckIcon
                            className={cn(
                              "size-5 shrink-0",
                              tier.featured ? "text-background" : "text-primary",
                            )}
                          />
                          <span
                            className={cn(
                              tier.featured ? "text-background/90" : "text-muted-foreground",
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
                        "w-full rounded-2xl py-4 text-center text-sm font-semibold transition-colors",
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
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Save 33% with annual billing — Pro $39.99/year, Family $79.99/year
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="py-20 lg:py-28" aria-labelledby="stats-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-foreground p-8 text-background lg:p-16">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                  <div>
                    <h2
                      id="stats-heading"
                      className="mb-4 text-3xl font-bold text-background sm:text-4xl"
                    >
                      {statsHeading}
                    </h2>
                    <p className="mb-8 text-lg text-background/70">{statsDesc}</p>
                    <button
                      type="button"
                      onClick={() => go("Community")}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Join the Community
                      <ArrowRightIcon />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {statsItems.map((s) => (
                      <div key={s.label} className="rounded-2xl bg-background/10 p-6 text-center backdrop-blur-sm">
                        <div className="mb-2 text-4xl font-bold text-background lg:text-5xl">{s.value}</div>
                        <div className="text-background/70">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-gradient-to-b from-background to-primary/5 py-20 lg:py-28" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  Testimonials
                </span>
                <h2
                  id="testimonials-heading"
                  className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-3xl border border-border bg-background p-6 shadow-lg"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
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

          {/* FAQ */}
          <section className="py-20 lg:py-28" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
                  FAQ
                </span>
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
                  <div key={item.question} className="rounded-2xl bg-muted p-6">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Download CTA */}
          <section className="bg-gradient-to-br from-primary via-accent to-secondary py-20 lg:py-28" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/80 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-8 py-4 text-background shadow-xl transition-colors hover:bg-foreground/90"
                >
                  <AppleIcon />
                  <div className="text-left">
                    <div className="text-xs text-background/70">Download on the</div>
                    <div className="text-xl font-semibold">{ctaPrimary}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-8 py-4 text-background shadow-xl transition-colors hover:bg-foreground/90"
                >
                  <PlayIcon />
                  <div className="text-left">
                    <div className="text-xs text-background/70">Get it on</div>
                    <div className="text-xl font-semibold">{ctaSecondary}</div>
                  </div>
                </button>
              </div>
              <p className="text-sm text-background/80">
                {ctaBadges.join(" • ")}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16" aria-label="Footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                    <LogoMark className="size-6 text-background" />
                  </div>
                  <span className="text-xl font-bold text-background">{brand}</span>
                </button>
                <p className="mb-6 max-w-xs text-background/70">{footerTagline}</p>
                <div className="flex gap-4">
                  {/* Twitter */}
                  <button
                    type="button"
                    aria-label="Twitter"
                    onClick={() => go("Twitter")}
                    className="grid size-10 place-items-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-background"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                    </svg>
                  </button>
                  {/* Instagram */}
                  <button
                    type="button"
                    aria-label="Instagram"
                    onClick={() => go("Instagram")}
                    className="grid size-10 place-items-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-background"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </button>
                  {/* TikTok */}
                  <button
                    type="button"
                    aria-label="TikTok"
                    onClick={() => go("TikTok")}
                    className="grid size-10 place-items-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-background"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v8.79c0 4.17-2.22 7.89-5.84 9.89-.77.41-1.59.71-2.43.93-1.12.29-2.3.44-3.49.44-1.47 0-2.91-.23-4.27-.68-2.38-.8-4.4-2.32-5.73-4.26-1.33-1.95-1.93-4.28-1.69-6.61.15-1.44.6-2.83 1.32-4.07.95-1.65 2.29-3.01 3.86-3.93 1.43-.83 3.05-1.29 4.71-1.34 1.27-.05 2.54.1 3.75.4.45.11.88.26 1.3.44v4.17c-.55-.33-1.13-.61-1.74-.84-1.27-.44-2.63-.55-3.96-.31-.79.15-1.54.43-2.23.81-.69.39-1.3.89-1.81 1.47-.69.79-1.18 1.74-1.42 2.76-.26 1.1-.24 2.26.07 3.35.22.77.57 1.49 1.04 2.12.65.88 1.48 1.6 2.43 2.09.95.49 2.01.75 3.08.75.65 0 1.3-.09 1.92-.27.62-.18 1.21-.45 1.75-.79.96-.6 1.76-1.43 2.33-2.41.46-.79.79-1.66.97-2.56.1-.51.15-1.03.15-1.55V.02h-.01z"/>
                    </svg>
                  </button>
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/70 transition-colors hover:text-background"
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
              <p className="text-sm text-background/70">{footerNote}</p>
              <div className="flex gap-6">
                {["Privacy Policy", "Terms of Service", "Cookies"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {label}
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
