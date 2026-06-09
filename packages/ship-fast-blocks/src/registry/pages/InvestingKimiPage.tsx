import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * InvestingKimiPage — a complete, self-contained modern investing / fintech
 * brokerage LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Vestora" design: a clean,
 * light, trustworthy financial aesthetic with a sticky blurred navbar, a
 * split hero pairing bold copy with a live portfolio-value card (sparkline +
 * S&P 500 ticker + buying-power/dividends/YTD stats), a press-logo trust row,
 * a 4-up live market quotes grid (AAPL/TSLA/BTC/NVDA mini-charts) plus a dark
 * global-indices band, a 6-up features grid, a 3-step onboarding timeline with
 * a transfer CTA, a dark product-showcase gallery of mock app screens, a 3-tier
 * pricing table (Essential/Pro/Elite with a Most Popular highlight), a stat band,
 * a 6-up star-rated testimonial wall with investor headshots, an accordion FAQ,
 * a dark closing CTA, and a rich multi-column footer with social icons + legal
 * disclosures.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Colors map to
 * semantic theme tokens (page light surface = background, gains/brand accent =
 * primary, losses = destructive, star rating = chart-4). Every nav item / CTA /
 * link / form submit routes through `useNavigate` (never a dead "#"), and the
 * navbar labels match the `nav` array so PageSwitch can swap pages. All imagery
 * uses the alt-driven <Image> component (never a raw src). Callers supply ONLY
 * content data; rich defaults make it render great with no props at all.
 */
