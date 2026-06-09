import { useState } from "react"
import { z } from "zod/v4"
import { useState } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * RealEstateKimiPage — a complete, self-contained real-estate / property
 * brokerage LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Apex Realty" design: a
 * clean, editorial, neutral aesthetic on a light canvas with crisp cards,
 * subtle borders, and a sticky blurred navbar. It pairs a split hero
 * (headline + inline KPI strip + floating "Verified Listings" badge over a
 * hero home photo) with a 4-field property SEARCH bar (location / type /
 * price + search button), a 3-up "why choose us" features grid, a 6-up
 * FEATURED LISTINGS grid (For Sale / For Rent badge, address, beds/baths/sqft
 * stats, price + view details), a 4-up AGENTS roster (headshots + email /
 * call / linkedin links), a 3-up star-rated TESTIMONIALS grid, a dark contact
 * CTA band (call/email buttons + a request-a-consultation form), and a 4-column
 * footer with quick links, company, contact info and a legal bottom bar.
 *
 * The block owns ALL layout, spacing, type hierarchy and color via semantic
 * theme tokens. Every nav item / CTA / listing / agent link / form submit
 * routes through `useNavigate` (never a dead "#"), and the navbar labels match
 * the `nav` array so PageSwitch can swap pages. All content imagery uses the
 * alt-driven <Image> component (never a raw src). Callers supply ONLY content
 * data; rich defaults make it render great with no props at all.
 */
