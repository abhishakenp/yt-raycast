import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AgencyKimiPage2 — TEMPLATE VARIANT 2 for the creative-agency category.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Studio Bold" design and a
 * deliberately DISTINCT sibling to AgencyKimiPage. Where the first variant is a
 * centered, single-column hero on a quiet canvas, this one is a punchy, editorial
 * dark layout: an asymmetric split hero (huge ultra-black headline beside a
 * floating showcase photo with overlapping "project delivered" + satisfaction
 * stat cards), a scrolling client-logo marquee strip, a 6-up services grid with
 * icon tiles, an asymmetric masonry-style selected-work gallery (one wide feature
 * tile), a split stats/about band with quadrant metric cards, a numbered 4-step
 * "creative process" row, a 6-card testimonial wall with star ratings, an
 * expandable FAQ accordion (native details/summary), a glowing call-to-action
 * band, and a rich multi-column footer with social icons.
 *
 * Every nav item / CTA / link / social / form submit routes through useNavigate
 * (never a dead "#"); all imagery uses the alt-driven <Image> component; colors
 * use ONLY semantic theme tokens (the accent/pink brand hue maps to `primary`).
 * All props are optional with rich defaults pulled from the source copy, so it
 * renders the full page from just `brand` + `nav`.
 */
export const AgencyKimiPage2 = defineCapsule({
  name: "AgencyKimiPage2",
  description:
    "SECOND, visually DISTINCT creative digital-agency / studio LANDING page (alternative sibling to AgencyKimiPage) with a bold, punchy, editorial dark aesthetic: near-black canvas, vivid accent/pink brand hue, glow orbs. Layout differs sharply from variant one — an ASYMMETRIC SPLIT hero (massive ultra-black headline beside a floating showcase photo with overlapping project-delivered + client-satisfaction stat cards and an inline KPI row), a scrolling client-logo MARQUEE strip, a 6-up services/capabilities grid with hover-lift icon-tile cards, an asymmetric MASONRY selected-work gallery with one wide feature tile and category tags, a split stats/about band with quadrant metric cards, a NUMBERED 4-step creative-process row, a 6-card testimonial WALL with 5-star ratings and avatars, an expandable FAQ accordion, a glowing CTA band, and a rich multi-column footer with social icons. Use as the ROOT/home page for creative agencies, design studios, branding shops, marketing/advertising firms, web-design agencies, motion/production houses, or freelance creative collectives when a high-energy, work-showcase-heavy, conversion-focused alternative layout is wanted (pick this over AgencyKimiPage for a more magazine/editorial, content-dense feel). Supply content only — brand, nav, hero, services, work, about/stats, process, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / studio name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        /** Heading words rendered stacked; the highlighted word gets the accent color. */
        headingLead: z.string().optional(),
        highlight: z.string().optional(),
        headingTrail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Floating card over the hero image. */
        floatLabel: z.string().optional(),
        floatSub: z.string().optional(),
        floatStat: z.string().optional(),
        floatStatLabel: z.string().optional(),
        /** Inline KPI strip beneath the hero copy. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Scrolling client-logo marquee. */
    logos: z
      .object({
        caption: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services / capabilities grid. */
    services: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Selected-work gallery (item index 3 renders wide). */
    work: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tag: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Split stats / about band. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        description: z.string().optional(),
        /** Two inline highlight metrics under the about copy. */
        highlights: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        /** Four quadrant metric cards (index 1 uses the primary fill). */
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered creative-process steps. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonial wall. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
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
        highlight: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Call-to-action band. */
    cta: z
      .object({
        headingLead: z.string().optional(),
        highlight: z.string().optional(),
        headingTrail: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        servicesTitle: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        contactLines: z.array(z.string()).optional(),
        legalLinks: z.array(z.string()).optional(),
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "STUDIO BOLD"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Work", "About", "Testimonials", "Start Project"]

    const heroBadge = props.hero?.badge ?? "Now accepting projects for Q3 2026"
    const headingLead = props.hero?.headingLead ?? "WE CREATE"
    const heroHighlight = props.hero?.highlight ?? "BOLD"
    const headingTrail = props.hero?.headingTrail ?? "DIGITAL EXPERIENCES"
    const heroSub =
      props.hero?.subheading ??
      "Award-winning creative agency crafting websites, brands, and campaigns that make lasting impressions. From startups to Fortune 500s, we transform visions into reality."
    const heroPrimary = props.hero?.primaryCta ?? "View Our Work"
    const heroSecondary = props.hero?.secondaryCta ?? "Start Your Project"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Creative designer working on brand identity project with vibrant color swatches and typography samples across a modern workspace"
    const floatLabel = props.hero?.floatLabel ?? "Project Delivered"
    const floatSub = props.hero?.floatSub ?? "Nike Air Campaign"
    const floatStat = props.hero?.floatStat ?? "98%"
    const floatStatLabel = props.hero?.floatStatLabel ?? "Client Satisfaction"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "247+", label: "Projects Delivered" },
          { value: "48", label: "Industry Awards" },
          { value: "12+", label: "Years Experience" },
        ]

    const logosCaption =
      props.logos?.caption ?? "Trusted by industry leaders"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["GOOGLE", "SPOTIFY", "AIRBNB", "NIKE", "ADOBE", "NETFLIX", "UBER", "STRIPE"]

    const servicesEyebrow = props.services?.eyebrow ?? "What We Do"
    const servicesHeading = props.services?.heading ?? "Services That Drive"
    const servicesHighlight = props.services?.highlight ?? "Results"
    const servicesDesc =
      props.services?.description ??
      "From strategy to execution, we deliver comprehensive digital solutions that help brands stand out and succeed in the digital landscape."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Brand Identity",
            description:
              "Complete brand systems including logo design, color palettes, typography, and comprehensive brand guidelines that ensure consistency.",
          },
          {
            title: "Web Design",
            description:
              "Stunning, responsive websites that captivate visitors and convert them into customers. Built with modern technologies and best practices.",
          },
          {
            title: "App Development",
            description:
              "Native and cross-platform mobile applications with intuitive UX, robust performance, and scalable architecture for iOS and Android.",
          },
          {
            title: "Motion Design",
            description:
              "Captivating animations and video content that bring brands to life. From micro-interactions to full-scale commercial productions.",
          },
          {
            title: "Digital Marketing",
            description:
              "Data-driven campaigns across social media, search, and display that maximize ROI. SEO, PPC, content marketing, and analytics.",
          },
          {
            title: "UX Research",
            description:
              "Deep user insights through interviews, usability testing, and analytics. We design experiences backed by real data and user behavior.",
          },
        ]

    const workEyebrow = props.work?.eyebrow ?? "Selected Work"
    const workHeading = props.work?.heading ?? "Projects That"
    const workHighlight = props.work?.highlight ?? "Inspire"
    const workViewAll = props.work?.viewAll ?? "View All Projects"
    const workItems = props.work?.items?.length
      ? props.work.items
      : [
          {
            title: "Luminex Banking",
            description: "Complete rebrand and digital platform for next-gen banking",
            tag: "Fintech",
          },
          {
            title: "Aurora Fashion",
            description: "Sustainable fashion marketplace with AR try-on features",
            tag: "E-Commerce",
          },
          {
            title: "Mindspace App",
            description: "Mental wellness platform with AI-powered therapy tools",
            tag: "Health Tech",
          },
          {
            title: "Nike Air Max Day",
            description:
              "Global campaign featuring AR experiences, influencer collaborations, and immersive retail installations across 40 cities",
            tag: "Brand Campaign",
          },
          {
            title: "Nexchain Exchange",
            description: "Decentralized trading platform with institutional-grade security",
            tag: "Crypto",
          },
        ]

    const aboutEyebrow = props.about?.eyebrow ?? "About Studio Bold"
    const aboutHeading = props.about?.heading ?? "Numbers That"
    const aboutHighlight = props.about?.highlight ?? "Speak"
    const aboutDesc =
      props.about?.description ??
      "Founded in 2014, we've grown from a two-person design studio to a full-service creative agency with offices in San Francisco, New York, and London. Our team of 47 creatives, strategists, and technologists work together to deliver exceptional results."
    const aboutHighlights = props.about?.highlights?.length
      ? props.about.highlights
      : [
          { value: "$47M", label: "Revenue Generated for Clients" },
          { value: "89%", label: "Client Retention Rate" },
        ]
    const aboutItems = props.about?.items?.length
      ? props.about.items
      : [
          { value: "247+", label: "Projects Completed" },
          { value: "12+", label: "Years Experience" },
          { value: "48", label: "Awards Won" },
          { value: "47", label: "Team Members" },
        ]

    const processEyebrow = props.process?.eyebrow ?? "How We Work"
    const processHeading = props.process?.heading ?? "Our Creative"
    const processHighlight = props.process?.highlight ?? "Process"
    const processDesc =
      props.process?.description ??
      "A proven methodology refined over 247+ projects. We blend strategic thinking with creative excellence to deliver results that exceed expectations."
    const processItems = props.process?.items?.length
      ? props.process.items
      : [
          {
            title: "Discovery",
            description:
              "Deep dive into your brand, audience, and goals. We conduct stakeholder interviews, competitive analysis, and market research.",
          },
          {
            title: "Strategy",
            description:
              "Defining the roadmap. We create detailed project plans, sitemaps, user flows, and creative briefs aligned with your objectives.",
          },
          {
            title: "Create",
            description:
              "Bringing ideas to life. Our designers and developers craft stunning visuals, interactive prototypes, and production-ready code.",
          },
          {
            title: "Launch",
            description:
              "Perfecting every detail. We conduct rigorous testing, optimize performance, and execute seamless launches with ongoing support.",
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading = props.testimonials?.heading ?? "Loved by"
    const testimonialsHighlight = props.testimonials?.highlight ?? "Leaders"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it. Here's what industry leaders say about working with Studio Bold."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Studio Bold transformed our brand completely. The attention to detail and creative vision exceeded our expectations. Our conversion rate increased by 340% after the redesign.",
            name: "Marcus Chen",
            role: "CEO, Luminex Financial",
          },
          {
            quote:
              "Working with Studio Bold was a game-changer. They understood our vision immediately and delivered a website that perfectly captures our brand essence. Truly world-class talent.",
            name: "Sarah Mitchell",
            role: "CMO, Aurora Fashion",
          },
          {
            quote:
              "The team at Studio Bold doesn't just design—they solve problems. Our app launch was a massive success, with 100K downloads in the first week. Their strategic approach made all the difference.",
            name: "David Park",
            role: "Founder, Mindspace",
          },
          {
            quote:
              "From concept to launch, Studio Bold delivered beyond our wildest expectations. Their motion design work for our campaign was featured in Communication Arts.",
            name: "Emily Rodriguez",
            role: "Marketing Director, Nike Global",
          },
          {
            quote:
              "Studio Bold built our crypto exchange from the ground up. The platform handles $2B+ in monthly volume flawlessly. Their technical expertise is unmatched.",
            name: "James Wilson",
            role: "CTO, Nexchain Exchange",
          },
          {
            quote:
              "We've worked with dozens of agencies, but Studio Bold is in a league of their own. Their combination of creativity, strategy, and execution is truly rare. Our go-to partner.",
            name: "Michael Torres",
            role: "VP Product, Spotify",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common"
    const faqHighlight = props.faq?.highlight ?? "Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What is your typical project timeline?",
            a: "Project timelines vary based on scope and complexity. A typical brand identity project takes 6-8 weeks, while a full website design and development project ranges from 10-16 weeks. We provide detailed timelines during our proposal phase and maintain transparent communication throughout.",
          },
          {
            q: "How much does a typical project cost?",
            a: "Our projects typically start at $25,000 for brand identity and $45,000 for website design and development. We provide custom quotes based on your specific requirements, goals, and timeline. We also offer flexible payment schedules to accommodate different budget cycles.",
          },
          {
            q: "Do you work with clients internationally?",
            a: "Absolutely! We work with clients across 23 countries and have team members in San Francisco, New York, London, and Berlin. Our async-first workflow and flexible meeting times make international collaboration seamless. We use Figma, Slack, and Notion to keep everyone aligned.",
          },
          {
            q: "What deliverables are included in a branding project?",
            a: "Our brand identity packages include: logo design (primary, secondary, and icon variations), complete color palette with usage guidelines, typography system, brand pattern and texture library, social media templates, business card and stationery designs, and a comprehensive brand guidelines document. Optional add-ons include motion logos, packaging design, and brand photography direction.",
          },
          {
            q: "Do you offer ongoing support after launch?",
            a: "Yes! We offer monthly retainer packages for design and development support starting at $5,000/month. This includes priority support, regular design updates, A/B testing recommendations, analytics review, and strategic consultations. Many of our clients have been with us for 3+ years of continuous collaboration.",
          },
          {
            q: "How do I get started working with you?",
            a: "Simply fill out our project inquiry form or email us at hello@studiobold.co. We'll schedule a 30-minute discovery call to understand your goals, timeline, and budget. Within 5 business days, we'll send a detailed proposal with scope, timeline, and pricing. Once approved, we kick off with a comprehensive brand discovery workshop.",
          },
        ]

    const ctaLead = props.cta?.headingLead ?? "Ready to Create Something"
    const ctaHighlight = props.cta?.highlight ?? "Bold"
    const ctaTrail = props.cta?.headingTrail ?? "?"
    const ctaDesc =
      props.cta?.description ??
      "Let's discuss your project and explore how we can help you achieve your goals. Our team is ready to bring your vision to life."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Your Project"
    const ctaSecondary = props.cta?.secondaryCta ?? "View Our Deck"
    const ctaNote =
      props.cta?.note ??
      "Currently accepting projects for Q3 2026 • Response within 24 hours"

    const footerAbout =
      props.footer?.about ??
      "Award-winning creative digital agency crafting bold brands, websites, and digital experiences since 2014."
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : ["Brand Identity", "Web Design", "App Development", "Motion Design", "Digital Marketing"]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Our Work", "Careers", "Blog", "Contact"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerContactLines = props.footer?.contactLines?.length
      ? props.footer.contactLines
      : ["hello@studiobold.co", "+1 (415) 555-0127", "580 Market St, Suite 400, San Francisco, CA 94104"]
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerNote = props.footer?.note ?? "All rights reserved."

    // Brand logo tile — accent square with the brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

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

    const Star = () => (
      <svg
        className="size-5 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // brand / palette
      <svg key="brand" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
      // web
      <svg key="web" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      // app / mobile
      <svg key="app" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      // motion / video
      <svg key="motion" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      // marketing / chart
      <svg key="marketing" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>,
      // research / beaker
      <svg key="research" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
    ]

    const processIcons: ReactNode[] = [
      // discovery / lightbulb
      <svg key="discovery" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      // strategy / pencil
      <svg key="strategy" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      // create / beaker
      <svg key="create" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      // launch / sparkles
      <svg key="launch" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
    ]

    const socials = ["Twitter", "Instagram", "LinkedIn", "Dribbble"] as const
    const socialPaths: Record<(typeof socials)[number], string> = {
      Twitter:
        "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
      Instagram:
        "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z",
      LinkedIn:
        "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
      Dribbble:
        "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.392-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.13-7.862-.013.004-.026.007-.038.01-5.63 1.966-7.64 5.886-7.823 6.286 1.71 1.335 3.87 2.14 6.213 2.14 1.32 0 2.585-.29 3.778-.574zm-10.05-2.2c.233-.43 2.947-5.166 8.07-6.912.128-.042.256-.08.385-.117-.247-.56-.512-1.12-.794-1.666-4.93 1.476-9.704.877-10.136.81-.003.15-.007.3-.007.454 0 2.55.96 4.88 2.482 6.432zm-2.42-8.64c.456.054 4.01.5 8.517-.863-1.524-2.71-3.17-4.97-3.418-5.295-2.653 1.25-4.63 3.71-5.1 6.66zm6.67-7.457c.277.37 1.93 2.63 3.453 5.41 3.277-1.23 4.63-3.09 4.743-3.25-1.693-1.5-3.92-2.41-6.36-2.41-.514 0-1.02.054-1.523.155-.035-.015-.07-.03-.107-.043.016.053.032.105.048.16zm8.53 2.744c-.13.175-1.578 2.05-4.975 3.44.206.42.405.847.59 1.28.065.152.13.303.192.455 2.977-.377 5.93.26 6.228.34-.02-2.135-.747-4.09-2.036-5.515z",
    }

    return (
      <div
        className={cn(
          "relative min-h-svh overflow-x-hidden bg-background font-sans text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <LogoMark className="size-8 text-lg" />
              {brand}
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
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {nav[nav.length - 1]}
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
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
          <section className="relative flex min-h-screen items-center overflow-hidden pt-20" aria-label="Hero">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
            <div aria-hidden="true" className="absolute right-0 top-20 size-96 rounded-full bg-primary/30 blur-3xl" />
            <div aria-hidden="true" className="absolute bottom-0 left-0 size-72 rounded-full bg-accent/30 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-muted-foreground">{heroBadge}</span>
                  </div>
                  <h1 className="text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                    {headingLead} <span className="text-primary">{heroHighlight}</span> {headingTrail}
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-4 font-semibold text-foreground transition-all hover:bg-accent/50"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-8 pt-4">
                    {heroStats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-8">
                        {i > 0 && <div className="h-12 w-px bg-border" />}
                        <div>
                          <div className="text-3xl font-bold text-foreground">{s.value}</div>
                          <div className="text-sm text-muted-foreground">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="h-auto w-full object-cover"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-xl sm:block">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-lg bg-primary/20 text-primary">
                        <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-card-foreground">{floatLabel}</div>
                        <div className="text-xs text-muted-foreground">{floatSub}</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 hidden rounded-xl border border-border bg-card p-4 shadow-xl sm:block">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{floatStat}</span>
                      <span className="text-sm text-muted-foreground">{floatStatLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo marquee */}
          <section className="overflow-hidden border-y border-border py-16" aria-label="Client logos">
            <div className="mb-10 text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{logosCaption}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 px-8">
              {logoItems.map((logo) => (
                <button
                  key={logo}
                  type="button"
                  onClick={() => go(logo)}
                  className="text-2xl font-bold text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  {logo}
                </button>
              ))}
            </div>
          </section>

          {/* Services */}
          <section className="py-24 lg:py-32" aria-label="Our services">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  {servicesHeading} <span className="text-primary">{servicesHighlight}</span>
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-primary/50"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Selected work */}
          <section className="bg-muted/30 py-24 lg:py-32" aria-label="Our work">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    {workEyebrow}
                  </span>
                  <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                    {workHeading} <span className="text-primary">{workHighlight}</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(workViewAll)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-all hover:gap-3"
                >
                  {workViewAll}
                  <ArrowRight />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workItems.map((proj, i) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className={cn(
                      "group relative block aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl text-left",
                      i === 3 && "md:col-span-2 lg:col-span-2",
                    )}
                  >
                    <Image
                      alt={proj.title}
                      w={i === 3 ? 1200 : 600}
                      h={i === 3 ? 600 : 750}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                    <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                      <span className="mb-3 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                        {proj.tag}
                      </span>
                      <h3 className={cn("mb-2 font-bold", i === 3 ? "text-2xl lg:text-3xl" : "text-2xl")}>
                        {proj.title}
                      </h3>
                      <p className="max-w-xl text-sm text-muted-foreground">{proj.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats / About */}
          <section className="py-24 lg:py-32" aria-label="Company statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    {aboutEyebrow}
                  </span>
                  <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                    {aboutHeading} <span className="text-primary">{aboutHighlight}</span> For Themselves
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{aboutDesc}</p>
                  <div className="grid grid-cols-2 gap-6">
                    {aboutHighlights.map((h) => (
                      <div key={h.label} className="rounded-xl border border-border bg-card p-6">
                        <div className="mb-2 text-4xl font-black text-primary">{h.value}</div>
                        <div className="text-sm text-muted-foreground">{h.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {aboutItems.slice(0, 2).map((s, i) => (
                      <div
                        key={s.label}
                        className={cn(
                          "rounded-2xl p-8 text-center",
                          i === 1
                            ? "bg-primary"
                            : "border border-border bg-card",
                        )}
                      >
                        <div className={cn("mb-2 text-5xl font-black", i === 1 ? "text-primary-foreground" : "text-foreground")}>
                          {s.value}
                        </div>
                        <div className={cn("text-sm uppercase tracking-wider", i === 1 ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6 pt-12">
                    {aboutItems.slice(2, 4).map((s) => (
                      <div key={s.label} className="rounded-2xl border border-border bg-card p-8 text-center">
                        <div className="mb-2 text-5xl font-black text-foreground">{s.value}</div>
                        <div className="text-sm uppercase tracking-wider text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-muted/30 py-24 lg:py-32" aria-label="Our process">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {processEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  {processHeading} <span className="text-primary">{processHighlight}</span>
                </h2>
                <p className="text-lg text-muted-foreground">{processDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {processItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="absolute -top-6 left-0 text-8xl font-black text-foreground/5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="relative pt-8">
                      <div
                        className={cn(
                          "mb-6 grid size-16 place-items-center rounded-2xl",
                          i === 0
                            ? "bg-primary text-primary-foreground"
                            : "border-2 border-primary bg-background text-primary",
                        )}
                      >
                        {processIcons[i % processIcons.length]}
                      </div>
                      <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                      <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 lg:py-32" aria-label="Client testimonials">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  {testimonialsHeading} <span className="text-primary">{testimonialsHighlight}</span>
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-2xl border border-border bg-card p-8">
                    <div className="mb-6 flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} />
                      ))}
                    </div>
                    <p className="mb-8 text-lg leading-relaxed text-card-foreground">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={`Portrait of ${t.name}, ${t.role}`}
                        w={100}
                        h={100}
                        className="size-12 rounded-full border border-border object-cover"
                      />
                      <div>
                        <div className="font-semibold text-card-foreground">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/30 py-24 lg:py-32" aria-label="Frequently asked questions">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  {faqHeading} <span className="text-primary">{faqHighlight}</span>
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="text-lg font-semibold text-card-foreground">{item.q}</span>
                      <span className="grid size-8 place-items-center rounded-full bg-muted transition-transform group-open:rotate-180">
                        <svg className="size-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden py-24 lg:py-32" aria-label="Call to action">
            <div aria-hidden="true" className="absolute inset-0 bg-primary/10" />
            <div aria-hidden="true" className="absolute right-0 top-0 size-96 rounded-full bg-primary/30 blur-3xl" />
            <div aria-hidden="true" className="absolute bottom-0 left-0 size-72 rounded-full bg-accent/30 blur-3xl" />

            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {ctaLead} <span className="text-primary">{ctaHighlight}</span>{ctaTrail}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">{ctaDesc}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-border px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-accent/50"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-muted-foreground">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16" role="contentinfo">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <LogoMark className="size-10 text-xl" />
                  <span className="text-2xl font-bold tracking-tight text-foreground">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm leading-relaxed text-muted-foreground">{footerAbout}</p>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d={socialPaths[social]} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">{footerServicesTitle}</h4>
                <ul className="space-y-3 text-muted-foreground">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">{footerCompanyTitle}</h4>
                <ul className="space-y-3 text-muted-foreground">
                  {footerCompanyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">{footerContactTitle}</h4>
                <ul className="space-y-3 text-muted-foreground">
                  {footerContactLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerNote}
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-foreground"
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
