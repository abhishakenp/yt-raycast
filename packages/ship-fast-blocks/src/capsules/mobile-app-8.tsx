import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { boolean, number, string, table } from '@ship-fast/lakebed/server'
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
 * MobileAppKimiPage8 — a complete, self-contained mobile-app LANDING / marketing page.
 *
 * A faithful Tailwind v4 token-only port of a Kimi-generated "DailyStreak" habit-tracker
 * site with a stark, brutalist, high-contrast aesthetic: heavy 4px borders, bold monospace
 * labels, alternating dark and light bands, geometric decorative shapes in the hero, a
 * staggered app-screenshot gallery, and a primary-accent CTA band. This is variant 8 —
 * the eighth visually distinct style sibling to MobileAppKimiPage (and siblings 2–7).
 *
 * Includes a fixed navbar with a thick primary bottom border, a split dark hero with
 * floating geometric accents, App Store / Google Play download buttons, avatar social proof,
 * a thick-bordered "featured in" logo strip, a 6-up feature grid with inverted and
 * primary accent cards, a numbered 3-step walkthrough with a connector line on a dark
 * band, a staggered 2×2 screenshot gallery, a 3-tier pricing table with a thick-bordered
 * featured plan, a dark stats band with left-border accents, a 6-up testimonial grid with
 * bordered cards and star ratings, a thick-bordered FAQ accordion, a full-bleed primary CTA,
 * and a dark multi-column footer with social icons and a system status indicator.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item, CTA,
 * download button, footer link and social icon routes through `useNavigate` (never a
 * dead href). All content imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render fully with no props.
 */
