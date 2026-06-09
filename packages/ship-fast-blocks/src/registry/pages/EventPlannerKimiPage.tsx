import { z } from "zod/v4"
import { useState } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * EventPlannerKimiPage — a complete, self-contained luxury EVENT-PLANNING agency
 * landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Serene Events" design: a calm,
 * editorial, warm-neutral aesthetic (stone palette mapped to background/muted/card
 * tokens) with airy whitespace, thin elegant headlines, pill CTAs and rounded photo
 * cards. It pairs a split hero (eyebrow + huge light headline + dual CTAs + KPI
 * strip + tall photo with a floating planner-team card) with a trusted-by logo
 * strip, a 6-up services grid (with "starting at" pricing), a 4-step process row,
 * a masonry portfolio gallery, a 3-tier pricing/packages block, a stats + photo
 * collage band, a 6-up testimonials grid with star ratings, an FAQ accordion, a
 * dark split contact section (contact details + full inquiry form), and a 4-column
 * footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and depth. Surfaces use only
 * semantic tokens; dark accent bands (navbar CTA, process numerals, pricing
 * highlight, contact section, footer) use `primary`/`foreground`. Every nav item,
 * CTA, footer link, social and form-submit routes through `useNavigate` (never a
 * dead "#"). All imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults render the full page with no props.
 */
