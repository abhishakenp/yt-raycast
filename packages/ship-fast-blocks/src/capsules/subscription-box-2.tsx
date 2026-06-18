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
 * SubscriptionBoxKimiPage2 — a complete, self-contained subscription-box e-commerce
 * LANDING page (a faithful Tailwind v4 port of a Kimi-generated "RoastCraft" premium
 * coffee-delivery design).
 *
 * This is the SECOND, visually DISTINCT style sibling to SubscriptionBoxKimiPage
 * (BrewBox). Where the first leans warm/editorial with a 3-step flow + farm-story
 * collage, THIS variant is bolder & more product-forward: a split hero with a floating
 * subscriber-count card AND a "48h roast-to-door" pill, inline trust ticks, a tinted
 * "featured in" logo row, a 4-STEP "how it works" grid with gradient tiles + connector
 * chevrons, a 6-up "why choose us" feature grid, a unique COFFEE-COLLECTION image
 * gallery with roast-tag overlays, a 3-tier PRICING block with a monthly/yearly billing
 * toggle and check / cross feature lists (highlighted "Most Popular"), a dark stats band,
 * a 3-up testimonials grid with star ratings + trust-badge row, an accordion FAQ, a
 * gradient closing CTA with decorative blur orbs + reassurance ticks, and a fat dark
 * multi-column footer with socials + legal links.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item / CTA /
 * plan button / footer + social link routes through `useNavigate` (never a dead "#").
 * All content imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props at all.
 */