export const MobileAppKimiPage8 = defineCapsule({
  name: "MobileAppKimiPage8",
  description:
    "Complete mobile-app marketing LANDING page with a stark, brutalist, high-contrast aesthetic — the eighth style sibling (variant 8) to MobileAppKimiPage. Features a dark fixed navbar with thick primary-accent border, a split hero with geometric decorative shapes (bordered squares + solid accent block), bold monospace typography, App Store + Google Play download buttons, avatar social proof with star rating, a thick-bordered press-logo strip, a 6-up feature grid with heavy borders and hover-accent transitions (including an inverted dark card and a primary-accent card), a numbered 3-step walkthrough with connector line on a dark band, a staggered 2x2 app-screenshot gallery with thick borders, a 3-tier pricing table (Starter / Pro / Teams) with a thick-bordered featured plan and checkmark feature lists, a dark stats band with left-border accent highlights, a 6-up testimonials grid with bordered cards and star ratings, a thick-bordered FAQ accordion with rotate chevrons, a vibrant primary-accent CTA download section with trust badges, and a dark multi-column footer with social icons and a system-status indicator. Use as the ROOT/home page for a consumer habit tracker, productivity app, fitness/wellness app, or any mobile product launch when a bold, no-nonsense, border-heavy, editorial brutalist design is preferred. Pick this over MobileAppKimiPage or other siblings when a stark, high-conversion, monochrome-with-accent aesthetic is wanted. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        rating: z.string().optional(),
        ratingCount: z.string().optional(),
        avatarAlts: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        streakValue: z.string().optional(),
        streakLabel: z.string().optional(),
      })
      .optional(),
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
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
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
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
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
              streak: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      habits: table({
        name: string(),
        description: string(),
        streak: number(),
      }),
      checkIns: table({
        habitId: string(),
        date: string(),
        completed: boolean(),
      }),
    },
    queries: {
      habits: ({ db }) => db.habits.orderBy('createdAt').all(),
      habitCheckIns: ({ db }) =>
        db.checkIns.all().flatMap((checkIn) => {
          const habit = db.habits.get(checkIn.habitId)
          return habit ? [{ ...checkIn, habit }] : []
        }),
    },
    mutations: {
      addHabit: ({ db }, name: string, description: string) => {
        db.habits.insert({ name, description, streak: 0 })
        return db.habits.all()
      },
      deleteHabit: ({ db }, habitId: string) => {
        for (const habit of db.habits.where('id', habitId).all()) {
          db.habits.delete(habit.id)
        }
        for (const checkIn of db.checkIns.where('habitId', habitId).all()) {
          db.checkIns.delete(checkIn.id)
        }
        return db.habits.all()
      },
      checkIn: ({ db }, habitId: string, date: string) => {
        const existingCheckIn = db.checkIns
          .where('habitId', habitId)
          .where('date', date)
          .all()[0]

        if (!existingCheckIn) {
          db.checkIns.insert({ habitId, date, completed: true })
          const habit = db.habits.get(habitId)
          if (habit) {
            db.habits.update(habitId, { streak: habit.streak + 1 })
          }
        }

        return db.habits.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [habitsOpen, setHabitsOpen] = useState(false)
    const [newHabitName, setNewHabitName] = useState('')
    const [newHabitDescription, setNewHabitDescription] = useState('')
    const brand = props.brand ?? "DailyStreak"

    const habits = lakebed.useQuery('habits')
    const habitCheckIns = lakebed.useQuery('habitCheckIns')
    const addHabit = lakebed.useMutation('addHabit')
    const deleteHabit = lakebed.useMutation('deleteHabit')
    const checkIn = lakebed.useMutation('checkIn')
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

    const handleAddHabit = () => {
      if (!newHabitName.trim()) return
      void addHabit(newHabitName.trim(), newHabitDescription.trim())
      setNewHabitName('')
      setNewHabitDescription('')
    }

    const handleCheckIn = (habitId: string) => {
      const today = new Date().toISOString().split('T')[0]
      void checkIn(habitId, today)
    }

    const handleDeleteHabit = (habitId: string) => {
      void deleteHabit(habitId)
    }

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
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
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Stories", "FAQ", "Get App"]

    const heroBadge = props.hero?.badge ?? "2.3M+ habits tracked"
    const heroTop = props.hero?.headingTop ?? "BUILD BETTER"
    const heroAccent = props.hero?.headingAccent ?? "HABITS."
    const heroBottom = props.hero?.headingBottom ?? "EVERY DAY."
    const heroSub =
      props.hero?.subheading ??
      "DailyStreak helps you track, analyze, and maintain your habits with brutal honesty. No fluff. Just results. Join over 500,000 people who've stuck to their goals."
    const heroPrimary = props.hero?.primaryCta ?? "App Store"
    const heroSecondary = props.hero?.secondaryCta ?? "Play Store"
    const heroRating = props.hero?.rating ?? "4.9"
    const heroRatingCount = props.hero?.ratingCount ?? "from 12,847 reviews"
    const heroAvatarAlts = props.hero?.avatarAlts?.length
      ? props.hero.avatarAlts
      : [
          "Headshot of young woman with dark hair smiling",
          "Headshot of man with beard and glasses",
          "Headshot of woman with blonde hair",
          "Headshot of middle-aged man with short hair",
        ]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Person holding smartphone showing habit tracking app interface"
    const heroStreakValue = props.hero?.streakValue ?? "47-Day Streak!"
    const heroStreakLabel = props.hero?.streakLabel ?? "Current streak"

    const logosLabel = props.logos?.label ?? "Featured in"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["TECHCRUNCH", "FORBES", "WIRED", "VERGE", "PRODUCT HUNT"]

    const featuresEyebrow = props.features?.eyebrow ?? "Features"
    const featuresHeading =
      props.features?.heading ?? "EVERYTHING YOU NEED.\nNOTHING YOU DON'T."
    const featuresDesc =
      props.features?.description ??
      "We stripped away the noise. DailyStreak gives you powerful habit tracking without the bloat. Data-driven. Brutally honest. Actually useful."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Check-ins",
            description:
              "One tap to log. AI detects patterns and suggests optimal times for your habits based on your actual behavior, not generic advice.",
          },
          {
            title: "Brutal Analytics",
            description:
              "Streak counts, completion rates, trend graphs, failure analysis. See exactly where you slip up and why. Numbers don't lie.",
          },
          {
            title: "Flexible Reminders",
            description:
              "Set custom reminders per habit. Location-based nudges. Smart rescheduling when you miss a window. Never forget what matters.",
          },
          {
            title: "Accountability Crews",
            description:
              "Join or create squads of up to 8 people. Share progress, compete on streaks, call each other out. Real accountability beats motivation.",
          },
          {
            title: "Photo Proof",
            description:
              "Optional photo verification for habits. Gym selfie? Reading spot snap? Meal prep shot? Build evidence of your consistency.",
          },
          {
            title: "Widget Everything",
            description:
              "iOS and Android widgets for instant check-ins. Lock screen, home screen, always-on display. Your habits, one tap away.",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "START IN 60 SECONDS."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create Your Habits",
            description:
              'Define 1-3 keystone habits. Be specific. "Run 3 miles at 6am" beats "exercise more." Specificity drives action.',
          },
          {
            title: "Check In Daily",
            description:
              "One tap. One photo. One moment of honesty. Takes 10 seconds. Miss a day? We track that too. Data over excuses.",
          },
          {
            title: "Watch Yourself Grow",
            description:
              "Streaks form. Patterns emerge. You see who you're becoming. 21 days becomes 90 becomes 365. Identity shifts.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "App Screenshots"
    const galleryHeading = props.gallery?.heading ?? "SEE IT IN ACTION."
    const galleryDesc =
      props.gallery?.description ??
      "Clean, focused interfaces designed for speed. No cognitive load. Just you and your commitment to showing up."
    const galleryBullets = props.gallery?.bullets?.length
      ? props.gallery.bullets
      : [
          "Dark mode by default (easier on the eyes)",
          "Gesture-based navigation",
          "Works offline, syncs when connected",
        ]
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "Mobile phone screen displaying dark themed habit tracking dashboard with statistics",
          "Smartphone showing minimal fitness app interface with workout tracking",
          "iPhone displaying productivity app with checkmark notifications",
          "Mobile device showing analytics dashboard with progress charts and graphs",
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "SIMPLE PRICING.\nNO SURPRISES."
    const pricingDesc =
      props.pricing?.description ??
      "Start free. Upgrade when you're ready. Cancel anytime. We don't play games with your money."
    const pricingNote =
      props.pricing?.note ??
      "All plans include 14-day free trial. No credit card required."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "For casual trackers getting started.",
            price: "$0",
            period: "/forever",
            cta: "Download Free",
            featured: false,
            features: [
              { label: "3 habits", included: true },
              { label: "Basic analytics", included: true },
              { label: "Daily reminders", included: true },
              { label: "Photo proof", included: false },
              { label: "Crews", included: false },
            ],
          },
          {
            name: "Pro",
            tagline: "For serious habit builders.",
            price: "$6",
            period: "/month",
            cta: "Start Free Trial",
            featured: true,
            features: [
              { label: "Unlimited habits", included: true },
              { label: "Advanced analytics", included: true },
              { label: "Photo proof", included: true },
              { label: "Join 3 crews", included: true },
              { label: "All widgets", included: true },
            ],
          },
          {
            name: "Teams",
            tagline: "For accountability groups.",
            price: "$12",
            period: "/month",
            cta: "Get Teams",
            featured: false,
            features: [
              { label: "Everything in Pro", included: true },
              { label: "Create unlimited crews", included: true },
              { label: "Crew leaderboards", included: true },
              { label: "Group challenges", included: true },
              { label: "Priority support", included: true },
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2.3M+", label: "Habits Tracked" },
          { value: "500K+", label: "Active Users" },
          { value: "847K", label: "Day Streak (Max)" },
          { value: "94%", label: "Goal Retention" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "REAL PEOPLE.\nREAL RESULTS."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              '"DailyStreak got me through my first marathon training. 127 days of consistent runs. The accountability crew kept me honest on days I wanted to quit."',
            name: "Maya Rodriguez",
            role: "Marathon Runner",
            avatarAlt:
              "Professional headshot of young woman with curly brown hair wearing casual clothing",
            streak: "183-day streak",
          },
          {
            quote:
              "\"I've tried 12 habit apps. DailyStreak is the only one that didn't distract me with gamification junk. Just clean tracking and brutal honesty about my consistency.\"",
            name: "David Chen",
            role: "Startup Founder",
            avatarAlt:
              "Professional headshot of middle-aged man with short gray hair and confident expression",
            streak: "312-day streak",
          },
          {
            quote:
              "\"Studying 14 hours a day, I needed something brain-dead simple. Photo proof for my Anki reviews changed the game. Passed boards on first attempt.\"",
            name: "Sarah O'Brien",
            role: "Medical Student",
            avatarAlt:
              "Professional headshot of young woman with red hair and bright smile",
            streak: "245-day streak",
          },
          {
            quote:
              '"The analytics helped me discover I skip meditation on Fridays. Fixed my Friday routine. 89% completion rate now vs 64% before."',
            name: "James Wilson",
            role: "Software Engineer",
            avatarAlt:
              "Professional headshot of young man with dark hair and trimmed beard in business casual",
            streak: "156-day streak",
          },
          {
            quote:
              '"My crew of 6 PMs keeps each other accountable for daily learning. We\'ve collectively read 400+ books this year. DailyStreak made it stick."',
            name: "Aisha Patel",
            role: "Product Manager",
            avatarAlt:
              "Professional headshot of woman with dark hair in professional attire",
            streak: "401-day streak",
          },
          {
            quote:
              '"At 68, I needed motivation to walk daily. 200+ days later, my doctor took me off blood pressure medication. This app literally changed my health."',
            name: "Robert Kim",
            role: "Retired Teacher",
            avatarAlt:
              "Professional headshot of older man with silver hair and warm expression",
            streak: "214-day streak",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "QUESTIONS? ANSWERED."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What happens if I miss a day?",
            answer:
              "Your streak resets. Brutal, we know. But that's the point — we don't sugarcoat accountability. However, we track \"recovery streaks\" separately, so you can see how often you bounce back. The data shows: people who restart within 24 hours of a miss are 3x more likely to maintain long-term habits.",
          },
          {
            question: "Can I export my data?",
            answer:
              "Absolutely. Your data is yours. Export as CSV, JSON, or PDF anytime from Settings > Data Export. Pro and Teams users get automatic monthly email backups. We believe in data portability — you're not locked in.",
          },
          {
            question: "How is this different from other habit apps?",
            answer:
              "No gamification. No coins, gems, or cartoon characters cheering you on. Just raw data, social accountability, and clean design. We focus on identity-based habit formation, not dopamine-driven rewards. DailyStreak is for adults who are serious about change.",
          },
          {
            question: "Is there an Android app?",
            answer:
              "Yes. iOS, Android, and Web. Full feature parity across platforms. Your data syncs in real-time via end-to-end encrypted connections. Works offline too — check-ins queue and sync when you're back online.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes. No contracts, no cancellation fees, no guilt trips. If DailyStreak doesn't serve you, we don't want your money. Cancel in-app or email support@dailystreak.app — we'll process within 24 hours and prorate any annual refunds.",
          },
          {
            question: "How do Crews work?",
            answer:
              "Crews are accountability groups of 2-8 people. Share your habit progress, compete on streak leaderboards, and get notified when crew members check in. Research shows accountability increases habit adherence by 65%. Crews make that social pressure constructive, not toxic.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "START YOUR STREAK TODAY."
    const ctaDesc =
      props.cta?.description ??
      "Download DailyStreak free. Track your first habit in 60 seconds. Join 500,000+ people building better lives, one day at a time."
    const ctaPrimary = props.cta?.primaryCta ?? "Download for iOS"
    const ctaSecondary = props.cta?.secondaryCta ?? "Download for Android"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["Free forever plan", "No credit card", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "Brutal honesty in habit tracking. No fluff. Just results. Built for people serious about change."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Download", "Changelog", "Roadmap"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies"],
          },
        ]
    const footerNote =
      props.footer?.note ?? `© ${new Date().getFullYear()} DailyStreak. All rights reserved.`

    const AppleIcon = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.22 7.13-.57 1.5-1.31 2.99-2.27 4.08zm-5.85-15.1c.07-2.04 1.76-3.79 3.74-3.94.29 2.32-1.97 4.78-3.74 3.94z" />
      </svg>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
      </svg>
    )

    const featureIcons = [
      <svg key="f1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="size-6" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="f2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="size-6" aria-hidden="true">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>,
      <svg key="f3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="size-6" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="f4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="size-6" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg key="f5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="size-6" aria-hidden="true">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      <svg key="f6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="size-6" aria-hidden="true">
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
        <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-primary bg-foreground">
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
                <div className="grid size-8 place-items-center bg-primary text-primary-foreground">
                  <span className="font-mono text-lg font-bold">DS</span>
                </div>
                <span className="font-mono text-lg font-bold tracking-tight text-background">
                  {brand.toUpperCase()}
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-mono text-sm uppercase tracking-wider text-background/70 transition-colors hover:text-background"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Sheet open={habitsOpen} onOpenChange={setHabitsOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="My Habits"
                      className="hidden items-center justify-center gap-2 border-2 border-background/60 bg-transparent px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider text-background transition-colors hover:border-background sm:inline-flex"
                    >
                      My Habits
                      {habits && habits.length > 0 && (
                        <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                          {habits.length}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">My Habits</SheetTitle>
                      <SheetDescription>
                        {habits && habits.length > 0
                          ? `${habits.length} habit${habits.length === 1 ? '' : 's'} being tracked.`
                          : 'No habits yet. Start tracking today.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <div className="mb-6 space-y-3">
                        <input
                          type="text"
                          placeholder="Habit name"
                          value={newHabitName}
                          onChange={(e) => setNewHabitName(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={newHabitDescription}
                          onChange={(e) => setNewHabitDescription(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button
                          type="button"
                          onClick={handleAddHabit}
                          className="w-full"
                          disabled={!newHabitName.trim()}
                        >
                          Add Habit
                        </Button>
                      </div>

                      {habits && habits.length > 0 ? (
                        <div className="space-y-4">
                          {habits.map((habit) => (
                            <div
                              key={habit.id}
                              className="rounded-lg border-2 border-border bg-background p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-foreground">
                                    {habit.name}
                                  </h4>
                                  {habit.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {habit.description}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm font-mono text-primary">
                                      {habit.streak}-day streak
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleCheckIn(habit.id)}
                                  className="shrink-0"
                                >
                                  Check In
                                </Button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteHabit(habit.id)}
                                className="mt-3 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No habits tracked
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Add your first habit above to start building your streak.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                        >
                          Close
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
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-background/20 bg-background/90 px-2 py-1 text-background shadow-sm transition hover:border-background hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
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
                          <AvatarFallback className="bg-background text-[0.65rem] font-bold text-foreground">
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
                            <AvatarFallback className="bg-background text-sm font-bold text-foreground">
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
                    className="hidden h-10 items-center gap-2 rounded-full bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-foreground text-xs font-black text-background">
                      G
                    </span>
                    <span>{authLabel}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="hidden items-center justify-center gap-2 bg-primary px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  Get App
                </button>
                <button
                  type="button"
                  aria-label="Menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-background transition-colors hover:text-background/80 md:hidden"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="size-6" aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              {mobileOpen && (
                <div
                  id="mobile-menu"
                  className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      setHabitsOpen(true)
                    }}
                    className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                  >
                    My Habits
                  </button>
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
                            <AvatarFallback className="bg-background text-sm font-bold text-foreground">
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
                          variant="outline"
                          onClick={() => {
                            setMobileOpen(false)
                            handleSignOut()
                          }}
                          className="w-full"
                        >
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignIn()
                        }}
                        disabled={auth.isLoading}
                        className="w-full"
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
        </header>

        <main className="pt-16">
          {/* Hero */}
          <section className="relative flex items-center overflow-hidden bg-foreground py-24 lg:py-32">
            <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
              <div className="absolute left-10 top-20 h-64 w-64 border-4 border-primary" />
              <div className="absolute bottom-40 right-20 h-96 w-96 border-4 border-background/20" />
              <div className="absolute right-1/3 top-40 h-32 w-32 bg-primary" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 border border-background/20 bg-foreground px-3 py-1">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="font-mono text-xs uppercase tracking-wider text-background/70">
                      {heroBadge}
                    </span>
                  </div>

                  <h1 className="text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl whitespace-pre-line">
                    {heroTop}
                    <br />
                    <span className="text-primary">{heroAccent}</span>
                    <br />
                    {heroBottom}
                  </h1>

                  <p className="max-w-md text-lg leading-relaxed text-background/70">
                    {heroSub}
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-3 border-2 border-background bg-background px-6 py-4 font-mono font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-background/90"
                    >
                      <AppleIcon className="size-6" />
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-3 border-2 border-background/60 bg-transparent px-6 py-4 font-mono font-bold uppercase tracking-wider text-background transition-colors hover:border-background"
                    >
                      <PlayIcon className="size-6" />
                      {heroSecondary}
                    </button>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-2">
                      {heroAvatarAlts.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-foreground object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-background/70">
                      <span className="font-bold text-background">{heroRating}</span> {heroRatingCount}
                    </div>
                  </div>
                </div>

                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/20" aria-hidden="true" />
                    <div className="relative border-4 border-background/20 bg-foreground p-2">
                      <Image
                        alt={heroImageAlt}
                        w={400}
                        h={800}
                        className="h-auto w-64 sm:w-72 lg:w-80"
                      />
                      <div className="absolute -left-4 top-8 bg-primary px-3 py-2 text-primary-foreground">
                        <div className="font-mono text-xs font-bold uppercase tracking-wider">
                          {heroStreakValue}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-primary-foreground/70">
                          {heroStreakLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y-4 border-foreground bg-muted py-8" aria-label="Featured in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 md:gap-16">
                {logoItems.map((name) => (
                  <span key={name} className="text-xl font-bold tracking-tight text-foreground">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background py-24" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <span className="mb-4 inline-block bg-primary px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  {featuresEyebrow}
                </span>
                <h2
                  id="features-heading"
                  className="whitespace-pre-line text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl"
                >
                  {featuresHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">{featuresDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => {
                  const isDark = i === 0
                  const isAccent = i === 5
                  return (
                    <div
                      key={item.title}
                      className={cn(
                        "group border-4 p-8 transition-colors",
                        isDark
                          ? "border-foreground bg-foreground hover:border-primary"
                          : isAccent
                            ? "border-primary bg-primary hover:border-foreground"
                            : "border-foreground bg-background hover:border-primary",
                      )}
                    >
                      <div
                        className={cn(
                          "mb-6 grid size-12 place-items-center",
                          isDark
                            ? "bg-primary text-primary-foreground"
                            : isAccent
                              ? "bg-background text-primary"
                              : "bg-foreground text-background",
                        )}
                      >
                        {featureIcons[i % featureIcons.length]}
                      </div>
                      <h3
                        className={cn(
                          "text-xl font-bold",
                          isDark || isAccent ? "text-background" : "text-foreground",
                        )}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-3 leading-relaxed",
                          isDark || isAccent
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-foreground py-24" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block bg-primary px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  {stepsEyebrow}
                </span>
                <h2
                  id="steps-heading"
                  className="whitespace-pre-line text-3xl font-bold leading-tight text-background sm:text-4xl lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
              </div>

              <div className="relative grid gap-8 md:grid-cols-3">
                <div
                  className="absolute left-1/3 right-1/3 top-16 hidden h-1 bg-background/20 md:block"
                  aria-hidden="true"
                />

                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div
                      className={cn(
                        "relative z-10 mx-auto mb-6 grid size-20 place-items-center border-4",
                        i === 0
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-background/20 bg-foreground text-background",
                      )}
                    >
                      <span className="font-mono text-3xl font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-background">{step.title}</h3>
                    <p className="mx-auto mt-3 max-w-xs text-background/70">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-24" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <span className="mb-4 inline-block bg-foreground px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-background">
                    {galleryEyebrow}
                  </span>
                  <h2
                    id="gallery-heading"
                    className="mb-6 whitespace-pre-line text-3xl font-bold leading-tight text-foreground sm:text-4xl"
                  >
                    {galleryHeading}
                  </h2>
                  <p className="mb-6 text-lg text-muted-foreground">{galleryDesc}</p>
                  <ul className="space-y-3 text-muted-foreground">
                    {galleryBullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-3">
                        <span className="size-2 bg-primary" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {galleryItems.map((alt, i) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={300}
                      h={600}
                      className={cn(
                        "h-auto w-full border-4 border-foreground object-cover",
                        i === 1 && "mt-8",
                        i === 2 && "-mt-8",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-24" aria-labelledby="pricing-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block bg-primary px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  {pricingEyebrow}
                </span>
                <h2
                  id="pricing-heading"
                  className="mb-6 whitespace-pre-line text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl"
                >
                  {pricingHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative border-4 p-8",
                      tier.featured
                        ? "border-primary bg-foreground"
                        : "border-foreground bg-background",
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground">
                        Most Popular
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 font-mono text-sm uppercase tracking-wider",
                        tier.featured ? "text-background/60" : "text-muted-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <div className="mb-6 flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          tier.featured ? "text-background" : "text-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      <span
                        className={cn(
                          tier.featured ? "text-background/60" : "text-muted-foreground",
                        )}
                      >
                        {tier.period}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mb-6",
                        tier.featured ? "text-background/60" : "text-muted-foreground",
                      )}
                    >
                      {tier.tagline}
                    </p>
                    <ul className="mb-8 space-y-3">
                      {(tier.features ?? []).map((feat) => (
                        <li
                          key={feat.label}
                          className={cn(
                            "flex items-center gap-3",
                            feat.included
                              ? tier.featured
                                ? "text-background"
                                : "text-foreground"
                              : "text-muted-foreground/60",
                          )}
                        >
                          <span
                            className={cn(
                              "font-bold",
                              feat.included ? "text-primary" : "",
                            )}
                          >
                            {feat.included ? "✓" : "—"}
                          </span>
                          <span>{feat.label}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full border-2 py-3 text-center font-mono font-bold uppercase tracking-wider transition-colors",
                        tier.featured
                          ? "border-primary bg-primary text-primary-foreground hover:border-background hover:bg-primary/90"
                          : "border-foreground bg-muted text-foreground hover:bg-muted-foreground/10",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center font-mono text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-24" aria-label="Key statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "border-l-4 pl-6 text-center lg:text-left",
                      i === 0 ? "border-primary" : "border-background/20",
                    )}
                  >
                    <div className="mb-2 text-4xl font-bold text-background sm:text-5xl">
                      {stat.value}
                    </div>
                    <div className="font-mono text-sm uppercase tracking-wider text-background/60">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block bg-foreground px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-background">
                  {testimonialsEyebrow}
                </span>
                <h2
                  id="testimonials-heading"
                  className="whitespace-pre-line text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="border-4 border-foreground bg-background p-8"
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-14 border-2 border-foreground object-cover"
                      />
                      <div>
                        <div className="font-bold text-foreground">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                    <p className="mb-4 leading-relaxed text-foreground/80">{t.quote}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-primary" aria-label="5 out of 5 stars">
                        ★★★★★
                      </span>
                      {t.streak && (
                        <span className="text-sm text-muted-foreground">{t.streak}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-24" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block bg-foreground px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-background">
                  {faqEyebrow}
                </span>
                <h2
                  id="faq-heading"
                  className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl"
                >
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group border-4 border-foreground bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="text-lg font-bold text-foreground">
                        {item.question}
                      </span>
                      <span className="font-mono text-primary transition-transform group-open:rotate-180">
                        ▼
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
          <section className="bg-primary py-24" aria-labelledby="cta-heading">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/90">
                {ctaDesc}
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-3 border-2 border-background bg-background px-8 py-4 font-mono font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-background/90"
                >
                  <AppleIcon className="size-6" />
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-3 border-2 border-background bg-transparent px-8 py-4 font-mono font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-foreground/10"
                >
                  <PlayIcon className="size-6" />
                  {ctaSecondary}
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
                {ctaBadges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 text-primary-foreground/80"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span className="font-mono text-sm">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-border bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-6 flex items-center gap-2"
                >
                  <div className="grid size-8 place-items-center bg-primary text-primary-foreground">
                    <span className="font-mono text-lg font-bold">DS</span>
                  </div>
                  <span className="font-mono text-lg font-bold tracking-tight text-background">
                    {brand.toUpperCase()}
                  </span>
                </button>
                <p className="mb-6 text-sm leading-relaxed text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {["Twitter", "Instagram", "GitHub"].map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center bg-background/10 text-background transition-colors hover:bg-primary"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        {social === "Twitter" ? (
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        ) : social === "Instagram" ? (
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        ) : (
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        )}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-background">
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

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
              <p className="font-mono text-sm text-background/50">{footerNote}</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-sm text-background/50">
                  <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
