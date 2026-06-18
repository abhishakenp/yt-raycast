import { useState, type ReactNode } from "react"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#/components/ui/avatar.tsx"

/**
 * NutritionKimiPage2 — a complete, self-contained nutrition-coaching LANDING page.
 *
 * VARIANT 2 / second style sibling to NutritionKimiPage: where that one is a
 * calm, organic, sage-green wellness page, this is a bold, high-energy,
 * results-driven fitness-nutrition design ("NutriFuel"). A bright lime brand
 * accent rides over a clean white canvas, punched up with heavy black type and
 * two inverted dark sections. It pairs a skewed split hero (live badge + huge
 * headline + dual CTAs + trust avatars + floating macro/calorie stat cards over
 * a meal-prep photo) with a press-logo strip, a lime stats band, a 6-up programs
 * grid with icon tiles, a DARK 4-step numbered "how it works" rail, a 6-card
 * before/after transformation gallery (photo + weight-change badge + client
 * mini-profile), a 3-tier pricing table with a dark highlighted "Most Popular"
 * plan, a coaches grid plus a featured pull-quote testimonial, a 6-item FAQ
 * accordion, a lime final-CTA band, and a dark multi-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. The white surface
 * maps to `background`/`foreground`, the lime brand hue to `primary`, dark
 * inverted bands to `foreground`/`card`, and section bands to `muted`/`card`.
 * Every nav item / CTA / link / form-submit routes through `useNavigate` (never a
 * dead "#"), and navbar labels match the `nav` array so PageSwitch can swap pages.
 * All content imagery (meal prep, transformation photos, client/coach headshots)
 * uses the alt-driven <Image> component (never a raw src). Callers supply ONLY
 * content data; rich defaults make it render great with no props at all.
 */
