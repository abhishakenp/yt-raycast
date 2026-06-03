import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FintechKimiPage2 — a complete, self-contained digital-wallet / fintech LANDING page.
 *
 * TEMPLATE VARIANT 2 for the fintech category: a deliberately DISTINCT sibling to
 * FintechKimiPage. Where the first style leans on a dark security band and a static
 * card, this "Vault — Smart Digital Wallet" port is brighter and more playful: a
 * gradient-tinted hero with a floating 3D debit-card mockup framed by live "Sent to
 * Sarah / Auto-saved" notification chips, a 6-up features grid with multi-colored icon
 * tiles, a dark KPI/stats band, a numbered 3-step onboarding flow, and a signature
 * BENTO product-preview gallery (transaction feed, monthly-spend bar chart, virtual-card
 * freeze/delete controls, and a bill-splitting mockup). It closes with a 3-tier pricing
 * table (Free / Most-Popular Pro / Business), a 5-star testimonial grid with avatars, an
 * accordion FAQ, a dark conversion CTA band, and a 5-column footer with social links.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item / CTA /
 * link / social / form submit routes through `useNavigate` (never a dead "#"). All
 * content imagery uses the alt-driven <Image> component (never a raw src). Callers supply
 * ONLY content data; rich defaults make it render great with no props at all.
 */