export const SubscriptionBoxKimiPage2 = defineCapsule({
  name: "SubscriptionBoxKimiPage2",
  description:
    "Complete subscription-box / coffee-of-the-month e-commerce LANDING page with a bold, product-forward light aesthetic (premium 'RoastCraft' coffee-delivery style). This is the SECOND, visually DISTINCT alternative style to SubscriptionBoxKimiPage (BrewBox) — pick this variant when you want a punchier, more commerce-y look with a product gallery and a billing toggle rather than an editorial farm-story layout. Includes a split hero (live-roast status pill, large headline with accent phrase, dual CTAs, inline free-shipping/cancel/guarantee trust ticks, a floating subscriber-count card and a '48h roast-to-door' badge), a tinted press/'featured in' logos strip, a 4-step 'how it works' grid with gradient tiles and connector chevrons, a 6-up 'why choose us' feature grid with icon tiles, a unique COFFEE-COLLECTION image gallery with roast-tag overlays and tasting notes, a 3-tier subscription PRICING block with a monthly/yearly billing toggle, check and cross feature lists, and a highlighted 'Most Popular' plan, a dark stats/metrics band, a 3-up customer testimonials grid with 5-star ratings, avatars and a trust-badge row, an accordion FAQ (details/summary), a gradient closing CTA with decorative blur orbs and reassurance ticks, and a fat dark multi-column footer with product/company/support links and social icons. Use as the ROOT/home page for subscription boxes, monthly-delivery DTC brands, coffee/tea/wine/snack/meal-kit clubs, curated-goods memberships, or any recurring-shipment commerce product needing trust signals, tiered plans, a product showcase, social proof and FAQ. Supply content only — brand, nav, hero, logos, steps, features, collection, plans, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingBefore: z.string().optional(),
        /** Phrase rendered with the accent (primary) color highlight. */
        highlight: z.string().optional(),
        headingAfter: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        ticks: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        cardTitle: z.string().optional(),
        cardSubtitle: z.string().optional(),
        badgeValue: z.string().optional(),
        badgeLabel: z.string().optional(),
      })
      .optional(),
    /** Press / "featured in" logos trust strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** "How it works" multi-step flow. */
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
              meta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Why choose us" feature grid. */
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
    /** Coffee-collection image gallery. */
    collection: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              name: z.string(),
              notes: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Tiered subscription pricing with a billing toggle. */
    plans: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        billingMonthly: z.string().optional(),
        billingYearly: z.string().optional(),
        billingYearlyNote: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              disabled: z.array(z.string()).optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    /** Dark stats / metrics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Customer testimonials grid. */
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
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing gradient CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        ticks: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      subscriptions: table({
        planName: string(),
        planPrice: string(),
        billingPeriod: string(),
        grindSize: string(),
        deliveryFrequency: string(),
        quantity: number(),
      }),
      favorites: table({
        coffeeName: string(),
      }),
    },
    queries: {
      subscriptions: ({ db }) => db.subscriptions.orderBy('createdAt').all(),
      favoriteCoffeeNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.coffeeName)),
    },
    mutations: {
      subscribe: ({ db }, planName: string, planPrice: string, billingPeriod: string) => {
        db.subscriptions.insert({
          planName,
          planPrice,
          billingPeriod,
          grindSize: 'Whole Bean',
          deliveryFrequency: 'Monthly',
          quantity: 1,
        })
        return db.subscriptions.all()
      },
      updateSubscription: ({ db }, id: string, updates: Record<string, unknown>) => {
        const subscription = db.subscriptions.get(id)
        if (subscription) {
          db.subscriptions.update(id, updates)
        }
        return db.subscriptions.all()
      },
      cancelSubscription: ({ db }, id: string) => {
        db.subscriptions.delete(id)
        return db.subscriptions.all()
      },
      toggleFavorite: ({ db }, coffeeName: string) => {
        const existingFavorite = db.favorites
          .where('coffeeName', coffeeName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ coffeeName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [subscriptionOpen, setSubscriptionOpen] = useState(false)
    const brand = props.brand ?? "RoastCraft"
    const nav = props.nav?.length
      ? props.nav
      : ["How It Works", "Pricing", "Our Coffee", "Reviews", "FAQ"]

    const subscriptions = lakebed.useQuery('subscriptions')
    const favoriteCoffeeNames = lakebed.useQuery('favoriteCoffeeNames')
    const auth = lakebed.useAuth()
    const subscribe = lakebed.useMutation('subscribe')
    const updateSubscription = lakebed.useMutation('updateSubscription')
    const cancelSubscription = lakebed.useMutation('cancelSubscription')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
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
    const activeSubscription = subscriptions?.[0]
    const subscriptionCount = subscriptions?.length ?? 0

    const heroBadge = props.hero?.badge ?? "Now roasting: Ethiopia Yirgacheffe"
    const heroHeadingBefore = props.hero?.headingBefore ?? "Coffee That "
    const heroHighlight = props.hero?.highlight ?? "Awakens"
    const heroHeadingAfter = props.hero?.headingAfter ?? " Your Senses"
    const heroSub =
      props.hero?.subheading ??
      "Freshly roasted single-origin beans delivered within 48 hours of roasting. Curated by award-winning roasters. Personalized to your perfect taste profile."
    const heroPrimary = props.hero?.primaryCta ?? "Start Your Journey"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const heroTicks = props.hero?.ticks?.length
      ? props.hero.ticks
      : ["Free shipping", "Skip or cancel anytime", "30-day guarantee"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "professional coffee pour-over brewing with rich crema in ceramic cup on wooden counter"
    const heroCardTitle = props.hero?.cardTitle ?? "48,000+ happy subscribers"
    const heroCardSubtitle = props.hero?.cardSubtitle ?? "Across 12 countries"
    const heroBadgeValue = props.hero?.badgeValue ?? "48h"
    const heroBadgeLabel = props.hero?.badgeLabel ?? "Roast to Door"

    const logosHeading =
      props.logos?.heading ?? "Featured in leading publications"
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : ["Bon Appétit", "Food & Wine", "Thrillist", "Serious Eats", "Wirecutter"]

    const stepsEyebrow = props.steps?.eyebrow ?? "Simple Process"
    const stepsHeading = props.steps?.heading ?? "How RoastCraft Works"
    const stepsDesc =
      props.steps?.description ??
      "From bean selection to your first sip, we've perfected every step of the journey."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Take the Quiz",
            description:
              "Answer 6 quick questions about your taste preferences, brewing method, and caffeine needs.",
            meta: "Takes 2 minutes",
          },
          {
            title: "Get Matched",
            description:
              "Our algorithm selects 3 coffees perfectly suited to your profile from our rotating collection.",
            meta: "200+ coffees in rotation",
          },
          {
            title: "Roasted Fresh",
            description:
              "Your coffee is roasted in small batches on our Probat roasters and shipped within 24 hours.",
            meta: "3 roasteries nationwide",
          },
          {
            title: "Delivered & Enjoyed",
            description:
              "Track your delivery in real-time. Rate each coffee to help us perfect your next selection.",
            meta: "Free shipping over $25",
          },
        ]

    const featuresEyebrow = props.features?.eyebrow ?? "Why Choose Us"
    const featuresHeading =
      props.features?.heading ?? "What Makes Us Different"
    const featuresDesc =
      props.features?.description ??
      "We're obsessed with every detail of your coffee experience, from sourcing to your morning cup."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Direct Trade Sourcing",
            description:
              "We work directly with farmers in 18 countries, paying 40% above fair trade minimums. Annual farm visits ensure quality and sustainability.",
          },
          {
            title: "48-Hour Freshness",
            description:
              "Coffee roasted Monday ships Tuesday. Wednesday roasts ship Thursday. Your beans arrive at peak flavor, never warehouse-stale.",
          },
          {
            title: "Flavor Profiling",
            description:
              "Our Q-graders score every batch on acidity, body, sweetness, and flavor notes. You receive detailed tasting notes and brewing guides.",
          },
          {
            title: "Carbon Neutral",
            description:
              "100% carbon neutral shipping via partnerships with Gold Standard reforestation projects. Compostable packaging made from plant fibers.",
          },
          {
            title: "Fully Customizable",
            description:
              "Adjust grind size, delivery frequency (weekly to monthly), and quantity anytime. Add decaf blends, single origins, or espresso roasts.",
          },
          {
            title: "Brewing Support",
            description:
              "Access video brewing guides, live chat with our baristas, and troubleshooting help. Join 15,000 members in our private coffee community.",
          },
        ]

    const collectionEyebrow =
      props.collection?.eyebrow ?? "Current Selection"
    const collectionHeading =
      props.collection?.heading ?? "This Month's Collection"
    const collectionDesc =
      props.collection?.description ??
      "Each month our roasters curate 12 exceptional coffees from our partner farms worldwide."
    const collectionItems = props.collection?.items?.length
      ? props.collection.items
      : [
          {
            tag: "Light Roast",
            name: "Ethiopia Yirgacheffe",
            notes: "Blueberry, jasmine, bergamot · Gedeo Zone",
            imageAlt:
              "close up of dark roasted Ethiopian coffee beans with oil sheen in burlap sack",
          },
          {
            tag: "Medium Roast",
            name: "Colombia Huila",
            notes: "Caramel, red apple, cocoa · San Agustín",
            imageAlt:
              "rich Colombian coffee beans scattered on wooden surface with sunlight",
          },
          {
            tag: "Dark Roast",
            name: "Sumatra Mandheling",
            notes: "Earth, dark chocolate, smoke · Lintong",
            imageAlt:
              "Sumatra Mandheling coffee beans in a wooden scoop showing dark oily surface",
          },
          {
            tag: "Light-Medium",
            name: "Guatemala Antigua",
            notes: "Spice, orange, nougat · Antigua Valley",
            imageAlt:
              "freshly roasted Guatemala Antigua beans cooling on tray with steam",
          },
          {
            tag: "Light Roast",
            name: "Kenya AA Nyeri",
            notes: "Blackcurrant, tomato, winey · Nyeri County",
            imageAlt:
              "Kenya AA coffee beans with distinctive shape and deep color in ceramic bowl",
          },
          {
            tag: "Medium Roast",
            name: "Brazil Santos",
            notes: "Nutty, chocolate, low acid · Minas Gerais",
            imageAlt:
              "Brazil Santos coffee beans arranged in heart shape on slate background",
          },
        ]

    const plansEyebrow = props.plans?.eyebrow ?? "Flexible Plans"
    const plansHeading = props.plans?.heading ?? "Choose Your Perfect Plan"
    const plansDesc =
      props.plans?.description ??
      "All plans include free shipping, cancel anytime, and our 30-day satisfaction guarantee."
    const billingMonthly = props.plans?.billingMonthly ?? "Monthly"
    const billingYearly = props.plans?.billingYearly ?? "Yearly"
    const billingYearlyNote = props.plans?.billingYearlyNote ?? "Save 20%"
    const planItems = props.plans?.items?.length
      ? props.plans.items
      : [
          {
            name: "Explorer",
            tagline: "Perfect for trying new flavors",
            price: "$19",
            period: "/month",
            features: [
              "1 bag (12oz) per month",
              "Rotating single origins",
              "Whole bean or ground",
              "Brewing guide included",
            ],
            disabled: ["Swap coffees"],
            cta: "Get Started",
          },
          {
            name: "Enthusiast",
            tagline: "For the daily coffee lover",
            price: "$34",
            period: "/month",
            features: [
              "2 bags (12oz each) per month",
              "Choose your coffees",
              "Access to limited editions",
              "Detailed tasting notes",
              "Swap coffees anytime",
              "Free sample pack quarterly",
            ],
            cta: "Get Started",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Connoisseur",
            tagline: "For serious coffee aficionados",
            price: "$59",
            period: "/month",
            features: [
              "4 bags (12oz each) per month",
              "Rare micro-lot access",
              "Priority access to limited releases",
              "Private cupping sessions",
              "Direct roaster chat support",
              "Brewing equipment discounts",
            ],
            cta: "Get Started",
          },
        ]
    const plansFootnote =
      props.plans?.footnote ??
      "All plans include: Free shipping · Cancel anytime · 30-day guarantee · Compostable packaging"

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "48,000+", label: "Active Subscribers" },
          { value: "200+", label: "Coffees in Rotation" },
          { value: "4.9/5", label: "Average Rating" },
          { value: "18", label: "Source Countries" },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Loved by Coffee Lovers"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Subscribers Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of coffee enthusiasts who've transformed their morning ritual."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The Ethiopia Yirgacheffe I got last month had the most incredible blueberry notes. I've been a subscriber for 2 years now and every bag has been exceptional. The tasting notes are spot-on.",
            name: "Sarah Chen",
            role: "Software Engineer, Seattle · 2 years",
            avatarAlt:
              "professional headshot of a smiling woman with dark hair in natural light",
          },
          {
            quote:
              "As a former barista, I'm incredibly picky about my coffee. RoastCraft consistently delivers beans that rival the best specialty shops. The freshness is unmatched—no more stale supermarket coffee.",
            name: "Marcus Williams",
            role: "Former Head Barista, Portland · 1.5 years",
            avatarAlt:
              "professional headshot of a bearded man with glasses and warm smile",
          },
          {
            quote:
              "I love that I can customize my delivery schedule around travel. The ability to swap coffees based on my mood has introduced me to origins I never would have tried otherwise. Best subscription service ever.",
            name: "Emily Rodriguez",
            role: "Travel Photographer, Austin · 3 years",
            avatarAlt:
              "professional headshot of a woman with blonde hair and confident expression",
          },
        ]
    const testimonialBadges = props.testimonials?.badges?.length
      ? props.testimonials.badges
      : [
          "12,000+ 5-star reviews on Trustpilot",
          "94% renewal rate",
          "30-day satisfaction guarantee",
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Got Questions?"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about your coffee subscription."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How fresh is the coffee when it arrives?",
            a: "All our coffee is roasted in small batches and shipped within 24 hours of roasting. Most subscribers receive their coffee 2-4 days after roasting, which is the sweet spot for brewing—fresh enough for peak flavor, rested enough for optimal extraction.",
          },
          {
            q: "Can I change my plan or skip a month?",
            a: "Absolutely! You can upgrade, downgrade, or pause your subscription anytime through your account dashboard. Going on vacation? Just skip a delivery. Changed your brewing method? Adjust your grind size preference instantly. No penalties, no hassle.",
          },
          {
            q: "What if I don't like a particular coffee?",
            a: "Our 30-day satisfaction guarantee has you covered. If any coffee doesn't meet your expectations, contact our support team and we'll either send a replacement or issue a credit for your next shipment. Your feedback also helps us refine your flavor profile for better future matches.",
          },
          {
            q: "Do you offer decaf options?",
            a: "Yes! We offer several Swiss Water Process decaf options that retain exceptional flavor without the caffeine. During signup, simply indicate your preference for decaf or half-caf, and our algorithm will prioritize those selections while still matching your taste profile.",
          },
          {
            q: "What brewing equipment do you recommend?",
            a: "We provide brewing guides for every method: pour-over (V60, Chemex, Kalita), French press, AeroPress, espresso, and drip. Enthusiast and Connoisseur members receive equipment discounts of up to 25% on partners like Fellow, Hario, and Baratza through our member portal.",
          },
          {
            q: "How do you ensure ethical sourcing?",
            a: "We pay an average of 40% above fair trade minimums and visit partner farms annually. Many relationships span 5+ years, allowing us to invest in processing improvements and environmental initiatives. Every bag includes the farmer's name and cooperative details.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to Transform Your Coffee Experience?"
    const ctaDesc =
      props.cta?.description ??
      "Join 48,000+ coffee lovers who start their day with RoastCraft. Take our 2-minute quiz and get your first bag for 50% off."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Your Journey"
    const ctaSecondary = props.cta?.secondaryCta ?? "Learn More"
    const ctaTicks = props.cta?.ticks?.length
      ? props.cta.ticks
      : ["No commitment", "Skip or cancel anytime", "30-day guarantee"]

    const footerDesc =
      props.footer?.description ??
      "Premium single-origin coffee, freshly roasted and delivered to your door. Elevating your morning ritual since 2019."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Product",
            links: [
              "Our Coffee",
              "Subscriptions",
              "Gift Cards",
              "Brewing Equipment",
              "Merchandise",
            ],
          },
          {
            heading: "Company",
            links: [
              "About Us",
              "Our Roasteries",
              "Sustainability",
              "Careers",
              "Press",
            ],
          },
          {
            heading: "Support",
            links: [
              "Help Center",
              "Brewing Guides",
              "Track Order",
              "Contact Us",
              "Wholesale",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Coffee Co. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Brand mark — steam/wifi-style glyph (decorative brand asset).
    const BrandMark = () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary-foreground"
        aria-hidden="true"
      >
        <path d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Cross = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className ?? 'size-4'}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ChevronRight = ({ className }: { className?: string }) => (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground transition-transform group-open:rotate-180"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
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

    const featureIcons: ReactNode[] = [
      // shield check / sourcing
      <svg
        key="shield"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // clock / freshness
      <svg
        key="clock"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // beaker / profiling
      <svg
        key="beaker"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      // globe / carbon neutral
      <svg
        key="globe"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // sliders / customizable
      <svg
        key="sliders"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>,
      // support / brewing
      <svg
        key="support"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
    ]

    const socialIcons: { label: string; path: string }[] = [
      {
        label: "Instagram",
        path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      },
      {
        label: "Twitter",
        path: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
      },
      {
        label: "Facebook",
        path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
      },
      {
        label: "YouTube",
        path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
      },
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <span className="grid size-10 place-items-center rounded-full bg-primary">
                  <BrandMark />
                </span>
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
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
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
                          onClick={() => {
                            setSubscriptionOpen(true)
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Subscription
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
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
                  onClick={() => setSubscriptionOpen(true)}
                  aria-label="Subscription"
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
                    <path d="M20 7h-9" />
                    <path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" />
                    <circle cx="7" cy="7" r="3" />
                  </svg>
                  {subscriptionCount > 0 ? (
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                      {subscriptionCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
        </header>

        <Sheet open={subscriptionOpen} onOpenChange={setSubscriptionOpen}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 sm:max-w-md"
          >
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Subscription</SheetTitle>
              <SheetDescription>
                {activeSubscription
                  ? `Active: ${activeSubscription.planName} (${activeSubscription.billingPeriod})`
                  : 'No active subscription. Choose a plan to get started.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeSubscription ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-muted/40 p-4">
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {activeSubscription.planName}
                    </h3>
                    <p className="mb-4 text-2xl font-bold text-foreground">
                      {activeSubscription.planPrice}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{activeSubscription.billingPeriod.toLowerCase()}
                      </span>
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          Grind Size
                        </label>
                        <select
                          value={activeSubscription.grindSize}
                          onChange={(e) => {
                            void updateSubscription(activeSubscription.id, {
                              grindSize: e.target.value,
                            })
                          }}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="Whole Bean">Whole Bean</option>
                          <option value="Fine">Fine (Espresso)</option>
                          <option value="Medium">Medium (Drip)</option>
                          <option value="Coarse">Coarse (French Press)</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          Delivery Frequency
                        </label>
                        <select
                          value={activeSubscription.deliveryFrequency}
                          onChange={(e) => {
                            void updateSubscription(activeSubscription.id, {
                              deliveryFrequency: e.target.value,
                            })
                          }}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="Weekly">Weekly</option>
                          <option value="Bi-Weekly">Bi-Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          Quantity (bags)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={activeSubscription.quantity}
                          onChange={(e) => {
                            void updateSubscription(activeSubscription.id, {
                              quantity: Number.parseInt(e.target.value, 10) || 1,
                            })
                          }}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-base font-semibold text-foreground">
                    No active subscription
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a plan from the Pricing section to start your coffee journey.
                  </p>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              {activeSubscription ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full rounded-full"
                  onClick={() => {
                    void cancelSubscription(activeSubscription.id)
                  }}
                >
                  Cancel Subscription
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full rounded-full"
                  onClick={() => {
                    setSubscriptionOpen(false)
                    go('Pricing')
                  }}
                >
                  View Plans
                </Button>
              )}
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                >
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden pb-16 pt-12 lg:pb-24 lg:pt-16">
            <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-muted" />
            <div className="absolute right-0 top-0 h-full w-1/2 -skew-x-12 translate-x-1/4 bg-primary/5" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroHeadingBefore}
                    <span className="text-primary">{heroHighlight}</span>
                    {heroHeadingAfter}
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border-2 border-border bg-card px-8 py-4 text-lg font-bold text-foreground transition-all hover:border-primary/40 hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground lg:justify-start">
                    {heroTicks.map((tick) => (
                      <div key={tick} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        {tick}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-6" />
                      </span>
                      <div>
                        <p className="font-bold text-card-foreground">
                          {heroCardTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {heroCardSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 animate-pulse rounded-2xl bg-primary p-4 text-primary-foreground shadow-xl">
                    <p className="text-2xl font-bold">{heroBadgeValue}</p>
                    <p className="text-xs text-primary-foreground/70">
                      {heroBadgeLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-card py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 lg:gap-16">
                {logosItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-xl font-bold text-foreground transition-colors hover:text-primary"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="h-full rounded-3xl bg-gradient-to-br from-accent to-muted p-8">
                      <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="mt-6 text-sm font-semibold text-primary">
                        {step.meta}
                      </div>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
                        <ChevronRight className="size-8 text-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {featuresEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
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

          {/* Coffee collection gallery */}
          <section id="coffee-collection" className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {collectionEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {collectionHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {collectionDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collectionItems.map((item) => {
                  const isFavorite =
                    favoriteCoffeeNames?.has(item.name) ?? false

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => go(item.name)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted text-left"
                    >
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void toggleFavorite(item.name)
                        }}
                        aria-pressed={isFavorite}
                        aria-label={
                          isFavorite
                            ? `Remove ${item.name} from favorites`
                            : `Add ${item.name} to favorites`
                        }
                        className={cn(
                          'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                          isFavorite
                            ? 'bg-primary text-primary-foreground opacity-100'
                            : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                        )}
                      >
                        <HeartIcon active={isFavorite} />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                          {item.tag}
                        </span>
                        <h3 className="mb-1 text-xl font-bold text-background">
                          {item.name}
                        </h3>
                        <p className="text-sm text-background/80">{item.notes}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="bg-gradient-to-b from-muted to-background py-20 lg:py-28"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {plansEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {plansHeading}
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  {plansDesc}
                </p>
                <div className="inline-flex items-center rounded-full bg-secondary p-1">
                  <button
                    type="button"
                    onClick={() => go(billingMonthly)}
                    className="rounded-full bg-card px-6 py-2 font-semibold text-foreground shadow-sm transition-all"
                  >
                    {billingMonthly}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(billingYearly)}
                    className="rounded-full px-6 py-2 font-medium text-muted-foreground transition-all hover:text-foreground"
                  >
                    {billingYearly}
                    <span className="ml-1 text-xs text-primary">
                      {billingYearlyNote}
                    </span>
                  </button>
                </div>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {planItems.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative flex flex-col rounded-3xl p-8",
                      plan.featured
                        ? "border-2 border-primary bg-card shadow-xl shadow-primary/10"
                        : "border-2 border-border bg-card transition-colors hover:border-primary/40",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-2xl font-bold text-card-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground">{plan.tagline}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-card-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 flex-grow space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                      {plan.disabled?.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Cross className="mt-0.5 size-5 shrink-0 text-muted-foreground/40" />
                          <span className="text-muted-foreground/60">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        void subscribe(plan.name, plan.price, plan.period.replace('/', ''))
                        setSubscriptionOpen(true)
                      }}
                      className={cn(
                        "w-full rounded-xl py-4 font-bold transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                          : "border-2 border-border text-foreground hover:border-primary hover:text-primary",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">{plansFootnote}</p>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-background lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-2xl bg-muted p-8">
                    <div className="mb-4 flex gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
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
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                {testimonialBadges.map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-accent">
                      <h3 className="pr-4 text-lg font-semibold text-card-foreground">
                        {item.q}
                      </h3>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20 lg:py-28">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-10 top-10 size-32 rounded-full bg-primary-foreground/10 blur-3xl" />
              <div className="absolute bottom-10 right-10 size-48 rounded-full bg-primary-foreground/10 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-10 py-4 text-lg font-bold text-primary shadow-xl transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/10 px-10 py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/80">
                {ctaTicks.map((tick) => (
                  <div key={tick} className="flex items-center gap-2">
                    <Check className="size-5" />
                    {tick}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-6 flex items-center gap-2"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-primary">
                    <BrandMark />
                  </span>
                  <span className="text-2xl font-bold">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm text-background/70">{footerDesc}</p>
                <div className="flex gap-4">
                  {socialIcons.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={social.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 text-lg font-bold">{col.heading}</h4>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/60">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/60 transition-colors hover:text-background"
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
