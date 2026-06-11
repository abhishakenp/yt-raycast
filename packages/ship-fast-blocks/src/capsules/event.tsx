import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * EventKimiPage — a complete, self-contained CONFERENCE / EVENT landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "DesignFront 2024" design: a
 * clean, editorial light aesthetic on a neutral canvas with a crisp foreground
 * brand mark, generous whitespace, and rounded cards. It pairs a centered hero
 * (date/location eyebrow, big headline, dual CTAs, inline event-stat strip)
 * with a trusted-by logo strip, a 6-up "everything you get" feature grid, a
 * speaker grid with headshots, a two-column day-by-day agenda, a dark photo
 * highlights gallery, a 3-tier ticket pricing block, a venue split with photo
 * collage, an attendee-testimonial grid, an FAQ accordion, a final CTA band,
 * and a rich multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and surfaces. Colors map
 * to semantic theme tokens only (no palette/hex), so it is theme-injectable.
 * Every nav item / CTA / link / social / form-submit routes through
 * `useNavigate` (never a dead "#"), and the navbar labels match the `nav`
 * array so PageSwitch can swap pages. All imagery (speaker headshots, gallery,
 * venue, attendee avatars) uses the alt-driven <Image> component. Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const EventKimiPage = defineCapsule({
  name: "EventKimiPage",
  description:
    "Complete CONFERENCE / EVENT landing page with a clean, editorial light aesthetic: neutral canvas, crisp foreground brand mark, generous whitespace and rounded cards. Includes a centered hero (date + city eyebrow, bold headline, dual register/agenda CTAs, inline attendee/speaker/hours stat strip), a trusted-by sponsor logo strip, a 6-up 'everything you get' feature grid with icons, a speaker grid with headshots and bios, a two-column day-by-day session agenda timeline, a dark photo highlights gallery, a 3-tier ticket pricing table (Early Bird / Regular most-popular / VIP) with checklist features, a venue spotlight split with address details and a photo collage, a star-rated attendee testimonial grid, an FAQ accordion, a final register CTA band, and a rich multi-column footer with social links. Use as the ROOT/home page for tech conferences, summits, meetups, workshops, festivals, webinars, hackathons, product launches, or any ticketed event when a polished, conversion-focused page covering agenda, speakers, venue, tickets and FAQ is wanted. Supply content only — brand, nav, hero, features, speakers, agenda, gallery, tickets, venue, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / event name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Inline event-stat strip beneath the hero copy. */
        stats: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by sponsor/company logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Everything you get" feature grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Featured speakers grid. */
    speakers: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Day-by-day agenda timeline. */
    agenda: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        days: z
          .array(
            z.object({
              dayNum: z.string(),
              title: z.string(),
              subtitle: z.string(),
              sessions: z.array(
                z.object({
                  time: z.string(),
                  title: z.string(),
                  detail: z.string(),
                }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark photo highlights gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Ticket pricing tiers. */
    tickets: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        noteLink: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              availability: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              excluded: z.array(z.string()).optional(),
              cta: z.string(),
              featured: z.boolean().optional(),
              soldOut: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Venue spotlight split. */
    venue: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        collage: z.array(z.string()).optional(),
        details: z
          .array(z.object({ title: z.string(), text: z.string() }))
          .optional(),
      })
      .optional(),
    /** Attendee testimonial grid. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Final CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        emailLabel: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        note: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        contacts: z.array(z.string()).optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "DesignFront"
    const nav = props.nav?.length
      ? props.nav
      : ["Agenda", "Speakers", "Venue", "Tickets"]

    const heroEyebrow =
      props.hero?.eyebrow ?? "September 12–13, 2024 • San Francisco"
    const heroHeadingTop = props.hero?.headingTop ?? "Where design meets"
    const heroHeadingBottom =
      props.hero?.headingBottom ?? "engineering excellence"
    const heroSub =
      props.hero?.subheading ??
      "Join 800+ product designers, frontend engineers, and creative technologists for two days of practical workshops, inspiring talks, and meaningful connections."
    const heroPrimary = props.hero?.primaryCta ?? "Register Now — From $449"
    const heroSecondary = props.hero?.secondaryCta ?? "View Full Agenda"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : ["800+ Attendees", "24 Speakers", "16+ Hours of Content"]

    const logosLabel =
      props.logos?.label ?? "Trusted by teams at leading companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Vercel", "Notion", "Linear", "Figma", "Stripe", "Shopify"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to level up"
    const featuresDesc =
      props.features?.description ??
      "Two packed days of learning, networking, and hands-on experiences designed for modern product teams."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Expert-Led Sessions",
            description:
              "Learn from industry leaders at Vercel, Figma, Linear, and more. Every talk is carefully curated for practical takeaways.",
          },
          {
            title: "Intimate Networking",
            description:
              "Connect with peers during curated networking sessions, evening socials, and structured breakfast meetups.",
          },
          {
            title: "Hands-On Workshops",
            description:
              "Deep-dive workshops on React Server Components, design systems, accessibility, and advanced CSS techniques.",
          },
          {
            title: "Exclusive Swag",
            description:
              "Premium conference kit including limited edition apparel, stickers, notebooks, and tools from our sponsors.",
          },
          {
            title: "Amazing Venue",
            description:
              "Experience the historic Palace of Fine Arts, with stunning architecture and outdoor spaces perfect for breaks.",
          },
          {
            title: "Closing Party",
            description:
              "Celebrate with fellow attendees at our exclusive Friday evening party featuring live music, food, and drinks.",
          },
        ]

    const speakersHeading = props.speakers?.heading ?? "Featured Speakers"
    const speakersDesc =
      props.speakers?.description ??
      "Learn from the engineers and designers shaping the future of web development."
    const speakersViewAll = props.speakers?.viewAll ?? "View full agenda"
    const speakerItems = props.speakers?.items?.length
      ? props.speakers.items
      : [
          {
            name: "Sarah Chen",
            role: "Design Systems Lead",
            bio: 'Previously led design systems at Airbnb and Pinterest. Author of "Scaling Design Systems."',
          },
          {
            name: "Marcus Rodriguez",
            role: "Frontend Architect",
            bio: "Core contributor to React and Next.js. Previously engineering lead at Vercel.",
          },
          {
            name: "Emily Watson",
            role: "VP of Product Design",
            bio: "Leading design at Linear. Previously built design teams at Dropbox and Figma.",
          },
          {
            name: "David Park",
            role: "Staff Engineer",
            bio: "Web performance expert at Shopify. Created widely-adopted performance tooling.",
          },
          {
            name: "James Mitchell",
            role: "Design Engineering",
            bio: "Pioneering design-to-code workflows at Framer. Formerly at Apple Special Projects.",
          },
          {
            name: "Priya Sharma",
            role: "Accessibility Lead",
            bio: "Accessibility advocate at Microsoft. W3C contributor and conference keynote speaker.",
          },
          {
            name: "Alex Thompson",
            role: "Creative Developer",
            bio: "Award-winning creative technologist. Awwwards Site of the Day x12 recipient.",
          },
          {
            name: "Lisa Nakamura",
            role: "UX Research Director",
            bio: "Leading user research at Notion. Stanford HCI PhD, published researcher.",
          },
        ]

    const agendaHeading = props.agenda?.heading ?? "Conference Agenda"
    const agendaDesc =
      props.agenda?.description ??
      "Two days packed with insights, workshops, and networking opportunities."
    const agendaDays = props.agenda?.days?.length
      ? props.agenda.days
      : [
          {
            dayNum: "12",
            title: "Thursday, September 12",
            subtitle: "Day One — Foundations & Strategy",
            sessions: [
              {
                time: "8:00",
                title: "Registration & Breakfast",
                detail: "Pick up your badge and enjoy coffee with fellow attendees",
              },
              {
                time: "9:30",
                title: "Opening Keynote: The Future of Frontend",
                detail: "Marcus Rodriguez — Main Stage",
              },
              {
                time: "10:30",
                title: "Building Scalable Design Systems",
                detail: "Sarah Chen — Theater A",
              },
              {
                time: "11:30",
                title: "Coffee Break",
                detail: "Networking in the Exhibition Hall",
              },
              {
                time: "12:00",
                title: "Accessible Design for Everyone",
                detail: "Priya Sharma — Theater B",
              },
              {
                time: "1:00",
                title: "Lunch & Networking",
                detail: "Catered lunch with vegetarian, vegan, and gluten-free options",
              },
              {
                time: "2:30",
                title: "Workshop: React Server Components",
                detail: "Marcus Rodriguez — Workshop Room 1",
              },
              {
                time: "4:00",
                title: "Panel: Design/Dev Collaboration",
                detail: "Multiple speakers — Main Stage",
              },
              {
                time: "5:30",
                title: "Day One Closing",
                detail: "Lightning talks from community members",
              },
            ],
          },
          {
            dayNum: "13",
            title: "Friday, September 13",
            subtitle: "Day Two — Advanced & Practical",
            sessions: [
              {
                time: "8:30",
                title: "Breakfast Meetups",
                detail: "Topic-based tables for focused networking",
              },
              {
                time: "9:30",
                title: "Designing for Delight",
                detail: "Emily Watson — Main Stage",
              },
              {
                time: "10:30",
                title: "Web Performance Masterclass",
                detail: "David Park — Theater A",
              },
              {
                time: "11:30",
                title: "Coffee & Sponsor Demos",
                detail: "Explore the latest tools in the Exhibition Hall",
              },
              {
                time: "12:00",
                title: "Creative Coding in Production",
                detail: "Alex Thompson — Theater B",
              },
              {
                time: "1:00",
                title: "Lunch",
                detail: "Food trucks in the courtyard",
              },
              {
                time: "2:30",
                title: "Workshop: Advanced CSS",
                detail: "James Mitchell — Workshop Room 1",
              },
              {
                time: "4:00",
                title: "Research-Driven Design",
                detail: "Lisa Nakamura — Theater A",
              },
              {
                time: "5:00",
                title: "Closing Keynote & Party",
                detail: "Main Stage followed by evening celebration",
              },
            ],
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Last Year's Highlights"
    const galleryDesc =
      props.gallery?.description ??
      "A glimpse of what awaits you at DesignFront 2024."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "Conference attendees watching a presentation in a large theater with stage lighting",
          "Speaker on stage presenting to a large audience at a tech conference",
          "Conference attendees networking during a coffee break in a modern venue",
          "Workshop session with participants collaborating around laptops at tables",
          "Evening social event with attendees mingling under string lights",
          "Palace of Fine Arts dome architecture in San Francisco venue exterior",
        ]

    const ticketsHeading = props.tickets?.heading ?? "Get Your Ticket"
    const ticketsDesc =
      props.tickets?.description ??
      "Choose the pass that works for you. All tickets include full access to sessions, meals, and the closing party."
    const ticketsNote =
      props.tickets?.note ??
      "Group discounts available for 5+ tickets. Contact us for team packages."
    const ticketsNoteLink = props.tickets?.noteLink ?? "Contact us"
    const ticketTiers = props.tickets?.tiers?.length
      ? props.tickets.tiers
      : [
          {
            name: "Early Bird",
            availability: "Available until July 31",
            price: "$449",
            unit: "/person",
            features: [
              "Both days of sessions",
              "Breakfast & lunch included",
              "Conference swag kit",
              "Closing party access",
            ],
            excluded: ["Workshop access"],
            cta: "Sold Out",
            soldOut: true,
          },
          {
            name: "Regular",
            availability: "August 1 – September 10",
            price: "$649",
            unit: "/person",
            features: [
              "Both days of sessions",
              "Breakfast & lunch included",
              "Conference swag kit",
              "Closing party access",
            ],
            excluded: ["Workshop access"],
            cta: "Get Ticket",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "VIP + Workshop",
            availability: "Limited to 50 attendees",
            price: "$899",
            unit: "/person",
            features: [
              "Everything in Regular",
              "Workshop seat (choose one)",
              "VIP lounge access",
              "Speaker meet & greet",
              "Premium swag bundle",
            ],
            cta: "Get VIP Pass",
          },
        ]

    const venueHeading = props.venue?.heading ?? "Palace of Fine Arts"
    const venueDesc =
      props.venue?.description ??
      "Join us at one of San Francisco's most iconic venues. The Palace of Fine Arts offers stunning Beaux-Arts architecture, beautiful grounds for networking breaks, and world-class facilities for our technical sessions."
    const venueImageAlt =
      props.venue?.imageAlt ??
      "Palace of Fine Arts dome and columns with reflecting pond in San Francisco"
    const venueCollage = props.venue?.collage?.length
      ? props.venue.collage
      : [
          "Interior of Palace of Fine Arts theater with ornate architecture",
          "Outdoor courtyard at Palace of Fine Arts with columns and gardens",
          "San Francisco marina view near the conference venue at golden hour",
        ]
    const venueDetails = props.venue?.details?.length
      ? props.venue.details
      : [
          {
            title: "Address",
            text: "3601 Lyon Street, San Francisco, CA 94123",
          },
          {
            title: "Getting There",
            text: "Free shuttle from Embarcadero BART. Parking available on-site.",
          },
          {
            title: "Hotels",
            text: "Special rates at nearby hotels. Details sent with ticket confirmation.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Attendees Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from past DesignFront attendees about their experience."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The quality of speakers and workshops was exceptional. I learned practical skills I could apply to my work immediately. Already registered for 2024!",
            name: "Rachel Kim",
            role: "Senior Product Designer at Figma",
            avatarAlt:
              "Professional headshot of a smiling woman with long brown hair",
          },
          {
            quote:
              "The React Server Components workshop alone was worth the ticket price. Marcus is an incredible teacher. Highly recommend the VIP pass for workshop access.",
            name: "Tom Bradley",
            role: "Frontend Engineer at Stripe",
            avatarAlt:
              "Professional headshot of a man with short hair and light stubble",
          },
          {
            quote:
              "As a solo founder, the networking opportunities were invaluable. I met my current design contractor at the breakfast meetups. The venue is absolutely stunning too!",
            name: "Diego Santos",
            role: "Founder at DesignLab",
            avatarAlt:
              "Professional headshot of a man with dark hair and warm smile",
          },
          {
            quote:
              "The accessibility session with Priya changed how I approach design. I brought back actionable insights that improved our product's WCAG compliance within weeks.",
            name: "Amara Okafor",
            role: "UX Lead at Notion",
            avatarAlt:
              "Professional headshot of a woman with dark curly hair and bright smile",
          },
          {
            quote:
              "DesignFront is now a must-attend for our entire product team. We send 8 people every year because the ROI on team alignment and skills development is incredible.",
            name: "Michael Chen",
            role: "VP Product at Linear",
            avatarAlt:
              "Professional headshot of a man in a suit with confident expression",
          },
          {
            quote:
              "First tech conference where I felt genuinely welcome as a junior developer. The community is incredibly supportive and I left with 20+ new LinkedIn connections.",
            name: "Sophie Williams",
            role: "Junior Developer at Vercel",
            avatarAlt:
              "Professional headshot of a young woman with red hair and freckles",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about attending DesignFront 2024."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What's included in my ticket?",
            a: "All tickets include access to both days of sessions, breakfast and lunch on both days, the closing party, conference swag, and coffee breaks. VIP tickets additionally include workshop access, VIP lounge, and speaker meet & greet.",
          },
          {
            q: "Can I get a refund if I can't attend?",
            a: "Yes, full refunds are available until August 15, 2024. After that date, tickets are transferable to another attendee but non-refundable. Contact us at tickets@designfront.io to request a refund or transfer.",
          },
          {
            q: "Are workshops included in the Regular ticket?",
            a: "Workshops are only included with the VIP ticket. Regular ticket holders can attend all main stage and theater sessions. VIP tickets are limited to 50 attendees to ensure an intimate workshop experience.",
          },
          {
            q: "Is there a code of conduct?",
            a: "Absolutely. DesignFront is committed to providing a safe, inclusive environment for all attendees. All participants, speakers, and staff must adhere to our code of conduct. Violations can result in removal without refund.",
          },
          {
            q: "Will sessions be recorded?",
            a: "Main stage sessions will be recorded and made available to all attendees within two weeks after the conference. Workshops and theater sessions are not recorded to encourage open discussion and participation.",
          },
          {
            q: "Do you offer student discounts?",
            a: "Yes! Students with a valid .edu email address can receive 40% off any ticket tier. Email students@designfront.io from your school email with proof of enrollment to receive your discount code.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to join us in San Francisco?"
    const ctaDesc =
      props.cta?.description ??
      "Early bird tickets sold out in 48 hours last year. Secure your spot at DesignFront 2024 before prices increase."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Your Ticket — $649"
    const ctaSecondary = props.cta?.secondaryCta ?? "Download Brochure"
    const ctaEmailLabel = props.cta?.emailLabel ?? "Questions? Email us at"
    const ctaEmail = props.cta?.email ?? "hello@designfront.io"

    const footerTagline =
      props.footer?.tagline ??
      "The premier conference for web designers and frontend engineers. San Francisco, September 12–13, 2024."
    const footerNote =
      props.footer?.note ?? "© 2024 DesignFront Conference. All rights reserved."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Conference",
            links: ["Speakers", "Agenda", "Venue", "Tickets", "Schedule (PDF)"],
          },
          {
            title: "Resources",
            links: [
              "Code of Conduct",
              "Accessibility",
              "Scholarships",
              "Sponsor Info",
              "Press Kit",
            ],
          },
        ]
    const footerContacts = props.footer?.contacts?.length
      ? props.footer.contacts
      : [
          "hello@designfront.io",
          "tickets@designfront.io",
          "sponsors@designfront.io",
          "3601 Lyon Street, San Francisco, CA 94123",
        ]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    // Brand mark tile — square with brand initials (decorative brand asset).
    const LogoMark = ({
      className,
      inverted,
    }: {
      className?: string
      inverted?: boolean
    }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg font-bold",
          inverted
            ? "bg-background text-foreground"
            : "bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
      >
        {brand.slice(0, 2).toUpperCase()}
      </span>
    )

    const ArrowRight = () => (
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
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    const CheckIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-primary"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const CrossIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted-foreground"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )

    const StarRow = () => (
      <div
        className="mb-4 flex items-center gap-1 text-primary"
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    const featureIcons: ReactNode[] = [
      // lightbulb
      <svg key="bulb" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
      </svg>,
      // people
      <svg key="people" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      // wrench
      <svg key="wrench" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4 2.6-2.6z" />
      </svg>,
      // gift
      <svg key="gift" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>,
      // building
      <svg key="building" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <line x1="9" y1="7" x2="10" y2="7" />
        <line x1="9" y1="11" x2="10" y2="11" />
        <line x1="14" y1="7" x2="15" y2="7" />
        <line x1="14" y1="11" x2="15" y2="11" />
      </svg>,
      // smiley / party
      <svg key="party" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>,
    ]

    const venueIcons: ReactNode[] = [
      // pin
      <svg key="pin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>,
      // clock
      <svg key="clock" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>,
      // bed / hotel
      <svg key="bed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 4v16" />
        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
        <path d="M2 17h20" />
        <path d="M6 8v9" />
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
          <nav
            className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-sm" />
                <span className="text-lg font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Tickets
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {heroHeadingTop}
                  <br className="hidden sm:block" /> {heroHeadingBottom}
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  {heroStats.map((stat) => (
                    <span key={stat}>{stat}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-12">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-lg font-semibold text-foreground transition-opacity hover:opacity-80"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="group">
                    <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Speakers */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {speakersHeading}
                  </h2>
                  <p className="max-w-xl text-lg text-muted-foreground">
                    {speakersDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(speakersViewAll)}
                  className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-muted-foreground"
                >
                  {speakersViewAll}
                  <ArrowRight />
                </button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {speakerItems.map((sp) => (
                  <button
                    key={sp.name}
                    type="button"
                    onClick={() => go(sp.name)}
                    className="group rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/40"
                  >
                    <Image
                      alt={`Professional headshot portrait of ${sp.name}, ${sp.role}`}
                      w={200}
                      h={200}
                      className="mb-4 size-20 rounded-full object-cover"
                    />
                    <h3 className="font-semibold text-card-foreground">
                      {sp.name}
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {sp.role}
                    </p>
                    <p className="text-sm text-muted-foreground">{sp.bio}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Agenda */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {agendaHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{agendaDesc}</p>
              </div>
              <div className="grid gap-12 lg:grid-cols-2">
                {agendaDays.map((day) => (
                  <div key={day.title}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-xl bg-foreground font-semibold text-background">
                        {day.dayNum}
                      </div>
                      <div>
                        <h3 className="font-semibold">{day.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {day.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {day.sessions.map((s) => (
                        <div
                          key={`${day.dayNum}-${s.time}-${s.title}`}
                          className="flex gap-4 rounded-xl border border-transparent p-4 transition-colors hover:border-border hover:bg-muted"
                        >
                          <span className="w-16 shrink-0 text-sm text-muted-foreground">
                            {s.time}
                          </span>
                          <div>
                            <h4 className="font-medium">{s.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {s.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-background/70">{galleryDesc}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((alt) => (
                  <div
                    key={alt}
                    className="aspect-[4/3] overflow-hidden rounded-xl"
                  >
                    <Image
                      alt={alt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tickets / Pricing */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {ticketsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{ticketsDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {ticketTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl bg-card p-8",
                      tier.featured
                        ? "border-2 border-foreground"
                        : "border border-border",
                    )}
                  >
                    {tier.badge ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                        {tier.badge}
                      </div>
                    ) : null}
                    <h3 className="mb-2 font-semibold text-card-foreground">
                      {tier.name}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {tier.availability}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-card-foreground">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground">{tier.unit}</span>
                    </div>
                    <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <CheckIcon />
                          {f}
                        </li>
                      ))}
                      {(tier.excluded ?? []).map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <CrossIcon />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {tier.soldOut ? (
                      <button
                        type="button"
                        disabled
                        className="w-full cursor-not-allowed rounded-lg bg-muted px-4 py-3 font-medium text-muted-foreground"
                      >
                        {tier.cta}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => go(tier.cta)}
                        className={cn(
                          "block w-full rounded-lg px-4 py-3 text-center font-medium transition-colors",
                          tier.featured
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-foreground text-background hover:bg-foreground/90",
                        )}
                      >
                        {tier.cta}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {ticketsNote.split(ticketsNoteLink)[0]}
                  <button
                    type="button"
                    onClick={() => go(ticketsNoteLink)}
                    className="text-foreground underline hover:no-underline"
                  >
                    {ticketsNoteLink}
                  </button>
                  {ticketsNote.split(ticketsNoteLink)[1] ?? ""}
                </p>
              </div>
            </div>
          </section>

          {/* Venue */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {venueHeading}
                  </h2>
                  <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                    {venueDesc}
                  </p>
                  <div className="mb-8 space-y-4">
                    {venueDetails.map((d, i) => (
                      <div key={d.title} className="flex items-start gap-4">
                        <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background text-foreground">
                          {venueIcons[i % venueIcons.length]}
                        </div>
                        <div>
                          <h4 className="font-medium">{d.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {d.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-[16/10] overflow-hidden rounded-2xl">
                    <Image
                      alt={venueImageAlt}
                      w={1000}
                      h={625}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {venueCollage.map((alt) => (
                      <div
                        key={alt}
                        className="aspect-square overflow-hidden rounded-xl"
                      >
                        <Image
                          alt={alt}
                          w={300}
                          h={300}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-6"
                  >
                    <StarRow />
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
          <section className="bg-muted py-20 lg:py-28">
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
                    className="group rounded-xl border border-border bg-card [&[open]]:border-primary/40"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-5">
                      <span className="font-medium text-card-foreground">
                        {item.q}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-8 py-4 text-lg font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                {ctaEmailLabel}{" "}
                <button
                  type="button"
                  onClick={() => go(ctaEmail)}
                  className="text-foreground underline hover:no-underline"
                >
                  {ctaEmail}
                </button>
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark inverted className="size-8 text-sm" />
                  <span className="text-lg font-semibold">{brand}</span>
                </button>
                <p className="mb-4 text-sm leading-relaxed text-background/70">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "LinkedIn", "YouTube"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-background/70 transition-colors hover:text-background"
                      >
                        {social === "Twitter" ? (
                          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ) : social === "LinkedIn" ? (
                          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        ) : (
                          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/70 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <h4 className="mb-4 font-semibold">Contact</h4>
                <ul className="space-y-2 text-sm text-background/70">
                  {footerContacts.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm text-background/60">{footerNote}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/60 transition-colors hover:text-background"
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
