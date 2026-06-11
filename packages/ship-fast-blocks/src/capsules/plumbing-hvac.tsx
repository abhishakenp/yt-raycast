import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * PlumbingHvacKimiPage — a complete, self-contained local home-services LANDING
 * page for a plumbing & HVAC contractor.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "FlowGuard" design: a bright,
 * trustworthy local-trades aesthetic on a light canvas with a sky-blue brand
 * accent. It pairs a photo-backed hero (live "24/7 emergency" pill, big
 * headline, dual CTAs with a phone number, and license/same-day/upfront trust
 * row) with a trust-badge strip, a 6-up services grid (emergency plumbing,
 * drain cleaning, water heaters, AC, heating, maintenance plans), a 4-step
 * "how it works" flow, an image work gallery, a 3-tier transparent pricing
 * block with a featured Comfort Shield plan, a brand-colored stats band, a
 * 6-up star-rating testimonial grid, an accordion FAQ, a high-contrast
 * emergency CTA band, and a rich 4-column footer with contact details.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item
 * / CTA / phone / form-submit / footer / social link routes through
 * `useNavigate` (never a dead "#"). All imagery (hero, gallery, customer
 * headshots) uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const PlumbingHvacKimiPage = defineCapsule({
  name: "PlumbingHvacKimiPage",
  description:
    "Complete local home-services LANDING page for a PLUMBING and HVAC contractor (plumber, heating/cooling, AC repair, furnace, water heater, drain cleaning, emergency 24/7 service). Bright, trustworthy trades aesthetic on a light canvas with a sky-blue brand accent. Includes a photo-backed hero with a live 24/7 emergency badge, dual CTAs and a phone number, plus a license/insured/same-day/upfront-pricing trust row; a trust-badge strip (A+ BBB, licensed, satisfaction-guaranteed); a 6-up services grid (emergency plumbing, drain cleaning, water heaters, AC repair & install, heating, maintenance plans) with icons and checklists; a 4-step 'How It Works' process; an 'Our Work' image gallery with hover overlays; a 3-tier transparent pricing block with a featured maintenance plan; a brand-colored stats band (years in business, 5-star reviews, response time); a 6-up star-rating customer testimonial grid with headshots; an accordion FAQ; a high-contrast emergency CTA band with a call button; and a 4-column footer with services, company, and contact details. Use as the ROOT/home page for plumbers, HVAC companies, heating & cooling contractors, water-heater/furnace/AC installers, drain specialists, handyman trades, or any local home-services business wanting a conversion-focused page with strong local trust, transparent pricing, and emergency-call prominence. Supply content only — brand, nav, hero, badges, services, steps, gallery, pricing, stats, testimonials, faq, emergencyCta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Business / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered in the brand-accent color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        phone: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Inline trust chips below the hero copy. */
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trust-badge strip. */
    badges: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
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
    /** "How It Works" step flow. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Our Work" image gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ caption: z.string(), alt: z.string() })).optional(),
      })
      .optional(),
    /** Transparent pricing block. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        noteCta: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Brand-colored stats band. */
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
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
              location: z.string(),
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
    /** High-contrast emergency CTA band. */
    emergencyCta: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        responseTime: z.string().optional(),
        callCta: z.string().optional(),
        scheduleCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        socials: z.array(z.string()).optional(),
        servicesTitle: z.string().optional(),
        services: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        company: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.array(z.string()).optional(),
        hours: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "FlowGuard"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Pricing", "About", "Reviews", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "24/7 Emergency Service Available Now"
    const heroHeadingTop =
      props.hero?.headingTop ?? "Denver's Trusted Plumbing &"
    const heroHighlight = props.hero?.highlight ?? "HVAC Experts"
    const heroSub =
      props.hero?.subheading ??
      "Licensed master plumbers and certified HVAC technicians serving the Denver metro area since 1998. Same-day repairs, transparent pricing, and a 100% satisfaction guarantee on every job."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule Service"
    const heroPhone = props.hero?.phone ?? "(303) 555-0147"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Professional plumber installing copper pipes in residential bathroom renovation"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Licensed & Insured", "Same-Day Service", "Upfront Pricing"]

    const badgesHeading =
      props.badges?.heading ??
      "Trusted by homeowners across the Denver metro area"
    const badgeItems = props.badges?.items?.length
      ? props.badges.items
      : [
          "A+ BBB Rating",
          "24/7 Available",
          "Licensed Pros",
          "Fair Pricing",
          "Satisfaction Guaranteed",
          "Fast Response",
        ]

    const servicesHeading =
      props.services?.heading ?? "Comprehensive Home Services"
    const servicesDesc =
      props.services?.description ??
      "From emergency repairs to complete system installations, our licensed technicians handle every job with precision and care."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Emergency Plumbing",
            description:
              "24/7 emergency response for burst pipes, major leaks, sewer backups, and water heater failures. Average arrival time: 45 minutes.",
            points: [
              "Burst pipe repair",
              "Water heater repair",
              "Sewer line backup clearing",
            ],
          },
          {
            title: "Drain Cleaning",
            description:
              "Professional drain cleaning using hydro-jetting and auger technology. Clear stubborn clogs and prevent future blockages.",
            points: [
              "Kitchen sink unclogging",
              "Main line hydro-jetting",
              "Video pipe inspection",
            ],
          },
          {
            title: "Water Heaters",
            description:
              "Expert installation and repair of traditional tank and tankless water heaters. Energy-efficient options available with rebate assistance.",
            points: [
              "Tankless installation",
              "Heat pump water heaters",
              "Repair & maintenance",
            ],
          },
          {
            title: "AC Repair & Install",
            description:
              "Complete air conditioning services for Colorado summers. Fast repairs, efficient installations, and seasonal tune-ups.",
            points: [
              "Same-day AC repair",
              "Central AC installation",
              "Ductless mini-split systems",
            ],
          },
          {
            title: "Heating Services",
            description:
              "Furnace repair, replacement, and maintenance. Keep your home warm through Denver winters with reliable heating solutions.",
            points: [
              "Furnace repair & install",
              "Heat pump systems",
              "Boiler services",
            ],
          },
          {
            title: "Maintenance Plans",
            description:
              "Prevent costly breakdowns with our Comfort Shield maintenance program. Bi-annual inspections, priority scheduling, and repair discounts.",
            points: [
              "Spring AC tune-up",
              "Fall furnace inspection",
              "15% repair discount",
            ],
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How It Works"
    const stepsDesc =
      props.steps?.description ??
      "From your first call to the final inspection, we keep you informed every step of the way."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Request Service",
            description:
              "Call (303) 555-0147 or book online. Our team is available 24/7 for emergencies.",
          },
          {
            title: "Diagnosis",
            description:
              "Our licensed technician arrives, diagnoses the issue, and explains your options clearly.",
          },
          {
            title: "Upfront Quote",
            description:
              "Receive a written estimate with transparent pricing. No surprises, no hidden fees.",
          },
          {
            title: "Quality Work",
            description:
              "Expert repair or installation with premium parts. Backed by our satisfaction guarantee.",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Our Work"
    const galleryDesc =
      props.gallery?.description ??
      "See the quality craftsmanship that has earned us over 3,500 five-star reviews."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            caption: "Complete Bath Remodel",
            alt: "Modern bathroom renovation with white subway tile, glass shower enclosure, and polished chrome fixtures",
          },
          {
            caption: "Commercial HVAC Install",
            alt: "Industrial HVAC ductwork installation with silver insulated pipes running through commercial ceiling",
          },
          {
            caption: "Tankless Water Heater",
            alt: "Tankless water heater mounted on utility wall with copper piping and pressure relief valve",
          },
          {
            caption: "AC System Replacement",
            alt: "Newly installed central air conditioning outdoor condenser unit on concrete pad with surrounding landscaping",
          },
          {
            caption: "Kitchen Repipe Project",
            alt: "Luxury kitchen with farmhouse sink, marble countertops, and brass plumbing fixtures under pendant lighting",
          },
          {
            caption: "Furnace Installation",
            alt: "High-efficiency gas furnace installation in basement utility room with white PVC vent piping",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Transparent Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees, no surprises. Know exactly what you'll pay before we start."
    const pricingNote =
      props.pricing?.note ??
      "Installation pricing varies by system size and configuration."
    const pricingNoteCta =
      props.pricing?.noteCta ?? "Request a free in-home estimate"
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Service Call",
            blurb: "Diagnostic fee for repairs and troubleshooting",
            price: "$89",
            unit: "diagnostic",
            features: [
              "Complete system diagnosis",
              "Written repair estimate",
              "Waived with repair",
            ],
            cta: "Book Service Call",
          },
          {
            name: "Drain Cleaning",
            blurb: "Clear stubborn clogs with professional equipment",
            price: "$149",
            unit: "starting",
            features: [
              "Kitchen or bathroom drain",
              "Professional auger cleaning",
              "30-day clog-free guarantee",
            ],
            cta: "Schedule Cleaning",
          },
          {
            name: "Comfort Shield Plan",
            blurb: "Annual maintenance for peace of mind",
            price: "$19",
            unit: "/month",
            features: [
              "2 seasonal tune-ups/year",
              "Priority scheduling",
              "15% off all repairs",
              "No overtime charges",
            ],
            cta: "Join Comfort Shield",
            featured: true,
            badge: "POPULAR",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "26", label: "Years in Business" },
          { value: "3,500+", label: "5-Star Reviews" },
          { value: "45 min", label: "Average Response" },
          { value: "24/7", label: "Emergency Service" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Customers Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it. Here's what homeowners across Denver have to say."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Our water heater burst at 11 PM on a Saturday. FlowGuard had someone at our door within 40 minutes. Professional, fast, and fairly priced. Can't recommend them enough!",
            name: "Sarah Mitchell",
            location: "Cherry Creek, Denver",
            avatarAlt:
              "Professional headshot of Sarah Mitchell, smiling woman with blonde hair in business casual attire",
          },
          {
            quote:
              "We've used FlowGuard for both plumbing and HVAC work. Replaced our furnace last winter and AC this summer. Both installations were flawless. Their maintenance plan is worth every penny.",
            name: "Michael Torres",
            location: "Highlands Ranch",
            avatarAlt:
              "Professional headshot of Michael Torres, middle-aged man with glasses and friendly expression",
          },
          {
            quote:
              "The technician explained everything clearly and gave us multiple options. No pressure, just honest advice. The tankless water heater install saved us $40/month on energy bills!",
            name: "Jennifer Park",
            location: "Boulder, CO",
            avatarAlt:
              "Professional headshot of Jennifer Park, smiling Asian woman with dark hair wearing business attire",
          },
          {
            quote:
              "We manage 12 rental properties and FlowGuard is our go-to for all plumbing and HVAC. They've done over 50 jobs for us with consistent quality. Dependable and professional every time.",
            name: "David Chen",
            location: "Property Manager, Aurora",
            avatarAlt:
              "Professional headshot of David Chen, middle-aged businessman in suit jacket",
          },
          {
            quote:
              "AC went out during the heat wave in July. They came the same day, diagnosed the issue quickly, and had it fixed within 2 hours. The price was exactly what they quoted. Outstanding service!",
            name: "Amanda Rodriguez",
            location: "Lakewood, CO",
            avatarAlt:
              "Professional headshot of Amanda Rodriguez, young woman with curly brown hair and warm smile",
          },
          {
            quote:
              "Full home repipe completed in 3 days. The crew was respectful, cleaned up daily, and the work is immaculate. Passed inspection on the first try. Worth every penny for the peace of mind.",
            name: "Robert Williams",
            location: "Wash Park, Denver",
            avatarAlt:
              "Professional headshot of Robert Williams, older gentleman with gray hair and beard wearing casual shirt",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about our services."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do you offer 24/7 emergency service?",
            a: "Yes, we provide true 24/7/365 emergency service for plumbing and HVAC emergencies. Whether it's a burst pipe at midnight or an AC failure on a holiday weekend, our on-call technicians are ready to respond. Emergency calls are typically answered within 5 minutes, and our average arrival time is 45 minutes in the Denver metro area.",
          },
          {
            q: "What areas do you serve?",
            a: "We serve the entire Denver metropolitan area including Denver, Aurora, Lakewood, Thornton, Westminster, Arvada, Highlands Ranch, Centennial, Boulder, and surrounding communities. Same-day service is available within a 30-mile radius of downtown Denver. For locations outside this area, please call to confirm availability.",
          },
          {
            q: "Are your technicians licensed and insured?",
            a: "Absolutely. All our technicians are licensed by the State of Colorado and carry full liability and workers' compensation insurance. Our plumbers hold Master or Journeyman licenses, and our HVAC technicians are EPA certified for refrigerant handling. We conduct thorough background checks and drug testing on all employees.",
          },
          {
            q: "Do you provide free estimates?",
            a: "Yes, we provide free in-home estimates for installations and larger projects. The $89 service call fee for repairs is waived entirely if you choose to proceed with the recommended work. You'll receive a detailed, written estimate before any work begins—no surprises, no hidden fees.",
          },
          {
            q: "What payment options do you accept?",
            a: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, checks, and cash. For larger installations, we offer financing options through Synchrony Financial with approved credit, including 0% interest plans for qualified buyers. Military and senior discounts are also available.",
          },
          {
            q: "What is your warranty policy?",
            a: "We stand behind our work with comprehensive warranties. Repairs carry a 1-year parts and labor warranty. New installations include manufacturer warranties (typically 10 years on parts) plus our own 2-year labor warranty. Drain cleaning includes a 30-day clog-free guarantee—if the same drain clogs within 30 days, we'll return at no charge.",
          },
        ]

    const ecBadge =
      props.emergencyCta?.badge ?? "24/7 Emergency Service Available"
    const ecHeading = props.emergencyCta?.heading ?? "Need Emergency Service?"
    const ecDesc =
      props.emergencyCta?.description ??
      "Burst pipe? No heat? AC failure? Our licensed technicians are standing by right now. Average response time:"
    const ecResponse = props.emergencyCta?.responseTime ?? "45 minutes"
    const ecCall = props.emergencyCta?.callCta ?? "Call (303) 555-0147"
    const ecSchedule = props.emergencyCta?.scheduleCta ?? "Schedule Non-Emergency"
    const ecNote =
      props.emergencyCta?.note ??
      "Emergency rates apply 6 PM - 7 AM weekdays, all weekend, and holidays. Comfort Shield members pay no emergency fees."

    const footerAbout =
      props.footer?.about ??
      "Denver's trusted plumbing and HVAC experts since 1998. Licensed, insured, and committed to your comfort."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "Instagram"]
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServices = props.footer?.services?.length
      ? props.footer.services
      : [
          "Emergency Plumbing",
          "Drain Cleaning",
          "Water Heaters",
          "AC Repair & Install",
          "Heating Services",
          "Maintenance Plans",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompany = props.footer?.company?.length
      ? props.footer.company
      : ["About Us", "Our Team", "Careers", "Blog", "Financing", "Contact"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact Us"
    const footerPhone = props.footer?.phone ?? "(303) 555-0147"
    const footerEmail = props.footer?.email ?? "service@flowguard.com"
    const footerAddress = props.footer?.address?.length
      ? props.footer.address
      : ["2450 S Colorado Blvd", "Denver, CO 80222"]
    const footerHours = props.footer?.hours?.length
      ? props.footer.hours
      : ["Mon-Fri: 7AM-7PM", "Sat-Sun: 8AM-5PM", "24/7 Emergency"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Plumbing & HVAC. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "License Info"]

    // Decorative brand bolt mark.
    const Bolt = ({ className }: { className?: string }) => (
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
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )

    const Phone = ({ className }: { className?: string }) => (
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
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const badgeIcons: ReactNode[] = [
      // shield-check
      <svg
        key="shield"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>,
      // clock
      <svg
        key="clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // badge
      <svg
        key="badge"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      // dollar
      <svg
        key="dollar"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // double-check
      <svg
        key="dcheck"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>,
      // bolt
      <Bolt key="bolt" className="size-8" />,
    ]

    const serviceIcons: ReactNode[] = [
      // beaker / drop
      <svg
        key="drop"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      // bolt
      <Bolt key="bolt" className="size-7" />,
      // wrench-face
      <svg
        key="face"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // snow / drop (AC reuse)
      <svg
        key="ac"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      // flame
      <svg
        key="flame"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>,
      // shield
      <svg
        key="shield"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
                aria-label={`${brand} - Home`}
              >
                <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Bolt className="size-6" />
                </span>
                <span className="text-xl font-bold text-foreground">{brand}</span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="hidden items-center gap-4 md:flex">
                <button
                  type="button"
                  onClick={() => go(heroPhone)}
                  className="flex items-center text-foreground transition-colors hover:text-primary"
                >
                  <Phone className="mr-2 size-5" />
                  <span className="font-semibold">{heroPhone}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
                >
                  Get a Quote
                </button>
              </div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground md:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                  aria-hidden="true"
                >
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

        {/* Hero */}
        <section className="relative overflow-hidden bg-muted">
          <div aria-hidden="true" className="absolute inset-0 opacity-30">
            <Image
              alt={heroImageAlt}
              w={1920}
              h={1080}
              className="size-full object-cover"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                <span className="mr-2 size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-sm font-medium text-primary">{heroBadge}</span>
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {heroHeadingTop} <span className="text-primary">{heroHighlight}</span>
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {heroSub}
              </p>

              <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                >
                  {heroPrimary}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 size-5"
                    aria-hidden="true"
                  >
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPhone)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-border bg-card px-8 py-4 text-lg font-semibold text-card-foreground transition-all hover:border-input hover:bg-accent"
                >
                  <Phone className="mr-2 size-5 text-destructive" />
                  Emergency: {heroPhone}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                {heroTrust.map((t) => (
                  <div key={t} className="flex items-center">
                    <span className="mr-2 grid size-5 place-items-center rounded-full text-primary">
                      <Check className="size-5" />
                    </span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="border-b border-border bg-background py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {badgesHeading}
            </p>
            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4 lg:grid-cols-6">
              {badgeItems.map((b, i) => (
                <div key={b} className="flex flex-col items-center text-center">
                  <div className="mb-2 grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
                    {badgeIcons[i % badgeIcons.length]}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-background py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                {servicesHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{servicesDesc}</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {serviceItems.map((item, i) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-muted p-8 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary">
                    {serviceIcons[i % serviceIcons.length]}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mb-4 text-muted-foreground">{item.description}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {item.points.map((p) => (
                      <li key={p} className="flex items-center">
                        <Check className="mr-2 size-4 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                {stepsHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{stepsDesc}</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stepItems.map((step, i) => (
                <div key={step.title} className="relative">
                  <div className="rounded-2xl bg-card p-8 shadow-sm">
                    <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-card-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {i < stepItems.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute -right-4 top-1/2 hidden w-8 border-t-2 border-border lg:block"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Work gallery */}
        <section className="bg-background py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                {galleryHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{galleryDesc}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((g) => (
                <button
                  key={g.caption}
                  type="button"
                  onClick={() => go(g.caption)}
                  className="group relative block overflow-hidden rounded-2xl text-left"
                >
                  <Image
                    alt={g.alt}
                    w={600}
                    h={400}
                    loading="lazy"
                    className="h-64 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/60 to-transparent p-6">
                    <span className="font-semibold text-background">{g.caption}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-muted py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                {pricingHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{pricingDesc}</p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative overflow-hidden rounded-2xl bg-card",
                    plan.featured
                      ? "border-2 border-primary shadow-lg"
                      : "border border-border shadow-sm",
                  )}
                >
                  {plan.badge && (
                    <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                      {plan.badge}
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="mb-2 text-xl font-bold text-card-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">{plan.blurb}</p>
                    <div className="mb-6 flex items-baseline">
                      <span className="text-4xl font-bold text-card-foreground">
                        {plan.price}
                      </span>
                      <span className="ml-2 text-muted-foreground">{plan.unit}</span>
                    </div>
                    <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start">
                          <Check className="mr-2 mt-0.5 size-5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-full px-6 py-3 font-semibold transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-accent",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              {pricingNote}{" "}
              <button
                type="button"
                onClick={() => go(pricingNoteCta)}
                className="text-primary hover:underline"
              >
                {pricingNoteCta}
              </button>{" "}
              for accurate pricing.
            </p>
          </div>
        </section>

        {/* Stats band */}
        <section className="bg-primary py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
              {statsItems.map((s) => (
                <div key={s.label}>
                  <div className="mb-2 text-4xl font-bold text-primary-foreground sm:text-5xl">
                    {s.value}
                  </div>
                  <div className="text-primary-foreground/80">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-background py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                {testimonialsHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonialItems.map((t) => (
                <div key={t.name} className="rounded-2xl bg-muted p-8">
                  <div className="mb-4 flex items-center">
                    <div className="flex text-chart-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="size-5" />
                      ))}
                    </div>
                  </div>
                  <p className="mb-6 leading-relaxed text-foreground/80">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center">
                    <Image
                      alt={t.avatarAlt}
                      w={100}
                      h={100}
                      className="mr-4 size-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-foreground">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-muted py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                {faqHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{faqDesc}</p>
            </div>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="group overflow-hidden rounded-xl bg-card shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                    <span className="font-semibold text-card-foreground">
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-6 shrink-0 text-primary transition-transform group-open:rotate-180"
                    >
                      <ChevronDown className="size-5" />
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="bg-foreground py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center rounded-full border border-destructive/30 bg-destructive/20 px-4 py-2">
              <span className="mr-2 size-2 animate-pulse rounded-full bg-destructive" />
              <span className="text-sm font-medium text-destructive">{ecBadge}</span>
            </div>

            <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
              {ecHeading}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-background/70">
              {ecDesc}{" "}
              <span className="font-semibold text-background">{ecResponse}</span>.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(ecCall)}
                className="inline-flex items-center justify-center rounded-full bg-destructive px-8 py-4 text-lg font-bold text-destructive-foreground transition-all hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-xl"
              >
                <Phone className="mr-3 size-6" />
                {ecCall}
              </button>
              <button
                type="button"
                onClick={() => go(ecSchedule)}
                className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-lg font-bold text-foreground transition-all hover:bg-muted"
              >
                {ecSchedule}
              </button>
            </div>

            <p className="mt-8 text-sm text-background/60">{ecNote}</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background py-16 text-muted-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Bolt className="size-6" />
                  </span>
                  <span className="text-xl font-bold text-foreground">{brand}</span>
                </div>
                <p className="mb-6 text-sm">{footerAbout}</p>
                <div className="flex gap-4">
                  {footerSocials.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={s}
                      onClick={() => go(s)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">
                  {footerServicesTitle}
                </h3>
                <ul className="space-y-3 text-sm">
                  {footerServices.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => go(s)}
                        className="transition-colors hover:text-foreground"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">
                  {footerCompanyTitle}
                </h3>
                <ul className="space-y-3 text-sm">
                  {footerCompany.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => go(c)}
                        className="transition-colors hover:text-foreground"
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-foreground">
                  {footerContactTitle}
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Phone className="mr-3 mt-0.5 size-5 text-primary" />
                    <span>
                      <strong className="text-foreground">Emergency:</strong>
                      <br />
                      <button
                        type="button"
                        onClick={() => go(footerPhone)}
                        className="text-primary hover:underline"
                      >
                        {footerPhone}
                      </button>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3 mt-0.5 size-5 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>
                      <strong className="text-foreground">Email:</strong>
                      <br />
                      <button
                        type="button"
                        onClick={() => go(footerEmail)}
                        className="transition-colors hover:text-foreground"
                      >
                        {footerEmail}
                      </button>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3 mt-0.5 size-5 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      <strong className="text-foreground">Office:</strong>
                      <br />
                      {footerAddress.map((line, i) => (
                        <span key={line}>
                          {line}
                          {i < footerAddress.length - 1 && <br />}
                        </span>
                      ))}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3 mt-0.5 size-5 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong className="text-foreground">Hours:</strong>
                      <br />
                      {footerHours.map((line, i) => (
                        <span
                          key={line}
                          className={
                            i === footerHours.length - 1 ? "text-primary" : undefined
                          }
                        >
                          {line}
                          {i < footerHours.length - 1 && <br />}
                        </span>
                      ))}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between border-t border-border pt-8 sm:flex-row">
              <p className="text-sm">{footerCopyright}</p>
              <div className="mt-4 flex gap-6 text-sm sm:mt-0">
                {footerLegal.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => go(l)}
                    className="transition-colors hover:text-foreground"
                  >
                    {l}
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
