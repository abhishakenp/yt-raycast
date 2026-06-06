import type { ReactNode } from "react"
import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AccountingFirmKimiPage — a complete, self-contained CPA / accounting-firm
 * marketing page, a faithful Tailwind v4 port of a Kimi-generated "Northridge
 * Financial Partners" design.
 *
 * Calm, trustworthy, professional-services aesthetic: a warm neutral canvas
 * with a single deep-neutral brand accent (mapped to `primary`), generous type
 * hierarchy and editorial spacing. Sections, in order: sticky navbar with a
 * "Schedule Consultation" CTA, a split hero (eyebrow + headline + dual CTAs +
 * trust badges + photo with a floating tax-savings stat card), a "trusted by"
 * client logo strip, a 6-up services grid with icon tiles and feature lists, a
 * split about band with founder bio + KPI grid, a 3-step "how we work" process
 * with an inline CTA panel, a 4-up leadership team grid, a 3-tier transparent
 * pricing table with a highlighted "Most Popular" plan, a dark stats band, a
 * 3-up star-rated testimonials grid, a 6-item FAQ accordion, a dark CTA band
 * with phone + hours, a contact section pairing office/email/phone details
 * with a real inquiry form, and a multi-column footer.
 *
 * The block owns ALL layout, spacing and type. Every nav item / CTA / link /
 * social / form-submit routes through `useNavigate` (never a dead "#"). All
 * content imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content; rich defaults make it render great with no props.
 */
