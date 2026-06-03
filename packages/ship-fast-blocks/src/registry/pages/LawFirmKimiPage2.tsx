import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * LawFirmKimiPage2 — TEMPLATE VARIANT 2 for law firms / attorneys.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Westbrook & Associates"
 * design and a visually DISTINCT alternative / second style sibling to
 * LawFirmKimiPage. Where the first variant is a refined, light, serif-driven
 * editorial layout with squared corners, THIS variant is a bold, dramatic,
 * DARK courtroom aesthetic: a deep slate canvas (mapped to background tokens),
 * a single vivid crimson accent (mapped to primary), heavily rounded cards
 * (rounded-xl/2xl/3xl), soft glow gradients behind imagery, a pulsing
 * "now accepting clients" pill, and an aggressive trial-lawyer voice.
 *
 * Layout: a full-bleed split hero (status pill, serif headline with a colored
 * second line, $-results subheading, dual CTAs, an inline 3-up stat row, and a
 * photo with a floating "stacked attorney avatars" credibility card), a
 * "featured in / recognized by" award logo strip, a 6-up practice-areas grid
 * of rounded cards with tinted icon tiles and "Learn More" arrows, a crimson
 * stats band, a 6-up attorney gallery with image-overlay social links, a split
 * 4-step numbered process band beside a photo with a "No Win, No Fee" overlay
 * card, a 3-up star-rated testimonials grid plus a trust-rating mini-stat row,
 * a `<details>`-style FAQ accordion, a crimson CTA band pairing call/visit
 * details with a real consultation request form, and a 4-column footer with a
 * 24/7 emergency-hotline callout and attorney-advertising disclaimer.
 *
 * Every nav item / CTA / link / social / form-submit routes through
 * `useNavigate` (never a dead "#"); navbar labels mirror the `nav` array so
 * PageSwitch can swap pages. All imagery uses the alt-driven <Image> component.
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const LawFirmKimiPage2 = defineComponent({
  name: "LawFirmKimiPage2",
  description:
    "TEMPLATE VARIANT 2 — a BOLD, DRAMATIC, DARK courtroom-style LAW-FIRM / attorneys / trial-lawyer LANDING page and a visually DISTINCT alternative / second style sibling to LawFirmKimiPage (use this when you want an aggressive, high-contrast dark theme with a single vivid crimson accent and heavily rounded cards, instead of the first variant's light, serif editorial look). Deep slate canvas, glow gradients, a pulsing 'now accepting clients' status pill and a confident trial-attorney voice. Includes a full-bleed split hero (status pill, serif headline with a colored second line, dollar-results subheading, dual CTAs, an inline 3-up stat row for years/cases/satisfaction, and a photo with a floating stacked-attorney-avatars credibility card), a 'featured in / recognized by' award & press logo strip (Forbes, Bloomberg, Super Lawyers, Avvo, Best Lawyers, ABA), a 6-up practice-areas grid of rounded cards with tinted icon tiles and Learn-More arrows (personal injury, corporate, criminal defense, family law, real estate, employment), a vivid stats band (verdicts & settlements, attorneys, trial success rate, 24/7 hotline), a 6-up attorney gallery with photo-overlay LinkedIn/email social links, a split 4-step numbered process band beside a photo with a 'No Win, No Fee' overlay card, a 3-up star-rated client testimonials grid plus a trust-rating mini-stat row (Google reviews, Avvo, BBB), a collapsible FAQ accordion of consultation/fee/timeline questions, a crimson CTA band pairing 24/7 call & office-visit details with a real consultation-request form (name, email, phone, practice-area select, message), and a 4-column footer with practice areas, firm links, contact, a 24/7 emergency-hotline callout, social icons and an attorney-advertising disclaimer. Use as the ROOT/home page for law firms, attorneys, trial lawyers, personal-injury / criminal-defense / family-law / corporate / employment / real-estate practices, or any premium professional-services site wanting a high-impact, conversion-focused dark page with strong credentials and social proof. Supply content only — brand, nav, hero, logos, practice areas, stats, attorneys, process, testimonials, FAQ, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Firm / brand name shown in the navbar, hero mark and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        tagline: z.string().optional(),
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered as the colored second line. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        subheadingEmphasis: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        phone: z.string().optional(),
        imageAlt: z.string().optional(),
        statRow: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        avatarAlts: z.array(z.string()).optional(),
        avatarTitle: z.string().optional(),
        avatarSubtitle: z.string().optional(),
      })
      .optional(),
    /** Featured-in / recognized-by logo strip. */
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
    /** Vivid stats band. */
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
    /** Split numbered process band. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        cardTitle: z.string().optional(),
        cardText: z.string().optional(),
      })
      .optional(),
    /** Star-rated client testimonials + trust ratings. */
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
        ratings: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
    /** Crimson CTA band + consultation request form. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        callLabel: z.string().optional(),
        phone: z.string().optional(),
        visitLabel: z.string().optional(),
        address: z.string().optional(),
        formHeading: z.string().optional(),
        submit: z.string().optional(),
        disclaimer: z.string().optional(),
        practiceOptions: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        practiceTitle: z.string().optional(),
        practiceLinks: z.array(z.string()).optional(),
        firmTitle: z.string().optional(),
        firmLinks: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hotlineTitle: z.string().optional(),
        hotlineText: z.string().optional(),
        hotlinePhone: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
        disclaimer: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Westbrook & Associates"
    const nav = props.nav?.length
      ? props.nav
      : ["Practice Areas", "Attorneys", "Testimonials", "FAQ", "Free Consultation"]

    const heroTagline = props.hero?.tagline ?? "Attorneys at Law"
    const heroBadge = props.hero?.badge ?? "Now Accepting New Clients"
    const heroHeadingTop = props.hero?.headingTop ?? "Justice Fights"
    const heroHighlight = props.hero?.highlight ?? "For You"
    const heroSub =
      props.hero?.subheading ??
      "For 35 years, Westbrook & Associates has delivered aggressive, strategic legal representation. We've secured over {emphasis} in verdicts and settlements for our clients."
    const heroSubEmphasis = props.hero?.subheadingEmphasis ?? "$480 million"
    const heroPrimary = props.hero?.primaryCta ?? "Schedule Consultation"
    const heroSecondary = props.hero?.secondaryCta ?? "Our Practice"
    const heroPhone = props.hero?.phone ?? "(215) 555-1234"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Professional law office conference room with mahogany table and law books"
    const heroStatRow = props.hero?.statRow?.length
      ? props.hero.statRow
      : [
          { value: "35+", label: "Years Experience" },
          { value: "2,400+", label: "Cases Won" },
          { value: "98%", label: "Client Satisfaction" },
        ]
    const heroAvatarAlts = props.hero?.avatarAlts?.length
      ? props.hero.avatarAlts
      : [
          "Professional headshot of attorney James Westbrook",
          "Professional headshot of attorney Sarah Chen",
          "Professional headshot of attorney Michael Torres",
        ]
    const heroAvatarTitle = props.hero?.avatarTitle ?? "24 Attorneys"
    const heroAvatarSubtitle = props.hero?.avatarSubtitle ?? "Ready to fight for you"

    const logosHeading = props.logos?.heading ?? "Featured In & Recognized By"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Forbes",
          "Bloomberg",
          "Super Lawyers",
          "Avvo 10.0",
          "Best Lawyers",
          "American Bar Assoc.",
        ]

    const paEyebrow = props.practiceAreas?.eyebrow ?? "Practice Areas"
    const paHeading =
      props.practiceAreas?.heading ?? "Comprehensive Legal Expertise"
    const paDesc =
      props.practiceAreas?.description ??
      "From high-stakes corporate litigation to sensitive family matters, our attorneys bring decades of specialized experience to every case."
    const paLink = props.practiceAreas?.linkLabel ?? "Learn More"
    const paItems = props.practiceAreas?.items?.length
      ? props.practiceAreas.items
      : [
          {
            title: "Personal Injury",
            description:
              "Car accidents, workplace injuries, medical malpractice, and wrongful death claims. We've recovered over $240M for injured clients.",
          },
          {
            title: "Corporate Law",
            description:
              "Mergers & acquisitions, contract disputes, securities litigation, and regulatory compliance. Trusted by Fortune 500 companies.",
          },
          {
            title: "Criminal Defense",
            description:
              "Federal crimes, white-collar defense, DUI/DWI, and violent crime defense. 94% acquittal rate in jury trials.",
          },
          {
            title: "Family Law",
            description:
              "Divorce, child custody, prenuptial agreements, and adoption. Compassionate representation during life's most challenging transitions.",
          },
          {
            title: "Real Estate",
            description:
              "Commercial transactions, zoning disputes, landlord-tenant conflicts, and property development. Over $2B in transactions handled.",
          },
          {
            title: "Employment Law",
            description:
              "Wrongful termination, discrimination, harassment, and wage disputes. Protecting employee rights since 1989.",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "$480M+", label: "In Verdicts & Settlements" },
          { value: "24", label: "Attorneys On Staff" },
          { value: "94%", label: "Trial Success Rate" },
          { value: "24/7", label: "Emergency Hotline" },
        ]

    const attEyebrow = props.attorneys?.eyebrow ?? "Our Team"
    const attHeading = props.attorneys?.heading ?? "Meet Our Attorneys"
    const attDesc =
      props.attorneys?.description ??
      "Award-winning legal minds dedicated to protecting your rights and securing justice."
    const attItems = props.attorneys?.items?.length
      ? props.attorneys.items
      : [
          {
            name: "James Westbrook",
            title: "Founding Partner",
            bio: "35 years of trial experience. Former federal prosecutor. Lead counsel on 200+ million-dollar verdicts. Admitted to practice before the Supreme Court.",
            imageAlt:
              "Professional headshot of James Westbrook, senior partner in navy suit",
          },
          {
            name: "Sarah Chen",
            title: "Managing Partner",
            bio: "Corporate litigation specialist. Harvard Law, cum laude. Former clerk for Judge Merrick Garland. Handles complex securities and M&A matters.",
            imageAlt:
              "Professional headshot of Sarah Chen, managing partner with confident expression",
          },
          {
            name: "Michael Torres",
            title: "Criminal Defense Lead",
            bio: "Board-certified criminal law specialist. 18 years defending federal and state charges. Named “Super Lawyer” 8 consecutive years.",
            imageAlt:
              "Professional headshot of Michael Torres, criminal defense attorney in dark suit",
          },
          {
            name: "Eleanor Park",
            title: "Family Law Partner",
            bio: "Certified Family Law Specialist. Recognized for excellence in complex divorce and custody matters. Mediator and collaborative law advocate.",
            imageAlt:
              "Professional headshot of Eleanor Park, family law attorney with warm professional smile",
          },
          {
            name: "David Okafor",
            title: "Personal Injury Lead",
            bio: "Trial attorney with 42 jury verdicts exceeding $1M. Board-certified in Civil Trial Law. Former insurance defense lawyer—knows their tactics.",
            imageAlt:
              "Professional headshot of David Okafor, personal injury lead attorney in tailored suit",
          },
          {
            name: "Rebecca Williams",
            title: "Employment Law Partner",
            bio: "Yale Law graduate. Former EEOC attorney. Specializes in executive severance, discrimination claims, and whistleblower protection.",
            imageAlt:
              "Professional headshot of Rebecca Williams, employment law partner with assured expression",
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading = props.process?.heading ?? "Your Case, Our Commitment"
    const processDesc =
      props.process?.description ??
      "From first consultation to final resolution, we keep you informed, empowered, and fighting for the best possible outcome."
    const processImageAlt =
      props.process?.imageAlt ??
      "Modern law firm meeting room with attorneys reviewing documents"
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Free Consultation",
            description:
              "Meet with an attorney to discuss your case. No fees, no obligation. We'll evaluate your situation and outline your legal options.",
          },
          {
            title: "Strategy Development",
            description:
              "Our team conducts thorough investigation, gathers evidence, and builds a custom legal strategy tailored to your goals.",
          },
          {
            title: "Aggressive Representation",
            description:
              "We negotiate from strength and litigate with precision. Whether at the settlement table or in the courtroom, we fight for you.",
          },
          {
            title: "Resolution & Recovery",
            description:
              "We don't stop until you receive justice. Our contingency fee structure means we only win when you win.",
          },
        ]
    const processCardTitle = props.process?.cardTitle ?? "No Win, No Fee"
    const processCardText =
      props.process?.cardText ??
      "Personal injury cases operate on contingency. You pay nothing unless we secure compensation for you."

    const testEyebrow = props.testimonials?.eyebrow ?? "Client Success"
    const testHeading = props.testimonials?.heading ?? "What Our Clients Say"
    const testDesc =
      props.testimonials?.description ??
      "Real stories from real people we've helped through difficult times."
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "After my car accident, I didn't know where to turn. David Okafor and his team fought tirelessly and secured a $2.3 million settlement—far more than the insurance company's initial $75,000 offer. They changed my life.",
            name: "Jennifer Martinez",
            role: "Personal Injury Client",
            avatarAlt: "Client testimonial portrait of Jennifer Martinez smiling",
          },
          {
            quote:
              "Facing federal charges was the darkest time of my life. Michael Torres believed in my innocence when no one else did. After 18 months, we won a full acquittal. I'll never forget what he did for my family.",
            name: "Robert Thompson",
            role: "Criminal Defense Client",
            avatarAlt: "Client testimonial portrait of Robert Thompson",
          },
          {
            quote:
              "During my divorce, Eleanor Park was a fierce advocate for my children's interests. She secured custody terms that protected them while preserving my relationship. Forever grateful.",
            name: "Amanda Foster",
            role: "Family Law Client",
            avatarAlt: "Client testimonial portrait of Amanda Foster smiling",
          },
        ]
    const testRatings = props.testimonials?.ratings?.length
      ? props.testimonials.ratings
      : [
          { value: "4.9/5", label: "Google Reviews (312 reviews)" },
          { value: "10/10", label: "Avvo Rating" },
          { value: "A+", label: "Better Business Bureau" },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Get answers to frequently asked questions about our legal services."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How much does a consultation cost?",
            answer:
              "Initial consultations are always free for personal injury and criminal defense cases. For corporate, family, and employment matters, we offer a $150 consultation fee that is credited toward your retainer if you hire us. All consultations include a complete case evaluation and honest assessment of your options.",
          },
          {
            question: "What are your contingency fees?",
            answer:
              "For personal injury cases, we work on a pure contingency basis: you pay nothing unless we win. Our standard fee is 33% if settled before trial, and 40% if the case goes to trial. We also advance all case costs (expert witnesses, filing fees, investigations) and only recover those if we secure compensation for you.",
          },
          {
            question: "How long will my case take?",
            answer:
              "Timelines vary significantly by case type. Personal injury cases typically resolve in 6-18 months, though complex cases may take 2-3 years. Criminal cases move faster, usually 3-12 months. Corporate litigation and family law matters depend on complexity and court schedules. We provide realistic timelines during consultation and keep you updated throughout.",
          },
          {
            question: "Do you handle cases nationwide?",
            answer:
              "Our primary practice serves Pennsylvania and New Jersey. However, for federal cases, class actions, and select corporate matters, we are admitted to practice in multiple federal jurisdictions and can work with local counsel nationwide. We also partner with a network of trusted firms for matters outside our licensed areas.",
          },
          {
            question: "What should I bring to my first meeting?",
            answer:
              "Bring any documents related to your case: police reports, medical records, contracts, correspondence, photographs, and insurance information. Also bring a government-issued ID. For personal injury, bring your insurance cards and any bills you've received. Don't worry if you're missing documents—we can help obtain them.",
          },
          {
            question: "How do I know if I have a case?",
            answer:
              "The only way to know for certain is to speak with an attorney. Many people dismiss valid claims because they assume the odds are against them. We offer honest assessments—if we don't believe you have a viable case, we'll tell you why and may suggest alternatives. If we do take your case, it's because we believe we can win.",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Ready to Fight for Your Rights?"
    const contactDesc =
      props.contact?.description ??
      "Don't wait to get the legal help you need. Every day counts in legal matters. Schedule your free consultation today and take the first step toward justice."
    const contactCallLabel = props.contact?.callLabel ?? "Call Us 24/7"
    const contactPhone = props.contact?.phone ?? "(215) 555-1234"
    const contactVisitLabel = props.contact?.visitLabel ?? "Visit Our Office"
    const contactAddress =
      props.contact?.address ??
      "1500 Market Street, Suite 4200, Philadelphia, PA 19102"
    const contactFormHeading =
      props.contact?.formHeading ?? "Request Consultation"
    const contactSubmit = props.contact?.submit ?? "Schedule Free Consultation"
    const contactDisclaimer =
      props.contact?.disclaimer ??
      "By submitting, you agree to our privacy policy. Attorney-client privilege applies."
    const practiceOptions = props.contact?.practiceOptions?.length
      ? props.contact.practiceOptions
      : [
          "Select a practice area",
          "Personal Injury",
          "Criminal Defense",
          "Family Law",
          "Corporate Law",
          "Employment Law",
          "Real Estate",
          "Other",
        ]

    const footerAbout =
      props.footer?.about ??
      "Award-winning legal representation since 1989. Fighting for justice, protecting rights, securing futures."
    const footerPracticeTitle = props.footer?.practiceTitle ?? "Practice Areas"
    const footerPracticeLinks = props.footer?.practiceLinks?.length
      ? props.footer.practiceLinks
      : [
          "Personal Injury",
          "Criminal Defense",
          "Corporate Law",
          "Family Law",
          "Employment Law",
          "Real Estate",
        ]
    const footerFirmTitle = props.footer?.firmTitle ?? "Our Firm"
    const footerFirmLinks = props.footer?.firmLinks?.length
      ? props.footer.firmLinks
      : [
          "Our Attorneys",
          "Case Results",
          "Testimonials",
          "News & Media",
          "Careers",
          "Contact Us",
        ]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "1500 Market Street, Suite 4200, Philadelphia, PA 19102"
    const footerPhone = props.footer?.phone ?? "(215) 555-1234"
    const footerEmail = props.footer?.email ?? "info@westbrooklaw.com"
    const footerHotlineTitle =
      props.footer?.hotlineTitle ?? "24/7 Emergency Hotline:"
    const footerHotlineText =
      props.footer?.hotlineText ?? "For urgent criminal matters and accidents"
    const footerHotlinePhone = props.footer?.hotlinePhone ?? "(215) 555-9999"
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Disclaimer"]
    const footerDisclaimer =
      props.footer?.disclaimer ??
      "Attorney Advertising. Prior results do not guarantee similar outcomes. No attorney-client relationship is formed by use of this website. Please contact us directly to discuss your specific situation."

    const brandInitial =
      brand.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase() || "W"

    const ctaTarget = nav[nav.length - 1]

    // Hero subheading split around the {emphasis} token.
    const subParts = heroSub.split("{emphasis}")

    // Icons -----------------------------------------------------------------
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

    const ChevronRight = ({ className }: { className?: string }) => (
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
        <path d="M9 5l7 7-7 7" />
      </svg>
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

    const TwitterIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )

    const FacebookIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

    // Practice-area icons (strokes use currentColor + token text color).
    const practiceIcons: ReactNode[] = [
      // scales / personal injury
      <svg key="scales" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>,
      // building / corporate
      <svg key="building" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      // shield-lock / criminal defense
      <svg key="shield" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      // group / family law
      <svg key="family" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // home / real estate
      <svg key="home" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      // badge-check / employment
      <svg key="badge" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
    ]

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"

    const BrandMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-serif font-bold text-primary-foreground transition-colors group-hover:bg-primary/80",
          className,
        )}
        aria-hidden="true"
      >
        {brandInitial}
      </span>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="group flex items-center gap-3 text-left"
              >
                <BrandMark className="size-10 text-xl" />
                <span className="hidden sm:block">
                  <span className="block font-serif text-lg font-semibold tracking-tight text-foreground">
                    {brand}
                  </span>
                  <span className="-mt-0.5 block text-xs text-muted-foreground">
                    {heroTagline}
                  </span>
                </span>
              </button>

              <div className="hidden items-center gap-8 lg:flex">
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
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(heroPhone)}
                  className="hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex"
                >
                  <PhoneIcon className="size-4" />
                  {heroPhone}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaTarget)}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
                >
                  {ctaTarget}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main className="pt-20">
          {/* Hero */}
          <section className="relative flex min-h-screen items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background" />
            <div className="absolute right-0 top-0 h-1/2 w-1/2 bg-gradient-to-bl from-primary/20 to-transparent blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

            <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroBadge}
                    </span>
                  </div>

                  <h1 className="font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroHeadingTop}
                    <span className="mt-2 block text-primary">
                      {heroHighlight}
                    </span>
                  </h1>

                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {subParts[0]}
                    {subParts.length > 1 && (
                      <span className="font-semibold text-foreground">
                        {heroSubEmphasis}
                      </span>
                    )}
                    {subParts[1]}
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                    >
                      <span>{heroPrimary}</span>
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-8 py-4 text-lg font-semibold text-secondary-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      <span>{heroSecondary}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6 border-t border-border pt-8">
                    {heroStatRow.map((s) => (
                      <div key={s.label}>
                        <p className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                          {s.value}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative lg:h-[600px]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={1000}
                    loading="eager"
                    className="relative h-full w-full rounded-3xl border border-border object-cover shadow-2xl"
                  />
                  <div className="absolute inset-x-6 bottom-6 rounded-xl border border-border bg-background/90 p-4 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {heroAvatarAlts.map((alt) => (
                          <Image
                            key={alt}
                            alt={alt}
                            w={100}
                            h={100}
                            loading="lazy"
                            className="size-10 rounded-full border-2 border-background object-cover"
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {heroAvatarTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroAvatarSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo strip */}
          <section className="border-y border-border bg-muted py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-12 items-center justify-center font-serif text-base font-bold text-muted-foreground transition-colors hover:text-foreground"
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
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                  {paEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {paHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{paDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-primary/50"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {practiceIcons[i % practiceIcons.length]}
                    </div>
                    <h3 className="mb-3 font-serif text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      {paLink}
                      <ChevronRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-20 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-serif text-4xl font-bold lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="mt-2 font-medium text-primary-foreground/80">
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
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                  {attEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {attHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{attDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {attItems.map((person) => (
                  <div key={person.name} className="group">
                    <div className="relative mb-6 overflow-hidden rounded-2xl">
                      <Image
                        alt={person.imageAlt}
                        w={600}
                        h={700}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 flex gap-3">
                        <button
                          type="button"
                          aria-label={`${person.name} on LinkedIn`}
                          onClick={() => go(person.name)}
                          className="grid size-10 place-items-center rounded-full bg-foreground/10 text-foreground backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          <LinkedInIcon className="size-5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Email ${person.name}`}
                          onClick={() => go(person.name)}
                          className="grid size-10 place-items-center rounded-full bg-foreground/10 text-foreground backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          <MailIcon className="size-5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      {person.name}
                    </h3>
                    <p className="mb-2 font-medium text-primary">
                      {person.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {person.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                    {processEyebrow}
                  </p>
                  <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                    {processHeading}
                  </h2>
                  <p className="mb-12 text-lg text-muted-foreground">
                    {processDesc}
                  </p>

                  <div className="space-y-8">
                    {processSteps.map((step, i) => (
                      <div key={step.title} className="flex gap-6">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="mb-2 font-serif text-xl font-bold text-foreground">
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
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
                  <Image
                    alt={processImageAlt}
                    w={700}
                    h={900}
                    loading="lazy"
                    className="relative w-full rounded-3xl border border-border object-cover shadow-2xl"
                  />
                  <div className="absolute inset-x-6 bottom-6 rounded-xl border border-border bg-background/95 p-6 backdrop-blur-md">
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                        <ClockIcon className="size-6" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-foreground">
                          {processCardTitle}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {processCardText}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                  {testEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {testHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-6 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-card-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
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

              <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
                {testRatings.map((r) => (
                  <div
                    key={r.label}
                    className="rounded-xl border border-border bg-muted/50 p-6 text-center"
                  >
                    <p className="mb-2 font-serif text-4xl font-bold text-foreground">
                      {r.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-background [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-6">
                      <h3 className="font-semibold text-foreground">
                        {item.question}
                      </h3>
                      <span className="relative size-5 shrink-0 text-muted-foreground">
                        <svg
                          className="absolute inset-0 size-5 opacity-100 transition-opacity group-open:opacity-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <svg
                          className="absolute inset-0 size-5 opacity-0 transition-opacity group-open:opacity-100"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </span>
                    </summary>
                    <p className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA / Consultation */}
          <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32">
            <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-tr from-primary-foreground/10 to-transparent blur-3xl" />
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/40 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                    {contactDesc}
                  </p>

                  <div className="mb-8 space-y-4">
                    <button
                      type="button"
                      onClick={() => go(contactPhone)}
                      className="flex w-full items-center gap-4 text-left"
                    >
                      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-foreground/15">
                        <PhoneIcon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm text-primary-foreground/70">
                          {contactCallLabel}
                        </p>
                        <p className="font-semibold transition-colors hover:text-primary-foreground/80">
                          {contactPhone}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-foreground/15">
                        <MapPinIcon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm text-primary-foreground/70">
                          {contactVisitLabel}
                        </p>
                        <p className="font-semibold">{contactAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-2xl">
                  <h3 className="mb-6 font-serif text-2xl font-bold text-card-foreground">
                    {contactFormHeading}
                  </h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(ctaTarget)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="lawfirm2-first"
                          className="mb-1.5 block text-sm font-medium text-muted-foreground"
                        >
                          First Name
                        </label>
                        <input
                          id="lawfirm2-first"
                          type="text"
                          required
                          placeholder="John"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lawfirm2-last"
                          className="mb-1.5 block text-sm font-medium text-muted-foreground"
                        >
                          Last Name
                        </label>
                        <input
                          id="lawfirm2-last"
                          type="text"
                          required
                          placeholder="Doe"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="lawfirm2-email"
                        className="mb-1.5 block text-sm font-medium text-muted-foreground"
                      >
                        Email Address
                      </label>
                      <input
                        id="lawfirm2-email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lawfirm2-phone"
                        className="mb-1.5 block text-sm font-medium text-muted-foreground"
                      >
                        Phone Number
                      </label>
                      <input
                        id="lawfirm2-phone"
                        type="tel"
                        placeholder="(215) 555-0000"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lawfirm2-practice"
                        className="mb-1.5 block text-sm font-medium text-muted-foreground"
                      >
                        Practice Area
                      </label>
                      <select
                        id="lawfirm2-practice"
                        className={cn(inputCls, "cursor-pointer appearance-none")}
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
                        htmlFor="lawfirm2-message"
                        className="mb-1.5 block text-sm font-medium text-muted-foreground"
                      >
                        Tell Us About Your Case
                      </label>
                      <textarea
                        id="lawfirm2-message"
                        rows={4}
                        placeholder="Brief description of your legal matter..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary py-4 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
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
        <footer className="border-t border-border bg-background pb-8 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="group mb-6 flex items-center gap-3 text-left"
                >
                  <BrandMark className="size-10 text-xl" />
                  <span className="block font-serif text-lg font-semibold tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    aria-label="LinkedIn"
                    onClick={() => go("LinkedIn")}
                    className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <LinkedInIcon className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Twitter"
                    onClick={() => go("Twitter")}
                    className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <TwitterIcon className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Facebook"
                    onClick={() => go("Facebook")}
                    className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <FacebookIcon className="size-5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerPracticeTitle}
                </h4>
                <ul className="space-y-3">
                  {footerPracticeLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerFirmTitle}
                </h4>
                <ul className="space-y-3">
                  {footerFirmLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerContactTitle}
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <MapPinIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <PhoneIcon className="size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="transition-colors hover:text-foreground"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <MailIcon className="size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-foreground"
                    >
                      {footerEmail}
                    </button>
                  </li>
                </ul>

                <div className="mt-6 rounded-lg border border-border bg-muted p-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {footerHotlineTitle}
                    </span>
                    <br />
                    {footerHotlineText}
                    <br />
                    <button
                      type="button"
                      onClick={() => go(footerHotlinePhone)}
                      className="font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {footerHotlinePhone}
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-muted-foreground">{footerCopyright}</p>
                <div className="flex gap-6 text-sm">
                  {footerLegalLinks.map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => go(link)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground/70 md:text-left">
                {footerDisclaimer}
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
