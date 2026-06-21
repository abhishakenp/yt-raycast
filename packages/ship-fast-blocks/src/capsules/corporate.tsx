import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
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
 * CorporateKimiPage — a complete, self-contained ENTERPRISE / B2B corporate
 * marketing homepage.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Nexus Enterprise Solutions"
 * design: a clean, professional, neutral light aesthetic (white + soft muted
 * bands, near-black accents) built for Fortune 500 credibility. It pairs a
 * split hero (trust pill + serious headline + dual CTAs + compliance badges +
 * showcase photo with a floating ROI stat card), a logo trust-bar, a 6-up
 * enterprise solutions grid, a 4-phase implementation timeline, a 6-up global
 * office gallery with gradient caption overlays, a 3-tier transparent pricing
 * table (with a featured dark "Most Popular" plan), a dark KPI stats band, a
 * 3-up testimonial grid with star ratings, an accordion FAQ, a dark final CTA,
 * and a fat 5-column footer with social icons and legal links.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item,
 * CTA, footer link, social and form-submit routes through `useNavigate` (never
 * a dead "#"), and navbar labels match the `nav` array so PageSwitch can swap
 * pages. All content imagery uses the alt-driven <Image> component. Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const CorporateKimiPage = defineCapsule({
  name: 'CorporateKimiPage',
  description:
    "Complete ENTERPRISE / corporate B2B marketing homepage with a clean, professional, trustworthy aesthetic: white canvas, soft muted section bands, neutral near-black accents and serious typography built for Fortune 500 credibility. Includes a split hero (live trust badge, authoritative headline, dual CTAs, SOC 2 / ISO compliance check-marks, and a showcase office photo with a floating ROI stat card), a client logo trust-bar, a 6-up enterprise solutions grid with icons (cloud infrastructure, security & compliance, data analytics, digital transformation, managed services, risk management), a numbered 4-phase implementation timeline, a 6-up global office gallery with gradient-caption overlays, a 3-tier transparent pricing table with a featured dark 'Most Popular' plan, a dark KPI stats band, a 3-up customer testimonial grid with star ratings and avatars, an accordion FAQ, a dark conversion CTA, and a fat 5-column footer with social icons and legal links. Use as the ROOT/home page for enterprise software vendors, cloud-infrastructure / SaaS platforms, IT consultancies, digital-transformation firms, managed-services providers, financial / B2B services companies, or any corporate site that needs gravitas, compliance signals, and pricing. Supply content only — brand, nav, hero, logos, solutions, steps, offices, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Compliance / trust check-marks under the CTAs. */
        badges: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Floating stat card over the hero image. */
        statLabel: z.string().optional(),
        statValue: z.string().optional(),
      })
      .optional(),
    /** Client logo trust-bar. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Enterprise solutions / features grid. */
    solutions: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered implementation timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Global office gallery. */
    offices: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              caption: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Transparent pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark KPI stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Customer testimonial grid. */
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
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Final conversion CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Fat footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      demoRequests: table({
        company: string(),
        email: string(),
        message: string(),
        plan: string(),
      }),
    },
    queries: {
      demoRequests: ({ db }) => db.demoRequests.orderBy('createdAt').all(),
    },
    mutations: {
      submitDemoRequest: (
        { db },
        company: string,
        email: string,
        message: string,
        plan: string,
      ) => {
        db.demoRequests.insert({ company, email, message, plan })
        return db.demoRequests.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [demoOpen, setDemoOpen] = useState(false)
    const [demoCompany, setDemoCompany] = useState('')
    const [demoEmail, setDemoEmail] = useState('')
    const [demoMessage, setDemoMessage] = useState('')
    const [demoPlan, setDemoPlan] = useState('Enterprise')

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

    const submitDemoRequest = lakebed.useMutation('submitDemoRequest')

    const handleDemoSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      void submitDemoRequest(demoCompany, demoEmail, demoMessage, demoPlan)
      setDemoCompany('')
      setDemoEmail('')
      setDemoMessage('')
      setDemoOpen(false)
    }

    // Normalization helpers to handle malformed generated props
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      value !== null && typeof value === 'object' && !Array.isArray(value)

    const nonEmptyString = (value: unknown, fallback: string): string =>
      typeof value === 'string' && value.trim().length > 0
        ? value.trim()
        : fallback

    const normalizeStringArray = (
      value: unknown,
      fallback: string[],
    ): string[] => {
      if (!Array.isArray(value)) return fallback
      return value.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0,
      )
    }

    const normalizeObjectArray = <T extends Record<string, unknown>>(
      value: unknown,
      requiredKeys: (keyof T)[],
      fallback: T[],
    ): T[] => {
      if (!Array.isArray(value)) return fallback
      return value.filter((item): item is T => {
        if (!isRecord(item)) return false
        return requiredKeys.every((key) => {
          const fieldValue = item[String(key)]
          return typeof fieldValue === 'string' && fieldValue.trim().length > 0
        })
      })
    }

    const brand = nonEmptyString(props.brand, 'Nexus')
    const nav = normalizeStringArray(props.nav, [
      'Solutions',
      'Customers',
      'Pricing',
      'Investors',
      'Company',
    ])

    const heroBadge = nonEmptyString(
      props.hero?.badge,
      'Trusted by 500+ Enterprise Clients',
    )
    const heroHeading = nonEmptyString(
      props.hero?.heading,
      'Enterprise infrastructure for the modern economy',
    )
    const heroSub = nonEmptyString(
      props.hero?.subheading,
      "Nexus delivers mission-critical cloud infrastructure, enterprise software, and digital transformation solutions that power the world's most demanding organizations. From Fortune 500 to high-growth startups.",
    )
    const heroPrimary = nonEmptyString(
      props.hero?.primaryCta,
      'Schedule a Demo',
    )
    const heroSecondary = nonEmptyString(
      props.hero?.secondaryCta,
      'Explore Solutions',
    )
    const heroBadges = normalizeStringArray(props.hero?.badges, [
      'SOC 2 Type II Certified',
      'ISO 27001 Compliant',
    ])
    const heroImageAlt = nonEmptyString(
      props.hero?.imageAlt,
      'Modern corporate office interior with glass walls and collaborative workspace',
    )
    const heroStatLabel = nonEmptyString(props.hero?.statLabel, 'Average ROI')
    const heroStatValue = nonEmptyString(props.hero?.statValue, '340%')

    const logosHeading = nonEmptyString(
      props.logos?.heading,
      'Trusted by leading enterprises worldwide',
    )
    const logoItems = normalizeStringArray(props.logos?.items, [
      'AcmeCorp',
      'Globex',
      'Initech',
      'Hooli',
      'Massive',
      'Soylent',
    ])

    const solutionsHeading = nonEmptyString(
      props.solutions?.heading,
      'Enterprise solutions built for scale',
    )
    const solutionsDesc = nonEmptyString(
      props.solutions?.description,
      'Comprehensive infrastructure and software solutions designed to meet the security, compliance, and performance demands of global enterprises.',
    )
    const solutionItems = normalizeObjectArray(
      props.solutions?.items,
      ['title', 'description'],
      [
        {
          title: 'Cloud Infrastructure',
          description:
            'Multi-cloud orchestration platform supporting AWS, Azure, and GCP with unified management, cost optimization, and automated scaling.',
        },
        {
          title: 'Security & Compliance',
          description:
            'Enterprise-grade security with zero-trust architecture, continuous compliance monitoring, and automated threat detection and response.',
        },
        {
          title: 'Data Analytics',
          description:
            'Real-time analytics platform with AI-powered insights, predictive modeling, and custom dashboards for executive decision-making.',
        },
        {
          title: 'Digital Transformation',
          description:
            'End-to-end transformation consulting, legacy modernization, and agile implementation to accelerate your digital journey.',
        },
        {
          title: 'Managed Services',
          description:
            '24/7 operations center with dedicated teams for monitoring, incident response, and proactive system optimization.',
        },
        {
          title: 'Risk Management',
          description:
            'Comprehensive risk assessment frameworks, business continuity planning, and disaster recovery with industry-leading RTOs.',
        },
      ],
    )

    const stepsHeading = nonEmptyString(
      props.steps?.heading,
      'Implementation in four phases',
    )
    const stepsDesc = nonEmptyString(
      props.steps?.description,
      'Our proven methodology ensures seamless deployment with minimal disruption to your operations.',
    )
    const stepItems = normalizeObjectArray(
      props.steps?.items,
      ['title', 'description'],
      [
        {
          title: 'Discovery',
          description:
            'Comprehensive assessment of your current infrastructure, workflows, and business objectives. We identify opportunities and define success metrics.',
        },
        {
          title: 'Design',
          description:
            'Custom architecture design tailored to your requirements. Security-first approach with scalability built into every component.',
        },
        {
          title: 'Deployment',
          description:
            'Phased rollout with parallel systems during transition. Our team manages the entire process with 24/7 support throughout.',
        },
        {
          title: 'Optimization',
          description:
            'Continuous monitoring and refinement post-deployment. Regular reviews ensure maximum ROI and alignment with evolving needs.',
        },
      ],
    )

    const officesHeading = nonEmptyString(
      props.offices?.heading,
      'Global presence, local expertise',
    )
    const officesDesc = nonEmptyString(
      props.offices?.description,
      '14 offices across 6 continents, serving clients in 47 countries with round-the-clock support.',
    )
    const officeItems = normalizeObjectArray(
      props.offices?.items,
      ['title', 'caption', 'imageAlt'],
      [
        {
          title: 'New York Headquarters',
          caption: 'Global HQ & Innovation Center',
          imageAlt: 'Modern glass skyscraper corporate headquarters at sunset',
        },
        {
          title: 'London Office',
          caption: 'EMEA Regional Hub',
          imageAlt:
            'Tower Bridge and modern city skyline in London at golden hour',
        },
        {
          title: 'Tokyo Office',
          caption: 'APAC Operations Center',
          imageAlt: 'Tokyo cityscape with illuminated skyscrapers at night',
        },
        {
          title: 'Sydney Office',
          caption: 'ANZ Regional Office',
          imageAlt: 'Sydney Opera House and harbor waterfront panorama',
        },
        {
          title: 'Singapore Office',
          caption: 'Southeast Asia Hub',
          imageAlt: 'Singapore Marina Bay skyline with modern architecture',
        },
        {
          title: 'Berlin Office',
          caption: 'European Development Center',
          imageAlt:
            'Modern corporate building in Berlin with contemporary architecture',
        },
      ],
    )

    const pricingHeading = nonEmptyString(
      props.pricing?.heading,
      'Transparent enterprise pricing',
    )
    const pricingDesc = nonEmptyString(
      props.pricing?.description,
      'Flexible plans designed to scale with your organization. All plans include implementation support.',
    )
    const pricingPlans = normalizeObjectArray(
      props.pricing?.plans,
      ['name', 'blurb', 'price', 'features', 'cta'],
      [
        {
          name: 'Professional',
          blurb: 'For growing teams up to 250 employees',
          price: '$2,500',
          period: '/month',
          features: [
            'Up to 5 cloud environments',
            '24/7 email and chat support',
            'Standard security features',
            'Basic analytics dashboard',
            'Quarterly business reviews',
          ],
          cta: 'Get Started',
          featured: false,
        },
        {
          name: 'Enterprise',
          blurb: 'For mid-size organizations up to 5,000 employees',
          price: '$8,500',
          period: '/month',
          features: [
            'Unlimited cloud environments',
            '24/7 phone, email & chat support',
            'Advanced security & compliance',
            'Custom analytics & AI insights',
            'Monthly business reviews',
            'Dedicated success manager',
          ],
          cta: 'Contact Sales',
          featured: true,
          badge: 'Most Popular',
        },
        {
          name: 'Global',
          blurb: 'For large enterprises with 5,000+ employees',
          price: 'Custom',
          period: '',
          features: [
            'Everything in Enterprise',
            'Multi-region deployment',
            'Custom SLAs & contracts',
            'On-premise deployment options',
            'Executive advisory board access',
          ],
          cta: 'Contact Sales',
          featured: false,
        },
      ],
    )

    const statItems = normalizeObjectArray(
      props.stats?.items,
      ['value', 'label'],
      [
        { value: '$2.4B', label: 'Customer cost savings delivered' },
        { value: '500+', label: 'Enterprise clients worldwide' },
        { value: '99.99%', label: 'Platform uptime SLA' },
        { value: '14', label: 'Global office locations' },
      ],
    )

    const testimonialsHeading = nonEmptyString(
      props.testimonials?.heading,
      'Trusted by industry leaders',
    )
    const testimonialsDesc = nonEmptyString(
      props.testimonials?.description,
      'See how leading organizations transformed their operations with Nexus.',
    )
    const testimonialItems = normalizeObjectArray(
      props.testimonials?.items,
      ['quote', 'name', 'role', 'avatarAlt'],
      [
        {
          quote:
            "Nexus transformed our infrastructure in just 90 days. We reduced operational costs by 40% while improving system reliability. Their team's expertise is unmatched in the industry.",
          name: 'Michael Chen',
          role: 'CTO, Meridian Financial Group',
          avatarAlt:
            'Professional headshot of a smiling male executive in business attire',
        },
        {
          quote:
            'The security and compliance features gave our board complete confidence. We passed our SOC 2 audit with zero findings—a first for our company. Nexus made it possible.',
          name: 'Sarah Williams',
          role: 'CISO, Horizon Healthcare Systems',
          avatarAlt:
            'Professional headshot of a female executive with confident expression',
        },
        {
          quote:
            'We evaluated 12 vendors before choosing Nexus. Their analytics platform helped us identify $3.2M in operational inefficiencies within the first quarter.',
          name: 'David Park',
          role: 'COO, Pacific Logistics Inc.',
          avatarAlt:
            'Professional headshot of a middle-aged male business leader with glasses',
        },
      ],
    )

    const faqHeading = nonEmptyString(
      props.faq?.heading,
      'Frequently asked questions',
    )
    const faqDesc = nonEmptyString(
      props.faq?.description,
      'Everything you need to know about Nexus enterprise solutions.',
    )
    const faqItems = normalizeObjectArray(
      props.faq?.items,
      ['q', 'a'],
      [
        {
          q: 'What is the typical implementation timeline?',
          a: 'Most implementations are completed within 90-120 days, depending on complexity and scope. Our phased approach ensures minimal disruption to your operations, with parallel systems running during the transition period. Enterprise and Global plans include dedicated project managers to accelerate deployment.',
        },
        {
          q: 'How does your pricing model work?',
          a: 'Our Professional and Enterprise plans are priced as flat monthly subscriptions based on employee count and feature requirements. The Global plan is customized based on your specific needs, including multi-region deployment, custom SLAs, and specialized compliance requirements. All plans include implementation support.',
        },
        {
          q: 'What security certifications do you maintain?',
          a: 'Nexus maintains SOC 2 Type II, ISO 27001, ISO 9001, and HIPAA compliance certifications. Our platform is GDPR compliant and we undergo annual third-party security audits. Enterprise and Global customers receive access to our compliance documentation and can request custom security assessments.',
        },
        {
          q: 'Do you offer on-premise deployment options?',
          a: 'Yes, our Global plan includes on-premise, hybrid, and private cloud deployment options for organizations with specific data residency or regulatory requirements. Our solutions can be deployed in your own data centers while maintaining the same management and monitoring capabilities as our cloud offering.',
        },
        {
          q: 'What support options are available?',
          a: 'Professional plans include 24/7 email and chat support with 4-hour response times. Enterprise plans add 24/7 phone support and dedicated success managers with 1-hour response times. Global plans include a dedicated technical account manager, quarterly business reviews, and custom SLA guarantees.',
        },
        {
          q: 'Can I integrate with existing systems?',
          a: 'Absolutely. Nexus provides comprehensive REST APIs, webhooks, and pre-built connectors for major enterprise systems including Salesforce, SAP, Oracle, Workday, ServiceNow, and 200+ other platforms. Our integration team can build custom connectors for proprietary systems as part of your implementation.',
        },
      ],
    )

    const ctaHeading = nonEmptyString(
      props.cta?.heading,
      'Ready to transform your enterprise?',
    )
    const ctaDesc = nonEmptyString(
      props.cta?.description,
      'Join 500+ organizations that trust Nexus for mission-critical infrastructure. Schedule a personalized demo with our solutions team.',
    )
    const ctaPrimary = nonEmptyString(props.cta?.primaryCta, 'Schedule a Demo')
    const ctaSecondary = nonEmptyString(
      props.cta?.secondaryCta,
      'Contact Sales',
    )
    const ctaNote = nonEmptyString(
      props.cta?.note,
      'Average response time: Under 2 hours during business hours',
    )

    const footerAbout = nonEmptyString(
      props.footer?.about,
      'Nexus Enterprise Solutions delivers mission-critical cloud infrastructure and digital transformation services to organizations worldwide.',
    )
    const footerColumns = normalizeObjectArray(
      props.footer?.columns,
      ['title', 'links'],
      [
        {
          title: 'Solutions',
          links: [
            'Cloud Infrastructure',
            'Security',
            'Data Analytics',
            'Digital Transformation',
            'Managed Services',
          ],
        },
        {
          title: 'Company',
          links: [
            'About Us',
            'Careers',
            'Press',
            'Partners',
            'Investor Relations',
          ],
        },
        {
          title: 'Resources',
          links: [
            'Documentation',
            'API Reference',
            'Case Studies',
            'Blog',
            'Contact',
          ],
        },
      ],
    )
    const footerCopyright = nonEmptyString(
      props.footer?.copyright,
      '© 2026 Nexus Enterprise Solutions, Inc. All rights reserved.',
    )
    const footerLegal = normalizeStringArray(props.footer?.legal, [
      'Privacy Policy',
      'Terms of Service',
      'Cookie Policy',
    ])

    // Brand logo tile — solid token surface with the brand initial (decorative brand asset).
    const LogoMark = ({
      className,
      inverse,
    }: {
      className?: string
      inverse?: boolean
    }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg font-bold',
          inverse
            ? 'bg-background text-foreground'
            : 'bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
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

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground"
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

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-chart-4"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const solutionIcons: ReactNode[] = [
      // cloud / server
      <svg
        key="cloud"
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
        <rect x="3" y="3" width="18" height="6" rx="2" />
        <rect x="3" y="15" width="18" height="6" rx="2" />
        <line x1="7" y1="6" x2="7" y2="6" />
        <line x1="7" y1="18" x2="7" y2="18" />
      </svg>,
      // shield / lock
      <svg
        key="shield"
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
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </svg>,
      // analytics / chart
      <svg
        key="chart"
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
        <line x1="6" y1="20" x2="6" y2="13" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="18" y1="20" x2="18" y2="9" />
      </svg>,
      // transformation / refresh
      <svg
        key="refresh"
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
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
      // managed services / team
      <svg
        key="team"
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
        <circle cx="9" cy="7" r="3" />
        <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
        <path d="M17 11a3 3 0 000-6" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
      </svg>,
      // risk / verified shield
      <svg
        key="risk"
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
        <path d="M12 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016A11.955 11.955 0 0112 2.944z" />
        <path d="M9 12l2 2 4-4" />
      </svg>,
    ]

    const socialIcons: { label: string; path: string }[] = [
      {
        label: 'LinkedIn',
        path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
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

    const sectionHead = (heading: string, desc: string) => (
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {heading}
        </h2>
        <p className="text-lg text-muted-foreground">{desc}</p>
      </div>
    )

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            aria-label="Main navigation"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-sm" />
                <span className="text-lg font-semibold tracking-tight">
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
                  onClick={() => setDemoOpen(true)}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  {ctaSecondary}
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
                <Sheet open={demoOpen} onOpenChange={setDemoOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setDemoOpen(true)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Request Demo
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">
                        Request a Demo
                      </SheetTitle>
                      <SheetDescription>
                        Schedule a personalized demo with our solutions team.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <form onSubmit={handleDemoSubmit} className="space-y-4">
                        <div>
                          <label
                            htmlFor="company"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Company Name
                          </label>
                          <input
                            id="company"
                            type="text"
                            value={demoCompany}
                            onChange={(e) => setDemoCompany(e.target.value)}
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Your company name"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Work Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={demoEmail}
                            onChange={(e) => setDemoEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="you@company.com"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="plan"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Plan Interest
                          </label>
                          <select
                            id="plan"
                            value={demoPlan}
                            onChange={(e) => setDemoPlan(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="Professional">Professional</option>
                            <option value="Enterprise">Enterprise</option>
                            <option value="Global">Global</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="message"
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Message (Optional)
                          </label>
                          <textarea
                            id="message"
                            value={demoMessage}
                            onChange={(e) => setDemoMessage(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Tell us about your needs..."
                          />
                        </div>
                      </form>
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        className="w-full rounded-lg"
                        onClick={handleDemoSubmit}
                        disabled={!demoCompany || !demoEmail}
                      >
                        Submit Request
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-lg"
                        >
                          Cancel
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v) => !v)}
                  className="p-2 text-muted-foreground hover:text-foreground md:hidden"
                >
                  <svg
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
                    <path d="M4 6h16M4 12h16M4 18h16" />
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
                        className="w-full rounded-lg"
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
                      className="w-full rounded-lg"
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
          <section className="relative overflow-hidden bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setDemoOpen(true)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                    {heroBadges.map((b) => (
                      <span key={b} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    loading="eager"
                    className="aspect-[4/3] w-full rounded-xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-muted text-foreground">
                        <svg
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
                          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {heroStatLabel}
                        </p>
                        <p className="text-lg font-semibold text-card-foreground">
                          {heroStatValue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo trust-bar */}
          <section className="border-b border-border bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-12 items-center justify-center"
                  >
                    <span className="text-xl font-bold text-muted-foreground">
                      {logo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Solutions / features */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(solutionsHeading, solutionsDesc)}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {solutionItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-xl border border-border bg-muted/50 p-8 transition-colors hover:border-border/60"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-lg bg-foreground text-background">
                      {solutionIcons[i % solutionIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                    >
                      Learn more
                      <ArrowRight className="ml-1 size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Implementation timeline */}
          <section className="bg-muted/50 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(stepsHeading, stepsDesc)}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-12 place-items-center rounded-full bg-foreground">
                      <span className="font-semibold text-background">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-6 hidden h-px w-full -translate-x-6 bg-border lg:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Global office gallery */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(officesHeading, officesDesc)}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {officeItems.map((office) => (
                  <button
                    key={office.title}
                    type="button"
                    onClick={() => go(office.title)}
                    className="group relative block overflow-hidden rounded-xl text-left"
                  >
                    <Image
                      alt={office.imageAlt}
                      w={600}
                      h={450}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/60 to-transparent p-6">
                      <div>
                        <p className="font-semibold text-background">
                          {office.title}
                        </p>
                        <p className="text-sm text-background/80">
                          {office.caption}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(pricingHeading, pricingDesc)}
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      'relative rounded-xl border p-8',
                      plan.featured
                        ? 'border-foreground bg-foreground'
                        : 'border-border bg-background',
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <h3
                      className={cn(
                        'mb-2 text-lg font-semibold',
                        plan.featured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        'mb-6 text-sm',
                        plan.featured
                          ? 'text-background/70'
                          : 'text-muted-foreground',
                      )}
                    >
                      {plan.blurb}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          'text-4xl font-semibold',
                          plan.featured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className={cn(
                            plan.featured
                              ? 'text-background/70'
                              : 'text-muted-foreground',
                          )}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="mb-8 space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check
                            className={cn(
                              'mt-0.5 size-5 flex-shrink-0',
                              plan.featured
                                ? 'text-primary-foreground'
                                : 'text-primary',
                            )}
                          />
                          <span
                            className={cn(
                              'text-sm',
                              plan.featured
                                ? 'text-background/80'
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
                        setDemoPlan(plan.name)
                        setDemoOpen(true)
                      }}
                      className={cn(
                        'w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                        plan.featured
                          ? 'bg-background text-foreground hover:bg-muted'
                          : 'bg-muted text-foreground hover:bg-accent',
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Dark KPI stats band */}
          <section className="bg-foreground py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="mb-2 text-4xl font-semibold text-background lg:text-5xl">
                      {stat.value}
                    </p>
                    <p className="text-sm text-background/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {sectionHead(testimonialsHeading, testimonialsDesc)}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-muted/50 p-8"
                  >
                    <div className="mb-6 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
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
          <section className="bg-muted/50 py-20 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-background open:ring-1 open:ring-border"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-medium text-foreground">{item.q}</h3>
                      <span className="transition group-open:rotate-180">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
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
          <section className="bg-foreground py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-lg border border-background/40 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <LogoMark inverse className="size-8 text-sm" />
                  <span className="text-lg font-semibold tracking-tight text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-background/70">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {socialIcons.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      aria-label={social.label}
                      onClick={() => go(social.label)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
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
                <div key={col.title}>
                  <h4 className="mb-4 font-medium text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/70 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
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
          </div>
        </footer>
      </div>
    )
  },
})