export const FintechKimiPage2 = defineComponent({
  name: "FintechKimiPage2",
  description:
    "Second/alternative fintech LANDING page style (a visually DISTINCT sibling to FintechKimiPage) for a digital wallet / neobank / payments / money app — brighter and more playful than the first variant. Hero is a gradient-tinted 2-column layout with an 'instant payouts' status pill, a 'Your Money, Simplified' gradient headline, dual CTAs, a 4.9-star trust badge, and a floating 3D debit/credit-card mockup surrounded by live notification chips ('Sent to Sarah $240', 'Auto-saved this week $128.40'). Includes a trusted-by logo strip; a 6-up features grid with multi-colored rounded icon tiles (bank-level security, instant transfers, smart analytics, virtual cards, multi-currency, bill splitting); a dark KPI/stats band ($4.2B+ processed, 2M+ users, 99.99% uptime, 4.9 rating); a numbered 3-step get-started flow; a signature BENTO product-preview gallery showing in-app UI mockups (instant transaction feed, monthly-spend bar chart, one-tap virtual-card freeze/delete controls, effortless bill-splitting); a 3-tier pricing table (Free, a highlighted Most-Popular Pro, Business) with checkmark feature lists; a 3-card 5-star testimonial grid with headshot avatars; an accordion FAQ (FDIC, transfer speed, currencies, international use, lost phone, hidden fees); a dark conversion CTA band; and a 5-column footer with social icons and legal disclosures. Use as the ROOT/home page for fintech apps, neobanks, digital wallets, money/payments/savings products, or any finance startup wanting a clean, conversion-focused marketing page — pick this variant when you want a lighter, bento-driven, card-forward look distinct from the dark security-band first style. Supply content only; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content + the floating debit-card visual and notification chips. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        rating: z.string().optional(),
        cardName: z.string().optional(),
        cardNumber: z.string().optional(),
        cardHolder: z.string().optional(),
        cardExpires: z.string().optional(),
        chipSentLabel: z.string().optional(),
        chipSentValue: z.string().optional(),
        chipSavedLabel: z.string().optional(),
        chipSavedValue: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Features grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark KPI / stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered 3-step onboarding flow. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Bento product-preview gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        feedCaption: z.string().optional(),
        feedRows: z
          .array(z.object({ amount: z.string(), incoming: z.boolean() }))
          .optional(),
        analyticsCaption: z.string().optional(),
        analyticsTitle: z.string().optional(),
        analyticsPeriod: z.string().optional(),
        analyticsBars: z.array(z.number()).optional(),
        cardCaption: z.string().optional(),
        cardLast4: z.string().optional(),
        splitCaption: z.string().optional(),
        splitTitle: z.string().optional(),
        splitRows: z
          .array(z.object({ name: z.string(), status: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-tier pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
              features: z.array(z.string()).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Star-rated testimonial grid. */
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
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark conversion CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
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
        disclosure: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Vault"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with instant payouts"
    const heroLead = props.hero?.headingLead ?? "Your Money,"
    const heroAccent = props.hero?.headingAccent ?? "Simplified"
    const heroSub =
      props.hero?.subheading ??
      "A smart digital wallet that brings all your accounts, cards, and payments into one secure place. Send, spend, and save with confidence."
    const heroPrimary = props.hero?.primaryCta ?? "Get Started Free"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const heroRating = props.hero?.rating ?? "Trusted by 2M+ users worldwide"
    const cardName = props.hero?.cardName ?? brand
    const cardNumber = props.hero?.cardNumber ?? "4582 8910 3746 2105"
    const cardHolder = props.hero?.cardHolder ?? "Alex Morgan"
    const cardExpires = props.hero?.cardExpires ?? "09/28"
    const chipSentLabel = props.hero?.chipSentLabel ?? "Sent to Sarah"
    const chipSentValue = props.hero?.chipSentValue ?? "$240.00"
    const chipSavedLabel = props.hero?.chipSavedLabel ?? "Auto-saved this week"
    const chipSavedValue = props.hero?.chipSavedValue ?? "$128.40"

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Figma", "Vercel", "Linear", "Mercury"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need in one wallet"
    const featuresDesc =
      props.features?.description ??
      "Powerful tools designed to give you complete control over your finances — without the complexity of traditional banking."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Bank-Level Security",
            description:
              "AES-256 encryption, biometric authentication, and real-time fraud monitoring keep your money protected around the clock.",
          },
          {
            title: "Instant Transfers",
            description:
              "Move money in seconds, not days. Zero fees when sending between Vault users anywhere in the world.",
          },
          {
            title: "Smart Analytics",
            description:
              "AI-powered spending insights and automated budgeting that learns your habits and helps you save effortlessly.",
          },
          {
            title: "Virtual Cards",
            description:
              "Generate disposable virtual cards for safer online shopping. Freeze, unfreeze, or delete them instantly.",
          },
          {
            title: "Multi-Currency",
            description:
              "Hold 50+ currencies with real exchange rates and zero hidden fees. Travel and transact like a local.",
          },
          {
            title: "Bill Splitting",
            description:
              "Split bills instantly with friends and family, even if they are not on Vault yet. No awkward reminders needed.",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$4.2B+", label: "Transactions Processed" },
          { value: "2M+", label: "Active Users" },
          { value: "99.99%", label: "Uptime SLA" },
          { value: "4.9", label: "App Store Rating" },
        ]

    const stepsHeading = props.steps?.heading ?? "Get started in minutes"
    const stepsDesc =
      props.steps?.description ??
      "No branches, no paperwork, no waiting. Open your account and start transacting faster than ever before."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Download & Sign Up",
            description:
              "Create your account in under 3 minutes with just your email and phone number. No credit check required.",
          },
          {
            title: "Link Your Accounts",
            description:
              "Securely connect your existing bank cards and accounts using industry-standard open banking APIs.",
          },
          {
            title: "Start Transacting",
            description:
              "Send money, pay bills, create virtual cards, and track spending in real time from one dashboard.",
          },
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Built for how you actually spend"
    const galleryDesc =
      props.gallery?.description ??
      "Clean interfaces, instant actions, and powerful insights that make managing money feel effortless."
    const feedCaption = props.gallery?.feedCaption ?? "Instant transaction feed"
    const feedRows = props.gallery?.feedRows?.length
      ? props.gallery.feedRows
      : [
          { amount: "+$450.00", incoming: true },
          { amount: "-$28.50", incoming: false },
          { amount: "+$1,200", incoming: true },
          { amount: "-$84.00", incoming: false },
          { amount: "-$12.99", incoming: false },
        ]
    const analyticsCaption = props.gallery?.analyticsCaption ?? "Smart analytics"
    const analyticsTitle = props.gallery?.analyticsTitle ?? "Monthly Spend"
    const analyticsPeriod = props.gallery?.analyticsPeriod ?? "Oct 2025"
    const analyticsBars = props.gallery?.analyticsBars?.length
      ? props.gallery.analyticsBars
      : [40, 65, 45, 80, 55, 70, 60]
    const cardCaption = props.gallery?.cardCaption ?? "One-tap card controls"
    const cardLast4 = props.gallery?.cardLast4 ?? "•••• 4821"
    const splitCaption = props.gallery?.splitCaption ?? "Effortless bill splitting"
    const splitTitle = props.gallery?.splitTitle ?? "Split $142.50"
    const splitRows = props.gallery?.splitRows?.length
      ? props.gallery.splitRows
      : [
          { name: "You", status: "$47.50" },
          { name: "Marcus", status: "Pending" },
          { name: "Priya", status: "Pending" },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and scale as you grow. No hidden fees, no long-term contracts, cancel anytime."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Free",
            tagline: "For personal use",
            price: "$0",
            period: "/ month",
            cta: "Get Started",
            featured: false,
            features: [
              "Basic digital wallet",
              "3 virtual cards",
              "Standard bank transfers",
              "Spending summaries",
              "Email support",
            ],
          },
          {
            name: "Pro",
            tagline: "For power users",
            price: "$9.99",
            period: "/ month",
            cta: "Start Pro Trial",
            featured: true,
            badge: "Most Popular",
            features: [
              "Unlimited virtual cards",
              "Instant transfers",
              "Advanced AI analytics",
              "Multi-currency accounts",
              "Priority chat support",
            ],
          },
          {
            name: "Business",
            tagline: "For teams & companies",
            price: "$29.99",
            period: "/ month",
            cta: "Contact Sales",
            featured: false,
            features: [
              "Everything in Pro",
              "Up to 10 team accounts",
              "API access",
              "Custom integrations",
              "Dedicated account manager",
            ],
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by thousands"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Do not take our word for it. Here is what real users say about managing money with Vault."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Vault replaced three apps I used daily. The instant transfers alone saved me hours every month, and the virtual cards make online shopping so much safer.",
            name: "Sarah Chen",
            role: "Freelance Designer",
            avatarAlt:
              "Professional headshot of Sarah Chen, a smiling woman with dark hair",
          },
          {
            quote:
              "Finally, a financial app that actually understands how businesses move money. The analytics are incredible and the API let us automate our entire payout flow.",
            name: "Marcus Johnson",
            role: "Small Business Owner",
            avatarAlt:
              "Professional headshot of Marcus Johnson, a smiling man with short beard",
          },
          {
            quote:
              "The security features give me real peace of mind. I create a new virtual card for every subscription now. If one gets leaked, I just delete it. Game changer.",
            name: "Priya Sharma",
            role: "Software Engineer",
            avatarAlt:
              "Professional headshot of Priya Sharma, a smiling woman with long dark hair",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about Vault. Can not find what you are looking for? Reach out to our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is my money FDIC insured?",
            answer:
              "Yes. Funds held in your Vault account are deposited with our partner banks and are insured up to $250,000 per depositor through the Federal Deposit Insurance Corporation (FDIC). Your money is safe and fully protected.",
          },
          {
            question: "How quickly can I transfer money?",
            answer:
              "Internal transfers between Vault users are instant, 24/7. External bank transfers typically complete within 1-2 business days. Pro and Business users also get access to same-day ACH and real-time payment rails where available.",
          },
          {
            question: "What currencies are supported?",
            answer:
              "We support over 50 currencies including USD, EUR, GBP, JPY, AUD, CAD, CHF, SGD, and more. You can hold, exchange, and transact in multiple currencies with real mid-market exchange rates and no hidden markup.",
          },
          {
            question: "Can I use Vault outside the US?",
            answer:
              "Absolutely. Vault is available in 40+ countries with local payment rails in major markets. You can send and receive money internationally, use your card abroad, and access local account details in the US, UK, EU, and Australia.",
          },
          {
            question: "What happens if I lose my phone?",
            answer:
              "Your account remains secure. You can instantly freeze all activity from any web browser at vault.com/security. Once you get a new device, simply reinstall the app and verify your identity to regain access. All funds and transaction history remain intact.",
          },
          {
            question: "Are there any hidden fees?",
            answer:
              "Never. We believe in complete transparency. Free accounts have zero monthly fees. Pro and Business plans show exactly what you pay upfront. We do not charge for card replacements, in-network ATM withdrawals, or account inactivity. See our full fee schedule for details.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to take control of your money?"
    const ctaDesc =
      props.cta?.description ??
      "Join 2 million users who have already switched to smarter banking. No credit check, no hidden fees, no stress."
    const ctaPrimary = props.cta?.primaryCta ?? "Create Free Account"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"

    const footerTagline =
      props.footer?.tagline ??
      "The modern digital wallet that brings all your accounts, cards, and payments into one secure place."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Security", "Business", "API Docs"],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Blog", "Press", "Partners"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "Status",
              "Privacy Policy",
              "Terms of Service",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Financial Inc. All rights reserved.`
    const footerDisclosure =
      props.footer?.disclosure ??
      "Vault is a financial technology company, not a bank."

    // Brand logo tile — gradient brand square with a shield icon (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[55%]"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
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
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0 transition-transform group-open:rotate-180"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    // Feature icon set — rotate tokenized accent tiles, never raw palette.
    const featureIcons: ReactNode[] = [
      // lock (security)
      <svg
        key="lock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </svg>,
      // bolt (instant transfers)
      <svg
        key="bolt"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M13 2L3 14h7v8l10-12h-7z" />
      </svg>,
      // chart-pie (analytics)
      <svg
        key="pie"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M21 15.5A9 9 0 118.5 3v9.5H21z" />
        <path d="M12 2a9 9 0 019 9h-9z" />
      </svg>,
      // card (virtual cards)
      <svg
        key="card"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>,
      // globe (multi-currency)
      <svg
        key="globe"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" />
      </svg>,
      // users (bill splitting)
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>,
    ]

    // Tokenized tints for the multi-colored feature icon tiles (maps the HTML's
    // brand/blue/purple/orange/teal/rose set onto theme tokens + chart colors).
    const featureTints = [
      "bg-primary/10 text-primary",
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
    ]

    const socialIcons: { label: string; path: ReactNode }[] = [
      {
        label: "Twitter",
        path: (
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        ),
      },
      {
        label: "LinkedIn",
        path: (
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        ),
      },
      {
        label: "GitHub",
        path: (
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        ),
      },
      {
        label: "Instagram",
        path: (
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        ),
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
                aria-label={`${brand} home`}
              >
                <LogoMark className="size-8" />
                <span>{brand}</span>
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
              <div className="hidden items-center gap-3 md:flex">
                <button
                  type="button"
                  onClick={() => go("Log in")}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                >
                  Get Started
                </button>
              </div>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                aria-label="Get started"
                className="grid size-10 place-items-center rounded-lg text-foreground md:hidden"
              >
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
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </nav>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-20 pt-16 lg:pt-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="M13 2L3 14h7v8l10-12h-7z" />
                    </svg>
                    <span>{heroBadge}</span>
                  </div>
                  <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                    {heroLead}{" "}
                    <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                      {heroAccent}
                    </span>
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-xl border-2 border-border px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span
                      className="flex text-primary"
                      aria-label="4.9 out of 5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-4" />
                      ))}
                    </span>
                    <span>{heroRating}</span>
                  </div>
                </div>

                {/* Floating debit-card visual with notification chips */}
                <div className="relative flex justify-center">
                  <div
                    aria-hidden="true"
                    className="absolute -right-4 top-8 size-56 rounded-full bg-primary/15 blur-3xl"
                  />
                  <div
                    className="relative aspect-[1.6] w-full max-w-sm rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-7 text-primary-foreground shadow-2xl"
                    role="img"
                    aria-label={`${brand} virtual debit card with chip and card number`}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-foreground/15 to-transparent" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="relative h-7 w-10 overflow-hidden rounded bg-gradient-to-br from-chart-4 to-chart-5">
                          <span className="absolute left-0 right-0 top-1/2 h-px bg-background/30" />
                          <span className="absolute bottom-0 left-1/2 top-0 w-px bg-background/30" />
                        </div>
                        <span className="text-lg font-extrabold tracking-tight">
                          {cardName}
                        </span>
                      </div>
                      <div className="mt-6 font-mono text-xl tracking-widest text-primary-foreground/90">
                        {cardNumber}
                      </div>
                      <div className="mt-auto flex items-end justify-between text-xs uppercase tracking-wider text-primary-foreground/70">
                        <div>
                          <div className="mb-1 text-[10px] text-primary-foreground/60">
                            Card Holder
                          </div>
                          <div>{cardHolder}</div>
                        </div>
                        <div>
                          <div className="mb-1 text-[10px] text-primary-foreground/60">
                            Expires
                          </div>
                          <div>{cardExpires}</div>
                        </div>
                        <div className="text-lg font-serif italic text-primary-foreground/80">
                          VISA
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute -right-2 -top-4 rounded-xl bg-card px-4 py-3 text-card-foreground shadow-xl sm:-right-4"
                    aria-hidden="true"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-4"
                        >
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">
                          {chipSentLabel}
                        </div>
                        <div className="font-bold text-primary">
                          {chipSentValue}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute -left-4 bottom-8 rounded-xl bg-card px-4 py-3 text-card-foreground shadow-xl sm:-left-8"
                    aria-hidden="true"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-chart-1/15 text-chart-1">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-4"
                        >
                          <path d="M19 5h-2a2 2 0 00-2 2v0a4 4 0 00-4-4 9 9 0 00-9 9c0 2.5 1 4 3 5v2a1 1 0 001 1h2a1 1 0 001-1v-1h4v1a1 1 0 001 1h2a1 1 0 001-1v-2c.6-.5 1-1 1-1h2a1 1 0 001-1v-3a1 1 0 00-1-1z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">
                          {chipSavedLabel}
                        </div>
                        <div className="font-bold text-foreground">
                          {chipSavedValue}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted/50 py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                {logosItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-xl font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted/50 p-8 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        "mb-5 grid size-14 place-items-center rounded-xl text-xl transition-transform group-hover:scale-110",
                        featureTints[i % featureTints.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground lg:py-24">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-accent/20 blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
                {statsItems.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                      {stat.value}
                    </div>
                    <div className="font-medium text-primary-foreground/60">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {stepItems.map((step, i) => (
                  <article
                    key={step.title}
                    className="rounded-2xl border border-border bg-card p-8 text-card-foreground transition-all hover:border-transparent hover:shadow-xl"
                  >
                    <div className="mb-5 grid size-14 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-foreground text-xl font-extrabold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery — bento product preview */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Transaction feed (wide) */}
                <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 p-8 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl md:col-span-2">
                  <div
                    className="w-full max-w-xs space-y-4 rounded-xl bg-card p-5 shadow-lg"
                    role="img"
                    aria-label="Recent transactions list showing incoming and outgoing payments"
                  >
                    {feedRows.map((row, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="size-10 shrink-0 rounded-full bg-gradient-to-br from-primary/30 to-chart-1/30" />
                        <span
                          className={cn(
                            "h-2.5 flex-1 rounded-full bg-muted",
                            !row.incoming && "max-w-[60%]",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-bold",
                            row.incoming ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {row.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="absolute bottom-4 left-4 rounded-lg bg-card/90 px-3 py-1.5 text-sm font-semibold text-foreground backdrop-blur-sm">
                    {feedCaption}
                  </span>
                </div>

                {/* Monthly spend bar chart */}
                <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 p-8 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl">
                  <div
                    className="w-full max-w-xs rounded-xl bg-card p-5 shadow-lg"
                    role="img"
                    aria-label="Monthly spending analytics bar chart"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">
                        {analyticsTitle}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {analyticsPeriod}
                      </span>
                    </div>
                    <div className="flex h-16 items-end gap-1.5">
                      {analyticsBars.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-full bg-gradient-to-t from-primary to-primary/60"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="absolute bottom-4 left-4 rounded-lg bg-card/90 px-3 py-1.5 text-sm font-semibold text-foreground backdrop-blur-sm">
                    {analyticsCaption}
                  </span>
                </div>

                {/* Virtual card controls */}
                <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 p-8 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl">
                  <div
                    className="w-full max-w-xs rounded-xl bg-card p-5 shadow-lg"
                    role="img"
                    aria-label="Virtual card management interface with freeze and delete controls"
                  >
                    <div className="mb-4 flex h-20 items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 px-4 text-primary-foreground">
                      <span className="mr-auto text-[10px] text-primary-foreground/70">
                        Virtual Card
                      </span>
                      <span className="text-xs font-bold">{cardLast4}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        Freeze
                      </div>
                      <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                        Delete
                      </div>
                    </div>
                  </div>
                  <span className="absolute bottom-4 left-4 rounded-lg bg-card/90 px-3 py-1.5 text-sm font-semibold text-foreground backdrop-blur-sm">
                    {cardCaption}
                  </span>
                </div>

                {/* Bill splitting (wide) */}
                <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 p-8 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl md:col-span-2">
                  <div
                    className="w-full max-w-sm rounded-xl bg-card p-5 shadow-lg"
                    role="img"
                    aria-label="Bill splitting interface showing a total split between three people"
                  >
                    <div className="mb-4 text-sm font-bold text-foreground">
                      {splitTitle}
                    </div>
                    <div className="space-y-3">
                      {splitRows.map((row, i) => (
                        <div key={row.name} className="flex items-center gap-3">
                          <span
                            className={cn(
                              "size-8 shrink-0 rounded-full bg-gradient-to-br",
                              i === 0
                                ? "from-primary/30 to-chart-1/30"
                                : i === 1
                                  ? "from-chart-1/30 to-chart-2/30"
                                  : "from-chart-2/30 to-chart-5/30",
                            )}
                          />
                          <span className="text-sm font-semibold text-foreground">
                            {row.name}
                          </span>
                          <span
                            className={cn(
                              "ml-auto text-sm",
                              i === 0
                                ? "font-bold text-primary"
                                : "text-muted-foreground",
                            )}
                          >
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="absolute bottom-4 left-4 rounded-lg bg-card/90 px-3 py-1.5 text-sm font-semibold text-foreground backdrop-blur-sm">
                    {splitCaption}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl bg-card p-8 text-card-foreground transition-all",
                      plan.featured
                        ? "border-2 border-primary shadow-xl shadow-primary/10"
                        : "border border-border hover:shadow-xl",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent-foreground px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                        {plan.badge ?? "Most Popular"}
                      </div>
                    )}
                    <div className="mb-1 text-lg font-bold text-foreground">
                      {plan.name}
                    </div>
                    <div className="mb-5 text-sm text-muted-foreground">
                      {plan.tagline}
                    </div>
                    <div className="mb-6 text-5xl font-extrabold text-foreground">
                      {plan.price}{" "}
                      <span className="text-base font-medium text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {(plan.features ?? []).map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <Check className="size-4 shrink-0 text-primary" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                          : "border-2 border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted/50 p-8 transition-all hover:border-transparent hover:shadow-xl"
                  >
                    <div
                      className="mb-4 flex gap-1 text-primary"
                      aria-label="5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-left font-semibold text-foreground transition-colors hover:bg-muted">
                      <span>{item.question}</span>
                      <span className="text-muted-foreground">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20 text-primary-foreground lg:py-28">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 size-96 rounded-full bg-accent/25 blur-3xl"
            />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-primary-foreground/70 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center rounded-xl bg-primary-foreground px-8 py-4 text-base font-semibold text-primary shadow-xl transition-colors hover:bg-primary-foreground/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center rounded-xl border-2 border-primary-foreground/25 px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:border-primary-foreground/40 hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-primary py-16 text-primary-foreground/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 text-xl font-extrabold text-primary-foreground"
                >
                  <LogoMark className="size-8" />
                  <span>{brand}</span>
                </button>
                <p className="mb-6 max-w-sm leading-relaxed text-primary-foreground/70">
                  {footerTagline}
                </p>
                <div className="flex gap-3">
                  {socialIcons.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-10 place-items-center rounded-lg bg-primary-foreground/5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4"
                        aria-hidden="true"
                      >
                        {social.path}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-primary-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 text-sm md:flex-row">
              <span>{footerCopyright}</span>
              <span>{footerDisclosure}</span>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
