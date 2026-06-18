import { useState, type ReactNode } from "react"
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
 * InsuranceKimiPage2 — TEMPLATE VARIANT 2 for the INSURANCE category, a
 * deliberately DISTINCT sibling to InsuranceKimiPage. A faithful Tailwind v4
 * port of a Kimi-generated "ShieldCover" design with a bolder, higher-contrast,
 * consumer-direct mood: a DARK gradient hero (navy band) carrying a glowing
 * blurred-orb backdrop, a rating pill, an extra-black headline with a
 * gradient-highlighted word, dual rounded-pill CTAs, and — its signature
 * differentiator — a live two-minute "Start Your Quote" form card floating in
 * the right column (Home/Auto/Life/Business product toggles + ZIP input).
 * Below: an authority/ratings logo strip (Fortune 500, A.M. Best A+, BBB,
 * JD Power, Trustpilot, Forbes), a 4-up coverage grid (Home / Auto / Life /
 * Business) with rotating token-tinted icon tiles and per-card checklists plus
 * a bundle-&-save callout, a connected 3-step "Get Covered" process band with a
 * gradient connector line and a feature triple (instant coverage / mobile app /
 * 24/7 support), a full-bleed PRIMARY stats strip (2M+ policies, $850M claims
 * paid, 4.9/5, <2min), a 6-card testimonial wall with star ratings and
 * headshots, a 6-item EXPANDABLE FAQ accordion (native details/summary), a
 * vivid full-bleed ACCENT-gradient closing CTA with phone, and a fat 4-column
 * dark footer with social icons, a legal underwriting disclaimer, and policy
 * links. Use this when a punchy, warm-orange-accented, quote-form-forward
 * insurance landing page is wanted instead of the calmer corporate-fintech
 * first style.
 *
 * Distinct from InsuranceKimiPage (calm light corporate-fintech, no inline
 * quote form, has a 3-tier pricing table): this variant leads with a dark hero
 * + inline quote form, no pricing table, an orange/accent secondary brand, and
 * an expandable FAQ. Every nav item / CTA / footer link / phone / form-submit
 * routes through `useNavigate`. All imagery uses the alt-driven <Image>
 * component. Color is 100% semantic theme tokens. Renders fully on defaults.
 */
