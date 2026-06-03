import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * NutritionKimiPage — a complete, self-contained nutrition-coaching LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Nourish" design: a calm,
 * organic, wellness aesthetic on a warm light canvas with a sage-green brand
 * accent. It pairs a split hero (eyebrow + headline + dual CTAs + trust avatars
 * + floating "meal logged" card over a food photo) with a press-logo strip, a
 * 6-up approach/features grid with icon tiles, a 4-step "how it works" walkthrough
 * beside a kitchen photo, a 8-image meal gallery, a sage stats band, a 6-card
 * client-transformation testimonials grid (avatars + star ratings), a 3-tier
 * pricing table with a highlighted "Most Popular" plan, a 6-item FAQ accordion,
 * a sage final-CTA band, and a rich multi-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. The warm light
 * surface maps to `background`/`foreground`, the sage brand hue to `primary`,
 * and section bands to `muted`/`card`. Every nav item / CTA / link / form-submit
 * routes through `useNavigate` (never a dead "#"), and navbar labels match the
 * `nav` array so PageSwitch can swap pages. All content imagery (food, kitchen,
 * client headshots) uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const NutritionKimiPage = defineComponent({
  name: "NutritionKimiPage",
  description:
    "Complete personalized nutrition-coaching / wellness LANDING page with a calm, organic, evidence-based aesthetic: warm light canvas, sage-green brand accent, soft rounded cards and food photography. Includes a split hero (eyebrow, big headline, dual CTAs, stacked trust avatars, floating meal-logged card over a healthy-meal photo), a press/featured-in logo strip, a 6-up approach grid (meal plans, 1:1 coaching, grocery lists, progress tracking, mobile app, recipes) with icon tiles, a 4-step 'how it works' walkthrough beside a kitchen photo, an 8-image meal gallery, a stats band (clients, pounds lost, goal achievement, rating), a 6-card client-transformation testimonials grid with headshots and star ratings, a 3-tier pricing table (Essential / Coaching most-popular / Couples) with feature checklists, a 6-item FAQ accordion, a final sign-up CTA band, and a multi-column footer with social links. Use as the ROOT/home page for nutrition coaches, registered dietitians, meal-plan subscriptions, diet/health programs, wellness startups, weight-loss or healthy-eating services, or fitness-nutrition apps when a warm, trustworthy, conversion-focused page with strong social proof and pricing is wanted. Supply content only — brand, nav, hero, features, steps, gallery, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trustNote: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Floating card overlay on the hero photo. */
        badgeTitle: z.string().optional(),
        badgeSubtitle: z.string().optional(),
      })
      .optional(),
    /** Press / featured-in logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Approach / features grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "How it works" steps beside a kitchen photo. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Meal gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
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
    /** Client transformation testimonials. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              result: z.string(),
              quote: z.string(),
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
        note: z.string().optional(),
        cta: z.string().optional(),
        popularLabel: z.string().optional(),
        priceSuffix: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              featured: z.boolean().optional(),
              features: z.array(
                z.object({ label: z.string(), included: z.boolean() }),
              ),
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
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Nourish"
    const nav = props.nav?.length
      ? props.nav
      : ["Approach", "Stories", "Plans", "FAQ"]

    const heroEyebrow =
      props.hero?.eyebrow ?? "Evidence-Based Nutrition Coaching"
    const heroHeading =
      props.hero?.heading ?? "Finally, a nutrition plan that fits your life"
    const heroSub =
      props.hero?.subheading ??
      "Personalized meal plans, expert coaching, and sustainable habits. Join 50,000+ clients who have transformed their relationship with food—and their bodies."
    const heroPrimary = props.hero?.primaryCta ?? "Start 7-Day Free Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "See Transformations"
    const heroTrust =
      props.hero?.trustNote ?? "Trusted by 50,000+ clients worldwide"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "overhead view of a colorful healthy meal prep with fresh vegetables grains and proteins in ceramic bowls"
    const heroBadgeTitle = props.hero?.badgeTitle ?? "Meal logged"
    const heroBadgeSubtitle =
      props.hero?.badgeSubtitle ?? "Mediterranean bowl • 485 cal"

    const logosHeading =
      props.logos?.heading ?? "Featured in leading health publications"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Healthline", "Shape", "Well+Good", "MindBody", "Prevention"]

    const featuresHeading =
      props.features?.heading ?? "A complete approach to nutrition"
    const featuresDesc =
      props.features?.description ??
      "We combine personalized meal planning, expert coaching, and behavioral science to help you build lasting habits."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Personalized Meal Plans",
            description:
              "Custom meal plans tailored to your goals, dietary restrictions, schedule, and food preferences. Updated weekly based on your feedback.",
          },
          {
            title: "1:1 Nutrition Coaching",
            description:
              "Weekly video check-ins with registered dietitians. Get expert guidance, accountability, and real-time adjustments to your plan.",
          },
          {
            title: "Smart Grocery Lists",
            description:
              "Auto-generated shopping lists organized by store section. Save time, reduce waste, and never forget an ingredient again.",
          },
          {
            title: "Progress Tracking",
            description:
              "Track weight, measurements, energy levels, and habits. Visualize your journey with intuitive charts and celebrate milestones.",
          },
          {
            title: "Mobile App Access",
            description:
              "Log meals, message your coach, and view your plan on the go. Available for iOS and Android with offline mode.",
          },
          {
            title: "Recipe Database",
            description:
              "Access 3,000+ dietitian-approved recipes with full nutrition info. Filter by macros, cook time, dietary needs, and cuisine.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How it works"
    const stepsDesc =
      props.steps?.description ??
      "Getting started takes less than 10 minutes. Then we handle the planning—you just focus on showing up."
    const stepsImageAlt =
      props.steps?.imageAlt ??
      "woman in a modern kitchen preparing healthy vegetables on a wooden cutting board"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Complete your assessment",
            description:
              "Answer questions about your goals, lifestyle, food preferences, allergies, and schedule. Takes 5-7 minutes.",
          },
          {
            title: "Meet your dietitian",
            description:
              "Get matched with a registered dietitian based on your goals. Schedule your 30-minute onboarding call within 48 hours.",
          },
          {
            title: "Receive your custom plan",
            description:
              "Your personalized meal plan arrives within 24 hours of your call, complete with recipes and a shopping list.",
          },
          {
            title: "Check in weekly",
            description:
              "Weekly video calls with your coach to review progress, troubleshoot challenges, and adjust your plan.",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Meals you'll actually enjoy"
    const galleryDesc =
      props.gallery?.description ??
      "No bland chicken and broccoli here. Every recipe is developed by chefs and approved by dietitians."
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "fresh colorful salad bowl with quinoa avocado chickpeas and vegetables",
          "stack of fluffy pancakes with fresh berries and maple syrup",
          "homemade pizza with fresh mozzarella basil and tomatoes",
          "vibrant buddha bowl with sweet potato kale and tahini dressing",
          "grilled salmon fillet with asparagus and lemon on a white plate",
          "creamy vegetable soup with crusty bread in a rustic bowl",
          "avocado toast with poached egg and microgreens on sourdough",
          "chicken stir fry with colorful bell peppers and broccoli in a wok",
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50,000+", label: "Active Clients" },
          { value: "2.3M", label: "Pounds Lost" },
          { value: "94%", label: "Goal Achievement" },
          { value: "4.9/5", label: "App Store Rating" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Real transformations"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Meet clients who have changed their relationship with food and achieved lasting results."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Sarah Mitchell",
            result: "Lost 34 lbs • 6 months",
            quote:
              "After years of yo-yo dieting, I finally found something sustainable. My coach helped me understand portions without obsession. I've kept the weight off for 18 months now.",
            avatarAlt:
              "professional headshot of a middle-aged woman with short brown hair smiling warmly",
          },
          {
            name: "Marcus Chen",
            result: "Gained 12 lbs muscle • 4 months",
            quote:
              "As a software engineer, I was living on takeout. Nourish taught me to meal prep efficiently. I'm saving $400/month on food and finally seeing gym results.",
            avatarAlt:
              "professional headshot of a fit man in his thirties with short dark hair and a beard",
          },
          {
            name: "Aisha Johnson",
            result: "Reversed prediabetes • 8 months",
            quote:
              "My doctor gave me a warning about my A1C. Eight months later, I'm in the normal range and off medication. This program quite literally saved my life.",
            avatarAlt:
              "professional headshot of a young woman with curly hair and a bright smile",
          },
          {
            name: "David Park",
            result: "Lost 47 lbs • 10 months",
            quote:
              "At 52, I thought my metabolism was broken. Turns out I just needed the right guidance. Down 47 pounds and my energy is better than it was in my 30s.",
            avatarAlt:
              "professional headshot of a middle-aged man with glasses and a friendly smile",
          },
          {
            name: "Elena Rodriguez",
            result: "Postpartum recovery • 5 months",
            quote:
              "After my second baby, I felt lost. Nourish worked with my breastfeeding needs and zero free time. I'm stronger now than before kids.",
            avatarAlt:
              "professional headshot of a woman with long dark hair and natural makeup",
          },
          {
            name: "James Thompson",
            result: "Athletic performance • 3 months",
            quote:
              "I'm a competitive cyclist. Nourish dialed in my fueling strategy perfectly. PR'd my FTP by 15% and dropped 8 pounds. Game changer.",
            avatarAlt:
              "professional headshot of a young man with curly hair and a genuine smile",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start with a 7-day free trial. No credit card required. Cancel anytime."
    const pricingNote =
      props.pricing?.note ??
      "All plans include a 7-day free trial. No credit card required to start. Cancel anytime."
    const pricingCta = props.pricing?.cta ?? "Start Free Trial"
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const priceSuffix = props.pricing?.priceSuffix ?? "/month"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Essential",
            tagline: "Perfect for self-starters who want structure",
            price: "$29",
            featured: false,
            features: [
              { label: "Personalized meal plans", included: true },
              { label: "Auto-generated grocery lists", included: true },
              { label: "Access to 3,000+ recipes", included: true },
              { label: "Progress tracking app", included: true },
              { label: "Coaching sessions", included: false },
            ],
          },
          {
            name: "Coaching",
            tagline: "Best for lasting transformation",
            price: "$89",
            featured: true,
            features: [
              { label: "Everything in Essential", included: true },
              { label: "Weekly 1:1 video coaching", included: true },
              { label: "Unlimited messaging", included: true },
              { label: "Plan adjustments anytime", included: true },
              { label: "Priority support", included: true },
            ],
          },
          {
            name: "Couples",
            tagline: "Transform together, save together",
            price: "$139",
            featured: false,
            features: [
              { label: "Everything in Coaching", included: true },
              { label: "2 individual accounts", included: true },
              { label: "Shared meal plan option", included: true },
              { label: "Joint grocery lists", included: true },
              { label: "Save $39/month", included: true },
            ],
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about getting started."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Will my meal plan work with dietary restrictions?",
            a: "Absolutely. Our dietitians work with all major dietary needs including gluten-free, dairy-free, vegetarian, vegan, keto, paleo, low-FODMAP, and food allergies. During your assessment, you'll detail any restrictions and preferences.",
          },
          {
            q: "How is this different from apps like MyFitnessPal?",
            a: 'Nourish provides complete meal plans—not just calorie counting. You get specific recipes, grocery lists, and personalized coaching. No more wondering "what should I eat?" We tell you exactly what to shop for and how to prepare it.',
          },
          {
            q: "What if I don't like a recipe?",
            a: "Rate any recipe and we'll adjust future plans. You can also swap recipes instantly from our database of 3,000+ options. Your feedback directly shapes your meal plans—our algorithm learns your preferences over time.",
          },
          {
            q: "Can I cancel my subscription?",
            a: "Yes, you can cancel anytime with no fees. Your access continues through the end of your billing period. We also offer a 30-day money-back guarantee if you're not satisfied with your first month.",
          },
          {
            q: "Are the coaches registered dietitians?",
            a: 'Yes, all Nourish coaches are Registered Dietitian Nutritionists (RDNs) with accredited degrees and supervised practice hours. They\'re licensed healthcare professionals—not self-taught "nutritionists."',
          },
          {
            q: "How quickly will I see results?",
            a: "Most clients notice improved energy and digestion within the first week. Weight changes typically begin in weeks 2-4, with sustainable progress averaging 1-2 pounds per week. We focus on long-term habits, not quick fixes.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Start your transformation today"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ clients who have built healthier relationships with food. Your first 7 days are free—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a Call"
    const ctaNote = props.cta?.note ?? "Cancel anytime • 30-day money-back guarantee"

    const footerTagline =
      props.footer?.tagline ??
      "Evidence-based nutrition coaching for sustainable transformation. Building healthier relationships with food since 2019."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          { title: "Product", links: ["Features", "Pricing", "Recipes", "Mobile App"] },
          { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
          { title: "Support", links: ["FAQ", "Help Center", "Privacy", "Terms"] },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "Nourish Nutrition Coaching. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Twitter", "Facebook"]

    // Brand leaf mark (decorative inline svg).
    const LeafMark = ({ className }: { className?: string }) => (
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
          strokeWidth="1.5"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
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

    const Cross = ({ className }: { className?: string }) => (
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    )

    const Star = () => (
      <svg
        className="size-4 text-chart-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // clipboard / meal plan
      <svg key="i0" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>,
      // people / coaching
      <svg key="i1" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // clock / grocery
      <svg key="i2" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // chart / progress
      <svg key="i3" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // phone / mobile
      <svg key="i4" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      // bookmark / recipes
      <svg key="i5" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      Twitter: (
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      Facebook: (
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LeafMark className="size-8 text-primary" />
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <nav className="hidden items-center gap-8 md:flex">
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
              </nav>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go("Sign In")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:inline-flex"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-input bg-card px-6 py-3.5 text-base font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      {[
                        "professional headshot of a smiling woman with brown hair",
                        "professional headshot of a man with short dark hair smiling",
                        "professional headshot of a blonde woman smiling outdoors",
                      ].map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={64}
                          h={64}
                          className="size-8 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <p>{heroTrust}</p>
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-xl bg-card p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <Check className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {heroBadgeTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroBadgeSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press logos */}
          <section className="border-y border-border bg-card py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-60 md:grid-cols-5">
                {logoNames.map((name, i) => (
                  <span
                    key={name}
                    className={cn(
                      "text-lg font-semibold text-muted-foreground",
                      i === 4 && "hidden md:block",
                    )}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features / Approach */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="group">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
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
          <section className="bg-card py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="order-2 lg:order-1">
                  <Image
                    alt={stepsImageAlt}
                    w={800}
                    h={700}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {stepsHeading}
                  </h2>
                  <p className="mb-10 text-lg text-muted-foreground">
                    {stepsDesc}
                  </p>
                  <div className="space-y-8">
                    {stepItems.map((step, i) => (
                      <div key={step.title} className="flex gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="mb-1 text-lg font-semibold text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Meal gallery */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[0, 1, 2, 3].map((col) => (
                  <div key={col} className="space-y-4">
                    {[galleryImages[col * 2], galleryImages[col * 2 + 1]]
                      .filter(Boolean)
                      .map((alt, idx) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={400}
                          h={idx % 2 === 0 ? 500 : 300}
                          loading="lazy"
                          className={cn(
                            "w-full rounded-xl object-cover transition-transform duration-300 hover:scale-105",
                            idx % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]",
                          )}
                        />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-primary-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-primary-foreground/80">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={128}
                        h={128}
                        loading="lazy"
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.result}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-card py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.featured
                        ? "bg-primary"
                        : "border border-border bg-background",
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-chart-4 px-3 py-1 text-xs font-semibold text-foreground">
                          {popularLabel}
                        </span>
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        tier.featured
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        tier.featured
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.tagline}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          tier.featured
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      <span
                        className={cn(
                          tier.featured
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {priceSuffix}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((f) => (
                        <li key={f.label} className="flex items-start gap-3">
                          {f.included ? (
                            <Check
                              className={cn(
                                "mt-0.5 size-5 shrink-0",
                                tier.featured
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          ) : (
                            <Cross
                              className={cn(
                                "mt-0.5 size-5 shrink-0",
                                tier.featured
                                  ? "text-primary-foreground/50"
                                  : "text-muted-foreground/60",
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              tier.featured
                                ? "text-primary-foreground"
                                : f.included
                                  ? "text-muted-foreground"
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
                      onClick={() => go(`${pricingCta} — ${tier.name}`)}
                      className={cn(
                        "w-full rounded-full px-4 py-3 text-sm font-medium transition-colors",
                        tier.featured
                          ? "bg-background text-primary hover:bg-background/90"
                          : "border border-input bg-card text-foreground hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      {pricingCta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-10 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center lg:mb-16">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card open:ring-1 open:ring-primary/30"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-medium text-card-foreground">
                        {item.q}
                      </span>
                      <svg
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
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
          <section className="bg-primary py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-medium text-primary transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-primary-foreground/30 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:border-primary-foreground/60"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/70">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LeafMark className="size-8 text-primary" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background/80 transition-colors hover:bg-background/20"
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
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
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
