import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * LendingKimiPage2 — a BOLD, high-energy alternative personal-LENDING / loan
 * marketing page (variant 2, a sibling to the calmer LendingKimiPage).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "FastLoan" design: a punchy,
 * conversion-aggressive fintech aesthetic built around a vivid brand color and
 * a DARK gradient hero with floating glow blobs and a live "$2.4B funded" status
 * pulse. It pairs a split hero (huge gradient-highlight headline + trust pills
 * beside a white loan-calculator card) with a press/logos strip, a 6-up
 * colored-icon benefits grid ("loans built for real life"), a DARK 3-step
 * "how it works" flow with connector lines and checkmark feature lists, a
 * vibrant gradient stats band ($2.4B+/500K+/4.9 rating/2min), a 6-up borrower
 * testimonials grid with star ratings + headshots, an 8-item accordion FAQ, a
 * dark gradient "ready to get started?" CTA band with call button, and a dark
 * multi-column footer with social icons and legal disclosures. Distinct from
 * LendingKimiPage by its dark+vibrant mood, glow blobs, gradient text, and
 * denser testimonial/FAQ counts. The block owns ALL layout, spacing, depth and
 * type hierarchy. Every nav item / CTA / link routes through `useNavigate`. All
 * imagery uses the alt-driven <Image> component. Callers supply ONLY content;
 * rich defaults make it render great with no props at all.
 */