export const RealEstateKimiPage = defineComponent({
  name: "RealEstateKimiPage",
  description:
    "Complete real-estate / property-brokerage / realty LANDING page with a clean, editorial, neutral aesthetic: light canvas, crisp bordered cards and a sticky blurred navbar. Includes a split hero (headline, supporting copy, dual CTAs, inline KPI strip, floating 'verified listings' badge over a hero home photo), a 4-field PROPERTY SEARCH bar (location, property type, price range, search button), a 3-up 'why choose us' features grid with icons, a 6-up FEATURED LISTINGS grid of property cards (For Sale / For Rent status badge, street address, beds/baths/sqft specs, price and view-details action), a 4-up AGENTS roster with headshots and email/call/LinkedIn links, a 3-up star-rated TESTIMONIALS grid with client avatars, a dark contact CTA band with call/email buttons and a request-a-consultation form, plus a 4-column footer with quick links, company links, contact details, social icons and a legal bottom bar. Use as the ROOT/home page for real-estate agencies, property brokerages, realtors, home-listing marketplaces, rental platforms, luxury estates or relocation services when a trustworthy, photo-led property page with search, listings and agent social proof is wanted. Supply content only — brand, nav, hero, search, features, listings, agents, testimonials, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / brokerage name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        headingTop: z.string().optional(),
        /** Phrase rendered in the muted highlight color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        phone: z.string().optional(),
        imageAlt: z.string().optional(),
        badgeTitle: z.string().optional(),
        badgeSubtitle: z.string().optional(),
        /** Inline KPI strip beneath the hero copy. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Property search bar. */
    search: z
      .object({
        locationLabel: z.string().optional(),
        locations: z.array(z.string()).optional(),
        typeLabel: z.string().optional(),
        types: z.array(z.string()).optional(),
        priceLabel: z.string().optional(),
        prices: z.array(z.string()).optional(),
        submit: z.string().optional(),
      })
      .optional(),
    /** "Why choose us" features grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Featured listings grid. */
    listings: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              status: z.string(),
              forRent: z.boolean().optional(),
              listed: z.string(),
              address: z.string(),
              beds: z.string(),
              baths: z.string(),
              sqft: z.string(),
              price: z.string(),
              priceSuffix: z.string().optional(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Agents roster. */
    agents: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
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
    /** Dark contact CTA band + consultation form. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        callCta: z.string().optional(),
        emailCta: z.string().optional(),
        formHeading: z.string().optional(),
        submit: z.string().optional(),
        interests: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        socials: z.array(z.string()).optional(),
        quickLinksTitle: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Apex Realty"
    const nav = props.nav?.length
      ? props.nav
      : ["Listings", "Agents", "About", "Testimonials", "Contact"]

    const headingTop = props.hero?.headingTop ?? "Find a place you'll"
    const heroHighlight = props.hero?.highlight ?? "love calling home"
    const heroSub =
      props.hero?.subheading ??
      "Discover over 2,500 properties for sale and rent across the country. Our expert agents help you navigate the market with confidence."
    const heroPrimary = props.hero?.primaryCta ?? "Browse Listings"
    const heroSecondary = props.hero?.secondaryCta ?? "Meet Our Agents"
    const heroPhone = props.hero?.phone ?? "(123) 456-7890"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern luxury home exterior with large windows and manicured lawn at golden hour"
    const heroBadgeTitle = props.hero?.badgeTitle ?? "Verified Listings"
    const heroBadgeSubtitle =
      props.hero?.badgeSubtitle ?? "Every property verified"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "2,500+", label: "Properties Listed" },
          { value: "850+", label: "Happy Clients" },
          { value: "24", label: "Expert Agents" },
        ]

    const searchLocationLabel = props.search?.locationLabel ?? "Location"
    const searchLocations = props.search?.locations?.length
      ? props.search.locations
      : [
          "All Locations",
          "San Francisco, CA",
          "Los Angeles, CA",
          "New York, NY",
          "Miami, FL",
          "Seattle, WA",
          "Austin, TX",
        ]
    const searchTypeLabel = props.search?.typeLabel ?? "Property Type"
    const searchTypes = props.search?.types?.length
      ? props.search.types
      : [
          "All Types",
          "Single Family Home",
          "Condominium",
          "Townhouse",
          "Multi-Family",
          "Commercial",
        ]
    const searchPriceLabel = props.search?.priceLabel ?? "Price Range"
    const searchPrices = props.search?.prices?.length
      ? props.search.prices
      : [
          "Any Price",
          "$0 - $500,000",
          "$500,000 - $1,000,000",
          "$1,000,000 - $2,000,000",
          "$2,000,000+",
        ]
    const searchSubmit = props.search?.submit ?? "Search Properties"

    const featuresHeading =
      props.features?.heading ?? "Why choose Apex Realty"
    const featuresDesc =
      props.features?.description ??
      "We combine local expertise with modern technology to deliver an exceptional real estate experience."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Trusted Experience",
            description:
              "With over 15 years in the market, we've helped more than 850 families find their dream homes. Our reputation is built on trust and results.",
          },
          {
            title: "Fast Process",
            description:
              "Our streamlined approach means less waiting and more moving. Average closing time is 30% faster than the industry standard.",
          },
          {
            title: "Expert Team",
            description:
              "Our 24 certified agents know every neighborhood. From first-time buyers to luxury investors, we have specialists for every need.",
          },
        ]

    const listingsHeading = props.listings?.heading ?? "Featured Listings"
    const listingsDesc =
      props.listings?.description ??
      "Hand-picked properties currently available on the market"
    const listingsViewAll =
      props.listings?.viewAll ?? "View all 2,500+ listings"
    const listingItems = props.listings?.items?.length
      ? props.listings.items
      : [
          {
            title: "Modern Hillside Villa",
            status: "For Sale",
            listed: "Listed 3 days ago",
            address: "2847 Angelo Drive, Los Angeles, CA",
            beds: "5 beds",
            baths: "4 baths",
            sqft: "4,200 sqft",
            price: "$3,850,000",
            imageAlt:
              "Modern hillside villa with floor-to-ceiling glass windows overlooking Los Angeles city lights at dusk",
          },
          {
            title: "Downtown Skyline Penthouse",
            status: "For Rent",
            forRent: true,
            listed: "Listed 1 week ago",
            address: "888 W 7th Street, Los Angeles, CA",
            beds: "3 beds",
            baths: "3 baths",
            sqft: "2,850 sqft",
            price: "$8,500",
            priceSuffix: "/mo",
            imageAlt:
              "Contemporary glass penthouse apartment with wraparound terrace and city skyline views",
          },
          {
            title: "Craftsman Garden Bungalow",
            status: "For Sale",
            listed: "Listed 2 weeks ago",
            address: "4521 Meridian Ave, Seattle, WA",
            beds: "4 beds",
            baths: "2.5 baths",
            sqft: "2,100 sqft",
            price: "$985,000",
            imageAlt:
              "Charming craftsman bungalow with wraparound porch and mature garden landscaping",
          },
          {
            title: "Waterfront Estate",
            status: "For Sale",
            listed: "Listed today",
            address: "1240 Biscayne Blvd, Miami Beach, FL",
            beds: "6 beds",
            baths: "7 baths",
            sqft: "8,500 sqft",
            price: "$12,500,000",
            imageAlt:
              "Luxurious waterfront estate with infinity pool and private dock on Miami Beach",
          },
          {
            title: "Pacific Heights Townhouse",
            status: "For Rent",
            forRent: true,
            listed: "Listed 5 days ago",
            address: "2240 Vallejo Street, San Francisco, CA",
            beds: "3 beds",
            baths: "2.5 baths",
            sqft: "1,950 sqft",
            price: "$6,200",
            priceSuffix: "/mo",
            imageAlt:
              "Sleek modern townhouse in San Francisco with bay windows and rooftop deck",
          },
          {
            title: "Mid-Century Modern Retreat",
            status: "For Sale",
            listed: "Listed 4 days ago",
            address: "1804 Alta Vista Ave, Austin, TX",
            beds: "4 beds",
            baths: "3 baths",
            sqft: "2,400 sqft",
            price: "$1,250,000",
            imageAlt:
              "Mid-century modern home in Austin with open floor plan and native Texas landscaping",
          },
        ]

    const agentsHeading = props.agents?.heading ?? "Meet Our Expert Agents"
    const agentsDesc =
      props.agents?.description ??
      "Our team of 24 certified professionals brings local expertise and personalized service to every transaction."
    const agentsViewAll = props.agents?.viewAll ?? "View all 24 agents"
    const agentItems = props.agents?.items?.length
      ? props.agents.items
      : [
          {
            name: "Sarah Chen",
            role: "Senior Agent • San Francisco",
            imageAlt:
              "Professional headshot of Sarah Chen, a real estate agent with warm smile",
          },
          {
            name: "Marcus Williams",
            role: "Luxury Specialist • Miami",
            imageAlt:
              "Professional headshot of Marcus Williams, a real estate agent in a navy suit",
          },
          {
            name: "Jennifer Park",
            role: "Buyer's Agent • Seattle",
            imageAlt:
              "Professional headshot of Jennifer Park, a real estate agent with confident expression",
          },
          {
            name: "David Rodriguez",
            role: "Investment Advisor • Austin",
            imageAlt:
              "Professional headshot of David Rodriguez, a real estate agent with friendly demeanor",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real stories from real people who found their perfect home with Apex Realty."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Sarah Chen made our first home buying experience seamless. She was patient, knowledgeable, and always available to answer our questions. We closed on our dream home in Pacific Heights within 45 days.",
            name: "Emily Thompson",
            role: "First-time Buyer, San Francisco",
            avatarAlt: "Portrait of Emily Thompson, a satisfied client",
          },
          {
            quote:
              "Marcus helped us sell our Miami Beach property above asking price in just 12 days. His marketing strategy and negotiation skills are unmatched. He truly understands the luxury market.",
            name: "Robert Kim",
            role: "Property Investor, Miami",
            avatarAlt: "Portrait of Robert Kim, a satisfied client",
          },
          {
            quote:
              "After relocating from New York, Jennifer found us the perfect family home in Seattle within our budget. Her knowledge of school districts and neighborhoods was invaluable for our family of four.",
            name: "Amanda Foster",
            role: "Relocating Family, Seattle",
            avatarAlt: "Portrait of Amanda Foster, a satisfied client",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Ready to find your dream home?"
    const contactDesc =
      props.contact?.description ??
      "Let our experienced agents guide you through every step of the process. Schedule a free consultation today and take the first step toward your new home."
    const contactCallCta =
      props.contact?.callCta ?? "Call (123) 456-7890"
    const contactEmailCta = props.contact?.emailCta ?? "Email Us"
    const contactFormHeading =
      props.contact?.formHeading ?? "Request a Consultation"
    const contactSubmit = props.contact?.submit ?? "Schedule Consultation"
    const contactInterests = props.contact?.interests?.length
      ? props.contact.interests
      : [
          "Buying a home",
          "Selling a home",
          "Renting a property",
          "Investment properties",
          "Just exploring",
        ]

    const footerAbout =
      props.footer?.about ??
      "Helping families find their perfect homes since 2009. Your trusted partner in real estate across the nation."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Instagram", "LinkedIn"]
    const footerQuickTitle = props.footer?.quickLinksTitle ?? "Quick Links"
    const footerQuickLinks = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : [
          "Property Listings",
          "Our Agents",
          "Buy a Home",
          "Sell a Home",
          "Rent a Property",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Careers", "Press", "Blog", "Contact"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "123 Market Street, San Francisco, CA 94105"
    const footerPhone = props.footer?.phone ?? "(123) 456-7890"
    const footerEmail = props.footer?.email ?? "hello@apexrealty.com"
    const footerCopyright =
      props.footer?.copyright ?? "© 2026 Apex Realty. All rights reserved."
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    // Brand logo mark — house glyph (decorative brand asset).
    const HomeMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    )

    const PinIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    )

    const LinkedInIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const BedIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    )

    const BathIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    )

    const AreaIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
        />
      </svg>
    )

    const FeatureIcon = ({ i, className }: { i: number; className?: string }) => {
      const paths = [
        "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        "M13 10V3L4 14h7v7l9-11h-7z",
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      ]
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d={paths[i % paths.length]}
          />
        </svg>
      )
    }

    const SocialIcon = ({ name, className }: { name: string; className?: string }) => {
      const key = name.toLowerCase()
      if (key.includes("face")) {
        return (
          <svg
            className={className}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )
      }
      if (key.includes("insta")) {
        return (
          <svg
            className={className}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        )
      }
      return <LinkedInIcon className={className} />
    }

    const inputCls =
      "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-secondary-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"

    const selectCls =
      "w-full appearance-none cursor-pointer rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <HomeMark className="size-8 text-foreground" />
                <span className="text-xl font-semibold tracking-tight">
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
                  onClick={() => go(heroPhone)}
                  className="hidden items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground sm:flex"
                >
                  <PhoneIcon className="size-4" />
                  {heroPhone}
                </button>
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-foreground md:hidden"
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
                      strokeWidth="1.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
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
        </nav>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-background">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}{" "}
                    <span className="text-muted-foreground">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-xl border border-border bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex gap-8 pt-4">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-3xl font-semibold text-foreground">
                          {s.value}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={900}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-xl sm:block">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <svg
                          className="size-6 text-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {heroBadgeTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroBadgeSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search */}
          <section className="border-y border-border bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-border bg-muted p-6 lg:p-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="re-location"
                      className="block text-sm font-medium text-foreground"
                    >
                      {searchLocationLabel}
                    </label>
                    <div className="relative">
                      <PinIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                      <select id="re-location" className={selectCls}>
                        {searchLocations.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="re-type"
                      className="block text-sm font-medium text-foreground"
                    >
                      {searchTypeLabel}
                    </label>
                    <div className="relative">
                      <HomeMark className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                      <select id="re-type" className={selectCls}>
                        {searchTypes.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="re-price"
                      className="block text-sm font-medium text-foreground"
                    >
                      {searchPriceLabel}
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <select id="re-price" className={selectCls}>
                        {searchPrices.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => go(searchSubmit)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      {searchSubmit}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground">
                  {featuresHeading}
                </h2>
                <p className="text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-muted">
                      <FeatureIcon i={i} className="size-7 text-foreground" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
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

          {/* Listings */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-semibold text-foreground">
                    {listingsHeading}
                  </h2>
                  <p className="text-muted-foreground">{listingsDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(listingsViewAll)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {listingsViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {listingItems.map((p) => (
                  <article
                    key={p.title}
                    className="group overflow-hidden rounded-2xl border border-border bg-muted transition-shadow hover:shadow-lg"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        alt={p.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            p.forRent
                              ? "bg-accent text-accent-foreground"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {p.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {p.listed}
                        </span>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-foreground">
                        {p.title}
                      </h3>
                      <p className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
                        <PinIcon className="size-4" />
                        {p.address}
                      </p>
                      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BedIcon className="size-4" />
                          {p.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <BathIcon className="size-4" />
                          {p.baths}
                        </span>
                        <span className="flex items-center gap-1">
                          <AreaIcon className="size-4" />
                          {p.sqft}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <p className="text-2xl font-semibold text-foreground">
                          {p.price}
                          {p.priceSuffix ? (
                            <span className="text-sm font-normal text-muted-foreground">
                              {p.priceSuffix}
                            </span>
                          ) : null}
                        </p>
                        <button
                          type="button"
                          onClick={() => go(p.title)}
                          className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Agents */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground">
                  {agentsHeading}
                </h2>
                <p className="text-muted-foreground">{agentsDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {agentItems.map((agent) => (
                  <article
                    key={agent.name}
                    className="rounded-2xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg"
                  >
                    <div className="mx-auto mb-4 size-32 overflow-hidden rounded-full bg-muted">
                      <Image
                        alt={agent.imageAlt}
                        w={256}
                        h={256}
                        className="size-full object-cover"
                      />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-card-foreground">
                      {agent.name}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {agent.role}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-muted-foreground">
                      <button
                        type="button"
                        aria-label={`Email ${agent.name}`}
                        onClick={() => go(`Email ${agent.name}`)}
                        className="transition-colors hover:text-foreground"
                      >
                        <MailIcon className="size-5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Call ${agent.name}`}
                        onClick={() => go(`Call ${agent.name}`)}
                        className="transition-colors hover:text-foreground"
                      >
                        <PhoneIcon className="size-5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`${agent.name} on LinkedIn`}
                        onClick={() => go(`${agent.name} on LinkedIn`)}
                        className="transition-colors hover:text-foreground"
                      >
                        <LinkedInIcon className="size-5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(agentsViewAll)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {agentsViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground">
                  {testimonialsHeading}
                </h2>
                <p className="text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted p-8"
                  >
                    <div className="mb-6 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="size-12 overflow-hidden rounded-full bg-secondary">
                        <Image
                          alt={t.avatarAlt}
                          w={128}
                          h={128}
                          className="size-full object-cover"
                        />
                      </div>
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

          {/* Contact CTA */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="space-y-6">
                  <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                    {contactHeading}
                  </h2>
                  <p className="max-w-xl text-lg leading-relaxed text-primary-foreground/70">
                    {contactDesc}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => go(contactCallCta)}
                      className="inline-flex items-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <PhoneIcon className="size-5" />
                      {contactCallCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(contactEmailCta)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground/10 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                    >
                      <MailIcon className="size-5" />
                      {contactEmailCta}
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl bg-primary-foreground/10 p-8">
                  <h3 className="mb-6 text-xl font-semibold text-primary-foreground">
                    {contactFormHeading}
                  </h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(contactSubmit)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="re-first"
                          className="mb-2 block text-sm font-medium text-primary-foreground/70"
                        >
                          First Name
                        </label>
                        <input
                          id="re-first"
                          type="text"
                          placeholder="John"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="re-last"
                          className="mb-2 block text-sm font-medium text-primary-foreground/70"
                        >
                          Last Name
                        </label>
                        <input
                          id="re-last"
                          type="text"
                          placeholder="Smith"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="re-email"
                        className="mb-2 block text-sm font-medium text-primary-foreground/70"
                      >
                        Email Address
                      </label>
                      <input
                        id="re-email"
                        type="email"
                        placeholder="john@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="re-phone"
                        className="mb-2 block text-sm font-medium text-primary-foreground/70"
                      >
                        Phone Number
                      </label>
                      <input
                        id="re-phone"
                        type="tel"
                        placeholder="(123) 456-7890"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="re-interest"
                        className="mb-2 block text-sm font-medium text-primary-foreground/70"
                      >
                        I'm interested in
                      </label>
                      <select
                        id="re-interest"
                        className={cn(inputCls, "cursor-pointer appearance-none")}
                      >
                        {contactInterests.map((opt) => (
                          <option key={opt} className="bg-background text-foreground">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-background py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {contactSubmit}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted pb-8 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2"
                >
                  <HomeMark className="size-8 text-foreground" />
                  <span className="text-xl font-semibold tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <SocialIcon name={social} className="size-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-foreground">
                  {footerQuickTitle}
                </h4>
                <ul className="space-y-3">
                  {footerQuickLinks.map((link) => (
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
                  {footerCompanyTitle}
                </h4>
                <ul className="space-y-3">
                  {footerCompanyLinks.map((link) => (
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
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <PinIcon className="mt-0.5 size-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {footerAddress}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <PhoneIcon className="size-5 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <MailIcon className="size-5 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {footerEmail}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  {footerCopyright}
                </p>
                <div className="flex gap-6">
                  {footerLegal.map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => go(link)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
