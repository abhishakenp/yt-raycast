import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MusicFestivalKimiPage — a complete, self-contained multi-day MUSIC & ARTS
 * FESTIVAL landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "HORIZON FESTIVAL 2025"
 * design: a warm, sun-bleached desert aesthetic (sand canvas, charcoal ink,
 * warm-clay accent eyebrows) with big editorial type. It pairs a split hero
 * (date eyebrow + huge headline + KPI strip + festival photo with a floating
 * "early bird" price card), a partner logo strip, a lineup section (3
 * headliner photo cards + a 12-up featured-artist grid + "more artists"
 * button), an experience/features split (icon feature list + photo collage),
 * a 3-day schedule grid with timed set lists, a dark gallery band of past-
 * year photos, a 3-tier ticket/pricing block with add-ons, a dark stats band,
 * a 3-up starred testimonial grid with headshots, an FAQ accordion, a dark
 * closing CTA, and a 4-column footer with social icons.
 *
 * The block owns ALL layout, spacing, type hierarchy and depth. Surfaces use
 * semantic tokens only (sand→background, charcoal→foreground/primary,
 * warm-clay→primary accent, white cards→card, stone→border). Every nav item /
 * CTA / link / form-submit routes through `useNavigate` (never a dead "#").
 * All imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with
 * no props at all.
 */
