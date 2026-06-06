import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * LogisticsKimiPage2 — TEMPLATE VARIANT 2 for logistics. A faithful Tailwind v4
 * port of a Kimi-generated "SwiftRoute Logistics" design. Distinct sibling to
 * LogisticsKimiPage: where that one is a light, airy corporate page, THIS variant
 * is bold and energetic — a dark on-dark hero band (deep primary surface) with a
 * dot-grid backdrop, a "Now in 180+ Countries" pulse pill, a big white floating
 * shipment-tracking card (tracking input + popular-search chips + 3 quick KPIs),
 * a grayscale client logo strip, a 6-up services grid with check-bullet feature
 * lists, a dark numbered "Ship in 4 Simple Steps" flow, a 6-image global-network
 * gallery with caption overlays, a full-bleed primary stat band (4 big KPIs + a
 * 6-up secondary stat row), a 3-tier "Most Popular" pricing table, three 5-star
 * testimonials with avatars, an accordion FAQ, a dark closing CTA, and a 5-column
 * dark footer with social icons.
 */
export const LogisticsKimiPage2 = defineComponent({
  name: "LogisticsKimiPage2",
  description:
    "Second, visually DISTINCT logistics/shipping/freight LANDING page variant (alternative to LogisticsKimiPage) with a bold, energetic, high-contrast aesthetic: dark on-dark hero band on a deep primary surface with a dot-grid backdrop, an orange-style accent primary, a 'Now in 180+ Countries' animated pulse pill, and a big floating white shipment-tracking card. Use as the ROOT/home page for global-logistics providers, freight forwarders, shipping carriers, courier and parcel companies, supply-chain, warehousing, customs-brokerage, fulfillment, cargo and transport businesses when a punchy, conversion-focused dark-hero alternative is wanted. Sections: sticky navbar with phone + Get Quote CTA; split hero (headline 'Global Logistics. Delivered Fast.', subtext, two CTAs, trust badges) beside a real-time shipment-tracking widget card (tracking-number input, Track Now button, popular-search chips, and shipments/on-time/support quick stats); grayscale 'trusted by' client logo strip; a 6-up services grid (Express Shipping, Freight Forwarding, Warehousing, Cargo Insurance, Supply Chain Analytics, Reverse Logistics — each with an icon, blurb and check-bullet feature list); a dark numbered four-step 'Ship in 4 Simple Steps' how-it-works flow; a 6-image global-infrastructure gallery with port/ocean/warehouse/fleet/air/command-center caption overlays; a full-bleed primary KPI stat band (180+ countries, 2.4M shipments/mo, 45 warehouses, 98.7% on-time) plus a secondary 6-up stat row; a 3-tier pricing table (Starter / Business 'Most Popular' / Enterprise with feature lists); three five-star customer testimonials with avatars; an accordion FAQ; a high-contrast dark closing CTA ('Ready to Ship Smarter?'); and a rich 5-column dark footer with services/company/support columns and social links. Supply content only — brand, nav, hero, logos, services, steps, gallery, stats, pricing, testimonials, faq, cta, footer; the block owns all layout and styling and uses semantic theme tokens only. Prefer this when a logistics page was already generated and a different second style is requested.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section + shipment-tracking widget. */
    hero: z
      .object({
        pill: z.string().optional(),
        headingTop: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
        phone: z.string().optional(),
        trackTitle: z.string().optional(),
        trackSubtitle: z.string().optional(),
        trackPlaceholder: z.string().optional(),
        trackButton: z.string().optional(),
        popularLabel: z.string().optional(),
        popular: z.array(z.string()).optional(),
        quickStats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Client logo trust strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
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
              features: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "How it works" numbered flow. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Global-network image gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              alt: z.string(),
              title: z.string(),
              caption: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Primary KPI stat band. */
    stats: z
      .object({
        primary: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        secondary: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Pricing / plan tiers. */
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
              unit: z.string().optional(),
              note: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              badge: z.string().optional(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Customer testimonials. */
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
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        secondary: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        blurb: z.string().optional(),
        servicesTitle: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        supportTitle: z.string().optional(),
        supportLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "SwiftRoute"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Track", "Solutions", "About", "Contact"]

    const heroPill = props.hero?.pill ?? "Now in 180+ Countries"
    const headingTop = props.hero?.headingTop ?? "Global Logistics."
    const heroHighlight = props.hero?.highlight ?? "Delivered Fast."
    const heroSub =
      props.hero?.subheading ??
      "Track shipments in real-time, manage freight across continents, and reduce logistics costs by up to 35%. Trusted by 12,000+ businesses worldwide since 2008."
    const heroPrimary = props.hero?.primaryCta ?? "Get Instant Quote"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Services"
    const heroBadges = props.hero?.badges?.length
      ? props.hero.badges
      : ["4.9/5 TrustScore", "ISO 9001 Certified", "AEO Certified"]
    const heroPhone = props.hero?.phone ?? "1-800-SWIFT-99"
    const trackTitle = props.hero?.trackTitle ?? "Track Your Shipment"
    const trackSubtitle =
      props.hero?.trackSubtitle ?? "Real-time updates on your delivery"
    const trackPlaceholder =
      props.hero?.trackPlaceholder ?? "Enter tracking number (e.g., SR-7843921)"
    const trackButton = props.hero?.trackButton ?? "Track Now"
    const popularLabel = props.hero?.popularLabel ?? "Popular Searches"
    const popular = props.hero?.popular?.length
      ? props.hero.popular
      : ["SR-7843921", "SR-9023847", "SR-5567283"]
    const quickStats = props.hero?.quickStats?.length
      ? props.hero.quickStats
      : [
          { value: "2.4M+", label: "Shipments/mo" },
          { value: "98.7%", label: "On-time" },
          { value: "24/7", label: "Support" },
        ]

    const logosHeading =
      props.logos?.heading ?? "Trusted by leading companies worldwide"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "TechCorp",
          "GlobalMart",
          "FastRetail",
          "PowerGrid",
          "ApexAuto",
          "SecureBank",
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Comprehensive Logistics Solutions"
    const servicesDesc =
      props.services?.description ??
      "From express delivery to complex supply chain management, we provide end-to-end logistics services tailored to your business needs."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Express Shipping",
            description:
              "Next-day and same-day delivery options for urgent shipments. Guaranteed delivery windows with full insurance coverage.",
            features: [
              "Delivery in 24-48 hours",
              "Real-time tracking",
              "From $12.99 domestic",
            ],
          },
          {
            title: "Freight Forwarding",
            description:
              "International freight solutions by air, ocean, and road. Customs clearance and documentation handled end-to-end.",
            features: [
              "Air, sea & land freight",
              "Customs brokerage included",
              "180+ country coverage",
            ],
          },
          {
            title: "Warehousing",
            description:
              "Strategic storage facilities across 45 global locations. Inventory management, pick-pack, and fulfillment services.",
            features: [
              "2.5M sq ft globally",
              "WMS integration",
              "Same-day fulfillment",
            ],
          },
          {
            title: "Cargo Insurance",
            description:
              "Comprehensive coverage for all shipment types. Claims processed within 48 hours with dedicated support.",
            features: [
              "All-risk coverage",
              "48hr claim processing",
              "Up to $5M coverage",
            ],
          },
          {
            title: "Supply Chain Analytics",
            description:
              "AI-powered insights to optimize your logistics. Predict demand, reduce costs, and improve delivery performance.",
            features: [
              "Real-time dashboards",
              "Predictive analytics",
              "API integration",
            ],
          },
          {
            title: "Reverse Logistics",
            description:
              "Streamlined returns management and product refurbishment. Reduce waste and recover value from returned goods.",
            features: [
              "Returns processing",
              "Product refurbishment",
              "Eco-friendly disposal",
            ],
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Ship in 4 Simple Steps"
    const stepsDesc =
      props.steps?.description ??
      "From quote to delivery, we've streamlined the entire shipping process for maximum efficiency."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Get Quote",
            description:
              "Enter shipment details and get instant pricing. Compare options across all transport modes.",
          },
          {
            title: "Book Shipment",
            description:
              "Confirm booking online or with your account manager. Schedule pickup at your convenience.",
          },
          {
            title: "We Handle It",
            description:
              "Pickup, transport, customs clearance, and delivery. Track your shipment in real-time 24/7.",
          },
          {
            title: "Delivered",
            description:
              "Receive delivery confirmation with POD signature. Rate your experience and book again.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Our Operations"
    const galleryHeading = props.gallery?.heading ?? "Global Infrastructure"
    const galleryDesc =
      props.gallery?.description ??
      "State-of-the-art facilities and fleet ensuring reliable delivery across continents."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            alt: "Aerial view of a modern shipping port with container ships and cargo cranes at sunset",
            title: "Port of Rotterdam Hub",
            caption: "Europe's largest logistics facility",
          },
          {
            alt: "Large cargo container ship sailing on the open ocean with blue sky",
            title: "Ocean Freight Fleet",
            caption: "45 vessels across major routes",
          },
          {
            alt: "Interior of a modern automated warehouse with tall shelving and conveyor systems",
            title: "Automated Warehouse",
            caption: "Dubai Smart Logistics Center",
          },
          {
            alt: "Fleet of modern delivery trucks parked at a logistics distribution center",
            title: "Ground Fleet",
            caption: "2,400+ vehicles worldwide",
          },
          {
            alt: "Commercial cargo airplane at an airport gate during loading operations",
            title: "Air Cargo Network",
            caption: "Daily flights to 180+ airports",
          },
          {
            alt: "Logistics control room with multiple screens showing shipment tracking maps and data dashboards",
            title: "Command Center",
            caption: "24/7 global monitoring",
          },
        ]

    const statsPrimary = props.stats?.primary?.length
      ? props.stats.primary
      : [
          { value: "180+", label: "Countries Served" },
          { value: "2.4M", label: "Shipments/Month" },
          { value: "45", label: "Global Warehouses" },
          { value: "98.7%", label: "On-Time Delivery" },
        ]
    const statsSecondary = props.stats?.secondary?.length
      ? props.stats.secondary
      : [
          { value: "12K+", label: "Business Clients" },
          { value: "2,400+", label: "Vehicles" },
          { value: "45", label: "Cargo Ships" },
          { value: "180", label: "Airports" },
          { value: "2.5M", label: "Sq Ft Storage" },
          { value: "18", label: "Years Experience" },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Simple, Transparent Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that fits your shipping volume. All plans include real-time tracking and insurance."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "For small businesses",
            price: "$0",
            unit: "/month",
            note: "Pay per shipment with competitive rates",
            features: [
              "Up to 50 shipments/month",
              "Real-time tracking",
              "$100K insurance coverage",
              "Email support",
            ],
            cta: "Get Started",
          },
          {
            name: "Business",
            tagline: "For growing companies",
            price: "$299",
            unit: "/month",
            note: "Volume discounts and priority handling",
            features: [
              "Up to 500 shipments/month",
              "15% volume discount",
              "$500K insurance coverage",
              "Priority customer support",
              "API access",
            ],
            cta: "Start Free Trial",
            badge: "Most Popular",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For large organizations",
            price: "Custom",
            note: "Tailored solutions for complex supply chains",
            features: [
              "Unlimited shipments",
              "Custom pricing tiers",
              "$5M+ insurance coverage",
              "Dedicated account manager",
              "Custom integrations",
            ],
            cta: "Contact Sales",
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Trusted by 12,000+ Businesses"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what our customers say about working with SwiftRoute Logistics."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "SwiftRoute has transformed our supply chain. We reduced shipping costs by 28% and our delivery times improved significantly. Their API integration was seamless with our Shopify store.",
            name: "Sarah Chen",
            role: "COO, TechStyle Inc.",
            avatarAlt:
              "Professional headshot of a smiling female business executive with dark hair",
          },
          {
            quote:
              "We've been working with SwiftRoute for 5 years now. Their global reach and reliability are unmatched. Even during peak seasons, they deliver on their promises. Highly recommended!",
            name: "Marcus Johnson",
            role: "Director of Logistics, Apex Manufacturing",
            avatarAlt:
              "Professional headshot of a middle-aged male logistics manager in a suit",
          },
          {
            quote:
              "The real-time tracking and analytics dashboard have given us unprecedented visibility into our supply chain. Customer service is responsive and always helpful. A true logistics partner.",
            name: "Emily Rodriguez",
            role: "VP Supply Chain, GlobalMart",
            avatarAlt:
              "Professional headshot of a young female supply chain professional with glasses",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc = props.faq?.description ?? "Got questions? We've got answers."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How do I track my shipment?",
            a: "You can track your shipment using the tracking widget on our homepage or by logging into your account dashboard. Simply enter your tracking number (starting with \"SR-\") to see real-time updates on your shipment's location, estimated delivery time, and delivery confirmation. We also send email and SMS notifications at key milestones.",
          },
          {
            q: "What countries do you ship to?",
            a: "SwiftRoute Logistics operates in 180+ countries worldwide. We have major hubs in North America, Europe, Asia-Pacific, Middle East, Africa, and South America. Whether you need domestic delivery within a country or international shipping across continents, we've got you covered with our comprehensive network.",
          },
          {
            q: "How is shipping cost calculated?",
            a: "Shipping costs are calculated based on several factors: weight and dimensions of the package, origin and destination locations, shipping speed (standard, express, or same-day), and any additional services like insurance or signature confirmation. Use our instant quote tool to get accurate pricing for your specific shipment.",
          },
          {
            q: "What is your insurance coverage?",
            a: "All shipments include basic insurance coverage based on your plan: Starter includes up to $100K, Business includes up to $500K, and Enterprise plans can be customized up to $5M+. Additional coverage can be purchased for high-value items. Claims are typically processed within 48 hours of submission.",
          },
          {
            q: "Can I integrate SwiftRoute with my e-commerce platform?",
            a: "Yes! We offer seamless integrations with major e-commerce platforms including Shopify, WooCommerce, Magento, BigCommerce, and custom APIs for enterprise systems. Our REST API and webhooks allow you to automate shipping label generation, track orders in real-time, and sync inventory across all your sales channels.",
          },
          {
            q: "What are your delivery timeframes?",
            a: "Delivery timeframes vary by service type and destination. Domestic express deliveries typically arrive within 24-48 hours, while standard ground shipping takes 3-5 business days. International shipments range from 2-7 business days for express air freight to 15-30 days for ocean freight. Get an accurate estimate using our quote tool with your specific route.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Ship Smarter?"
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ businesses that trust SwiftRoute for their logistics needs. Get your first quote in under 60 seconds."
    const ctaPrimary = props.cta?.primary ?? "Get Instant Quote"
    const ctaSecondary = props.cta?.secondary ?? "Talk to Sales"
    const ctaNote =
      props.cta?.note ??
      "No credit card required. Free account setup. Cancel anytime."

    const footerTagline = props.footer?.tagline ?? "LOGISTICS"
    const footerBlurb =
      props.footer?.blurb ??
      "Global logistics solutions for businesses of all sizes. Shipping to 180+ countries with industry-leading reliability."
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          "Express Shipping",
          "Freight Forwarding",
          "Warehousing",
          "Cargo Insurance",
          "Supply Chain Analytics",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Careers", "Press", "Partners", "Sustainability"]
    const footerSupportTitle = props.footer?.supportTitle ?? "Support"
    const footerSupportLinks = props.footer?.supportLinks?.length
      ? props.footer.supportLinks
      : [
          "Help Center",
          "Track Shipment",
          "File a Claim",
          "Contact Us",
          "API Documentation",
        ]
    const footerCopyright =
      props.footer?.copyright ?? "SwiftRoute Logistics. All rights reserved."
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Facebook", "LinkedIn"]

    // Brand bolt mark on a primary tile (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4 shrink-0", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
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
        className={cn("size-5", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // express / bolt
      <svg key="express" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // freight / globe
      <svg key="freight" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // warehouse / box
      <svg key="warehouse" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>,
      // insurance / shield-check
      <svg key="insurance" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      // analytics / doc-chart
      <svg key="analytics" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      // reverse / clock
      <svg key="reverse" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]
    const iconTints = [
      "bg-primary/10 text-primary",
      "bg-accent text-accent-foreground",
      "bg-secondary text-secondary-foreground",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-4/15 text-chart-4",
      "bg-primary/10 text-primary",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-10" />
                <span className="flex flex-col items-start leading-none">
                  <span className="text-xl font-bold tracking-tight">
                    {brand}
                  </span>
                  <span className="text-xs text-primary-foreground/60">
                    {footerTagline}
                  </span>
                </span>
              </button>

              <nav className="hidden items-center gap-8 lg:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(heroPhone)}
                  className="hidden items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground lg:inline-flex"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{heroPhone}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="hidden rounded-lg bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-transform hover:scale-105 sm:inline-flex"
                >
                  Get Quote
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-primary-foreground/80 transition-colors hover:text-primary-foreground lg:hidden"
                >
                  <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-primary text-primary-foreground">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5">
                    <span className="size-2 animate-pulse rounded-full bg-primary-foreground" />
                    <span className="text-sm font-semibold">{heroPill}</span>
                  </div>
                  <h1 className="mb-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="text-primary-foreground/80">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg text-primary-foreground/70 lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-xl bg-background px-8 py-4 text-lg font-bold text-foreground shadow-lg transition-transform hover:scale-105"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-8 py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                    >
                      {heroSecondary}
                    </button>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-primary-foreground/15 pt-8 text-sm text-primary-foreground/70 lg:justify-start">
                    {heroBadges.map((badge) => (
                      <div key={badge} className="flex items-center gap-2">
                        <Star className="size-5 text-primary-foreground" />
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking widget */}
                <div className="rounded-2xl bg-card p-6 text-card-foreground shadow-2xl lg:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{trackTitle}</h2>
                      <p className="text-sm text-muted-foreground">
                        {trackSubtitle}
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(nav.find((n) => /track/i.test(n)) ?? trackButton)
                    }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={trackPlaceholder}
                        aria-label={trackTitle}
                        className="w-full rounded-xl border-2 border-input bg-muted px-4 py-4 pl-12 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
                      />
                      <svg className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-transform active:scale-95"
                    >
                      {trackButton}
                    </button>
                  </form>

                  <div className="mt-6 border-t border-border pt-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {popularLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popular.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => go(p)}
                          className="rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
                    {quickStats.map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-2xl font-black text-primary">
                          {s.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-muted/50 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center p-4 opacity-60 transition-opacity hover:opacity-100"
                  >
                    <span className="text-xl font-bold text-foreground/80">
                      {logo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted/40 p-8 transition-all duration-300 hover:bg-card hover:shadow-2xl"
                  >
                    <div
                      className={cn(
                        "mb-6 grid size-14 place-items-center rounded-2xl transition-transform group-hover:scale-110",
                        iconTints[i % iconTints.length],
                      )}
                    >
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                    <p className="mb-4 text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-semibold text-primary-foreground/80">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-primary-foreground/70">
                  {stepsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div
                    key={step.title}
                    className="relative z-10 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6"
                  >
                    <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-background text-3xl font-black text-foreground shadow-lg">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                    <p className="text-primary-foreground/70">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {galleryEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <div
                    key={item.title}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
                  >
                    <Image
                      alt={item.alt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent"
                      aria-hidden="true"
                    />
                    <div className="absolute bottom-0 left-0 p-6">
                      <p className="text-lg font-bold text-background">
                        {item.title}
                      </p>
                      <p className="text-sm text-background/80">
                        {item.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statsPrimary.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-5xl font-black lg:text-6xl">
                      {s.value}
                    </p>
                    <p className="font-semibold text-primary-foreground/80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-16 border-t border-primary-foreground/30 pt-16">
                <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-3 lg:grid-cols-6">
                  {statsSecondary.map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl font-black">{s.value}</p>
                      <p className="mt-1 text-sm text-primary-foreground/70">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => {
                  const featured = tier.featured
                  return (
                    <div
                      key={tier.name}
                      className={cn(
                        "relative rounded-2xl bg-card p-8 transition-shadow",
                        featured
                          ? "border-2 border-primary shadow-xl"
                          : "border border-border hover:shadow-xl",
                      )}
                    >
                      {tier.badge ? (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
                          {tier.badge}
                        </div>
                      ) : null}
                      <div className="mb-6">
                        <h3 className="mb-2 text-xl font-bold">{tier.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tier.tagline}
                        </p>
                      </div>
                      <div className="mb-6">
                        <span className="text-4xl font-black">
                          {tier.price}
                        </span>
                        {tier.unit ? (
                          <span className="text-muted-foreground">
                            {tier.unit}
                          </span>
                        ) : null}
                      </div>
                      <p className="mb-6 text-muted-foreground">{tier.note}</p>
                      <ul className="mb-8 space-y-3">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <Check className="mt-0.5 text-primary" />
                            <span className="text-muted-foreground">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(tier.cta)}
                        className={cn(
                          "w-full rounded-xl py-3 font-semibold transition-colors",
                          featured
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-2 border-input text-foreground hover:border-primary hover:text-primary",
                        )}
                      >
                        {tier.cta}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted/40 p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 text-card-foreground/90">
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
                        <p className="font-bold">{t.name}</p>
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
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card transition-shadow open:shadow-lg"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-bold">{item.q}</span>
                      <span className="ml-4 grid size-8 place-items-center rounded-full bg-muted transition-colors group-open:bg-primary/10">
                        <svg
                          className="size-5 text-muted-foreground transition-transform group-open:rotate-180 group-open:text-primary"
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
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-28">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/70">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-10 py-4 text-lg font-bold text-foreground shadow-lg transition-transform hover:scale-105"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-10 py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-primary-foreground/60">
                {ctaNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-10" />
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-xl font-bold tracking-tight text-background">
                      {brand}
                    </span>
                    <span className="text-xs text-background/50">
                      {footerTagline}
                    </span>
                  </span>
                </button>
                <p className="mb-4 max-w-sm">{footerBlurb}</p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="text-xs font-semibold">
                        {social.slice(0, 2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-background">
                  {footerServicesTitle}
                </h4>
                <ul className="space-y-2 text-sm">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-background">
                  {footerCompanyTitle}
                </h4>
                <ul className="space-y-2 text-sm">
                  {footerCompanyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-bold text-background">
                  {footerSupportTitle}
                </h4>
                <ul className="space-y-2 text-sm">
                  {footerSupportLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-8 md:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex items-center gap-6 text-sm">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-primary"
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
