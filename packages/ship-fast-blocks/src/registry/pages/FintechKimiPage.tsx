import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FintechKimiPage — a complete, self-contained digital-banking / fintech LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Vault" design: a clean,
 * light, trust-forward fintech aesthetic with a deep slate brand surface,
 * crisp cards, and a floating credit-card mockup. It pairs a 2-column hero
 * (instant-transfers pill + headline + dual CTAs + trust badges + animated
 * gradient debit-card visual) with a trusted-by logo strip, a 6-up features
 * grid, a dark bank-grade security band (checklist + showcase photo + status
 * chip), a 3-step onboarding flow, a 4-up KPI band, a 3-tier pricing table
 * (with a "Most Popular" highlighted plan), a 6-card star-rated testimonial
 * grid, an accordion FAQ, a dark conversion CTA band, and a 5-column footer
 * with social links + legal disclosures.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav
 * item / CTA / link / form submit routes through `useNavigate` (never a dead
 * "#"), and the navbar labels match the `nav` array so PageSwitch can swap
 * pages. All content imagery uses the alt-driven <Image> component (never a
 * raw src). Callers supply ONLY content data; rich defaults make it render
 * great with no props at all.
 */
export const FintechKimiPage = defineComponent({
  name: "FintechKimiPage",
  description:
    "Complete digital-banking / fintech / neobank LANDING page with a clean, light, trust-forward aesthetic: deep slate brand surface, crisp bordered cards, and a floating animated debit/credit-card mockup with live balance. Includes a 2-column hero (instant-transfers status pill, headline, dual CTAs, FDIC/no-fee trust badges, card visual), a trusted-by logo strip, a 6-up features grid (instant transfers, virtual & physical cards, smart savings/APY, spending analytics, global payments, business accounts) with icon tiles, a dark bank-grade security band (256-bit encryption, biometrics, FDIC, real-time alerts checklist plus a security-ops showcase photo and an all-systems-operational status chip), a 3-step account-opening flow with app-store badges, a 4-up KPI/stats band ($2.4B+ processed, 500K+ accounts, 4.9/5 rating, 180+ countries), a 3-tier pricing table (Standard free, a highlighted Most-Popular Plus, and Business) with feature checkmarks, a 6-card 5-star testimonial grid with avatars, an accordion FAQ, a dark conversion CTA band with reassurance badges, and a 5-column footer with social icons and legal disclosures. Use as the ROOT/home page for fintech apps, neobanks, digital wallets, money/payments products, banking-as-a-service, expense or savings apps, or any finance startup that needs a secure, conversion-focused marketing page with strong social proof and transparent pricing. Supply content only — brand, nav, hero, logos, features, security, steps, stats, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content + the floating debit-card visual. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Reassurance chips under the CTAs. */
        trustPoints: z.array(z.string()).optional(),
        /** Floating card mockup details. */
        cardLabel: z.string().optional(),
        cardBalance: z.string().optional(),
        cardHolder: z.string().optional(),
        cardExpires: z.string().optional(),
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
    /** Dark bank-grade security band. */
    security: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        statusTitle: z.string().optional(),
        statusNote: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-step onboarding flow. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** KPI / stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-tier pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        plans: z
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
        trustPoints: z.array(z.string()).optional(),
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
      : ["Features", "Security", "Pricing", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with instant transfers"
    const heroHeading = props.hero?.heading ?? "Banking that actually makes sense"
    const heroSub =
      props.hero?.subheading ??
      "Vault combines a powerful digital wallet with smart banking features. Send money instantly, save automatically, and track every penny—all with bank-grade security."
    const heroPrimary = props.hero?.primaryCta ?? "Open free account"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch demo"
    const heroTrust = props.hero?.trustPoints?.length
      ? props.hero.trustPoints
      : ["No monthly fees", "FDIC insured"]
    const cardLabel = props.hero?.cardLabel ?? "Current Balance"
    const cardBalance = props.hero?.cardBalance ?? "$24,562.80"
    const cardHolder = props.hero?.cardHolder ?? "Alexandra Chen"
    const cardExpires = props.hero?.cardExpires ?? "09/28"

    const logosLabel =
      props.logos?.label ?? "Trusted by over 50,000 businesses and individuals"
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Slack", "Figma", "Webflow", "Vercel"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need in one place"
    const featuresDesc =
      props.features?.description ??
      "From instant transfers to smart savings, Vault puts you in complete control of your money."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Instant Transfers",
            description:
              "Send money to anyone, anywhere in seconds. Zero fees between Vault accounts. Real-time notifications on every transaction.",
          },
          {
            title: "Virtual & Physical Cards",
            description:
              "Generate unlimited virtual cards for online purchases. Order physical cards with customizable designs. Freeze instantly if lost.",
          },
          {
            title: "Smart Savings Goals",
            description:
              "Set custom savings goals with automatic round-ups. Earn 3.5% APY on your savings. No minimum balance required ever.",
          },
          {
            title: "Spending Analytics",
            description:
              "Beautiful charts show exactly where your money goes. Categorize transactions automatically. Get weekly spending insights.",
          },
          {
            title: "Global Payments",
            description:
              "Send money to 180+ countries with competitive exchange rates. Multi-currency accounts. SWIFT and local transfer options.",
          },
          {
            title: "Business Accounts",
            description:
              "Separate business and personal finances effortlessly. Team access controls. Invoice generation and expense tracking built-in.",
          },
        ]

    const securityHeading =
      props.security?.heading ?? "Bank-grade security as standard"
    const securityDesc =
      props.security?.description ??
      "Your money and data are protected by the same encryption standards used by the world's leading banks. We never compromise on security."
    const securityImageAlt =
      props.security?.imageAlt ??
      "Professional security operations center with monitors displaying cybersecurity dashboards"
    const securityStatusTitle = props.security?.statusTitle ?? "Security Check"
    const securityStatusNote =
      props.security?.statusNote ?? "All systems operational"
    const securityItems = props.security?.items?.length
      ? props.security.items
      : [
          {
            title: "256-bit Encryption",
            description:
              "All data transmitted with AES-256 encryption, the same standard used by the military.",
          },
          {
            title: "Biometric Authentication",
            description:
              "Face ID, fingerprint, or PIN required for every sensitive action. Your biometrics never leave your device.",
          },
          {
            title: "FDIC Insured",
            description:
              "Deposits insured up to $250,000 through our partner banks. Your money is always protected.",
          },
          {
            title: "Real-time Alerts",
            description:
              "Instant notifications for every transaction. Suspicious activity blocked automatically.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Get started in minutes"
    const stepsDesc =
      props.steps?.description ??
      "No paperwork, no branch visits, no waiting. Open your account from your phone in under 5 minutes."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Download the app",
            description:
              'Available on iOS and Android. Search "Vault Banking" or scan the QR code on our website.',
          },
          {
            title: "Verify your identity",
            description:
              "Snap a photo of your ID and take a selfie. Our AI verifies you in under 2 minutes. No credit check required.",
          },
          {
            title: "Start banking",
            description:
              "Add money instantly via debit card, bank transfer, or Apple Pay. Your virtual card is ready immediately.",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$2.4B+", label: "Transactions processed" },
          { value: "500K+", label: "Active accounts" },
          { value: "4.9/5", label: "App Store rating" },
          { value: "180+", label: "Countries supported" },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees, no surprise charges. Choose the plan that works for you."
    const pricingNote =
      props.pricing?.note ??
      "All plans include FDIC insurance up to $250,000. Cancel anytime."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Standard",
            tagline: "Perfect for everyday banking",
            price: "$0",
            period: "/month",
            cta: "Get started",
            featured: false,
            features: [
              { label: "Virtual card", included: true },
              { label: "Instant transfers", included: true },
              { label: "3.5% APY savings", included: true },
              { label: "Spending insights", included: true },
              { label: "Physical card", included: false },
              { label: "Cashback rewards", included: false },
            ],
          },
          {
            name: "Plus",
            tagline: "For the savvy spender",
            price: "$9.99",
            period: "/month",
            cta: "Get Plus",
            featured: true,
            features: [
              { label: "Everything in Standard", included: true },
              { label: "Free physical card", included: true },
              { label: "Up to 5 virtual cards", included: true },
              { label: "1% cashback on all purchases", included: true },
              { label: "Priority support", included: true },
              { label: "4.0% APY savings", included: true },
            ],
          },
          {
            name: "Business",
            tagline: "For companies and teams",
            price: "$29",
            period: "/month",
            cta: "Contact sales",
            featured: false,
            features: [
              { label: "Everything in Plus", included: true },
              { label: "Unlimited team members", included: true },
              { label: "Expense management", included: true },
              { label: "Invoice generation", included: true },
              { label: "Accounting integrations", included: true },
              { label: "Dedicated account manager", included: true },
            ],
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by thousands"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what our customers have to say about their experience with Vault."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Vault has completely changed how I manage my freelance income. The instant transfers and virtual cards make client payments seamless. I love the spending insights too.",
            name: "Sarah Mitchell",
            role: "Freelance Designer, Brooklyn",
            avatarAlt: "Professional headshot of Sarah Mitchell, a smiling freelance designer",
          },
          {
            quote:
              "As a startup founder, I needed a business banking solution that could grow with us. Vault's business plan is perfect—invoicing, team cards, and expense tracking all in one place.",
            name: "Marcus Johnson",
            role: "CEO, TechFlow Inc., San Francisco",
            avatarAlt: "Professional headshot of Marcus Johnson, a startup founder in his 30s",
          },
          {
            quote:
              "I travel frequently for work and Vault's multi-currency feature saves me hundreds in conversion fees. The app works flawlessly everywhere I've been—London, Tokyo, Singapore.",
            name: "Emma Rodriguez",
            role: "Management Consultant, Chicago",
            avatarAlt: "Professional headshot of Emma Rodriguez, a business consultant with dark hair",
          },
          {
            quote:
              "The security features give me peace of mind. I love getting instant notifications for every transaction and being able to freeze my card instantly from the app.",
            name: "David Chen",
            role: "Software Engineer, Seattle",
            avatarAlt: "Professional headshot of David Chen, a software engineer with glasses",
          },
          {
            quote:
              "I switched from a traditional bank and haven't looked back. The 4% APY on savings is incredible, and the round-up feature has helped me save $3,400 this year without even noticing.",
            name: "Jennifer Park",
            role: "Marketing Director, Austin",
            avatarAlt: "Professional headshot of Jennifer Park, a marketing director with long dark hair",
          },
          {
            quote:
              "Customer support is phenomenal. I had an issue with a transfer at 2 AM and got a helpful response in under 3 minutes. That's the kind of service that builds loyalty.",
            name: "Michael Torres",
            role: "Entrepreneur, Miami",
            avatarAlt: "Professional headshot of Michael Torres, an entrepreneur with a beard",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about Vault. Can't find what you're looking for? Contact our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is Vault a real bank?",
            answer:
              "Vault is a financial technology company, not a bank. Banking services are provided by our partner banks, Members FDIC. This means your deposits are insured up to $250,000, just like any traditional bank.",
          },
          {
            question: "How quickly can I open an account?",
            answer:
              "Most accounts are approved within 2-3 minutes. You'll need a valid government ID and to take a selfie for identity verification. Once approved, you can start using your virtual card immediately while your physical card is mailed to you.",
          },
          {
            question: "Are there really no monthly fees?",
            answer:
              "Our Standard plan is completely free—no monthly fees, no minimum balance requirements, no hidden charges. We make money from interchange fees when you use your card, just like other banks. Plus and Business plans offer additional features for a monthly subscription.",
          },
          {
            question: "Can I send money internationally?",
            answer:
              "Yes! You can send money to 180+ countries. We use the real exchange rate with no hidden markup, and most transfers arrive within 1-2 business days. Plus and Business members get fee-free international transfers up to $10,000 per month.",
          },
          {
            question: "What happens if I lose my card?",
            answer:
              "You can freeze your card instantly from the app with one tap. If you find it, unfreeze just as easily. If it's truly lost, report it in the app and we'll send a replacement within 3-5 business days at no charge. Your money remains safe throughout.",
          },
          {
            question: "How do I deposit cash?",
            answer:
              "You can deposit cash at over 60,000 retail locations nationwide including CVS, Walgreens, and 7-Eleven. Just show the barcode in your Vault app to the cashier. You can also deposit checks by taking a photo in the app, or transfer from another bank account.",
          },
          {
            question: "Is my money FDIC insured?",
            answer:
              "Absolutely. Your deposits are insured up to $250,000 per account holder through our partner banks, Members FDIC. This is the same protection you'd get with any traditional bank.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to upgrade your banking?"
    const ctaDesc =
      props.cta?.description ??
      "Join over 500,000 people who have made the switch to smarter, simpler banking. Open your account in under 5 minutes."
    const ctaPrimary = props.cta?.primaryCta ?? "Open free account"
    const ctaSecondary = props.cta?.secondaryCta ?? "Contact sales"
    const ctaTrust = props.cta?.trustPoints?.length
      ? props.cta.trustPoints
      : ["No credit check", "No hidden fees", "Cancel anytime"]

    const footerTagline =
      props.footer?.tagline ??
      "Modern banking for modern life. Secure, simple, and designed for how you actually use money."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Pricing", "Business", "Security", "Integrations"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Resources",
            links: ["Help Center", "Community", "API Docs", "Status", "Sitemap"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Cookie Policy", "Licenses", "Disclosures"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Financial Technologies. All rights reserved.`
    const footerDisclosure =
      props.footer?.disclosure ??
      "Banking services provided by Partner Bank, Member FDIC."

    // Brand logo tile — slate brand square with a shield/lock icon (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
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
          className="size-[60%]"
        >
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
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

    const Cross = ({ className }: { className?: string }) => (
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

    // Feature icon set — rotate through tokenized accent tiles, never raw palette.
    const featureIcons: ReactNode[] = [
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
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // card
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
      // savings (coin)
      <svg
        key="savings"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // analytics (bars)
      <svg
        key="analytics"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // globe
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
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // team
      <svg
        key="team"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
    ]

    const securityIcons: ReactNode[] = [
      // lock
      <svg
        key="lock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      // shield-check
      <svg
        key="shield"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      // check-circle
      <svg
        key="check"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // bell
      <svg
        key="bell"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>,
    ]

    const ChevronDown = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 transition-transform group-open:rotate-180"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const socialIcons: { label: string; path: ReactNode }[] = [
      {
        label: "Twitter",
        path: (
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <LogoMark className="size-8" />
              {brand}
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
                onClick={() => go("Sign in")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="py-20 lg:pb-32 lg:pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-base font-medium text-secondary-foreground transition-colors hover:bg-accent"
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
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((point) => (
                      <div key={point} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating debit-card visual */}
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -right-8 -top-8 size-64 rounded-full bg-accent opacity-50 blur-3xl"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-8 -left-8 size-64 rounded-full bg-primary/20 opacity-50 blur-3xl"
                  />
                  <div className="relative z-10 mx-auto aspect-[1.586/1] w-full max-w-md rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 shadow-2xl">
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex size-8 items-center gap-1 rounded-md bg-secondary/90 px-2">
                          <span className="size-4 rounded-full bg-primary-foreground/80" />
                          <span className="-ml-2 size-4 rounded-full bg-primary-foreground/50" />
                        </div>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-8 text-primary-foreground/80"
                          aria-hidden="true"
                        >
                          <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-primary-foreground/60">
                          {cardLabel}
                        </p>
                        <p className="text-3xl font-bold tracking-tight text-primary-foreground">
                          {cardBalance}
                        </p>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="mb-1 text-xs font-medium text-primary-foreground/60">
                            Card Holder
                          </p>
                          <p className="font-medium text-primary-foreground">
                            {cardHolder}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="mb-1 text-xs font-medium text-primary-foreground/60">
                            Expires
                          </p>
                          <p className="font-medium text-primary-foreground">
                            {cardExpires}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logosItems.map((logo, i) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className={cn(
                      "mx-auto text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-100",
                      i >= 4 && "hidden md:block",
                    )}
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-muted p-6"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
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

          {/* Security */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                    {securityHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-primary-foreground/70">
                    {securityDesc}
                  </p>
                  <div className="space-y-6">
                    {securityItems.map((item, i) => (
                      <div key={item.title} className="flex gap-4">
                        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                          {securityIcons[i % securityIcons.length]}
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold text-primary-foreground">
                            {item.title}
                          </h3>
                          <p className="text-sm text-primary-foreground/60">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-primary-foreground/20 pt-8">
                    {["SOC 2 Type 2", "PCI DSS Level 1", "ISO 27001"].map(
                      (badge) => (
                        <span
                          key={badge}
                          className="rounded-md bg-primary-foreground/10 px-3 py-2 text-xs font-medium text-primary-foreground/80"
                        >
                          {badge}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={securityImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 text-card-foreground shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {securityStatusTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {securityStatusNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary">
                      <span className="text-xl font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-6 hidden h-0.5 w-full -translate-x-6 bg-border md:block"
                      >
                        <span className="absolute -top-1 right-0 size-2 rounded-full bg-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="mb-2 text-4xl font-bold text-foreground sm:text-5xl">
                      {stat.value}
                    </p>
                    <p className="font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-xl p-8",
                      plan.featured
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground",
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        plan.featured
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        plan.featured
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.tagline}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.featured
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          plan.featured
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {(plan.features ?? []).map((feat) => (
                        <li
                          key={feat.label}
                          className={cn(
                            "flex items-center gap-3",
                            feat.included
                              ? plan.featured
                                ? "text-primary-foreground/90"
                                : "text-foreground/80"
                              : plan.featured
                                ? "text-primary-foreground/40"
                                : "text-muted-foreground/60",
                          )}
                        >
                          {feat.included ? (
                            <Check
                              className={cn(
                                "size-5 shrink-0",
                                plan.featured
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          ) : (
                            <Cross className="size-5 shrink-0" />
                          )}
                          <span>{feat.label}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-lg py-3 text-center font-medium transition-colors",
                        plan.featured
                          ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                          : "bg-secondary text-secondary-foreground hover:bg-accent",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
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
                    className="rounded-xl bg-card p-6 text-card-foreground shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5" />
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
                        loading="lazy"
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
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group cursor-pointer rounded-xl bg-muted p-6"
                  >
                    <summary className="flex list-none items-center justify-between font-semibold text-foreground">
                      <span>{item.question}</span>
                      <span className="text-muted-foreground">
                        <ChevronDown />
                      </span>
                    </summary>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-8 py-4 text-base font-medium text-primary transition-colors hover:bg-primary-foreground/90"
                >
                  {ctaPrimary}
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
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center rounded-lg border border-primary-foreground/30 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/60">
                {ctaTrust.map((point) => (
                  <div key={point} className="flex items-center gap-2">
                    <Check className="size-5 text-primary-foreground" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-bold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {socialIcons.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-8 place-items-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
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
            <div className="border-t border-border pt-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-muted-foreground">{footerCopyright}</p>
                <p className="text-sm text-muted-foreground">
                  {footerDisclosure}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