export const EventPlannerKimiPage = defineComponent({
  name: "EventPlannerKimiPage",
  description:
    "Complete luxury EVENT-PLANNING / event-management agency landing page with a calm, editorial, warm-neutral aesthetic: airy whitespace, thin elegant serif-style headlines, rounded photo cards and pill CTAs. Includes a split hero (eyebrow, large light headline, dual CTAs, KPI strip, tall hero photo with a floating planner-team card), a trusted-by hotel-brand logo strip, a 6-up services grid with per-service 'starting at' pricing (wedding planning, corporate events, private celebrations, non-profit galas, destination events, day-of coordination), a numbered 4-step process row (Discovery, Design, Planning, Execution), a masonry portfolio/gallery of past events, a 3-tier pricing/packages block (Essential, Signature, White Glove) with a highlighted popular plan, a stats + photo-collage impact band, a 6-up client-testimonials grid with star ratings and headshots, an FAQ accordion, a dark split contact section with company details (email, phone, address) plus a full inquiry form (name, email, event type, date, guest count, message), and a 4-column footer. Use as the ROOT/home page for event planners, wedding planners, party/celebration planners, corporate-event and gala organizers, catering or destination-event companies, or any premium hospitality service wanting a refined, conversion-focused page with portfolio, packages, social proof and a booking form. Supply content only — brand, nav, hero, services, process, gallery, pricing, stats, testimonials, faq, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / studio name shown in the navbar and footer. */
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
        imageAlt: z.string().optional(),
        cardTitle: z.string().optional(),
        cardRole: z.string().optional(),
        cardQuote: z.string().optional(),
        teamAvatars: z.array(z.string()).optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        brands: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services grid. */
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
              price: z.string(),
              imageAlt: z.string(),
            }),
          )
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
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Portfolio gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
        wideImages: z.array(z.string()).optional(),
      })
      .optional(),
    /** Pricing / packages block. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        popularLabel: z.string().optional(),
        cta: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              features: z.array(z.string()),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats + photo collage impact band. */
    stats: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Testimonials grid. */
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
    /** Dark split contact section + inquiry form. */
    contact: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        eventTypes: z.array(z.string()).optional(),
        guestRanges: z.array(z.string()).optional(),
        submit: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        legal: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Serene Events"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Gallery", "Process", "Testimonials", "FAQ"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 2012 • San Francisco"
    const heroHeading =
      props.hero?.heading ?? "Crafting Moments That Last Forever"
    const heroSub =
      props.hero?.subheading ??
      "We transform your vision into extraordinary experiences. From intimate gatherings to grand celebrations, every detail is thoughtfully designed and flawlessly executed."
    const heroPrimary = props.hero?.primaryCta ?? "Start Planning"
    const heroSecondary = props.hero?.secondaryCta ?? "View Our Work"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Elegant wedding reception table with floral centerpiece in warm candlelight"
    const heroCardTitle = props.hero?.cardTitle ?? "Sarah & Team"
    const heroCardRole = props.hero?.cardRole ?? "Lead Planners"
    const heroCardQuote = props.hero?.cardQuote ?? "Your dream, our expertise."
    const heroAvatars = props.hero?.teamAvatars?.length
      ? props.hero.teamAvatars
      : [
          "Professional headshot of event planner Sarah Chen with warm smile",
          "Professional headshot of event coordinator Michael Torres",
          "Professional headshot of senior planner Emma Williams",
        ]
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "500+", label: "Events Planned" },
          { value: "12", label: "Years Experience" },
          { value: "98%", label: "Client Satisfaction" },
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by Leading Brands"
    const logoBrands = props.logos?.brands?.length
      ? props.logos.brands
      : [
          "Fairmont",
          "Four Seasons",
          "Ritz-Carlton",
          "St. Regis",
          "Mandarin",
          "Rosewood",
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Comprehensive Event Solutions"
    const servicesDesc =
      props.services?.description ??
      "From conception to celebration, we handle every aspect of your event with precision and creativity."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Wedding Planning",
            description:
              'Full-service wedding coordination from engagement to "I do." We manage venues, vendors, timelines, and every detail that makes your day uniquely yours.',
            price: "Starting at $8,500",
            imageAlt:
              "Elegant wedding ceremony with white floral arch and guests seated on manicured lawn",
          },
          {
            title: "Corporate Events",
            description:
              "Professional galas, product launches, and executive retreats that reflect your brand's sophistication and leave lasting impressions on clients and partners.",
            price: "Starting at $12,000",
            imageAlt:
              "Modern corporate conference with attendees networking in contemporary venue space",
          },
          {
            title: "Private Celebrations",
            description:
              "Milestone birthdays, anniversary dinners, and intimate gatherings crafted with personal touches that honor life's precious moments.",
            price: "Starting at $3,500",
            imageAlt:
              "Intimate private dinner party with elegant table setting and soft ambient lighting",
          },
          {
            title: "Non-Profit Galas",
            description:
              "Fundraising events that inspire generosity and community engagement. We understand the unique needs of charitable organizations and donor cultivation.",
            price: "Starting at $6,000",
            imageAlt:
              "Elegant charity gala with formal dinner setup and stage for presentations",
          },
          {
            title: "Destination Events",
            description:
              "Napa wine country weddings, tropical celebrations, and European villa gatherings. We coordinate travel, accommodations, and local vendor relationships.",
            price: "Starting at $15,000",
            imageAlt:
              "Elegant outdoor garden party with string lights and beautifully decorated tables",
          },
          {
            title: "Day-Of Coordination",
            description:
              "Already planned your event? Our day-of coordination ensures flawless execution. We manage the timeline, vendors, and any unexpected situations.",
            price: "Starting at $2,500",
            imageAlt:
              "Sophisticated cocktail party with elegant bar setup and professional bartenders",
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "Our Process"
    const processHeading = props.process?.heading ?? "How We Work"
    const processDesc =
      props.process?.description ??
      "A proven four-step approach that ensures every event exceeds expectations while respecting your time and vision."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discovery",
            description:
              "We begin with an in-depth consultation to understand your vision, preferences, budget, and the feeling you want to create. This is where the magic begins.",
          },
          {
            title: "Design",
            description:
              "Our creative team develops a comprehensive concept including mood boards, color palettes, venue recommendations, and vendor selections tailored to your story.",
          },
          {
            title: "Planning",
            description:
              "We handle all logistics: contract negotiations, timeline creation, RSVP management, and coordination meetings. You stay informed without the stress.",
          },
          {
            title: "Execution",
            description:
              "On the big day, we manage every detail from setup to breakdown. You simply enjoy the moment while we ensure everything unfolds perfectly.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Portfolio"
    const galleryHeading = props.gallery?.heading ?? "Recent Events"
    const galleryDesc =
      props.gallery?.description ??
      "A glimpse into celebrations we've crafted for clients who trusted us with their most important moments."
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "Garden wedding ceremony with white rose arch and guests seated on lawn at sunset",
          "Elegant place setting with gold flatware and white linen at formal dinner",
          "Luxury corporate gala with dramatic uplighting and decorated tables",
          "Intimate candlelit dinner party with elegant floral centerpieces",
          "Beach wedding ceremony with ocean backdrop and flowing white fabric arch",
          "Beautiful wedding cake with white frosting and fresh flowers on decorated table",
          "Outdoor reception tent with elegant lighting and decorated tables at twilight",
          "Elegant ballroom wedding reception with crystal chandeliers and long dining tables",
        ]
    const galleryWide = props.gallery?.wideImages?.length
      ? props.gallery.wideImages
      : [
          "Live band performing at elegant wedding reception with dancing guests",
          "Rustic barn wedding reception with string lights and wooden tables",
          "Champagne tower celebration at luxury corporate event",
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Investment"
    const pricingHeading = props.pricing?.heading ?? "Planning Packages"
    const pricingDesc =
      props.pricing?.description ??
      "Transparent pricing for weddings and celebrations. Custom quotes available for corporate and destination events."
    const pricingPopular = props.pricing?.popularLabel ?? "Most Popular"
    const pricingCta = props.pricing?.cta ?? "Inquire"
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Essential",
            tagline: "Day-of coordination",
            price: "$2,500",
            features: [
              "One month of pre-event support",
              "Day-of timeline creation",
              "Vendor coordination",
              "On-site management (10 hours)",
              "Setup and breakdown oversight",
            ],
          },
          {
            name: "Signature",
            tagline: "Partial planning",
            price: "$5,500",
            popular: true,
            features: [
              "Everything in Essential, plus:",
              "Six months of planning support",
              "Vendor recommendations & referrals",
              "Design concept & mood board",
              "Two venue walkthroughs",
              "Rehearsal coordination",
            ],
          },
          {
            name: "White Glove",
            tagline: "Full-service planning",
            price: "$12,000",
            features: [
              "Everything in Signature, plus:",
              "Full planning from day one",
              "Unlimited vendor meetings",
              "Custom design & décor sourcing",
              "Guest management & RSVP tracking",
              "Dedicated lead planner + assistant",
            ],
          },
        ]

    const statsEyebrow = props.stats?.eyebrow ?? "Our Impact"
    const statsHeading =
      props.stats?.heading ?? "Numbers That Tell Our Story"
    const statsDesc =
      props.stats?.description ??
      "Twelve years of creating extraordinary events has taught us that the best measure of success is the joy we bring to our clients. These numbers reflect our commitment to excellence and the trust placed in us."
    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "500+", label: "Events Executed" },
          { value: "98%", label: "Client Satisfaction" },
          { value: "85%", label: "Referral Rate" },
          { value: "$12M", label: "Event Budgets Managed" },
        ]
    const statsImageAlts = props.stats?.imageAlts?.length
      ? props.stats.imageAlts
      : [
          "Happy bride and groom dancing at wedding reception with guests",
          "Wedding ceremony aisle decorated with white flowers and petals",
          "Couple exchanging vows at outdoor beach wedding",
          "Elegant table setting with candles and floral arrangement",
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading = props.testimonials?.heading ?? "Client Love"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from couples and organizations who trusted us with their most important celebrations."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Serene Events made our wedding day absolutely perfect. Sarah and her team thought of every detail we never even considered. Our guests are still talking about how beautiful everything was. Worth every penny!",
            name: "Rebecca Martinez",
            role: "Wedding at Napa Valley, June 2024",
            avatarAlt:
              "Professional headshot of Rebecca Martinez, marketing director and newlywed",
          },
          {
            quote:
              "Our company's 25th anniversary gala was flawless thanks to Serene Events. They handled everything from venue selection to entertainment booking. Our board was incredibly impressed with the professionalism.",
            name: "David Chen",
            role: "CEO, Meridian Technologies",
            avatarAlt: "Professional headshot of David Chen, technology CEO",
          },
          {
            quote:
              "We hired Serene Events for my parents' 50th anniversary dinner, and it exceeded all expectations. The venue, the décor, the menu—everything was exactly what Mom dreamed of. Thank you for making it magical!",
            name: "Jennifer Park",
            role: "50th Anniversary Celebration",
            avatarAlt:
              "Professional headshot of Jennifer Park, event coordinator and daughter of anniversary couple",
          },
          {
            quote:
              "As a nonprofit, we needed an event planner who understood our budget constraints while delivering a gala that felt luxurious. Serene Events struck the perfect balance. We raised 40% more than our goal!",
            name: "Margaret Sullivan",
            role: "Executive Director, Bay Arts Foundation",
            avatarAlt:
              "Professional headshot of Margaret Sullivan, nonprofit executive director",
          },
          {
            quote:
              "Destination weddings are stressful, but Sarah made our Tuscany wedding feel effortless. She coordinated with Italian vendors seamlessly and was available at every hour. Best decision we made!",
            name: "Alexandra Rivera",
            role: "Destination Wedding, Tuscany",
            avatarAlt:
              "Professional headshot of Alexandra Rivera, newlywed",
          },
          {
            quote:
              "We used Serene Events for our product launch at CES. The turnout was incredible, media coverage exceeded expectations, and our team could focus on demos instead of logistics. Already booked them for next year!",
            name: "Ryan Kim",
            role: "CEO, Voltex Robotics",
            avatarAlt:
              "Professional headshot of Ryan Kim, startup founder and CEO",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about working with Serene Events."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How far in advance should we book your services?",
            answer:
              "For weddings, we recommend booking 12-18 months in advance, especially for peak season (May-October). For corporate events and private celebrations, 3-6 months is typically sufficient, though more lead time gives us greater flexibility with premium venues and vendors.",
          },
          {
            question: "Do you work with clients outside of San Francisco?",
            answer:
              "Absolutely! While we're based in San Francisco, we regularly plan events throughout California, including Napa Valley, Sonoma, Carmel, and Lake Tahoe. We also specialize in destination events across the US and internationally, with particular expertise in Italy, Mexico, and the Caribbean.",
          },
          {
            question: "Can you work within our specific budget?",
            answer:
              "Yes, we pride ourselves on creating exceptional events across various budgets. During our initial consultation, we'll discuss your priorities and help allocate your budget strategically. We have strong relationships with vendors at different price points and know where to splurge and where to save without compromising on quality or experience.",
          },
          {
            question: "What's included in the planning packages?",
            answer:
              "Each package includes different levels of support, detailed in our pricing section above. Generally, our services cover vendor recommendations and negotiations, timeline creation, design concept development, RSVP management, rehearsal coordination, and on-site event management. Premium packages include additional services like custom design sourcing and dedicated assistants.",
          },
          {
            question: "Do you handle vendor payments and contracts?",
            answer:
              "We facilitate vendor introductions, review contracts for industry-standard terms, and negotiate on your behalf when appropriate. However, all contracts are signed directly between you and the vendor, and payments are made directly to vendors. This ensures transparency and that you maintain direct relationships with the talented professionals making your event special.",
          },
          {
            question: "What happens if there's an emergency on the event day?",
            answer:
              "This is where our experience truly shines. We arrive prepared with backup plans for common scenarios—vendor no-shows, weather changes, equipment failures—and maintain relationships with emergency vendors who can respond quickly. Our team includes contingency planning in every timeline, and we're trained to handle challenges calmly while keeping you blissfully unaware of any hiccups.",
          },
          {
            question: "How do we get started?",
            answer:
              "Simply fill out our inquiry form below or call us at (415) 555-0147. We'll schedule a complimentary 30-minute consultation to discuss your vision, date, and needs. From there, we'll provide a custom proposal outlining our recommended package and approach for your specific event. No pressure, no obligation—just an opportunity to see if we're the right fit.",
          },
        ]

    const contactEyebrow = props.contact?.eyebrow ?? "Start Your Journey"
    const contactHeading =
      props.contact?.heading ?? "Let's Create Something Beautiful"
    const contactDesc =
      props.contact?.description ??
      "Ready to begin planning your perfect event? We'd love to hear about your vision. Fill out the inquiry form and we'll be in touch within 24 hours to schedule your complimentary consultation."
    const contactEmail = props.contact?.email ?? "hello@sereneevents.com"
    const contactPhone = props.contact?.phone ?? "(415) 555-0147"
    const contactAddress =
      props.contact?.address ??
      "580 Market Street, Suite 800, San Francisco, CA 94104"
    const eventTypes = props.contact?.eventTypes?.length
      ? props.contact.eventTypes
      : [
          "Select an event type",
          "Wedding",
          "Corporate Event",
          "Private Celebration",
          "Non-Profit Gala",
          "Destination Event",
        ]
    const guestRanges = props.contact?.guestRanges?.length
      ? props.contact.guestRanges
      : [
          "Select range",
          "1-50 guests",
          "51-100 guests",
          "101-150 guests",
          "151-200 guests",
          "200+ guests",
        ]
    const contactSubmit = props.contact?.submit ?? "Send Inquiry"

    const footerTagline =
      props.footer?.tagline ??
      "Creating unforgettable moments with elegance, precision, and heart since 2012."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Services",
            links: [
              "Wedding Planning",
              "Corporate Events",
              "Private Celebrations",
              "Destination Events",
            ],
          },
          {
            title: "Company",
            links: ["Portfolio", "Testimonials", "Our Process", "FAQ"],
          },
          {
            title: "Connect",
            links: ["Instagram", "Pinterest", "LinkedIn", "Contact Us"],
          },
        ]
    const footerLegal =
      props.footer?.legal ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service"]

    const Clock = ({ className }: { className?: string }) => (
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
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
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

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

    const Chevron = () => (
      <svg
        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav
              className="flex h-20 items-center justify-between"
              aria-label="Main navigation"
            >
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <Clock className="size-8 text-foreground/80" />
                <span className="text-xl font-light tracking-tight text-foreground">
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
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Book Consultation
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
            </nav>
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
          <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-32 lg:pt-48">
            <div className="mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="order-2 lg:order-1">
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-light leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-full border border-border px-8 py-4 font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-12 flex items-center gap-8 border-t border-border pt-8">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-3xl font-light text-foreground">
                          {s.value}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={1000}
                      className="h-[500px] w-full rounded-2xl object-cover lg:h-[700px]"
                    />
                    <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl bg-card p-6 shadow-xl">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {heroAvatars.map((alt) => (
                            <Image
                              key={alt}
                              alt={alt}
                              w={100}
                              h={100}
                              className="size-10 rounded-full border-2 border-card object-cover"
                            />
                          ))}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-card-foreground">
                            {heroCardTitle}
                          </p>
                          <p className="text-muted-foreground">
                            {heroCardRole}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm italic text-muted-foreground">
                        &ldquo;{heroCardQuote}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm uppercase tracking-widest text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 lg:gap-20">
                {logoBrands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => go(b)}
                    className="text-xl font-light text-foreground"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {servicesEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {serviceItems.map((item) => (
                  <article key={item.title} className="group">
                    <div className="mb-6 aspect-[4/3] overflow-hidden rounded-xl">
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.price}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {processEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
                  {processHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{processDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-light text-primary-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {i < processSteps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 hidden h-px w-full -translate-y-1/2 bg-border lg:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {galleryEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {galleryImages.map((alt, i) => (
                  <button
                    key={alt}
                    type="button"
                    onClick={() => go(galleryHeading)}
                    className="overflow-hidden rounded-xl"
                  >
                    <Image
                      alt={alt}
                      w={400}
                      h={i % 2 === 0 ? 600 : 400}
                      loading="lazy"
                      className={cn(
                        "w-full object-cover transition-transform duration-500 hover:scale-105",
                        i % 2 === 0
                          ? "h-64 lg:h-80"
                          : "h-48 lg:h-56",
                      )}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                {galleryWide.map((alt, i) => (
                  <button
                    key={alt}
                    type="button"
                    onClick={() => go(galleryHeading)}
                    className={cn(
                      "overflow-hidden rounded-xl",
                      i === 2 && "col-span-2 lg:col-span-1",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105 lg:h-64"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {pricingEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {pricingTiers.map((tier) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8 lg:p-10",
                      tier.popular
                        ? "bg-primary shadow-xl"
                        : "bg-card shadow-sm",
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-2xl bg-muted px-3 py-1 text-xs font-medium text-foreground">
                        {pricingPopular}
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-xl font-medium",
                        tier.popular
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6",
                        tier.popular
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.tagline}
                    </p>
                    <p
                      className={cn(
                        "mb-8 text-4xl font-light",
                        tier.popular
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {tier.price}
                    </p>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              tier.popular
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground",
                            )}
                          />
                          <span
                            className={cn(
                              tier.popular
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground",
                            )}
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${pricingCta} ${tier.name}`)}
                      className={cn(
                        "block w-full rounded-full px-6 py-3 text-center font-medium transition-colors",
                        tier.popular
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {pricingCta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats / Impact */}
          <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {statsEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
                    {statsHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {statsDesc}
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    {statsItems.map((s) => (
                      <div key={s.label}>
                        <p className="text-4xl font-light text-foreground lg:text-5xl">
                          {s.value}
                        </p>
                        <p className="mt-1 text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Image
                      alt={statsImageAlts[0]}
                      w={400}
                      h={500}
                      loading="lazy"
                      className="h-64 w-full rounded-xl object-cover"
                    />
                    <Image
                      alt={statsImageAlts[1]}
                      w={400}
                      h={350}
                      loading="lazy"
                      className="h-48 w-full rounded-xl object-cover"
                    />
                  </div>
                  <div className="space-y-4 pt-8">
                    <Image
                      alt={statsImageAlts[2]}
                      w={400}
                      h={350}
                      loading="lazy"
                      className="h-48 w-full rounded-xl object-cover"
                    />
                    <Image
                      alt={statsImageAlts[3]}
                      w={400}
                      h={500}
                      loading="lazy"
                      className="h-64 w-full rounded-xl object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {testimonialsEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
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
                        <p className="font-medium text-card-foreground">
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

          {/* FAQ */}
          <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-4xl">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-6">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl bg-muted p-6"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4">
                      <h3 className="text-lg font-medium text-foreground">
                        {item.question}
                      </h3>
                      <Chevron />
                    </summary>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-primary px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
                    {contactEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-light text-primary-foreground sm:text-4xl lg:text-5xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                    {contactDesc}
                  </p>
                  <div className="space-y-4 text-primary-foreground/80">
                    <button
                      type="button"
                      onClick={() => go(contactEmail)}
                      className="flex items-center gap-4 text-left transition-colors hover:text-primary-foreground"
                    >
                      <svg
                        className="size-5 text-primary-foreground/70"
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
                      <span>{contactEmail}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(contactPhone)}
                      className="flex items-center gap-4 text-left transition-colors hover:text-primary-foreground"
                    >
                      <svg
                        className="size-5 text-primary-foreground/70"
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
                      <span>{contactPhone}</span>
                    </button>
                    <div className="flex items-center gap-4">
                      <svg
                        className="size-5 shrink-0 text-primary-foreground/70"
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
                      <span>{contactAddress}</span>
                    </div>
                  </div>
                </div>
                <form
                  className="rounded-2xl bg-card p-8 lg:p-10"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(contactSubmit)
                  }}
                >
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ep-first"
                          className="mb-2 block text-sm font-medium text-card-foreground"
                        >
                          First Name
                        </label>
                        <input
                          id="ep-first"
                          type="text"
                          required
                          placeholder="Jane"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="ep-last"
                          className="mb-2 block text-sm font-medium text-card-foreground"
                        >
                          Last Name
                        </label>
                        <input
                          id="ep-last"
                          type="text"
                          required
                          placeholder="Smith"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="ep-email"
                        className="mb-2 block text-sm font-medium text-card-foreground"
                      >
                        Email Address
                      </label>
                      <input
                        id="ep-email"
                        type="email"
                        required
                        placeholder="jane@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ep-type"
                        className="mb-2 block text-sm font-medium text-card-foreground"
                      >
                        Event Type
                      </label>
                      <select
                        id="ep-type"
                        required
                        className={cn(inputCls, "appearance-none")}
                      >
                        {eventTypes.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ep-date"
                          className="mb-2 block text-sm font-medium text-card-foreground"
                        >
                          Event Date
                        </label>
                        <input id="ep-date" type="date" className={inputCls} />
                      </div>
                      <div>
                        <label
                          htmlFor="ep-guests"
                          className="mb-2 block text-sm font-medium text-card-foreground"
                        >
                          Guest Count
                        </label>
                        <select
                          id="ep-guests"
                          className={cn(inputCls, "appearance-none")}
                        >
                          {guestRanges.map((opt) => (
                            <option key={opt} className="bg-background">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="ep-message"
                        className="mb-2 block text-sm font-medium text-card-foreground"
                      >
                        Tell Us About Your Vision
                      </label>
                      <textarea
                        id="ep-message"
                        rows={4}
                        placeholder="Share details about your dream event, preferred style, venues you're considering, or any questions you have..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {contactSubmit}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <div className="lg:col-span-1">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="size-8 text-background/60" />
                  <span className="text-xl font-light text-background">
                    {brand}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-background/60">
                  {footerTagline}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-background/60 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">{footerLegal}</p>
              <div className="flex gap-6">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-background/50 transition-colors hover:text-background"
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
