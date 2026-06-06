import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ArchitectureFirmKimiPage2 — a complete, self-contained architecture-studio
 * LANDING page. This is the SECOND, visually DISTINCT alternative style to
 * ArchitectureFirmKimiPage (use this one when a bold, dramatic, dark look is
 * wanted instead of the calm light Scandinavian sibling).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Forma Architecture Studio"
 * design: a confident, dramatic DARK editorial aesthetic on a near-black canvas
 * with a warm amber/gold brand accent, heavy bold display type, wide
 * letter-spaced uppercase eyebrows, and high-contrast surfaces. It opens with a
 * full-bleed cinematic hero (background facade photo with a left-to-dark
 * gradient, eyebrow + huge bold headline with an accent word + dual CTAs + a
 * three-up inline stat row), then a "featured in & collaborated with"
 * publication wordmark strip, a split philosophy section (model photo with an
 * offset accent block + three context/material/experience pillars), a 6-up
 * project gallery with image-zoom hover and typology/year captions, an
 * eye-catching SOLID-AMBER stats band with dark numerals, a 6-up services grid
 * with tinted icon tiles, a 4-step big-numeral process, a 3-up testimonials
 * grid with five-star ratings and client portraits, a leadership/partners grid
 * with portrait photos, an accordion FAQ, a full-bleed photo contact CTA, and a
 * rich four-column footer with newsletter form, address and social icons.
 *
 * The block owns ALL layout, spacing, type hierarchy and the dark/amber surface
 * contrast. Every nav item / CTA / footer link / social / form submit routes
 * through `useNavigate` (never a dead "#"), and navbar labels match the `nav`
 * array so PageSwitch can swap pages. All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all. Use as the ROOT/home page
 * for architecture firms, architecture studios, design/build practices,
 * structural or interior-design studios, urban planners, landscape architects
 * or built-environment portfolio sites that want a premium, dramatic,
 * project-forward dark page with strong work showcase and social proof.
 */
