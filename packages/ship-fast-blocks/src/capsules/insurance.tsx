import { type FormEvent, type ReactNode, useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { string, table } from "@ship-fast/lakebed/server"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet.tsx"

/**
 * InsuranceKimiPage — a complete, self-contained INSURANCE marketing / quote
 * landing page. A faithful Tailwind v4 port of a Kimi-generated "SecureLife"
 * design: a clean, trustworthy, corporate-fintech aesthetic on a light canvas
 * with a single confident brand-blue accent, soft muted section bands, rounded
 * cards and a shielded brand mark. It pairs a two-column hero (rating pill,
 * bold headline with highlighted word, dual CTAs, trust checklist, family photo
 * with a floating social-proof card) with a logo trust strip, a 4-up coverage
 * grid (Home / Auto / Life / Health, each with a feature checklist), a 3-step
 * "how it works" band, a 4-up stats strip, a 3-tier pricing table with a
 * highlighted "Most Popular" plan, a 6-card customer-testimonial wall, a 7-item
 * FAQ stack, a full-bleed accent CTA panel, and a fat 6-column dark footer with
 * social icons and trust badges.
 *
 * Every nav item / CTA / footer link / phone / form-submit routes through
 * `useNavigate` (never a dead "#"). All imagery (hero photo, customer headshots,
 * trust badges) uses the alt-driven <Image> component (never a raw src). Color
 * is 100% semantic theme tokens (brand-blue -> primary, light bands -> muted,
 * dark footer -> foreground/background) so the block is theme-injectable.
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const InsuranceKimiPage = defineCapsule({
  name: "InsuranceKimiPage",
  description:
    "Complete INSURANCE company marketing / get-a-quote LANDING page with a clean, trustworthy, corporate-fintech aesthetic: light canvas, a single confident brand-blue accent, soft muted bands, rounded cards and a shield brand mark. Includes a two-column hero (4.9/5 rating pill, bold headline, dual CTAs, no-credit-check trust checklist, family photo with a floating happy-customers + star-rating card), a press/logo trust strip, a 4-up coverage grid for Home / Auto / Life / Health insurance with per-card feature checklists and starting prices, a 3-step how-it-works process band, a 4-up impact stats strip (families protected, claims processed/approved, rating), a 3-tier transparent pricing table (Essential / Complete 'Most Popular' / Premium) with monthly prices and per-plan checklists, a 6-card customer-testimonial wall with star ratings and headshots, a 7-item FAQ stack, a full-bleed accent call-to-action panel with phone CTA, and a fat 6-column dark footer with products/company/resources/legal/contact columns, social icons and trust badges. Use as the ROOT/home page for insurance carriers, insurtech startups, brokers/agencies, or financial-protection products (home, auto, life, health, renters) when a credible, conversion-focused quote-driven page with strong social proof, transparent pricing and coverage explainers is wanted. Supply content only — brand, nav, hero, coverage, steps, stats, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        ratingPill: z.string().optional(),
        headingBefore: z.string().optional(),
        /** Word rendered in the brand-accent color inside the headline. */
        highlight: z.string().optional(),
        headingAfter: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Inline trust badges below the CTAs. */
        trustItems: z.array(z.string()).optional(),
        /** Floating social-proof card. */
        proofCount: z.string().optional(),
        proofLabel: z.string().optional(),
        proofRating: z.string().optional(),
      })
      .optional(),
    /** Press / trust logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Coverage product grid (Home / Auto / Life / Health). */
    coverage: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              features: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** How-it-works 3-step band. */
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
    /** Impact stats strip. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Transparent pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        popularLabel: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              popular: z.boolean().optional(),
              features: z.array(
                z.object({ label: z.string(), included: z.boolean() }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Customer testimonial wall. */
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
    /** Frequently asked questions. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing call-to-action panel. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        phoneCta: z.string().optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        copyright: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      quoteRequests: table({
        name: string(),
        email: string(),
        coverageType: string(),
        plan: string(),
        source: string(),
        notes: string(),
        status: string(),
      }),
    },
    queries: {
      quoteRequests: ({ db }) => db.quoteRequests.orderBy("createdAt").all(),
    },
    mutations: {
      addQuoteRequest: (
        { db },
        name: string,
        email: string,
        coverageType: string,
        plan: string,
        source: string,
        notes: string,
      ) => {
        db.quoteRequests.insert({
          name,
          email,
          coverageType,
          plan,
          source,
          notes,
          status: "Open",
        })

        return db.quoteRequests.all()
      },
      setQuoteRequestStatus: ({ db }, id: string, status: string) => {
        const request = db.quoteRequests.get(id)
        if (!request) return db.quoteRequests.all()

        db.quoteRequests.update(id, { status })

        return db.quoteRequests.all()
      },
      removeQuoteRequest: ({ db }, id: string) => {
        db.quoteRequests.delete(id)

        return db.quoteRequests.all()
      },
      clearQuoteRequests: ({ db }) => {
        for (const request of db.quoteRequests.all()) {
          db.quoteRequests.delete(request.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? "SecureLife"
    const nav = props.nav?.length
      ? props.nav
      : ["Coverage", "How It Works", "Pricing", "Reviews", "FAQ"]

    const heroRatingPill =
      props.hero?.ratingPill ?? "Rated 4.9/5 by 12,000+ customers"
    const heroBefore = props.hero?.headingBefore ?? "Insurance that actually"
    const heroHighlight = props.hero?.highlight ?? "protects"
    const heroAfter = props.hero?.headingAfter ?? "what you value"
    const heroSub =
      props.hero?.subheading ??
      "Get personalized coverage for your home, auto, life, and health in under 2 minutes. Join 50,000+ families who trust SecureLife to safeguard their future."
    const heroPrimary = props.hero?.primaryCta ?? "Get Your Free Quote"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Happy family standing in front of their modern home with garden"
    const heroTrust = props.hero?.trustItems?.length
      ? props.hero.trustItems
      : ["No credit check required", "Cancel anytime"]
    const proofCount = props.hero?.proofCount ?? "12,000+"
    const proofLabel = props.hero?.proofLabel ?? "Happy customers"
    const proofRating = props.hero?.proofRating ?? "4.9/5"

    const logosLabel = props.logos?.label ?? "Trusted by industry leaders"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Forbes", "Bloomberg", "TechCrunch", "WSJ", "Inc. 5000", "NerdWallet"]

    const coverageEyebrow =
      props.coverage?.eyebrow ?? "Comprehensive Protection"
    const coverageHeading =
      props.coverage?.heading ?? "Coverage designed for modern life"
    const coverageDesc =
      props.coverage?.description ??
      "From your first car to your forever home, we have you covered with flexible plans that grow with you."
    const coverageItems = props.coverage?.items?.length
      ? props.coverage.items
      : [
          {
            title: "Home Insurance",
            description:
              "Protect your home and belongings from fire, theft, and natural disasters. Coverage starts at just $42/month.",
            features: [
              "Dwelling coverage up to $2M",
              "Personal property protection",
              "Liability coverage included",
            ],
          },
          {
            title: "Auto Insurance",
            description:
              "Complete protection for every drive. From liability to comprehensive, we cover what matters on the road.",
            features: [
              "Collision & comprehensive",
              "Roadside assistance 24/7",
              "Uninsured motorist coverage",
            ],
          },
          {
            title: "Life Insurance",
            description:
              "Secure your family's financial future. Term and whole life options with guaranteed rates.",
            features: [
              "Term: 10-30 year options",
              "Whole life cash value",
              "No medical exam options",
            ],
          },
          {
            title: "Health Insurance",
            description:
              "Quality healthcare coverage that fits your budget. Individual, family, and supplemental plans available.",
            features: [
              "$0 preventive care visits",
              "Prescription coverage",
              "Mental health benefits",
            ],
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "Simple Process"
    const stepsHeading = props.steps?.heading ?? "Get covered in 3 easy steps"
    const stepsDesc =
      props.steps?.description ??
      "No paperwork, no hassle. Start protecting what matters in under 2 minutes."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Get Your Quote",
            description:
              "Answer a few quick questions about yourself and what you need to protect. Our smart system instantly calculates your personalized rate.",
          },
          {
            title: "Customize Coverage",
            description:
              "Adjust deductibles, add riders, and tailor your policy to fit your exact needs and budget. See price changes in real-time.",
          },
          {
            title: "You're Protected",
            description:
              "Purchase instantly and download your policy documents immediately. Coverage begins the moment you need it.",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Families Protected" },
          { value: "$2.4B", label: "Claims Processed" },
          { value: "98%", label: "Claims Approved" },
          { value: "4.9/5", label: "Customer Rating" },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Transparent Pricing"
    const pricingHeading = props.pricing?.heading ?? "Simple, upfront pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees, no surprises. Choose the coverage level that's right for you."
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const plans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Essential",
            tagline: "Basic coverage for budget-conscious families",
            price: "$89",
            period: "/month",
            cta: "Get Started",
            popular: false,
            features: [
              { label: "$100K liability coverage", included: true },
              { label: "$500 deductible", included: true },
              { label: "24/7 claims support", included: true },
              { label: "Identity theft protection", included: false },
            ],
          },
          {
            name: "Complete",
            tagline: "Comprehensive protection for peace of mind",
            price: "$149",
            period: "/month",
            cta: "Get Started",
            popular: true,
            features: [
              { label: "$500K liability coverage", included: true },
              { label: "$250 deductible", included: true },
              { label: "24/7 claims support", included: true },
              { label: "Identity theft protection", included: true },
              { label: "Personal umbrella policy", included: true },
            ],
          },
          {
            name: "Premium",
            tagline: "Maximum protection for high-value assets",
            price: "$229",
            period: "/month",
            cta: "Contact Sales",
            popular: false,
            features: [
              { label: "$1M liability coverage", included: true },
              { label: "$100 deductible", included: true },
              { label: "Priority claims processing", included: true },
              { label: "Full identity restoration", included: true },
              { label: "Dedicated agent", included: true },
            ],
          },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Customer Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Trusted by thousands"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what our customers have to say about their experience with SecureLife."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "When a tree fell on our garage during a storm, SecureLife had an adjuster out within 4 hours. The claim was processed in 3 days. Absolutely incredible service when we needed it most.",
            name: "Michael Chen",
            role: "Homeowner, Seattle WA",
            avatarAlt:
              "Professional headshot of Michael Chen, a software engineer from Seattle",
          },
          {
            quote:
              "After my accident on I-95, I was stressed and overwhelmed. The SecureLife team walked me through everything, arranged a rental car same-day, and had my vehicle repaired within 2 weeks.",
            name: "Sarah Mitchell",
            role: "Marketing Director, Boston MA",
            avatarAlt:
              "Professional headshot of Sarah Mitchell, a marketing director from Boston",
          },
          {
            quote:
              "I switched all my policies to SecureLife and saved $340/year while getting better coverage. The online dashboard makes managing everything so simple.",
            name: "Jennifer Williams",
            role: "Small Business Owner, Denver CO",
            avatarAlt:
              "Professional headshot of Jennifer Williams, a small business owner from Denver",
          },
          {
            quote:
              "Setting up life insurance for my growing family was seamless. The agent helped me find the perfect term policy and the rate was 20% lower than my previous provider.",
            name: "David Park",
            role: "Teacher, Austin TX",
            avatarAlt:
              "Professional headshot of David Park, a teacher from Austin",
          },
          {
            quote:
              "The mobile app is a game-changer. Filed a windshield claim while waiting for my coffee. Approval came through before my latte was ready. Unbelievably convenient.",
            name: "Amanda Foster",
            role: "Nurse, Chicago IL",
            avatarAlt:
              "Professional headshot of Amanda Foster, a nurse from Chicago",
          },
          {
            quote:
              "As a new homeowner, I had a million questions. My SecureLife agent spent an hour on the phone explaining every detail. I finally understand what I'm paying for.",
            name: "Robert Thompson",
            role: "Financial Analyst, Miami FL",
            avatarAlt:
              "Professional headshot of Robert Thompson, a financial analyst from Miami",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about SecureLife insurance. Can't find what you're looking for? Contact our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How quickly can I get coverage?",
            answer:
              "Most policies are active immediately upon purchase. For life insurance, simplified issue policies are active right away, while traditional policies may require a brief underwriting period of 2-5 days. You'll receive your policy documents via email within minutes of purchase.",
          },
          {
            question: "What's included in the 24/7 claims support?",
            answer:
              "Our claims hotline (1-800-555-0199) is available around the clock for emergencies. You can report claims, check status, arrange emergency services like towing or temporary housing, and get immediate assistance from licensed adjusters.",
          },
          {
            question: "Can I bundle multiple policies for a discount?",
            answer:
              "Absolutely! Bundle any 2 policies and save 10%, bundle 3+ policies and save 15%. Our most popular bundle includes home + auto, with an average savings of $340 per year. Bundling also simplifies billing and gives you a single point of contact.",
          },
          {
            question: "Do you offer monthly payment options?",
            answer:
              "Yes, all our policies offer flexible payment options: monthly, quarterly, semi-annual, or annual. Choose monthly payments with no additional fees when you set up automatic payments. Pay annually and receive a 5% discount.",
          },
          {
            question: "What factors affect my insurance premium?",
            answer:
              "For home insurance: location, home age, construction type, credit score, and claim history. For auto: driving record, vehicle type, annual mileage, age, and location. We use advanced analytics to ensure you're getting the fairest rate possible based on your specific risk profile.",
          },
          {
            question: "Is there a penalty for canceling my policy?",
            answer:
              "None at all. You can cancel anytime with no cancellation fees. If you prepaid annually, you'll receive a prorated refund for unused months. We believe in earning your business every month, not trapping you in contracts.",
          },
          {
            question: "How do I file a claim?",
            answer:
              "File claims through our mobile app, online portal, or by calling 1-800-555-0199. Most claims can be reported in under 5 minutes. You'll receive a claim number immediately and be contacted by an adjuster within 24 hours (4 hours for emergencies).",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to protect what matters?"
    const ctaDesc =
      props.cta?.description ??
      "Get your personalized quote in under 2 minutes. Join 50,000+ families who trust SecureLife for their insurance needs."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Your Free Quote"
    const ctaPhone = props.cta?.phoneCta ?? "Call 1-800-555-0199"
    const ctaFootnote =
      props.cta?.footnote ??
      "No credit check required • Cancel anytime • Instant coverage"

    const footerTagline =
      props.footer?.tagline ??
      "Protecting what matters most for over 25 years. Licensed in all 50 states."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Products",
            links: [
              "Home Insurance",
              "Auto Insurance",
              "Life Insurance",
              "Health Insurance",
              "Renters Insurance",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Blog", "Contact"],
          },
          {
            title: "Resources",
            links: [
              "Help Center",
              "Claims Center",
              "Agent Portal",
              "Policy Documents",
              "Insurance 101",
            ],
          },
          {
            title: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Licenses",
              "Sitemap",
            ],
          },
        ]
    const footerPhone = props.footer?.phone ?? "1-800-555-0199"
    const footerEmail = props.footer?.email ?? "support@securelife.com"
    const footerAddress =
      props.footer?.address ?? "500 Insurance Plaza, New York, NY 10004"
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Insurance. All rights reserved.`
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "LinkedIn"]

    const defaultCoverageType = coverageItems[0]?.title ?? "Home Insurance"
    const defaultPlan = plans[0]?.name ?? "Essential"
    const [quoteDrawerOpen, setQuoteDrawerOpen] = useState(false)
    const [quoteForm, setQuoteForm] = useState({
      name: "",
      email: "",
      coverageType: defaultCoverageType,
      plan: defaultPlan,
      source: "Get your free quote",
      notes: "",
    })

    const quoteRequests = lakebed.useQuery("quoteRequests") ?? []
    const addQuoteRequest = lakebed.useMutation("addQuoteRequest")
    const setQuoteRequestStatus = lakebed.useMutation("setQuoteRequestStatus")
    const removeQuoteRequest = lakebed.useMutation("removeQuoteRequest")
    const clearQuoteRequests = lakebed.useMutation("clearQuoteRequests")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const authInitials = authDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ME"
    const quoteRequestCount = quoteRequests.length
    const openQuoteRequestCount = quoteRequests.filter(
      (request) => request.status === "Open",
    ).length
    const coverageTypeOptions = coverageItems.map((item) => item.title)
    const planOptions = plans.map((item) => item.name)

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const openQuoteDrawer = (opts: {
      source: string
      coverageType?: string
      plan?: string
    }) => {
      setQuoteForm((previous) => ({
        ...previous,
        source: opts.source,
        coverageType:
          opts.coverageType && coverageTypeOptions.includes(opts.coverageType)
            ? opts.coverageType
            : previous.coverageType,
        plan:
          opts.plan && planOptions.includes(opts.plan)
            ? opts.plan
            : previous.plan,
      }))
      setQuoteDrawerOpen(true)
    }

    const handleQuoteSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const name = quoteForm.name.trim()
      const email = quoteForm.email.trim()
      if (!name || !email) return

      void addQuoteRequest(
        name,
        email,
        quoteForm.coverageType || defaultCoverageType,
        quoteForm.plan || defaultPlan,
        quoteForm.source || "Quick quote",
        quoteForm.notes.trim(),
      )

      setQuoteForm((previous) => ({
        ...previous,
        name: "",
        email: "",
        notes: "",
      }))
    }

    // Shield brand mark (decorative brand asset).
    const Shield = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Cross = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Phone = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    // Coverage icons — rotate through token-colored line icons.
    const coverageIcons: ReactNode[] = [
      <svg
        key="home"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      <svg
        key="auto"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
      </svg>,
      <svg
        key="life"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg
        key="health"
        width="24"
        height="24"
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
    ]

    const renderHeadline = () => (
      <>
        {heroBefore} <span className="text-primary">{heroHighlight}</span>{" "}
        {heroAfter}
      </>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <Shield className="size-8" />
                <span className="text-xl font-semibold text-foreground">
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
                <button
                  type="button"
                  onClick={() => go(footerPhone)}
                  className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
                >
                  <Phone className="size-4" />
                  {footerPhone}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openQuoteDrawer({
                      source: "Header quote",
                      plan: defaultPlan,
                      coverageType: defaultCoverageType,
                    })
                    go(heroPrimary)
                  }}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get a Quote
                  {quoteRequestCount > 0 ? (
                    <span className="ml-2 grid size-5 place-items-center rounded-full bg-primary-foreground/20 text-[0.625rem] font-bold text-primary-foreground">
                      {quoteRequestCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                    <Star className="size-4 text-primary" />
                    {heroRatingPill}
                  </div>
                  <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {renderHeadline()}
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      openQuoteDrawer({
                        source: heroPrimary,
                        coverageType: defaultCoverageType,
                        plan: defaultPlan,
                      })
                      go(heroPrimary)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <ArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openQuoteDrawer({
                        source: heroSecondary,
                        coverageType: defaultCoverageType,
                        plan: defaultPlan,
                      })
                      go(heroSecondary)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-muted"
                  >
                      <svg
                        className="size-5 text-primary"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/40"
                  />
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="relative w-full rounded-2xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl bg-card p-4 shadow-xl sm:p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[
                          "Portrait headshot of a friendly woman, satisfied customer",
                          "Portrait headshot of a friendly man, satisfied customer",
                          "Portrait headshot of a smiling person, satisfied customer",
                        ].map((alt) => (
                          <Image
                            key={alt}
                            alt={alt}
                            w={100}
                            h={100}
                            className="size-10 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-card-foreground">
                          {proofCount}
                        </p>
                        <p className="text-muted-foreground">{proofLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-primary" />
                      ))}
                      <span className="ml-2 font-semibold text-card-foreground">
                        {proofRating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo trust strip */}
          <section className="border-b border-border py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div key={logo} className="flex items-center justify-center">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {logo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Coverage grid */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {coverageEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {coverageHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{coverageDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {coverageItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-transparent bg-muted p-6 transition-all hover:border-border hover:bg-card hover:shadow-xl lg:p-8"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      {coverageIcons[i % coverageIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="h-full rounded-2xl border border-border bg-background p-8 shadow-sm">
                      <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div className="absolute top-1/2 -right-6 hidden -translate-y-1/2 md:block lg:-right-8">
                        <ArrowRight className="size-6 text-border lg:size-8" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats strip */}
          <section className="bg-background py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-bold text-primary lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="font-medium text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl bg-background p-8",
                      plan.popular
                        ? "border-2 border-primary shadow-xl md:-translate-y-4"
                        : "border border-border shadow-sm",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                          {popularLabel}
                        </span>
                      </div>
                    )}
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-6 text-muted-foreground">{plan.tagline}</p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.popular ? "text-primary" : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f.label}
                          className={cn(
                            "flex items-center gap-3",
                            f.included
                              ? "text-muted-foreground"
                              : "text-muted-foreground/50",
                          )}
                        >
                          {f.included ? (
                            <Check className="size-5 shrink-0 text-primary" />
                          ) : (
                            <Cross className="size-5 shrink-0" />
                          )}
                          {f.label}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        openQuoteDrawer({
                          source: plan.cta,
                          coverageType: defaultCoverageType,
                          plan: plan.name,
                        })
                        go(plan.cta)
                      }}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 font-semibold transition-colors",
                        plan.popular
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                          : "border-2 border-border bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-2xl bg-muted p-8">
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-primary" />
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

          {/* FAQ */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-xl border border-border bg-background p-6 shadow-sm"
                  >
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      {item.question}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-center lg:p-16">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 text-primary-foreground opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(currentColor 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
                <div className="relative z-10">
                  <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                    {ctaHeading}
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                    {ctaDesc}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      openQuoteDrawer({
                        source: ctaPrimary,
                        coverageType: defaultCoverageType,
                        plan: defaultPlan,
                      })
                      go(ctaPrimary)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-semibold text-primary shadow-lg transition-colors hover:bg-muted"
                  >
                    {ctaPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                    >
                      <Phone className="size-5" />
                      {ctaPhone}
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-primary-foreground/70">
                    {ctaFootnote}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6 lg:gap-12">
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <Shield className="size-8" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-xs text-background/60">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-background/20"
                    >
                      <span className="text-xs font-semibold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm text-background/60">
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
              <div>
                <h4 className="mb-4 font-semibold text-background">Contact</h4>
                <ul className="space-y-3 text-sm text-background/60">
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="text-left transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="text-left transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{footerAddress}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/60">{footerCopyright}</p>
              <div className="flex items-center gap-4 opacity-70">
                <Image
                  alt="Better Business Bureau A+ rating badge"
                  w={60}
                  h={40}
                  className="h-8 w-auto rounded object-cover"
                />
                <Image
                  alt="Norton Secured SSL certificate badge"
                  w={60}
                  h={40}
                  className="h-8 w-auto rounded object-cover"
                />
              </div>
            </div>
          </div>
        </footer>

        <Sheet open={quoteDrawerOpen} onOpenChange={setQuoteDrawerOpen}>
          <SheetContent side="right" className="w-full max-w-md p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border px-6 py-6">
              <SheetTitle>Quote Requests</SheetTitle>
              <SheetDescription>
                Manage your insurance quote leads for this session.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-8">
                {!auth.isLoading ? (
                  isSignedIn ? (
                    <div className="rounded-lg border border-border bg-muted px-4 py-3">
                      <p className="text-sm text-foreground">
                        Signed in as {authDisplayName} ({authInitials})
                      </p>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="mt-2 w-full rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSignIn}
                      className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                    >
                      {authLabel}
                    </button>
                  )
                ) : null}

                <form className="space-y-4" onSubmit={handleQuoteSubmit}>
                  <h3 className="text-sm font-semibold text-foreground">
                    Create a quote request
                  </h3>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Full name
                    </label>
                    <input
                      value={quoteForm.name}
                      onChange={(event) =>
                        setQuoteForm((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                      }
                      required
                      placeholder="Jane Doe"
                      aria-label="Full name"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      value={quoteForm.email}
                      onChange={(event) =>
                        setQuoteForm((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                      required
                      placeholder="you@email.com"
                      aria-label="Email"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-muted-foreground">
                        Coverage
                      </label>
                      <select
                        value={quoteForm.coverageType}
                        onChange={(event) =>
                          setQuoteForm((previous) => ({
                            ...previous,
                            coverageType: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        aria-label="Coverage type"
                      >
                        {coverageTypeOptions.map((coverageType) => (
                          <option key={coverageType} value={coverageType}>
                            {coverageType}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-muted-foreground">
                        Plan
                      </label>
                      <select
                        value={quoteForm.plan}
                        onChange={(event) =>
                          setQuoteForm((previous) => ({
                            ...previous,
                            plan: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        aria-label="Plan"
                      >
                        {planOptions.map((planName) => (
                          <option key={planName} value={planName}>
                            {planName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Notes
                    </label>
                    <textarea
                      value={quoteForm.notes}
                      onChange={(event) =>
                        setQuoteForm((previous) => ({
                          ...previous,
                          notes: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Tell us what you need covered."
                      aria-label="Quote notes"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Save quote request
                  </button>
                </form>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      Saved requests
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {openQuoteRequestCount} open · {quoteRequestCount} total
                    </p>
                  </div>
                  {quoteRequests.length ? (
                    <div className="space-y-3">
                      {quoteRequests.map((request) => {
                        const isOpen = request.status === "Open"

                        return (
                          <div
                            key={request.id}
                            className="rounded-xl border border-border bg-muted/20 p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-foreground">
                                  {request.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {request.email}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                  isOpen
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground/70",
                                )}
                              >
                                {request.status}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {request.coverageType} · {request.plan}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Source: {request.source}
                            </p>
                            {request.notes ? (
                              <p className="mt-3 text-xs text-foreground/85">
                                {request.notes}
                              </p>
                            ) : null}
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void setQuoteRequestStatus(
                                    request.id,
                                    isOpen ? "Contacted" : "Open",
                                  )
                                }
                                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                              >
                                {isOpen ? "Mark contacted" : "Re-open"}
                              </button>
                              <button
                                type="button"
                                onClick={() => void removeQuoteRequest(request.id)}
                                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                      No requests yet. Add one using the form above.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <SheetFooter className="border-t border-border px-6 py-5">
              <p className="mb-3 text-xs text-muted-foreground">
                {quoteRequestCount > 0
                  ? `${quoteRequestCount} request${quoteRequestCount === 1 ? "" : "s"} saved in this session.`
                  : "No quote requests yet. Start by saving one."}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (quoteRequestCount > 0) {
                      void clearQuoteRequests()
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                  disabled={quoteRequestCount === 0}
                >
                  Clear requests
                </button>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
                  >
                    Continue
                  </button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
