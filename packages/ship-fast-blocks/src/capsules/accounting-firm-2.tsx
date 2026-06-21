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
 * AccountingFirmKimiPage2 — a SECOND, visually distinct accounting-firm /
 * chartered-accountant marketing page, a faithful Tailwind v4 port of a
 * Kimi-generated "Stellar Financial Partners" design. This is the bold,
 * high-contrast sibling to AccountingFirmKimiPage (Northridge), intended so
 * repeat "accounting-firm" prompts yield a different look.
 *
 * Mood: a dramatic DARK hero band (deep foreground surface) lit by a single
 * vivid brand accent (mapped to `primary`), an animated "trusted by" pill,
 * a glowing photo with a floating tax-savings stat card, then alternating
 * light/muted bands. Sections, in order: sticky translucent navbar with a
 * "Book Consultation" CTA, the dark split hero (status pill + two-line
 * headline + dual CTAs + reviewer avatar stack with star rating + photo with
 * a floating "£12.4M Tax Saved" card), a "trusted by" client logo strip, a
 * 6-up services grid with icon tiles and feature checklists, a DARK 4-up
 * stats band, a split "how we work" 3-step process with a floating savings
 * card, a 4-up leadership team grid with headshots + LinkedIn/email links, a
 * 3-up star-rated testimonials grid, a 3-tier pricing table with a dark
 * highlighted "Most Popular" plan, a 5-item FAQ accordion, a vivid `primary`
 * CTA band with a phone button, a contact section pairing office/phone/email/
 * hours details with a real inquiry form, and a dark multi-column footer with
 * social icons and an ICAEW-registration legal line.
 *
 * The block owns ALL layout, spacing and type. Every nav item / CTA / link /
 * social / form-submit routes through `useNavigate` (never a dead "#"). All
 * content imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content; rich defaults make it render great with no props.
 */