export const ArchitectureFirmKimiPage2 = defineComponent({
  name: "ArchitectureFirmKimiPage2",
  description:
    "Complete architecture-firm / design-studio LANDING page — the SECOND, visually DISTINCT alternative style to ArchitectureFirmKimiPage (a sibling variant). Where the other is a calm light Scandinavian look, THIS one is a bold, dramatic, high-contrast DARK editorial aesthetic on a near-black canvas with a warm amber/gold brand accent and heavy bold display typography. Includes a full-bleed cinematic hero (background facade photo with gradient overlay, uppercase eyebrow, huge bold headline with an accent word, dual CTAs, and an inline three-up stat row), a 'featured in & collaborated with' publication wordmark strip, a split philosophy/approach section (model photo with offset accent block plus context/material/experience pillars), a 6-up project/portfolio gallery with image-zoom hover and typology/year captions, a striking solid-amber statistics band with dark numerals, a 6-up services/expertise grid with tinted icon tiles, a 4-step big-numeral process timeline, a 3-up client testimonials grid with five-star ratings and portraits, a leadership/partners grid with portrait photos, an accordion FAQ, a full-bleed photo contact CTA with email and phone, and a four-column footer with newsletter signup, address and social links. Use as the ROOT/home page for architecture firms, architecture studios, design-build practices, structural design, interior-design studios, urban planners, landscape architects, construction or built-environment portfolio sites when a premium, dramatic, dark, project-forward page with strong work showcase and social proof is wanted. Supply content only — brand, nav, hero, logos, philosophy, gallery, stats, services, process, testimonials, team, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Studio / firm name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingLine1: z.string().optional(),
        headingLine2: z.string().optional(),
        /** Accent-colored word rendered inside line 2. */
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Featured in & collaborated with" publication strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Philosophy / approach section. */
    philosophy: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        body1: z.string().optional(),
        body2: z.string().optional(),
        imageAlt: z.string().optional(),
        points: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Selected-work / project gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Solid-accent statistics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Services / expertise grid. */
    services: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered process steps. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              duration: z.string(),
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
    /** Leadership / partners grid. */
    team: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ list. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Centered contact CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        phone: z.string().optional(),
        note: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        studioLabel: z.string().optional(),
        studioLinks: z.array(z.string()).optional(),
        connectLabel: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.array(z.string()).optional(),
        newsletterLabel: z.string().optional(),
        newsletterCopy: z.string().optional(),
        newsletterCta: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "FORMA"
    const nav = props.nav?.length
      ? props.nav
      : ["Philosophy", "Projects", "Process", "Studio", "Start a Project"]

    const heroEyebrow =
      props.hero?.eyebrow ?? "Architecture Studio — Est. 2008"
    const heroLine1 = props.hero?.headingLine1 ?? "Spatial Poetry"
    const heroLine2 = props.hero?.headingLine2 ?? "Meets"
    const heroAccent = props.hero?.headingAccent ?? "Structure"
    const heroSub =
      props.hero?.subheading ??
      "We design buildings and spaces that honor context, embrace material honesty, and elevate the human experience. From intimate residences to cultural landmarks."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Our Work"
    const heroSecondary = props.hero?.secondaryCta ?? "Our Philosophy"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern concrete architecture with dramatic angular forms and warm sunset lighting"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "127", label: "Projects Completed" },
          { value: "17", label: "Years Practicing" },
          { value: "24", label: "Design Awards" },
        ]

    const logosLabel =
      props.logos?.label ?? "Featured In & Collaborated With"
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "ARCHITECTURAL DIGEST",
          "DEZEEN",
          "WALLPAPER*",
          "MONOCLE",
          "DWELL",
          "ARCHDAILY",
        ]

    const philEyebrow = props.philosophy?.eyebrow ?? "Our Philosophy"
    const philHeading =
      props.philosophy?.heading ??
      "Architecture as a Conversation Between Place and People"
    const philBody1 =
      props.philosophy?.body1 ??
      "Every site has a story. Our role is to listen—to the topography, the climate, the cultural memory embedded in a location—and translate that narrative into built form that serves the people who will inhabit it."
    const philBody2 =
      props.philosophy?.body2 ??
      "We reject the notion of signature style. Instead, we pursue material honesty, spatial clarity, and environmental responsibility. Each project emerges from rigorous inquiry rather than preconceived aesthetic."
    const philImageAlt =
      props.philosophy?.imageAlt ??
      "Architectural model of modern building with natural light streaming through studio windows"
    const philPoints = props.philosophy?.points?.length
      ? props.philosophy.points
      : [
          {
            title: "Context",
            description:
              "Every design responds to its unique site and cultural setting",
          },
          {
            title: "Material",
            description:
              "Honest expression of structure and authentic materiality",
          },
          {
            title: "Experience",
            description:
              "Spaces that elevate daily life and foster connection",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Selected Projects"
    const galleryHeading =
      props.gallery?.heading ?? "Work That Defines Places"
    const galleryCta = props.gallery?.cta ?? "View All 127 Projects"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Malibu Ridge Residence",
            meta: "Residential — 2024",
            description:
              "Cliffside home with cantilevered terraces framing Pacific Ocean views. 4,200 sq ft.",
            imageAlt:
              "Modern hillside residence with floor-to-ceiling glass walls overlooking ocean at golden hour",
          },
          {
            title: "Marin Contemporary Art Museum",
            meta: "Cultural — 2023",
            description:
              "Daylight-driven gallery spaces in a converted industrial warehouse. 28,000 sq ft.",
            imageAlt:
              "Minimalist art museum interior with soaring white walls and dramatic skylight illumination",
          },
          {
            title: "Apex Tower Renovation",
            meta: "Commercial — 2023",
            description:
              "Adaptive reuse of 1970s office building into mixed-use creative hub. 180,000 sq ft.",
            imageAlt:
              "Sleek modern office tower with glass curtain wall reflecting city skyline at dusk",
          },
          {
            title: "Sedona Wellness Resort",
            meta: "Hospitality — 2022",
            description:
              "Desert retreat integrating rammed earth construction with luxury amenities. 52 rooms.",
            imageAlt:
              "Luxury boutique hotel courtyard with sculptural water feature and native desert landscaping",
          },
          {
            title: "Berkeley Hills House",
            meta: "Residential — 2022",
            description:
              "Family home cascading down a steep slope with indoor-outdoor living spaces. 3,800 sq ft.",
            imageAlt:
              "Modern residential interior with double-height living space and sculptural concrete staircase",
          },
          {
            title: "Studio Collective HQ",
            meta: "Workplace — 2021",
            description:
              "Biophilic office design for creative agency with living walls and flexible studios. 15,000 sq ft.",
            imageAlt:
              "Open-plan creative workspace with exposed timber beams and abundant natural lighting",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "127", label: "Projects Delivered" },
          { value: "24", label: "Design Awards" },
          { value: "12", label: "Countries" },
          { value: "94%", label: "Client Return Rate" },
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Expertise"
    const servicesHeading =
      props.services?.heading ?? "Comprehensive Design Services"
    const servicesDesc =
      props.services?.description ??
      "From initial concept through construction administration, we guide projects with precision and care."
    const servicesItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Master Planning",
            description:
              "Strategic site analysis and comprehensive planning for mixed-use developments, campuses, and urban districts.",
          },
          {
            title: "Residential Design",
            description:
              "Custom homes, multi-family housing, and residential communities that prioritize livability and connection to place.",
          },
          {
            title: "Commercial & Workplace",
            description:
              "Office buildings, retail environments, and hospitality spaces designed for human-centered productivity.",
          },
          {
            title: "Cultural & Institutional",
            description:
              "Museums, libraries, schools, and community centers that inspire learning and civic engagement.",
          },
          {
            title: "Adaptive Reuse",
            description:
              "Transforming existing structures for new purposes—honoring history while meeting contemporary needs.",
          },
          {
            title: "Sustainable Design",
            description:
              "Net-zero strategies, passive house standards, and regenerative design integrated from project inception.",
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading = props.process?.heading ?? "How We Work"
    const processDesc =
      props.process?.description ??
      "A collaborative, iterative approach that ensures every project reflects client vision and site potential."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discovery",
            description:
              "Deep site analysis, client interviews, and precedent research to establish project foundations.",
            duration: "2–4 weeks",
          },
          {
            title: "Concept",
            description:
              "Schematic design exploring spatial organization, massing, and material palettes through iterative exploration.",
            duration: "4–8 weeks",
          },
          {
            title: "Development",
            description:
              "Design development and construction documents with engineering coordination and detail refinement.",
            duration: "8–16 weeks",
          },
          {
            title: "Realization",
            description:
              "Construction administration, site visits, and quality oversight until successful project completion.",
            duration: "Project duration",
          },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Client Perspectives"
    const testHeading =
      props.testimonials?.heading ?? "Words From Those We've Built For"
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Forma transformed our vision into a home that exceeds every expectation. They listened deeply and delivered a space that feels both dramatic and intimately livable.",
            name: "Elena Vasquez",
            role: "Homeowner, Malibu Ridge Residence",
            avatarAlt:
              "Professional headshot of a smiling woman with dark hair wearing a navy blazer",
          },
          {
            quote:
              "The museum they designed for us honors the industrial heritage of our building while creating perfect conditions for contemporary art. Visitors constantly remark on the quality of light.",
            name: "James Whitmore",
            role: "Director, Marin Contemporary Art Museum",
            avatarAlt:
              "Professional headshot of a middle-aged man with glasses and gray hair in a dark sweater",
          },
          {
            quote:
              "Their adaptive reuse of our 1970s office tower exceeded every sustainability goal. We achieved LEED Platinum and created the most desirable creative workspace in the city.",
            name: "David Chen",
            role: "CEO, Apex Development Group",
            avatarAlt:
              "Professional headshot of a man in his 30s with short brown hair and a light beard wearing a white collared shirt",
          },
        ]

    const teamEyebrow = props.team?.eyebrow ?? "Leadership"
    const teamHeading = props.team?.heading ?? "The Partners"
    const teamItems = props.team?.items?.length
      ? props.team.items
      : [
          {
            name: "Marcus Williams",
            role: "Founding Principal",
            bio: "Harvard GSD '99. Former SOM. 25+ years designing cultural and educational institutions.",
            imageAlt:
              "Professional portrait of a man in his 40s with salt-and-pepper hair wearing a charcoal suit jacket over a black turtleneck",
          },
          {
            name: "Sarah Okonkwo",
            role: "Design Principal",
            bio: "Columbia GSAPP '03. Expert in sustainable systems and net-zero building strategies.",
            imageAlt:
              "Professional portrait of a woman in her 40s with shoulder-length dark hair wearing a cream blazer",
          },
          {
            name: "Kenji Tanaka",
            role: "Technical Principal",
            bio: "UC Berkeley '06. Master of complex geometries and digital fabrication workflows.",
            imageAlt:
              "Professional portrait of a man in his 30s with dark hair and glasses wearing a dark gray blazer over a white shirt",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "What Clients Ask"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What types of projects do you take on?",
            answer:
              "We work across project types and scales—from single-family residences to master plans for mixed-use districts. Our portfolio includes custom homes, multi-family housing, workplace design, cultural institutions, hospitality projects, and adaptive reuse. We select projects based on design potential and client alignment rather than scale or budget.",
          },
          {
            question: "What is your typical project timeline?",
            answer:
              "Timelines vary by project scope. A custom home typically takes 18–24 months from initial engagement to move-in. Larger commercial or institutional projects may span 2–4 years. Our design phases generally require 4–6 months, with construction duration depending on complexity. We provide detailed schedules during our proposal phase.",
          },
          {
            question: "How do you approach sustainability?",
            answer:
              "Sustainability is integral to our design philosophy, not an add-on. We pursue passive strategies first—orientation, massing, natural ventilation, daylighting—before adding systems. Many of our projects target Passive House, LEED Platinum, or net-zero standards. We conduct life-cycle assessments and prioritize low-carbon, non-toxic materials.",
          },
          {
            question: "What are your fee structures?",
            answer:
              "We typically work on a percentage-of-construction basis for full architectural services (10–15% depending on complexity) or hourly rates for consulting engagements. For select projects, we offer fixed fees with clearly defined scopes. We provide detailed proposals after initial consultations when we understand project scope.",
          },
          {
            question: "Do you work outside California?",
            answer:
              "Absolutely. While our studio is based in San Francisco, we maintain active projects across 12 countries. We collaborate with local architects of record when required by jurisdiction and have established relationships with consultants worldwide. Video conferencing and collaborative software make remote work seamless.",
          },
          {
            question: "How do I start a conversation about my project?",
            answer:
              "Reach out via our contact form or email us directly at hello@forma-studio.com. Share a brief description of your project, location, timeline, and any inspiration you've gathered. We respond to all inquiries within 48 hours and schedule introductory calls to explore fit and next steps.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to Build Something Meaningful?"
    const ctaDesc =
      props.cta?.description ??
      "Let's explore how your vision, our expertise, and the unique potential of your site can converge into architecture that endures."
    const ctaPrimary = props.cta?.primaryCta ?? "Start a Conversation"
    const ctaPhone = props.cta?.phone ?? "+1 (415) 555-1234"
    const ctaNote =
      props.cta?.note ??
      "Studio visits by appointment. 456 Montgomery Street, Suite 1200, San Francisco, CA 94104"
    const ctaImageAlt =
      props.cta?.imageAlt ??
      "Architectural detail of modern building facade with geometric concrete forms"

    const footerAbout =
      props.footer?.about ??
      "Architecture studio creating spaces that honor context, embrace material honesty, and elevate the human experience since 2008."
    const footerStudioLabel = props.footer?.studioLabel ?? "Studio"
    const footerStudioLinks = props.footer?.studioLinks?.length
      ? props.footer.studioLinks
      : ["Philosophy", "Projects", "Process", "Services", "Careers"]
    const footerConnectLabel = props.footer?.connectLabel ?? "Connect"
    const footerEmail = props.footer?.email ?? "hello@forma-studio.com"
    const footerPhone = props.footer?.phone ?? "+1 (415) 555-1234"
    const footerAddress = props.footer?.address?.length
      ? props.footer.address
      : ["456 Montgomery Street", "Suite 1200", "San Francisco, CA 94104"]
    const footerNewsletterLabel =
      props.footer?.newsletterLabel ?? "Newsletter"
    const footerNewsletterCopy =
      props.footer?.newsletterCopy ??
      "Quarterly studio updates, project reveals, and architectural reflections."
    const footerNewsletterCta = props.footer?.newsletterCta ?? "Join"
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Sitemap"]

    // Star rating used in testimonials.
    const Star = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Service-tile icons (decorative; tint via currentColor token).
    const serviceIcons: ReactNode[] = [
      <svg
        key="planning"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>,
      <svg
        key="residential"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>,
      <svg
        key="commercial"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>,
      <svg
        key="cultural"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>,
      <svg
        key="reuse"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>,
      <svg
        key="sustainable"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
    ]

    // Footer social icons.
    const socials: { label: string; path: string }[] = [
      {
        label: "Instagram",
        path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      },
      {
        label: "LinkedIn",
        path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
      },
      {
        label: "Pinterest",
        path: "M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z",
      },
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
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
                <span className="size-8 rounded-sm bg-primary" aria-hidden="true" />
                <span className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label, i) =>
                  i === nav.length - 1 ? (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {label}
                    </button>
                  ) : (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground md:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
          <section
            aria-labelledby="hero-heading"
            className="relative flex min-h-screen items-center overflow-hidden pt-20"
          >
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1280}
                loading="eager"
                className="size-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            </div>
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {heroEyebrow}
                </p>
                <h1
                  id="hero-heading"
                  className="mb-8 text-5xl font-bold leading-none tracking-tight text-foreground sm:text-6xl lg:text-8xl"
                >
                  {heroLine1}
                  <br />
                  {heroLine2} <span className="text-primary">{heroAccent}</span>
                </h1>
                <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="bg-primary px-8 py-4 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="border border-border px-8 py-4 text-center font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-16 flex gap-12 border-t border-border pt-8">
                  {heroStats.map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl font-bold text-foreground">
                        {s.value}
                      </p>
                      <p className="text-sm uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Featured in */}
          <section
            aria-label="Featured publications"
            className="border-y border-border bg-card py-16"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logosItems.map((item) => (
                  <div
                    key={item}
                    className="text-center text-lg font-bold tracking-wider text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Philosophy */}
          <section
            id="philosophy"
            aria-labelledby="philosophy-heading"
            className="py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div className="relative">
                  <Image
                    alt={philImageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="aspect-[4/5] w-full rounded-sm object-cover"
                  />
                  <div className="absolute -bottom-6 -right-6 -z-10 size-48 rounded-sm bg-primary/20" />
                </div>
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                    {philEyebrow}
                  </p>
                  <h2
                    id="philosophy-heading"
                    className="mb-6 text-4xl font-bold leading-tight text-foreground lg:text-5xl"
                  >
                    {philHeading}
                  </h2>
                  <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                    {philBody1}
                  </p>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {philBody2}
                  </p>
                  <div className="grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
                    {philPoints.map((point) => (
                      <div key={point.title}>
                        <h3 className="mb-2 font-semibold text-primary">
                          {point.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery / Projects */}
          <section
            id="projects"
            aria-labelledby="projects-heading"
            className="bg-card py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {galleryEyebrow}
                </p>
                <h2
                  id="projects-heading"
                  className="text-4xl font-bold leading-tight text-foreground lg:text-6xl"
                >
                  {galleryHeading}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group block w-full text-left"
                  >
                    <div className="relative mb-4 overflow-hidden rounded-sm">
                      <Image
                        alt={proj.imageAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                      {proj.meta}
                    </p>
                    <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                      {proj.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {proj.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(galleryCta)}
                  className="border border-border px-8 py-4 font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {galleryCta}
                </button>
              </div>
            </div>
          </section>

          {/* Stats band (solid accent) */}
          <section
            aria-label="Studio statistics"
            className="bg-primary py-20 text-primary-foreground"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-5xl font-bold text-primary-foreground lg:text-6xl">
                      {s.value}
                    </p>
                    <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services / Expertise */}
          <section
            id="studio"
            aria-labelledby="services-heading"
            className="py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {servicesEyebrow}
                </p>
                <h2
                  id="services-heading"
                  className="text-4xl font-bold leading-tight text-foreground lg:text-5xl"
                >
                  {servicesHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {servicesDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {servicesItems.map((service, i) => (
                  <div
                    key={service.title}
                    className="group rounded-sm border border-border p-8 transition-colors hover:border-primary/50"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-sm bg-primary/10 transition-colors group-hover:bg-primary/20">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process steps */}
          <section
            id="process"
            aria-labelledby="process-heading"
            className="bg-card py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {processEyebrow}
                </p>
                <h2
                  id="process-heading"
                  className="text-4xl font-bold leading-tight text-foreground lg:text-5xl"
                >
                  {processHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {processDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-4 text-6xl font-bold text-primary/20">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {step.description}
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      {step.duration}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            aria-labelledby="testimonials-heading"
            className="py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {testEyebrow}
                </p>
                <h2
                  id="testimonials-heading"
                  className="text-4xl font-bold leading-tight text-foreground lg:text-5xl"
                >
                  {testHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-sm border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
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
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Team / Leadership */}
          <section
            aria-labelledby="team-heading"
            className="bg-card py-24 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {teamEyebrow}
                </p>
                <h2
                  id="team-heading"
                  className="text-4xl font-bold leading-tight text-foreground lg:text-5xl"
                >
                  {teamHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {teamItems.map((person) => (
                  <div key={person.name}>
                    <Image
                      alt={person.imageAlt}
                      w={400}
                      h={533}
                      loading="lazy"
                      className="mb-6 aspect-[3/4] w-full rounded-sm object-cover"
                    />
                    <h3 className="text-xl font-bold text-foreground">
                      {person.name}
                    </h3>
                    <p className="mb-2 text-sm font-medium text-primary">
                      {person.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {person.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-heading" className="py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {faqEyebrow}
                </p>
                <h2
                  id="faq-heading"
                  className="text-4xl font-bold leading-tight text-foreground lg:text-5xl"
                >
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-sm border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.question}
                      </h3>
                      <span className="text-2xl text-primary transition-transform group-open:rotate-45">
                        +
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

          {/* CTA */}
          <section
            id="contact"
            aria-labelledby="cta-heading"
            className="relative overflow-hidden py-24 lg:py-32"
          >
            <div className="absolute inset-0 z-0">
              <Image
                alt={ctaImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-4xl font-bold leading-tight text-foreground lg:text-6xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="border border-border px-10 py-4 text-lg font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {ctaPhone}
                </button>
              </div>
              <p className="mt-8 text-sm text-muted-foreground/70">
                {ctaNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          aria-label="Footer"
          className="border-t border-border bg-background py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <span className="size-8 rounded-sm bg-primary" aria-hidden="true" />
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {brand}
                  </span>
                </div>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {socials.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      aria-label={s.label}
                      onClick={() => go(s.label)}
                      className="flex size-10 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={s.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerStudioLabel}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerStudioLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerConnectLabel}
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li>
                    <address className="not-italic text-muted-foreground">
                      {footerAddress.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </address>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerNewsletterLabel}
                </h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerNewsletterCopy}
                </p>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(footerNewsletterCta)
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email"
                    aria-label="Your email"
                    className="flex-1 border border-input bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {footerNewsletterCta}
                  </button>
                </form>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground/70">
                © {new Date().getFullYear()} {brand} Architecture Studio.{" "}
                {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground/70 transition-colors hover:text-muted-foreground"
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
