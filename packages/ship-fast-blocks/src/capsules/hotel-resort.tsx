import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import { Button } from "#/components/ui/button.tsx"
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

const calculateStayNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0

  const start = new Date(`${checkIn}T12:00:00`)
  const end = new Date(`${checkOut}T12:00:00`)
  const diff = end.getTime() - start.getTime()
  if (!Number.isFinite(diff) || diff <= 0) return 0
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
}

/**
 * HotelResortKimiPage — a complete, self-contained luxury HOTEL / RESORT &
 * SPA landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Azure Coast Resort & Spa"
 * design: an editorial, airy, high-end hospitality aesthetic on a warm
 * light canvas (sand/stone neutrals) with charcoal type and a single gold
 * accent. It opens with a full-bleed oceanfront hero (location eyebrow,
 * thin oversized headline, dual CTAs, trust badges), then a 4-up stats band,
 * a 6-up amenities grid with image-zoom cards, a 3-up rooms & suites pricing
 * grid (with a highlighted "Popular" suite), a masonry photo gallery, a
 * split booking section (3 numbered steps + a real availability form), a
 * 3-up guest testimonials grid with star ratings and avatars, an accordion
 * FAQ, a full-bleed image CTA, and a rich 4-column footer with newsletter
 * signup and social links.
 *
 * The block owns ALL layout, spacing, type hierarchy and the warm-neutral
 * surface treatment. Every nav item / CTA / room / FAQ / social / form
 * submit routes through `useNavigate` (never a dead "#"), and the navbar
 * labels match the `nav` array so PageSwitch can swap pages. All content
 * imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const HotelResortKimiPage = defineCapsule({
  name: "HotelResortKimiPage",
  description:
    "Complete luxury HOTEL, RESORT & SPA landing page with an editorial, airy, high-end hospitality aesthetic: warm sand/stone light canvas, refined charcoal typography, thin oversized headlines and a single gold accent. Includes a full-bleed oceanfront photo hero (location eyebrow, dual CTAs, Forbes-rating / private-beach trust badges), a 4-up KPI stats band (suites, Michelin stars, spa sq ft, miles of beach), a 6-up amenities grid with image-zoom cards (spa, dining, pools, fitness, beach, events), a 3-up rooms & suites pricing grid with per-night rates, amenity chips and a highlighted Popular suite, a masonry photo gallery, a split booking section pairing 3 numbered how-it-works steps with a real check-in/check-out availability form, a 3-up guest testimonials grid with 5-star ratings and avatars, an accordion FAQ (cancellation, breakfast, check-in, parking, pets), a full-bleed image CTA with booking + call buttons, and a rich 4-column footer with newsletter signup, contact details and social links. Use as the ROOT/home page for luxury hotels, beach or coastal resorts, spa retreats, boutique inns, villas, vacation rentals, or wellness destinations when an elegant, photo-led, booking-focused page with rooms, amenities and reviews is wanted. Supply content only — brand, nav, hero, stats, amenities, rooms, gallery, booking, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Resort / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Full-bleed oceanfront hero. */
    hero: z
      .object({
        location: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Trust badges shown beneath the hero copy. */
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** 4-up KPI stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Amenities grid with image-zoom cards. */
    amenities: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Rooms & Suites pricing grid. */
    rooms: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              meta: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              tags: z.array(z.string()),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Masonry photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Split booking section: numbered steps + availability form. */
    booking: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        formHeading: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
        guestOptions: z.array(z.string()).optional(),
        roomOptions: z.array(z.string()).optional(),
      })
      .optional(),
    /** Guest testimonials grid. */
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
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Full-bleed image CTA. */
    cta: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        exploreHeading: z.string().optional(),
        exploreLinks: z.array(z.string()).optional(),
        contactHeading: z.string().optional(),
        contactLines: z.array(z.string()).optional(),
        newsletterHeading: z.string().optional(),
        newsletterText: z.string().optional(),
        newsletterCta: z.string().optional(),
        note: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      reservations: table({
        checkIn: string(),
        checkOut: string(),
        guests: string(),
        roomType: string(),
        status: string(),
      }),
      newsletterSubscribers: table({
        email: string(),
        source: string(),
      }),
    },
    queries: {
      reservations: ({ db }) => db.reservations.orderBy("createdAt").all(),
    },
    mutations: {
      addReservation: (
        { db },
        checkIn: string,
        checkOut: string,
        guests: string,
        roomType: string,
      ) => {
        const normalizedCheckIn = checkIn.trim()
        const normalizedCheckOut = checkOut.trim()
        const normalizedGuests = guests.trim()
        const normalizedRoomType = roomType.trim()

        if (
          !normalizedCheckIn ||
          !normalizedCheckOut ||
          !normalizedGuests ||
          !normalizedRoomType
        ) {
          return db.reservations.all()
        }

        db.reservations.insert({
          checkIn: normalizedCheckIn,
          checkOut: normalizedCheckOut,
          guests: normalizedGuests,
          roomType: normalizedRoomType,
          status: "Pending",
        })
        return db.reservations.all()
      },
      cancelReservation: ({ db }, reservationId: string) => {
        const reservation = db.reservations.get(reservationId)
        if (reservation) {
          db.reservations.delete(reservationId)
        }
        return db.reservations.all()
      },
      clearReservations: ({ db }) => {
        for (const reservation of db.reservations.all()) {
          db.reservations.delete(reservation.id)
        }
        return db.reservations.all()
      },
      subscribeNewsletter: ({ db }, email: string, source: string) => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) return db.newsletterSubscribers.all()

        const existing = db.newsletterSubscribers
          .where("email", normalizedEmail)
          .all()[0]

        if (!existing) {
          db.newsletterSubscribers.insert({
            email: normalizedEmail,
            source: source.trim() || "footer",
          })
        }

        return db.newsletterSubscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [reservationOpen, setReservationOpen] = useState(false)
    const storedReservations = lakebed.useQuery("reservations")
    const addReservation = lakebed.useMutation("addReservation")
    const cancelReservation = lakebed.useMutation("cancelReservation")
    const clearReservations = lakebed.useMutation("clearReservations")
    const subscribeNewsletter = lakebed.useMutation("subscribeNewsletter")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? auth.displayName || auth.user?.displayName || auth.email || "Account"
        : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const brand = props.brand ?? "Azure Coast"
    const nav = props.nav?.length
      ? props.nav
      : ["Rooms & Suites", "Amenities", "Gallery", "Dining", "Contact"]

    const heroLocation = props.hero?.location ?? "Malibu, California"
    const heroHeadingTop = props.hero?.headingTop ?? "Where the Pacific"
    const heroHeadingBottom = props.hero?.headingBottom ?? "meets perfection"
    const heroSub =
      props.hero?.subheading ??
      "Escape to Azure Coast Resort & Spa, an award-winning oceanfront sanctuary. Experience private beach access, world-class dining, and restorative wellness in our 47 exclusive suites."
    const heroPrimary = props.hero?.primaryCta ?? "Check Availability"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Suites"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Aerial view of luxury oceanfront resort with infinity pool overlooking turquoise waters at sunset"
    const heroBadges = props.hero?.badges?.length
      ? props.hero.badges
      : ["5-Star Forbes Rating", "Private Beach Access"]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "47", label: "Exclusive Suites" },
          { value: "3", label: "Michelin Stars" },
          { value: "12K", label: "Sq Ft Spa" },
          { value: "1.2", label: "Miles of Beach" },
        ]

    const amenityEyebrow = props.amenities?.eyebrow ?? "Amenities"
    const amenityHeading =
      props.amenities?.heading ?? "Every detail considered"
    const amenityDesc =
      props.amenities?.description ??
      "From sunrise yoga on the beach to private chef dinners, experience amenities designed for the discerning traveler."
    const amenityItems = props.amenities?.items?.length
      ? props.amenities.items
      : [
          {
            title: "Azure Spa & Wellness",
            description:
              "12,000 square feet of tranquility featuring 14 treatment rooms, hydrotherapy pools, and signature ocean-inspired therapies.",
            imageAlt:
              "Luxury spa treatment room with massage tables, warm lighting, and ocean views",
          },
          {
            title: "Coastal Dining",
            description:
              "Three restaurants including Selene, our Michelin-starred tasting menu experience featuring locally-sourced California cuisine.",
            imageAlt:
              "Elegant fine dining restaurant interior with white tablecloths and ambient lighting",
          },
          {
            title: "Oceanfront Pools",
            description:
              "Three temperature-controlled pools including our signature infinity pool with private cabanas and full beverage service.",
            imageAlt:
              "Infinity edge swimming pool overlooking the ocean with lounge chairs",
          },
          {
            title: "Fitness Center",
            description:
              "24-hour state-of-the-art facility with Peloton bikes, free weights, and daily yoga, Pilates, and meditation classes.",
            imageAlt:
              "Modern fitness center with floor-to-ceiling windows overlooking the ocean",
          },
          {
            title: "Private Beach Access",
            description:
              "1.2 miles of pristine coastline with complimentary beach chairs, umbrellas, and evening bonfire experiences by reservation.",
            imageAlt:
              "Beach bonfire setup at dusk with comfortable seating and ocean waves",
          },
          {
            title: "Events & Weddings",
            description:
              "8,500 square feet of event space including our oceanfront terrace, perfect for intimate gatherings up to 200 guests.",
            imageAlt:
              "Elegant event space with ocean views set for a wedding reception",
          },
        ]

    const roomEyebrow = props.rooms?.eyebrow ?? "Accommodations"
    const roomHeading = props.rooms?.heading ?? "Suites & Villas"
    const roomDesc =
      props.rooms?.description ??
      "Each of our 47 accommodations features ocean views, private terraces, and bespoke furnishings. All rates include daily breakfast and resort amenities."
    const roomCta = props.rooms?.cta ?? "View Details"
    const roomItems = props.rooms?.items?.length
      ? props.rooms.items
      : [
          {
            name: "Coastal Suite",
            price: "$685",
            meta: "650 sq ft | Ocean view | King bed",
            description:
              "Elegant retreat with private balcony, soaking tub, and curated minibar featuring local wines and artisanal snacks.",
            imageAlt:
              "Luxury ocean view suite bedroom with king bed, floor-to-ceiling windows, and private balcony",
            tags: ["Ocean View", "Private Balcony"],
          },
          {
            name: "Azure Suite",
            price: "$1,250",
            meta: "1,100 sq ft | Panoramic view | King bed + Sofa bed",
            description:
              "Separate living area, dual bathrooms, and oversized terrace with outdoor seating. Includes evening turndown and welcome champagne.",
            imageAlt:
              "Luxury premium suite living area with panoramic ocean views and modern furnishings",
            tags: ["Panoramic View", "Butler Service", "Outdoor Terrace"],
            featured: true,
            badge: "Popular",
          },
          {
            name: "Coastal Villa",
            price: "$2,400",
            meta: "2,400 sq ft | Private pool | 2 Bedrooms",
            description:
              "Ultimate privacy with heated plunge pool, outdoor shower, full kitchen, and dedicated concierge. Perfect for extended stays.",
            imageAlt:
              "Presidential villa with private pool, expansive deck, and direct ocean views",
            tags: ["Private Pool", "Full Kitchen", "Concierge"],
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Gallery"
    const galleryHeading =
      props.gallery?.heading ?? "A glimpse of paradise"
    const galleryDesc =
      props.gallery?.description ??
      "Experience the beauty of Azure Coast through moments captured by our guests and photographers."
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "Stunning aerial view of resort pool deck and beach with turquoise Pacific Ocean",
          "Elegant resort lounge area with comfortable seating and ocean sunset views",
          "Luxury spa massage room with warm lighting and natural decor elements",
          "Gourmet plated dish with fresh seafood and seasonal vegetables",
          "Golden hour on private beach with gentle waves and empty lounge chairs",
          "Resort exterior architecture with white walls and palm trees at sunset",
          "Couple enjoying sunset cocktails on private balcony overlooking ocean",
        ]

    const bookingEyebrow = props.booking?.eyebrow ?? "Reservations"
    const bookingHeading = props.booking?.heading ?? "Book your escape"
    const bookingDesc =
      props.booking?.description ??
      "Secure your preferred dates in just a few steps. Flexible cancellation up to 48 hours before arrival."
    const bookingSteps = props.booking?.steps?.length
      ? props.booking.steps
      : [
          {
            title: "Choose Your Dates",
            description:
              "Select your check-in and check-out dates. Peak season runs June through August; book early for best availability.",
          },
          {
            title: "Select Your Suite",
            description:
              "Browse our room categories and choose the perfect accommodation for your stay. Filter by view, size, and amenities.",
          },
          {
            title: "Confirm & Enjoy",
            description:
              "Complete your reservation with our secure checkout. Receive instant confirmation and start planning your experience.",
          },
        ]
    const bookingFormHeading = props.booking?.formHeading ?? "Check Availability"
    const bookingSubmit = props.booking?.submit ?? "Check Availability"
    const bookingNote =
      props.booking?.note ??
      "Best rate guarantee • Free cancellation up to 48 hours"
    const guestOptions = props.booking?.guestOptions?.length
      ? props.booking.guestOptions
      : [
          "2 Adults",
          "2 Adults, 1 Child",
          "2 Adults, 2 Children",
          "3 Adults",
          "4 Adults",
        ]
    const roomOptions = props.booking?.roomOptions?.length
      ? props.booking.roomOptions
      : ["All Room Types", "Coastal Suite", "Azure Suite", "Coastal Villa"]

    const testimonialEyebrow =
      props.testimonials?.eyebrow ?? "Guest Experiences"
    const testimonialHeading =
      props.testimonials?.heading ?? "What our guests say"
    const testimonialDesc =
      props.testimonials?.description ??
      "Rated 4.9/5 across 2,400+ reviews on TripAdvisor, Google, and Booking.com"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "We celebrated our anniversary here and it exceeded every expectation. The Azure Suite was magnificent, the staff anticipated our needs before we even asked. Already planning our return.",
            name: "Margaret Chen",
            meta: "San Francisco, CA • March 2026",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "The spa experience alone is worth the trip. I've visited wellness retreats worldwide and Azure's treatments are simply world-class. The heated pool at sunrise is pure magic.",
            name: "Robert Mitchell",
            meta: "London, UK • February 2026",
            avatarAlt:
              "Professional headshot of a smiling middle-aged man with short gray hair",
          },
          {
            quote:
              "We hosted our company retreat here and the service was impeccable. From the private dining setup to the team-building activities, everything was flawlessly executed.",
            name: "Sarah Johnson",
            meta: "Austin, TX • January 2026",
            avatarAlt:
              "Professional headshot of a confident woman with blonde hair and warm smile",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before booking your stay at Azure Coast."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What is your cancellation policy?",
            a: "Reservations may be cancelled free of charge up to 48 hours before arrival for a full refund. Cancellations within 48 hours incur a charge of one night's stay. Special packages and peak season dates may have different terms.",
          },
          {
            q: "Is breakfast included with my stay?",
            a: "Yes, all room rates include complimentary daily breakfast at our Ocean Terrace restaurant, featuring a full buffet and made-to-order options from 7:00 AM to 10:30 AM.",
          },
          {
            q: "Do you accommodate dietary restrictions?",
            a: "Absolutely. All our restaurants offer extensive vegan, vegetarian, gluten-free, and allergen-conscious options. Please inform us of any dietary needs when making your reservation, and our culinary team will ensure you're fully accommodated.",
          },
          {
            q: "What time is check-in and check-out?",
            a: "Check-in begins at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out are available upon request, subject to availability. Additional fees may apply for guaranteed early arrival.",
          },
          {
            q: "Is parking available?",
            a: "Complimentary valet parking is included with all reservations. Self-parking is also available in our covered garage. Electric vehicle charging stations are provided at no additional cost.",
          },
          {
            q: "Are pets allowed?",
            a: "We welcome dogs up to 50 lbs in select Coastal Suites and Coastal Villas. A $150 cleaning fee applies per stay. Our concierge can arrange pet-sitting services, dog walking, and special pet amenities upon request.",
          },
        ]

    const ctaEyebrow = props.cta?.eyebrow ?? "Limited Availability"
    const ctaHeading =
      props.cta?.heading ?? "Begin your Azure Coast experience"
    const ctaDesc =
      props.cta?.description ??
      "Book direct for exclusive perks: complimentary room upgrade, late checkout, and a $100 resort credit. Summer availability is filling quickly."
    const ctaPrimary = props.cta?.primaryCta ?? "Check Availability"
    const ctaSecondary = props.cta?.secondaryCta ?? "Call 1-800-555-1234"
    const ctaImageAlt =
      props.cta?.imageAlt ??
      "Sunset view over ocean from luxury resort balcony with warm golden lighting"

    const footerAbout =
      props.footer?.about ??
      "An award-winning oceanfront resort offering luxury accommodations, world-class dining, and restorative wellness experiences on the California coast."
    const footerExploreHeading = props.footer?.exploreHeading ?? "Explore"
    const footerExploreLinks = props.footer?.exploreLinks?.length
      ? props.footer.exploreLinks
      : ["Rooms & Suites", "Spa & Wellness", "Dining", "Gallery", "Gift Cards"]
    const footerContactHeading = props.footer?.contactHeading ?? "Contact"
    const footerContactLines = props.footer?.contactLines?.length
      ? props.footer.contactLines
      : [
          "34780 Pacific Coast Highway",
          "Malibu, CA 90265",
          "1-800-555-1234",
          "reservations@azurecoast.com",
        ]
    const footerNewsletterHeading =
      props.footer?.newsletterHeading ?? "Newsletter"
    const footerNewsletterText =
      props.footer?.newsletterText ??
      "Receive exclusive offers and resort updates."
    const footerNewsletterCta = props.footer?.newsletterCta ?? "Join"
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Accessibility"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Facebook", "Twitter"]

    const reservationRows = storedReservations ?? []
    const reservationCount = reservationRows.length
    const totalNights = reservationRows.reduce(
      (sum, reservation) =>
        sum + calculateStayNights(reservation.checkIn, reservation.checkOut),
      0,
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-full font-light",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const inputCls =
      "w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground transition-colors focus:border-ring focus:outline-none"

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <LogoMark className="size-10 bg-foreground text-lg text-background" />
                <span className="text-xl font-medium tracking-tight">
                  {brand}
                </span>
              </button>
              <nav className="hidden items-center gap-8 md:flex">
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
              </nav>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go("Call")}
                  className="hidden text-sm text-muted-foreground lg:block"
                >
                  1-800-555-1234
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Book Now
                </button>
                <Sheet open={reservationOpen} onOpenChange={setReservationOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open reservations"
                      className="relative hidden rounded-full border border-border bg-background p-2 text-foreground lg:grid lg:size-10 lg:place-items-center"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8 7h8M8 11h8M8 15h6M4 5h16a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2Z" />
                        <path d="M7 3h10v4H7z" />
                      </svg>
                      {reservationCount > 0 ? (
                        <span className="absolute -right-2 -top-2 grid size-5 min-w-5 place-items-center rounded-full bg-foreground text-[0.7rem] font-bold text-background">
                          {reservationCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle>Your reservations</SheetTitle>
                      <SheetDescription>
                        {reservationCount
                          ? `${reservationCount} booking request${reservationCount === 1 ? "" : "s"} saved.`
                          : "No reservations yet."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {reservationRows.length ? (
                        <div className="space-y-4">
                          {reservationRows.map((reservation) => {
                            const nights = calculateStayNights(
                              reservation.checkIn,
                              reservation.checkOut,
                            )
                            return (
                              <div
                                key={reservation.id}
                                className="rounded-md border border-border p-4"
                              >
                                <div className="mb-3 flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {reservation.roomType}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {reservation.guests}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void cancelReservation(reservation.id)}
                                    className="text-xs font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {reservation.checkIn} → {reservation.checkOut}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"}` : "Dates not set"}
                                </p>
                                <p className="mt-2 text-xs font-medium text-foreground">
                                  {reservation.status}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex min-h-44 items-center justify-center rounded-md border border-dashed border-border bg-muted/50 px-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Start a reservation from the booking form to review it here.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Estimated total nights</span>
                        <span>{totalNights}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          go("Reservations")
                          setReservationOpen(false)
                        }}
                        className="w-full rounded-md"
                      >
                        Review reservations
                      </Button>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-md"
                          onClick={() => void clearReservations()}
                          disabled={!reservationCount}
                        >
                          Clear
                        </Button>
                        <SheetClose asChild>
                          <Button type="button" variant="secondary" className="w-full rounded-md">
                            Continue
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                {isSignedIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => go("Profile")}
                      className="hidden text-sm text-muted-foreground lg:block"
                    >
                      {authLabel}
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="hidden text-sm text-muted-foreground lg:block"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="hidden rounded-md border border-foreground/20 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:block"
                  >
                    {authLabel}
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 md:hidden"
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
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    setReservationOpen(true)
                  }}
                  className="text-left text-base font-medium text-foreground/90 transition-colors hover:text-foreground"
                >
                  Reservations
                </button>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignOut()
                    }}
                    className="text-left text-base font-medium text-foreground/90 transition-colors hover:text-foreground"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignIn()
                    }}
                    className="text-left text-base font-medium text-foreground/90 transition-colors hover:text-foreground"
                    disabled={auth.isLoading}
                  >
                    Sign in
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-screen items-center pt-20">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1280}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/20 to-foreground/50" />
            </div>
            <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 lg:py-48">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm uppercase tracking-widest text-background/80">
                  {heroLocation}
                </p>
                <h1 className="mb-6 text-4xl font-light leading-tight text-background md:text-5xl lg:text-7xl">
                  {heroHeadingTop}
                  <br />
                  {heroHeadingBottom}
                </h1>
                <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-background/90 md:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="rounded-md bg-background px-8 py-4 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="rounded-md border border-background/30 bg-background/10 px-8 py-4 text-center text-sm font-medium text-background backdrop-blur-sm transition-colors hover:bg-background/20"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-16 flex flex-wrap items-center gap-8 text-sm text-background/70">
                  {heroBadges.map((badge, i) => (
                    <div key={badge} className="flex items-center gap-2">
                      {i === 0 ? (
                        <StarIcon className="size-5" />
                      ) : (
                        <svg
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-muted py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-light text-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
                  {amenityEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
                  {amenityHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {amenityDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {amenityItems.map((item) => (
                  <div key={item.title} className="group">
                    <div className="mb-5 aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Rooms & Suites */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
                  {roomEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
                  {roomHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {roomDesc}
                </p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                {roomItems.map((room) => (
                  <div
                    key={room.name}
                    className={cn(
                      "overflow-hidden rounded-lg bg-card text-card-foreground",
                      room.featured && "ring-2 ring-primary",
                    )}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        alt={room.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-xl font-medium">{room.name}</h3>
                          {room.badge ? (
                            <span className="rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                              {room.badge}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-lg font-light text-foreground">
                          {room.price}
                          <span className="text-sm text-muted-foreground">
                            /night
                          </span>
                        </span>
                      </div>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {room.meta}
                      </p>
                      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                        {room.description}
                      </p>
                      <div className="mb-6 flex flex-wrap gap-2">
                        {room.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => go(room.name)}
                        className={cn(
                          "block w-full rounded-md px-6 py-3 text-center text-sm font-medium transition-colors",
                          room.featured
                            ? "bg-foreground text-background hover:bg-foreground/90"
                            : "border border-foreground text-foreground hover:bg-foreground hover:text-background",
                        )}
                      >
                        {roomCta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
                  {galleryEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {galleryImages.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      i === 0 && "lg:col-span-2 lg:row-span-2",
                      (i === 5 || i === 6) && "lg:col-span-2",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 ? 1200 : 800}
                      h={i === 0 ? 1200 : 600}
                      loading="lazy"
                      className={cn(
                        "w-full rounded-lg object-cover",
                        i === 0
                          ? "min-h-[300px] lg:size-full lg:min-h-full"
                          : "h-48 lg:h-56",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Booking — steps + form */}
          <section className="bg-foreground py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-3 text-sm uppercase tracking-widest text-background/60">
                  {bookingEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light lg:text-4xl">
                  {bookingHeading}
                </h2>
                <p className="leading-relaxed text-background/70">
                  {bookingDesc}
                </p>
              </div>
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  {bookingSteps.map((step, i) => (
                    <div key={step.title} className="flex gap-6">
                      <div className="grid size-12 flex-shrink-0 place-items-center rounded-full bg-background/10">
                        <span className="text-xl font-light">{i + 1}</span>
                      </div>
                      <div>
                        <h3 className="mb-2 text-lg font-medium">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-background/60">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-background p-8 text-foreground">
                  <h3 className="mb-6 text-xl font-medium">
                    {bookingFormHeading}
                  </h3>
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const checkIn = String(formData.get("checkin") ?? "")
                      const checkOut = String(formData.get("checkout") ?? "")
                      const guests = String(formData.get("guests") ?? "")
                      const roomType = String(formData.get("roomType") ?? "")
                      void addReservation(
                        checkIn,
                        checkOut,
                        guests,
                        roomType,
                      )
                      setReservationOpen(true)
                      go(bookingSubmit)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="hotel-checkin"
                          className="mb-2 block text-sm font-medium"
                        >
                          Check-in
                        </label>
                        <input
                          id="hotel-checkin"
                          name="checkin"
                          type="date"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="hotel-checkout"
                          className="mb-2 block text-sm font-medium"
                        >
                          Check-out
                        </label>
                        <input
                          id="hotel-checkout"
                          name="checkout"
                          type="date"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="hotel-guests"
                        className="mb-2 block text-sm font-medium"
                      >
                        Guests
                      </label>
                      <select
                        id="hotel-guests"
                        name="guests"
                        className={inputCls}
                        defaultValue={guestOptions[0]}
                      >
                        {guestOptions.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="hotel-roomtype"
                        className="mb-2 block text-sm font-medium"
                      >
                        Room Type
                      </label>
                      <select
                        id="hotel-roomtype"
                        name="roomType"
                        className={inputCls}
                        defaultValue={roomOptions[0]}
                      >
                        {roomOptions.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-md bg-foreground py-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {bookingSubmit}
                    </Button>
                  </form>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    {bookingNote}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
                  {testimonialEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
                  {testimonialHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {testimonialDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-lg bg-card p-8 text-card-foreground"
                  >
                    <div className="mb-4 flex gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
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
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
                  {faqHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-lg bg-muted p-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between">
                      <span className="font-medium">{item.q}</span>
                      <svg
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
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
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden py-24 lg:py-32">
            <div className="absolute inset-0">
              <Image
                alt={ctaImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/50" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
              <p className="mb-4 text-sm uppercase tracking-widest text-background/80">
                {ctaEyebrow}
              </p>
              <h2 className="mb-6 text-3xl font-light text-background md:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-background/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-md bg-background px-10 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-md border border-background/30 bg-background/10 px-10 py-4 text-sm font-medium text-background backdrop-blur-sm transition-colors hover:bg-background/20"
                >
                  {ctaSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground pb-10 pt-20 text-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <LogoMark className="size-10 bg-background text-lg text-foreground" />
                  <span className="text-xl font-medium tracking-tight">
                    {brand}
                  </span>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-background/60">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
                    >
                      <span className="text-xs font-medium">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-6 font-medium">{footerExploreHeading}</h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footerExploreLinks.map((link) => (
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
              <div>
                <h4 className="mb-6 font-medium">{footerContactHeading}</h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footerContactLines.map((line, i) => (
                    <li key={line} className={i === 2 ? "pt-2" : undefined}>
                      {i >= 2 ? (
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
              <div>
                <h4 className="mb-6 font-medium">{footerNewsletterHeading}</h4>
                <p className="mb-4 text-sm text-background/60">
                  {footerNewsletterText}
                </p>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const email = String(formData.get("newsletter-email") ?? "")
                    void subscribeNewsletter(email, "footer-newsletter")
                    go(footerNewsletterCta)
                  }}
                >
                  <input
                    type="email"
                    name="newsletter-email"
                    placeholder="Your email"
                    aria-label="Your email"
                    className="flex-1 rounded-md border border-background/20 bg-background/10 px-4 py-3 text-sm text-background placeholder:text-background/40 focus:border-background/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {footerNewsletterCta}
                  </button>
                </form>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm text-background/40">
                © {new Date().getFullYear()} {brand} Resort & Spa. {footerNote}
              </p>
              <div className="flex gap-6 text-sm text-background/40">
                {footerLegalLinks.map((link) => (
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
