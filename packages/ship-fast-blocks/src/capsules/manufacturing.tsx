import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ManufacturingKimiPage — a complete, self-contained precision-manufacturing /
 * industrial-fabrication LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Vertex Manufacturing
 * Solutions" design: a clean, neutral, industrial B2B aesthetic on a light
 * surface with a dark charcoal brand accent. It pairs a split hero (ISO-9001
 * certification pill + headline + KPI stats + a CNC machining photo with a
 * floating AS9100D badge) with a trusted-by logo strip, a 6-up capabilities
 * grid (5-axis CNC, sheet metal, grinding, wire EDM, finishing, inspection),
 * an 8-up industries-served grid with certification tags, a 5-step quote→
 * delivery process with lead-time stats, a dark portfolio gallery of recent
 * machined parts, a 3-tier pricing block (Prototypes / Low-Volume / Production),
 * a company stats band, a testimonials grid (featured + compact quotes), an
 * 8-question FAQ, a dark CTA band, and a 4-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself entirely with semantic theme tokens. Every nav item / CTA / link /
 * form submit routes through `useNavigate` (never a dead "#"), and the navbar
 * labels match the `nav` array so PageSwitch can swap pages. All content
 * imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const ManufacturingKimiPage = defineCapsule({
  name: "ManufacturingKimiPage",
  description:
    "Complete precision-manufacturing / industrial-fabrication LANDING page with a clean, neutral, industrial B2B aesthetic: light surface, dark charcoal brand accent, ISO/AS9100 certification badges. Includes a split hero (certification pill, headline, KPI stat strip, CNC machining photo with a floating quality badge, dual CTAs), a 'trusted by industry leaders' logo strip, a 6-up capabilities grid (5-axis CNC machining, sheet metal fabrication, precision grinding, wire EDM, finishing & coating, quality inspection) with icons, an 8-up industries-served grid (aerospace, automotive, energy & oil, medical, defense, robotics, semiconductor, industrial) with certification tags, a 5-step quote-to-delivery process with lead-time stats, a dark portfolio gallery of recent machined parts with material specs, a 3-tier pricing block (Prototypes / Low-Volume / Production), a company stats band, a testimonials grid, an FAQ accordion-style list, a dark CTA band, and a 4-column footer. Use as the ROOT/home page for CNC machine shops, metal fabricators, contract manufacturers, industrial engineering firms, machining job shops, or any precision-parts supplier serving aerospace, automotive, medical, defense, energy or robotics sectors when a trustworthy, spec-heavy, conversion-focused page with capabilities, certifications and social proof is wanted. Supply content only — brand, nav, hero, capabilities, industries, process, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        floatingTitle: z.string().optional(),
        floatingSubtitle: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Capabilities / services grid. */
    capabilities: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Industries-served grid. */
    industries: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
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
    /** Quote-to-delivery process steps. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Portfolio / recent-projects gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), spec: z.string() }))
          .optional(),
      })
      .optional(),
    /** Pricing tiers. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              unit: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Company stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonials. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        featured: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
        compact: z
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
    /** Closing CTA band. */
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
        about: z.string().optional(),
        servicesTitle: z.string().optional(),
        services: z.array(z.string()).optional(),
        industriesTitle: z.string().optional(),
        industries: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Vertex Manufacturing"
    const nav = props.nav?.length
      ? props.nav
      : ["Capabilities", "Industries", "Process", "Work", "Clients", "Get a Quote"]

    const heroBadge = props.hero?.badge ?? "ISO 9001:2015 Certified"
    const heroHeading =
      props.hero?.heading ?? "Precision Manufacturing for Complex Industries"
    const heroSub =
      props.hero?.subheading ??
      'Vertex Manufacturing Solutions delivers aerospace-grade CNC machining, metal fabrication, and industrial engineering. From prototype to production, we transform raw materials into mission-critical components with tolerances as tight as ±0.0005".'
    const heroPrimary = props.hero?.primaryCta ?? "Request a Quote"
    const heroSecondary = props.hero?.secondaryCta ?? "View Our Work"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "CNC machining center cutting precision metal parts with coolant spray in industrial manufacturing facility"
    const heroFloatingTitle = props.hero?.floatingTitle ?? "AS9100D Certified"
    const heroFloatingSub =
      props.hero?.floatingSubtitle ?? "Aerospace Quality Standard"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "50+", label: "CNC Machines" },
          { value: "35", label: "Years Experience" },
          { value: "99.7%", label: "Quality Rate" },
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by Industry Leaders"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Boeing",
          "Siemens",
          "General Electric",
          "Caterpillar",
          "Lockheed Martin",
          "Tesla",
        ]

    const capEyebrow = props.capabilities?.eyebrow ?? "Capabilities"
    const capHeading =
      props.capabilities?.heading ?? "Full-Service Manufacturing Under One Roof"
    const capDesc =
      props.capabilities?.description ??
      "From 5-axis CNC machining to precision sheet metal fabrication, our 180,000 sq ft facility houses the latest manufacturing technology and skilled craftsmen."
    const capItems = props.capabilities?.items?.length
      ? props.capabilities.items
      : [
          {
            title: "5-Axis CNC Machining",
            description:
              'Simultaneous 5-axis machining centers with pallet changers for complex geometries. Work envelope up to 60" x 30" x 24". Tolerances to ±0.0005" on aluminum, titanium, and Inconel.',
          },
          {
            title: "Sheet Metal Fabrication",
            description:
              'Laser cutting (up to 1" steel), CNC press brakes (220-ton capacity), and robotic welding cells. Materials: steel, stainless, aluminum, copper, brass from 24 ga to 1" plate.',
          },
          {
            title: "Precision Grinding",
            description:
              'Surface, cylindrical, and centerless grinding services. Mirror finishes to 4 Ra. Dimensional tolerances within ±0.0001". Ideal for aerospace shafts, medical instruments, and precision tooling.',
          },
          {
            title: "Wire EDM",
            description:
              'High-precision wire EDM for complex profiles and tight internal radii. 0.004" wire diameter capability. Positioning accuracy ±0.0001". Perfect for hardened materials and intricate cuts.',
          },
          {
            title: "Finishing & Coating",
            description:
              "Anodizing (Type II & III), powder coating, passivation, chem film (Alodine), and custom painting. NADCAP-certified processes for aerospace applications. Full traceability on all finishes.",
          },
          {
            title: "Quality Inspection",
            description:
              "CMM inspection (Bridge and Arm), optical comparators, surface roughness testers, and certified calibration lab. FAIR, PPAP, and full material certifications provided with every order.",
          },
        ]

    const indEyebrow = props.industries?.eyebrow ?? "Industries Served"
    const indHeading =
      props.industries?.heading ??
      "Specialized Expertise Across Critical Sectors"
    const indDesc =
      props.industries?.description ??
      "We understand the unique requirements, certifications, and quality standards that each industry demands."
    const indItems = props.industries?.items?.length
      ? props.industries.items
      : [
          {
            title: "Aerospace",
            description:
              "AS9100D & NADCAP certified. Structural components, engine parts, and avionics housings for Boeing, Airbus, and defense contractors.",
            tag: "AS9100D • ITAR Registered",
          },
          {
            title: "Automotive",
            description:
              "EV drivetrain components, suspension parts, and prototype builds for Tesla, Ford, and tier-1 suppliers. IATF 16949 compliant.",
            tag: "IATF 16949 • PPAP Capable",
          },
          {
            title: "Energy & Oil",
            description:
              "Valve components, drilling equipment, and turbine parts. Corrosion-resistant alloys for harsh offshore and downhole environments.",
            tag: "API Compliant • ISO 14001",
          },
          {
            title: "Medical Devices",
            description:
              "Surgical instruments, implant components, and diagnostic equipment. ISO 13485 certified with full cleanroom assembly available.",
            tag: "ISO 13485 • FDA Registered",
          },
          {
            title: "Defense",
            description:
              "Armor systems, weapon components, and tactical equipment. ITAR registered with secure facilities and cleared personnel.",
            tag: "ITAR • DFARS Compliant",
          },
          {
            title: "Robotics",
            description:
              "Precision gears, actuator housings, and frame components. Tight tolerances for smooth motion control and repeatability.",
            tag: '±0.0005" Tolerance',
          },
          {
            title: "Semiconductor",
            description:
              "Chamber components, wafer handling tools, and vacuum systems. UHV-compatible materials with ultra-clean surface finishes.",
            tag: "UHV Compatible • Class 1000",
          },
          {
            title: "Industrial",
            description:
              "Heavy machinery components, conveyor systems, and custom automation equipment. Large format machining and welding services.",
            tag: "24/7 Production",
          },
        ]

    const procEyebrow = props.process?.eyebrow ?? "Our Process"
    const procHeading =
      props.process?.heading ?? "From Quote to Delivery in Five Steps"
    const procDesc =
      props.process?.description ??
      "Our streamlined workflow ensures clear communication, on-time delivery, and parts that meet your exact specifications."
    const procSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Upload & Quote",
            description:
              "Submit CAD files (STEP, IGES, SolidWorks) through our secure portal. Receive detailed quote within 24 hours.",
          },
          {
            title: "DFM Review",
            description:
              "Our engineers review for manufacturability, suggest cost optimizations, and confirm materials and finishes.",
          },
          {
            title: "Production",
            description:
              "Parts enter our production queue. Real-time status updates via customer portal with photos at key stages.",
          },
          {
            title: "Inspection",
            description:
              "100% dimensional inspection with CMM. FAIR documentation, material certs, and test reports included.",
          },
          {
            title: "Ship & Support",
            description:
              "Carefully packaged and shipped worldwide. Engineering support for assembly questions or design revisions.",
          },
        ]
    const procStats = props.process?.stats?.length
      ? props.process.stats
      : [
          { value: "24hr", label: "Standard Quote Turnaround" },
          { value: "2-3 Days", label: "Prototype Lead Time" },
          { value: "2-4 Weeks", label: "Production Lead Time" },
        ]

    const galEyebrow = props.gallery?.eyebrow ?? "Portfolio"
    const galHeading = props.gallery?.heading ?? "Recent Projects"
    const galDesc =
      props.gallery?.description ??
      "A selection of components we've manufactured for aerospace, automotive, and industrial clients in 2024-2025."
    const galItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Titanium Aerospace Brackets",
            spec: '5-axis CNC • Ti-6Al-4V • ±0.001"',
          },
          {
            title: "EV Motor Controller Heat Sinks",
            spec: "Aluminum 6061 • Anodized • High-volume",
          },
          {
            title: "Oil & Gas Valve Manifolds",
            spec: "316 Stainless • NACE MR0175 • Welded",
          },
          {
            title: "Orthopedic Surgical Instruments",
            spec: "17-4 PH Stainless • Passivated • FDA",
          },
          {
            title: "Robotic Arm Base Structures",
            spec: "Mild Steel • Robot Welded • Powder Coat",
          },
          {
            title: "Wire EDM Precision Gears",
            spec: "Hardened Steel • AGMA Class 10 • WEDM",
          },
        ]

    const priceEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const priceHeading =
      props.pricing?.heading ?? "Transparent Pricing for Every Stage"
    const priceDesc =
      props.pricing?.description ??
      "No hidden fees. Volume discounts apply. All quotes include material, machining, inspection, and standard packaging."
    const priceTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Prototypes",
            blurb: "1-10 parts for testing and validation",
            price: "$95",
            unit: "/hr",
            features: [
              "2-3 day turnaround",
              "Material certs included",
              "DFM feedback",
              "Photo documentation",
            ],
            cta: "Get Prototype Quote",
          },
          {
            name: "Low-Volume",
            blurb: "11-100 parts for pilot runs",
            price: "$75",
            unit: "/hr",
            features: [
              "1-2 week turnaround",
              "FAIR documentation",
              "PPAP Level 3 available",
              "CMM inspection reports",
              "Priority scheduling",
            ],
            cta: "Get Quote",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Production",
            blurb: "100+ parts with volume pricing",
            price: "Custom",
            features: [
              "Dedicated work cells",
              "Blanket orders accepted",
              "Kanban programs",
              "Annual pricing agreements",
            ],
            cta: "Contact Sales",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "180K", label: "Square Feet Facility" },
          { value: "50+", label: "CNC Machines" },
          { value: "350", label: "Skilled Employees" },
          { value: "1.2M+", label: "Parts Shipped (2024)" },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testHeading =
      props.testimonials?.heading ??
      "Trusted by Engineers and Procurement Teams"
    const testFeatured = props.testimonials?.featured?.length
      ? props.testimonials.featured
      : [
          {
            quote:
              "Vertex has been our go-to machine shop for aerospace brackets for 8 years. Their AS9100 certification and attention to detail gives us confidence every time. Zero defects on 15,000+ parts shipped.",
            name: "Michael Chen",
            role: "Senior Manufacturing Engineer, Boeing Defense",
            avatarAlt:
              "Professional headshot of Michael Chen, Senior Manufacturing Engineer",
          },
          {
            quote:
              "When we needed 500 EV heat sinks turned around in two weeks for a prototype build, Vertex delivered. Their online portal made tracking progress effortless. Highly recommend for automotive programs.",
            name: "Sarah Martinez",
            role: "Supply Chain Director, Rivian Automotive",
            avatarAlt:
              "Professional headshot of Sarah Martinez, Supply Chain Director",
          },
          {
            quote:
              "Vertex helped us redesign a critical surgical instrument for manufacturability, cutting our cost by 40% while improving the ergonomics. Their engineering team is world-class.",
            name: "Dr. James Wilson",
            role: "Chief of Orthopedic Surgery, Mayo Clinic",
            avatarAlt:
              "Professional headshot of Dr. James Wilson, Chief of Orthopedic Surgery",
          },
        ]
    const testCompact = props.testimonials?.compact?.length
      ? props.testimonials.compact
      : [
          {
            quote:
              "The ITAR compliance and secure facility made Vertex our preferred supplier for classified defense components. Documentation is always flawless.",
            name: "Robert Thompson",
            role: "Program Manager, Lockheed Martin",
            avatarAlt:
              "Professional headshot of Robert Thompson, Program Manager at Lockheed Martin",
          },
          {
            quote:
              "We've reduced lead times from 8 weeks to 3 weeks on our valve bodies since partnering with Vertex. Their capacity planning is exceptional.",
            name: "Jennifer Kim",
            role: "VP Operations, Halliburton",
            avatarAlt:
              "Professional headshot of Jennifer Kim, VP Operations at Halliburton",
          },
          {
            quote:
              "From small R&D batches to 10,000-unit production runs, Vertex scales with us. Consistent quality across every order size.",
            name: "David Patel",
            role: "CTO, Figure AI Robotics",
            avatarAlt:
              "Professional headshot of David Patel, CTO of robotics startup",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What file formats do you accept for quotes?",
            answer:
              "We accept STEP, IGES, SolidWorks (.sldprt/.sldasm), CATIA, Parasolid, and AutoCAD files. For 2D laser cutting and sheet metal, PDF drawings with bend notes are sufficient. All files are handled securely and covered under our NDA.",
          },
          {
            question: "What is your typical lead time for prototypes?",
            answer:
              "Standard prototype lead time is 2-3 business days for machined parts and 3-5 days for sheet metal. Expedited 24-hour service is available for urgent projects. Production volumes typically ship in 2-4 weeks depending on complexity.",
          },
          {
            question: "Do you provide material certifications?",
            answer:
              "Yes, we provide full material certifications (mill certs), test reports, and inspection documentation with every order. FAIR (First Article Inspection Report) and PPAP (Production Part Approval Process) documentation is available upon request at no additional charge.",
          },
          {
            question: "What tolerances can you hold?",
            answer:
              'Our standard machining tolerance is ±0.005". Precision tolerances of ±0.001" are routine. For critical aerospace and medical applications, we can achieve ±0.0005" on suitable geometries using our 5-axis mills and precision grinders.',
          },
          {
            question: "Do you work with ITAR-controlled projects?",
            answer:
              "Yes, Vertex is ITAR registered and maintains a secure facility for defense work. We have SCIF capabilities and cleared personnel for classified projects. All employees undergo background checks and regular compliance training.",
          },
          {
            question: "What surface finishes do you offer?",
            answer:
              "We offer bead blasting, anodizing (Type II and III hardcoat), chem film (Alodine), powder coating, passivation, electroless nickel, and custom painting. Specialty finishes like Titanium anodizing and Teflon coating are also available.",
          },
          {
            question: "Do you offer assembly services?",
            answer:
              "Yes, we provide light assembly, hardware installation, and kitting services. Our Class 1000 cleanroom is available for medical device and semiconductor component assembly. We can also manage subcontractor relationships for specialized processes.",
          },
          {
            question: "How do I track my order?",
            answer:
              "All customers receive access to our online portal where you can track job status, view production photos, download inspection reports, and communicate with our team. Email and phone support is also available during business hours (7 AM - 5 PM PST, Mon-Fri).",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Start Your Project?"
    const ctaDesc =
      props.cta?.description ??
      "Get a detailed quote within 24 hours. Our engineers review every submission for manufacturability and will suggest cost-saving alternatives when possible."
    const ctaPrimary = props.cta?.primaryCta ?? "Request a Quote"
    const ctaSecondary = props.cta?.secondaryCta ?? "Call (206) 555-1234"
    const ctaNote =
      props.cta?.note ??
      "Located in Kent, Washington • Serving customers nationwide since 1989"

    const footerAbout =
      props.footer?.about ??
      "Precision CNC machining, sheet metal fabrication, and industrial engineering services. ISO 9001:2015 and AS9100D certified."
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServices = props.footer?.services?.length
      ? props.footer.services
      : [
          "CNC Machining",
          "Sheet Metal",
          "Wire EDM",
          "Grinding & Finishing",
          "Quality Inspection",
        ]
    const footerIndustriesTitle = props.footer?.industriesTitle ?? "Industries"
    const footerIndustries = props.footer?.industries?.length
      ? props.footer.industries
      : ["Aerospace", "Automotive", "Medical Devices", "Oil & Gas", "Defense"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "2400 West Valley Highway N, Kent, WA 98032"
    const footerPhone = props.footer?.phone ?? "(206) 555-1234"
    const footerEmail = props.footer?.email ?? "quotes@vertexmfg.com"
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Supplier Portal"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Solutions. All rights reserved.`

    // Brand initials tile (decorative brand asset).
    const brandInitials = brand
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("")

    const Check = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="text-chart-4"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Capability icons (decorative, token-colored).
    const capIcons: ReactNode[] = [
      <svg key="i0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg key="i1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>,
      <svg key="i2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      <svg key="i3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="i4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
      <svg key="i5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>,
    ]

    // Industry icons rotate through chart tokens for a multi-color decorative set.
    const indIcons: ReactNode[] = [
      <svg key="n0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>,
      <svg key="n1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="n2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="n3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg key="n4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg key="n5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      <svg key="n6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      <svg key="n7" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
    ]
    const indTints = [
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
      "bg-destructive/10 text-destructive",
      "bg-chart-3/10 text-chart-3",
      "bg-primary/10 text-primary",
      "bg-chart-2/10 text-chart-2",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
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
                aria-label={`${brand} Home`}
              >
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-md bg-foreground text-sm font-bold text-background"
                >
                  {brandInitials}
                </span>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {brand}
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
                  className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
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
                className="p-2 text-muted-foreground md:hidden"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" />
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
          <section className="relative bg-background">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                    <span className="size-2 rounded-full bg-chart-2" />
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
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-md bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-md border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 border-t border-border pt-4">
                    {heroStats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-6">
                        {i > 0 && <span className="h-10 w-px bg-border" />}
                        <div>
                          <p className="text-2xl font-semibold text-foreground">
                            {s.value}
                          </p>
                          <p className="text-sm text-muted-foreground">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={500}
                    loading="eager"
                    className="h-[400px] w-full rounded-lg object-cover shadow-xl lg:h-[500px]"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-lg bg-card p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-muted text-foreground">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {heroFloatingTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroFloatingSub}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center gap-2 text-foreground opacity-60 transition-opacity hover:opacity-100"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span className="font-semibold">{logo}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Capabilities */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {capEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {capHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{capDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {capItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-lg bg-muted p-6 transition-colors hover:bg-accent"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-lg bg-secondary text-foreground">
                      {capIcons[i % capIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Industries */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 max-w-3xl">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {indEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {indHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{indDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {indItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-lg border border-border bg-card p-6 shadow-sm"
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-10 place-items-center rounded-lg",
                        indTints[i % indTints.length],
                      )}
                    >
                      {indIcons[i % indIcons.length]}
                    </div>
                    <h3 className="mb-2 font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <span className="text-xs font-medium text-primary">
                      {item.tag}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {procEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {procHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{procDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-5">
                {procSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 grid size-12 place-items-center rounded-full bg-foreground text-lg font-semibold text-background">
                        {i + 1}
                      </div>
                      <h3 className="mb-2 font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {i < procSteps.length - 1 && (
                      <div className="absolute left-full top-6 hidden h-px w-full -translate-x-1/2 bg-border md:block" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-16 rounded-lg border border-border bg-muted p-8">
                <div className="grid gap-8 text-center md:grid-cols-3">
                  {procStats.map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl font-semibold text-foreground">
                        {s.value}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="text-sm font-medium uppercase tracking-wider text-background/60">
                    {galEyebrow}
                  </span>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-background sm:text-4xl">
                    {galHeading}
                  </h2>
                </div>
                <p className="max-w-md text-background/70">{galDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group block text-left"
                  >
                    <div className="overflow-hidden rounded-lg">
                      <Image
                        alt={item.title}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="font-medium text-background">{item.title}</p>
                      <p className="text-sm text-background/60">{item.spec}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {priceEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {priceHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{priceDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {priceTiers.map((tier) => {
                  const featured = tier.featured ?? false
                  return (
                    <article
                      key={tier.name}
                      className={cn(
                        "relative rounded-lg border p-6",
                        featured
                          ? "border-border bg-foreground"
                          : "border-border bg-muted",
                      )}
                    >
                      {tier.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                          {tier.badge}
                        </div>
                      )}
                      <h3
                        className={cn(
                          "text-lg font-semibold",
                          featured ? "text-background" : "text-foreground",
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          "mt-2 text-sm",
                          featured
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.blurb}
                      </p>
                      <p
                        className={cn(
                          "mt-4 text-3xl font-semibold",
                          featured ? "text-background" : "text-foreground",
                        )}
                      >
                        {tier.price}
                        {tier.unit && (
                          <span
                            className={cn(
                              "text-base font-normal",
                              featured
                                ? "text-background/60"
                                : "text-muted-foreground",
                            )}
                          >
                            {tier.unit}
                          </span>
                        )}
                      </p>
                      <ul
                        className={cn(
                          "mt-6 space-y-3 text-sm",
                          featured
                            ? "text-background/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2">
                            <span
                              className={
                                featured ? "text-background" : "text-chart-2"
                              }
                            >
                              <Check />
                            </span>
                            {feat}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(tier.cta)}
                        className={cn(
                          "mt-6 w-full rounded-md py-2.5 font-medium transition-colors",
                          featured
                            ? "bg-background text-foreground hover:bg-background/90"
                            : "border border-border text-foreground hover:bg-accent",
                        )}
                      >
                        {tier.cta}
                      </button>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border bg-muted py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="sr-only">Company Statistics</h2>
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="text-4xl font-semibold text-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {testEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testFeatured.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-lg border border-border bg-muted p-6"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground">
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
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {testCompact.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-lg border border-border bg-muted p-6"
                  >
                    <p className="mb-4 text-sm leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {faqEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
              </div>
              <dl className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-lg border border-border bg-card p-6"
                  >
                    <dt className="mb-2 font-semibold text-card-foreground">
                      {item.question}
                    </dt>
                    <dd className="text-muted-foreground">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-3xl font-semibold tracking-tight text-background sm:text-4xl">
                {ctaHeading}
              </h2>
              <p className="mt-4 text-lg text-background/70">{ctaDesc}</p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-md bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-md border border-border px-8 py-4 font-medium text-background transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-background/60">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground py-16">
          <h2 className="sr-only">Footer</h2>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-md bg-background text-sm font-bold text-foreground"
                  >
                    {brandInitials}
                  </span>
                  <span className="font-semibold text-background">{brand}</span>
                </button>
                <p className="text-sm leading-relaxed text-background/60">
                  {footerAbout}
                </p>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-background">
                  {footerServicesTitle}
                </h3>
                <ul className="space-y-2 text-sm">
                  {footerServices.map((link) => (
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
              <div>
                <h3 className="mb-4 font-semibold text-background">
                  {footerIndustriesTitle}
                </h3>
                <ul className="space-y-2 text-sm">
                  {footerIndustries.map((link) => (
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
              <div>
                <h3 className="mb-4 font-semibold text-background">
                  {footerContactTitle}
                </h3>
                <address className="space-y-2 text-sm not-italic text-background/60">
                  <p>{footerAddress}</p>
                  <p>
                    <button
                      type="button"
                      onClick={() => go(footerContactTitle)}
                      className="transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => go(footerContactTitle)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </p>
                </address>
                <div className="mt-4 flex gap-4">
                  <button
                    type="button"
                    aria-label="LinkedIn"
                    onClick={() => go("LinkedIn")}
                    className="text-background/60 transition-colors hover:text-background"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Twitter"
                    onClick={() => go("Twitter")}
                    className="text-background/60 transition-colors hover:text-background"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
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