export const InvestingKimiPage = defineComponent({
  name: "InvestingKimiPage",
  description:
    "Complete modern investing / fintech brokerage / trading-platform LANDING page with a clean, light, trustworthy financial aesthetic. Includes a sticky blurred navbar, a split hero (AI-insights badge, headline, dual CTAs, $0-commission/SEC-registered trust ticks) beside a live portfolio-value card with a sparkline, S&P 500 ticker and buying-power/dividends/YTD stats; a press trust-logo row (Bloomberg, Reuters, CNBC, WSJ); a 4-up live market quotes grid (AAPL, TSLA, BTC, NVDA with up/down mini-charts) plus a dark global-indices band (S&P 500, NASDAQ, Dow, FTSE); a 6-up features grid (advanced charting, zero commission, AI insights, bank-grade security, social investing, auto-invest); a 3-step onboarding timeline with a portfolio-transfer CTA; a dark product-showcase gallery of mock app screens; a 3-tier pricing table (Essential free, Pro, Elite with a Most Popular highlight); a key-metrics stat band (assets under management, active investors); a 6-up star-rated testimonial wall with investor headshots; an accordion FAQ; a dark closing CTA; and a rich multi-column footer with social icons and FINRA/SIPC legal disclosures. Use as the ROOT/home page for stock brokerages, trading apps, robo-advisors, crypto exchanges, wealth-management, portfolio trackers, or any fintech/investing product when a polished, conversion-focused page with real-time market data, social proof and transparent pricing is wanted. Supply content only — brand, nav, hero, markets, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / platform name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero: copy + live portfolio card. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        signIn: z.string().optional(),
        getStarted: z.string().optional(),
        /** Trust ticks beneath the CTAs. */
        trust: z.array(z.string()).optional(),
        /** Live portfolio-value card data. */
        portfolioLabel: z.string().optional(),
        portfolioValue: z.string().optional(),
        portfolioChange: z.string().optional(),
        indexLabel: z.string().optional(),
        indexValue: z.string().optional(),
        cardStats: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
      })
      .optional(),
    /** Press / trust logo row. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Live market quotes grid + global indices band. */
    markets: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        quotes: z
          .array(
            z.object({
              symbol: z.string(),
              name: z.string(),
              exchange: z.string(),
              price: z.string(),
              change: z.string(),
              up: z.boolean(),
            }),
          )
          .optional(),
        indicesHeading: z.string().optional(),
        indicesNote: z.string().optional(),
        indicesImageAlt: z.string().optional(),
        indices: z
          .array(
            z.object({ name: z.string(), value: z.string(), change: z.string(), up: z.boolean() }),
          )
          .optional(),
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
    /** 3-step onboarding timeline + transfer CTA. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        transferHeading: z.string().optional(),
        transferDescription: z.string().optional(),
        transferCta: z.string().optional(),
        transferImageAlt: z.string().optional(),
      })
      .optional(),
    /** Dark product-showcase gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-tier pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        popularLabel: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              popular: z.boolean().optional(),
              features: z.array(z.object({ label: z.string(), included: z.boolean() })),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Key-metrics stat band. */
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** Star-rated testimonial wall. */
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
    /** Dark closing CTA. */
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
        disclosure: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Vestora"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Markets", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now with AI-powered insights"
    const heroHeading = props.hero?.heading ?? "Invest with clarity and confidence"
    const heroSub =
      props.hero?.subheading ??
      "Build and track your portfolio with professional-grade tools. Real-time data, zero commission trades, and personalized insights for every investor."
    const heroPrimary = props.hero?.primaryCta ?? "Start investing free"
    const heroSecondary = props.hero?.secondaryCta ?? "View demo"
    const heroSignIn = props.hero?.signIn ?? "Sign in"
    const heroGetStarted = props.hero?.getStarted ?? "Get started"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["$0 commission", "SEC registered"]
    const portfolioLabel = props.hero?.portfolioLabel ?? "Portfolio Value"
    const portfolioValue = props.hero?.portfolioValue ?? "$48,293.47"
    const portfolioChange = props.hero?.portfolioChange ?? "+$1,247.32 (2.6%) today"
    const indexLabel = props.hero?.indexLabel ?? "S&P 500"
    const indexValue = props.hero?.indexValue ?? "4,783.45"
    const cardStats = props.hero?.cardStats?.length
      ? props.hero.cardStats
      : [
          { label: "Buying Power", value: "$12,450" },
          { label: "Dividends", value: "$89.34" },
          { label: "YTD Return", value: "+18.4%" },
        ]

    const logosLabel = props.logos?.label ?? "Trusted by investors worldwide"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Bloomberg", "Reuters", "CNBC", "WSJ", "Barron's", "FT"]

    const marketsHeading = props.markets?.heading ?? "Live market data at your fingertips"
    const marketsDesc =
      props.markets?.description ??
      "Track global markets in real-time. From blue-chip stocks to emerging crypto, never miss a movement."
    const quotes = props.markets?.quotes?.length
      ? props.markets.quotes
      : [
          { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", price: "$187.42", change: "+1.24 (0.67%)", up: true },
          { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", price: "$248.87", change: "-3.42 (1.36%)", up: false },
          { symbol: "BTC", name: "Bitcoin", exchange: "Crypto", price: "$42,893", change: "+856 (2.04%)", up: true },
          { symbol: "NVDA", name: "NVIDIA", exchange: "NASDAQ", price: "$495.22", change: "+8.74 (1.80%)", up: true },
        ]
    const indicesHeading = props.markets?.indicesHeading ?? "Global indices overview"
    const indicesNote =
      props.markets?.indicesNote ?? "Major world markets as of January 15, 2025, 4:00 PM EST"
    const indicesImageAlt =
      props.markets?.indicesImageAlt ??
      "stock market trading floor with multiple monitors displaying financial charts and data"
    const indices = props.markets?.indices?.length
      ? props.markets.indices
      : [
          { name: "S&P 500", value: "4,783.45", change: "+0.42%", up: true },
          { name: "NASDAQ", value: "15,055.65", change: "+0.68%", up: true },
          { name: "DOW JONES", value: "37,545.33", change: "-0.15%", up: false },
          { name: "FTSE 100", value: "7,682.30", change: "+0.23%", up: true },
        ]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to invest smarter"
    const featuresDesc =
      props.features?.description ??
      "Professional-grade tools made simple. From first-time investors to seasoned traders."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Advanced Charting",
            description:
              "Technical analysis with 50+ indicators, drawing tools, and customizable timeframes. Spot trends before they happen.",
          },
          {
            title: "Zero Commission",
            description:
              "Trade stocks, ETFs, and options without commission fees. Keep more of what you earn with every transaction.",
          },
          {
            title: "AI Insights",
            description:
              "Machine learning algorithms analyze your portfolio and market conditions to suggest optimizations and opportunities.",
          },
          {
            title: "Bank-Grade Security",
            description:
              "256-bit encryption, biometric authentication, and SIPC insurance up to $500,000 protect your assets.",
          },
          {
            title: "Social Investing",
            description:
              "Follow top investors, share strategies, and learn from a community of over 2 million active traders.",
          },
          {
            title: "Auto-Invest",
            description:
              "Set up recurring deposits and automatically invest in your preferred assets. Build wealth passively.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Start investing in minutes"
    const stepsDesc =
      props.steps?.description ??
      "A streamlined onboarding process designed to get you trading quickly and securely."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your account",
            description:
              "Sign up in under 2 minutes. Verify your identity securely with our streamlined KYC process.",
          },
          {
            title: "Fund your portfolio",
            description:
              "Connect your bank account for instant transfers. Start with as little as $1 or deposit up to $100,000.",
          },
          {
            title: "Start trading",
            description:
              "Browse thousands of stocks, ETFs, and crypto. Place your first trade with zero commission.",
          },
        ]
    const transferHeading =
      props.steps?.transferHeading ?? "Already have investments elsewhere?"
    const transferDesc =
      props.steps?.transferDescription ??
      `Our automated transfer service makes it easy to bring your portfolio to ${brand}. We'll handle the paperwork and reimburse any transfer fees up to $500.`
    const transferCta = props.steps?.transferCta ?? "Learn about transfers"
    const transferImageAlt =
      props.steps?.transferImageAlt ??
      "laptop showing financial dashboard with charts and account balances"

    const galleryHeading = props.gallery?.heading ?? "See the platform in action"
    const galleryDesc =
      props.gallery?.description ??
      "Designed for clarity. Built for performance. Experience investing without the clutter."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          { title: "Clean portfolio view", description: "Track all your holdings at a glance" },
          { title: "Advanced charts", description: "Technical analysis made simple" },
          { title: "Smart insights", description: "AI-powered recommendations" },
          { title: "Real-time orders", description: "Live market depth" },
          { title: "Social features", description: "Follow top investors" },
          { title: "Automated investing", description: "Set it and forget it" },
        ]

    const pricingHeading = props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free and upgrade when you need more. No hidden fees, ever."
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Essential",
            tagline: "Perfect for getting started",
            price: "$0",
            period: "/month",
            cta: "Get started free",
            features: [
              { label: "Commission-free trades", included: true },
              { label: "Basic charting tools", included: true },
              { label: "Stocks & ETFs", included: true },
              { label: "Mobile & web access", included: true },
              { label: "Advanced charts", included: false },
              { label: "Options trading", included: false },
            ],
          },
          {
            name: "Pro",
            tagline: "For serious investors",
            price: "$9",
            period: "/month",
            cta: "Start Pro trial",
            popular: true,
            features: [
              { label: "Everything in Essential", included: true },
              { label: "Advanced charting (50+ indicators)", included: true },
              { label: "Options & crypto trading", included: true },
              { label: "AI-powered insights", included: true },
              { label: "Extended hours trading", included: true },
              { label: "Priority support", included: false },
            ],
          },
          {
            name: "Elite",
            tagline: "For professional traders",
            price: "$29",
            period: "/month",
            cta: "Contact sales",
            features: [
              { label: "Everything in Pro", included: true },
              { label: "Level 2 market data", included: true },
              { label: "API access", included: true },
              { label: "Priority 24/7 support", included: true },
              { label: "Tax-loss harvesting", included: true },
              { label: "Dedicated account manager", included: true },
            ],
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$12B+", label: "Assets under management" },
          { value: "2.4M", label: "Active investors" },
          { value: "150+", label: "Countries supported" },
          { value: "99.99%", label: "Platform uptime" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by investors worldwide"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join millions who have already made the switch to smarter investing."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Vestora completely transformed how I invest. The AI insights helped me identify opportunities I would have missed. My portfolio is up 28% since switching.",
            name: "Sarah Mitchell",
            role: "Product Manager, San Francisco",
            avatarAlt: "professional headshot of a smiling woman with blonde hair wearing a navy blazer",
          },
          {
            quote:
              "As a day trader, I need speed and precision. Vestora's execution is instant and the charting tools rival professional platforms that cost 10x more.",
            name: "James Rodriguez",
            role: "Day Trader, Miami",
            avatarAlt: "professional headshot of a man with dark hair and trimmed beard wearing a white dress shirt",
          },
          {
            quote:
              "I was intimidated by investing until I found Vestora. The educational resources and simple interface made it easy to start. Now I'm confidently managing my own portfolio.",
            name: "Emily Chen",
            role: "Teacher, Seattle",
            avatarAlt: "professional headshot of a woman with shoulder length brown hair and warm smile",
          },
          {
            quote:
              "The auto-invest feature is a game-changer. I set up weekly deposits and forgot about it. Six months later, I've built a diverse portfolio without lifting a finger.",
            name: "David Park",
            role: "Software Engineer, Austin",
            avatarAlt: "professional headshot of a middle aged man with glasses and graying hair wearing a blue button down shirt",
          },
          {
            quote:
              "Customer support is exceptional. Had a question about options trading at 2 AM and got a helpful response within minutes. That's service you can't put a price on.",
            name: "Aisha Johnson",
            role: "Financial Analyst, Chicago",
            avatarAlt: "professional headshot of a young woman with curly dark hair and natural makeup",
          },
          {
            quote:
              "The tax optimization features alone paid for my Elite subscription. Vestora automatically harvested losses and saved me thousands on my tax bill.",
            name: "Michael Torres",
            role: "Small Business Owner, Denver",
            avatarAlt: "professional headshot of a man in his thirties with short dark hair and clean shaven face",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc = props.faq?.description ?? `Everything you need to know about ${brand}.`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is Vestora really commission-free?",
            answer:
              "Yes, absolutely. We charge $0 commission on all stock, ETF, and options trades. There are no account minimums or maintenance fees for Essential accounts. We make money through premium subscriptions, payment for order flow, and interest on uninvested cash.",
          },
          {
            question: "How is my money protected?",
            answer:
              "Your securities are protected up to $500,000 (including $250,000 for cash claims) by the Securities Investor Protection Corporation (SIPC). Additionally, we use bank-grade 256-bit SSL encryption and offer biometric authentication for all accounts.",
          },
          {
            question: "What markets can I trade?",
            answer:
              "Vestora provides access to US stocks and ETFs listed on NYSE, NASDAQ, and BATS exchanges. Pro and Elite members can also trade options and cryptocurrencies including Bitcoin, Ethereum, and 30+ altcoins. International markets coming Q2 2025.",
          },
          {
            question: "Can I transfer my existing portfolio?",
            answer:
              "Absolutely. Our automated transfer service (ACATS) makes it easy to bring your portfolio from any major brokerage. We handle all the paperwork and typically complete transfers within 5-7 business days. Plus, we'll reimburse any transfer fees up to $500.",
          },
          {
            question: "Do you offer retirement accounts?",
            answer:
              "Yes, we support Traditional IRAs, Roth IRAs, and SEP IRAs with no additional fees. Our AI can help optimize your portfolio based on your retirement timeline and goals. You can also roll over 401(k)s from previous employers.",
          },
          {
            question: "How does the AI insights feature work?",
            answer:
              "Our machine learning algorithms analyze your portfolio, market conditions, news sentiment, and historical patterns to generate personalized insights. These include buy/sell recommendations, risk alerts, and diversification suggestions. Available on Pro and Elite plans.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to start investing smarter?"
    const ctaDesc =
      props.cta?.description ??
      "Join over 2 million investors who have already discovered a better way to grow their wealth. Start with $0 and upgrade anytime."
    const ctaPrimary = props.cta?.primaryCta ?? "Create free account"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a demo"
    const ctaNote = props.cta?.note ?? "No credit card required. Cancel anytime."

    const footerTagline =
      props.footer?.tagline ??
      "Modern investing for everyone. Trade stocks, ETFs, options, and crypto with zero commission."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          { title: "Product", links: ["Features", "Pricing", "Mobile App", "API"] },
          { title: "Company", links: ["About", "Careers", "Press", "Blog"] },
          { title: "Resources", links: ["Help Center", "Investing 101", "Market News", "Tax Center"] },
          { title: "Legal", links: ["Privacy", "Terms", "Disclosures", "FINRA"] },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerDisclosure =
      props.footer?.disclosure ??
      `Securities trading offered through ${brand} Securities LLC, member FINRA/SIPC. Crypto trading offered through ${brand} Crypto LLC. Investing involves risk, including loss of principal.`
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "LinkedIn", "Instagram"]

    // Brand logo tile — the trend-line glyph from the source (decorative brand asset).
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
          className="size-[62%]"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Per-symbol quote tile accent — rotates through token data colors (no raw palette).
    const symbolTones = [
      "bg-chart-1 text-primary-foreground",
      "bg-destructive text-destructive-foreground",
      "bg-chart-4 text-primary-foreground",
      "bg-chart-2 text-primary-foreground",
    ]

    // Decorative gallery card gradient tints (token-based), rotated per item.
    const galleryTints = [
      "from-chart-1/30",
      "from-primary/30",
      "from-chart-4/30",
      "from-chart-2/30",
      "from-chart-5/30",
      "from-chart-3/30",
    ]

    // Feature icon set — strokes inherit a rotating token text color.
    const featureIcons: ReactNode[] = [
      <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg key="coin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg key="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      <svg key="social" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg key="auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>,
    ]
    const featureIconTones = [
      "bg-chart-1/15 text-chart-1",
      "bg-primary/15 text-primary",
      "bg-chart-5/15 text-chart-5",
      "bg-chart-4/20 text-chart-4",
      "bg-chart-3/20 text-chart-3",
      "bg-chart-2/15 text-chart-2",
    ]

    // Up-trend and down-trend mini sparkline paths.
    const trendUp = "M0,35 Q20,28 40,22 T80,6"
    const trendDown = "M0,12 Q20,18 40,24 T80,36"

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">{brand}</span>
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
                  onClick={() => go(heroSignIn)}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  {heroSignIn}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroGetStarted)}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroGetStarted}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                    <span className="size-2 rounded-full bg-chart-1" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{heroSub}</p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-chart-1" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live portfolio card */}
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -right-8 -top-8 -z-10 size-72 rounded-full bg-muted opacity-60 blur-3xl"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-8 -left-8 -z-10 size-72 rounded-full bg-chart-1/15 opacity-60 blur-3xl"
                  />
                  <div className="relative rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-sm text-muted-foreground">{portfolioLabel}</p>
                        <p className="text-3xl font-semibold">{portfolioValue}</p>
                        <p className="text-sm font-medium text-chart-1">{portfolioChange}</p>
                      </div>
                      <div className="flex gap-2">
                        {["1D", "1W", "1M"].map((range, i) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => go(`${range} chart`)}
                            className={cn(
                              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                              i === 1
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-accent",
                            )}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative flex h-48 items-end overflow-hidden rounded-xl bg-gradient-to-b from-chart-1/10 to-transparent px-4 pb-4">
                      <svg
                        className="h-32 w-full text-chart-1"
                        viewBox="0 0 400 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path fill="currentColor" fillOpacity="0.1" d="M0,80 Q50,70 100,60 T200,40 T300,50 T400,20 L400,100 L0,100 Z" />
                        <path fill="none" stroke="currentColor" strokeWidth="2" d="M0,80 Q50,70 100,60 T200,40 T300,50 T400,20" />
                      </svg>
                      <div className="absolute right-4 top-4 rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                        <span className="text-muted-foreground">{indexLabel}</span>
                        <span className="block font-semibold">{indexValue}</span>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
                      {cardStats.map((s, i) => (
                        <div key={s.label}>
                          <p className="mb-1 text-xs text-muted-foreground">{s.label}</p>
                          <p
                            className={cn(
                              "text-lg font-semibold",
                              i === cardStats.length - 1 ? "text-chart-1" : "text-foreground",
                            )}
                          >
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium text-muted-foreground">{logosLabel}</p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Markets */}
          <section id="markets" className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{marketsHeading}</h2>
                <p className="text-lg text-muted-foreground">{marketsDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {quotes.map((q, i) => (
                  <button
                    key={q.symbol}
                    type="button"
                    onClick={() => go(q.symbol)}
                    className="rounded-xl border border-border bg-muted/50 p-6 text-left transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={cn(
                          "grid size-10 place-items-center rounded-lg text-sm font-bold",
                          symbolTones[i % symbolTones.length],
                        )}
                      >
                        {q.symbol}
                      </div>
                      <div>
                        <p className="font-semibold">{q.name}</p>
                        <p className="text-xs text-muted-foreground">{q.exchange}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-semibold">{q.price}</p>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            q.up ? "text-chart-1" : "text-destructive",
                          )}
                        >
                          {q.change}
                        </p>
                      </div>
                      <svg
                        className={cn("h-10 w-20", q.up ? "text-chart-1" : "text-destructive")}
                        viewBox="0 0 80 40"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path fill="none" stroke="currentColor" strokeWidth="2" d={q.up ? trendUp : trendDown} />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Global indices band (dark) */}
              <div className="mt-8 overflow-hidden rounded-2xl bg-foreground p-6 text-background sm:p-8">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-2xl font-semibold">{indicesHeading}</h3>
                    <p className="mb-6 text-background/60">{indicesNote}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {indices.map((idx) => (
                        <div key={idx.name} className="rounded-lg bg-background/10 p-4">
                          <p className="mb-1 text-sm text-background/60">{idx.name}</p>
                          <p className="text-xl font-semibold">{idx.value}</p>
                          <p className={cn("text-sm", idx.up ? "text-chart-1" : "text-destructive")}>
                            {idx.change}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative h-64 min-h-[200px] lg:h-full">
                    <Image
                      alt={indicesImageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="absolute inset-0 size-full rounded-xl object-cover opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{featuresHeading}</h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((f, i) => (
                  <div
                    key={f.title}
                    className="rounded-xl border border-border bg-card p-8 text-card-foreground transition-shadow hover:shadow-lg"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-12 place-items-center rounded-xl [&>svg]:size-6",
                        featureIconTones[i % featureIconTones.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{f.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{stepsHeading}</h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="flex items-start gap-6 lg:flex-col lg:items-center">
                      <div className="grid size-16 flex-shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
                        {i + 1}
                      </div>
                      <div className="flex-1 lg:text-center">
                        <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                        <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 hidden h-0.5 w-full -translate-x-8 bg-border lg:block"
                      >
                        <div className="absolute -top-1.5 right-0 size-3 rounded-full bg-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-16 rounded-2xl bg-muted/50 p-8 lg:p-12">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-semibold">{transferHeading}</h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">{transferDesc}</p>
                    <button
                      type="button"
                      onClick={() => go(transferCta)}
                      className="group inline-flex items-center gap-2 font-medium text-foreground transition-all hover:gap-3"
                    >
                      {transferCta}
                      <ArrowRight className="size-5" />
                    </button>
                  </div>
                  <div className="relative h-64 overflow-hidden rounded-xl lg:h-80">
                    <Image
                      alt={transferImageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery (dark) */}
          <section className="bg-foreground py-24 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{galleryHeading}</h2>
                <p className="text-lg text-background/60">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((g, i) => (
                  <div
                    key={g.title}
                    className="group relative overflow-hidden rounded-xl bg-background/10"
                  >
                    <div
                      className={cn(
                        "flex aspect-[4/3] flex-col bg-gradient-to-br to-background/5 p-6",
                        galleryTints[i % galleryTints.length],
                      )}
                    >
                      <div className="mb-4 flex-1 overflow-hidden rounded-lg bg-foreground/80 p-4">
                        <Image
                          alt={`${g.title} — fintech app interface screenshot`}
                          w={600}
                          h={400}
                          loading="lazy"
                          className="size-full rounded-md object-cover opacity-90"
                        />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold">{g.title}</h3>
                        <p className="text-sm text-background/60">{g.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{pricingHeading}</h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.popular
                        ? "border-2 border-primary bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground",
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-chart-1 px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {popularLabel}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="mb-2 text-lg font-semibold">{tier.name}</h3>
                      <p className={cn("text-sm", tier.popular ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-semibold">{tier.price}</span>
                      <span className={cn(tier.popular ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {tier.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feat) => (
                        <li key={feat.label} className="flex items-start gap-3">
                          {feat.included ? (
                            <Check
                              className={cn(
                                "mt-0.5 size-5 flex-shrink-0",
                                tier.popular ? "text-primary-foreground" : "text-chart-1",
                              )}
                            />
                          ) : (
                            <Cross
                              className={cn(
                                "mt-0.5 size-5 flex-shrink-0",
                                tier.popular ? "text-primary-foreground/40" : "text-muted-foreground/40",
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              feat.included
                                ? tier.popular
                                  ? "text-primary-foreground/90"
                                  : "text-muted-foreground"
                                : tier.popular
                                  ? "text-primary-foreground/50"
                                  : "text-muted-foreground/50",
                            )}
                          >
                            {feat.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-medium transition-colors",
                        tier.popular
                          ? "bg-background text-foreground hover:bg-muted"
                          : "bg-muted text-foreground hover:bg-accent",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="border-y border-border bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-semibold sm:text-5xl">{s.value}</p>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="reviews" className="bg-muted/50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{testimonialsHeading}</h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8 text-card-foreground"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-background py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{faqHeading}</h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-muted/50"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-semibold">{item.question}</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">{item.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA (dark) */}
          <section className="bg-foreground py-24 text-background">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{ctaHeading}</h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-background/60 sm:text-xl">{ctaDesc}</p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-xl border border-background/30 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/50 pb-8 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-semibold tracking-tight">{brand}</span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
                    >
                      <span className="text-xs font-semibold">{social.charAt(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
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
                <p className="max-w-2xl text-center text-xs text-muted-foreground/70 md:text-right">
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
