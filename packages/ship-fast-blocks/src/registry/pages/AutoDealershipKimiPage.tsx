import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * AutoDealershipKimiPage — a complete, self-contained AUTO DEALERSHIP landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Meridian Motors" design: a
 * clean, premium, light editorial aesthetic for a certified pre-owned car
 * dealership. Sticky navbar (brand + phone + "Book Test Drive"), a split hero
 * (eyebrow, big headline, APR/inventory KPI strip, dual CTAs, showroom photo),
 * a trusted-brands logo strip, a 3-up featured-inventory grid of vehicle cards
 * (photo, certified/electric/hybrid badge, mileage/drivetrain spec line, feature
 * chips, price + view-details), a "why buy from us" features band with icon
 * tiles and a founder quote card, a 3-step financing section with an APR stats
 * block, a dark stats band, a 3-up star-rated testimonials grid, an accordion
 * FAQ, a dark test-drive CTA with a real request form, and a multi-column footer.
 *
 * Every nav item / CTA / vehicle / link / form submit routes through
 * `useNavigate` (never a dead "#"). All imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render the full page with no props at all.
 */
export const AutoDealershipKimiPage = defineComponent({
  name: "AutoDealershipKimiPage",
  description:
    "Complete AUTO DEALERSHIP / used-car landing page with a clean, premium, light editorial aesthetic for a certified pre-owned vehicle showroom. Includes a sticky navbar (brand, phone number, Book Test Drive CTA), a split hero (eyebrow, large headline, dual CTAs, inline KPI strip for inventory count / starting APR / Google rating, and a showroom hero photo), a trusted-brands logo strip (BMW, Mercedes, Audi, Lexus, Tesla, Toyota), a 3-up FEATURED INVENTORY grid of vehicle cards (car photo, Certified/Electric/Hybrid badge, year-make-model, mileage / transmission / drivetrain spec line, feature chips like Leather/Navigation/Autopilot, price and View Details link), a Why-Buy-From-Us features band with icon tiles (150-point inspection, 7-day money-back, 90-day warranty, no hidden fees) and a founder quote card, a 3-step financing section (Apply Online, Compare Offers, Drive Away) with an APR / max-months / down-payment stats block and Get Pre-Approved CTA, a dark stats band (years in business, vehicles sold, rating, repeat customers), a 3-up star-rated customer testimonials grid, an accordion FAQ, a dark Ready-to-Take-the-Wheel CTA with a real test-drive request form (name, phone, email, vehicle select), and a multi-column footer with inventory/services/contact links and social icons. Use as the ROOT/home page for car dealerships, used-car lots, certified pre-owned vehicle sellers, auto sales, dealership groups, EV/hybrid lots, or any automotive retail site that needs inventory browsing, financing, test-drive booking, trade-ins and trust/warranty messaging. Supply content only — brand, nav, hero, logos, inventory, features, financing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Dealership brand name shown in navbar, hero eyebrow and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        phone: z.string().optional(),
        navCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-brands logo strip. */
    logos: z
      .object({ heading: z.string().optional(), brands: z.array(z.string()).optional() })
      .optional(),
    /** Featured inventory grid. */
    inventory: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              specs: z.string(),
              price: z.string(),
              badge: z.string(),
              electric: z.boolean().optional(),
              features: z.array(z.string()),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Why buy from us" features band + founder quote. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
        quote: z.string().optional(),
        quoteName: z.string().optional(),
        quoteRole: z.string().optional(),
        quoteAvatarAlt: z.string().optional(),
      })
      .optional(),
    /** Financing section (steps + APR stats). */
    financing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        cta: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Customer testimonials grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              meta: z.string(),
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
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark test-drive CTA + request form. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
        formTitle: z.string().optional(),
        submit: z.string().optional(),
        vehicleOptions: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        blurb: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        contact: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Meridian Motors"
    const nav = props.nav?.length
      ? props.nav
      : ["Inventory", "Financing", "About", "Reviews", "FAQ"]

    const heroEyebrow = props.hero?.eyebrow ?? "Premium Pre-Owned Vehicles"
    const heroHeading = props.hero?.heading ?? "Find Your Perfect Drive"
    const heroSub =
      props.hero?.subheading ??
      "Over 200 certified pre-owned vehicles. Competitive financing from 3.9% APR. 7-day money-back guarantee on every purchase."
    const heroPrimary = props.hero?.primaryCta ?? "Browse Inventory"
    const heroSecondary = props.hero?.secondaryCta ?? "Schedule Test Drive"
    const heroPhone = props.hero?.phone ?? "(555) 0127-456"
    const heroNavCta = props.hero?.navCta ?? "Book Test Drive"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Premium white sedan parked in modern showroom with floor-to-ceiling windows"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "200+", label: "Vehicles in Stock" },
          { value: "3.9%", label: "Starting APR" },
          { value: "4.9", label: "Google Rating" },
        ]

    const logosHeading = props.logos?.heading ?? "Trusted Brands We Carry"
    const logoBrands = props.logos?.brands?.length
      ? props.logos.brands
      : ["BMW", "Mercedes", "Audi", "Lexus", "Tesla", "Toyota"]

    const inventoryHeading = props.inventory?.heading ?? "Featured Inventory"
    const inventoryDesc =
      props.inventory?.description ??
      "Browse our hand-picked selection of certified pre-owned vehicles. Every car passes a 150-point inspection."
    const inventoryViewAll = props.inventory?.viewAll ?? "View All 200+ Vehicles"
    const inventoryItems = props.inventory?.items?.length
      ? props.inventory.items
      : [
          {
            name: "2022 BMW 330i",
            specs: "28,450 miles · Automatic · RWD",
            price: "$38,995",
            badge: "Certified",
            features: ["Leather", "Navigation", "Sunroof"],
            imageAlt: "Black BMW 3 Series sedan front three-quarter view",
          },
          {
            name: "2021 Mercedes C300",
            specs: "35,200 miles · Automatic · AWD",
            price: "$41,500",
            badge: "Certified",
            features: ["Premium Audio", "Heated Seats", "Blind Spot"],
            imageAlt: "White Mercedes-Benz C-Class luxury sedan in showroom lighting",
          },
          {
            name: "2023 Tesla Model 3",
            specs: "12,800 miles · Auto · Long Range",
            price: "$42,995",
            badge: "Electric",
            electric: true,
            features: ["Autopilot", "Glass Roof", "358 mi Range"],
            imageAlt: "Tesla Model 3 electric vehicle in pearl white exterior finish",
          },
          {
            name: "2022 Lexus RX 350",
            specs: "41,000 miles · Automatic · AWD",
            price: "$45,750",
            badge: "Certified",
            features: ["Mark Levinson", "Panoramic Roof", "Safety+"],
            imageAlt: "Lexus RX SUV in silver metallic paint on paved driveway",
          },
          {
            name: "2021 Audi A4 Premium",
            specs: "32,600 miles · Automatic · AWD",
            price: "$36,995",
            badge: "Certified",
            features: ["Virtual Cockpit", "LED Lights", "Quattro"],
            imageAlt: "Audi A4 sedan in dark blue exterior color profile view",
          },
          {
            name: "2023 Toyota RAV4 Hybrid",
            specs: "18,900 miles · CVT · AWD",
            price: "$34,250",
            badge: "Hybrid",
            electric: true,
            features: ["40 MPG", "CarPlay", "Adaptive Cruise"],
            imageAlt: "Toyota RAV4 hybrid compact SUV in white with black roof rails",
          },
        ]

    const featuresHeading = props.features?.heading ?? `Why Buy from ${brand}`
    const featuresDesc =
      props.features?.description ??
      "For over 15 years, we have been Austin's trusted source for premium pre-owned vehicles. Our commitment to transparency and quality sets us apart."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "150-Point Inspection",
            description:
              "Every vehicle undergoes rigorous mechanical and cosmetic inspection before sale.",
          },
          {
            title: "7-Day Money Back",
            description:
              "Not satisfied? Return your vehicle within 7 days for a full refund, no questions asked.",
          },
          {
            title: "90-Day Warranty",
            description:
              "Comprehensive coverage on all certified vehicles. Extended plans available.",
          },
          {
            title: "No Hidden Fees",
            description:
              "Transparent pricing. The price you see is the price you pay plus tax and title.",
          },
        ]
    const featuresImageAlt =
      props.features?.imageAlt ??
      "Modern glass and steel car dealership showroom exterior at sunset"
    const featuresQuote =
      props.features?.quote ??
      "We built this dealership on the principle that buying a car should be enjoyable, not stressful. Every decision we make puts our customers first."
    const featuresQuoteName = props.features?.quoteName ?? "David Chen"
    const featuresQuoteRole =
      props.features?.quoteRole ?? "General Manager & Founder"
    const featuresQuoteAvatarAlt =
      props.features?.quoteAvatarAlt ??
      "Professional headshot of David Chen, General Manager"

    const financingHeading =
      props.financing?.heading ?? "Flexible Financing Options"
    const financingDesc =
      props.financing?.description ??
      "Get pre-approved in minutes with competitive rates from our network of 20+ lenders. We work with all credit situations to find the right payment plan for you."
    const financingImageAlt =
      props.financing?.imageAlt ??
      "Professional business handshake over desk with documents and calculator"
    const financingCta = props.financing?.cta ?? "Get Pre-Approved Now"
    const financingSteps = props.financing?.steps?.length
      ? props.financing.steps
      : [
          {
            title: "Apply Online",
            description:
              "Complete our secure 3-minute application. No impact to your credit score.",
          },
          {
            title: "Compare Offers",
            description:
              "Review personalized rates from multiple lenders side by side.",
          },
          {
            title: "Drive Away",
            description: "Sign electronically and take delivery the same day.",
          },
        ]
    const financingStats = props.financing?.stats?.length
      ? props.financing.stats
      : [
          { value: "3.9%", label: "Starting APR" },
          { value: "84", label: "Max Months" },
          { value: "$0", label: "Down Options" },
        ]

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "15+", label: "Years in Business" },
          { value: "8,500+", label: "Vehicles Sold" },
          { value: "4.9", label: "Google Rating" },
          { value: "78%", label: "Repeat Customers" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Customers Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it. Here's what Austin drivers have to say about their experience."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Best car buying experience I've ever had. No pressure, transparent pricing, and the 7-day return policy gave me peace of mind. Loving my certified BMW 3 Series!",
            name: "Jennifer Walsh",
            meta: "Austin, TX · 2023 BMW 330i",
            avatarAlt: "Professional headshot of Jennifer Walsh, satisfied customer",
          },
          {
            quote:
              "Got pre-approved online and drove away in my Tesla the same day. The financing team found me a rate better than my credit union offered. Highly recommend!",
            name: "Marcus Thompson",
            meta: "Round Rock, TX · 2022 Tesla Model 3",
            avatarAlt: "Professional headshot of Marcus Thompson, Tesla buyer",
          },
          {
            quote:
              "This is my third car from Meridian. The 150-point inspection really means something—I haven't had a single issue with any vehicle I've bought here. Trustworthy team.",
            name: "Sarah Mitchell",
            meta: "Cedar Park, TX · 2021 Lexus RX",
            avatarAlt: "Professional headshot of Sarah Mitchell, repeat customer",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      `Everything you need to know about buying from ${brand}.`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What does the 150-point inspection cover?",
            a: "Our inspection covers all major mechanical systems (engine, transmission, brakes, suspension), electrical components, safety features, and cosmetic condition. We check for frame damage, flood history, and verify clean title status. You'll receive a full inspection report before purchase.",
          },
          {
            q: "How does the 7-day money-back guarantee work?",
            a: "If you're not completely satisfied with your purchase, bring the vehicle back within 7 days (up to 500 miles) for a full refund. No restocking fees, no questions asked. The vehicle must be in the same condition as when purchased.",
          },
          {
            q: "Can I get financing with less-than-perfect credit?",
            a: "Absolutely. We work with 20+ lenders including specialty finance companies for all credit situations. Whether you have excellent credit, are rebuilding, or have a bankruptcy in your history, we'll find options. Our online pre-qualification uses a soft credit check that won't affect your score.",
          },
          {
            q: "Do you accept trade-ins?",
            a: "Yes, we accept all makes and models in any condition. Get an instant online estimate, or bring your vehicle for a free in-person appraisal. We often beat CarMax offers and can apply your trade value directly to your new purchase or cut you a check the same day.",
          },
          {
            q: "Is the online pre-approval a hard credit inquiry?",
            a: "No. Our online pre-qualification uses a soft inquiry that will not appear on your credit report or affect your credit score. A hard inquiry only occurs once you select a specific lender and move forward with finalizing your purchase.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Take the Wheel?"
    const ctaDesc =
      props.cta?.description ??
      "Schedule your test drive today. Browse our inventory online, get pre-approved in minutes, and visit our showroom for a no-pressure experience. Your next vehicle is waiting."
    const ctaPrimary = props.cta?.primaryCta ?? "Browse Inventory"
    const ctaSecondary = props.cta?.secondaryCta ?? "Get Pre-Approved"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["No hidden fees", "7-day returns", "150-point inspected"]
    const ctaFormTitle = props.cta?.formTitle ?? "Quick Test Drive Request"
    const ctaSubmit = props.cta?.submit ?? "Request Test Drive"
    const ctaVehicleOptions = props.cta?.vehicleOptions?.length
      ? props.cta.vehicleOptions
      : [
          "Select a vehicle you're interested in",
          "2022 BMW 330i - $38,995",
          "2021 Mercedes C300 - $41,500",
          "2023 Tesla Model 3 - $42,995",
          "2022 Lexus RX 350 - $45,750",
          "2021 Audi A4 - $36,995",
          "2023 Toyota RAV4 Hybrid - $34,250",
          "Other / Not sure yet",
        ]

    const footerBlurb =
      props.footer?.blurb ??
      "Premium pre-owned vehicles in Austin, Texas. 15 years of trusted service."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Inventory",
            links: ["All Vehicles", "Sedans", "SUVs", "Trucks", "Electric"],
          },
          {
            title: "Services",
            links: [
              "Financing",
              "Trade-In",
              "Test Drive",
              "Vehicle History",
              "Service Center",
            ],
          },
        ]
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : [
          "4200 N Lamar Blvd",
          "Austin, TX 78756",
          "(512) 555-0127",
          "sales@meridianmotors.com",
          "Mon-Sat: 9am-8pm · Sun: 11am-6pm",
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© 2024 ${brand}. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Sitemap"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Instagram", "Google Reviews"]

    // Decorative feature icons (token-colored, currentColor strokes).
    const CheckBadge = () => (
      <svg
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
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    const Clock = () => (
      <svg
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
    const Shield = () => (
      <svg
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
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
    const Receipt = () => (
      <svg
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
        <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
    const featureIcons = [<CheckBadge />, <Clock />, <Shield />, <Receipt />]

    const Star = () => (
      <svg
        className="size-5 text-chart-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    const Chevron = () => (
      <svg
        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    )
    const CheckCircle = () => (
      <svg className="size-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const socialIcon = (name: string) => {
      if (name === "Instagram")
        return (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        )
      if (name === "Google Reviews")
        return (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3.445 17.827c-3.684 1.684-6.845-1.36-6.845-4.276 0-2.912 3.161-5.96 6.845-4.28 1.544.707 2.696 2.065 3.186 3.68h-3.186c-.496-1.23-1.44-2.083-2.691-2.66-2.243-1.028-4.744.78-4.744 3.26 0 2.476 2.501 4.288 4.744 3.26 1.252-.577 2.195-1.43 2.691-2.66h3.186c-.49 1.615-1.642 2.973-3.186 3.68z" />
          </svg>
        )
      return (
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    }

    const inputCls =
      "w-full rounded-md border border-input bg-background/10 px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"

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
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 text-xl font-semibold tracking-tight lg:text-2xl"
              >
                {brand}
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
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  {heroPhone}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroNavCta)}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroNavCta}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {heroEyebrow}
                    </p>
                    <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                      {heroHeading}
                    </h1>
                    <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                      {heroSub}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-8 pt-4">
                    {heroStats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-8">
                        {i > 0 && <div className="h-10 w-px bg-border" />}
                        <div>
                          <p className="text-2xl font-semibold">{s.value}</p>
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
                    h={600}
                    className="aspect-[4/3] w-full rounded-lg object-cover shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Trusted brands */}
          <section className="border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-3 items-center gap-8 opacity-60 md:grid-cols-6">
                {logoBrands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => go(b)}
                    className="text-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Featured inventory */}
          <section className="bg-card py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {inventoryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{inventoryDesc}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {inventoryItems.map((v) => (
                  <article
                    key={v.name}
                    className="group overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-foreground/30"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        alt={v.imageAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span
                        className={cn(
                          "absolute left-4 top-4 rounded px-2 py-1 text-xs font-medium",
                          v.electric
                            ? "bg-chart-2 text-primary-foreground"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        {v.badge}
                      </span>
                    </div>
                    <div className="space-y-4 p-6">
                      <div>
                        <h3 className="text-lg font-semibold">{v.name}</h3>
                        <p className="text-sm text-muted-foreground">{v.specs}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {v.features.map((f) => (
                          <span
                            key={f}
                            className="rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <p className="text-2xl font-semibold">{v.price}</p>
                        <button
                          type="button"
                          onClick={() => go(v.name)}
                          className="text-sm font-medium transition-colors hover:text-muted-foreground"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(inventoryViewAll)}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {inventoryViewAll}
                </button>
              </div>
            </div>
          </section>

          {/* Why buy from us */}
          <section className="bg-muted py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      {featuresHeading}
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {featuresDesc}
                    </p>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {featureItems.map((item, i) => (
                      <div key={item.title} className="space-y-3">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          {featureIcons[i % featureIcons.length]}
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <Image
                    alt={featuresImageAlt}
                    w={800}
                    h={500}
                    loading="lazy"
                    className="aspect-[16/10] w-full rounded-lg object-cover shadow-lg"
                  />
                  <div className="rounded-lg border border-border bg-card p-6">
                    <blockquote className="italic text-muted-foreground">
                      &ldquo;{featuresQuote}&rdquo;
                    </blockquote>
                    <div className="mt-4 flex items-center gap-3">
                      <Image
                        alt={featuresQuoteAvatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{featuresQuoteName}</p>
                        <p className="text-sm text-muted-foreground">
                          {featuresQuoteRole}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Financing */}
          <section className="bg-card py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="order-2 lg:order-1">
                  <Image
                    alt={financingImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-lg object-cover shadow-lg"
                  />
                </div>
                <div className="order-1 space-y-8 lg:order-2">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      {financingHeading}
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {financingDesc}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {financingSteps.map((step, i) => (
                      <div
                        key={step.title}
                        className="flex items-start gap-4 rounded-lg border border-border bg-muted p-4"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-muted p-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {financingStats.map((s) => (
                        <div key={s.label}>
                          <p className="text-3xl font-semibold">{s.value}</p>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(financingCta)}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {financingCta}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Dark stats band */}
          <section className="bg-primary py-16 text-primary-foreground lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="text-4xl font-semibold lg:text-5xl">{s.value}</p>
                    <p className="mt-2 text-sm text-primary-foreground/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-lg border border-border bg-card p-6 lg:p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.meta}</p>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card py-16 lg:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-lg border border-border bg-muted"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <h3 className="pr-4 font-semibold">{item.q}</h3>
                      <Chevron />
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Test-drive CTA */}
          <section className="bg-primary py-16 text-primary-foreground lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-6">
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {ctaHeading}
                  </h2>
                  <p className="text-lg leading-relaxed text-primary-foreground/70">
                    {ctaDesc}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="inline-flex items-center justify-center rounded-md bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-background/90"
                    >
                      {ctaPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="inline-flex items-center justify-center rounded-md border border-primary-foreground/30 px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                    >
                      {ctaSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-primary-foreground/70">
                    {ctaBadges.map((b) => (
                      <span key={b} className="flex items-center gap-2">
                        <CheckCircle />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-6 lg:p-8">
                  <h3 className="mb-6 text-xl font-semibold">{ctaFormTitle}</h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(ctaSubmit)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="dealer-name" className="sr-only">
                          Full Name
                        </label>
                        <input
                          id="dealer-name"
                          type="text"
                          placeholder="Full Name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label htmlFor="dealer-phone" className="sr-only">
                          Phone Number
                        </label>
                        <input
                          id="dealer-phone"
                          type="tel"
                          placeholder="Phone Number"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="dealer-email" className="sr-only">
                        Email Address
                      </label>
                      <input
                        id="dealer-email"
                        type="email"
                        placeholder="Email Address"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="dealer-vehicle" className="sr-only">
                        Vehicle of Interest
                      </label>
                      <select
                        id="dealer-vehicle"
                        className={cn(inputCls, "appearance-none")}
                      >
                        {ctaVehicleOptions.map((opt) => (
                          <option key={opt} className="bg-background text-foreground">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-md bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-background/90"
                    >
                      {ctaSubmit}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-12 text-background/70 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
              <div className="col-span-2 md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 text-xl font-semibold text-background"
                >
                  {brand}
                </button>
                <p className="mb-4 text-sm">{footerBlurb}</p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={s}
                      onClick={() => go(s)}
                      className="text-background/70 transition-colors hover:text-background"
                    >
                      {socialIcon(s)}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-background">
                    {col.title}
                  </p>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
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
              ))}
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-background">
                  Contact
                </p>
                <ul className="space-y-3 text-sm">
                  {footerContact.map((line, i) => (
                    <li key={line} className={i >= 2 ? "pt-2" : undefined}>
                      {i === 2 || i === 3 ? (
                        <button
                          type="button"
                          onClick={() => go(line)}
                          className="transition-colors hover:text-background"
                        >
                          {line}
                        </button>
                      ) : (
                        line
                      )}
                    </li>
                  ))}
                </ul>
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
