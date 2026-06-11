import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * CleaningServiceKimiPage — a complete, self-contained home-cleaning-service
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "PureSpace Cleaning" design:
 * a bright, fresh, trust-forward layout on a light canvas with a single
 * emerald-style brand accent (mapped to `primary`). It pairs a split hero
 * (trust pill + headline + dual CTAs + trust badges + showcase photo with a
 * floating rating card) with a logos strip, a 6-up services grid, a 3-step
 * "how it works" flow plus a "what's included" checklist + photo grid, a
 * 6-image transformations gallery with hover overlays, a 3-tier pricing table
 * (middle plan highlighted), a brand-color stats band, a 6-up reviews grid
 * with star ratings + avatars, a 7-item FAQ accordion, a big closing CTA, and
 * a multi-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Colors use
 * ONLY semantic theme tokens (primary = the emerald brand hue). Every nav item,
 * CTA, plan button, social and footer link routes through `useNavigate` (never
 * a dead "#"). All imagery uses the alt-driven <Image> component (never a raw
 * src). Callers supply ONLY content data; rich defaults make it render great
 * with no props at all.
 */
export const CleaningServiceKimiPage = defineCapsule({
  name: "CleaningServiceKimiPage",
  description:
    "Complete home-cleaning / maid-service / housekeeping LANDING page with a bright, fresh, trust-forward aesthetic: light canvas, a single emerald-style brand accent, rounded-pill CTAs and soft cards. Includes a split hero (trusted-by pill, bold headline, dual CTAs, vetted/insured/guarantee trust badges, and a showcase photo with a floating star-rating card), a 'trusted by' logos strip, a 6-up cleaning-services grid (standard, deep, move-in/move-out, post-construction, same-day, eco-friendly with from-prices), a 3-step 'book in minutes' how-it-works flow with a what's-included checklist and a 2x2 result photo grid, a 6-image before/after transformations gallery with hover captions, a 3-tier transparent pricing table with a highlighted 'Most Popular' plan and per-visit prices, a brand-color stats band (homes cleaned, rating, cleaners, satisfaction), a 6-up customer reviews grid with 5-star ratings and avatars, a 7-item FAQ accordion, a big closing book-now CTA, and a multi-column footer with services/company/support links and socials. Use as the ROOT/home page for residential cleaning companies, maid services, housekeeping, janitorial, eco-friendly cleaners, move-out / Airbnb turnover cleaning, or any local home-service business when a clean, reassuring, conversion-focused page with services, pricing, social proof and FAQ is wanted. Supply content only — brand, nav, hero, services, steps, gallery, pricing, stats, reviews, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
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
        secondaryCta: z.string().optional(),
        phone: z.string().optional(),
        imageAlt: z.string().optional(),
        rating: z.string().optional(),
        ratingNote: z.string().optional(),
        /** Trust badges beneath the hero CTAs. */
        trustBadges: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Trusted by" logos strip. */
    logos: z
      .object({
        label: z.string().optional(),
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
              price: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** How-it-works steps + what's-included checklist. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        includedHeading: z.string().optional(),
        included: z.array(z.string()).optional(),
        gallery: z.array(z.string()).optional(),
      })
      .optional(),
    /** Transformations gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              location: z.string(),
              alt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        footnote: z.string().optional(),
        footnoteCta: z.string().optional(),
      })
      .optional(),
    /** Brand-color stats band. */
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** Customer reviews grid. */
    reviews: z
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Closing CTA. */
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
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        location: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "PureSpace"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "How It Works", "Pricing", "Reviews", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Trusted by 10,000+ homes in Seattle"
    const headingTop = props.hero?.headingTop ?? "A cleaner home,"
    const heroHighlight = props.hero?.highlight ?? "without the stress."
    const heroSub =
      props.hero?.subheading ??
      "Professional cleaning services tailored to your schedule. From deep cleans to weekly maintenance, our vetted, insured cleaners bring sparkle to every room."
    const heroPrimary = props.hero?.primaryCta ?? "Book Your Cleaning"
    const heroSecondary = props.hero?.secondaryCta ?? "View Pricing"
    const heroPhone = props.hero?.phone ?? "(555) 123-4567"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Professional cleaner in apron wiping kitchen counter with spray bottle in bright modern home"
    const heroRating = props.hero?.rating ?? "4.9"
    const heroRatingNote = props.hero?.ratingNote ?? "From 2,847 reviews"
    const trustBadges = props.hero?.trustBadges?.length
      ? props.hero.trustBadges
      : ["Vetted Cleaners", "Insured & Bonded", "Satisfaction Guarantee"]

    const logosLabel = props.logos?.label ?? "Trusted by leading companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Airbnb", "Zillow", "Redfin", "Compass", "Opendoor", "WeWork"]

    const servicesHeading =
      props.services?.heading ?? "Services designed around your life"
    const servicesDesc =
      props.services?.description ??
      "From one-time deep cleans to recurring maintenance, we have a service that fits your schedule and budget."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Standard Cleaning",
            description:
              "Perfect for weekly or bi-weekly maintenance. Includes dusting, vacuuming, mopping, bathroom sanitization, and kitchen wipe-down.",
            price: "From $129 per visit",
          },
          {
            title: "Deep Cleaning",
            description:
              "Intensive cleaning for neglected spaces. Inside appliances, baseboards, light fixtures, window sills, and detailed scrubbing of every surface.",
            price: "From $249 per visit",
          },
          {
            title: "Move-In/Move-Out",
            description:
              "Comprehensive cleaning for transitions. Cabinets, closets, appliances, and every nook cleaned to ensure your deposit return or fresh start.",
            price: "From $349 per visit",
          },
          {
            title: "Post-Construction",
            description:
              "Specialized cleaning after renovations. Dust removal, paint spot cleaning, debris disposal, and polishing of newly installed fixtures.",
            price: "From $399 per visit",
          },
          {
            title: "Same-Day Service",
            description:
              "Urgent cleaning when you need it most. Last-minute bookings available for unexpected guests, events, or emergencies within 4 hours.",
            price: "From $199 per visit",
          },
          {
            title: "Eco-Friendly Cleaning",
            description:
              "Plant-based, non-toxic products safe for children and pets. HEPA filtration vacuums and sustainable practices for health-conscious homes.",
            price: "From $159 per visit",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Book in minutes, clean in hours"
    const stepsDesc =
      props.steps?.description ??
      "Our streamlined process gets your home cleaned with zero hassle."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Book Online",
            description:
              "Select your service, home size, and preferred time slot. Get instant pricing with no hidden fees. Book as early as tomorrow or schedule recurring visits.",
          },
          {
            title: "We Match & Clean",
            description:
              "Our algorithm matches you with a vetted, background-checked cleaner in your area. They arrive on time with all supplies and equipment.",
          },
          {
            title: "Enjoy & Relax",
            description:
              "Come home to sparkling spaces. Rate your cleaner and schedule your next visit. We follow up to ensure everything exceeded expectations.",
          },
        ]
    const includedHeading =
      props.steps?.includedHeading ?? "What's included in every clean"
    const included = props.steps?.included?.length
      ? props.steps.included
      : [
          "All rooms dusted & vacuumed",
          "Bathrooms sanitized",
          "Kitchen counters & appliances",
          "Floors mopped & polished",
          "Trash removed",
          "Beds made & linens changed",
          "Mirrors & glass cleaned",
          "Supplies provided",
        ]
    const stepGallery = props.steps?.gallery?.length
      ? props.steps.gallery
      : [
          "sparkling clean modern kitchen with white cabinets and marble countertops",
          "clean bathroom with white tiles and glass shower door",
          "tidied bedroom with made bed and natural light",
          "organized living room with clean surfaces and vacuumed carpet",
        ]

    const galleryHeading =
      props.gallery?.heading ?? "Transformations that speak for themselves"
    const galleryDesc =
      props.gallery?.description ??
      "See the difference professional cleaning makes in real homes across Seattle."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Kitchen Deep Clean",
            location: "Capitol Hill, Seattle",
            alt: "before and after comparison of kitchen deep cleaning showing greasy stove to sparkling clean",
          },
          {
            title: "Bathroom Revival",
            location: "Ballard, Seattle",
            alt: "pristine bathroom with white subway tiles and clean glass shower enclosure",
          },
          {
            title: "Living Room Refresh",
            location: "Fremont, Seattle",
            alt: "freshly cleaned living room with organized furniture and dust-free surfaces",
          },
          {
            title: "Home Office Clean",
            location: "Queen Anne, Seattle",
            alt: "clean home office with organized desk and dusted shelves",
          },
          {
            title: "Floor Restoration",
            location: "Green Lake, Seattle",
            alt: "sparkling hardwood floors after professional mopping in open concept space",
          },
          {
            title: "Master Bedroom",
            location: "Wallingford, Seattle",
            alt: "immaculate bedroom with freshly laundered white linens and organized nightstands",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Transparent pricing, no surprises"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that fits your home and budget. All plans include our satisfaction guarantee."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Studio / 1 Bedroom",
            blurb: "Perfect for apartments and small spaces",
            price: "$129",
            period: "/visit",
            features: [
              "2-3 hours of cleaning",
              "Up to 800 sq ft",
              "1 bathroom",
              "All cleaning supplies",
            ],
            cta: "Book This Plan",
          },
          {
            name: "2-3 Bedroom Home",
            blurb: "Ideal for families and medium homes",
            price: "$189",
            period: "/visit",
            features: [
              "3-4 hours of cleaning",
              "Up to 2,000 sq ft",
              "Up to 2 bathrooms",
              "Inside refrigerator",
              "All cleaning supplies",
            ],
            cta: "Book This Plan",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "4+ Bedroom Home",
            blurb: "For larger homes and estates",
            price: "$279",
            period: "/visit",
            features: [
              "4-6 hours of cleaning",
              "Up to 4,000 sq ft",
              "Up to 4 bathrooms",
              "2-person cleaning team",
            ],
            cta: "Book This Plan",
          },
        ]
    const pricingFootnote =
      props.pricing?.footnote ??
      "Need a custom quote for a larger space or commercial property?"
    const pricingFootnoteCta =
      props.pricing?.footnoteCta ?? "Call for custom pricing: (555) 123-4567"

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "10,000+", label: "Homes Cleaned" },
          { value: "4.9", label: "Average Rating" },
          { value: "150+", label: "Vetted Cleaners" },
          { value: "98%", label: "Satisfaction Rate" },
        ]

    const reviewsHeading = props.reviews?.heading ?? "Loved by homeowners"
    const reviewsDesc =
      props.reviews?.description ??
      "Don't take our word for it. Here's what Seattle residents say about PureSpace."
    const reviewItems = props.reviews?.items?.length
      ? props.reviews.items
      : [
          {
            quote:
              "I've used PureSpace for weekly cleanings for 8 months now. Maria is always on time, thorough, and leaves my place smelling amazing. Worth every penny for the peace of mind.",
            name: "Jennifer Walsh",
            meta: "Capitol Hill, Seattle • Weekly Customer",
            avatarAlt:
              "professional headshot of Jennifer Walsh, a smiling woman with shoulder-length blonde hair",
          },
          {
            quote:
              "Booked them for a move-out clean on short notice. They arrived the next morning and got my full deposit back. The landlord even asked for their contact info. Highly recommend!",
            name: "David Chen",
            meta: "Ballard, Seattle • Move-Out Clean",
            avatarAlt:
              "professional headshot of David Chen, a smiling man with glasses and short black hair",
          },
          {
            quote:
              "As a working mom of three, PureSpace has been a lifesaver. The eco-friendly option means I don't worry about chemicals around my kids. Their attention to detail is incredible.",
            name: "Sarah Martinez",
            meta: "Green Lake, Seattle • Bi-weekly Customer",
            avatarAlt:
              "professional headshot of Sarah Martinez, a smiling woman with brown hair in a bun",
          },
          {
            quote:
              "I run an Airbnb with 4 units and PureSpace handles all my turnovers. They're reliable, communicate well, and my guests consistently mention how clean the places are in reviews.",
            name: "Marcus Johnson",
            meta: "Fremont, Seattle • Commercial Client",
            avatarAlt:
              "professional headshot of Marcus Johnson, a smiling man with beard and short hair",
          },
          {
            quote:
              "After my renovation, there was dust everywhere. The post-construction team made my house livable again. They even cleaned inside every drawer and cabinet. Absolutely phenomenal service.",
            name: "Emily Thompson",
            meta: "Queen Anne, Seattle • Deep Clean",
            avatarAlt:
              "professional headshot of Emily Thompson, a smiling young woman with curly auburn hair",
          },
          {
            quote:
              "I've tried three other cleaning services in Seattle, and PureSpace is by far the best. Consistent quality, easy app, and they actually listen to my preferences. Never switching.",
            name: "Robert Kim",
            meta: "Wallingford, Seattle • Monthly Customer",
            avatarAlt:
              "professional headshot of Robert Kim, a smiling man with dark hair and professional attire",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about our cleaning services."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What's included in a standard cleaning?",
            a: "Our standard cleaning includes dusting all surfaces, vacuuming and mopping floors, cleaning and sanitizing bathrooms (toilet, shower/tub, sink, mirrors), wiping down kitchen counters and appliance exteriors, taking out trash, and making beds. We bring all supplies and equipment. Deep cleaning and add-ons like inside appliances or windows are available at checkout.",
          },
          {
            q: "Are your cleaners background checked?",
            a: "Absolutely. Every cleaner undergoes a comprehensive background check, reference verification, and in-person interview before joining our platform. We also provide ongoing training and require maintain a 4.5+ star rating to remain active. PureSpace is fully bonded and insured for your peace of mind.",
          },
          {
            q: "What if I'm not satisfied with the cleaning?",
            a: "We stand behind our work with a 100% satisfaction guarantee. If anything wasn't cleaned to your standards, contact us within 24 hours and we'll send a cleaner back to make it right at no additional cost. If you're still not happy, we'll provide a full refund. Your happiness is our priority.",
          },
          {
            q: "Do I need to be home during the cleaning?",
            a: "It's entirely up to you. Many customers provide entry instructions (lockbox code, door code, or hidden key) and return to a sparkling home. If you prefer to be present, that's fine too. Our cleaners are professional and respectful of your space whether you're there or not.",
          },
          {
            q: "Can I book the same cleaner each time?",
            a: "Yes! When you set up recurring cleanings (weekly, bi-weekly, or monthly), you can request the same cleaner. We prioritize matching you with cleaners you've rated highly. For one-time bookings, we'll match you with the best available cleaner in your area.",
          },
          {
            q: "What areas do you serve?",
            a: "We currently serve all Seattle neighborhoods including Capitol Hill, Ballard, Fremont, Queen Anne, Green Lake, Wallingford, Belltown, South Lake Union, West Seattle, and more. We also service select areas of Bellevue, Kirkland, and Redmond. Enter your zip code at checkout to confirm service availability.",
          },
          {
            q: "How do I reschedule or cancel a booking?",
            a: "Life happens! You can reschedule or cancel through your online account up to 24 hours before your appointment with no penalty. Cancellations within 24 hours incur a $50 fee to compensate your assigned cleaner. For recurring bookings, you can pause or modify your schedule anytime.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready for a cleaner home?"
    const ctaDesc =
      props.cta?.description ??
      "Book your first cleaning today and experience the PureSpace difference. Same-day appointments available for urgent needs."
    const ctaPrimary = props.cta?.primaryCta ?? "Book Your Cleaning Now"
    const ctaSecondary = props.cta?.secondaryCta ?? "Call (555) 123-4567"
    const ctaNote =
      props.cta?.note ?? "Free cancellation up to 24 hours before your appointment"

    const footerTagline =
      props.footer?.tagline ??
      "Professional home cleaning services in Seattle. Making homes sparkle since 2018."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Services",
            links: [
              "Standard Cleaning",
              "Deep Cleaning",
              "Move In/Out",
              "Post-Construction",
              "Eco-Friendly",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Blog", "Gift Cards"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "Become a Cleaner",
              "Privacy Policy",
              "Terms of Service",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Cleaning Services. All rights reserved.`
    const footerLocation = props.footer?.location ?? "Seattle, WA"
    const footerPhone = props.footer?.phone ?? "(555) 123-4567"
    const footerEmail = props.footer?.email ?? "hello@purespace.com"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "Instagram"]

    // Decorative sparkle brand mark (fixed brand asset).
    const SparkleMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
    )

    const CheckCircle = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
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

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
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

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        width="18"
        height="18"
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

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // home
      <svg key="home" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      // bolt
      <svg key="bolt" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // calendar
      <svg key="calendar" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      // building
      <svg key="building" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      // clock
      <svg key="clock" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // shield-check
      <svg key="shield" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <SparkleMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight text-foreground">
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
                  className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
                >
                  <PhoneIcon className="size-4" />
                  {heroPhone}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Book Cleaning
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <CheckCircle />
                    {heroBadge}
                  </div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {trustBadges.map((badge) => (
                      <div key={badge} className="flex items-center gap-2">
                        <span className="text-primary">
                          <CheckCircle />
                        </span>
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
                    className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-xl sm:block sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        <Image
                          alt="professional headshot of a smiling woman with dark hair"
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-card object-cover"
                        />
                        <Image
                          alt="professional headshot of a smiling man with short brown hair"
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-card object-cover"
                        />
                        <Image
                          alt="professional headshot of a smiling woman with blonde hair"
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-card object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <Star />
                          <span className="font-semibold text-card-foreground">
                            {heroRating}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {heroRatingNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-background">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-12 items-center justify-center text-xl font-semibold text-muted-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group rounded-2xl border border-border bg-muted/40 p-8 text-left transition-all hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="font-semibold text-primary">{item.price}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted/40 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="h-full rounded-2xl border border-border bg-card p-8 shadow-sm">
                      <div className="mb-6 grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {i < stepItems.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-12 hidden h-0.5 w-12 -translate-x-4 bg-primary/40 md:block"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-16 rounded-2xl border border-border bg-card p-8 shadow-sm lg:p-12">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold text-card-foreground">
                      {includedHeading}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {included.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <Check className="mt-0.5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {stepGallery.map((alt) => (
                      <Image
                        key={alt}
                        alt={alt}
                        w={400}
                        h={300}
                        loading="lazy"
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group relative block overflow-hidden rounded-2xl text-left"
                  >
                    <Image
                      alt={item.alt}
                      w={600}
                      h={450}
                      loading="lazy"
                      className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute bottom-4 left-4 text-background">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-background/80">
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="grid items-start gap-8 md:grid-cols-3 lg:gap-6">
                {pricingPlans.map((plan) =>
                  plan.featured ? (
                    <div
                      key={plan.name}
                      className="relative rounded-2xl border border-primary bg-primary p-8 shadow-xl lg:-mt-4 lg:mb-4"
                    >
                      {plan.badge ? (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="rounded-full bg-primary-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                            {plan.badge}
                          </span>
                        </div>
                      ) : null}
                      <h3 className="mb-2 text-lg font-semibold text-primary-foreground">
                        {plan.name}
                      </h3>
                      <p className="mb-6 text-sm text-primary-foreground/80">
                        {plan.blurb}
                      </p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-primary-foreground">
                          {plan.price}
                        </span>
                        <span className="text-primary-foreground/80">
                          {plan.period}
                        </span>
                      </div>
                      <ul className="mb-8 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className="mt-0.5 shrink-0 text-primary-foreground/90" />
                            <span className="text-sm text-primary-foreground/90">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(plan.cta)}
                        className="w-full rounded-full bg-primary-foreground px-6 py-3 font-semibold text-primary shadow-lg transition-colors hover:bg-primary-foreground/90"
                      >
                        {plan.cta}
                      </button>
                    </div>
                  ) : (
                    <div
                      key={plan.name}
                      className="rounded-2xl border border-border bg-card p-8 shadow-sm"
                    >
                      <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                        {plan.name}
                      </h3>
                      <p className="mb-6 text-sm text-muted-foreground">
                        {plan.blurb}
                      </p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-card-foreground">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                      <ul className="mb-8 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className="mt-0.5 shrink-0 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(plan.cta)}
                        className="w-full rounded-full bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
                      >
                        {plan.cta}
                      </button>
                    </div>
                  ),
                )}
              </div>
              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{pricingFootnote}</p>
                <button
                  type="button"
                  onClick={() => go(pricingFootnoteCta)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  <PhoneIcon className="size-5" />
                  {pricingFootnoteCta}
                </button>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((stat) => (
                  <div key={stat.label}>
                    <div className="mb-2 text-4xl font-bold text-primary-foreground lg:text-5xl">
                      {stat.value}
                    </div>
                    <p className="text-primary-foreground/80">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {reviewsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{reviewsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {reviewItems.map((review) => (
                  <div
                    key={review.name}
                    className="rounded-2xl border border-border bg-muted/40 p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={review.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {review.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {review.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/40 py-20 lg:py-28">
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
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {item.q}
                      </h3>
                      <span className="ml-6 shrink-0 text-muted-foreground">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-center lg:p-16">
                <div aria-hidden="true" className="absolute inset-0 opacity-10">
                  <svg
                    className="size-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <pattern
                      id="cleaning-cta-grid"
                      width="10"
                      height="10"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="1" cy="1" r="1" fill="currentColor" />
                    </pattern>
                    <rect
                      width="100"
                      height="100"
                      fill="url(#cleaning-cta-grid)"
                      className="text-primary-foreground"
                    />
                  </svg>
                </div>
                <div className="relative">
                  <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                    {ctaHeading}
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                    {ctaDesc}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(ctaPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary-foreground px-8 py-4 text-base font-semibold text-primary shadow-lg transition-colors hover:bg-primary-foreground/90"
                    >
                      {ctaPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(ctaSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                    >
                      <PhoneIcon className="mr-2 size-5" />
                      {ctaSecondary}
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-primary-foreground/70">
                    {ctaNote}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-card py-16 text-muted-foreground lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <SparkleMark className="size-8" />
                  <span className="text-xl font-semibold text-card-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {social.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-card-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-card-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm">{footerCopyright}</p>
              <div className="flex items-center gap-6 text-sm">
                <span>{footerLocation}</span>
                <button
                  type="button"
                  onClick={() => go(footerPhone)}
                  className="transition-colors hover:text-card-foreground"
                >
                  {footerPhone}
                </button>
                <button
                  type="button"
                  onClick={() => go(footerEmail)}
                  className="transition-colors hover:text-card-foreground"
                >
                  {footerEmail}
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
