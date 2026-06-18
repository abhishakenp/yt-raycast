import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#/components/ui/command.tsx"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"
import { Button } from "#/components/ui/button.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

/**
 * TravelAgencyKimiPage — a complete, self-contained premium TRAVEL-AGENCY landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Wanderlust Travel" design: a
 * warm, editorial, sand-and-stone aesthetic with a charcoal ink and an earthy
 * tan/warm accent. It pairs a full-bleed photographic hero (eyebrow + huge
 * headline + an inline trip-search widget with destination/duration/travelers
 * selects + trust badges), a "featured in" publication logo strip, a 3-up
 * "why travel with us" feature grid, a magazine-style trending-destinations
 * gallery (one large feature tile + four cards with price overlays), a 4-step
 * "how it works" timeline, a 3-tier travel-package pricing block (Essential /
 * Premium-most-popular / Bespoke), a dark stats band, a 3-up traveler-review
 * testimonial grid, an accordion FAQ, a dark split contact CTA, and a rich
 * multi-column footer with destinations / company / support links and socials.
 *
 * Every nav item, CTA, search submit, gallery card, package button, FAQ row,
 * social and footer link routes through `useNavigate` (never a dead "#"), and
 * the navbar labels match the `nav` array so PageSwitch can swap pages. All
 * content imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with
 * no props at all.
 */