export const LendingKimiPage2 = defineComponent({
  name: "LendingKimiPage2",
  description:
    "BOLD, high-energy personal-LENDING / loan marketing landing page — VARIANT 2, an alternative/second style and sibling to LendingKimiPage for when a punchier, conversion-aggressive look is wanted. Vivid brand color with a DARK gradient hero (floating glow blobs, live '$2.4B funded' status pulse), a huge gradient-highlight headline ('Get Your Loan in 24 Hours'), trust pills, dual CTAs, and a bright white loan-calculator card (amount, term buttons, credit-score select, est. APR & monthly payment). Includes a press/'featured in' logos strip (Forbes, CNBC, Bloomberg, WSJ, TechCrunch, NerdWallet), a 6-up colored-icon benefits grid (lightning-fast approval, no hidden fees, soft credit check, rates from 5.99% APR, flexible payments, U.S.-based support), a DARK 3-step 'how it works' flow with connector lines and checkmark feature lists, a vibrant gradient stats band, a 6-up borrower-testimonials grid with 5-star ratings and headshots, an 8-item accordion FAQ, a dark gradient 'ready to get started?' CTA band with a call button, and a dark multi-column footer with social icons and NMLS legal disclosure. Use as the ROOT/home page for personal-loan lenders, lending marketplaces, debt-consolidation services, fintech credit products, BNPL or financing brands, or any 'check your rate / apply now' product when a bold, vibrant, trust-and-APR-driven page is wanted — pick this over LendingKimiPage for the darker, more energetic treatment. Supply content only — brand, nav, hero, calculator, logos, benefits, steps, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / lender name shown in navbar, CTAs and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Dark hero + the in-hero white loan calculator card. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        /** Phrase rendered in the gradient accent tone. */
        headingHighlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
        cardTitle: z.string().optional(),
        cardSubtitle: z.string().optional(),
        amountLabel: z.string().optional(),
        amountValue: z.string().optional(),
        amountMin: z.string().optional(),
        amountMax: z.string().optional(),
        termLabel: z.string().optional(),
        terms: z.array(z.string()).optional(),
        scoreLabel: z.string().optional(),
        scoreOptions: z.array(z.string()).optional(),
        aprLabel: z.string().optional(),
        aprValue: z.string().optional(),
        paymentLabel: z.string().optional(),
        paymentValue: z.string().optional(),
        cardCta: z.string().optional(),
        cardNote: z.string().optional(),
      })
      .optional(),
    /** Press / "featured in" logos strip. */
    logos: z
      .object({
        caption: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why choose us" colored-icon benefits grid. */
    benefits: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark 3-step "how it works" flow with checkmark lists. */
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
              points: z.array(z.string()),
            }),
          )
          .optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Vibrant gradient stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Borrower testimonials grid. */
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
              meta: z.string(),
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
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark gradient "ready to get started?" CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        phone: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Dark multi-column footer. */
    footer: z
      .object({
        tagline: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        legalLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        disclosure: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "FastLoan"
    const nav = props.nav?.length
      ? props.nav
      : ["How It Works", "Rates", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Over $2.4 billion funded"
    const heroLead = props.hero?.headingLead ?? "Get Your Loan in"
    const heroHighlight = props.hero?.headingHighlight ?? "24 Hours"
    const heroSub =
      props.hero?.subheading ??
      "Personal loans from $1,000 to $50,000 with rates as low as 5.99% APR. No hidden fees, no prepayment penalties. Check your rate in 2 minutes without hurting your credit score."
    const heroPrimary = props.hero?.primaryCta ?? "Calculate Your Rate"
    const heroSecondary = props.hero?.secondaryCta ?? "Learn More"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit impact", "Soft pull only"]
    const heroCardTitle = props.hero?.cardTitle ?? "Loan Calculator"
    const heroCardSubtitle =
      props.hero?.cardSubtitle ?? "Estimate your monthly payment"
    const heroAmountLabel = props.hero?.amountLabel ?? "Loan Amount"
    const heroAmountValue = props.hero?.amountValue ?? "15000"
    const heroAmountMin = props.hero?.amountMin ?? "$1,000"
    const heroAmountMax = props.hero?.amountMax ?? "$50,000"
    const heroTermLabel = props.hero?.termLabel ?? "Loan Term"
    const heroTerms = props.hero?.terms?.length
      ? props.hero.terms
      : ["24 mo", "36 mo", "48 mo", "60 mo"]
    const heroScoreLabel = props.hero?.scoreLabel ?? "Estimated Credit Score"
    const heroScoreOptions = props.hero?.scoreOptions?.length
      ? props.hero.scoreOptions
      : [
          "Excellent (720+)",
          "Good (690-719)",
          "Fair (630-689)",
          "Average (580-629)",
        ]
    const heroAprLabel = props.hero?.aprLabel ?? "Estimated APR"
    const heroAprValue = props.hero?.aprValue ?? "9.49%"
    const heroPaymentLabel = props.hero?.paymentLabel ?? "Monthly Payment"
    const heroPaymentValue = props.hero?.paymentValue ?? "$377"
    const heroCardCta = props.hero?.cardCta ?? "Check My Rate"
    const heroCardNote =
      props.hero?.cardNote ??
      "Won't affect your credit score • Instant decision"

    const logosCaption =
      props.logos?.caption ?? "Featured in & trusted by"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Forbes", "CNBC", "Bloomberg", "WSJ", "TechCrunch", "NerdWallet"]

    const benefitsEyebrow = props.benefits?.eyebrow ?? "Why Choose FastLoan"
    const benefitsHeading =
      props.benefits?.heading ?? "Loans Built for Real Life"
    const benefitsDesc =
      props.benefits?.description ??
      "No hidden fees, no prepayment penalties, and rates that actually make sense. We believe borrowing should be transparent and stress-free."
    const benefitItems = props.benefits?.items?.length
      ? props.benefits.items
      : [
          {
            title: "Lightning Fast Approval",
            description:
              "Get approved in as little as 2 minutes. Funds deposited directly to your bank account within 24 hours of approval.",
          },
          {
            title: "No Hidden Fees",
            description:
              "What you see is what you get. Zero origination fees, zero prepayment penalties, and zero surprises. Ever.",
          },
          {
            title: "Soft Credit Check",
            description:
              "Checking your rate won't hurt your credit score. We use a soft pull that doesn't appear on your credit report.",
          },
          {
            title: "Rates from 5.99% APR",
            description:
              "Competitive rates based on your credit profile. Borrow $1,000 to $50,000 with terms from 24 to 60 months.",
          },
          {
            title: "Flexible Payment Options",
            description:
              "Choose your payment date, set up autopay for a 0.25% rate discount, or make extra payments anytime with no penalties.",
          },
          {
            title: "U.S.-Based Support",
            description:
              "Real humans, real help. Our customer success team is available 7 days a week via phone, chat, or email.",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "Simple Process"
    const stepsHeading = props.steps?.heading ?? "How It Works"
    const stepsDesc =
      props.steps?.description ??
      "Three simple steps to get the funds you need. No paperwork, no branch visits, no waiting in line."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Check Your Rate",
            description:
              "Tell us how much you need and we'll show you personalized rates in 2 minutes. No credit impact, no commitment.",
            points: [
              "Soft credit pull only",
              "Instant rate quote",
              "Multiple term options",
            ],
          },
          {
            title: "Complete Application",
            description:
              "Choose your loan offer and complete your profile. Upload documents securely through our encrypted portal.",
            points: [
              "Bank-level encryption",
              "Mobile-friendly process",
              "Same-day approval",
            ],
          },
          {
            title: "Get Funded",
            description:
              "Sign your loan agreement electronically and receive funds directly to your bank account as soon as next business day.",
            points: ["Direct deposit", "Next-day funding", "No fees to receive"],
          },
        ]
    const stepsCta = props.steps?.cta ?? "Get Started Now"

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$2.4B+", label: "Loans Funded" },
          { value: "500K+", label: "Happy Customers" },
          { value: "4.9/5", label: "TrustPilot Rating" },
          { value: "2min", label: "Average Approval" },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Customer Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Trusted by 500,000+ Borrowers"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real people, real results. Here's what our customers have to say about their FastLoan experience."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I needed $12,000 for a home renovation project. FastLoan approved me in literally 3 minutes and the money was in my account the next day. The rate was better than my credit union offered!",
            name: "Sarah Mitchell",
            meta: "Homeowner • Denver, CO",
            avatarAlt:
              "professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "Consolidated $25,000 in credit card debt and cut my interest rate in half. The process was so simple I couldn't believe it. Customer service was incredibly helpful when I had questions.",
            name: "Marcus Chen",
            meta: "Software Engineer • Austin, TX",
            avatarAlt:
              "professional headshot of a smiling man with short dark hair and a beard",
          },
          {
            quote:
              "Used my FastLoan to start my catering business. $18,000 funded my first commercial kitchen equipment. Now I'm booking weddings every weekend. This changed my life.",
            name: "Elena Rodriguez",
            meta: "Small Business Owner • Miami, FL",
            avatarAlt:
              "professional headshot of a smiling woman with curly black hair",
          },
          {
            quote:
              "My car broke down unexpectedly and I needed $8,000 fast. FastLoan came through when my bank was going to take weeks. The mobile app makes payments super easy too.",
            name: "David Park",
            meta: "Teacher • Seattle, WA",
            avatarAlt:
              "professional headshot of a smiling man with short brown hair and glasses",
          },
          {
            quote:
              "As a single mom, I needed help with medical bills. FastLoan didn't judge my situation—they just helped. The flexible payment date option saved me so many times.",
            name: "Jennifer Walsh",
            meta: "Nurse • Chicago, IL",
            avatarAlt:
              "professional headshot of a smiling woman with blonde hair in a warm indoor setting",
          },
          {
            quote:
              "Paid off my loan 8 months early and there was literally zero penalty. Try doing that with a traditional bank! FastLoan actually wants you to succeed financially.",
            name: "Robert Thompson",
            meta: "Retired Military • San Diego, CA",
            avatarAlt:
              "professional headshot of a smiling middle-aged man with gray hair",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Got Questions?"
    const faqHeading =
      props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about FastLoan. Can't find what you're looking for? Contact our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What can I use my FastLoan for?",
            a: "You can use your FastLoan for almost any personal purpose: debt consolidation, home improvements, medical expenses, major purchases, moving costs, wedding expenses, business startup costs, or emergency expenses. The only restrictions are that funds cannot be used for illegal activities, stock/crypto investments, or post-secondary education expenses.",
          },
          {
            q: "Will checking my rate affect my credit score?",
            a: "No. When you check your rate, we perform a soft credit inquiry that doesn't affect your credit score. Only if you choose to accept a loan offer and proceed with the full application will we perform a hard credit inquiry, which may have a minimal and temporary impact on your score.",
          },
          {
            q: "What are the requirements to qualify?",
            a: "To qualify for a FastLoan, you must: be at least 18 years old (19 in Alabama and Nebraska), be a U.S. citizen or permanent resident, have a valid email address and bank account, have a regular source of income (minimum $25,000/year), and have a credit score of at least 580. Residents of Iowa and West Virginia are not currently eligible.",
          },
          {
            q: "How quickly will I receive my funds?",
            a: "Most approved borrowers receive their funds within 24 hours of signing their loan agreement. In some cases, funds may be available as soon as the same business day. The exact timing depends on your bank's processing times. We deposit funds directly into your linked checking account via ACH transfer.",
          },
          {
            q: "Are there any fees?",
            a: "FastLoan charges no origination fees, no prepayment penalties, and no hidden fees. The only fee you might encounter is a late payment fee of $15 if your payment is more than 10 days past due. We also offer autopay with a 0.25% APR discount to help you avoid late payments.",
          },
          {
            q: "Can I pay off my loan early?",
            a: "Absolutely! You can pay off your loan early at any time with zero prepayment penalties. In fact, we encourage it. You can make extra payments toward your principal or pay off your entire balance through your online account or mobile app.",
          },
          {
            q: "What if I can't make a payment?",
            a: "We understand that life happens. If you're experiencing financial hardship, contact our support team as soon as possible at (555) 123-4567. We offer hardship programs, payment date changes, and can work with you to find a solution. We report to credit bureaus, so keeping communication open is important.",
          },
          {
            q: "How is my interest rate determined?",
            a: "Your interest rate is determined by several factors including your credit score, credit history, income, debt-to-income ratio, loan amount, and loan term. Rates range from 5.99% to 29.99% APR. Borrowers with excellent credit typically receive the lowest rates. Check your personalized rate with no credit impact.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Get Started?"
    const ctaDesc =
      props.cta?.description ??
      "Check your rate in 2 minutes with no impact to your credit score. Join 500,000+ borrowers who've funded their goals with FastLoan."
    const ctaPrimary = props.cta?.primary ?? "Check My Rate"
    const ctaPhone = props.cta?.phone ?? "Call (555) 123-4567"
    const ctaNote =
      props.cta?.note ??
      "Checking your rate won't affect your credit score • NMLS #1234567"

    const footerTagline =
      props.footer?.tagline ??
      "Fast, fair, and transparent personal loans. Borrow $1,000 to $50,000 with rates starting at 5.99% APR. No hidden fees, no prepayment penalties."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Facebook", "Instagram", "LinkedIn"]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Products",
            links: [
              "Personal Loans",
              "Debt Consolidation",
              "Home Improvement",
              "Medical Loans",
              "Emergency Loans",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Partners", "Contact"],
          },
          {
            title: "Resources",
            links: [
              "Help Center",
              "Blog",
              "Loan Calculator",
              "Credit Education",
              "Accessibility",
            ],
          },
        ]
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Policy", "Licenses"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved. NMLS #1234567`
    const footerDisclosure =
      props.footer?.disclosure ??
      "FastLoan Inc. is a financial services company, not a bank. Loans are issued by WebBank, Member FDIC. All loans are subject to credit approval. Your actual rate depends on your credit score, loan amount, loan term, credit usage, credit history, and state of residence. Rates displayed are for borrowers with excellent credit. Not available in IA or WV. Minimum loan amounts may apply in some states. Example: A $15,000 loan with an APR of 9.49% and 48-month term would have monthly payments of $377. Total interest paid: $3,096."

    const Bolt = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const CheckMark = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    )

    const Phone = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    const benefitIcons = [
      "M13 10V3L4 14h7v7l9-11h-7z",
      "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    ]

    const inputCls =
      "w-full rounded-xl border border-input bg-background px-4 py-3 font-semibold text-foreground transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground lg:size-10">
                  <Bolt className="size-5 lg:size-6" />
                </span>
                <span className="text-xl font-bold text-foreground lg:text-2xl">
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
                <button
                  type="button"
                  onClick={() => go("Sign In")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:block"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go("Apply Now")}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-foreground to-foreground" />
            <div className="absolute inset-0 opacity-40">
              <div className="absolute left-10 top-20 size-72 rounded-full bg-primary/40 blur-3xl" />
              <div className="absolute bottom-20 right-10 size-96 rounded-full bg-accent/30 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-4 py-1.5 backdrop-blur-sm">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-background/80">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-black leading-tight text-background sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroLead}{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg text-background/70 sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-background/30 bg-background/10 px-8 py-4 text-lg font-bold text-background backdrop-blur-sm transition-all hover:bg-background/20"
                    >
                      {heroSecondary}
                      <ChevronDown className="size-5" />
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-6 text-sm text-background/60 lg:justify-start">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hero calculator card */}
                <div className="rounded-2xl bg-card p-6 shadow-2xl sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-6"
                        aria-hidden="true"
                      >
                        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-card-foreground">
                        {heroCardTitle}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {heroCardSubtitle}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-card-foreground">
                        {heroAmountLabel}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          defaultValue={heroAmountValue}
                          aria-label={heroAmountLabel}
                          className={cn(inputCls, "pl-10")}
                        />
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={50000}
                        step={500}
                        defaultValue={Number(heroAmountValue) || 15000}
                        aria-label={heroAmountLabel}
                        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                      />
                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>{heroAmountMin}</span>
                        <span>{heroAmountMax}</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-card-foreground">
                        {heroTermLabel}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {heroTerms.map((term, i) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => go(`${heroTermLabel}: ${term}`)}
                            className={cn(
                              "rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                              i === 2
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50",
                            )}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-card-foreground">
                        {heroScoreLabel}
                      </label>
                      <select
                        defaultValue={heroScoreOptions[1]}
                        aria-label={heroScoreLabel}
                        className={cn(inputCls, "appearance-none font-medium")}
                      >
                        {heroScoreOptions.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="border-t border-border pt-6">
                      <div className="mb-2 flex items-end justify-between">
                        <span className="text-muted-foreground">
                          {heroAprLabel}
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {heroAprValue}
                        </span>
                      </div>
                      <div className="mb-6 flex items-end justify-between">
                        <span className="text-muted-foreground">
                          {heroPaymentLabel}
                        </span>
                        <span className="text-4xl font-black text-card-foreground">
                          {heroPaymentValue}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => go(heroCardCta)}
                        className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-primary/90"
                      >
                        {heroCardCta}
                      </button>
                      <p className="mt-3 text-center text-xs text-muted-foreground">
                        {heroCardNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosCaption}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center justify-center text-lg font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {benefitsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {benefitsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{benefitsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {benefitItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted p-8 transition-all hover:border-primary/30 hover:shadow-xl"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-7"
                        aria-hidden="true"
                      >
                        <path d={benefitIcons[i % benefitIcons.length]} />
                      </svg>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="relative overflow-hidden bg-foreground py-20 lg:py-28">
            <div className="absolute inset-0 bg-gradient-to-b from-foreground via-primary/10 to-foreground" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black text-background sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-background/70">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    {i < stepItems.length - 1 && (
                      <div className="absolute left-full top-12 hidden h-0.5 w-full bg-gradient-to-r from-primary to-transparent md:block" />
                    )}
                    <div className="relative rounded-2xl border border-border/40 bg-background/5 p-8 backdrop-blur-sm">
                      <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-3xl font-black text-primary-foreground shadow-lg">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-background">
                        {step.title}
                      </h3>
                      <p className="mb-4 text-background/60">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.points.map((p) => (
                          <li
                            key={p}
                            className="flex items-center gap-2 text-sm text-background/80"
                          >
                            <CheckMark className="size-5 shrink-0 text-primary" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(stepsCta)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {stepsCta}
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-gradient-to-r from-primary to-primary/80 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-black text-primary-foreground sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="font-medium text-primary-foreground/80">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
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
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 text-card-foreground">
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
                        <div className="font-bold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.meta}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-accent">
                      <h3 className="pr-8 text-lg font-bold text-foreground">
                        {item.q}
                      </h3>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-transform group-open:rotate-180">
                        <ChevronDown className="size-5" />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section className="relative overflow-hidden bg-foreground py-20 lg:py-28">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-primary/20 to-foreground" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute right-0 top-0 size-96 rounded-full bg-primary/40 blur-3xl" />
              <div className="absolute bottom-0 left-0 size-96 rounded-full bg-accent/30 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-black text-background sm:text-4xl lg:text-5xl xl:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-10 py-5 text-lg font-bold text-primary-foreground transition-all hover:bg-primary/90 sm:text-xl"
                >
                  <Bolt className="size-6" />
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-background/30 bg-background/10 px-10 py-5 text-lg font-bold text-background backdrop-blur-sm transition-all hover:bg-background/20 sm:text-xl"
                >
                  <Phone className="size-6" />
                  {ctaPhone}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/60">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    <Bolt className="size-6" />
                  </span>
                  <span className="text-2xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-background/60">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="text-xs font-semibold">
                        {social.slice(0, 2)}
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
                          className="text-background/60 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-border/30 pt-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-background/50">{footerCopyright}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  {footerLegalLinks.map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => go(link)}
                      className="text-background/50 transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-xs text-background/40">
                {footerDisclosure}
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