export const MusicFestivalKimiPage = defineComponent({
  name: "MusicFestivalKimiPage",
  description:
    "Complete multi-day MUSIC & ARTS FESTIVAL landing page with a warm, sun-bleached desert editorial aesthetic: sand canvas, charcoal ink headlines, warm-clay accent eyebrows, big bold type and rounded photo cards. Includes a split hero (date eyebrow, huge headline, dual CTAs, attendees/artists/stages KPI strip, festival crowd photo with a floating early-bird price card), a partner/sponsor logo strip, a LINEUP section (three headliner photo cards with day labels plus a featured-artist grid and a 'more artists' button), an experience/features split (icon feature list: immersive art, curated dining, camping, wellness, with a desert photo collage), a three-day SCHEDULE grid with timed set lists per day, a dark photo GALLERY band of past-year memories, a three-tier TICKETS/pricing block (GA, GA+, VIP with a 'Most Popular' badge and feature checklists) plus camping add-ons, a dark stats band, a three-up starred TESTIMONIAL grid with headshots, an FAQ accordion, a dark closing CTA, and a four-column footer with social icons. Use as the ROOT/home page for music festivals, arts festivals, concert series, camping/desert events, raves, conferences-with-lineups, or any multi-day ticketed live event when a vibrant, photo-rich, conversion-focused page with lineup, schedule, tickets and social proof is wanted. Supply content only — brand, nav, hero, logos, lineup, experience, schedule, gallery, tickets, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Festival / brand name shown in the navbar and footer. */
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
        imageAlt: z.string().optional(),
        /** Inline KPI strip beneath the hero copy. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        /** Floating early-bird price card overlaid on the hero photo. */
        countdownLabel: z.string().optional(),
        countdownValue: z.string().optional(),
        priceLabel: z.string().optional(),
        priceValue: z.string().optional(),
      })
      .optional(),
    /** Partner / sponsor logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Lineup section: headliner photo cards + featured-artist grid. */
    lineup: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        headlinersLabel: z.string().optional(),
        headliners: z
          .array(
            z.object({
              day: z.string(),
              name: z.string(),
              genre: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
        featuredLabel: z.string().optional(),
        featured: z
          .array(z.object({ name: z.string(), genre: z.string() }))
          .optional(),
        more: z.string().optional(),
      })
      .optional(),
    /** Experience / features split. */
    experience: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        features: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Three-day schedule grid. */
    schedule: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        days: z
          .array(
            z.object({
              label: z.string(),
              name: z.string(),
              date: z.string(),
              items: z.array(
                z.object({
                  title: z.string(),
                  detail: z.string(),
                  time: z.string(),
                }),
              ),
              cta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark photo gallery band. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Tickets / pricing block. */
    tickets: z
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
              unit: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        addOnsLabel: z.string().optional(),
        addOns: z
          .array(z.object({ name: z.string(), price: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
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
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        socialLabel: z.string().optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "HORIZON"
    const nav = props.nav?.length
      ? props.nav
      : ["Lineup", "Experience", "Schedule", "Tickets", "FAQ"]

    const heroEyebrow = props.hero?.eyebrow ?? "August 15-17, 2025"
    const heroTop = props.hero?.headingTop ?? "Three days of"
    const heroBottom = props.hero?.headingBottom ?? "music & magic"
    const heroSub =
      props.hero?.subheading ??
      "Join 25,000 music lovers in the Mojave Desert for an unforgettable weekend featuring 80+ artists across four stages, immersive art installations, and camping under the stars."
    const heroPrimary = props.hero?.primaryCta ?? "Buy Tickets"
    const heroSecondary = props.hero?.secondaryCta ?? "View Lineup"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Festival crowd with raised hands silhouetted against orange sunset sky and stage lights"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "80+", label: "Artists" },
          { value: "4", label: "Stages" },
          { value: "25K", label: "Attendees" },
        ]
    const countdownLabel = props.hero?.countdownLabel ?? "Early Bird Ends In"
    const countdownValue = props.hero?.countdownValue ?? "47 days"
    const priceLabel = props.hero?.priceLabel ?? "Starting at"
    const priceValue = props.hero?.priceValue ?? "$249"

    const logosLabel = props.logos?.label ?? "Presented in partnership with"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["PITCHFORK", "SPOTIFY", "SONOS", "RED BULL", "BEATS", "VANS"]

    const lineupEyebrow = props.lineup?.eyebrow ?? "The Artists"
    const lineupHeading = props.lineup?.heading ?? "2025 Lineup"
    const lineupDesc =
      props.lineup?.description ??
      "Three days of unforgettable performances across four uniquely designed stages. From indie rock to electronic, hip-hop to folk — discover your next favorite artist."
    const headlinersLabel = props.lineup?.headlinersLabel ?? "Headliners"
    const headliners = props.lineup?.headliners?.length
      ? props.lineup.headliners
      : [
          {
            day: "Friday Headliner",
            name: "Arctic Monkeys",
            genre: "Indie Rock • UK",
            imageAlt:
              "Arctic Monkeys performing on stage with dramatic purple and blue lighting",
          },
          {
            day: "Saturday Headliner",
            name: "Tame Impala",
            genre: "Psychedelic Pop • Australia",
            imageAlt:
              "Tame Impala psychedelic light show with a silhouetted performer",
          },
          {
            day: "Sunday Headliner",
            name: "LCD Soundsystem",
            genre: "Dance-Punk • USA",
            imageAlt:
              "LCD Soundsystem live performance with a vocalist at the microphone",
          },
        ]
    const featuredLabel = props.lineup?.featuredLabel ?? "Featured Artists"
    const featured = props.lineup?.featured?.length
      ? props.lineup.featured
      : [
          { name: "Bon Iver", genre: "Folk" },
          { name: "Khruangbin", genre: "Psychedelic" },
          { name: "Rosalia", genre: "Flamenco Pop" },
          { name: "Fred Again..", genre: "Electronic" },
          { name: "Big Thief", genre: "Indie Folk" },
          { name: "Four Tet", genre: "Electronic" },
          { name: "FKA Twigs", genre: "Art Pop" },
          { name: "Parcels", genre: "Disco" },
          { name: "Caroline Polachek", genre: "Art Pop" },
          { name: "Jungle", genre: "Neo-Soul" },
          { name: "Beach House", genre: "Dream Pop" },
          { name: "Bicep", genre: "Electronic" },
        ]
    const lineupMore = props.lineup?.more ?? "+ 64 More Artists"

    const expEyebrow = props.experience?.eyebrow ?? "The Experience"
    const expHeading = props.experience?.heading ?? "More than just music"
    const expDesc =
      props.experience?.description ??
      "Horizon Festival is a complete sensory journey. Beyond the four stages, discover immersive art installations, curated food experiences, wellness programs, and a community that celebrates creativity in all its forms."
    const expFeatures = props.experience?.features?.length
      ? props.experience.features
      : [
          {
            title: "Immersive Art",
            description:
              "15 large-scale installations by renowned contemporary artists transform the desert landscape into a living gallery.",
          },
          {
            title: "Curated Dining",
            description:
              "40+ food vendors featuring local California cuisine, vegan options, and late-night snacks until 3am.",
          },
          {
            title: "Camping Community",
            description:
              "Choose from car camping, RV spots, or premium glamping tents. All campers get exclusive sunrise acoustic sets.",
          },
          {
            title: "Wellness Oasis",
            description:
              "Daily yoga, meditation sessions, and a dedicated chill zone with massage and sound healing.",
          },
        ]
    const expImageAlts = props.experience?.imageAlts?.length
      ? props.experience.imageAlts
      : [
          "Large-scale glowing art installation sphere in desert at night",
          "Festival camping area with colorful tents under starry desert sky",
          "Food truck serving gourmet tacos at an outdoor festival",
          "Group yoga session at sunrise in desert festival setting",
        ]

    const schedEyebrow = props.schedule?.eyebrow ?? "The Schedule"
    const schedHeading = props.schedule?.heading ?? "Festival Days"
    const schedDesc =
      props.schedule?.description ??
      "Gates open at 2:00 PM daily. Music runs from 3:00 PM to 1:00 AM on Friday and Saturday, until midnight on Sunday."
    const schedDays = props.schedule?.days?.length
      ? props.schedule.days
      : [
          {
            label: "Day 1",
            name: "Friday",
            date: "August 15, 2025",
            items: [
              { title: "Gates Open", detail: "Welcome to the desert", time: "2:00 PM" },
              { title: "Khruangbin", detail: "Sunset Stage", time: "6:30 PM" },
              { title: "Fred Again..", detail: "Electronic Oasis", time: "8:00 PM" },
              { title: "Arctic Monkeys", detail: "Main Stage", time: "10:00 PM" },
              { title: "Late Night Silent Disco", detail: "Campground", time: "12:00 AM" },
            ],
            cta: "View Full Friday Schedule",
          },
          {
            label: "Day 2",
            name: "Saturday",
            date: "August 16, 2025",
            items: [
              { title: "Sunrise Yoga", detail: "Wellness Oasis", time: "7:00 AM" },
              { title: "Caroline Polachek", detail: "Sunset Stage", time: "5:30 PM" },
              { title: "Rosalia", detail: "Main Stage", time: "7:30 PM" },
              { title: "Tame Impala", detail: "Main Stage", time: "9:30 PM" },
              { title: "Bicep DJ Set", detail: "Electronic Oasis", time: "11:30 PM" },
            ],
            cta: "View Full Saturday Schedule",
          },
          {
            label: "Day 3",
            name: "Sunday",
            date: "August 17, 2025",
            items: [
              { title: "Sound Healing", detail: "Wellness Oasis", time: "9:00 AM" },
              { title: "Big Thief", detail: "Sunset Stage", time: "4:30 PM" },
              { title: "Four Tet", detail: "Electronic Oasis", time: "6:30 PM" },
              { title: "LCD Soundsystem", detail: "Main Stage", time: "8:30 PM" },
              { title: "Closing Fireworks", detail: "Main Stage", time: "11:30 PM" },
            ],
            cta: "View Full Sunday Schedule",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Memories"
    const galleryHeading = props.gallery?.heading ?? "Horizon 2024"
    const galleryDesc =
      props.gallery?.description ??
      "Last year's magic. This year's memories are waiting to be made."
    const galleryAlts = props.gallery?.imageAlts?.length
      ? props.gallery.imageAlts
      : [
          "Festival main stage at night with colorful laser lights and a massive crowd",
          "Friends dancing together with arms raised at an outdoor music festival",
          "Aerial view of an illuminated ferris wheel at a music festival at dusk",
          "Concert crowd silhouettes against dramatic stage lighting and smoke",
          "Person on friends shoulders watching a sunset performance at a festival",
          "Neon art installation with people walking through at a night festival",
        ]

    const ticketsEyebrow = props.tickets?.eyebrow ?? "Tickets"
    const ticketsHeading = props.tickets?.heading ?? "Get Your Pass"
    const ticketsDesc =
      props.tickets?.description ??
      "All passes include three-day festival access, camping, and free water refill stations. Payment plans available."
    const ticketTiers = props.tickets?.tiers?.length
      ? props.tickets.tiers
      : [
          {
            name: "General Admission",
            tagline: "Full weekend access to all stages",
            price: "$349",
            unit: "/person",
            features: [
              "All 4 stages access",
              "Car camping included",
              "Free water stations",
              "Mobile app access",
            ],
            cta: "Buy GA Pass",
          },
          {
            name: "GA+",
            tagline: "Enhanced comfort & fast entry",
            price: "$549",
            unit: "/person",
            features: [
              "Everything in GA",
              "Fast lane entry",
              "Premium air-conditioned restrooms",
              "GA+ lounge access",
              "Complimentary lockers",
            ],
            cta: "Buy GA+ Pass",
            popular: true,
            badge: "Most Popular",
          },
          {
            name: "VIP",
            tagline: "The ultimate festival experience",
            price: "$899",
            unit: "/person",
            features: [
              "Everything in GA+",
              "VIP stage viewing areas",
              "Open bars (beer, wine, cocktails)",
              "Dedicated VIP entrance",
              "Commemorative laminate & poster",
            ],
            cta: "Buy VIP Pass",
          },
        ]
    const addOnsLabel = props.tickets?.addOnsLabel ?? "Add-Ons"
    const addOns = props.tickets?.addOns?.length
      ? props.tickets.addOns
      : [
          { name: "Car Camping", price: "+ $75/vehicle" },
          { name: "RV Camping", price: "+ $250/spot" },
          { name: "Glamping Tent", price: "+ $599 (2-person)" },
        ]

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "80+", label: "Artists Performing" },
          { value: "4", label: "Unique Stages" },
          { value: "25K", label: "Music Lovers" },
          { value: "3", label: "Unforgettable Days" },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Community"
    const testHeading = props.testimonials?.heading ?? "What People Say"
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Maya Thompson",
            role: "Festival veteran, 4 years",
            quote:
              "Horizon changed my life. The curation is impeccable — I've discovered at least five artists each year that are now in my daily rotation. The desert setting makes it magical.",
            avatarAlt:
              "Professional headshot of a smiling young woman with curly hair and natural makeup",
          },
          {
            name: "David Chen",
            role: "Photographer, LA",
            quote:
              "As a photographer, I've shot dozens of festivals. Horizon stands out for its attention to detail — the art installations, the lighting design, even the way the stages are positioned for golden hour. Pure visual poetry.",
            avatarAlt:
              "Professional headshot of a bearded man in his 30s with a friendly smile",
          },
          {
            name: "Sarah Williams",
            role: "First-timer, Portland",
            quote:
              "I was nervous about my first camping festival, but the Horizon community made me feel at home immediately. The wellness programs were a lifesaver, and I made friends for life. Already bought my 2025 ticket!",
            avatarAlt:
              "Professional headshot of a blonde woman with a warm smile and casual style",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Questions"
    const faqHeading = props.faq?.heading ?? "FAQ"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What's included with my ticket?",
            answer:
              "All tickets include three-day access to all four stages, complimentary car camping, free water refill stations, and access to the mobile app. GA+ adds fast entry, premium restrooms, and a lounge. VIP includes everything plus stage-side viewing, open bars, and exclusive entrances.",
          },
          {
            question: "Can I bring my own food and drinks?",
            answer:
              "Yes! You can bring food and non-alcoholic beverages into the campground. Each person can bring up to one case of canned beer per day (no glass). The festival grounds have water stations, but outside food and drinks are not permitted inside the venue area — we have 40+ amazing food vendors instead!",
          },
          {
            question: "What are the camping options?",
            answer:
              "Car camping is included with every ticket (one vehicle per 2+ person group). RV camping spots are available as an add-on with power hookups. For a hassle-free experience, our Glamping package includes a pre-set furnished tent with beds, lighting, and power. All campers get access to showers, restrooms, and the late-night silent disco.",
          },
          {
            question: "Is there a payment plan available?",
            answer:
              "Absolutely! You can split your ticket into four equal payments. The first payment is due at checkout, with the remaining three charged monthly. There's a small $10 payment plan fee, but no interest. Payment plans must be completed at least 30 days before the festival.",
          },
          {
            question: "What's the refund policy?",
            answer:
              "Tickets are refundable minus a $50 processing fee until June 1, 2025. After that, tickets can be transferred to another person for a $25 fee. If the festival is canceled due to unforeseen circumstances, full refunds will be issued within 30 days. We recommend purchasing ticket insurance at checkout for additional protection.",
          },
          {
            question: "How do I get to the festival?",
            answer:
              "The festival is located in the Mojave Desert, about 2.5 hours from Los Angeles and 3 hours from Las Vegas. We offer shuttle services from both cities and LAX airport. There's also a dedicated rideshare pickup/dropoff zone. If driving, you'll receive detailed directions and parking instructions two weeks before the event.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Your horizon awaits"
    const ctaDesc =
      props.cta?.description ??
      "Join us August 15-17 for three days that will stay with you forever. Early bird pricing ends soon."
    const ctaPrimary = props.cta?.primaryCta ?? "Get Tickets"
    const ctaSecondary = props.cta?.secondaryCta ?? "Join Mailing List"
    const ctaNote =
      props.cta?.note ?? "Questions? Email us at hello@horizonfestival.com"

    const footerAbout =
      props.footer?.about ??
      "Three days of music, art, and community in the Mojave Desert. August 15-17, 2025."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Festival",
            links: ["Lineup", "Schedule", "Experience", "Camping"],
          },
          {
            heading: "Support",
            links: ["FAQ", "Contact", "Accessibility", "Safety"],
          },
        ]
    const footerSocialLabel = props.footer?.socialLabel ?? "Connect"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Twitter", "TikTok", "YouTube"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Festival. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    const ArrowRight = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = () => (
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
        <path d="M5 13l4 4L19 7" />
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

    const featureIcons: ReactNode[] = [
      // lightbulb — immersive art
      <svg key="bulb" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      // flame — curated dining
      <svg key="flame" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>,
      // clock — camping community
      <svg key="clock" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // heart — wellness oasis
      <svg key="heart" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
    ]

    const collageCls = [
      "h-64 object-cover rounded-xl",
      "h-64 object-cover rounded-xl mt-8",
      "h-64 object-cover rounded-xl",
      "h-64 object-cover rounded-xl -mt-8",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="text-xl font-bold tracking-tight lg:text-2xl"
            >
              {brand}
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="hidden items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                Get Tickets
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="p-2 md:hidden"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
        </header>

        <main className="pt-16 lg:pt-20">
          {/* Hero */}
          <section className="relative overflow-hidden py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl">
                    {heroTop}
                    <br />
                    {heroBottom}
                  </h1>
                  <p className="mb-8 max-w-lg text-lg leading-relaxed text-foreground/70">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-full border border-border px-8 py-4 font-medium transition-colors hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex items-center gap-8 border-t border-border pt-10">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-3xl font-bold">{s.value}</p>
                        <p className="text-sm text-foreground/60">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={1200}
                    h={800}
                    className="h-[500px] w-full rounded-xl object-cover lg:h-[600px]"
                  />
                  <div className="absolute inset-x-6 bottom-6 rounded-xl bg-card/95 p-6 text-card-foreground backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-card-foreground/60">
                          {countdownLabel}
                        </p>
                        <p className="text-2xl font-bold">{countdownValue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-card-foreground/60">
                          {priceLabel}
                        </p>
                        <p className="text-2xl font-bold">{priceValue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-foreground/50">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-20">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-xl font-semibold text-foreground/30 transition-colors hover:text-foreground/60"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Lineup */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {lineupEyebrow}
                </p>
                <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
                  {lineupHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-foreground/70">
                  {lineupDesc}
                </p>
              </div>

              {/* Headliners */}
              <div className="mb-16">
                <h3 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-foreground/50">
                  {headlinersLabel}
                </h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {headliners.map((h) => (
                    <button
                      key={h.name}
                      type="button"
                      onClick={() => go(h.name)}
                      className="group relative block overflow-hidden rounded-xl text-left"
                    >
                      <Image
                        alt={h.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <p className="mb-1 text-sm text-background/70">{h.day}</p>
                        <h4 className="mb-1 text-2xl font-bold text-background">
                          {h.name}
                        </h4>
                        <p className="text-sm text-background/70">{h.genre}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Artists */}
              <div className="mb-16">
                <h3 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-foreground/50">
                  {featuredLabel}
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                  {featured.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => go(a.name)}
                      className="rounded-lg border border-border bg-card p-6 text-center text-card-foreground transition-colors hover:border-primary/40"
                    >
                      <p className="font-semibold">{a.name}</p>
                      <p className="mt-1 text-sm text-card-foreground/60">
                        {a.genre}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* More Artists */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => go(lineupMore)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-medium transition-colors hover:bg-accent"
                >
                  {lineupMore}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section className="bg-card py-24 text-card-foreground lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                    {expEyebrow}
                  </p>
                  <h2 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
                    {expHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-card-foreground/70">
                    {expDesc}
                  </p>
                  <div className="space-y-6">
                    {expFeatures.map((f, i) => (
                      <div key={f.title} className="flex gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                          {featureIcons[i % featureIcons.length]}
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold">{f.title}</h4>
                          <p className="text-card-foreground/60">
                            {f.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {expImageAlts.map((alt, i) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={600}
                      h={800}
                      loading="lazy"
                      className={cn("w-full", collageCls[i % collageCls.length])}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {schedEyebrow}
                </p>
                <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
                  {schedHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-foreground/70">
                  {schedDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {schedDays.map((day) => (
                  <div
                    key={day.name}
                    className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
                  >
                    <div className="bg-primary p-6 text-primary-foreground">
                      <p className="mb-1 text-sm opacity-70">{day.label}</p>
                      <h3 className="text-2xl font-bold">{day.name}</h3>
                      <p className="mt-1 text-sm opacity-70">{day.date}</p>
                    </div>
                    <div className="space-y-4 p-6">
                      {day.items.map((item) => (
                        <div
                          key={item.title}
                          className="flex items-start justify-between"
                        >
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-card-foreground/60">
                              {item.detail}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 pb-6">
                      <button
                        type="button"
                        onClick={() => go(day.cta)}
                        className="w-full rounded-lg border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-accent"
                      >
                        {day.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-foreground py-24 text-background lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-background/50">
                  {galleryEyebrow}
                </p>
                <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-background/70">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryAlts.map((alt, i) => (
                  <Image
                    key={alt}
                    alt={alt}
                    w={600}
                    h={i === 1 ? 800 : 400}
                    loading="lazy"
                    className={cn(
                      "h-48 w-full rounded-lg object-cover md:h-64",
                      i === 1 && "md:row-span-2",
                      i === 5 && "md:col-span-2",
                    )}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Tickets */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {ticketsEyebrow}
                </p>
                <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
                  {ticketsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-foreground/70">
                  {ticketsDesc}
                </p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {ticketTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-xl bg-card p-8 text-card-foreground",
                      tier.popular
                        ? "border-2 border-primary"
                        : "border border-border",
                    )}
                  >
                    {tier.badge ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                        {tier.badge}
                      </span>
                    ) : null}
                    <h3 className="mb-2 text-xl font-semibold">{tier.name}</h3>
                    <p className="mb-6 text-sm text-card-foreground/60">
                      {tier.tagline}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-card-foreground/60">
                        {tier.unit}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3 text-sm">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add-ons */}
              <div className="mx-auto mt-12 max-w-3xl">
                <h3 className="mb-6 text-center text-lg font-semibold">
                  {addOnsLabel}
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {addOns.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => go(a.name)}
                      className="rounded-lg border border-border bg-card p-4 text-center text-card-foreground transition-colors hover:border-primary/40"
                    >
                      <p className="font-semibold">{a.name}</p>
                      <p className="text-sm text-card-foreground/60">
                        {a.price}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-16 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="text-4xl font-bold lg:text-5xl">{s.value}</p>
                    <p className="mt-2 text-background/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {testEyebrow}
                </p>
                <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
                  {testHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8 text-card-foreground"
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-card-foreground/60">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="leading-relaxed text-card-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card py-24 text-card-foreground lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {faqEyebrow}
                </p>
                <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-lg bg-background"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-semibold">{item.question}</span>
                      <svg
                        className="size-5 transition-transform group-open:rotate-180"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-foreground/70">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="bg-foreground py-24 text-background lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/70">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center rounded-full border border-background/30 px-8 py-4 font-medium transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div>
                <h3 className="mb-4 text-xl font-bold">{brand}</h3>
                <p className="text-sm leading-relaxed text-foreground/60">
                  {footerAbout}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-semibold">{col.heading}</h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-foreground/60 transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <h4 className="mb-4 font-semibold">{footerSocialLabel}</h4>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="text-xs font-semibold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-foreground/50">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-foreground/50 transition-colors hover:text-foreground"
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
