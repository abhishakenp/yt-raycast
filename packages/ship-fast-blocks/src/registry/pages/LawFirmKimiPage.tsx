import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * LawFirmKimiPage — a complete, self-contained corporate & trial law-firm
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Reinhart & Associates"
 * design: a refined, authoritative, serif-driven editorial aesthetic on a warm
 * neutral canvas (stone → mapped to background/card/muted tokens) with sharp
 * squared corners, restrained dark accent bands, and tracked-uppercase
 * eyebrows. It pairs a split hero (eyebrow + serif headline with an italic
 * highlight + dual CTAs + phone/address contact row + a floating success-rate
 * stat card over an office photo) with a trusted-by logo strip, a 6-up
 * practice-areas grid of bordered cards with hover-fill icon tiles, a split
 * "how we work" numbered process band beside a portrait, a dark 4-up stats
 * band, a 6-up attorney/partner gallery with image-zoom headshots and social
 * links, a 3-up star-rated testimonials grid, an accordion-style FAQ stack, a
 * dark contact band pairing firm details with a real consultation request
 * form, and a 4-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and depth. Dark bands map
 * to `primary`/`foreground` tokens; light sections to `background`/`card`/
 * `muted`. Every nav item / CTA / link / social / form-submit routes through
 * `useNavigate` (never a dead "#"), and the navbar labels match the `nav`
 * array so PageSwitch can swap pages. All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const LawFirmKimiPage = defineComponent({
  name: "LawFirmKimiPage",
  description:
    "Complete corporate & trial LAW-FIRM / attorneys / legal-practice LANDING page with a refined, authoritative, serif-driven editorial aesthetic: warm neutral canvas, sharp squared corners, restrained dark accent bands and tracked-uppercase eyebrows. Includes a split hero (eyebrow, serif headline with italic highlight, dual CTAs, phone & office-address row, and a floating success-rate stat card over an executive office photo), a 'trusted by industry leaders' client logo strip, a 6-up practice-areas grid of bordered cards with hover-fill icon tiles (corporate/securities, litigation, employment, real estate, IP, tax & estates), a split numbered 'how we work' process band beside a portrait, a dark 4-up stats band (attorneys, years, transactions, success rate), a 6-up attorney/partner gallery with zoom headshots, titles, bios and social/email links, a 3-up star-rated client testimonials grid with avatars, an FAQ stack of fee/engagement questions, a dark contact band pairing firm phone/email/address with a real consultation-request form (name, email, phone, practice-area select, message), and a 4-column footer with practice areas, firm links and contact info. Use as the ROOT/home page for law firms, attorneys, legal practices, solicitors, barristers, corporate counsel, litigation boutiques, estate-planning or tax practices, accounting/advisory firms, or any premium professional-services site wanting a conservative, trustworthy, conversion-focused page with strong credentials and social proof. Supply content only — brand, nav, hero, logos, practice areas, process, stats, attorneys, testimonials, FAQ, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Firm / brand name shown in the navbar, hero mark and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        tagline: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered as the italic highlight on the second line. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
      })
      .optional(),
    /** Trusted-by client logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Practice areas grid. */
    practiceAreas: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        linkLabel: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Split numbered "how we work" process band. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
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
    /** Attorney / partner gallery. */
    attorneys: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              title: z.string(),
              bio: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Star-rated client testimonials. */
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
    /** FAQ stack. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark contact band + consultation request form. */
    contact: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        formHeading: z.string().optional(),
        submit: z.string().optional(),
        disclaimer: z.string().optional(),
        /** Practice-area options for the form select. */
        practiceOptions: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        address: z.string().optional(),
        practiceTitle: z.string().optional(),
        practiceLinks: z.array(z.string()).optional(),
        firmTitle: z.string().optional(),
        firmLinks: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Reinhart & Associates"
    const nav = props.nav?.length
      ? props.nav
      : ["Practice Areas", "Attorneys", "Testimonials", "FAQ", "Contact"]

    const heroEyebrow = props.hero?.eyebrow ?? "Corporate & Trial Law Since 1987"
    const heroTagline = props.hero?.tagline ?? "Attorneys at Law"
    const heroHeadingTop = props.hero?.headingTop ?? "Strategic Counsel."
    const heroHighlight = props.hero?.highlight ?? "Decisive Results."
    const heroSub =
      props.hero?.subheading ??
      "Reinhart & Associates provides sophisticated legal representation to Fortune 500 companies, emerging enterprises, and private clients. Our 34 attorneys deliver measurable outcomes in corporate transactions, complex litigation, and regulatory matters."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule Consultation"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Services"
    const heroPhone = props.hero?.phone ?? "(212) 555-0147"
    const heroAddress = props.hero?.address ?? "450 Lexington Ave, New York, NY"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern executive law office with floor-to-ceiling windows overlooking Manhattan skyline"
    const heroStatValue = props.hero?.statValue ?? "94%"
    const heroStatLabel =
      props.hero?.statLabel ??
      "Success rate in commercial litigation matters resolved since 2020"

    const logosHeading = props.logos?.heading ?? "Trusted by Industry Leaders"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["MORGAN", "CITADEL", "VENTURE", "APEX", "MERIDIAN", "CONSOL"]

    const paEyebrow = props.practiceAreas?.eyebrow ?? "Practice Areas"
    const paHeading =
      props.practiceAreas?.heading ?? "Comprehensive Legal Expertise"
    const paDesc =
      props.practiceAreas?.description ??
      "Our attorneys provide strategic counsel across the full spectrum of business and personal legal needs, from complex M&A transactions to high-stakes litigation."
    const paLink = props.practiceAreas?.linkLabel ?? "Learn more"
    const paItems = props.practiceAreas?.items?.length
      ? props.practiceAreas.items
      : [
          {
            title: "Corporate & Securities",
            description:
              "Mergers and acquisitions, corporate governance, SEC compliance, private placements, and strategic joint ventures for public and private companies.",
          },
          {
            title: "Commercial Litigation",
            description:
              "Complex business disputes, breach of contract, shareholder litigation, intellectual property disputes, and class action defense in state and federal courts.",
          },
          {
            title: "Employment Law",
            description:
              "Executive compensation, employment agreements, wrongful termination defense, workplace investigations, and ERISA compliance counseling.",
          },
          {
            title: "Real Estate",
            description:
              "Commercial acquisitions and sales, development projects, leasing, financing, land use approvals, and construction law for developers and investors.",
          },
          {
            title: "Intellectual Property",
            description:
              "Patent and trademark prosecution, copyright registration, IP litigation, technology licensing, and strategic portfolio management for innovators.",
          },
          {
            title: "Tax & Estates",
            description:
              "Tax planning, IRS dispute resolution, trust and estate administration, wealth transfer strategies, and charitable planning for high-net-worth individuals.",
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading =
      props.process?.heading ?? "How We Work With Clients"
    const processDesc =
      props.process?.description ??
      "We believe in transparent communication, strategic planning, and relentless execution. Our proven process has delivered successful outcomes for over three decades."
    const processImageAlt =
      props.process?.imageAlt ??
      "Professional attorney in tailored navy suit reviewing documents in modern conference room"
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Initial Consultation",
            description:
              "We begin with a confidential, no-obligation consultation to understand your situation, objectives, and concerns. This allows us to assess your needs and explain how we can help.",
          },
          {
            title: "Strategic Assessment",
            description:
              "Our attorneys conduct a thorough analysis of your legal position, identifying opportunities, risks, and optimal pathways forward. We develop multiple strategic options for your consideration.",
          },
          {
            title: "Execution & Resolution",
            description:
              "We implement the agreed strategy with precision, keeping you informed at every stage. Our goal is always the most favorable outcome in the shortest time frame possible.",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "34", label: "Attorneys" },
          { value: "37", label: "Years in Practice" },
          { value: "$2.4B", label: "Transactions Closed" },
          { value: "94%", label: "Success Rate" },
        ]

    const attEyebrow = props.attorneys?.eyebrow ?? "Our Team"
    const attHeading = props.attorneys?.heading ?? "Leadership & Partners"
    const attDesc =
      props.attorneys?.description ??
      "Our senior partners bring decades of experience from top law firms, government service, and judicial clerkships. Each is recognized by Chambers, Best Lawyers, and Super Lawyers."
    const attItems = props.attorneys?.items?.length
      ? props.attorneys.items
      : [
          {
            name: "Margaret Chen",
            title: "Managing Partner, Corporate",
            bio: "Former SEC counsel with 24 years experience in M&A and securities law. Lead counsel on 47 public company transactions exceeding $8 billion in value.",
            imageAlt:
              "Professional headshot of Margaret Chen, senior partner with confident expression and pearl necklace",
          },
          {
            name: "James P. Reinhart",
            title: "Founding Partner, Litigation",
            bio: "Founded the firm in 1987. Argued 23 cases before the Supreme Court. Former law clerk to Justice Scalia. Chambers Band 1 ranking since 2005.",
            imageAlt:
              "Professional headshot of James P. Reinhart, distinguished senior partner with silver hair and tailored suit",
          },
          {
            name: "Sarah Mitchell",
            title: "Partner, Employment & IP",
            bio: "Dual expertise in employment law and intellectual property. Former General Counsel at two NASDAQ-listed technology companies. Registered patent attorney.",
            imageAlt:
              "Professional headshot of Sarah Mitchell, partner with warm confident smile and elegant professional attire",
          },
          {
            name: "David Okonkwo",
            title: "Partner, Real Estate & Tax",
            bio: "Structured over $1.2 billion in commercial real estate transactions. LL.M. in Taxation from NYU. Former IRS Office of Chief Counsel attorney.",
            imageAlt:
              "Professional headshot of David Okonkwo, partner in dark suit with professional demeanor and subtle confident expression",
          },
          {
            name: "Elena Vasquez",
            title: "Partner, Commercial Litigation",
            bio: "First chair trial attorney with 89 jury trials to verdict. Former federal prosecutor, Southern District of New York. Won precedent-setting securities fraud case in 2023.",
            imageAlt:
              "Professional headshot of Elena Vasquez, partner with sophisticated style and assured professional expression",
          },
          {
            name: "Robert Thornton",
            title: "Partner, Estate Planning",
            bio: "Counsel to ultra-high-net-worth families on generational wealth transfer. Former Chair, New York State Bar Association Trusts and Estates Section. Author of 3 treatises.",
            imageAlt:
              "Professional headshot of Robert Thornton, partner with distinguished gray hair and professional business attire",
          },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Client Perspectives"
    const testHeading = props.testimonials?.heading ?? "What Our Clients Say"
    const testDesc =
      props.testimonials?.description ??
      "Our relationships span decades and industries. Here's what leaders of some of America's most successful companies say about working with Reinhart & Associates."
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Margaret Chen and her team guided us through our $340 million acquisition with precision I didn't think was possible in legal practice. They anticipated issues before they arose and kept the deal on track through complex regulatory hurdles.",
            name: "Michael Chen",
            role: "CEO, Meridian Technologies",
            avatarAlt:
              "Professional headshot of Michael Chen, CEO of Meridian Technologies, smiling confidently in business attire",
          },
          {
            quote:
              "When we faced a bet-the-company patent dispute, Elena Vasquez didn't just defend us—she turned the tables and secured a $12 million judgment in our favor. Her courtroom presence is simply commanding.",
            name: "Jennifer Walsh",
            role: "CTO, Axiom Robotics",
            avatarAlt:
              "Professional headshot of Jennifer Walsh, CTO of Axiom Robotics, with thoughtful confident expression",
          },
          {
            quote:
              "Robert Thornton restructured our family's estate plan with such elegance that we eliminated $4.2 million in potential estate taxes while preserving our business for the third generation. A true master of his craft.",
            name: "William Forsythe",
            role: "Chairman, Forsythe Industries",
            avatarAlt:
              "Professional headshot of William Forsythe, Chairman of Forsythe Industries, distinguished older gentleman in business suit",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is your consultation fee?",
            answer:
              "We offer a complimentary 30-minute initial consultation for new business and individual clients. This allows us to understand your situation and explain how we can assist. For complex litigation assessments, we apply a flat $750 fee that is credited against future work if you retain our services.",
          },
          {
            question: "How are your fees structured?",
            answer:
              "Depending on the matter, we work on hourly rates, fixed fees, or contingency arrangements. Transactional matters such as contracts and M&A are typically billed hourly ($450-$850/hour depending on attorney). Certain litigation cases, particularly plaintiff-side commercial disputes, may be appropriate for contingency representation at 33-40% of recovery.",
          },
          {
            question: "Do you work with clients outside New York?",
            answer:
              "Absolutely. While our headquarters are in Manhattan, we represent clients across the United States and internationally. We are admitted in New York, Delaware, California, and Texas, and maintain relationships with correspondent firms in all 50 states for matters requiring local counsel.",
          },
          {
            question: "How quickly can you start on my matter?",
            answer:
              "For urgent matters—litigation deadlines, emergency injunctions, time-sensitive transactions—we can deploy resources within 24 hours. For standard engagements, we typically begin within 5-7 business days of engagement letter execution. We maintain a lean team precisely so we can be responsive when clients need us most.",
          },
          {
            question: "What industries do you specialize in?",
            answer:
              "Our deepest experience spans financial services, technology and SaaS, healthcare and life sciences, commercial real estate, and manufacturing. That said, our commercial litigation and corporate attorneys handle matters across virtually every industry sector. If your industry requires specialized knowledge we don't possess, we'll tell you upfront and potentially refer you to specialized counsel.",
          },
        ]

    const contactEyebrow = props.contact?.eyebrow ?? "Schedule Consultation"
    const contactHeading = props.contact?.heading ?? "Let's Discuss Your Matter"
    const contactDesc =
      props.contact?.description ??
      "Whether you're facing a complex transaction, litigation threat, or strategic business decision, we invite you to schedule a confidential consultation with one of our partners. Every conversation begins with listening."
    const contactPhone = props.contact?.phone ?? "(212) 555-0147"
    const contactEmail = props.contact?.email ?? "consult@reinhart.law"
    const contactAddress =
      props.contact?.address ??
      "450 Lexington Avenue, 28th Floor, New York, NY 10017"
    const contactFormHeading =
      props.contact?.formHeading ?? "Request Consultation"
    const contactSubmit = props.contact?.submit ?? "Submit Request"
    const contactDisclaimer =
      props.contact?.disclaimer ??
      "By submitting this form, you acknowledge that this does not create an attorney-client relationship. Please do not include confidential information."
    const practiceOptions = props.contact?.practiceOptions?.length
      ? props.contact.practiceOptions
      : [
          "Select a practice area",
          "Corporate & Securities",
          "Commercial Litigation",
          "Employment Law",
          "Real Estate",
          "Intellectual Property",
          "Tax & Estates",
          "Other",
        ]

    const footerAbout =
      props.footer?.about ??
      "Premier corporate and trial counsel serving Fortune 500 companies, emerging enterprises, and private clients since 1987."
    const footerAddress =
      props.footer?.address ?? "450 Lexington Avenue, 28th Floor, New York, NY 10017"
    const footerPracticeTitle = props.footer?.practiceTitle ?? "Practice Areas"
    const footerPracticeLinks = props.footer?.practiceLinks?.length
      ? props.footer.practiceLinks
      : [
          "Corporate & Securities",
          "Commercial Litigation",
          "Employment Law",
          "Real Estate",
          "Intellectual Property",
          "Tax & Estates",
        ]
    const footerFirmTitle = props.footer?.firmTitle ?? "Firm"
    const footerFirmLinks = props.footer?.firmLinks?.length
      ? props.footer.firmLinks
      : [
          "Our Attorneys",
          "News & Insights",
          "Careers",
          "Pro Bono",
          "Diversity",
          "Contact",
        ]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerPhone = props.footer?.phone ?? "(212) 555-0147"
    const footerEmail = props.footer?.email ?? "consult@reinhart.law"
    const footerHours = props.footer?.hours ?? "Mon–Fri: 8:00 AM – 7:00 PM"
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} LLP. All rights reserved.`
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Attorney Advertising"]

    const brandInitial = brand.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase() || "R"

    // Brand mark — squared tile with the firm initial (decorative brand asset).
    const BrandMark = ({
      className,
      inverted,
    }: {
      className?: string
      inverted?: boolean
    }) => (
      <span
        className={cn(
          "grid place-items-center rounded-sm font-serif font-bold",
          inverted
            ? "bg-background text-foreground"
            : "bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brandInitial}
      </span>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
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

    const MapPinIcon = ({ className }: { className?: string }) => (
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
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
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )

    const ClockIcon = ({ className }: { className?: string }) => (
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
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const LinkedInIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )

    const StarIcon = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Practice-area icons (rotate token text colors; strokes use currentColor).
    const practiceIcons: ReactNode[] = [
      // building / corporate
      <svg key="building" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      // scales / litigation
      <svg key="scales" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>,
      // briefcase / employment
      <svg key="briefcase" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      // home / real estate
      <svg key="home" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      // lightbulb / IP
      <svg key="bulb" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      // calculator / tax
      <svg key="calc" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
    ]

    const inputCls =
      "w-full rounded-sm border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-card">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3 text-left"
              >
                <BrandMark className="size-10 text-lg" />
                <span className="block">
                  <span className="block font-serif text-xl font-semibold tracking-tight text-foreground">
                    {brand}
                  </span>
                  <span className="block text-xs uppercase tracking-widest text-muted-foreground">
                    {heroTagline}
                  </span>
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Free Consultation
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-foreground md:hidden"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
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
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 font-serif text-4xl leading-tight text-foreground lg:text-6xl">
                    {heroHeadingTop}
                    <br />
                    <span className="italic text-muted-foreground">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="bg-primary px-8 py-4 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="border border-border px-8 py-4 text-center font-medium text-foreground transition-colors hover:border-foreground/40"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-12 flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-8">
                    <button
                      type="button"
                      onClick={() => go(heroPhone)}
                      className="flex items-center gap-2 transition-colors hover:text-foreground"
                    >
                      <PhoneIcon className="size-5" />
                      <span>{heroPhone}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="flex items-center gap-2 text-left transition-colors hover:text-foreground"
                    >
                      <MapPinIcon className="size-5 shrink-0" />
                      <span>{heroAddress}</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    loading="eager"
                    className="h-[500px] w-full rounded-sm object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-8 -left-8 hidden max-w-xs bg-card p-6 shadow-xl lg:block">
                    <p className="mb-2 font-serif text-2xl text-foreground">
                      {heroStatValue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {heroStatLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo strip */}
          <section className="border-y border-border bg-card py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm uppercase tracking-widest text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex justify-center font-serif text-lg font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Practice areas */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                  {paEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-5xl">
                  {paHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {paDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {paItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group border border-border bg-card p-8 transition-colors hover:border-foreground/40"
                  >
                    <div className="mb-6 grid size-12 place-items-center bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {practiceIcons[i % practiceIcons.length]}
                    </div>
                    <h3 className="mb-3 font-serif text-xl text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {paLink} &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-card py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                    {processEyebrow}
                  </p>
                  <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-4xl">
                    {processHeading}
                  </h2>
                  <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
                    {processDesc}
                  </p>
                  <div className="space-y-10">
                    {processSteps.map((step, i) => (
                      <div key={step.title} className="flex gap-6">
                        <div className="grid size-12 shrink-0 place-items-center bg-primary font-serif text-xl text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="mb-2 font-serif text-xl text-foreground">
                            {step.title}
                          </h3>
                          <p className="leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={processImageAlt}
                    w={600}
                    h={800}
                    loading="lazy"
                    className="h-[600px] w-full rounded-sm object-cover shadow-xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-20 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 font-serif text-5xl lg:text-6xl">
                      {s.value}
                    </p>
                    <p className="text-sm uppercase tracking-widest text-primary-foreground/70">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Attorneys */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                  {attEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-5xl">
                  {attHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {attDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {attItems.map((person) => (
                  <div key={person.name} className="group bg-card">
                    <div className="overflow-hidden">
                      <Image
                        alt={person.imageAlt}
                        w={400}
                        h={500}
                        loading="lazy"
                        className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-1 font-serif text-xl text-foreground">
                        {person.name}
                      </h3>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {person.title}
                      </p>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                        {person.bio}
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          aria-label={`${person.name} on LinkedIn`}
                          onClick={() => go(person.name)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <LinkedInIcon className="size-5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Email ${person.name}`}
                          onClick={() => go(person.name)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <MailIcon className="size-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                  {testEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-5xl">
                  {testHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testItems.map((t) => (
                  <div
                    key={t.name}
                    className="border border-border bg-background p-8"
                  >
                    <div className="mb-6 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="mb-6 italic leading-relaxed text-foreground/80">
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
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-5xl">
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-6">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="border border-border bg-card p-8"
                  >
                    <h3 className="mb-3 font-serif text-xl text-foreground">
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

          {/* Contact */}
          <section className="bg-primary py-24 text-primary-foreground lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-widest text-primary-foreground/70">
                    {contactEyebrow}
                  </p>
                  <h2 className="mb-6 font-serif text-3xl lg:text-5xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                    {contactDesc}
                  </p>
                  <div className="mb-8 space-y-4">
                    <button
                      type="button"
                      onClick={() => go(contactPhone)}
                      className="flex items-center gap-4 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                    >
                      <PhoneIcon className="size-5 text-primary-foreground/60" />
                      <span>{contactPhone}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(contactEmail)}
                      className="flex items-center gap-4 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                    >
                      <MailIcon className="size-5 text-primary-foreground/60" />
                      <span>{contactEmail}</span>
                    </button>
                    <div className="flex items-center gap-4 text-primary-foreground/80">
                      <MapPinIcon className="size-5 shrink-0 text-primary-foreground/60" />
                      <span>{contactAddress}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      aria-label="LinkedIn"
                      onClick={() => go("LinkedIn")}
                      className="grid size-10 place-items-center bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                    >
                      <LinkedInIcon className="size-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-card p-8 text-foreground lg:p-10">
                  <h3 className="mb-6 font-serif text-2xl text-foreground">
                    {contactFormHeading}
                  </h3>
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(nav[nav.length - 1])
                    }}
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="lawfirm-first"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          First Name
                        </label>
                        <input
                          id="lawfirm-first"
                          type="text"
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lawfirm-last"
                          className="mb-2 block text-sm font-medium text-foreground"
                        >
                          Last Name
                        </label>
                        <input
                          id="lawfirm-last"
                          type="text"
                          required
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="lawfirm-email"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Email Address
                      </label>
                      <input
                        id="lawfirm-email"
                        type="email"
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lawfirm-phone"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Phone Number
                      </label>
                      <input id="lawfirm-phone" type="tel" className={inputCls} />
                    </div>
                    <div>
                      <label
                        htmlFor="lawfirm-practice"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Practice Area
                      </label>
                      <select
                        id="lawfirm-practice"
                        className={cn(inputCls, "appearance-none")}
                      >
                        {practiceOptions.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="lawfirm-message"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        How Can We Help?
                      </label>
                      <textarea
                        id="lawfirm-message"
                        rows={4}
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {contactSubmit}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {contactDisclaimer}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3 text-left"
                >
                  <BrandMark inverted className="size-10 text-lg" />
                  <span className="block">
                    <span className="block font-serif text-lg font-semibold tracking-tight text-background">
                      {brand}
                    </span>
                    <span className="block text-xs uppercase tracking-widest text-background/50">
                      {heroTagline}
                    </span>
                  </span>
                </button>
                <p className="mb-4 text-sm leading-relaxed text-background/70">
                  {footerAbout}
                </p>
                <div className="flex items-start gap-2 text-sm text-background/70">
                  <MapPinIcon className="size-4 shrink-0" />
                  <span>{footerAddress}</span>
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-medium text-background">
                  {footerPracticeTitle}
                </h4>
                <ul className="space-y-2 text-sm text-background/70">
                  {footerPracticeLinks.map((link) => (
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
                <h4 className="mb-4 font-medium text-background">
                  {footerFirmTitle}
                </h4>
                <ul className="space-y-2 text-sm text-background/70">
                  {footerFirmLinks.map((link) => (
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
                <h4 className="mb-4 font-medium text-background">
                  {footerContactTitle}
                </h4>
                <ul className="space-y-2 text-sm text-background/70">
                  <li>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="flex items-center gap-2 transition-colors hover:text-background"
                    >
                      <PhoneIcon className="size-4" />
                      <span>{footerPhone}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="flex items-center gap-2 transition-colors hover:text-background"
                    >
                      <MailIcon className="size-4" />
                      <span>{footerEmail}</span>
                    </button>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClockIcon className="size-4" />
                    <span>{footerHours}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex gap-6 text-sm text-background/50">
                {footerLegalLinks.map((link) => (
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
