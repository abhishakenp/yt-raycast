import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
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
 * SubscriptionBoxKimiPage — a complete, self-contained subscription-box e-commerce
 * LANDING page (a faithful Tailwind v4 port of a Kimi-generated "BrewBox" artisan
 * coffee-of-the-month design).
 *
 * A warm, editorial, light-canvas commerce page built for recurring-delivery / box
 * subscriptions. It pairs a split hero (live-shipment pill, big serif-feel headline,
 * dual CTAs, avatar social-proof + subscriber count, product flat-lay photo with a
 * floating "freshness guaranteed" badge) with a press/logos trust strip, a 6-up
 * benefits grid with icons, a 3-step "how it works" flow with images and connector
 * arrows, a farm-to-cup brand-story split with an offset photo collage + stat trio,
 * a 3-tier pricing block (highlighted "Most Popular" plan), a dark stats band, a
 * 3-up testimonials grid with star ratings + avatars, an accordion FAQ, a full-bleed
 * closing CTA over an imagery overlay, and a fat multi-column footer with socials.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item / CTA /
 * plan button / footer + social link routes through `useNavigate` (never a dead "#").
 * All content imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props at all.
 */
export const SubscriptionBoxKimiPage = defineCapsule({
  name: 'SubscriptionBoxKimiPage',
  description:
    "Complete subscription-box / box-of-the-month e-commerce LANDING page with a warm, editorial, light aesthetic (artisan coffee 'BrewBox' style). Includes a split hero (live-shipment status pill, large headline with accent phrase, dual CTAs, avatar stack with subscriber count, product flat-lay photo + floating freshness badge), a press/'featured in' logos trust strip, a 6-up benefits/value grid with icon tiles, a 3-step 'how it works' flow with step images and connector arrows, a farm-to-cup brand-story split with an offset photo collage and a stat trio, a 3-tier subscription PRICING block with a highlighted 'Most Popular' plan and feature checklists, a dark stats/metrics band, a 3-up customer testimonials grid with 5-star ratings and avatars, an accordion FAQ (details/summary), a full-bleed closing CTA over an image overlay, and a fat multi-column footer with company/support/legal links and social icons. Use as the ROOT/home page for subscription boxes, monthly-delivery DTC brands, coffee/tea/wine/snack/meal-kit clubs, curated-goods memberships, or any recurring-shipment commerce product needing trust signals, tiered plans, social proof and FAQ. Supply content only — brand, nav, hero, benefits, steps, story, plans, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered with the accent (primary) color highlight. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        imageAlt: z.string().optional(),
        badgeTitle: z.string().optional(),
        badgeSubtitle: z.string().optional(),
      })
      .optional(),
    /** Press / "featured in" logos trust strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Benefits / value grid. */
    benefits: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "How it works" 3-step flow. */
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
      })
      .optional(),
    /** Brand-story split with photo collage + stats. */
    story: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        imageAlts: z.array(z.string()).optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Tiered subscription pricing. */
    plans: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        footnote: z.string().optional(),
        footnoteLink: z.string().optional(),
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
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Closing full-bleed CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        columns: z
          .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        madeWith: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      plans: table({
        name: string(),
        tagline: string(),
        price: string(),
        period: string(),
        features: string(),
        cta: string(),
        featured: string(),
        badge: string(),
      }),
      subscriptions: table({
        planName: string(),
        quantity: number(),
      }),
      favorites: table({
        planName: string(),
      }),
    },
    queries: {
      plans: ({ db }) => db.plans.orderBy('createdAt').all(),
      subscriptionLines: ({ db }) =>
        db.subscriptions.all().flatMap((item) => {
          const plan = db.plans.get(item.planName)
          return plan ? [{ ...item, plan }] : []
        }),
      favoritePlanNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.planName)),
    },
    mutations: {
      subscribeToPlan: ({ db }, planName: string) => {
        const plan = db.plans.where('name', planName).all()[0]
        if (!plan) return db.subscriptions.all()

        const existingSubscription = db.subscriptions
          .where('planName', plan.id)
          .all()[0]

        if (existingSubscription) {
          db.subscriptions.update(existingSubscription.id, {
            quantity: existingSubscription.quantity + 1,
          })
        } else {
          db.subscriptions.insert({
            planName: plan.id,
            quantity: 1,
          })
        }

        return db.subscriptions.all()
      },
      updateSubscriptionQuantity: (
        { db },
        planId: string,
        quantity: number,
      ) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.subscriptions.where('planName', planId).all()) {
          if (nextQuantity) {
            db.subscriptions.update(item.id, { quantity: nextQuantity })
          } else {
            db.subscriptions.delete(item.id)
          }
        }

        return db.subscriptions.all()
      },
      removeFromSubscriptions: ({ db }, planId: string) => {
        for (const item of db.subscriptions.where('planName', planId).all()) {
          db.subscriptions.delete(item.id)
        }

        return db.subscriptions.all()
      },
      clearSubscriptions: ({ db }) => {
        for (const item of db.subscriptions.all()) {
          db.subscriptions.delete(item.id)
        }

        return []
      },
      toggleFavorite: ({ db }, planName: string) => {
        const existingFavorite = db.favorites
          .where('planName', planName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ planName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [subscriptionOpen, setSubscriptionOpen] = useState(false)
    const brand = props.brand ?? 'BrewBox'
    const nav = props.nav?.length
      ? props.nav
      : ['How It Works', 'Plans', 'Our Story', 'FAQ']

    const heroBadge = props.hero?.badge ?? 'Now shipping: Ethiopian Yirgacheffe'
    const heroHeadingTop = props.hero?.headingTop ?? 'Exceptional coffee,'
    const heroHighlight = props.hero?.highlight ?? 'delivered perfectly.'
    const heroSub =
      props.hero?.subheading ??
      'Discover single-origin coffees from award-winning roasters. Each box arrives freshly roasted, with brewing guides and tasting notes tailored to your preferences.'
    const heroPrimary = props.hero?.primaryCta ?? 'Start Your Subscription'
    const heroSecondary = props.hero?.secondaryCta ?? 'See How It Works'
    const heroSocialProof = props.hero?.socialProof ?? '12,000+ coffee lovers'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'flat lay of artisan coffee subscription box contents including freshly roasted beans ceramic cup brewing equipment and tasting notes card'
    const heroBadgeTitle = props.hero?.badgeTitle ?? 'Freshness Guaranteed'
    const heroBadgeSubtitle =
      props.hero?.badgeSubtitle ?? 'Roasted within 48 hours'

    const logosHeading = props.logos?.heading ?? 'Featured in & trusted by'
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : ['Bon Appétit', 'Food & Wine', 'Serious Eats', 'Sprudge', 'Eater']

    const benefitsHeading =
      props.benefits?.heading ?? 'The complete coffee experience'
    const benefitsDesc =
      props.benefits?.description ??
      'Every box is curated to help you discover, brew, and appreciate exceptional coffee.'
    const benefitItems = props.benefits?.items?.length
      ? props.benefits.items
      : [
          {
            title: 'Curated Selection',
            description:
              'Three unique coffees each month from top-tier roasters like Intelligentsia, Counter Culture, and Stumptown. Rotating origins from Ethiopia to Colombia.',
          },
          {
            title: 'Peak Freshness',
            description:
              'Roasted to order and shipped within 48 hours of roasting. Nitrogen-flushed bags lock in flavor for optimal brewing from day 3 to day 21.',
          },
          {
            title: 'Brewing Guides',
            description:
              'Detailed tasting notes with flavor profiles, origin stories, and precise brewing parameters for V60, Chemex, AeroPress, and espresso methods.',
          },
          {
            title: 'Flexible Delivery',
            description:
              'Choose your frequency: weekly, bi-weekly, or monthly. Pause, skip, or adjust anytime. Delivery aligned with your consumption rate.',
          },
          {
            title: 'Grind Preference',
            description:
              'Whole bean or ground to your specifications. Choose from coarse (French press), medium (drip), fine (espresso), or extra-fine (Turkish).',
          },
          {
            title: 'Satisfaction Promise',
            description:
              "Not loving a coffee? We'll replace it free or refund your box. Our taste-matching algorithm improves with every rating you submit.",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? 'How It Works'
    const stepsHeading =
      props.steps?.heading ?? 'Your perfect cup, in three steps'
    const stepsDesc =
      props.steps?.description ??
      'We handle the sourcing, roasting, and delivery. You enjoy the brewing and tasting.'
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Choose your plan',
            description:
              'Select your preferred roast profile (light, medium, dark, or mixed), grind setting, and delivery frequency. Plans start at $19/month.',
            imageAlt:
              'person selecting coffee beans from jars in a specialty coffee shop',
          },
          {
            title: 'We curate & roast',
            description:
              'Our coffee team scores 50+ samples monthly. Winners are small-batch roasted Monday-Wednesday and shipped Thursday morning.',
            imageAlt:
              'industrial coffee roasting machine with copper drum and visible roasting beans',
          },
          {
            title: 'Brew & enjoy',
            description:
              'Unbox your coffee, scan the QR code for brewing instructions, and discover your new favorite origin. Rate each coffee to refine future selections.',
            imageAlt:
              'pour over coffee being brewed with steam rising from ceramic dripper into glass carafe',
          },
        ]

    const storyEyebrow = props.story?.eyebrow ?? 'Our Story'
    const storyHeading =
      props.story?.heading ?? 'From farm to cup, with care at every step'
    const storyParagraphs = props.story?.paragraphs?.length
      ? props.story.paragraphs
      : [
          "BrewBox began in 2018 when our founder, a former Q-Grader, grew frustrated with the gap between exceptional green coffee and what reached consumers' cups. We built direct relationships with farmers in Ethiopia, Guatemala, Colombia, and Kenya—paying 40% above Fair Trade minimums.",
          'Each coffee in your box is traceable to the farm or cooperative level. We share the harvest dates, processing methods (washed, natural, honey, anaerobic), and the stories of the producers behind every bean.',
          'Our roasting partners are small-batch artisans who have won 17 national roasting competitions combined. They roast on equipment that costs more than a house because precision matters—down to 0.1°C control throughout the roast curve.',
        ]
    const storyImageAlts = props.story?.imageAlts?.length
      ? props.story.imageAlts
      : [
          'close up of coffee cherries being hand picked at a farm',
          'coffee cupping session with multiple glasses and spoons on wooden table',
          'barista carefully pouring latte art into ceramic cup',
          'aerial view of coffee plantation with rows of green coffee trees',
        ]
    const storyStats = props.story?.stats?.length
      ? props.story.stats
      : [
          { value: '6', label: 'Origin countries' },
          { value: '40%', label: 'Above Fair Trade' },
          { value: '48hr', label: 'Roast to ship' },
        ]

    const plansEyebrow = props.plans?.eyebrow ?? 'Plans'
    const plansHeading = props.plans?.heading ?? 'Choose your subscription'
    const plansDesc =
      props.plans?.description ??
      'Flexible plans that scale with your coffee consumption. All plans include free shipping and can be paused anytime.'
    const planItems = props.plans?.items?.length
      ? props.plans.items
      : [
          {
            name: 'Explorer',
            tagline: 'Perfect for solo drinkers',
            price: '$19',
            period: '/month',
            features: [
              '12 oz of single-origin coffee',
              '1 coffee variety per box',
              'Digital brewing guide',
              'Cancel anytime',
            ],
            cta: 'Get Started',
          },
          {
            name: 'Enthusiast',
            tagline: 'For the daily coffee lover',
            price: '$34',
            period: '/month',
            features: [
              '24 oz of premium coffee',
              '2 different origins per box',
              'Printed tasting cards + QR',
              'Priority customer support',
              'Exclusive micro-lot access',
            ],
            cta: 'Get Started',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Connoisseur',
            tagline: 'For households & offices',
            price: '$59',
            period: '/month',
            features: [
              '48 oz of rare coffees',
              '3 premium varieties',
              'Exclusive Gesha & competition lots',
              'Monthly brewing kit gifts',
              'Quarterly virtual cupping',
            ],
            cta: 'Get Started',
          },
        ]
    const plansFootnote =
      props.plans?.footnote ??
      'All plans include free shipping within the US. International shipping available for $8/box.'
    const plansFootnoteLink = props.plans?.footnoteLink ?? 'Learn more'

    const priceAmount = (price: string) => {
      const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ''))
      return Number.isFinite(amount) ? amount : 0
    }
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)

    const normalizedPlanItems = planItems.map((plan) => ({
      name: plan.name,
      tagline: plan.tagline,
      price: plan.price,
      period: plan.period,
      features: plan.features.join(', '),
      cta: plan.cta,
      featured: plan.featured ? 'true' : 'false',
      badge: plan.badge ?? '',
    }))

    const storedPlans = lakebed.useQuery('plans')
    const subscriptionLines = lakebed.useQuery('subscriptionLines')
    const favoritePlanNames = lakebed.useQuery('favoritePlanNames')
    const auth = lakebed.useAuth()
    const subscribeToPlan = lakebed.useMutation('subscribeToPlan')
    const updateSubscriptionQuantity = lakebed.useMutation(
      'updateSubscriptionQuantity',
    )
    const removeFromSubscriptions = lakebed.useMutation(
      'removeFromSubscriptions',
    )
    const clearSubscriptions = lakebed.useMutation('clearSubscriptions')
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
    const displayPlans =
      storedPlans && storedPlans.length > 0 ? storedPlans : normalizedPlanItems
    const safeSubscriptionLines = subscriptionLines ?? []
    const subscriptionCount = safeSubscriptionLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const subscriptionSubtotal = safeSubscriptionLines.reduce(
      (total, item) => total + priceAmount(item.plan.price) * item.quantity,
      0,
    )
    const shipping =
      subscriptionSubtotal > 0 && subscriptionSubtotal < 150 ? 12 : 0
    const subscriptionTotal = subscriptionSubtotal + shipping

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '12K+', label: 'Active subscribers' },
          { value: '89', label: 'Coffees shipped' },
          { value: '4.9', label: 'Average rating' },
          { value: '98%', label: 'Retention rate' },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? 'Testimonials'
    const testimonialsHeading =
      props.testimonials?.heading ?? 'Loved by coffee enthusiasts'
    const testimonialsDesc =
      props.testimonials?.description ??
      "Here's what our subscribers say about their BrewBox experience."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've tried Blue Bottle, Intelligentsia's own subscription, and others. BrewBox consistently sends coffees I can't find elsewhere. The January Ethiopian was one of the best cups I've ever had.",
            name: 'David Chen',
            role: 'Software Engineer, Portland',
            avatarAlt:
              'professional headshot of a middle aged man with glasses and short gray hair',
          },
          {
            quote:
              "As a former barista, I'm picky about coffee. BrewBox sends varieties I'd never find in my local shops. The brewing guides are incredibly detailed—my V60 technique improved dramatically.",
            name: 'Maya Thompson',
            role: 'Product Designer, Austin',
            avatarAlt:
              'professional headshot of a young woman with dark curly hair and warm smile',
          },
          {
            quote:
              'We switched our office coffee to BrewBox Connoisseur. Productivity meetings are now something people actually look forward to. The Gesha last month stopped three conversations mid-sentence.',
            name: 'James Rodriguez',
            role: 'CEO, TechStart, SF',
            avatarAlt:
              'professional headshot of a man with short dark hair and friendly expression',
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? 'FAQ'
    const faqHeading = props.faq?.heading ?? 'Questions & Answers'
    const faqDesc =
      props.faq?.description ?? 'Everything you need to know about BrewBox.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: 'When will my first box ship?',
            a: "Orders placed by Sunday 11:59pm ET ship the following Thursday. Most subscribers receive their first box within 5-7 business days. You'll receive tracking information via email and SMS once your order is on its way.",
          },
          {
            q: 'Can I choose which coffees I receive?',
            a: 'You select your roast preference (light, medium, dark, or variety), and we curate based on that profile. Enthusiast and Connoisseur members can rate each coffee, and our algorithm learns your taste to improve future selections. Connoisseur members occasionally receive exclusive pre-selection emails for limited micro-lots.',
          },
          {
            q: 'Do you offer ground coffee or just whole bean?',
            a: 'Both! You can choose whole bean, or select your grind size: coarse (French press/cold brew), medium (drip/pour-over), fine (espresso), or extra-fine (Turkish). We recommend whole bean for maximum freshness—coffee begins to stale 15 minutes after grinding.',
          },
          {
            q: "What if I don't like a coffee in my box?",
            a: "We stand behind every coffee with our satisfaction promise. Rate any coffee 2 stars or below, and we'll credit your account for that bag or send a replacement in your next box—your choice. Your ratings also help us refine your future selections.",
          },
          {
            q: 'How do I change or cancel my subscription?',
            a: 'You have full control via your account dashboard. Pause for up to 3 months, skip a shipment, change your plan, or cancel anytime before your next billing date (which is 3 days before roasting). No contracts, no fees, no hassle.',
          },
          {
            q: 'Do you ship internationally?',
            a: 'Yes! We ship to Canada ($8/box, 5-10 days), UK ($12/box, 7-14 days), and Australia ($15/box, 10-18 days). Due to customs regulations, some destinations may have delays. All international orders are shipped via DHL Express with full tracking.',
          },
        ]

    const ctaHeading = props.cta?.heading ?? 'Ready to upgrade your mornings?'
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ coffee lovers who've discovered their new favorite roasts. Your first box ships within 48 hours of roasting."
    const ctaPrimary = props.cta?.primaryCta ?? 'Start Your Subscription'
    const ctaSecondary = props.cta?.secondaryCta ?? 'Learn More'
    const ctaNote =
      props.cta?.note ?? 'Cancel anytime. No long-term commitment required.'
    const ctaImageAlt =
      props.cta?.imageAlt ??
      'coffee beans roasting with warm amber light and smoke'

    const footerDesc =
      props.footer?.description ??
      'Discover exceptional single-origin coffees from world-class roasters. Delivered fresh to your door, perfectly timed for your morning ritual.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog'],
          },
          {
            heading: 'Support',
            links: ['Help Center', 'Contact Us', 'Shipping Info', 'Returns'],
          },
          {
            heading: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Accessibility',
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Coffee Co. All rights reserved.`
    const footerMadeWith =
      props.footer?.madeWith ?? 'Made with care in San Francisco, CA'

    // Brand mark — coffee cup glyph (decorative brand asset).
    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn('text-primary', className)}
        aria-hidden="true"
      >
        <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3zM16 8.5c0 .83-.67 1.5-1.5 1.5h-1v1c0 2.48-2.02 4.5-4.5 4.5s-4.5-2.02-4.5-4.5V5h11v3.5zM18.5 7h-.5V5h.5c.83 0 1.5.67 1.5 1.5S19.33 7 18.5 7z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
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
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

    const ArrowRight = ({ className }: { className?: string } = {}) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

    const benefitIcons: ReactNode[] = [
      // box / curated
      <svg
        key="box"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      // clock / freshness
      <svg
        key="clock"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // doc / brewing guide
      <svg
        key="doc"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      // refresh / flexible delivery
      <svg
        key="refresh"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
      // beaker / grind
      <svg
        key="beaker"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>,
      // smile / satisfaction
      <svg
        key="smile"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const socialIcons: { label: string; path: string }[] = [
      {
        label: 'Instagram',
        path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
      },
      {
        label: 'Twitter',
        path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      },
      {
        label: 'YouTube',
        path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
      },
    ]

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-20">
            {/* Logo */}
            <button
              type="button"
              onClick={() => go(brand)}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <BrandMark className="size-8" />
              <span>{brand}</span>
            </button>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 lg:flex">
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

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
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
                        <ArrowRight className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Subscriptions')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Subscriptions
                        <ArrowRight className="size-4" />
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
              <Sheet open={subscriptionOpen} onOpenChange={setSubscriptionOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Subscriptions"
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
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {subscriptionCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {subscriptionCount}
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
                      Your subscriptions
                    </SheetTitle>
                    <SheetDescription>
                      {subscriptionCount > 0
                        ? `${subscriptionCount} subscription${subscriptionCount === 1 ? '' : 's'} in your plan.`
                        : 'No subscriptions yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeSubscriptionLines.length ? (
                      <div className="space-y-5">
                        {safeSubscriptionLines.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={item.plan.name}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.plan.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {item.plan.tagline}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {formatCurrency(
                                    priceAmount(item.plan.price) *
                                      item.quantity,
                                  )}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateSubscriptionQuantity(
                                        item.planName,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Decrease ${item.plan.name} quantity`}
                                  >
                                    -
                                  </button>
                                  <span className="min-w-8 text-center text-sm font-semibold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateSubscriptionQuantity(
                                        item.planName,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Increase ${item.plan.name} quantity`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeFromSubscriptions(item.planName)
                                  }
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No subscriptions yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Choose a plan to start your subscription journey.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subscriptionSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span>
                          {shipping ? formatCurrency(shipping) : 'Free'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                        <span>Total</span>
                        <span>{formatCurrency(subscriptionTotal)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={!safeSubscriptionLines.length}
                      className="w-full rounded-full"
                      onClick={() => go('Checkout')}
                    >
                      Checkout
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearSubscriptions()}
                        disabled={!safeSubscriptionLines.length}
                      >
                        Clear
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
                        >
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
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

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search plans"
          description="Search the subscription plans available for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} plans...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No plans found.</CommandEmpty>
            <CommandGroup heading="Plans">
              {displayPlans.map((plan) => (
                <CommandItem
                  key={plan.name}
                  value={`${plan.name} ${plan.tagline} ${plan.price}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(plan.name)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {plan.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {plan.tagline}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {plan.price}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                    {heroHeadingTop}
                    <br />
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-base font-medium text-foreground transition-all hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-2">
                      {[
                        'professional headshot of a smiling woman with brown hair',
                        'professional headshot of a man with short dark hair and warm smile',
                        'professional headshot of a blonde woman smiling confidently',
                      ].map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {heroSocialProof}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={900}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Check className="size-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {heroBadgeTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {heroBadgeSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-5">
                {logosItems.map((logo) => (
                  <div key={logo} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => go(logo)}
                      className="text-lg font-bold text-foreground transition-colors hover:text-primary"
                    >
                      {logo}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section id="features" className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {benefitsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{benefitsDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {benefitItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/40"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
                      {benefitIcons[i % benefitIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
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
          <section id="how-it-works" className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="rounded-xl bg-card p-8 shadow-sm">
                      <div className="mb-6 grid size-12 place-items-center rounded-full bg-foreground text-xl font-semibold text-background">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                        {step.title}
                      </h3>
                      <p className="mb-6 leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <Image
                          alt={step.imageAlt}
                          w={600}
                          h={340}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div className="absolute -right-6 top-1/2 hidden -translate-y-1/2 md:block">
                        <ArrowRight className="size-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Story */}
          <section id="story" className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-[3/4] overflow-hidden rounded-xl">
                      <Image
                        alt={storyImageAlts[0] ?? 'coffee farm'}
                        w={600}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <Image
                        alt={storyImageAlts[1] ?? 'coffee cupping'}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <Image
                        alt={storyImageAlts[2] ?? 'barista latte art'}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="aspect-[3/4] overflow-hidden rounded-xl">
                      <Image
                        alt={storyImageAlts[3] ?? 'coffee plantation'}
                        w={600}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
                <div className="lg:pl-8">
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {storyEyebrow}
                  </span>
                  <h2 className="mb-6 mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {storyHeading}
                  </h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {storyParagraphs.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
                    {storyStats.map((s) => (
                      <div key={s.label}>
                        <div className="text-3xl font-bold text-foreground">
                          {s.value}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Plans / Pricing */}
          <section id="plans" className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {plansEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {plansHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{plansDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {displayPlans.map((plan) => {
                  const isFavorite = favoritePlanNames?.has(plan.name) ?? false
                  const isFeatured = plan.featured === 'true'
                  const features = plan.features.split(', ')

                  return (
                    <div
                      key={plan.name}
                      className={cn(
                        'relative rounded-xl p-8',
                        isFeatured
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-card text-card-foreground',
                      )}
                    >
                      {plan.badge && (
                        <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-xl bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                          {plan.badge}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => void toggleFavorite(plan.name)}
                        aria-pressed={isFavorite}
                        aria-label={
                          isFavorite
                            ? `Remove ${plan.name} from favorites`
                            : `Add ${plan.name} to favorites`
                        }
                        className={cn(
                          'absolute -top-2 -right-2 grid size-8 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          isFavorite
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-foreground hover:bg-background',
                        )}
                      >
                        <HeartIcon active={isFavorite} />
                      </button>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p
                        className={cn(
                          'mt-2',
                          isFeatured
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground',
                        )}
                      >
                        {plan.tagline}
                      </p>
                      <div className="mb-8 mt-6">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span
                          className={cn(
                            isFeatured
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground',
                          )}
                        >
                          {plan.period}
                        </span>
                      </div>
                      <ul className="mb-8 space-y-4">
                        {features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check
                              className={cn(
                                'mt-0.5 size-5 shrink-0',
                                isFeatured
                                  ? 'text-primary-foreground'
                                  : 'text-primary',
                              )}
                            />
                            <span
                              className={cn(
                                isFeatured
                                  ? 'text-primary-foreground/90'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => {
                          void subscribeToPlan(plan.name)
                          setSubscriptionOpen(true)
                        }}
                        className={cn(
                          'w-full rounded-full px-6 py-3 font-medium transition-colors',
                          isFeatured
                            ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                            : 'border border-border text-foreground hover:bg-accent',
                        )}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="mt-12 text-center">
                <p className="text-muted-foreground">
                  {plansFootnote}
                  <button
                    type="button"
                    onClick={() => go(plansFootnoteLink)}
                    className="ml-1 text-primary underline transition-colors hover:text-primary/80"
                  >
                    {plansFootnoteLink}
                  </button>
                </p>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="text-4xl font-bold text-background sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="mt-2 text-background/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
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
                        <div className="font-semibold text-card-foreground">
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
          <section id="faq" className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-4 mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
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
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
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
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-xl bg-foreground p-12 text-center lg:p-16">
                <div className="absolute inset-0 opacity-20">
                  <Image
                    alt={ctaImageAlt}
                    w={1600}
                    h={900}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="relative z-10">
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl">
                    {ctaHeading}
                  </h2>
                  <p className="mx-auto mb-10 max-w-2xl text-lg text-background/80">
                    {ctaDesc}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90"
                    >
                      {ctaPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-background/30 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10"
                    >
                      {ctaSecondary}
                    </button>
                  </div>
                  <p className="mt-8 text-sm text-background/60">{ctaNote}</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card pb-8 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <BrandMark className="size-8" />
                  <span className="text-xl font-semibold tracking-tight text-card-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {socialIcons.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
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
                  <h4 className="mb-4 font-semibold text-card-foreground">
                    {col.heading}
                  </h4>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <p className="text-sm text-muted-foreground">{footerMadeWith}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
