import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet.tsx'

const parseCurrencyValue = (value: string) => {
  const normalized = value.replace(/[^0-9.-]/g, '')
  const numberValue = Number.parseFloat(normalized)
  return Number.isFinite(numberValue) ? numberValue : 0
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(Math.max(0, value))

const parseTermToMonths = (term: string) => {
  const parsed = Number.parseInt(term.replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 36
}

const estimateApr = (scoreLabel: string) => {
  if (scoreLabel.toLowerCase().includes('excellent')) return 6.99
  if (scoreLabel.toLowerCase().includes('good')) return 8.99
  if (scoreLabel.toLowerCase().includes('fair')) return 12.99
  return 16.99
}

const estimateMonthlyPayment = (
  amount: number,
  apr: number,
  months: number,
) => {
  const principal = Math.max(100, amount)
  const rate = Math.max(0, apr) / 12 / 100
  if (months <= 0) return 0
  if (rate === 0) return principal / months

  return (principal * rate) / (1 - Math.pow(1 + rate, -months))
}

/**
 * LendingKimiPage — a complete, self-contained personal-LENDING / loan marketing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "ClearLoan" design: a calm,
 * trustworthy fintech aesthetic on a warm neutral canvas with white cards and a
 * single near-ink brand color. It pairs a split hero (headline + trust pills
 * beside a live-looking loan-calculator card) with a press/logos strip, a 6-up
 * "why us" benefits grid, a 3-step "how it works" flow, an interactive
 * rate-calculator panel (amount slider, purpose, term, credit-tier selectors +
 * estimated-offer summary), a transparent rates/fees band with a sample
 * payment-schedule table, a stats/about split with a glowing photo and a
 * floating review card, a 3-up borrower-testimonials grid, an accordion FAQ, a
 * dark "ready to check your rate?" CTA band, and a rich multi-column footer
 * with legal disclosures. The block owns ALL layout, spacing, depth and type
 * hierarchy. Every nav item / CTA / link routes through `useNavigate` (never a
 * dead "#"). All imagery uses the alt-driven <Image> component. Callers supply
 * ONLY content data; rich defaults make it render great with no props at all.
 */
export const LendingKimiPage = defineCapsule({
  name: 'LendingKimiPage',
  description:
    "Complete personal-LENDING / loan marketing landing page with a calm, trustworthy fintech aesthetic: warm neutral canvas, clean white cards, a single near-ink brand color, and conversion-focused copy. Includes a split hero (transparent-rate headline, trust pills, dual CTAs) beside a live loan-calculator card (amount, credit score, term, est. APR & monthly payment), a press/'featured in' logos strip, a 6-up benefits grid (funds in 24h, no hidden fees, fixed rates, paperless, human support, soft credit check), a 3-step 'how it works' flow, an interactive personalized rate calculator with an estimated-offer summary, a transparent rates & fees band ($0 origination, $0 prepayment) with a sample APR payment-schedule table, a stats/about split with a photo and floating 5-star review card, a 3-up borrower-testimonials grid, an accordion FAQ, a dark 'ready to check your rate?' CTA band with security badges, and a multi-column footer with legal disclosures. Use as the ROOT/home page for personal-loan lenders, lending marketplaces, debt-consolidation services, fintech credit products, BNPL or financing brands, or any 'apply for a loan / check your rate' product when a clean, transparent, trust-building, APR-and-calculator-driven page is wanted. Supply content only — brand, nav, hero, calculator, logos, benefits, steps, rates, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  lakebed: {
    schema: {
      loanLeads: table({
        source: string(),
        borrowerName: string(),
        email: string(),
        amount: number(),
        purpose: string(),
        term: string(),
        creditBand: string(),
        estimatedApr: string(),
        estimatedMonthlyPayment: string(),
      }),
    },
    queries: {
      loanLeads: ({ db }) => db.loanLeads.orderBy('createdAt').all(),
    },
    mutations: {
      addLoanLead: (
        { db },
        source: string,
        borrowerName: string,
        email: string,
        amount: number,
        purpose: string,
        term: string,
        creditBand: string,
        estimatedApr: string,
        estimatedMonthlyPayment: string,
      ) => {
        db.loanLeads.insert({
          source,
          borrowerName,
          email,
          amount,
          purpose,
          term,
          creditBand,
          estimatedApr,
          estimatedMonthlyPayment,
        })

        return db.loanLeads.all()
      },
      removeLoanLead: ({ db }, id: string) => {
        db.loanLeads.delete(id)

        return db.loanLeads.all()
      },
      clearLoanLeads: ({ db }) => {
        for (const lead of db.loanLeads.all()) {
          db.loanLeads.delete(lead.id)
        }

        return []
      },
    },
  },
  props: z.object({
    /** Brand / lender name shown in navbar, CTAs and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section + the in-hero loan calculator card. */
    hero: z
      .object({
        headingLead: z.string().optional(),
        /** Phrase rendered in the muted accent tone. */
        headingHighlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
        cardTitle: z.string().optional(),
        cardSubtitle: z.string().optional(),
        amountLabel: z.string().optional(),
        amountValue: z.string().optional(),
        scoreLabel: z.string().optional(),
        scoreOptions: z.array(z.string()).optional(),
        termLabel: z.string().optional(),
        terms: z.array(z.string()).optional(),
        aprLabel: z.string().optional(),
        aprValue: z.string().optional(),
        paymentLabel: z.string().optional(),
        paymentValue: z.string().optional(),
        cardCta: z.string().optional(),
      })
      .optional(),
    /** Press / "featured in" logos strip. */
    logos: z
      .object({
        caption: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why borrowers choose us" benefits grid. */
    benefits: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** 3-step "how it works" flow. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              note: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Interactive personalized rate calculator panel. */
    calculator: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        detailsTitle: z.string().optional(),
        amountLabel: z.string().optional(),
        amountValue: z.string().optional(),
        amountMin: z.string().optional(),
        amountMax: z.string().optional(),
        purposeLabel: z.string().optional(),
        purposes: z.array(z.string()).optional(),
        termLabel: z.string().optional(),
        termValue: z.string().optional(),
        terms: z.array(z.string()).optional(),
        scoreLabel: z.string().optional(),
        scores: z
          .array(z.object({ tier: z.string(), range: z.string() }))
          .optional(),
        offerTitle: z.string().optional(),
        paymentLabel: z.string().optional(),
        paymentValue: z.string().optional(),
        paymentNote: z.string().optional(),
        summary: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        cta: z.string().optional(),
        ctaNote: z.string().optional(),
      })
      .optional(),
    /** Transparent rates & fees band + sample payment-schedule table. */
    rates: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        highlights: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              note: z.string(),
            }),
          )
          .optional(),
        guarantees: z
          .array(z.object({ title: z.string(), note: z.string() }))
          .optional(),
        tableTitle: z.string().optional(),
        tableHead: z.array(z.string()).optional(),
        tableRows: z.array(z.array(z.string())).optional(),
        tableNote: z.string().optional(),
      })
      .optional(),
    /** Stats / about split with photo + floating review card. */
    stats: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
        reviewQuote: z.string().optional(),
        reviewName: z.string().optional(),
        reviewMeta: z.string().optional(),
        reviewAvatarAlt: z.string().optional(),
      })
      .optional(),
    /** Borrower testimonials grid. */
    testimonials: z
      .object({
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
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Dark "ready to check your rate?" CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        phone: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Multi-column footer. */
    footer: z
      .object({
        tagline: z.string().optional(),
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
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [leadDrawerOpen, setLeadDrawerOpen] = useState(false)
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email || ''
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Guest'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authPicture = auth.picture || auth.user?.picture
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const loanLeads = lakebed.useQuery('loanLeads')
    const addLoanLead = lakebed.useMutation('addLoanLead')
    const removeLoanLead = lakebed.useMutation('removeLoanLead')
    const clearLoanLeads = lakebed.useMutation('clearLoanLeads')
    const storedLeads = loanLeads ?? []
    const leadCount = storedLeads.length
    const leadSubtotal = storedLeads.reduce(
      (total, lead) => total + (Number.isFinite(lead.amount) ? lead.amount : 0),
      0,
    )
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const brand = props.brand ?? 'ClearLoan'
    const nav = props.nav?.length
      ? props.nav
      : ['How it Works', 'Rate Calculator', 'Rates & Terms', 'FAQ']

    const heroLead = props.hero?.headingLead ?? 'Personal loans made'
    const heroHighlight = props.hero?.headingHighlight ?? 'refreshingly simple'
    const heroSub =
      props.hero?.subheading ??
      'Borrow $1,000 to $50,000 with fixed rates starting at 6.99% APR. No hidden fees, no prepayment penalties, and funds as soon as tomorrow.'
    const heroPrimary = props.hero?.primaryCta ?? 'Check Your Rate'
    const heroSecondary = props.hero?.secondaryCta ?? 'See How It Works'
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ['No impact to credit score', '2-minute application']
    const heroCardTitle = props.hero?.cardTitle ?? 'Loan Calculator'
    const heroCardSubtitle =
      props.hero?.cardSubtitle ?? 'Estimate your monthly payment'
    const heroAmountLabel = props.hero?.amountLabel ?? 'Loan Amount'
    const heroAmountValue = props.hero?.amountValue ?? '15000'
    const heroScoreLabel = props.hero?.scoreLabel ?? 'Credit Score'
    const heroScoreOptions = props.hero?.scoreOptions?.length
      ? props.hero.scoreOptions
      : [
          'Excellent (750+)',
          'Good (700-749)',
          'Fair (650-699)',
          'Average (600-649)',
        ]
    const heroTermLabel = props.hero?.termLabel ?? 'Loan Term'
    const heroTerms = props.hero?.terms?.length
      ? props.hero.terms
      : ['36 mo', '48 mo', '60 mo']
    const heroAprLabel = props.hero?.aprLabel ?? 'Est. APR'
    const heroPaymentLabel = props.hero?.paymentLabel ?? 'Monthly Payment'
    const heroCardCta = props.hero?.cardCta ?? 'Get My Personalized Rate'
    const [heroAmount, setHeroAmount] = useState(
      () => parseCurrencyValue(heroAmountValue) || 15000,
    )
    const [heroTerm, setHeroTerm] = useState(
      heroTerms.includes('48 mo') ? '48 mo' : (heroTerms[0] ?? '36 mo'),
    )
    const [heroScore, setHeroScore] = useState(
      heroScoreOptions[2] ?? heroScoreOptions[0] ?? 'Average (600-649)',
    )

    const heroApr = Math.max(
      0,
      Number.parseFloat(estimateApr(heroScore).toFixed(2)),
    )
    const heroMonthlyPayment = estimateMonthlyPayment(
      heroAmount,
      heroApr,
      parseTermToMonths(heroTerm),
    )
    const heroAprLabelValue = `${heroApr.toFixed(2)}%`
    const heroPaymentLabelValue = `${formatCurrency(heroMonthlyPayment)}`

    const heroLeadSource = `${heroPrimary} / Hero`

    const logosCaption =
      props.logos?.caption ??
      'Featured in and trusted by over 250,000 borrowers'
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ['TechCrunch', 'Forbes', 'Bloomberg', 'CNBC', 'NerdWallet', 'Bankrate']

    const benefitsHeading =
      props.benefits?.heading ?? 'Why borrowers choose ClearLoan'
    const benefitsDesc =
      props.benefits?.description ??
      'No hidden fees, no surprises. Just honest lending with terms that work for you.'
    const benefitItems = props.benefits?.items?.length
      ? props.benefits.items
      : [
          {
            title: 'Funds in 24 hours',
            description:
              'Once approved, money hits your account as soon as the next business day. No waiting, no stress.',
          },
          {
            title: 'No hidden fees',
            description:
              'Zero origination fees, zero prepayment penalties, zero late fees. What you see is what you pay.',
          },
          {
            title: 'Fixed rates for life',
            description:
              "Your rate never changes. Budget with confidence knowing exactly what you'll pay every month.",
          },
          {
            title: 'Paperless application',
            description:
              'Apply in under 2 minutes from your phone or laptop. No printing, no faxing, no branch visits.',
          },
          {
            title: 'Human support',
            description:
              'Real people, real help. Our California-based team is available 7 days a week by phone or chat.',
          },
          {
            title: 'Soft credit check',
            description:
              "Checking your rate won't affect your credit score. Apply with confidence, no strings attached.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? 'How it works'
    const stepsDesc =
      props.steps?.description ??
      'Three simple steps to get the funds you need.'
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Check your rate',
            description:
              "Tell us how much you need and what it's for. We'll show you personalized rates in 2 minutes—no impact to your credit score.",
            note: 'Takes 2 minutes',
          },
          {
            title: 'Choose your terms',
            description:
              'Pick the loan amount and term that fit your budget. Adjust your monthly payment until it feels right.',
            note: 'Takes 5 minutes',
          },
          {
            title: 'Get funded',
            description:
              "E-sign your documents and we'll deposit funds directly to your bank account as soon as the next business day.",
            note: 'Next day delivery',
          },
        ]

    const calcHeading =
      props.calculator?.heading ?? 'Personalized rate calculator'
    const calcDesc =
      props.calculator?.description ??
      'See what you could save with a ClearLoan.'
    const calcDetailsTitle = props.calculator?.detailsTitle ?? 'Loan Details'
    const calcAmountLabel = props.calculator?.amountLabel ?? 'Loan Amount'
    const calcAmountValue = props.calculator?.amountValue ?? '20,000'
    const calcAmountMin = props.calculator?.amountMin ?? '$1,000'
    const calcAmountMax = props.calculator?.amountMax ?? '$50,000'
    const calcAmountMinNumber = Math.max(
      0,
      Math.round(parseCurrencyValue(calcAmountMin)),
    )
    const calcAmountMaxNumber = Math.max(
      calcAmountMinNumber,
      Math.round(parseCurrencyValue(calcAmountMax)) || 50000,
    )
    const calcPurposeLabel = props.calculator?.purposeLabel ?? 'Loan Purpose'
    const calcPurposes = props.calculator?.purposes?.length
      ? props.calculator.purposes
      : [
          'Debt Consolidation',
          'Home Improvement',
          'Medical Expenses',
          'Auto Purchase',
          'Education',
          'Major Purchase',
          'Vacation',
          'Other',
        ]
    const calcTermLabel = props.calculator?.termLabel ?? 'Loan Term'
    const calcTermValue = props.calculator?.termValue ?? '48 months'
    const calcTerms = props.calculator?.terms?.length
      ? props.calculator.terms
      : ['36 mo', '48 mo', '60 mo']
    const calcScoreLabel =
      props.calculator?.scoreLabel ?? 'Your Credit Score Range'
    const calcScores = props.calculator?.scores?.length
      ? props.calculator.scores
      : [
          { tier: 'Excellent', range: '750+' },
          { tier: 'Good', range: '700-749' },
          { tier: 'Fair', range: '650-699' },
          { tier: 'Average', range: '600-649' },
        ]
    const calcOfferTitle = props.calculator?.offerTitle ?? 'Estimated Offer'
    const calcPaymentLabel = props.calculator?.paymentLabel ?? 'Monthly Payment'
    const calcPaymentNote =
      props.calculator?.paymentNote ?? 'per month for 48 months'
    const calcSummary = props.calculator?.summary?.length
      ? props.calculator.summary
      : [
          { label: 'Loan Amount', value: '$20,000' },
          { label: 'Est. APR', value: '8.99%' },
          { label: 'Origination Fee', value: '$0' },
          { label: 'Total Interest', value: '$2,944' },
        ]
    const calcCta = props.calculator?.cta ?? 'Get My Real Rate'
    const calcCtaNote =
      props.calculator?.ctaNote ?? "Checking won't affect your credit score"
    const [calcAmount, setCalcAmount] = useState(() => {
      const initialAmount = parseCurrencyValue(calcAmountValue) || 20000
      return Math.min(
        Math.max(initialAmount, calcAmountMinNumber || 0),
        calcAmountMaxNumber || 50000,
      )
    })
    const [calcPurpose, setCalcPurpose] = useState(
      calcPurposes[0] ?? 'General financing',
    )
    const [calcTerm, setCalcTerm] = useState(
      calcTerms.includes('48 mo')
        ? '48 mo'
        : (calcTermValue as string) || calcTerms[0] || '36 mo',
    )
    const [calcScoreIndex, setCalcScoreIndex] = useState(
      Math.min(
        Math.max(
          calcScores.findIndex((item) => item.tier === 'Excellent'),
          0,
        ),
        3,
      ),
    )
    const selectedCalcScore = calcScores[calcScoreIndex] ?? calcScores[0]
    const calcApr = estimateApr(selectedCalcScore?.tier ?? 'Average')
    const calcTermMonths = parseTermToMonths(calcTerm)
    const calcMonthlyPayment = estimateMonthlyPayment(
      calcAmount,
      calcApr,
      calcTermMonths,
    )
    const calcSummaryRows = [
      {
        label: calcSummary[0]?.label ?? 'Loan Amount',
        value: formatCurrency(calcAmount),
      },
      {
        label: calcSummary[1]?.label ?? 'Est. APR',
        value: `${calcApr.toFixed(2)}%`,
      },
      {
        label: calcSummary[2]?.label ?? 'Origination Fee',
        value: calcSummary[2]?.value ?? '$0',
      },
      {
        label: calcSummary[3]?.label ?? 'Total Interest',
        value: formatCurrency(calcMonthlyPayment * calcTermMonths - calcAmount),
      },
    ]
    const calcPaymentValueDisplay = formatCurrency(calcMonthlyPayment)
    const openLeadFromCalculator = (source: string) => {
      void addLoanLead(
        source,
        authDisplayName,
        authEmail,
        calcAmount,
        calcPurpose,
        calcTerm,
        `${selectedCalcScore?.tier ?? 'Average'} (${selectedCalcScore?.range ?? '600-649'})`,
        `${calcApr.toFixed(2)}%`,
        calcPaymentValueDisplay,
      )
      setLeadDrawerOpen(true)
    }
    const openLeadFromHero = () => {
      void addLoanLead(
        heroLeadSource,
        authDisplayName,
        authEmail,
        heroAmount,
        calcPurpose,
        heroTerm,
        heroScore,
        `${heroApr.toFixed(2)}%`,
        heroPaymentLabelValue,
      )
      setLeadDrawerOpen(true)
    }
    const handlePrimaryLeadAction = () => {
      openLeadFromHero()
      go(heroPrimary)
    }
    const handleRateCardLeadAction = () => {
      openLeadFromHero()
      go(heroCardCta)
    }
    const handleCalcLeadAction = () => {
      openLeadFromCalculator(calcCta)
      go(calcCta)
    }
    const handleCallToActionLead = () => {
      openLeadFromCalculator(ctaPrimary)
      go(ctaPrimary)
    }

    const ratesHeading = props.rates?.heading ?? 'Transparent rates & terms'
    const ratesDesc =
      props.rates?.description ??
      "No surprises, no hidden fees. Know exactly what you're getting."
    const rateHighlights = props.rates?.highlights?.length
      ? props.rates.highlights
      : [
          {
            value: '6.99%',
            label: 'Starting APR',
            note: 'For borrowers with excellent credit on 36-month terms',
          },
          {
            value: '$0',
            label: 'Origination Fee',
            note: 'Unlike banks that charge up to 8%, we take zero fees upfront',
          },
          {
            value: '$0',
            label: 'Prepayment Penalty',
            note: 'Pay off your loan early anytime with no extra charges',
          },
        ]
    const rateGuarantees = props.rates?.guarantees?.length
      ? props.rates.guarantees
      : [
          {
            title: 'No late fees',
            note: "Life happens. We don't penalize honest mistakes.",
          },
          {
            title: 'No check fees',
            note: 'No extra charges for paper checks or payment methods.',
          },
          {
            title: 'No annual fees',
            note: 'Pay for your loan once, not every year.',
          },
        ]
    const tableTitle = props.rates?.tableTitle ?? 'Sample loan payment schedule'
    const tableHead = props.rates?.tableHead?.length
      ? props.rates.tableHead
      : [
          'Credit Tier',
          'APR Range',
          '$10,000 / 36 mo',
          '$25,000 / 48 mo',
          '$40,000 / 60 mo',
        ]
    const tableRows = props.rates?.tableRows?.length
      ? props.rates.tableRows
      : [
          [
            'Excellent (750+)',
            '6.99% - 9.99%',
            '$308 - $323',
            '$563 - $621',
            '$782 - $889',
          ],
          [
            'Good (700-749)',
            '8.99% - 12.99%',
            '$318 - $337',
            '$597 - $666',
            '$835 - $956',
          ],
          [
            'Fair (650-699)',
            '12.99% - 16.99%',
            '$337 - $357',
            '$666 - $736',
            '$956 - $1,075',
          ],
          [
            'Average (600-649)',
            '16.99% - 24.99%',
            '$357 - $393',
            '$736 - $858',
            '$1,075 - $1,260',
          ],
        ]
    const tableNote =
      props.rates?.tableNote ??
      '* Rates shown are estimates. Your actual rate will be determined after application review. All loans subject to credit approval.'

    const statsHeading =
      props.stats?.heading ?? 'Trusted by over 250,000 borrowers'
    const statsDesc =
      props.stats?.description ??
      "Since 2019, we've helped people consolidate debt, fund major purchases, and achieve financial goals without the stress of traditional lending."
    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '$1.2B+', label: 'In loans funded' },
          { value: '4.9/5', label: 'Average rating' },
          { value: '2 min', label: 'Average application' },
          { value: '24 hrs', label: 'Average funding time' },
        ]
    const statsImageAlt =
      props.stats?.imageAlt ??
      'diverse group of professionals collaborating in modern office setting'
    const statsReviewQuote =
      props.stats?.reviewQuote ??
      "ClearLoan helped me consolidate $18,000 in credit card debt. I'm saving $340/month and paying off 3 years sooner."
    const statsReviewName = props.stats?.reviewName ?? 'Sarah Mitchell'
    const statsReviewMeta = props.stats?.reviewMeta ?? 'San Francisco, CA'
    const statsReviewAvatarAlt =
      props.stats?.reviewAvatarAlt ??
      'professional headshot of a smiling woman with brown hair in business attire'

    const testimonialsHeading =
      props.testimonials?.heading ?? 'What our borrowers say'
    const testimonialsDesc =
      props.testimonials?.description ??
      'Real stories from real people who achieved their financial goals.'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              'I needed $12,000 for a kitchen renovation. The application took literally 90 seconds, and I had the money in my account the next morning. No stress, no hidden fees.',
            name: 'Marcus Chen',
            meta: 'Seattle, WA · Home Improvement Loan',
            avatarAlt:
              'professional headshot of a smiling man with short dark hair and beard',
          },
          {
            quote:
              "After my car broke down unexpectedly, I needed $8,000 fast. ClearLoan came through when my bank wouldn't even return my call. The rate was better than my credit union too.",
            name: 'Jennifer Park',
            meta: 'Denver, CO · Auto Repair Loan',
            avatarAlt:
              'professional headshot of a smiling woman with blonde hair wearing casual attire',
          },
          {
            quote:
              "I consolidated $22,000 across three credit cards. My rate dropped from 24% to 9.5%, and I'm saving over $400 a month. I can finally see a path to being debt-free.",
            name: 'David Rodriguez',
            meta: 'Austin, TX · Debt Consolidation',
            avatarAlt:
              'professional headshot of a smiling man with glasses and business casual attire',
          },
        ]

    const faqHeading = props.faq?.heading ?? 'Frequently asked questions'
    const faqDesc =
      props.faq?.description ?? 'Everything you need to know about ClearLoan.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: 'What can I use a ClearLoan for?',
            a: "You can use a ClearLoan for almost any personal purpose: debt consolidation, home improvements, medical expenses, auto purchases, education costs, major purchases, vacations, or unexpected expenses. We don't allow loans for illegal activities, gambling, or investing in securities.",
          },
          {
            q: 'Will checking my rate affect my credit score?',
            a: 'No. Checking your rate with ClearLoan uses a soft credit inquiry, which does not affect your credit score. Only if you choose to accept a loan offer and proceed with the full application will we perform a hard credit inquiry, which may have a small temporary impact on your score.',
          },
          {
            q: 'How quickly will I receive my funds?',
            a: "Once your loan is approved and you e-sign your documents, we typically deposit funds directly to your bank account within 1 business day. In some cases, it may take up to 3 business days depending on your bank's processing times. You'll receive an email with tracking details as soon as the transfer is initiated.",
          },
          {
            q: 'Can I pay off my loan early?',
            a: "Absolutely. You can pay off your ClearLoan in full at any time with zero prepayment penalties. You can also make additional principal payments anytime through your online account or mobile app. Paying early reduces the total interest you'll pay over the life of the loan.",
          },
          {
            q: 'What are the eligibility requirements?',
            a: 'To qualify for a ClearLoan, you must: be at least 18 years old (19 in Alabama and Nebraska), be a U.S. citizen or permanent resident, have a valid Social Security number, have a verifiable bank account, and have a minimum annual income of $25,000. We also consider your credit history, debt-to-income ratio, and other factors.',
          },
          {
            q: 'What happens if I miss a payment?',
            a: "Unlike traditional lenders, ClearLoan doesn't charge late fees. However, missed payments may be reported to credit bureaus and could impact your credit score. If you're having trouble making a payment, contact us immediately—our support team can work with you on options like payment date changes or temporary hardship programs.",
          },
          {
            q: 'How is ClearLoan different from a credit card?',
            a: 'ClearLoan offers fixed-rate installment loans with set monthly payments and a defined payoff date. Credit cards typically have variable rates, minimum payments that can keep you in debt longer, and no clear end date. Our loans are designed to help you pay off debt faster and save money on interest—our average borrower saves $4,200 compared to carrying the same balance on a credit card.',
          },
        ]

    const ctaHeading = props.cta?.heading ?? 'Ready to check your rate?'
    const ctaDesc =
      props.cta?.description ??
      "It takes 2 minutes, won't affect your credit score, and could save you thousands compared to credit cards."
    const ctaPrimary = props.cta?.primary ?? 'Check My Rate'
    const ctaPhone = props.cta?.phone ?? 'Call (800) 555-1234'
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ['256-bit SSL encryption', 'Bank-level security', 'No spam, ever']

    const footerTagline =
      props.footer?.tagline ??
      'Simple, honest personal loans. No hidden fees, no surprises.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: 'Products',
            links: [
              'Personal Loans',
              'Debt Consolidation',
              'Home Improvement',
              'Medical Loans',
              'Auto Loans',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Partners', 'Contact'],
          },
          {
            title: 'Resources',
            links: [
              'Help Center',
              'Blog',
              'Loan Calculator',
              'Credit Education',
              'Refer a Friend',
            ],
          },
        ]
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclosures']
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerDisclosure =
      props.footer?.disclosure ??
      'ClearLoan Inc. NMLS ID #1234567. Loans are made by ClearLoan Inc. or lending partners. All loans are subject to credit approval. Your actual rate depends on credit score, loan amount, loan term, credit usage and history. Example: A $15,000 loan with an APR of 10.99% and 48 month term would have monthly payments of $384. The total amount paid would be $18,432. Annual percentage rates (APRs) through ClearLoan range from 6.99% to 24.99%.'

    const Logo = ({ className }: { className?: string }) => (
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
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

    const benefitIcons = [
      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    ]

    const inputCls =
      'w-full rounded-lg border border-input bg-muted px-4 py-3 font-medium text-foreground transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-ring'

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
                  <Logo className="size-5" />
                </span>
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
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                      >
                        <Avatar size="sm" className="size-6" aria-hidden="true">
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
                        <span className="max-w-24 truncate">
                          {authDisplayName}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={10}
                      className="w-64 rounded-xl border-border bg-background p-3 shadow-xl"
                    >
                      <p className="mb-3 text-xs text-muted-foreground">
                        Signed in as
                      </p>
                      <p className="mb-4 truncate text-sm font-semibold text-foreground">
                        {authDisplayName}
                      </p>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => go('Account')}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
                        >
                          Account
                        </button>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
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
                    className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                  >
                    {authLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePrimaryLeadAction}
                  className="relative rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Apply Now
                  {leadCount > 0 ? (
                    <span className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-background px-1.5 py-0.5 text-[0.65rem] font-bold text-foreground">
                      {leadCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  aria-label="Open saved applications"
                  onClick={() => setLeadDrawerOpen(true)}
                  className="hidden h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
                >
                  {leadCount || '0'}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <Sheet open={leadDrawerOpen} onOpenChange={setLeadDrawerOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-left">
                Saved loan applications
              </SheetTitle>
              <SheetDescription>
                Review your generated application drafts before continuing.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
              {storedLeads.length ? (
                <div className="space-y-4">
                  {storedLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-border bg-muted p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <p className="text-sm font-semibold text-foreground">
                          {lead.borrowerName || authDisplayName}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            void removeLoanLead(lead.id)
                          }}
                          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {lead.purpose} · {lead.term} · {lead.creditBand}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatCurrency(
                            Number.isFinite(lead.amount)
                              ? lead.amount
                              : parseCurrencyValue(`${lead.amount}`),
                          )}
                        </span>
                        <span className="font-medium">
                          {lead.estimatedMonthlyPayment}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        APR {lead.estimatedApr} · from {lead.source}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No saved applications yet
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Add a quick rate estimate from any calculator CTA.
                  </p>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Draft count</span>
                  <span className="font-semibold text-foreground">
                    {leadCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total requested</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(leadSubtotal)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void clearLoanLeads()
                  }}
                  disabled={!storedLeads.length}
                  className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"
                >
                  Clear all drafts
                </button>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-muted px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                  >
                    Continue browsing
                  </button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroLead}{' '}
                    <span className="text-muted-foreground">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePrimaryLeadAction}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-base font-medium text-foreground transition-colors hover:bg-accent"
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
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hero calculator card */}
                <div className="relative">
                  <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
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
                      </span>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {heroCardTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroCardSubtitle}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          {heroAmountLabel}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <input
                            type="number"
                            value={heroAmount}
                            onChange={(event) =>
                              setHeroAmount(
                                parseCurrencyValue(event.target.value) || 0,
                              )
                            }
                            className={cn(inputCls, 'pl-8')}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          {heroScoreLabel}
                        </label>
                        <select
                          value={heroScore}
                          onChange={(event) => setHeroScore(event.target.value)}
                          className={cn(inputCls, 'appearance-none')}
                        >
                          {heroScoreOptions.map((opt) => (
                            <option key={opt} className="bg-background">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
                          {heroTermLabel}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {heroTerms.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => {
                                setHeroTerm(term)
                                go(`${heroTermLabel}: ${term}`)
                              }}
                              className={cn(
                                'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                                heroTerm === term
                                  ? 'border-2 border-primary bg-muted text-foreground'
                                  : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground',
                              )}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-border pt-4">
                        <div className="mb-2 flex items-baseline justify-between">
                          <span className="text-sm text-muted-foreground">
                            {heroAprLabel}
                          </span>
                          <span className="text-lg font-semibold text-foreground">
                            {heroAprLabelValue}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted-foreground">
                            {heroPaymentLabel}
                          </span>
                          <span className="text-3xl font-semibold text-foreground">
                            {heroPaymentLabelValue}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRateCardLeadAction}
                        className="w-full rounded-xl bg-primary py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        {heroCardCta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosCaption}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center gap-2 text-foreground"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                      aria-hidden="true"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span className="text-lg font-semibold">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {benefitsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {benefitsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {benefitItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm"
                  >
                    <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground">
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
                        <path d={benefitIcons[i % benefitIcons.length]} />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
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

          {/* Steps */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="h-full rounded-2xl border border-border bg-card p-8">
                      <div className="mb-6 grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                        {step.title}
                      </h3>
                      <p className="mb-4 leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-4"
                          aria-hidden="true"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{step.note}</span>
                      </div>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div className="absolute -right-6 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-8 text-muted-foreground"
                          aria-hidden="true"
                        >
                          <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Calculator */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {calcHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{calcDesc}</p>
              </div>
              <div className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                  <div className="grid lg:grid-cols-2">
                    <div className="p-8 lg:p-10">
                      <h3 className="mb-6 text-lg font-semibold text-card-foreground">
                        {calcDetailsTitle}
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <div className="mb-3 flex justify-between text-sm font-medium text-foreground">
                            <span>{calcAmountLabel}</span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(calcAmount)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={calcAmountMinNumber}
                            max={calcAmountMaxNumber}
                            step={500}
                            value={calcAmount}
                            onChange={(event) =>
                              setCalcAmount(
                                Math.min(
                                  calcAmountMaxNumber,
                                  Math.max(
                                    calcAmountMinNumber,
                                    Number.parseInt(event.target.value, 10) ||
                                      0,
                                  ),
                                ),
                              )
                            }
                            aria-label={calcAmountLabel}
                            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                          />
                          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>{calcAmountMin}</span>
                            <span>{calcAmountMax}</span>
                          </div>
                        </div>
                        <div>
                          <label className="mb-3 block text-sm font-medium text-foreground">
                            {calcPurposeLabel}
                          </label>
                          <select
                            value={calcPurpose}
                            onChange={(event) =>
                              setCalcPurpose(event.target.value)
                            }
                            className={cn(
                              inputCls,
                              'appearance-none font-normal',
                            )}
                          >
                            {calcPurposes.map((p) => (
                              <option key={p} className="bg-background">
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="mb-3 flex justify-between text-sm font-medium text-foreground">
                            <span>{calcTermLabel}</span>
                            <span className="font-semibold text-foreground">
                              {calcTerm}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {calcTerms.map((term) => (
                              <button
                                key={term}
                                type="button"
                                onClick={() => {
                                  setCalcTerm(term)
                                  go(`${calcTermLabel}: ${term}`)
                                }}
                                className={cn(
                                  'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                                  calcTerm === term
                                    ? 'border-2 border-primary bg-muted text-foreground'
                                    : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground',
                                )}
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="mb-3 block text-sm font-medium text-foreground">
                            {calcScoreLabel}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {calcScores.map((s, i) => (
                              <button
                                key={s.tier}
                                type="button"
                                onClick={() => {
                                  setCalcScoreIndex(i)
                                  go(`Credit: ${s.tier}`)
                                }}
                                className={cn(
                                  'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                                  calcScoreIndex === i
                                    ? 'border-2 border-primary bg-muted text-foreground'
                                    : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground',
                                )}
                              >
                                <div className="font-semibold">{s.tier}</div>
                                <div className="text-xs text-muted-foreground">
                                  {s.range}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border bg-muted p-8 lg:border-l lg:border-t-0 lg:p-10">
                      <h3 className="mb-6 text-lg font-semibold text-foreground">
                        {calcOfferTitle}
                      </h3>
                      <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-card p-6">
                          <div className="mb-1 text-sm text-muted-foreground">
                            {calcPaymentLabel}
                          </div>
                          <div className="text-4xl font-bold text-card-foreground">
                            {calcPaymentValueDisplay}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {calcPaymentNote}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {calcSummaryRows.map((row, i) => (
                            <div
                              key={row.label}
                              className={cn(
                                'flex justify-between py-2',
                                i < calcSummaryRows.length - 1 &&
                                  'border-b border-border',
                              )}
                            >
                              <span className="text-muted-foreground">
                                {row.label}
                              </span>
                              <span
                                className={cn(
                                  'font-medium',
                                  row.value === '$0'
                                    ? 'text-primary'
                                    : 'text-foreground',
                                )}
                              >
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={handleCalcLeadAction}
                            className="w-full rounded-xl bg-primary py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            {calcCta}
                          </button>
                          <p className="mt-3 text-center text-xs text-muted-foreground">
                            {calcCtaNote}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rates & terms */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {ratesHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {ratesDesc}
                </p>
              </div>
              <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
                  {rateHighlights.map((h) => (
                    <div key={h.label} className="p-8 text-center">
                      <div className="mb-2 text-4xl font-bold text-card-foreground">
                        {h.value}
                      </div>
                      <div className="mb-4 text-sm text-muted-foreground">
                        {h.label}
                      </div>
                      <p className="text-sm text-muted-foreground">{h.note}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border bg-muted px-8 py-6">
                  <div className="grid gap-6 text-sm md:grid-cols-3">
                    {rateGuarantees.map((g) => (
                      <div key={g.title} className="flex items-start gap-3">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 size-5 shrink-0 text-primary"
                          aria-hidden="true"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <span className="font-medium text-foreground">
                            {g.title}
                          </span>
                          <p className="mt-1 text-muted-foreground">{g.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-8 max-w-5xl rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">
                  {tableTitle}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {tableHead.map((th) => (
                          <th
                            key={th}
                            className="px-4 py-3 text-left font-medium text-muted-foreground"
                          >
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      {tableRows.map((row, ri) => (
                        <tr
                          key={row[0]}
                          className={cn(
                            ri < tableRows.length - 1 &&
                              'border-b border-border',
                          )}
                        >
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className={cn(
                                'px-4 py-3',
                                ci === 0 && 'font-medium',
                              )}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {tableNote}
                </p>
              </div>
            </div>
          </section>

          {/* Stats / about */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {statsHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {statsDesc}
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    {statsItems.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl border border-border bg-muted p-6"
                      >
                        <div className="mb-1 text-3xl font-bold text-foreground">
                          {s.value}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={statsImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="w-full rounded-2xl object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border bg-card p-6 shadow-lg">
                    <div className="mb-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-3 text-sm text-card-foreground">
                      &ldquo;{statsReviewQuote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={statsReviewAvatarAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-card-foreground">
                          {statsReviewName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {statsReviewMeta}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
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
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
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
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition-colors hover:bg-accent">
                      <span className="pr-4 font-medium text-card-foreground">
                        {item.q}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section className="bg-foreground py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
                {ctaDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCallToActionLead}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90 sm:w-auto"
                >
                  {ctaPrimary}
                  <ArrowRight className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/40 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10 sm:w-auto"
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
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {ctaPhone}
                </button>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-background/60">
                {ctaBadges.map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-background text-foreground">
                    <Logo className="size-5" />
                  </span>
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm text-background/60">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {(['Twitter', 'Instagram', 'LinkedIn'] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-background/60 transition-colors hover:text-background"
                      >
                        <span className="text-sm font-medium">{social}</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
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
                      className="text-background/60 transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-6 max-w-4xl text-xs text-background/40">
                {footerDisclosure}
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