export const NutritionKimiPage2 = defineCapsule({
  name: "NutritionKimiPage2",
  description:
    "Complete high-energy fitness-nutrition coaching LANDING page (variant 2 / second style sibling to NutritionKimiPage) with a bold, results-driven aesthetic: bright lime brand accent on a clean white canvas, heavy black headlines, and two inverted dark sections. Includes a skewed split hero (live 'transformations completed' badge, huge headline, dual CTAs, stacked trust avatars, floating daily-macro-tracking and calories-burned stat cards over a meal-prep photo), a press/featured-in logo strip, a lime stats band (transformations, success rate, pounds lost, app rating), a 6-up programs grid (custom meal plans, 1-on-1 coaching, smart tracking, flexible fasting, mindful eating, global recipes) with icon tiles, a DARK numbered 4-step 'how it works' rail (assessment, match with coach, get your plan, track & transform), a 6-card before/after transformation gallery with weight-change badges and client mini-profiles, a 3-tier pricing table (Starter / Premium most-popular dark card / Elite) with checklists, a coaches grid with a featured pull-quote testimonial and supporting photo, a 6-item FAQ accordion, a lime final sign-up CTA band, and a dark multi-column footer with social links. Use as the ROOT/home page for nutrition coaches, dietitians, weight-loss or muscle-gain programs, macro/meal-plan subscriptions, fitness-nutrition apps, or transformation challenges when a punchy, conversion-focused page with strong social proof, before/after proof, and pricing is wanted — pick this over NutritionKimiPage when the brand is energetic/athletic rather than calm/organic. Supply content only — brand, nav, hero, logos, stats, programs, steps, transformations, pricing, coaches, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Skewed split hero content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trustNote: z.string().optional(),
        imageAlt: z.string().optional(),
        statTitle: z.string().optional(),
        statSubtitle: z.string().optional(),
        floatValue: z.string().optional(),
        floatLabel: z.string().optional(),
      })
      .optional(),
    /** Press / featured-in logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Lime stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Programs / features grid. */
    programs: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark "how it works" numbered steps. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Before/after transformation cards. */
    transformations: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              imageAlt: z.string(),
              badge: z.string(),
              avatarAlt: z.string(),
              name: z.string(),
              role: z.string(),
              quote: z.string(),
              duration: z.string(),
              plan: z.string(),
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
        popularLabel: z.string().optional(),
        priceSuffix: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              cta: z.string(),
              featured: z.boolean().optional(),
              features: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Coaches grid + featured pull-quote. */
    coaches: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              credential: z.string(),
              bio: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
        quote: z.string().optional(),
        quoteName: z.string().optional(),
        quoteResult: z.string().optional(),
        quoteAvatarAlt: z.string().optional(),
        quoteImageAlt: z.string().optional(),
      })
      .optional(),
    /** FAQ accordion. */
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
    /** Final CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
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
        copyright: z.string().optional(),
        madeIn: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedPrograms: table({
        programTitle: string(),
        programDescription: string(),
      }),
      newsletterSubscribers: table({
        email: string(),
      }),
    },
    queries: {
      savedPrograms: ({ db }) => db.savedPrograms.orderBy('createdAt').all(),
      isSubscribed: ({ db }, email: string) =>
        db.newsletterSubscribers.where('email', email).all().length > 0,
    },
    mutations: {
      saveProgram: ({ db }, programTitle: string, programDescription: string) => {
        const existing = db.savedPrograms
          .where('programTitle', programTitle)
          .all()[0]
        if (existing) {
          db.savedPrograms.delete(existing.id)
          return false
        }
        db.savedPrograms.insert({ programTitle, programDescription })
        return true
      },
      removeSavedProgram: ({ db }, programTitle: string) => {
        for (const item of db.savedPrograms.where('programTitle', programTitle).all()) {
          db.savedPrograms.delete(item.id)
        }
        return db.savedPrograms.all()
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
    const [savedProgramsOpen, setSavedProgramsOpen] = useState(false)
    const brand = props.brand ?? "NutriFuel"
    const nav = props.nav?.length
      ? props.nav
      : ["Programs", "Transformations", "Pricing", "Coaches", "FAQ"]

    const savedPrograms = lakebed.useQuery('savedPrograms')
    const saveProgram = lakebed.useMutation('saveProgram')
    const removeSavedProgram = lakebed.useMutation('removeSavedProgram')
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

    const heroBadge =
      props.hero?.badge ?? "Over 15,000 Transformations Completed"
    const heroHeading = props.hero?.heading ?? "Fuel Your"
    const heroAccent = props.hero?.headingAccent ?? "Transformation"
    const heroSub =
      props.hero?.subheading ??
      "Personalized nutrition coaching from certified dietitians. Custom meal plans, macro tracking, and 1-on-1 support to help you lose weight, build muscle, and feel your best."
    const heroPrimary = props.hero?.primaryCta ?? "Get Your Custom Plan"
    const heroSecondary = props.hero?.secondaryCta ?? "See Success Stories"
    const heroTrust =
      props.hero?.trustNote ?? "Joined this week by 423 new members"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "colorful healthy meal prep bowls with fresh vegetables grilled chicken quinoa and avocado"
    const heroStatTitle = props.hero?.statTitle ?? "Daily Macro Tracking"
    const heroStatSub =
      props.hero?.statSubtitle ?? "Automatically calculated for your goals"
    const heroFloatValue = props.hero?.floatValue ?? "847"
    const heroFloatLabel = props.hero?.floatLabel ?? "Cal burned today"

    const logosHeading = props.logos?.heading ?? "Featured In & Trusted By"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : [
          "Healthline",
          "Men's Health",
          "Women's Fitness",
          "Shape Magazine",
          "Prevention",
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "15,000+", label: "Transformations" },
          { value: "98%", label: "Success Rate" },
          { value: "127K", label: "Pounds Lost" },
          { value: "4.9/5", label: "App Rating" },
        ]

    const programsEyebrow = props.programs?.eyebrow ?? "Our Programs"
    const programsHeading =
      props.programs?.heading ?? "Everything You Need to Succeed"
    const programsDesc =
      props.programs?.description ??
      "From personalized meal plans to expert coaching, we provide all the tools for your transformation journey."
    const programItems = props.programs?.items?.length
      ? props.programs.items
      : [
          {
            title: "Custom Meal Plans",
            description:
              "Weekly meal plans tailored to your macros, dietary restrictions, and taste preferences. Includes shopping lists and prep guides.",
          },
          {
            title: "1-on-1 Coaching",
            description:
              "Weekly video check-ins with certified nutritionists. Get personalized guidance, motivation, and accountability throughout your journey.",
          },
          {
            title: "Smart Tracking",
            description:
              "AI-powered food logging with photo recognition. Track calories, macros, and micronutrients effortlessly. Syncs with Apple Health & Google Fit.",
          },
          {
            title: "Flexible Fasting",
            description:
              "Intermittent fasting protocols designed by experts. From 16:8 to 5:2, find the schedule that fits your lifestyle and goals.",
          },
          {
            title: "Mindful Eating",
            description:
              "Develop a healthy relationship with food through guided meditation, stress management techniques, and behavioral psychology tools.",
          },
          {
            title: "Global Recipes",
            description:
              "Access 2,500+ healthy recipes from cuisines worldwide. Filter by calories, macros, prep time, and dietary preferences.",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Your Journey in 4 Simple Steps"
    const stepsDesc =
      props.steps?.description ??
      "We've streamlined the process to get you results faster than ever."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Assessment",
            description:
              "Complete our comprehensive 5-minute quiz about your goals, lifestyle, food preferences, and medical history.",
          },
          {
            title: "Match With Coach",
            description:
              "Get paired with a certified nutritionist specializing in your specific goals—weight loss, muscle gain, or sports performance.",
          },
          {
            title: "Get Your Plan",
            description:
              "Receive your personalized meal plan, macro targets, and grocery list within 24 hours of your onboarding call.",
          },
          {
            title: "Track & Transform",
            description:
              "Log meals, check in weekly with your coach, adjust as needed, and watch your body transform week by week.",
          },
        ]

    const transEyebrow = props.transformations?.eyebrow ?? "Success Stories"
    const transHeading =
      props.transformations?.heading ?? "Real Transformations"
    const transDesc =
      props.transformations?.description ??
      "Meet members who completely changed their lives with NutriFuel coaching."
    const transCta =
      props.transformations?.cta ?? "View All 15,000+ Stories"
    const transItems = props.transformations?.items?.length
      ? props.transformations.items
      : [
          {
            imageAlt:
              "before and after fitness transformation showing weight loss results in gym setting",
            badge: "-47 lbs",
            avatarAlt:
              "professional headshot of Marcus Chen a smiling man in his thirties with short black hair",
            name: "Marcus Chen",
            role: "Software Engineer, 34",
            quote:
              "After years of failed diets, NutriFuel helped me lose 47 pounds in 6 months. The personalized approach and accountability changed everything.",
            duration: "6 months",
            plan: "Elite Plan",
          },
          {
            imageAlt:
              "woman doing yoga pose in bright studio showing flexibility and strength transformation",
            badge: "-32 lbs",
            avatarAlt:
              "professional headshot of Sarah Mitchell a smiling woman with red curly hair",
            name: "Sarah Mitchell",
            role: "Marketing Director, 29",
            quote:
              "I went from pre-diabetic to healthiest I've ever been. My coach Sarah was there every step of the way. Down 32 lbs and kept it off for a year!",
            duration: "8 months",
            plan: "Premium Plan",
          },
          {
            imageAlt:
              "man lifting weights in modern gym showing muscle gain transformation",
            badge: "+18 lbs",
            avatarAlt:
              "professional headshot of David Okonkwo a muscular man with short dark hair and beard",
            name: "David Okonkwo",
            role: "Teacher, 41",
            quote:
              "Finally broke through my plateau and gained 18 lbs of lean muscle. The macro tracking and meal timing strategies were game-changers for me.",
            duration: "4 months",
            plan: "Elite Plan",
          },
          {
            imageAlt:
              "woman running outdoors on trail showing cardio fitness improvement",
            badge: "-54 lbs",
            avatarAlt:
              "professional headshot of Jennifer Walsh a smiling woman with blonde hair and glasses",
            name: "Jennifer Walsh",
            role: "Nurse, 38",
            quote:
              "As a nurse working night shifts, I thought healthy eating was impossible. NutriFuel created a plan that fit my crazy schedule. Lost 54 lbs!",
            duration: "10 months",
            plan: "Premium Plan",
          },
          {
            imageAlt:
              "healthy meal prep containers showing portion control and nutrition focus",
            badge: "-28 lbs",
            avatarAlt:
              "professional headshot of Robert Kim an Asian man in his forties with a friendly smile",
            name: "Robert Kim",
            role: "Business Owner, 45",
            quote:
              "At 45, I thought my metabolism was done. Wrong! Lost 28 lbs and feel better than I did in my 20s. The intermittent fasting protocol was perfect for me.",
            duration: "5 months",
            plan: "Elite Plan",
          },
          {
            imageAlt:
              "woman in athletic wear doing stretching exercise showing flexibility progress",
            badge: "-41 lbs",
            avatarAlt:
              "professional headshot of Aisha Patel a South Asian woman with long dark hair",
            name: "Aisha Patel",
            role: "Lawyer, 31",
            quote:
              "NutriFuel understood my vegetarian needs and created amazing protein-rich meal plans. Down 41 lbs and finally comfortable in my own skin.",
            duration: "7 months",
            plan: "Premium Plan",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading = props.pricing?.heading ?? "Choose Your Plan"
    const pricingDesc =
      props.pricing?.description ??
      "All plans include a 14-day money-back guarantee. Cancel anytime."
    const pricingNote =
      props.pricing?.note ?? "Save 20% with annual billing. All prices in USD."
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const priceSuffix = props.pricing?.priceSuffix ?? "/month"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for self-starters",
            price: "$49",
            cta: "Get Started",
            featured: false,
            features: [
              "AI-generated meal plans",
              "Macro & calorie tracking",
              "2,500+ recipes access",
              "Community support group",
              "Progress tracking dashboard",
            ],
          },
          {
            name: "Premium",
            tagline: "Best for lasting results",
            price: "$99",
            cta: "Start 14-Day Free Trial",
            featured: true,
            features: [
              "Everything in Starter, plus:",
              "Bi-weekly 1-on-1 coaching",
              "Personalized meal adjustments",
              "Grocery delivery integration",
              "Priority email support",
              "Body composition analysis",
            ],
          },
          {
            name: "Elite",
            tagline: "Maximum accountability",
            price: "$199",
            cta: "Get Started",
            featured: false,
            features: [
              "Everything in Premium, plus:",
              "Weekly 1-on-1 coaching calls",
              "24/7 text access to coach",
              "Custom workout guidance",
              "Quarterly blood work review",
              "Private client events access",
            ],
          },
        ]

    const coachesEyebrow = props.coaches?.eyebrow ?? "Meet Your Coaches"
    const coachesHeading =
      props.coaches?.heading ?? "Expert Guidance Every Step"
    const coachesDesc =
      props.coaches?.description ??
      "Our certified nutritionists average 8+ years of experience and have helped thousands achieve their goals."
    const coachItems = props.coaches?.items?.length
      ? props.coaches.items
      : [
          {
            name: "Dr. Emily Rodriguez",
            credential: "PhD Nutrition Science",
            bio: "Specializes in metabolic health and sustainable weight management. 12 years experience.",
            avatarAlt:
              "professional headshot of Dr. Emily Rodriguez a nutritionist with dark hair in a white coat",
          },
          {
            name: "Marcus Thompson",
            credential: "RD, CSSD",
            bio: "Sports nutrition specialist. Former Olympic team dietitian. Expert in performance fueling.",
            avatarAlt:
              "professional headshot of Marcus Thompson a Black male nutritionist in scrubs",
          },
          {
            name: "Dr. Sarah Chen",
            credential: "MD, Board Certified",
            bio: "Integrative medicine approach. Focus on gut health, autoimmune, and hormonal balance.",
            avatarAlt:
              "professional headshot of Dr. Sarah Chen an Asian female nutritionist with warm smile",
          },
          {
            name: "Dr. James Wilson",
            credential: "PhD Behavioral Nutrition",
            bio: "Psychologist specializing in emotional eating, habit formation, and mindset transformation.",
            avatarAlt:
              "professional headshot of Dr. James Wilson a male nutritionist with beard and glasses",
          },
        ]
    const coachesQuote =
      props.coaches?.quote ??
      "Working with Dr. Rodriguez completely changed my relationship with food. She didn't just give me a meal plan—she taught me how to listen to my body. Down 63 lbs and I've never felt more confident."
    const coachesQuoteName = props.coaches?.quoteName ?? "Amanda Foster"
    const coachesQuoteResult =
      props.coaches?.quoteResult ?? "Lost 63 lbs in 9 months with Premium Plan"
    const coachesQuoteAvatarAlt =
      props.coaches?.quoteAvatarAlt ??
      "professional headshot of Amanda Foster a smiling woman with dark hair and green eyes"
    const coachesQuoteImageAlt =
      props.coaches?.quoteImageAlt ??
      "happy woman holding a bowl of fresh healthy salad with colorful vegetables"

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about getting started."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How soon will I see results?",
            a: "Most members notice increased energy and reduced bloating within the first week. Visible weight loss typically begins in weeks 2-3, with an average of 2-3 lbs per week for the first month. Everyone's journey is different, but our data shows 94% of Premium members achieve their goal weight within their planned timeframe.",
          },
          {
            q: "Can I follow the plan with dietary restrictions?",
            a: "Absolutely! Our nutritionists are experienced with vegetarian, vegan, keto, paleo, gluten-free, dairy-free, halal, kosher, and allergen-specific diets. During your onboarding, you'll detail all restrictions and preferences, and every meal plan is tailored specifically to you. We have over 2,500 recipes that cover virtually every dietary need.",
          },
          {
            q: "What if I don't like the meal suggestions?",
            a: "No problem! You can swap any meal with alternatives that match your macros. Premium and Elite members work directly with their coach to adjust the plan based on taste preferences. Our AI learns what you like and gets smarter with every feedback. Plus, you can favorite recipes and exclude ingredients you dislike permanently.",
          },
          {
            q: "How does the 14-day money-back guarantee work?",
            a: "If you're not completely satisfied within your first 14 days, email our support team for a full refund—no questions asked, no hoops to jump through. We're confident you'll love the program, but we never want anyone to feel stuck. Refunds are processed within 3-5 business days.",
          },
          {
            q: "Do I need to exercise to see results?",
            a: "Exercise accelerates results but isn't required. Our meal plans create a caloric deficit (or surplus for muscle gain) through nutrition alone. That said, we encourage light activity like walking—Elite members receive custom workout guidance. Many members start with just nutrition, then add exercise once they feel the energy boost from better eating.",
          },
          {
            q: "Can I pause or cancel my subscription?",
            a: "Yes! You can cancel anytime from your account dashboard—no phone calls required. If you're going on vacation or need a break, you can pause your subscription for up to 3 months and resume right where you left off. Your progress, favorite recipes, and coach relationship will all be waiting for you.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Start Your Transformation Today"
    const ctaDesc =
      props.cta?.description ??
      "Join 15,000+ members who have already changed their lives. Your first 14 days are completely risk-free."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Your Custom Plan"
    const ctaSecondary = props.cta?.secondaryCta ?? "See More Results"
    const ctaNote =
      props.cta?.note ?? "No credit card required for free assessment"

    const footerTagline =
      props.footer?.tagline ??
      "Personalized nutrition coaching that actually works. Join thousands transforming their lives through science-backed meal plans and expert guidance."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Programs",
            links: [
              "Weight Loss",
              "Muscle Building",
              "Keto Diet",
              "Intermittent Fasting",
              "Vegetarian Plans",
              "Sports Nutrition",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Our Coaches",
              "Success Stories",
              "Careers",
              "Press",
              "Contact",
            ],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "App Download",
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Contact Support",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "NutriFuel Health Inc. All rights reserved."
    const footerMadeIn =
      props.footer?.madeIn ?? "Made with care in San Francisco, CA"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Instagram", "YouTube"]

    // Brand plus-mark (decorative inline svg).
    const PlusMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    )

    const Arrow = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
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

    const programIcons: ReactNode[] = [
      // clipboard / meal plan
      <svg key="p0" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>,
      // people / coaching
      <svg key="p1" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // chart / tracking
      <svg key="p2" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // clock / fasting
      <svg key="p3" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // heart / mindful
      <svg key="p4" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      // globe / recipes
      <svg key="p5" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Twitter: (
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
        </svg>
      ),
      Instagram: (
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      YouTube: (
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      ),
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-muted font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <PlusMark className="size-6" />
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground">
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
                          onClick={() => go('Dashboard')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Dashboard
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
                <Sheet open={savedProgramsOpen} onOpenChange={setSavedProgramsOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Saved Programs"
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
                      {savedPrograms && savedPrograms.length > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {savedPrograms.length}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Saved Programs</SheetTitle>
                      <SheetDescription>
                        {savedPrograms && savedPrograms.length > 0
                          ? `${savedPrograms.length} program${savedPrograms.length === 1 ? '' : 's'} saved.`
                          : 'No programs saved yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {savedPrograms && savedPrograms.length ? (
                        <div className="space-y-4">
                          {savedPrograms.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[1fr_auto] gap-4 border-b border-border pb-4 last:border-0"
                            >
                              <div>
                                <h3 className="font-semibold text-card-foreground">
                                  {item.programTitle}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {item.programDescription}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  void removeSavedProgram(item.programTitle)
                                }
                                className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No saved programs
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Save programs from the grid to view them here.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        className="w-full rounded-full"
                        onClick={() => go('Programs')}
                      >
                        Browse All Programs
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
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start Free Trial
                </button>
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
          <section className="relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
            <div className="absolute right-0 top-0 hidden h-full w-1/2 -skew-x-12 bg-primary/10 lg:block" />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroHeading}
                    <span className="block text-primary">{heroAccent}</span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <Arrow className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border-2 border-border bg-background px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground lg:justify-start">
                    <div className="flex -space-x-2">
                      {[
                        "professional headshot of a smiling woman with brown hair",
                        "professional headshot of a smiling man in his thirties",
                        "professional headshot of a woman with blonde hair",
                        "professional headshot of a middle-aged man with glasses",
                      ].map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-8 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <span>{heroTrust}</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-card/95 p-4 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-6" />
                        </span>
                        <div>
                          <p className="font-bold text-card-foreground">
                            {heroStatTitle}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {heroStatSub}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 hidden rounded-2xl bg-card p-4 shadow-xl sm:block">
                    <div className="flex items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-2xl font-bold text-card-foreground">
                          {heroFloatValue}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {heroFloatLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press logos */}
          <section className="border-y border-border bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {logoNames.map((name) => (
                  <span
                    key={name}
                    className="text-lg font-bold text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-black text-primary-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="font-medium text-primary-foreground/80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Programs */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {programsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {programsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{programsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {programItems.map((item, i) => {
                  const isSaved = savedPrograms?.some(
                    (p) => p.programTitle === item.title,
                  )
                  return (
                    <div
                      key={item.title}
                      className="group rounded-3xl border border-border bg-muted p-8 transition-all hover:bg-card hover:shadow-xl"
                    >
                      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        {programIcons[i % programIcons.length]}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-4 leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          void saveProgram(item.title, item.description)
                        }
                        aria-pressed={isSaved}
                        aria-label={
                          isSaved
                            ? `Remove ${item.title} from saved programs`
                            : `Save ${item.title} to programs`
                        }
                        className={cn(
                          'inline-flex items-center gap-2 text-sm font-semibold transition-colors',
                          isSaved
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <HeartIcon active={isSaved} />
                        {isSaved ? 'Saved' : 'Save Program'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* How it works (dark) */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-background/60">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                    <p className="leading-relaxed text-background/60">
                      {step.description}
                    </p>
                    {i < stepItems.length - 1 && (
                      <div className="absolute left-full top-8 hidden h-0.5 w-full -translate-x-8 bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Transformations */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {transEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {transHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{transDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {transItems.map((t) => (
                  <div
                    key={t.name}
                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg"
                  >
                    <div className="relative">
                      <Image
                        alt={t.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="h-64 w-full object-cover"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                        {t.badge}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="mb-4 flex items-center gap-4">
                        <Image
                          alt={t.avatarAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="size-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-card-foreground">
                            {t.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t.role}
                          </p>
                        </div>
                      </div>
                      <p className="mb-4 text-muted-foreground">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-primary">
                          {t.duration}
                        </span>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="text-muted-foreground">{t.plan}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(transCta)}
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  {transCta}
                  <Arrow className="ml-2 size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-3xl p-8",
                      tier.featured
                        ? "bg-foreground text-background shadow-2xl lg:-translate-y-4"
                        : "border border-border bg-card shadow-lg",
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
                          {popularLabel}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 text-xl font-bold",
                          tier.featured ? "text-background" : "text-card-foreground",
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          tier.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-black",
                          tier.featured ? "text-background" : "text-card-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      <span
                        className={cn(
                          tier.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {priceSuffix}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              "text-primary",
                            )}
                          />
                          <span
                            className={cn(
                              tier.featured
                                ? "text-background/80"
                                : "text-muted-foreground",
                            )}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${tier.cta} — ${tier.name}`)}
                      className={cn(
                        "block w-full rounded-full px-6 py-3.5 text-center font-semibold transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-foreground hover:bg-accent",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-12 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* Coaches */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {coachesEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {coachesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{coachesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {coachItems.map((c) => (
                  <div key={c.name} className="text-center">
                    <Image
                      alt={c.avatarAlt}
                      w={300}
                      h={300}
                      loading="lazy"
                      className="mx-auto mb-4 size-32 rounded-full object-cover shadow-lg"
                    />
                    <h4 className="mb-1 text-lg font-bold text-foreground">
                      {c.name}
                    </h4>
                    <p className="mb-2 text-sm font-medium text-primary">
                      {c.credential}
                    </p>
                    <p className="text-sm text-muted-foreground">{c.bio}</p>
                  </div>
                ))}
              </div>

              <div className="mt-16 rounded-3xl bg-muted p-8 lg:p-12">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                  <div>
                    <svg className="mb-4 size-10 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <blockquote className="mb-6 text-xl font-medium leading-relaxed text-foreground lg:text-2xl">
                      &ldquo;{coachesQuote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={coachesQuoteAvatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground">
                          {coachesQuoteName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {coachesQuoteResult}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Image
                      alt={coachesQuoteImageAlt}
                      w={600}
                      h={500}
                      loading="lazy"
                      className="aspect-[6/5] w-full rounded-2xl object-cover shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="pr-8 text-lg font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <span className="transition-transform group-open:rotate-180">
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

          {/* Final CTA */}
          <section className="bg-primary py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-black text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-lg font-bold text-primary shadow-lg transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-primary-foreground/40 px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:border-primary-foreground/70"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="mx-auto mt-8 max-w-md">
                <form
                  className="flex flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const emailInput = form.querySelector(
                      'input[type="email"]',
                    ) as HTMLInputElement
                    if (emailInput?.value) {
                      void subscribeNewsletter(emailInput.value)
                      emailInput.value = ''
                    }
                  }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    aria-label="Email address for newsletter"
                    required
                    className="flex-1 rounded-full border border-primary-foreground/20 bg-background/10 px-6 py-4 text-background placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-background/30"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-full bg-background px-8 py-4 font-semibold text-primary transition-colors hover:bg-muted"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="mt-4 text-sm text-primary-foreground/80">{ctaNote}</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <PlusMark className="size-6" />
                  </span>
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm leading-relaxed text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {socialIcons[social] ?? (
                        <span className="text-sm">{social.charAt(0)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold text-background">{col.title}</h4>
                  <ul className="space-y-3 text-sm text-background/60">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-primary"
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
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <p className="text-sm text-background/50">{footerMadeIn}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