export const AccountingFirmKimiPage2 = defineCapsule({
  name: 'AccountingFirmKimiPage2',
  description:
    'Second, alternative accounting-firm / CPA / chartered-accountant marketing page — a bold, high-contrast sibling style to AccountingFirmKimiPage, built so repeat accounting-firm requests render a distinct look. Mood: a dramatic DARK split hero (deep foreground surface lit by a single vivid brand accent) with an animated trusted-by status pill, a two-line headline, dual CTAs, a reviewer avatar stack with a star rating, and a glowing hero photo carrying a floating tax-savings stat card; then alternating light and muted bands. Includes a sticky translucent navbar with a Book-Consultation CTA, a trusted-by client logo strip, a 6-up services grid (tax planning & compliance, audit & assurance, payroll & bookkeeping, business advisory, property & construction, personal tax & wealth) with icon tiles and feature checklists, a dark 4-up stats band (tax saved, active clients, years, retention), a split how-we-work 3-step process with a floating average-savings card, a 4-up leadership team grid with headshots and LinkedIn/email links, a 3-up star-rated testimonials grid, a 3-tier transparent pricing table with a dark highlighted Most-Popular plan, a 5-item FAQ accordion, a vivid primary CTA band with a phone button, and a contact section pairing office/phone/email/hours details with a real inquiry form, plus a dark multi-column footer with social icons and an ICAEW-registration legal line. Use as the ROOT/home page for accounting firms, chartered accountants, CPA practices, tax-planning & compliance services, audit & assurance firms, payroll & bookkeeping providers, business advisory, property/construction accounting, or personal tax & wealth practices when a credible, conversion-focused services site with a striking dark hero, pricing, team and FAQ is wanted — pick this when a punchier, higher-contrast alternative to the calmer AccountingFirmKimiPage is desired. Supply content only; the block owns all layout and styling.',
  props: z.object({
    /** Firm / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Small line under the brand name in the navbar. */
    brandTagline: z.string().optional(),
    /** Sticky-navbar CTA label. */
    navCta: z.string().optional(),
    /** Hero section content. */
    hero: z
      .object({
        pill: z.string().optional(),
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        avatarAlts: z.array(z.string()).optional(),
        rating: z.string().optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
      })
      .optional(),
    /** Trusted-by client logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services / capabilities grid. */
    services: z
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
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** How-we-work process band. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
        cardValue: z.string().optional(),
        cardLabel: z.string().optional(),
      })
      .optional(),
    /** Leadership team grid. */
    team: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        members: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Client testimonials grid. */
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
    /** Transparent pricing tiers. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
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
    /** FAQ accordion. */
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
    /** Vivid CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryButton: z.string().optional(),
        phoneButton: z.string().optional(),
      })
      .optional(),
    /** Contact section (details + inquiry form). */
    contact: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        address: z.array(z.string()).optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.array(z.string()).optional(),
        services: z.array(z.string()).optional(),
        submit: z.string().optional(),
        disclaimer: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        servicesHeading: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyHeading: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        legalHeading: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        registration: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      inquiries: table({
        firstName: string(),
        lastName: string(),
        email: string(),
        phone: string(),
        service: string(),
        message: string(),
      }),
      bookings: table({
        serviceName: string(),
        tierName: string(),
        firstName: string(),
        lastName: string(),
        email: string(),
        date: string(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
      bookings: ({ db }) => db.bookings.orderBy('createdAt').all(),
    },
    mutations: {
      submitInquiry: (
        { db },
        data: {
          firstName: string
          lastName: string
          email: string
          phone: string
          service: string
          message: string
        },
      ) => {
        db.inquiries.insert(data)
        return db.inquiries.all()
      },
      createBooking: (
        { db },
        data: {
          serviceName: string
          tierName: string
          firstName: string
          lastName: string
          email: string
          date: string
        },
      ) => {
        db.bookings.insert(data)
        return db.bookings.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [bookingOpen, setBookingOpen] = useState(false)
    const [selectedTier] = useState<{ name: string; tagline: string } | null>(
      null,
    )
    const [inquiryForm] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      service: '',
      message: '',
    })
    const [bookingForm, setBookingForm] = useState({
      firstName: '',
      lastName: '',
      email: '',
      date: '',
    })

    const inquiries = lakebed.useQuery('inquiries')
    const bookings = lakebed.useQuery('bookings')
    const createBooking = lakebed.useMutation('createBooking')
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

    const savedInquiries = inquiries ?? []
    const savedBookings = bookings ?? []

    const brand = props.brand ?? 'Stellar Financial'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'About', 'Our Team', 'Testimonials']
    const brandTagline = props.brandTagline ?? 'Chartered Accountants'
    const navCta = props.navCta ?? 'Book Consultation'

    const heroPill =
      props.hero?.pill ?? 'Trusted by 500+ Businesses Across the UK'
    const heroHeadingTop = props.hero?.headingTop ?? 'Financial Clarity.'
    const heroHeadingAccent = props.hero?.headingAccent ?? 'Business Growth.'
    const heroSub =
      props.hero?.subheading ??
      "Award-winning chartered accountants providing tax planning, audit assurance, and strategic business advisory. We've saved our clients over £12.4 million in tax since 2018."
    const heroPrimary = props.hero?.primaryCta ?? 'Free Consultation'
    const heroSecondary = props.hero?.secondaryCta ?? 'Our Services'
    const heroAvatarAlts = props.hero?.avatarAlts?.length
      ? props.hero.avatarAlts
      : [
          'professional headshot of a senior businessman in navy suit',
          'professional headshot of a businesswoman with confident smile',
          'professional headshot of a middle-aged man with glasses',
        ]
    const heroRating = props.hero?.rating ?? '4.9/5 from 312 reviews'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'professional accountant reviewing financial documents with calculator and charts on desk'
    const heroStatValue = props.hero?.statValue ?? '£12.4M'
    const heroStatLabel = props.hero?.statLabel ?? 'Tax Saved for Clients'

    const logosHeading =
      props.logos?.heading ?? 'Trusted by leading businesses across industries'
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : [
          'TechFlow',
          'Apex Homes',
          'GreenLeaf',
          'MedCare+',
          'BuildRight',
          'Nexus Retail',
        ]

    const servicesEyebrow = props.services?.eyebrow ?? 'Our Services'
    const servicesHeading =
      props.services?.heading ?? 'Comprehensive Financial Solutions'
    const servicesDesc =
      props.services?.description ??
      'From day-to-day bookkeeping to complex tax restructuring, we provide end-to-end financial services tailored to your business needs.'
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: 'Tax Planning & Compliance',
            description:
              'Strategic tax planning for individuals and businesses. Corporation tax, self-assessment, VAT returns, and HMRC investigations handled expertly.',
            points: [
              'Corporate Tax Returns',
              'Self Assessment',
              'VAT & MTD Compliance',
            ],
          },
          {
            title: 'Audit & Assurance',
            description:
              'Independent statutory audits, internal audits, and assurance services. Registered auditors with the ICAEW and FRC regulated.',
            points: [
              'Statutory Audits',
              'Internal Controls Review',
              'Due Diligence',
            ],
          },
          {
            title: 'Payroll & Bookkeeping',
            description:
              'Complete payroll management, CIS submissions, and real-time bookkeeping. Integrated with Xero, QuickBooks, and Sage.',
            points: [
              'Monthly Payroll Processing',
              'Auto-Enrolment Pension',
              'CIS Scheme Management',
            ],
          },
          {
            title: 'Business Advisory',
            description:
              "Strategic growth planning, cash flow forecasting, and funding support. We've helped 47 businesses secure over £8.2M in growth funding.",
            points: [
              'Business Plan Development',
              'Cash Flow Forecasting',
              'Funding Applications',
            ],
          },
          {
            title: 'Property & Construction',
            description:
              'Specialist services for property developers and construction firms. CIS compliance, SDLT calculations, and capital allowances claims.',
            points: [
              'Capital Allowances',
              'Stamp Duty Land Tax',
              'Development Accounting',
            ],
          },
          {
            title: 'Personal Tax & Wealth',
            description:
              'Estate planning, inheritance tax mitigation, and personal wealth structuring. Protect and grow your personal wealth for generations.',
            points: [
              'Inheritance Tax Planning',
              'Trust & Estate Admin',
              'Capital Gains Planning',
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '£12.4M', label: 'Tax Saved for Clients' },
          { value: '500+', label: 'Active Business Clients' },
          { value: '15', label: 'Years of Excellence' },
          { value: '98%', label: 'Client Retention Rate' },
        ]

    const processEyebrow = props.process?.eyebrow ?? 'How We Work'
    const processHeading =
      props.process?.heading ?? 'A Proven Process for Financial Success'
    const processDesc =
      props.process?.description ??
      "We've refined our approach over 15 years to deliver maximum value with minimum disruption to your business operations."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: 'Discovery & Assessment',
            description:
              'We conduct a comprehensive review of your financial position, identifying opportunities and risks within 48 hours of engagement.',
          },
          {
            title: 'Strategic Planning',
            description:
              'Our partners develop a tailored roadmap with clear milestones, projected savings, and measurable KPIs for your approval.',
          },
          {
            title: 'Implementation & Support',
            description:
              'We execute the plan with dedicated account managers, monthly reviews, and 24/7 access to your financial dashboard.',
          },
        ]
    const processImageAlt =
      props.process?.imageAlt ??
      'business team meeting in modern conference room reviewing financial reports together'
    const processCardValue = props.process?.cardValue ?? '£2.3M'
    const processCardLabel =
      props.process?.cardLabel ?? 'Average client savings'

    const teamEyebrow = props.team?.eyebrow ?? 'Our Team'
    const teamHeading = props.team?.heading ?? 'Meet Your Financial Partners'
    const teamDesc =
      props.team?.description ??
      'ICAEW chartered accountants and tax specialists with decades of combined experience across Big Four and mid-tier firms.'
    const teamMembers = props.team?.members?.length
      ? props.team.members
      : [
          {
            name: 'James Whitfield',
            role: 'Managing Partner',
            bio: 'ICAEW Chartered Accountant with 22 years experience. Former KPMG audit partner specializing in mid-market M&A.',
            avatarAlt:
              'professional headshot of James Whitfield senior partner in charcoal suit with warm smile',
          },
          {
            name: 'Sarah Chen',
            role: 'Tax Director',
            bio: 'CTA qualified with 18 years in tax advisory. Ex-Deloitte private client specialist. Saved clients over £4.2M in tax.',
            avatarAlt:
              'professional headshot of Sarah Chen tax director with confident expression and navy blazer',
          },
          {
            name: 'David Okonkwo',
            role: 'Audit Partner',
            bio: 'ICAEW and ACCA dual-qualified. 15 years audit experience with PwC and BDO. Specialist in FCA-regulated firms.',
            avatarAlt:
              'professional headshot of David Okonkwo audit partner with glasses and friendly demeanor',
          },
          {
            name: 'Emma Rodriguez',
            role: 'Advisory Partner',
            bio: 'MBA, ICAEW qualified. Former investment banker turned advisory specialist. Secured £8.2M funding for SME clients.',
            avatarAlt:
              'professional headshot of Emma Rodriguez advisory partner with approachable smile',
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? 'Testimonials'
    const testimonialsHeading =
      props.testimonials?.heading ?? 'What Our Clients Say'
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real feedback from businesses we've helped grow and individuals we've guided to financial security."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Stellar Financial restructured our entire tax approach and saved us £127,000 in the first year alone. Sarah and the team's expertise in R&D tax credits was invaluable for our tech startup.",
            name: 'Michael Foster',
            role: 'CEO, TechFlow Solutions Ltd',
            avatarAlt:
              'professional headshot of Michael Foster tech entrepreneur',
          },
          {
            quote:
              "As a property developer, I needed specialists who understand construction accounting and CIS. David's team handled our audit flawlessly and identified £45K in unclaimed capital allowances.",
            name: 'Robert Henderson',
            role: 'Director, Apex Homes Ltd',
            avatarAlt:
              'professional headshot of Robert Henderson property developer',
          },
          {
            quote:
              'Emma secured £340,000 in growth funding for our expansion. The business plan and financial forecasts she prepared impressed the bank so much they offered preferential rates. Game changer.',
            name: 'Amanda Brooks',
            role: 'Founder, GreenLeaf Organics',
            avatarAlt:
              'professional headshot of Amanda Brooks retail business owner',
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? 'Pricing'
    const pricingHeading =
      props.pricing?.heading ?? 'Transparent Pricing, Exceptional Value'
    const pricingDesc =
      props.pricing?.description ??
      'Fixed-fee packages with no hidden charges. All plans include unlimited phone and email support.'
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: 'Starter',
            tagline: 'Perfect for sole traders and freelancers',
            price: '£149',
            period: '/month',
            features: [
              'Annual accounts & tax return',
              'Quarterly VAT returns',
              'Self-assessment filing',
              'Unlimited support',
            ],
            cta: 'Get Started',
          },
          {
            name: 'Business Growth',
            tagline: 'For limited companies ready to scale',
            price: '£349',
            period: '/month',
            features: [
              'Everything in Starter, plus:',
              'Monthly management accounts',
              'Payroll for up to 10 employees',
              'Quarterly tax planning review',
              'Xero/QuickBooks included',
            ],
            cta: 'Get Started',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            tagline: 'Bespoke solutions for larger businesses',
            price: 'Custom',
            features: [
              'Dedicated account manager',
              'Statutory audit if required',
              'R&D tax credit claims',
              'Board-level advisory',
            ],
            cta: 'Contact Us',
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? 'FAQ'
    const faqHeading = props.faq?.heading ?? 'Common Questions'
    const faqDesc =
      props.faq?.description ??
      'Everything you need to know about working with Stellar Financial.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: 'How quickly can you start working with my business?',
            answer:
              "We can typically onboard new clients within 5-7 business days. For urgent situations (approaching deadlines, HMRC enquiries), we offer expedited onboarding within 48 hours. Your initial consultation is always free and we'll provide a clear timeline during that meeting.",
          },
          {
            question: 'Do you work with businesses outside the UK?',
            answer:
              'Yes, we work with international businesses that have UK operations or tax obligations. We have particular expertise in US-UK tax treaties, EU VAT compliance for e-commerce, and non-resident landlord schemes. Our team includes specialists in international tax structuring.',
          },
          {
            question: 'What accounting software do you support?',
            answer:
              "We're certified partners with Xero, QuickBooks Online, and Sage Business Cloud. Our Business Growth and Enterprise packages include software subscriptions. We can also work with businesses using FreeAgent, KashFlow, or even Excel-based systems if you're not ready to migrate yet.",
          },
          {
            question: 'How do your fixed fees work?',
            answer:
              'Our fixed monthly fees cover all routine accounting, tax compliance, and support work. The price you see is the price you pay - no surprise bills for phone calls or emails. Additional services like one-off projects, due diligence, or complex tax restructuring are quoted separately with your approval before work begins.',
          },
          {
            question: 'What qualifications do your accountants hold?',
            answer:
              "All our client-facing accountants are ICAEW, ACCA, or ATT qualified. Our partners average 18 years of post-qualification experience. We're regulated by the ICAEW, which means we maintain professional indemnity insurance and adhere to strict ethical standards. You can verify our registration on the ICAEW website.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? 'Ready to Transform Your Finances?'
    const ctaDesc =
      props.cta?.description ??
      'Join 500+ businesses that have already discovered the Stellar difference. Your first consultation is completely free.'
    const ctaPrimary = props.cta?.primaryButton ?? 'Book Free Consultation'
    const ctaPhone = props.cta?.phoneButton ?? 'Call 020 1234 5678'

    const contactEyebrow = props.contact?.eyebrow ?? 'Contact'
    const contactHeading =
      props.contact?.heading ?? "Let's Start the Conversation"
    const contactDesc =
      props.contact?.description ??
      "Whether you're looking for a full-service accounting partner or need help with a specific challenge, we'd love to hear from you."
    const contactAddress = props.contact?.address?.length
      ? props.contact.address
      : ['The Shard, Level 24', '32 London Bridge Street', 'London SE1 9SG']
    const contactPhone = props.contact?.phone ?? '020 1234 5678'
    const contactEmail = props.contact?.email ?? 'hello@stellarfinancial.co.uk'
    const contactHours = props.contact?.hours?.length
      ? props.contact.hours
      : ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 2:00 PM']
    const contactServices = props.contact?.services?.length
      ? props.contact.services
      : [
          'Tax Planning & Compliance',
          'Audit & Assurance',
          'Payroll & Bookkeeping',
          'Business Advisory',
          'Property & Construction',
          'Personal Tax & Wealth',
        ]
    const contactSubmit = props.contact?.submit ?? 'Send Message'
    const contactDisclaimer =
      props.contact?.disclaimer ??
      "By submitting this form, you agree to our privacy policy. We'll never share your information."

    const footerTagline =
      props.footer?.tagline ??
      'Award-winning chartered accountants providing expert financial services to businesses and individuals across the UK since 2009.'
    const footerServicesHeading = props.footer?.servicesHeading ?? 'Services'
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          'Tax Planning',
          'Audit & Assurance',
          'Payroll Services',
          'Business Advisory',
          'Property Accounting',
        ]
    const footerCompanyHeading = props.footer?.companyHeading ?? 'Company'
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ['About Us', 'Our Team', 'Careers', 'News & Insights', 'Contact']
    const footerLegalHeading = props.footer?.legalHeading ?? 'Legal'
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : [
          'Privacy Policy',
          'Terms of Service',
          'Cookie Policy',
          'ICAEW Registration',
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['LinkedIn', 'Twitter']
    const footerCopyright =
      props.footer?.copyright ??
      '© 2024 Stellar Financial Partners Ltd. All rights reserved.'
    const footerRegistration =
      props.footer?.registration ??
      'ICAEW Registered | FRC Regulated | ICAEW Firm Number: C12345678'

    // Brand logo mark — fixed neutral tile with the firm initials (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-3/5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('size-5 text-chart-4', className)}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const LinkedInIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )

    const TwitterIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
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
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
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
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    const PinIcon = ({ className }: { className?: string }) => (
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    const ClockIcon = ({ className }: { className?: string }) => (
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
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const TrendIcon = ({ className }: { className?: string }) => (
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
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )

    const ShieldCheckIcon = ({ className }: { className?: string }) => (
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
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    // Service icon set — rotated through the 6 services (decorative, currentColor).
    const serviceIcons: ReactNode[] = [
      <svg
        key="receipt"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>,
      <svg
        key="chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg
        key="bolt"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="building"
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
        key="family"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
    ]

    const inputCls =
      'w-full rounded-xl border border-input bg-muted px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-ring'

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

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
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
                className="flex items-center gap-3"
              >
                <LogoMark className="size-10 [&>svg]:text-primary-foreground" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-lg font-bold tracking-tight text-foreground lg:text-xl">
                    {brand}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {brandTagline}
                  </span>
                </span>
              </button>

              <div className="hidden items-center gap-8 lg:flex">
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
                          onClick={() => go('Bookings')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Bookings
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
                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  {navCta}
                </button>
              </div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
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
                className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 lg:hidden gap-4"
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
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero — dark band */}
          <section className="relative overflow-hidden bg-foreground">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-foreground to-foreground"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroPill}
                    </span>
                  </div>
                  <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-background sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroHeadingTop}
                    <br />
                    <span className="text-primary">{heroHeadingAccent}</span>
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-background/70 lg:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-xl border border-background/20 bg-background/10 px-8 py-4 text-base font-semibold text-background backdrop-blur-sm transition-colors hover:bg-background/20"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {heroAvatarAlts.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-12 rounded-full border-2 border-foreground object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <Star key={idx} />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-background/60">
                        {heroRating}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 to-accent/30 blur-2xl"
                  />
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
                        <TrendIcon className="size-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {heroStatValue}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {heroStatLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex h-12 items-center justify-center"
                  >
                    <span className="text-xl font-black text-foreground/70">
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground [&>svg]:size-7">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats — dark band */}
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-black text-primary lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="font-medium text-background/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process / About */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {processEyebrow}
                  </span>
                  <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    {processHeading}
                  </h2>
                  <p className="mb-8 text-lg text-muted-foreground">
                    {processDesc}
                  </p>
                  <div className="space-y-6">
                    {processSteps.map((step, i) => (
                      <div key={step.title} className="flex gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="mb-1 text-lg font-bold text-foreground">
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

                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5"
                  />
                  <Image
                    alt={processImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
                  />
                  <div className="absolute -bottom-6 -right-6 rounded-xl border border-border bg-card p-5 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="grid size-14 place-items-center rounded-xl bg-primary/10 text-primary">
                        <ShieldCheckIcon className="size-7" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {processCardValue}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {processCardLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {teamEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {teamHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{teamDesc}</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((member) => (
                  <article
                    key={member.name}
                    className="overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <Image
                      alt={member.avatarAlt}
                      w={400}
                      h={500}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-foreground">
                        {member.name}
                      </h3>
                      <p className="mb-3 text-sm font-medium text-primary">
                        {member.role}
                      </p>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {member.bio}
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          aria-label={`${member.name} on LinkedIn`}
                          onClick={() => go(`${member.name} LinkedIn`)}
                          className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          <LinkedInIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Email ${member.name}`}
                          onClick={() => go(`Email ${member.name}`)}
                          className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          <MailIcon className="size-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
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
                  </article>
                ))}
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

              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      'relative rounded-2xl p-8',
                      tier.featured
                        ? 'border border-border bg-foreground shadow-xl'
                        : 'border border-border bg-card shadow-sm',
                    )}
                  >
                    {tier.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          'mb-2 text-xl font-bold',
                          tier.featured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          'text-sm',
                          tier.featured
                            ? 'text-background/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {tier.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          'text-4xl font-black',
                          tier.featured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span
                          className={cn(
                            tier.featured
                              ? 'text-background/60'
                              : 'text-muted-foreground',
                          )}
                        >
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <ul className="mb-8 space-y-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className={cn(
                            'flex items-start gap-3',
                            tier.featured
                              ? 'text-background/80'
                              : 'text-muted-foreground',
                          )}
                        >
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        'block w-full rounded-xl px-4 py-3 text-center font-semibold transition-colors',
                        tier.featured
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-muted text-foreground hover:bg-accent',
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
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
                    key={item.question}
                    className="group rounded-xl border border-border bg-muted"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold text-foreground">
                        {item.question}
                      </span>
                      <span className="transition-transform group-open:rotate-180">
                        <svg
                          className="size-5 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA band — vivid primary */}
          <section className="bg-primary py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80 lg:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-xl bg-card px-8 py-4 text-base font-bold text-foreground shadow-lg transition-colors hover:bg-card/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/40 px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <PhoneIcon className="size-5" />
                  {ctaPhone}
                </button>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-16 lg:grid-cols-2">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {contactEyebrow}
                  </span>
                  <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-10 text-lg text-muted-foreground">
                    {contactDesc}
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-sm">
                        <PinIcon className="size-6" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">
                          Office Address
                        </h3>
                        <p className="text-muted-foreground">
                          {contactAddress.map((line, i) => (
                            <span key={line}>
                              {line}
                              {i < contactAddress.length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-sm">
                        <PhoneIcon className="size-6" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">
                          Phone
                        </h3>
                        <button
                          type="button"
                          onClick={() => go(contactPhone)}
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          {contactPhone}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-sm">
                        <MailIcon className="size-6" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">
                          Email
                        </h3>
                        <button
                          type="button"
                          onClick={() => go(contactEmail)}
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          {contactEmail}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-sm">
                        <ClockIcon className="size-6" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">
                          Office Hours
                        </h3>
                        <p className="text-muted-foreground">
                          {contactHours.map((line, i) => (
                            <span key={line}>
                              {line}
                              {i < contactHours.length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-lg lg:p-10">
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(contactSubmit)
                    }}
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="stellar-first"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          First Name
                        </label>
                        <input
                          id="stellar-first"
                          type="text"
                          required
                          placeholder="John"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="stellar-last"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Last Name
                        </label>
                        <input
                          id="stellar-last"
                          type="text"
                          required
                          placeholder="Smith"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="stellar-email"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Email Address
                      </label>
                      <input
                        id="stellar-email"
                        type="email"
                        required
                        placeholder="john@company.co.uk"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="stellar-phone"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Phone Number
                      </label>
                      <input
                        id="stellar-phone"
                        type="tel"
                        placeholder="020 1234 5678"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="stellar-service"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Service Interested In
                      </label>
                      <select
                        id="stellar-service"
                        className={cn(inputCls, 'appearance-none')}
                      >
                        <option value="">Select a service</option>
                        {contactServices.map((service) => (
                          <option key={service} className="bg-background">
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="stellar-message"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Message
                      </label>
                      <textarea
                        id="stellar-message"
                        rows={4}
                        required
                        placeholder="Tell us about your business and how we can help..."
                        className={cn(inputCls, 'resize-none')}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                    >
                      {contactSubmit}
                    </button>
                    <p className="text-center text-xs text-muted-foreground">
                      {contactDisclaimer}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer — dark band */}
        <footer className="bg-foreground py-16 text-background/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3"
                >
                  <LogoMark className="size-10 [&>svg]:text-primary-foreground" />
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 text-sm leading-relaxed text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-3">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {social === 'Twitter' ? (
                        <TwitterIcon className="size-5" />
                      ) : (
                        <LinkedInIcon className="size-5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerServicesHeading}
                </h4>
                <ul className="space-y-3">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerCompanyHeading}
                </h4>
                <ul className="space-y-3">
                  {footerCompanyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerLegalHeading}
                </h4>
                <ul className="space-y-3">
                  {footerLegalLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <p className="text-sm text-background/50">{footerRegistration}</p>
            </div>
          </div>
        </footer>

        <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              className="sr-only"
              aria-label="Open financial consultation drawer"
            >
              Open consultation drawer
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">{navCta}</SheetTitle>
              <SheetDescription>
                Reserve a consultation and track booking requests for this page.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const tierName =
                    selectedTier?.name ??
                    pricingTiers[0]?.name ??
                    'Consultation'
                  const serviceName =
                    inquiryForm.service || contactServices[0] || 'Advisory'
                  if (!bookingForm.firstName || !bookingForm.email) return
                  void createBooking({
                    serviceName,
                    tierName,
                    firstName: bookingForm.firstName,
                    lastName: bookingForm.lastName,
                    email: bookingForm.email,
                    date: bookingForm.date || 'Next available',
                  })
                  setBookingForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    date: '',
                  })
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={bookingForm.firstName}
                    onChange={(e) =>
                      setBookingForm((form) => ({
                        ...form,
                        firstName: e.currentTarget.value,
                      }))
                    }
                    required
                    placeholder="First name"
                    className={inputCls}
                  />
                  <input
                    value={bookingForm.lastName}
                    onChange={(e) =>
                      setBookingForm((form) => ({
                        ...form,
                        lastName: e.currentTarget.value,
                      }))
                    }
                    placeholder="Last name"
                    className={inputCls}
                  />
                </div>
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) =>
                    setBookingForm((form) => ({
                      ...form,
                      email: e.currentTarget.value,
                    }))
                  }
                  required
                  placeholder="Email address"
                  className={inputCls}
                />
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) =>
                    setBookingForm((form) => ({
                      ...form,
                      date: e.currentTarget.value,
                    }))
                  }
                  className={inputCls}
                />
                <Button type="submit" className="w-full">
                  Save booking
                </Button>
              </form>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {savedBookings.length}
                  </div>
                  <div className="text-muted-foreground">Bookings</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {savedInquiries.length}
                  </div>
                  <div className="text-muted-foreground">Inquiries</div>
                </div>
              </div>

              <div className="space-y-3">
                {savedBookings.length > 0 ? (
                  savedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-xl border border-border bg-muted/40 p-4"
                    >
                      <div className="font-semibold text-foreground">
                        {booking.firstName} {booking.lastName}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {booking.tierName} · {booking.serviceName}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {booking.date}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No consultations booked yet.
                  </div>
                )}
              </div>
            </div>
            <SheetFooter className="border-t border-border p-6">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full">
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