export const TravelAgencyKimiPage = defineCapsule({
  name: "TravelAgencyKimiPage",
  description:
    "Complete premium TRAVEL-AGENCY / tour-operator landing page with a warm editorial sand-and-stone aesthetic, charcoal ink and an earthy tan accent. Includes a full-bleed photographic hero with eyebrow, oversized headline, an inline trip-search widget (destination / duration / travelers selects + search button) and trust badges, a 'featured in' travel-publication logo strip, a 3-up 'why travel with us' feature grid (expert local guides, boutique stays, 24/7 concierge), a magazine-style trending-destinations gallery with one large feature tile plus price-overlay cards, a 4-step 'how it works' timeline, a 3-tier travel-package pricing block (Essential / Premium most-popular / Bespoke), a dark stats band, a 3-up star-rated traveler-review testimonial grid with avatars, an accordion FAQ, a dark split contact CTA with call/email actions, and a rich multi-column footer with destinations/company/support links and social icons. Use as the ROOT/home page for travel agencies, tour operators, vacation planners, luxury journey curators, adventure-trip companies, destination-wedding or honeymoon planners, and booking sites when a warm, aspirational, conversion-focused page with destination showcase, packages and social proof is wanted. Supply content only — brand, nav, hero, logos, features, destinations, steps, packages, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / agency name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content incl. the inline trip-search widget. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        imageAlt: z.string().optional(),
        searchCta: z.string().optional(),
        destinationLabel: z.string().optional(),
        destinations: z.array(z.string()).optional(),
        durationLabel: z.string().optional(),
        durations: z.array(z.string()).optional(),
        travelersLabel: z.string().optional(),
        travelers: z.array(z.string()).optional(),
        badges: z.array(z.string()).optional(),
        phone: z.string().optional(),
        planCta: z.string().optional(),
      })
      .optional(),
    /** "Featured in" publication logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why travel with us" feature grid. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trending-destinations gallery (first item is the large feature tile). */
    destinations: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              imageAlt: z.string(),
              tag: z.string().optional(),
              detail: z.string().optional(),
              price: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "How it works" 4-step timeline. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Travel-package pricing tiers. */
    packages: z
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
              per: z.string().optional(),
              note: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Traveler-review testimonial grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
        moreLink: z.string().optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark split contact CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        callCta: z.string().optional(),
        emailCta: z.string().optional(),
        note: z.string().optional(),
        imageAlt: z.string().optional(),
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
        socials: z.array(z.string()).optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      destinations: table({
        title: string(),
        imageAlt: string(),
        tag: string(),
        detail: string(),
        price: string(),
      }),
      bookings: table({
        destinationId: string(),
        travelers: number(),
        duration: string(),
        date: string(),
      }),
      favorites: table({
        destinationTitle: string(),
      }),
    },
    queries: {
      destinations: ({ db }) => db.destinations.orderBy('createdAt').all(),
      bookingLines: ({ db }) =>
        db.bookings.all().flatMap((item) => {
          const destination = db.destinations.get(item.destinationId)
          return destination ? [{ ...item, destination }] : []
        }),
      favoriteDestinationTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.destinationTitle)),
    },
    mutations: {
      bookDestination: ({ db }, destinationTitle: string, travelers: number, duration: string, date: string) => {
        const destination = db.destinations.where('title', destinationTitle).all()[0]
        if (!destination) return db.bookings.all()

        db.bookings.insert({
          destinationId: destination.id,
          travelers,
          duration,
          date,
        })

        return db.bookings.all()
      },
      updateBooking: ({ db }, bookingId: string, travelers: number) => {
        const nextTravelers = Math.max(1, Math.floor(travelers))

        for (const item of db.bookings.where('id', bookingId).all()) {
          db.bookings.update(item.id, { travelers: nextTravelers })
        }

        return db.bookings.all()
      },
      removeBooking: ({ db }, bookingId: string) => {
        for (const item of db.bookings.where('id', bookingId).all()) {
          db.bookings.delete(item.id)
        }

        return db.bookings.all()
      },
      clearBookings: ({ db }) => {
        for (const item of db.bookings.all()) {
          db.bookings.delete(item.id)
        }

        return []
      },
      toggleFavorite: ({ db }, destinationTitle: string) => {
        const existingFavorite = db.favorites
          .where('destinationTitle', destinationTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ destinationTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [bookingsOpen, setBookingsOpen] = useState(false)
    const brand = props.brand ?? "Wanderlust"
    const nav = props.nav?.length
      ? props.nav
      : ["Destinations", "Packages", "Reviews", "About"]

    const heroEyebrow = props.hero?.eyebrow ?? "Premium Travel Experiences"
    const heroHeading =
      props.hero?.heading ?? "Discover the World's Most Extraordinary Places"
    const heroSub =
      props.hero?.subheading ??
      "Handcrafted journeys to over 50 destinations. Expert local guides, boutique accommodations, and seamless logistics."
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Panoramic view of snow-capped Swiss Alps mountains at golden hour with alpine lake reflection"
    const searchCta = props.hero?.searchCta ?? "Search"
    const destinationLabel = props.hero?.destinationLabel ?? "Destination"
    const heroDestinations = props.hero?.destinations?.length
      ? props.hero.destinations
      : [
          "Where do you want to go?",
          "Japan — Cherry Blossom Tours",
          "Greece — Santorini & Mykonos",
          "Iceland — Northern Lights",
          "Morocco — Imperial Cities",
          "Peru — Machu Picchu",
          "New Zealand — South Island",
          "Norway — Fjords & Aurora",
          "Indonesia — Bali Retreat",
        ]
    const durationLabel = props.hero?.durationLabel ?? "Duration"
    const heroDurations = props.hero?.durations?.length
      ? props.hero.durations
      : ["Any", "5-7 days", "8-12 days", "13+ days"]
    const travelersLabel = props.hero?.travelersLabel ?? "Travelers"
    const heroTravelers = props.hero?.travelers?.length
      ? props.hero.travelers
      : ["2 Adults", "1 Adult", "Family (2+2)", "Small Group (4-8)"]
    const heroBadges = props.hero?.badges?.length
      ? props.hero.badges
      : ["Free cancellation up to 30 days", "Price match guarantee"]
    const heroPhone = props.hero?.phone ?? "1-800-123-4567"
    const planCta = props.hero?.planCta ?? "Plan Your Trip"

    const logosHeading =
      props.logos?.heading ??
      "Featured in & trusted by leading travel publications"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Travel+Leisure",
          "Condé Nast",
          "AFAR",
          "National Geographic",
          "Lonely Planet",
        ]

    const featuresEyebrow = props.features?.eyebrow ?? "Why Travel With Us"
    const featuresHeading =
      props.features?.heading ?? "Curated experiences, exceptional service"
    const featuresDesc =
      props.features?.description ??
      "We handle every detail so you can focus on what matters — immersing yourself in extraordinary destinations and creating lasting memories."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Expert Local Guides",
            description:
              "Our network of 200+ certified guides brings deep cultural knowledge and insider access to every destination.",
          },
          {
            title: "Boutique Accommodations",
            description:
              "Handpicked hotels, riads, and lodges that reflect local character — from cliffside villas to traditional ryokans.",
          },
          {
            title: "24/7 Concierge Support",
            description:
              "Real human support before, during, and after your trip. We're here whenever you need us, anywhere in the world.",
          },
        ]

    const destEyebrow = props.destinations?.eyebrow ?? "Popular Destinations"
    const destHeading = props.destinations?.heading ?? "Trending journeys"
    const destViewAll = props.destinations?.viewAll ?? "View all destinations"
    const destItems = props.destinations?.items?.length
      ? props.destinations.items
      : [
          {
            title: "Japan — Cherry Blossoms & Ancient Temples",
            imageAlt:
              "Ancient temple pathway lined with traditional stone lanterns in Kyoto, Japan",
            tag: "12-day journey",
            detail: "Tokyo • Kyoto • Osaka • Hakone",
            price: "From $4,850 per person",
          },
          {
            title: "Greek Islands",
            imageAlt:
              "White-washed buildings with blue domes cascading down cliffs to the Aegean Sea in Santorini, Greece",
            price: "From $3,200",
          },
          {
            title: "Iceland — Aurora Hunt",
            imageAlt:
              "Northern lights aurora borealis dancing over snow-covered mountains in Iceland",
            price: "From $3,950",
          },
          {
            title: "Morocco — Imperial Cities",
            imageAlt:
              "Colorful traditional Moroccan market souks with hanging lanterns in Marrakech medina",
            price: "From $2,850",
          },
          {
            title: "Peru — Machu Picchu",
            imageAlt:
              "Inca citadel Machu Picchu perched on misty Andes mountain peaks at sunrise",
            price: "From $3,450",
          },
        ]
    const normalizedDestItems = destItems.map((dest) => ({
      title: dest.title,
      imageAlt: dest.imageAlt,
      tag: dest.tag ?? '',
      detail: dest.detail ?? '',
      price: dest.price,
    }))
    const storedDestinations = lakebed.useQuery('destinations')
    const bookingLines = lakebed.useQuery('bookingLines')
    const favoriteDestinationTitles = lakebed.useQuery('favoriteDestinationTitles')
    const auth = lakebed.useAuth()
    const bookDestination = lakebed.useMutation('bookDestination')
    const updateBooking = lakebed.useMutation('updateBooking')
    const removeBooking = lakebed.useMutation('removeBooking')
    const clearBookings = lakebed.useMutation('clearBookings')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const displayDestinations =
      storedDestinations && storedDestinations.length > 0
        ? storedDestinations
        : normalizedDestItems
    const safeBookingLines = bookingLines ?? []
    const bookingCount = safeBookingLines.length
    const totalTravelers = safeBookingLines.reduce(
      (total, item) => total + item.travelers,
      0,
    )

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Planning your journey is simple"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Browse & Select",
            description:
              "Explore our curated collection of journeys. Filter by region, duration, or travel style.",
          },
          {
            title: "Customize",
            description:
              "Work with your travel designer to personalize accommodations, activities, and pacing.",
          },
          {
            title: "Confirm & Pay",
            description:
              "Secure your spot with flexible payment options. Full transparency, no hidden fees.",
          },
          {
            title: "Travel with Confidence",
            description:
              "Receive your detailed itinerary, pack your bags, and enjoy your perfectly planned journey.",
          },
        ]

    const pkgEyebrow = props.packages?.eyebrow ?? "Travel Packages"
    const pkgHeading = props.packages?.heading ?? "Journeys for every style"
    const pkgDesc =
      props.packages?.description ??
      "All packages include accommodations, guided experiences, transfers, and 24/7 support."
    const pkgTiers = props.packages?.tiers?.length
      ? props.packages.tiers
      : [
          {
            name: "Essential",
            tagline:
              "Perfect for independent travelers who want local expertise.",
            price: "$2,500",
            per: "/person",
            note: "Starting price for 7-day journeys",
            features: [
              "Boutique 3-4 star accommodations",
              "Expert local guides for key experiences",
              "Daily breakfast included",
              "Airport transfers",
              "24/7 emergency support",
            ],
            cta: "View Essential Trips",
          },
          {
            name: "Premium",
            tagline:
              "Our signature experience with elevated touches throughout.",
            price: "$4,200",
            per: "/person",
            note: "Starting price for 7-day journeys",
            features: [
              "Luxury 4-5 star & boutique properties",
              "Private guides throughout your journey",
              "Most meals included (breakfast + 5 dinners)",
              "Private transfers & domestic flights",
              "Exclusive after-hours access & special experiences",
              "Dedicated travel concierge",
            ],
            cta: "Explore Premium",
            popular: true,
            badge: "Most Popular",
          },
          {
            name: "Bespoke",
            tagline: "Fully custom journeys designed from scratch.",
            price: "Custom",
            note: "Pricing based on your unique itinerary",
            features: [
              "Ultra-luxury accommodations",
              "Complete itinerary customization",
              "Private jet & yacht charters available",
              "Private security & guides",
              "Travel designer travels with you (optional)",
            ],
            cta: "Start Planning",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "15,000+", label: "Happy travelers" },
          { value: "52", label: "Destinations" },
          { value: "4.9", label: "Average rating" },
          { value: "12", label: "Years of expertise" },
        ]

    const tEyebrow = props.testimonials?.eyebrow ?? "Traveler Stories"
    const tHeading = props.testimonials?.heading ?? "What our guests say"
    const tMore =
      props.testimonials?.moreLink ?? "Read more reviews on Trustpilot"
    const tItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Our Japan trip was absolutely flawless. The cherry blossom timing was perfect, our guide in Kyoto was a local historian, and every hotel felt special. Already booking our next adventure!",
            name: "Sarah Mitchell",
            meta: "Traveled to Japan • April 2025",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair, outdoor setting",
          },
          {
            quote:
              "Iceland exceeded every expectation. Seeing the Northern Lights dance across the sky was life-changing. The boutique hotel in Reykjavik was stunning, and our glacier guide was incredible.",
            name: "David Chen",
            meta: "Traveled to Iceland • February 2025",
            avatarAlt:
              "Professional headshot of a smiling man with short dark hair wearing a casual button-up shirt",
          },
          {
            quote:
              "Morocco was a dream. The riad in Marrakech was like stepping into a movie. Our guide knew every hidden corner of the medina. The camel trek and desert camp under the stars was magical.",
            name: "Emma Rodriguez",
            meta: "Traveled to Morocco • March 2025",
            avatarAlt:
              "Professional headshot of a smiling woman with curly blonde hair and natural lighting",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What's included in your travel packages?",
            a: "All our packages include carefully selected accommodations, expert local guides, daily breakfast, airport transfers, and 24/7 emergency support. Premium and Bespoke packages include additional meals, private guides, and exclusive experiences. International flights are quoted separately so you can use miles or book through your preferred airline.",
          },
          {
            q: "Can I customize my itinerary?",
            a: "Absolutely. Every journey can be tailored to your preferences. Work with your dedicated travel designer to adjust pacing, swap activities, upgrade accommodations, or add special celebrations. For fully custom trips, our Bespoke service creates entirely unique itineraries from scratch.",
          },
          {
            q: "What's your cancellation policy?",
            a: "We offer free cancellation up to 30 days before departure for a full refund. Cancellations 15-29 days prior receive a 50% refund. Within 14 days, we work with you to reschedule or provide credit for future travel. We also recommend purchasing comprehensive travel insurance for additional protection.",
          },
          {
            q: "Do you offer solo traveler packages?",
            a: "Yes! We design solo-friendly journeys with single accommodations at no or low supplement. Many of our small group departures are perfect for solo travelers looking to connect with like-minded explorers. Your travel designer can recommend the best options based on your preferences.",
          },
          {
            q: "How far in advance should I book?",
            a: "For peak seasons (cherry blossom in Japan, Northern Lights in Iceland, summer in Europe), we recommend booking 6-9 months ahead. For other destinations, 3-4 months is typically sufficient. Last-minute bookings are sometimes possible — contact us to check availability.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to explore?"
    const ctaDesc =
      props.cta?.description ??
      "Start planning your journey today. Connect with a travel designer for a complimentary consultation and custom itinerary proposal."
    const ctaCall = props.cta?.callCta ?? `Call ${heroPhone}`
    const ctaEmail = props.cta?.emailCta ?? "Email Us"
    const ctaNote =
      props.cta?.note ?? "Or request a callback — we'll reach out within 24 hours"
    const ctaImageAlt =
      props.cta?.imageAlt ??
      "Overhead view of travel planning materials with world map, compass, camera, and vintage suitcase"

    const footerTagline =
      props.footer?.tagline ??
      "Curated journeys for discerning travelers. Authentic experiences, exceptional service, unforgettable memories since 2013."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Destinations",
            links: ["Japan", "Greece", "Iceland", "Morocco", "Peru", "New Zealand"],
          },
          {
            title: "Company",
            links: ["About Us", "Our Team", "Careers", "Press", "Travel Blog"],
          },
          {
            title: "Support",
            links: [
              "Contact Us",
              "FAQs",
              "Booking Terms",
              "Travel Insurance",
              "Sustainability",
            ],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Facebook", "Twitter", "Pinterest"]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Travel. All rights reserved.`

    // Brand mark — a decorative inline compass/globe SVG (allowed exception).
    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
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

    const ArrowRight = ({ className }: { className?: string }) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // book / guide
      <svg
        key="guide"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.806-.894L15 7m0 13V7" />
      </svg>,
      // sparkle / boutique
      <svg
        key="boutique"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
      // clock / support
      <svg
        key="support"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      ),
      Facebook: (
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      ),
      Twitter: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      ),
      Pinterest: (
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      ),
    }

    const selectCls =
      "w-full cursor-pointer bg-transparent font-medium text-foreground outline-none"

    return (
      <div
        className={cn(
          "min-h-svh overflow-x-hidden bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              aria-label={`${brand} Travel Home`}
              className="flex items-center gap-2"
            >
              <BrandMark className="size-8 text-primary" />
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
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
              >
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                        {authDisplayName}
                      </span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in to this session'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go('My Bookings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Bookings
                        <ArrowRight className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Profile')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Profile
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  aria-label="Sign in with Google"
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={bookingsOpen} onOpenChange={setBookingsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="My Bookings"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.806-.894L15 7m0 13V7" />
                    </svg>
                    {bookingCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {bookingCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">My Bookings</SheetTitle>
                    <SheetDescription>
                      {bookingCount > 0
                        ? `${bookingCount} destination${bookingCount === 1 ? '' : 's'} in your travel plan.`
                        : 'Your travel plan is empty.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeBookingLines.length ? (
                      <div className="space-y-5">
                        {safeBookingLines.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={item.destination.imageAlt}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.destination.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {item.destination.price}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateBooking(
                                        item.id,
                                        item.travelers - 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Decrease travelers for ${item.destination.title}`}
                                  >
                                    -
                                  </button>
                                  <span className="min-w-8 text-center text-sm font-semibold">
                                    {item.travelers}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateBooking(
                                        item.id,
                                        item.travelers + 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Increase travelers for ${item.destination.title}`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeBooking(item.id)
                                  }
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No destinations in your plan
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add a destination from Trending Destinations to start
                          planning your trip.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Total Travelers</span>
                        <span>{totalTravelers}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Destinations</span>
                        <span>{bookingCount}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={!safeBookingLines.length}
                      className="w-full rounded-full"
                      onClick={() => go('Checkout')}
                    >
                      Proceed to Checkout
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearBookings()}
                        disabled={!safeBookingLines.length}
                      >
                        Clear
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="rounded-full"
                        >
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search destinations"
          description="Search the destinations seeded for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} destinations...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No destinations found.</CommandEmpty>
            <CommandGroup heading="Destinations">
              {displayDestinations.map((dest) => (
                <CommandItem
                  key={dest.title}
                  value={`${dest.title} ${dest.price}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(dest.title)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={dest.imageAlt}
                      w={120}
                      h={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {dest.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {dest.detail || dest.tag}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {dest.price}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main className="pt-20">
          {/* Hero */}
          <section className="relative flex min-h-[90vh] items-center">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-background/80">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 text-5xl font-semibold leading-tight text-background md:text-6xl lg:text-7xl">
                  {heroHeading}
                </h1>
                <p className="mb-10 max-w-lg text-lg leading-relaxed text-background/90 md:text-xl">
                  {heroSub}
                </p>

                {/* Search widget */}
                <div className="rounded-2xl bg-card p-2 text-card-foreground shadow-2xl">
                  <form
                    className="flex flex-col gap-2 md:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(nav[0])
                    }}
                  >
                    <div className="flex-1 px-4 py-3">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {destinationLabel}
                      </label>
                      <select className={selectCls} aria-label={destinationLabel}>
                        {heroDestinations.map((d) => (
                          <option key={d} className="bg-card">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="hidden w-px bg-border md:block" />
                    <div className="px-4 py-3 md:w-40">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {durationLabel}
                      </label>
                      <select className={selectCls} aria-label={durationLabel}>
                        {heroDurations.map((d) => (
                          <option key={d} className="bg-card">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="hidden w-px bg-border md:block" />
                    <div className="px-4 py-3 md:w-44">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {travelersLabel}
                      </label>
                      <select className={selectCls} aria-label={travelersLabel}>
                        {heroTravelers.map((t) => (
                          <option key={t} className="bg-card">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      {searchCta}
                    </button>
                  </form>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-background/80">
                  {heroBadges.map((b) => (
                    <div key={b} className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logo strip */}
          <section className="border-b border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="mb-8 text-center text-sm uppercase tracking-wide text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-12 text-muted-foreground md:gap-16">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-lg font-semibold opacity-60 transition-opacity hover:opacity-100"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {featuresEyebrow}
                </p>
                <h2 className="mb-6 text-4xl font-semibold md:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>

              <div className="grid gap-12 md:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trending destinations gallery */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between md:flex-row md:items-end">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                    {destEyebrow}
                  </p>
                  <h2 className="text-4xl font-semibold md:text-5xl">
                    {destHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(destViewAll)}
                  className="mt-4 inline-flex items-center gap-2 font-medium transition-colors hover:text-primary md:mt-0"
                >
                  {destViewAll}
                  <ArrowRight className="size-5" />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {displayDestinations.map((d, i) => {
                  const feature = i === 0
                  const isFavorite =
                    favoriteDestinationTitles?.has(d.title) ?? false
                  return (
                    <button
                      key={d.title}
                      type="button"
                      onClick={() => go(d.title)}
                      className={cn(
                        "group block w-full cursor-pointer text-left",
                        feature && "lg:col-span-2 lg:row-span-2",
                      )}
                    >
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-2xl",
                          feature
                            ? "h-full min-h-[400px] lg:min-h-[500px]"
                            : "h-64",
                        )}
                      >
                        <Image
                          alt={d.imageAlt}
                          w={feature ? 800 : 600}
                          h={feature ? 800 : 400}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-t to-transparent",
                            feature ? "from-foreground/80 via-transparent" : "from-foreground/70",
                          )}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void toggleFavorite(d.title)
                          }}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${d.title} from favorites`
                              : `Add ${d.title} to favorites`
                          }
                          className={cn(
                            "absolute top-4 right-4 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100",
                            isFavorite
                              ? "bg-primary text-primary-foreground opacity-100"
                              : "bg-background/90 text-foreground opacity-0 hover:bg-background",
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                        <div
                          className={cn(
                            "absolute inset-x-0 bottom-0",
                            feature ? "p-6" : "p-5",
                          )}
                        >
                          {d.tag ? (
                            <span className="mb-3 inline-block rounded-full bg-background/20 px-3 py-1 text-xs font-medium text-background backdrop-blur-sm">
                              {d.tag}
                            </span>
                          ) : null}
                          <h3
                            className={cn(
                              "font-semibold text-background",
                              feature ? "mb-2 text-2xl" : "mb-1 text-lg",
                            )}
                          >
                            {d.title}
                          </h3>
                          {d.detail ? (
                            <p className="text-background/80">{d.detail}</p>
                          ) : null}
                          <p
                            className={cn(
                              "text-background",
                              feature ? "mt-3 font-semibold" : "text-sm text-background/80",
                            )}
                          >
                            {d.price}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {stepsEyebrow}
                </p>
                <h2 className="text-4xl font-semibold md:text-5xl">
                  {stepsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-4">
                {stepItems.map((step, i) => {
                  const last = i === stepItems.length - 1
                  return (
                    <div key={step.title} className="relative">
                      <div
                        className={cn(
                          "mb-6 flex size-12 items-center justify-center rounded-full text-xl font-semibold",
                          last
                            ? "bg-primary text-primary-foreground"
                            : "bg-foreground text-background",
                        )}
                      >
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                      {!last ? (
                        <div className="absolute left-12 right-0 top-6 hidden h-px bg-border md:block" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Packages / pricing */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {pkgEyebrow}
                </p>
                <h2 className="mb-6 text-4xl font-semibold md:text-5xl">
                  {pkgHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pkgDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {pkgTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.popular
                        ? "bg-foreground text-background shadow-xl"
                        : "bg-card text-card-foreground shadow-sm",
                    )}
                  >
                    {tier.popular && tier.badge ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                        {tier.badge}
                      </span>
                    ) : null}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold uppercase tracking-wide",
                        tier.popular ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6",
                        tier.popular ? "text-background/80" : "text-muted-foreground",
                      )}
                    >
                      {tier.tagline}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-semibold">{tier.price}</span>
                      {tier.per ? (
                        <span
                          className={cn(
                            tier.popular
                              ? "text-background/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.per}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "mb-8 text-sm",
                        tier.popular ? "text-background/70" : "text-muted-foreground",
                      )}
                    >
                      {tier.note}
                    </p>

                    <ul className="mb-8 space-y-4">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 flex-shrink-0 text-primary" />
                          <span
                            className={cn(
                              tier.popular
                                ? "text-background/80"
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
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-xl px-6 py-3 font-medium transition-colors",
                        tier.popular
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-20 text-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-semibold text-background md:text-5xl">
                      {s.value}
                    </div>
                    <p className="text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {tEyebrow}
                </p>
                <h2 className="text-4xl font-semibold md:text-5xl">{tHeading}</h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {tItems.map((t) => (
                  <article key={t.name} className="rounded-2xl bg-muted p-8">
                    <div className="mb-6 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5 text-chart-4" />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
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
                  </article>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(tMore)}
                  className="inline-flex items-center gap-2 font-medium transition-colors hover:text-primary"
                >
                  {tMore}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                  {faqEyebrow}
                </p>
                <h2 className="text-4xl font-semibold md:text-5xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-4 font-semibold">{item.q}</h3>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-card py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="overflow-hidden rounded-3xl bg-foreground text-background">
                <div className="grid lg:grid-cols-2">
                  <div className="flex flex-col justify-center p-12 lg:p-16">
                    <h2 className="mb-6 text-4xl font-semibold text-background md:text-5xl">
                      {ctaHeading}
                    </h2>
                    <p className="mb-8 text-lg leading-relaxed text-background/80">
                      {ctaDesc}
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => go(ctaCall)}
                        className="rounded-xl bg-background px-8 py-4 text-center font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {ctaCall}
                      </button>
                      <button
                        type="button"
                        onClick={() => go(ctaEmail)}
                        className="rounded-xl border-2 border-background/30 px-8 py-4 text-center font-medium text-background transition-colors hover:bg-background/10"
                      >
                        {ctaEmail}
                      </button>
                    </div>
                    <p className="mt-6 text-sm text-background/60">{ctaNote}</p>
                  </div>
                  <div className="relative h-64 lg:h-auto">
                    <Image
                      alt={ctaImageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground pb-10 pt-20 text-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="mb-6 flex items-center gap-2">
                  <BrandMark className="size-8 text-primary" />
                  <span className="text-xl font-semibold">{brand}</span>
                </div>
                <p className="mb-6 max-w-sm leading-relaxed text-background/70">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-primary"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        {socialIcons[social] ?? socialIcons.Instagram}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-6 font-semibold">{col.title}</h4>
                  <ul className="space-y-3">
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
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm text-background/70">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/70 transition-colors hover:text-background"
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