export const InsuranceKimiPage2 = defineCapsule({
  name: "InsuranceKimiPage2",
  description:
    "Alternative / SECOND-style complete INSURANCE marketing & get-a-quote LANDING page (a distinct sibling to InsuranceKimiPage) with a bold, high-contrast, consumer-direct ShieldCover aesthetic: a DARK navy gradient hero with a glowing orb backdrop, a 4.9/5 rating pill, an extra-black headline with a gradient-highlighted word, dual rounded-pill CTAs, and a signature LIVE inline 'Start Your Quote' form card (Home / Auto / Life / Business product toggles plus a ZIP-code field) floating in the hero's right column. Includes an authority/ratings logo strip (Fortune 500, A.M. Best A+, BBB A+, JD Power, Trustpilot, Forbes Best), a 4-up coverage grid for Home / Auto / Life / Business insurance with rotating token-tinted icon tiles, per-card feature checklists and starting prices plus a bundle-and-save callout, a connected 3-step 'Get Covered in 3 Easy Steps' process band with a gradient connector line and an instant-coverage / mobile-app / 24-7-support feature triple, a full-bleed primary-color impact stats strip (2M+ active policies, $850M claims paid, 4.9/5 rating, sub-2-minute quote time), a 6-card customer-testimonial wall with star ratings and headshots, a 6-item EXPANDABLE FAQ accordion, a vivid full-bleed accent-gradient closing call-to-action with a phone CTA, and a fat 4-column dark footer with social icons, an insurance underwriting legal disclaimer and policy links. Choose this punchy warm-orange-accented, quote-form-forward variant over the calmer corporate-fintech first style when a conversion-focused page that captures a quote inline is wanted; for home, auto, life, business, renters or motorcycle insurance carriers, insurtech startups, brokers and agencies. Supply content only — brand, nav, hero, logos, coverage, steps, stats, testimonials, faq, cta, footer; the block owns all layout and styling and renders great with no props.",
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
        /** Word rendered with a gradient highlight inside the headline. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Inline trust badges below the CTAs. */
        trustItems: z.array(z.string()).optional(),
        /** Inline quote-form card. */
        formTitle: z.string().optional(),
        formSubtitle: z.string().optional(),
        formProducts: z.array(z.string()).optional(),
        formZipPlaceholder: z.string().optional(),
        formSubmit: z.string().optional(),
        formFootnote: z.string().optional(),
      })
      .optional(),
    /** Authority / ratings logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Coverage product grid (Home / Auto / Life / Business). */
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
              cta: z.string(),
            }),
          )
          .optional(),
        bundleTitle: z.string().optional(),
        bundleText: z.string().optional(),
        bundleCta: z.string().optional(),
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
        /** Feature triple below the steps. */
        features: z
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
    /** Frequently asked questions (expandable accordion). */
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
        trustItems: z.array(z.string()).optional(),
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
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
        disclaimer: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      leads: table({
        email: string(),
        zip: string(),
        product: string(),
      }),
    },
    queries: {
      leads: ({ db }) => db.leads.orderBy("createdAt").all(),
    },
    mutations: {
      submitLead: ({ db }, email: string, zip: string, product: string) => {
        db.leads.insert({ email, zip, product })
        return db.leads.orderBy("createdAt").all()
      },
      removeLead: ({ db }, id: string) => {
        db.leads.delete(id)
        return db.leads.orderBy("createdAt").all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [leadsOpen, setLeadsOpen] = useState(false)
    const [leadEmail, setLeadEmail] = useState("")
    const [selectedProduct, setSelectedProduct] = useState(0)
    const [zipValue, setZipValue] = useState("")

    // Lakebed
    const storedLeads = lakebed.useQuery("leads")
    const submitLead = lakebed.useMutation("submitLead")
    const removeLead = lakebed.useMutation("removeLead")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase())
        .join("") || "ME"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const safeLeads = storedLeads ?? []
    const leadsCount = safeLeads.length
    const brand = props.brand ?? "ShieldCover"
    const nav = props.nav?.length
      ? props.nav
      : ["Coverage", "How It Works", "Reviews", "FAQ"]

    const phone = "1-800-555-0199"

    const heroRatingPill =
      props.hero?.ratingPill ?? "Rated 4.9/5 by 50,000+ customers"
    const heroBefore = props.hero?.headingBefore ?? "Insurance That"
    const heroHighlight = props.hero?.highlight ?? "Puts You First"
    const heroSub =
      props.hero?.subheading ??
      "Comprehensive coverage for your home, car, life, and business. Join over 2 million Americans who trust ShieldCover for protection that actually pays when you need it most."
    const heroPrimary = props.hero?.primaryCta ?? "Get Your Free Quote"
    const heroSecondary = props.hero?.secondaryCta ?? "See Coverage Options"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Happy family standing outside their new home with keys"
    const heroTrust = props.hero?.trustItems?.length
      ? props.hero.trustItems
      : ["2-minute quote", "24/7 claims", "Save up to 25%"]
    const formTitle = props.hero?.formTitle ?? "Start Your Quote"
    const formSubtitle =
      props.hero?.formSubtitle ?? "Takes just 2 minutes — no phone calls required"
    const formProducts = props.hero?.formProducts?.length
      ? props.hero.formProducts
      : ["Home", "Auto", "Life", "Business"]
    const formZipPlaceholder = props.hero?.formZipPlaceholder ?? "Enter ZIP code"
    const formSubmit = props.hero?.formSubmit ?? "Get My Quote Now"
    const formFootnote =
      props.hero?.formFootnote ?? "Your information is secure and encrypted"

    const logosLabel =
      props.logos?.label ??
      "Trusted by leading organizations and rated by top industry authorities"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Fortune 500",
          "A.M. Best A+",
          "BBB A+ Rated",
          "JD Power",
          "Trustpilot",
          "Forbes Best",
        ]

    const coverageEyebrow = props.coverage?.eyebrow ?? "Coverage Options"
    const coverageHeading =
      props.coverage?.heading ?? "Protection for Every Part of Your Life"
    const coverageDesc =
      props.coverage?.description ??
      "From your first apartment to your dream home, from your daily commute to your family's future — we've got you covered with customizable plans starting as low as $22/month."
    const coverageItems = props.coverage?.items?.length
      ? props.coverage.items
      : [
          {
            title: "Home Insurance",
            description:
              "Protect your home and belongings from fire, theft, storms, and more. Coverage starts at $35/month with $0 deductible options available.",
            features: [
              "Dwelling coverage up to $2M",
              "Personal property protection",
              "Liability coverage included",
            ],
            cta: "Get home quote",
          },
          {
            title: "Auto Insurance",
            description:
              "Full coverage for all vehicle types with roadside assistance included. Save up to 25% when you bundle with home insurance.",
            features: [
              "Collision & comprehensive",
              "24/7 roadside assistance",
              "Rental car reimbursement",
            ],
            cta: "Get auto quote",
          },
          {
            title: "Life Insurance",
            description:
              "Secure your family's financial future with term or whole life policies. No medical exam required for coverage up to $500K.",
            features: [
              "Term: 10-30 year options",
              "Whole life cash value",
              "Spouse & child riders",
            ],
            cta: "Get life quote",
          },
          {
            title: "Business Insurance",
            description:
              "Complete protection for businesses of all sizes. General liability, workers' comp, professional liability, and cyber coverage.",
            features: [
              "General liability ($1M-$5M)",
              "Workers' compensation",
              "Cyber liability included",
            ],
            cta: "Get business quote",
          },
        ]
    const bundleTitle = props.coverage?.bundleTitle ?? "Bundle & Save"
    const bundleText =
      props.coverage?.bundleText ?? "Save up to 25% when you bundle home + auto"
    const bundleCta = props.coverage?.bundleCta ?? "Calculate Savings"

    const stepsEyebrow = props.steps?.eyebrow ?? "Simple Process"
    const stepsHeading = props.steps?.heading ?? "Get Covered in 3 Easy Steps"
    const stepsDesc =
      props.steps?.description ??
      "No paperwork. No waiting on hold. No pushy sales tactics. Just fast, honest coverage you can count on."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Get Your Quote",
            description:
              "Answer a few simple questions about your needs. Our AI-powered system finds you the best coverage options in under 2 minutes.",
          },
          {
            title: "Customize Your Plan",
            description:
              "Adjust coverage limits, deductibles, and add-ons to fit your budget. See exactly what you're paying for with transparent pricing.",
          },
          {
            title: "You're Protected",
            description:
              "Coverage starts immediately. Download your proof of insurance and access your digital ID cards right from our mobile app.",
          },
        ]
    const stepFeatures = props.steps?.features?.length
      ? props.steps.features
      : [
          {
            title: "Instant Coverage",
            description: "No waiting periods for most policies",
          },
          {
            title: "Mobile App",
            description: "File claims, view ID cards, pay bills",
          },
          {
            title: "24/7 Support",
            description: "Real humans, always available",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2M+", label: "Active Policies" },
          { value: "$850M", label: "Claims Paid (2025)" },
          { value: "4.9/5", label: "Customer Rating" },
          { value: "<2min", label: "Average Quote Time" },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Customer Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by Over 2 Million Customers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it — here's what real customers say about their experience with ShieldCover."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "When a pipe burst in our basement at 2 AM, ShieldCover had an adjuster at our house by 9 AM. The claim was processed and we had our check within 5 days. Absolutely incredible service.",
            name: "Sarah Mitchell",
            role: "Homeowner, Denver CO",
            avatarAlt:
              "Professional headshot of Sarah Mitchell, a smiling female homeowner in her 40s",
          },
          {
            quote:
              "I was skeptical about switching from my old insurer, but ShieldCover beat their price by $480/year with better coverage. The mobile app makes managing everything so easy.",
            name: "James Rodriguez",
            role: "Auto & Home Bundle, Austin TX",
            avatarAlt:
              "Professional headshot of James Rodriguez, a smiling male customer in his 30s with glasses",
          },
          {
            quote:
              "After my car accident, I was stressed and overwhelmed. The claims team walked me through every step, arranged my rental car, and made sure I was taken care of. Truly went above and beyond.",
            name: "Priya Patel",
            role: "Auto Insurance, Miami FL",
            avatarAlt:
              "Professional headshot of Priya Patel, a smiling female customer with dark hair",
          },
          {
            quote:
              "As a small business owner, I needed liability coverage fast for a new contract. ShieldCover had me covered same day. Their business team understands entrepreneur needs.",
            name: "Marcus Chen",
            role: "Business Owner, Seattle WA",
            avatarAlt:
              "Professional headshot of Marcus Chen, a smiling male business owner in his 40s",
          },
          {
            quote:
              "Getting life insurance felt daunting, but the agent made it simple. No pressure, clear explanations, and I got a $1M policy without a medical exam. Peace of mind for my family.",
            name: "Emily Thompson",
            role: "Life Insurance, Chicago IL",
            avatarAlt:
              "Professional headshot of Emily Thompson, a smiling female customer in her 30s with light brown hair",
          },
          {
            quote:
              "Been with ShieldCover for 8 years now. Filed two claims, both handled flawlessly. Loyalty discounts keep my rates competitive. Customer for life!",
            name: "David Wilson",
            role: "10-Year Customer, Phoenix AZ",
            avatarAlt:
              "Professional headshot of David Wilson, a smiling male customer with gray beard in his 50s",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about ShieldCover insurance."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How quickly can I get coverage?",
            answer:
              "Most policies take effect immediately upon purchase. For auto insurance, you'll have proof of coverage within minutes to show the DMV. Home insurance can be bound the same day, and life insurance without medical exams activates instantly. Coverage with required medical exams typically takes 2-4 weeks.",
          },
          {
            question: "What discounts are available?",
            answer:
              "We offer numerous ways to save: bundle home + auto for up to 25% off, safe driver discounts up to 20%, claims-free discounts, loyalty rewards, smart home device credits, paperless billing discounts, and more. Request a quote to see all discounts you qualify for.",
          },
          {
            question: "How does the claims process work?",
            answer:
              "File claims 24/7 through our mobile app, online portal, or by calling 1-800-555-0199. Most auto claims are processed within 24-48 hours. Home claims are assigned a dedicated adjuster who inspects damage within 48 hours. We offer direct deposit for faster payouts, and you can track your claim status in real-time through the app.",
          },
          {
            question: "Can I customize my coverage limits?",
            answer:
              "Absolutely. Every policy is fully customizable. Adjust deductibles from $0 to $5,000+, set liability limits from state minimums up to $5 million, add or remove coverage options, and tailor everything to your specific needs and budget. Our agents help you find the sweet spot between protection and affordability.",
          },
          {
            question: "Is my personal information secure?",
            answer:
              "Yes. We use bank-level 256-bit SSL encryption for all data transmission. We're SOC 2 Type II certified, comply with all state and federal privacy regulations, and never sell your data to third parties. Our security team continuously monitors for threats and we conduct regular third-party penetration testing.",
          },
          {
            question: "What happens if I need to cancel?",
            answer:
              "You can cancel anytime with no cancellation fees. We'll refund any unused premium on a prorated basis. Most refunds are processed within 5-10 business days. If you're canceling due to finding better rates elsewhere, let us know — we often can match or beat competitor pricing to keep you covered.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Get Covered?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2 million+ satisfied customers. Get your personalized quote in under 2 minutes — no spam, no pressure, just honest coverage."
    const ctaPrimary = props.cta?.primaryCta ?? "Get My Free Quote"
    const ctaPhone = props.cta?.phoneCta ?? phone
    const ctaTrust = props.cta?.trustItems?.length
      ? props.cta.trustItems
      : [
          "2-minute quote process",
          "No credit check required",
          "Cancel anytime",
        ]

    const footerTagline =
      props.footer?.tagline ??
      "Protecting what matters most since 2008. Fast quotes, fair prices, and a claims team that actually has your back."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Insurance",
            links: [
              "Home Insurance",
              "Auto Insurance",
              "Life Insurance",
              "Business Insurance",
              "Renters Insurance",
              "Motorcycle Insurance",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Careers",
              "Press",
              "Agent Finder",
              "Partner With Us",
              "Contact",
            ],
          },
          {
            title: "Support",
            links: [
              "File a Claim",
              "Claims Status",
              "Policy Documents",
              "Make a Payment",
              "FAQ",
              "Help Center",
            ],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "Instagram", "LinkedIn"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Insurance. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings", "Accessibility"]
    const footerDisclaimer =
      props.footer?.disclaimer ??
      `${brand} Insurance products are underwritten by ${brand} Insurance Company and affiliated insurers. Not available in all states. Coverage subject to terms, conditions, and exclusions. Discounts vary by state and coverage type.`

    // Shield brand mark (decorative brand asset).
    const Shield = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground",
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
          <path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z" />
          <path d="M9 12l2 2 4-4" />
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

    const CheckCircle = ({ className }: { className?: string }) => (
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
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
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

    const Lock = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
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
        <path d="M6 9l6 6 6-6" />
      </svg>
    )

    // Coverage icons — line icons rotating through token accents per card.
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
        <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
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
        <path d="M5 17h14M7 17a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0z" />
        <path d="M5 17l1.5-6A2 2 0 018.4 9.5h7.2a2 2 0 011.9 1.5L19 17" />
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
        <path d="M3 12h3l2 5 4-12 2 7h7" />
      </svg>,
      <svg
        key="business"
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
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>,
    ]

    // Per-card token accent classes for the coverage grid (rotating set).
    const coverageAccents = [
      { tile: "bg-primary/10 text-primary group-hover:bg-primary", link: "text-primary" },
      { tile: "bg-accent/40 text-accent-foreground group-hover:bg-accent", link: "text-accent-foreground" },
      { tile: "bg-chart-2/15 text-chart-2 group-hover:bg-chart-2", link: "text-chart-2" },
      { tile: "bg-chart-4/15 text-chart-4 group-hover:bg-chart-4", link: "text-chart-4" },
    ]

    const stepFeatureTiles = [
      "bg-primary/10 text-primary",
      "bg-accent/40 text-accent-foreground",
      "bg-chart-2/15 text-chart-2",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <Shield className="size-10" />
                <span className="text-2xl font-bold text-foreground">
                  {brand.replace("Cover", "")}
                  <span className="text-primary">Cover</span>
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
              <div className="hidden items-center gap-4 md:flex">
                <button
                  type="button"
                  onClick={() => go(phone)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Phone className="size-4 text-primary" />
                  {phone}
                </button>
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open account menu"
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                      >
                        <Avatar size="sm" className="ring-2 ring-background" aria-hidden="true">
                          {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                          {authDisplayName}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" sideOffset={10} className="w-64 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl">
                      <div className="bg-muted/40 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg" className="ring-2 ring-background">
                            {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                            <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                              {authInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">{authDisplayName}</p>
                            <p className="truncate text-xs text-muted-foreground">{authEmail ?? "Signed in"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
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
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    aria-label="Sign in with Google"
                    className="hidden h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-foreground text-xs font-black text-background">G</span>
                    <span>{authLabel}</span>
                  </button>
                )}
                {/* Leads drawer trigger */}
                <Sheet open={leadsOpen} onOpenChange={setLeadsOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="View quote requests"
                      className="relative rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:scale-105 hover:bg-accent/90"
                    >
                      Get My Quote
                      {leadsCount > 0 && (
                        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {leadsCount}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Quote Requests</SheetTitle>
                      <SheetDescription>
                        {leadsCount > 0
                          ? `${leadsCount} quote request${leadsCount === 1 ? "" : "s"} submitted this session.`
                          : "No quote requests yet. Fill in the form to get started."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeLeads.length > 0 ? (
                        <div className="space-y-4">
                          {safeLeads.map((lead) => (
                            <div key={lead.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted p-4">
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground">{lead.product} Insurance</p>
                                <p className="text-sm text-muted-foreground">{lead.email || "No email provided"}</p>
                                <p className="text-sm text-muted-foreground">ZIP: {lead.zip || "—"}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void removeLead(lead.id)}
                                className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">No quote requests</p>
                          <p className="mt-2 text-sm text-muted-foreground">Submit a quote request using the form on this page.</p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <SheetClose asChild>
                        <Button type="button" variant="secondary" className="w-full rounded-full">
                          Close
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="text-foreground md:hidden"
              >
                <svg
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
                  <path d="M4 6h16M4 12h16M4 18h16" />
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
                          {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">{authDisplayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{authEmail ?? "Signed in"}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => { setMobileOpen(false); handleSignOut() }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => { setMobileOpen(false); handleSignIn() }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">G</span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero — dark gradient band with inline quote form */}
          <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground to-foreground/90 pt-20 pb-16 lg:pt-28 lg:pb-28">
            <div aria-hidden="true" className="absolute inset-0 opacity-20">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/80 to-transparent"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-background">
                    <Star className="size-4 text-primary" />
                    {heroRatingPill}
                  </div>
                  <h1 className="mb-6 text-5xl font-black leading-tight text-background sm:text-6xl lg:text-7xl">
                    {heroBefore}{" "}
                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mb-8 text-xl leading-relaxed text-background/70">
                    {heroSub}
                  </p>
                  <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-lg font-bold text-accent-foreground shadow-xl shadow-accent/40 transition-all hover:scale-105 hover:bg-accent/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-background/20 bg-background/10 px-8 py-4 text-lg font-bold text-background backdrop-blur-sm transition-all hover:bg-background/20"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-background/60">
                    {heroTrust.map((item) => (
                      <span key={item} className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-primary" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inline quote-form card */}
                <div className="relative hidden lg:block">
                  <div
                    aria-hidden="true"
                    className="absolute -top-10 -left-10 size-72 rounded-full bg-primary/30 blur-3xl"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-10 -right-10 size-72 rounded-full bg-accent/20 blur-3xl"
                  />
                  <div className="relative rounded-3xl bg-card p-8 text-card-foreground shadow-2xl">
                    <div className="mb-6 text-center">
                      <h3 className="mb-2 text-2xl font-bold text-card-foreground">
                        {formTitle}
                      </h3>
                      <p className="text-muted-foreground">{formSubtitle}</p>
                    </div>
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault()
                        void submitLead(leadEmail, zipValue, formProducts[selectedProduct] ?? formProducts[0] ?? "Home")
                        setLeadsOpen(true)
                        setLeadEmail("")
                        setZipValue("")
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {formProducts.map((product, i) => (
                          <button
                            key={product}
                            type="button"
                            onClick={() => setSelectedProduct(i)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 font-semibold transition-all",
                              i === selectedProduct
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-primary hover:text-primary",
                            )}
                          >
                            <span className="text-base">{product}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder={formZipPlaceholder}
                        aria-label={formZipPlaceholder}
                        value={zipValue}
                        onChange={(e) => setZipValue(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-lg text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="email"
                        placeholder="Your email (optional)"
                        aria-label="Email address"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-lg text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-accent py-4 font-bold text-accent-foreground transition-all hover:scale-[1.02] hover:bg-accent/90"
                      >
                        {formSubmit}
                      </button>
                    </form>
                    <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                      <Lock className="size-3" />
                      {formFootnote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Authority / ratings logo strip */}
          <section className="border-b border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div
                    key={logo}
                    className="flex items-center justify-center text-lg font-bold text-muted-foreground"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Coverage grid */}
          <section className="bg-background py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-bold uppercase tracking-wider text-accent-foreground">
                  {coverageEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-black text-foreground sm:text-5xl">
                  {coverageHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{coverageDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {coverageItems.map((item, i) => {
                  const accent = coverageAccents[i % coverageAccents.length]
                  return (
                    <div
                      key={item.title}
                      className="group rounded-3xl border border-border bg-muted p-8 transition-all duration-300 hover:bg-card hover:shadow-2xl hover:shadow-primary/10"
                    >
                      <div
                        className={cn(
                          "mb-6 grid size-16 place-items-center rounded-2xl transition-all group-hover:scale-110 group-hover:text-background",
                          accent.tile,
                        )}
                      >
                        {coverageIcons[i % coverageIcons.length]}
                      </div>
                      <h3 className="mb-3 text-2xl font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-6 text-muted-foreground">
                        {item.description}
                      </p>
                      <ul className="mb-6 space-y-2 text-muted-foreground">
                        {item.features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <Check className={cn("size-4 shrink-0", accent.link)} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(item.cta)}
                        className={cn(
                          "flex items-center gap-2 font-bold transition-all group-hover:gap-3",
                          accent.link,
                        )}
                      >
                        {item.cta}
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="mt-16 text-center">
                <div className="inline-flex flex-col items-center gap-4 rounded-2xl bg-muted p-6 sm:flex-row">
                  <div className="flex -space-x-3">
                    {[
                      "Professional headshot of a smiling male customer in his 30s",
                      "Professional headshot of a smiling female customer with blonde hair",
                      "Professional headshot of a smiling male customer with beard",
                    ].map((alt) => (
                      <Image
                        key={alt}
                        alt={alt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-bold text-foreground">{bundleTitle}</p>
                    <p className="text-sm text-muted-foreground">{bundleText}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(bundleCta)}
                    className="rounded-xl bg-foreground px-6 py-3 font-bold text-background transition-colors hover:bg-foreground/90"
                  >
                    {bundleCta}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-bold uppercase tracking-wider text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-black text-foreground sm:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="relative grid gap-8 md:grid-cols-3">
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/3 right-1/3 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-primary via-accent to-chart-2 md:block"
                />
                {stepItems.map((step, i) => (
                  <div
                    key={step.title}
                    className="relative rounded-3xl border border-border bg-background p-8 text-center shadow-lg"
                  >
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-primary text-3xl font-black text-primary-foreground shadow-xl shadow-primary/30">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-16 grid gap-6 md:grid-cols-3">
                {stepFeatures.map((feature, i) => (
                  <div
                    key={feature.title}
                    className="flex items-center gap-4 rounded-2xl bg-background p-6 shadow-md"
                  >
                    <div
                      className={cn(
                        "grid size-14 shrink-0 place-items-center rounded-xl",
                        stepFeatureTiles[i % stepFeatureTiles.length],
                      )}
                    >
                      <CheckCircle className="size-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats strip */}
          <section className="bg-gradient-to-r from-primary to-primary/80 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-5xl font-black text-primary-foreground sm:text-6xl">
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

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-bold uppercase tracking-wider text-accent-foreground">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-black text-foreground sm:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-3xl border border-border bg-muted p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-accent-foreground">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
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
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ — expandable accordion */}
          <section className="bg-muted py-20 lg:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-3 inline-block text-sm font-bold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-black text-foreground sm:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-border bg-background shadow-md [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <h3 className="text-lg font-bold text-foreground">
                        {item.question}
                      </h3>
                      <ChevronDown className="size-6 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA — accent gradient */}
          <section className="relative overflow-hidden bg-gradient-to-br from-accent via-accent to-accent/80 py-20 lg:py-24">
            <div aria-hidden="true" className="absolute inset-0 opacity-10">
              <Image
                alt="Happy family smiling together on couch in bright living room"
                w={1920}
                h={1080}
                className="size-full object-cover"
              />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-black text-accent-foreground sm:text-5xl lg:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-accent-foreground/90 sm:text-2xl">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-10 py-5 text-lg font-black text-accent-foreground shadow-2xl transition-all hover:scale-105 hover:bg-muted"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-background/80 bg-background/10 px-10 py-5 text-lg font-bold text-accent-foreground backdrop-blur-sm transition-all hover:bg-background/20"
                >
                  <Phone className="size-5" />
                  {ctaPhone}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-accent-foreground/80">
                {ctaTrust.map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle className="size-4" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-6 flex items-center gap-2"
                >
                  <Shield className="size-10" />
                  <span className="text-2xl font-bold text-background">
                    {brand.replace("Cover", "")}
                    <span className="text-primary">Cover</span>
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-primary"
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
                  <h4 className="mb-4 font-bold text-background">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/60 transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-background/20 pt-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-background/60">{footerCopyright}</p>
                <div className="flex flex-wrap gap-6 text-sm">
                  {footerLegal.map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => go(link)}
                      className="text-background/60 transition-colors hover:text-primary"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-xs text-background/50">
                {footerDisclaimer}
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