export const AccountingFirmKimiPage = defineComponent({
  name: "AccountingFirmKimiPage",
  description:
    "Complete, professional accounting-firm / CPA / chartered-accountant marketing page with a calm, trustworthy financial-services aesthetic: warm neutral canvas, deep-neutral brand accent, editorial spacing and serious type hierarchy. Includes a sticky navbar with a Schedule-Consultation CTA, a split hero (Est.-year eyebrow, headline, dual CTAs, CPA/BBB/experience trust badges, photo with a floating tax-savings stat card), a trusted-by client logo strip, a 6-up services grid (tax planning & preparation, business advisory, audit & assurance, bookkeeping & payroll, estate planning, retirement planning) with icon tiles and feature checklists, a split about band with founder bio and a firm-stats KPI grid, a 3-step how-we-work process with an inline booking CTA, a 4-up leadership team grid with headshots, a 3-tier transparent pricing table with a highlighted Most-Popular plan, a dark stats band, a 3-up star-rated client testimonials grid, a 6-item FAQ accordion, a dark CTA band with phone and office hours, and a contact section pairing office/email/phone details with a real inquiry form, plus a multi-column footer. Use as the ROOT/home page for accounting firms, CPA practices, tax-preparation services, bookkeeping & payroll providers, audit/assurance firms, financial advisory, estate & retirement planning, or wealth-management practices when a credible, conversion-focused services site with pricing, team and FAQ is wanted. Supply content only; the block owns all layout and styling.",
  props: z.object({
    /** Firm / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Sticky-navbar CTA label. */
    navCta: z.string().optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        /** Inline trust badges below the hero copy. */
        badges: z.array(z.string()).optional(),
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
    /** Split about band. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        founderName: z.string().optional(),
        founderRole: z.string().optional(),
        founderAvatarAlt: z.string().optional(),
      })
      .optional(),
    /** How-we-work process steps. */
    process: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        ctaHeading: z.string().optional(),
        ctaDescription: z.string().optional(),
        ctaButton: z.string().optional(),
      })
      .optional(),
    /** Leadership team grid. */
    team: z
      .object({
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
        footnote: z.string().optional(),
        footnoteCta: z.string().optional(),
      })
      .optional(),
    /** Transparent pricing tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        note: z.string().optional(),
        noteCta: z.string().optional(),
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
    /** Client testimonials grid. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryButton: z.string().optional(),
        phone: z.string().optional(),
        hours: z.string().optional(),
      })
      .optional(),
    /** Contact section (details + inquiry form). */
    contact: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        offices: z
          .array(z.object({ label: z.string(), address: z.string() }))
          .optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
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
        contactHeading: z.string().optional(),
        contactLines: z.array(z.string()).optional(),
        hours: z.string().optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Northridge"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "About", "Team", "Pricing", "FAQ"]
    const navCta = props.navCta ?? "Schedule Consultation"

    const heroEyebrow =
      props.hero?.eyebrow ?? "Est. 1987 • Chartered Professional Accountants"
    const heroHeadingTop = props.hero?.headingTop ?? "Clarity in every number."
    const heroHeadingBottom =
      props.hero?.headingBottom ?? "Confidence in every decision."
    const heroSub =
      props.hero?.subheading ??
      "Northridge Financial Partners provides comprehensive accounting, tax, and advisory services for growing businesses and individuals. Trusted by 800+ clients across the Pacific Northwest."
    const heroPrimary = props.hero?.primaryCta ?? "Book Free Consultation"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Services"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "professional accountant reviewing financial documents with laptop and calculator in modern office"
    const heroStatValue = props.hero?.statValue ?? "$47M+"
    const heroStatLabel =
      props.hero?.statLabel ?? "Tax savings secured for clients in 2024"
    const heroBadges = props.hero?.badges?.length
      ? props.hero.badges
      : ["CPA Certified", "A+ BBB Rating", "37 Years Experience"]

    const logosHeading = props.logos?.heading ?? "Trusted by leading businesses"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : [
          "Cascade Tech",
          "Evergreen Co.",
          "Summit Holdings",
          "Pacific Realty",
          "Harbor Logistics",
          "Vista Medical",
        ]

    const servicesHeading =
      props.services?.heading ?? "Comprehensive financial services"
    const servicesDesc =
      props.services?.description ??
      "From daily bookkeeping to complex tax strategy, we handle every aspect of your financial life with precision and care."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Tax Planning & Preparation",
            description:
              "Strategic tax planning for individuals and businesses. We maximize deductions, minimize liabilities, and ensure full compliance with federal, state, and local regulations.",
            points: [
              "Individual & business returns",
              "IRS audit representation",
              "Estate & trust tax planning",
            ],
          },
          {
            title: "Business Advisory",
            description:
              "Growth-focused guidance for businesses at every stage. From startup formation to succession planning, we help you make informed financial decisions.",
            points: [
              "Cash flow management",
              "Business valuations",
              "M&A advisory services",
            ],
          },
          {
            title: "Audit & Assurance",
            description:
              "Independent audit services that build stakeholder confidence. We deliver thorough, objective assessments with clear, actionable findings.",
            points: [
              "Financial statement audits",
              "Internal control reviews",
              "Compliance audits",
            ],
          },
          {
            title: "Bookkeeping & Payroll",
            description:
              "Accurate, timely financial records that keep your business running smoothly. We handle the details so you can focus on growth.",
            points: [
              "Monthly bookkeeping",
              "Full-service payroll",
              "Accounts payable/receivable",
            ],
          },
          {
            title: "Estate Planning",
            description:
              "Protect your legacy with comprehensive estate planning. We coordinate with attorneys to ensure your wealth transfers efficiently and tax-effectively.",
            points: [
              "Trust administration",
              "Wealth transfer strategies",
              "Charitable giving plans",
            ],
          },
          {
            title: "Retirement Planning",
            description:
              "Build a secure future with personalized retirement strategies. We help you navigate 401(k)s, IRAs, pensions, and Social Security optimization.",
            points: [
              "401(k) & IRA optimization",
              "Social Security timing",
              "Distribution strategies",
            ],
          },
        ]

    const aboutEyebrow = props.about?.eyebrow ?? "About Northridge"
    const aboutHeading =
      props.about?.heading ?? "Three decades of financial excellence"
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          "Founded in 1987 by Robert Northridge, our firm has grown from a one-person practice to a team of 24 dedicated professionals serving clients throughout Oregon and Washington.",
          "We believe in building lasting relationships. Our average client tenure exceeds 11 years—a testament to the trust we earn through consistent results and personal attention. Every engagement is led by a partner, ensuring senior-level expertise on every matter.",
        ]
    const aboutImageAlt =
      props.about?.imageAlt ??
      "modern glass office building exterior with blue sky reflection"
    const aboutStats = props.about?.stats?.length
      ? props.about.stats
      : [
          { value: "37", label: "Years in practice" },
          { value: "24", label: "Team members" },
          { value: "800+", label: "Active clients" },
          { value: "11.2", label: "Average client years" },
        ]
    const aboutFounderName = props.about?.founderName ?? "Robert Northridge, CPA"
    const aboutFounderRole =
      props.about?.founderRole ?? "Founder & Managing Partner"
    const aboutFounderAvatarAlt =
      props.about?.founderAvatarAlt ??
      "professional headshot of Robert Northridge founder in navy suit with warm smile"

    const processHeading = props.process?.heading ?? "How we work with you"
    const processDesc =
      props.process?.description ??
      "A proven process designed to understand your needs and deliver measurable results from day one."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discovery & Assessment",
            description:
              "We begin with a complimentary consultation to understand your financial situation, goals, and challenges. This includes a comprehensive review of your current books, tax returns, and financial statements.",
          },
          {
            title: "Strategy & Planning",
            description:
              "Our team develops a customized financial strategy tailored to your specific objectives. We present clear recommendations with projected outcomes, timelines, and transparent fee structures.",
          },
          {
            title: "Execution & Support",
            description:
              "We implement your plan with precision, providing ongoing support, regular check-ins, and proactive adjustments as your situation evolves. Your dedicated account manager ensures nothing falls through the cracks.",
          },
        ]
    const processCtaHeading = props.process?.ctaHeading ?? "Ready to get started?"
    const processCtaDesc =
      props.process?.ctaDescription ??
      "Schedule your complimentary consultation—no obligation, no pressure."
    const processCtaButton = props.process?.ctaButton ?? "Book Your Consultation"

    const teamHeading = props.team?.heading ?? "Meet our leadership"
    const teamDesc =
      props.team?.description ??
      "Experienced professionals committed to your financial success."
    const teamMembers = props.team?.members?.length
      ? props.team.members
      : [
          {
            name: "Robert Northridge",
            role: "Founder & Managing Partner, CPA",
            bio: "37 years of experience. Specializes in complex business advisory and estate planning.",
            avatarAlt:
              "professional headshot of Robert Northridge senior partner in charcoal suit with confident expression",
          },
          {
            name: "Sarah Chen",
            role: "Tax Partner, CPA, MST",
            bio: "18 years in taxation. Expert in multi-state tax planning and IRS dispute resolution.",
            avatarAlt:
              "professional headshot of Sarah Chen tax partner with warm smile and professional blazer",
          },
          {
            name: "Michael Torres",
            role: "Audit Partner, CPA",
            bio: "15 years in assurance services. Leads our nonprofit and healthcare audit practice.",
            avatarAlt:
              "professional headshot of Michael Torres audit partner with dark hair and navy suit",
          },
          {
            name: "Jennifer Walsh",
            role: "Advisory Partner, CPA, CFP",
            bio: "12 years in financial planning. Focuses on retirement strategies and wealth management.",
            avatarAlt:
              "professional headshot of Jennifer Walsh advisory partner with blonde hair and elegant professional attire",
          },
        ]
    const teamFootnote =
      props.team?.footnote ??
      "Our full team includes 20 additional professionals including senior accountants, bookkeepers, and support staff."
    const teamFootnoteCta = props.team?.footnoteCta ?? "Get to know our full team"

    const pricingHeading = props.pricing?.heading ?? "Transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Clear, upfront pricing with no hidden fees. Choose the service level that fits your needs."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Individual Tax",
            tagline: "For personal tax returns",
            price: "$450",
            period: "/return",
            features: [
              "Federal & state returns",
              "Standard deductions & credits",
              "E-filing included",
              "Year-round support",
            ],
            cta: "Get Started",
          },
          {
            name: "Business Essential",
            tagline: "For small businesses",
            price: "$750",
            period: "/month",
            features: [
              "Monthly bookkeeping",
              "Quarterly tax filings",
              "Annual business return",
              "Payroll for up to 10 employees",
              "Monthly financial reports",
            ],
            cta: "Get Started",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Advisory Plus",
            tagline: "Comprehensive support",
            price: "$2,500",
            period: "/month",
            features: [
              "Everything in Business Essential",
              "Unlimited employees",
              "Quarterly strategy sessions",
              "Dedicated account manager",
              "Priority scheduling",
            ],
            cta: "Contact Us",
          },
        ]
    const pricingNote =
      props.pricing?.note ??
      "Audit services, estate planning, and specialized consulting priced per engagement."
    const pricingNoteCta = props.pricing?.noteCta ?? "Contact us for a custom quote."

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$47M", label: "Tax savings secured (2024)" },
          { value: "98.7%", label: "Client retention rate" },
          { value: "2,400+", label: "Returns filed annually" },
          { value: "4.9/5", label: "Average client rating" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What our clients say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Trusted partnerships built on results and relationships."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Northridge has handled our taxes for 14 years. Last year they identified deductions we had been missing that saved us over $12,000. Their attention to detail is unmatched.",
            name: "David Park",
            role: "CEO, Cascade Tech Solutions",
            avatarAlt:
              "professional headshot of David Park business owner in suit jacket",
          },
          {
            quote:
              "When the IRS selected us for an audit, Northridge handled everything. Their preparation was so thorough that the audit concluded with no changes to our return. Absolute peace of mind.",
            name: "Maria Gonzalez",
            role: "Owner, Evergreen Construction",
            avatarAlt:
              "professional headshot of Maria Gonzalez business owner with confident smile",
          },
          {
            quote:
              "Their retirement planning guidance helped us retire two years earlier than projected. Jennifer Walsh explained complex strategies in terms we could understand and act on.",
            name: "Thomas & Linda Sullivan",
            role: "Retirement Planning Clients",
            avatarAlt:
              "professional headshot of Thomas Sullivan retired professional with silver hair",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about working with Northridge."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What documents do I need for my tax appointment?",
            answer:
              "For individuals, bring your W-2s, 1099s, last year's tax return, social security numbers for all dependents, and documentation for deductions (mortgage interest, property taxes, charitable donations, medical expenses). For businesses, include profit/loss statements, balance sheets, and business expense records. We'll send a complete checklist when you schedule.",
          },
          {
            question: "How quickly can you complete my tax return?",
            answer:
              "Standard individual returns are completed within 5-7 business days of receiving all documents. Business returns typically require 10-14 business days. During peak season (March-April), timelines may extend slightly. Expedited service is available for an additional fee if you need your return within 48 hours.",
          },
          {
            question: "What happens if I'm audited?",
            answer:
              "If you're audited, we handle everything. Our audit protection service includes representation before the IRS or state tax authorities, preparation of all required documentation, and direct communication with auditors on your behalf. We stand behind our work—if we prepared your return, audit defense is included at no extra charge.",
          },
          {
            question: "Do you work with clients remotely?",
            answer:
              "Yes. While we have offices in Portland and Seattle, we serve clients throughout the Pacific Northwest and beyond using secure document sharing, video conferencing, and encrypted communication tools. Remote clients receive the same level of service and attention as those who visit our offices.",
          },
          {
            question: "What are your payment terms?",
            answer:
              "For one-time services like tax preparation, payment is due when you pick up your return or before e-filing. For ongoing services like monthly bookkeeping, we invoice on the 1st of each month with net-15 terms. We accept checks, ACH transfers, and all major credit cards. Retainer arrangements are available for businesses with complex ongoing needs.",
          },
          {
            question: "How do I get started?",
            answer:
              "Schedule a free 30-minute consultation through our website or by calling (503) 555-0147. We'll discuss your needs, explain our services, and provide a clear fee estimate. There's no obligation—our goal is to determine if we're the right fit for your financial needs.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to take control of your finances?"
    const ctaDesc =
      props.cta?.description ??
      "Schedule a complimentary consultation with one of our CPAs. We'll assess your situation and provide clear recommendations—no obligation, no pressure."
    const ctaPrimary = props.cta?.primaryButton ?? "Schedule Free Consultation"
    const ctaPhone = props.cta?.phone ?? "(503) 555-0147"
    const ctaHours =
      props.cta?.hours ?? "Office hours: Monday–Friday, 8:30 AM – 5:00 PM PST"

    const contactEyebrow = props.contact?.eyebrow ?? "Contact Us"
    const contactHeading =
      props.contact?.heading ?? "Let's discuss your financial goals"
    const contactDesc =
      props.contact?.description ??
      "Whether you're planning for retirement, growing a business, or navigating a complex tax situation, we're here to help. Reach out and we'll respond within one business day."
    const contactOffices = props.contact?.offices?.length
      ? props.contact.offices
      : [
          {
            label: "Portland Office",
            address: "1240 SW Yamhill Street, Suite 300, Portland, OR 97205",
          },
          {
            label: "Seattle Office",
            address: "1918 8th Avenue, Suite 400, Seattle, WA 98101",
          },
        ]
    const contactEmail = props.contact?.email ?? "info@northridgefp.com"
    const contactPhone = props.contact?.phone ?? "(503) 555-0147"
    const contactServices = props.contact?.services?.length
      ? props.contact.services
      : [
          "Individual Tax Preparation",
          "Business Tax Services",
          "Bookkeeping & Payroll",
          "Business Advisory",
          "Audit & Assurance",
          "Estate Planning",
          "Retirement Planning",
          "Other",
        ]
    const contactSubmit = props.contact?.submit ?? "Send Message"
    const contactDisclaimer =
      props.contact?.disclaimer ??
      "By submitting this form, you agree to our privacy policy. We'll never share your information with third parties."

    const footerTagline =
      props.footer?.tagline ??
      "Chartered Professional Accountants providing comprehensive financial services to individuals and businesses since 1987."
    const footerServicesHeading = props.footer?.servicesHeading ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          "Tax Planning & Preparation",
          "Business Advisory",
          "Audit & Assurance",
          "Bookkeeping & Payroll",
          "Estate Planning",
          "Retirement Planning",
        ]
    const footerCompanyHeading = props.footer?.companyHeading ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : [
          "About Us",
          "Our Team",
          "Pricing",
          "Careers",
          "News & Insights",
          "Contact",
        ]
    const footerContactHeading = props.footer?.contactHeading ?? "Contact"
    const footerContactLines = props.footer?.contactLines?.length
      ? props.footer.contactLines
      : [
          "Portland: (503) 555-0147",
          "Seattle: (206) 555-0189",
          "info@northridgefp.com",
        ]
    const footerHours = props.footer?.hours ?? "Mon–Fri: 8:30 AM – 5:00 PM PST"
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} Northridge Financial Partners. All rights reserved.`

    // Brand logo tile — fixed neutral mark with the firm initials (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-md bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.slice(0, 2).toUpperCase()}
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

    const Star = () => (
      <svg
        className="size-5 text-chart-4"
        viewBox="0 0 20 20"
        fill="currentColor"
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

    // Service icon set — rotated through the 6 services (decorative, currentColor).
    const serviceIcons: ReactNode[] = [
      <svg
        key="doc"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
        key="report"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      <svg
        key="cash"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="scale"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>,
      <svg
        key="trend"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>,
    ]

    const inputCls =
      "w-full rounded-md border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-sm" />
                <span className="text-lg font-semibold tracking-tight text-foreground">
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
                  onClick={() => go(navCta)}
                  className="hidden items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  {navCta}
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
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
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeadingTop}
                    <br />
                    {heroHeadingBottom}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-md bg-secondary px-6 py-3.5 text-base font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroBadges.map((badge) => (
                      <div key={badge} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="aspect-[4/3] w-full rounded-lg object-cover shadow-xl"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-lg border border-border bg-card p-4 shadow-lg sm:block">
                    <p className="text-3xl font-bold text-foreground">
                      {heroStatValue}
                    </p>
                    <p className="text-sm text-muted-foreground">{heroStatLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
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
                    <span className="text-xl font-bold text-muted-foreground">
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-lg border border-border bg-muted p-6 transition-colors hover:border-primary/40"
                  >
                    <div className="mb-5 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground [&>svg]:size-6">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">{item.description}</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-primary/70" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="order-2 lg:order-1">
                  <Image
                    alt={aboutImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-lg object-cover shadow-lg"
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {aboutEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {aboutHeading}
                  </h2>
                  {aboutParagraphs.map((p, i) => (
                    <p
                      key={p}
                      className={cn(
                        "leading-relaxed text-muted-foreground",
                        i === 0 ? "mb-6 text-lg" : "mb-8",
                      )}
                    >
                      {p}
                    </p>
                  ))}

                  <div className="mb-8 grid grid-cols-2 gap-6">
                    {aboutStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-3xl font-bold text-foreground">
                          {s.value}
                        </p>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <Image
                      alt={aboutFounderAvatarAlt}
                      w={100}
                      h={100}
                      className="size-14 rounded-full border-2 border-card object-cover shadow"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {aboutFounderName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {aboutFounderRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Process / steps */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {processHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{processDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {i < processSteps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-[calc(100%+1.5rem)] top-6 hidden h-px w-[calc(100%-3rem)] -translate-y-1/2 bg-border md:block"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-16 rounded-lg border border-border bg-muted p-8">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                  <div>
                    <h4 className="mb-2 text-xl font-semibold text-foreground">
                      {processCtaHeading}
                    </h4>
                    <p className="text-muted-foreground">{processCtaDesc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(processCtaButton)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {processCtaButton}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {teamHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{teamDesc}</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((member) => (
                  <article
                    key={member.name}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <Image
                      alt={member.avatarAlt}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-foreground">
                        {member.name}
                      </h3>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {member.role}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{teamFootnote}</p>
                <button
                  type="button"
                  onClick={() => go(teamFootnoteCta)}
                  className="inline-flex items-center font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {teamFootnoteCta}
                  <ArrowRight className="ml-2 size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-lg border p-8",
                      tier.featured
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted",
                    )}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        tier.featured ? "text-primary-foreground" : "text-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        tier.featured
                          ? "text-primary-foreground/70"
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
                        {tier.period}
                      </span>
                    </div>
                    <ul
                      className={cn(
                        "mb-8 space-y-3 text-sm",
                        tier.featured
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              tier.featured
                                ? "text-primary-foreground"
                                : "text-primary",
                            )}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "block w-full rounded-md px-5 py-2.5 text-center font-medium transition-colors",
                        tier.featured
                          ? "bg-card text-foreground hover:bg-card/90"
                          : "border border-input bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {pricingNote}{" "}
                  <button
                    type="button"
                    onClick={() => go(pricingNoteCta)}
                    className="font-medium text-foreground underline"
                  >
                    {pricingNoteCta}
                  </button>
                </p>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-primary-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-primary-foreground/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-lg border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
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
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-6">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-lg border border-border bg-muted p-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.question}
                      </h3>
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
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section className="bg-primary py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-md bg-card px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-card/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="inline-flex items-center justify-center rounded-md border border-primary-foreground/40 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <PhoneIcon className="mr-2 size-5" />
                  {ctaPhone}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/70">{ctaHours}</p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {contactEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {contactDesc}
                  </p>

                  <div className="space-y-6">
                    {contactOffices.map((office) => (
                      <div key={office.label} className="flex items-start gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
                          <PinIcon className="size-5 text-foreground/70" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {office.label}
                          </h3>
                          <p className="text-muted-foreground">{office.address}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
                        <MailIcon className="size-5 text-foreground/70" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Email</h3>
                        <button
                          type="button"
                          onClick={() => go(contactEmail)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {contactEmail}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
                        <PhoneIcon className="size-5 text-foreground/70" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Phone</h3>
                        <button
                          type="button"
                          onClick={() => go(contactPhone)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {contactPhone}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted p-8">
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
                          htmlFor="acct-first"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          First name
                        </label>
                        <input
                          id="acct-first"
                          type="text"
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="acct-last"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Last name
                        </label>
                        <input
                          id="acct-last"
                          type="text"
                          required
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="acct-email"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Email address
                      </label>
                      <input
                        id="acct-email"
                        type="email"
                        required
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="acct-phone"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Phone number
                      </label>
                      <input id="acct-phone" type="tel" className={inputCls} />
                    </div>

                    <div>
                      <label
                        htmlFor="acct-service"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Service interested in
                      </label>
                      <select
                        id="acct-service"
                        className={cn(inputCls, "appearance-none")}
                      >
                        <option value="">Select a service...</option>
                        {contactServices.map((service) => (
                          <option key={service} className="bg-background">
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="acct-message"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        How can we help?
                      </label>
                      <textarea
                        id="acct-message"
                        rows={4}
                        required
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8 text-sm" />
                  <span className="text-lg font-semibold tracking-tight text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm leading-relaxed">{footerTagline}</p>
                <div className="flex items-center gap-4">
                  {(["LinkedIn", "Twitter", "Facebook"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-sm font-medium text-background/70 transition-colors hover:text-background"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerServicesHeading}
                </h4>
                <ul className="space-y-2 text-sm">
                  {footerServicesLinks.map((link) => (
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

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerCompanyHeading}
                </h4>
                <ul className="space-y-2 text-sm">
                  {footerCompanyLinks.map((link) => (
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

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerContactHeading}
                </h4>
                <ul className="space-y-2 text-sm">
                  {footerContactLines.map((line) => (
                    <li key={line}>
                      <button
                        type="button"
                        onClick={() => go(line)}
                        className="text-left transition-colors hover:text-background"
                      >
                        {line}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm">{footerHours}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm">{footerCopyright}</p>
              <div className="flex items-center gap-6 text-sm">
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
